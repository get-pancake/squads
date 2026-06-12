// Replay-eval runner for Agent Squad bundles.
//
// A *trace* records one workflow execution at the squad↔board contract level:
// the inputs the cofounder routed, the tool calls the squad agent made, and
// the terminal result it posted. The runner replays the trace against the
// squad's *manifest* and checks every promise the bundle made (workflow id,
// inputs, tools, secrets, terminal shape) still holds. No LLM is invoked —
// this is the deterministic tier between schema validation and live e2e.
//
// What this tier catches:
//   - cofounder hallucinating a workflow id that isn't in the catalog
//   - a workflow stamp that no longer matches `<squad>.<workflow_id>`
//   - tool calls that aren't in the workflow's declared `tools`
//   - vault reads that aren't in the workflow's declared `secrets`
//   - terminal mismatches (complete_task without a result, fail_task without
//     a reason, squad agent missing a digest)
//   - dispatch-time inputs that drift from the manifest's declared inputs
//
// What it does NOT catch (use higher tiers):
//   - LLM behavioural regressions (Tier 3 sandbox e2e + judge)
//   - external-service contract drift (Tier 3 cassettes)
//   - in-tree plugin behaviour changes (Tier 2.5: run the real tasks plugin)
//
// The trace format is JSON, schemaversion 1. See lib/trace-schema.md for the
// canonical shape and squads/<name>/evals/replay/*.trace.json for examples.

import { readFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';

const TRACE_VERSION = 1;

const TERMINAL_KINDS = new Set(['complete_task', 'fail_task']);

const KNOWN_TOOLS = new Set([
  // tasks plugin
  'create_task', 'claim_task', 'claim_next_task', 'update_task',
  'update_task_status', 'complete_task', 'fail_task', 'list_tasks',
  'get_task', 'list_events', 'add_task_comment', 'create_human_task',
  'renotify_human_task', 'answer_question', 'publish_task_dashboard',
  // squad-store
  'squad_list', 'squad_get', 'squad_install', 'squad_uninstall',
  'squad_installed_list', 'workflow_register', 'workflow_remove',
  // vault
  'vault_get', 'vault_set', 'vault_list', 'vault_request',
  'vault_request_access', 'vault_grant_access', 'vault_deny_access',
  'vault_revoke_access', 'vault_delete',
  // permission-name tools from manifest.schema.json
  'github', 'web_fetch', 'web_search', 'exa', 'browser', 'agentmail',
  'notion', 'google_workspace', 'google-workspace', 'mcp-installer',
  'preview-host', 'publish_preview', 'image-generation', 'image_generate',
  'image', 'cron',
]);

class Check {
  constructor() {
    this.passed = [];
    this.failed = [];
    this.warnings = [];
  }
  pass(name) { this.passed.push(name); }
  fail(name, detail) { this.failed.push({ name, detail }); }
  warn(name, detail) { this.warnings.push({ name, detail }); }
  ok() { return this.failed.length === 0; }
}

export async function loadTrace(path) {
  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch (e) {
    throw new Error(`cannot read trace at ${path}: ${e.message}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`invalid JSON in trace ${path}: ${e.message}`);
  }
  if (parsed?.version !== TRACE_VERSION) {
    throw new Error(`trace ${path} has version ${parsed?.version}, runner expects ${TRACE_VERSION}`);
  }
  return parsed;
}

export async function loadManifest(squadDir) {
  const path = join(squadDir, 'manifest.json');
  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch (e) {
    throw new Error(`cannot read manifest at ${path}: ${e.message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`invalid JSON in manifest ${path}: ${e.message}`);
  }
}

function findWorkflow(manifest, workflowId) {
  return (manifest.workflows ?? []).find((w) => w.id === workflowId) ?? null;
}

function declaredInputs(workflow) {
  const inputs = workflow.inputs ?? {};
  return new Set(Object.keys(inputs));
}

function inputsAreOptional(workflow) {
  // Manifest spec: inputs map name → rich descriptor object. Descriptors may
  // carry `required`, but enforcing it at dispatch is the gateway preflight's
  // job — the replay runner accepts any subset of declared keys.
  return new Set(Object.keys(workflow.inputs ?? {}));
}

export function runCheck({ trace, manifest, squadName }) {
  const c = new Check();

  // 1. Trace declares which squad + workflow it exercises.
  if (typeof trace.squad !== 'string' || trace.squad !== squadName) {
    c.fail('trace.squad', `expected "${squadName}", got "${trace.squad}"`);
    return c;
  } else {
    c.pass('trace.squad matches bundle name');
  }
  if (typeof trace.workflow !== 'string' || !trace.workflow) {
    c.fail('trace.workflow', 'missing or empty');
    return c;
  }
  const workflow = findWorkflow(manifest, trace.workflow);
  if (!workflow) {
    c.fail('trace.workflow exists in manifest',
      `workflow "${trace.workflow}" not declared in manifest.workflows (declared: ${
        (manifest.workflows ?? []).map((w) => w.id).join(', ') || '(none)'
      })`);
    return c;
  }
  c.pass(`trace.workflow "${trace.workflow}" exists in manifest`);

  // 2. The qualified stamp the cofounder used to route MUST be `<squad>.<workflow>`.
  const expectedQualified = `${trace.squad}.${trace.workflow}`;
  const actualStamp = trace?.dispatch?.workflow ?? null;
  if (actualStamp === null) {
    c.warn('dispatch.workflow stamp', 'no dispatch.workflow recorded (unrouted)');
  } else if (actualStamp !== expectedQualified) {
    c.fail('dispatch.workflow stamp',
      `expected "${expectedQualified}", got "${actualStamp}" — this is the cofounder-hallucinated-id failure mode`);
  } else {
    c.pass(`dispatch.workflow is the canonical "${expectedQualified}"`);
  }

  // 3. Inputs at dispatch must be a subset of the workflow's declared inputs.
  const declared = declaredInputs(workflow);
  const seen = Object.keys(trace?.inputs ?? {});
  const undeclared = seen.filter((k) => !declared.has(k));
  if (undeclared.length > 0) {
    c.fail('inputs ⊂ workflow.inputs',
      `inputs not declared by workflow: ${undeclared.join(', ')}`);
  } else if (seen.length === 0 && declared.size > 0) {
    c.warn('inputs', `trace passed no inputs; workflow declares: ${[...declared].join(', ')}`);
  } else {
    c.pass(`inputs (${seen.join(', ') || '(none)'}) are all declared by the workflow`);
  }

  // 4. The assignee MUST be the workflow's owning agent.
  const assignedTo = trace?.dispatch?.assigned_to ?? null;
  if (assignedTo === null) {
    c.warn('dispatch.assigned_to', 'no assignee recorded');
  } else if (assignedTo !== workflow.agent) {
    c.fail('dispatch.assigned_to',
      `routed to "${assignedTo}", workflow declares agent "${workflow.agent}"`);
  } else {
    c.pass(`assigned_to "${assignedTo}" matches workflow.agent`);
  }

  // 5. Tool surface — every recorded tool call must be either a board tool
  // (always available) or a permission the workflow / squad declared.
  const workflowTools = new Set(workflow.tools ?? []);
  const squadTools = new Set(manifest.required_tool_permissions ?? []);
  const allowedTools = new Set([...workflowTools, ...squadTools]);
  const events = Array.isArray(trace.events) ? trace.events : [];
  const toolCalls = events.filter((e) => e?.kind === 'tool' && typeof e.name === 'string');
  const offending = [];
  for (const ev of toolCalls) {
    if (KNOWN_TOOLS.has(ev.name)) continue; // board / squad-store / vault — always allowed
    if (allowedTools.has(ev.name)) continue;
    // Permission-style names map by family; e.g. `gh issue label` is the "github" perm.
    const fam = ev.name.split(/[._-]/, 1)[0];
    if (allowedTools.has(fam)) continue;
    offending.push(ev.name);
  }
  if (offending.length > 0) {
    c.fail('tool calls ⊂ workflow.tools ∪ required_tool_permissions',
      `tools used but not granted: ${[...new Set(offending)].join(', ')}`);
  } else {
    c.pass(`${toolCalls.length} tool call(s) all within the granted surface`);
  }

  // 6. Vault reads must reference a declared secret.
  const declaredSecrets = new Set([
    ...(workflow.secrets ?? []),
    ...((manifest.required_vault_secrets ?? []).map((s) => s.key)),
  ]);
  const vaultReads = events
    .filter((e) => e?.kind === 'tool' && (e.name === 'vault_get' || e.name === 'vault_request'))
    .map((e) => e?.args?.key)
    .filter((k) => typeof k === 'string');
  const undeclaredSecrets = vaultReads.filter((k) => !declaredSecrets.has(k));
  if (undeclaredSecrets.length > 0) {
    c.fail('vault keys ⊂ required_vault_secrets',
      `vault keys read but not declared: ${[...new Set(undeclaredSecrets)].join(', ')}`);
  } else if (vaultReads.length > 0) {
    c.pass(`${vaultReads.length} vault read(s) all reference declared secrets`);
  }

  // 7. Terminal state — exactly one of complete_task / fail_task must close
  // the trace, on a tool event, matching trace.terminal.
  const terminalEvents = events.filter(
    (e) => e?.kind === 'tool' && TERMINAL_KINDS.has(e.name),
  );
  if (terminalEvents.length === 0) {
    c.fail('terminal call', 'trace contains no complete_task / fail_task');
  } else if (terminalEvents.length > 1) {
    c.fail('exactly one terminal call',
      `${terminalEvents.length} terminal calls; one workflow run produces exactly one terminal`);
  } else {
    const terminal = terminalEvents[0];
    if (terminal !== events[events.length - 1]) {
      c.fail('terminal call is last',
        `${terminal.name} is not the final event — work after a terminal is a contract violation`);
    } else if (trace.terminal && trace.terminal !== terminal.name) {
      c.fail('trace.terminal matches terminal event',
        `trace.terminal="${trace.terminal}" but final tool was "${terminal.name}"`);
    } else {
      c.pass(`closes with ${terminal.name} as the final event`);
      const result = terminal?.args?.result ?? null;
      const failureReason = terminal?.args?.failure_reason ?? null;
      if (terminal.name === 'complete_task') {
        if (typeof result !== 'string' || !result.trim()) {
          c.fail('complete_task.result', 'result is missing or empty');
        } else {
          c.pass('complete_task.result is a non-empty string');
        }
      } else {
        if (typeof failureReason !== 'string' || !failureReason.trim()) {
          c.fail('fail_task.failure_reason', 'failure_reason is missing or empty');
        } else {
          c.pass('fail_task.failure_reason is a non-empty string');
        }
      }
      // Squad agents MUST persist a digest on every terminal (HEARTBEAT
      // contract + the digest plumbing we just shipped). Cofounder-typed
      // callers (caller_id === "main") are exempt.
      const callerId = terminal?.args?.caller_id ?? null;
      const digest = terminal?.args?.digest ?? null;
      if (callerId && callerId !== 'main' && callerId !== assignedTo) {
        c.warn('terminal caller_id matches assignee',
          `caller_id="${callerId}" but task was assigned to "${assignedTo}"`);
      }
      if (callerId && callerId !== 'main') {
        if (typeof digest !== 'string' || !digest.trim()) {
          c.fail('squad agent terminal carries digest',
            `caller "${callerId}" is a squad agent but did not pass a digest — HEARTBEAT.md mandates one`);
        } else {
          c.pass('squad agent terminal carries a non-empty digest');
        }
      }
    }
  }

  // 8. Asserted invariants from the trace.
  const assertions = trace.assertions ?? {};
  if (Array.isArray(assertions.tools_must_include)) {
    const observed = new Set(toolCalls.map((e) => e.name));
    const missing = assertions.tools_must_include.filter((t) => !observed.has(t));
    if (missing.length > 0) {
      c.fail('assertions.tools_must_include',
        `expected tool calls not observed: ${missing.join(', ')}`);
    } else {
      c.pass(`tools_must_include (${assertions.tools_must_include.join(', ')}) all present`);
    }
  }
  if (Array.isArray(assertions.tools_must_exclude)) {
    const observed = new Set(toolCalls.map((e) => e.name));
    const present = assertions.tools_must_exclude.filter((t) => observed.has(t));
    if (present.length > 0) {
      c.fail('assertions.tools_must_exclude',
        `forbidden tools present: ${present.join(', ')}`);
    } else {
      c.pass(`tools_must_exclude (${assertions.tools_must_exclude.join(', ')}) all absent`);
    }
  }

  return c;
}

// Some traces are *negative cases* — recorded examples of a bug we want to
// keep catching forever. They declare `expected: "FAIL"` plus the exact
// `expected_failures` (check names) they should trip. The runner inverts:
//
//   - exactly those checks failed → trace passes
//   - none failed, or the wrong checks failed → trace errors (regression)
//
// This lets us commit a hallucinated-workflow-id trace, a missing-digest
// trace, etc. as living regression markers. If a future change makes one of
// them suddenly *pass* the contract check, the suite goes red — exactly the
// signal we want.
function applyExpectation(trace, check) {
  if (trace.expected !== 'FAIL') return check;
  const expected = new Set(trace.expected_failures ?? []);
  const actual = new Set(check.failed.map((f) => f.name));
  const inverted = new Check();
  inverted.passed = check.passed.slice();
  inverted.warnings = check.warnings.slice();
  for (const name of expected) {
    if (actual.has(name)) {
      inverted.passed.push(`expected failure occurred: ${name}`);
    } else {
      inverted.failed.push({
        name: 'expected_failures',
        detail: `expected "${name}" to fail; it passed — the contract check it guards has regressed`,
      });
    }
  }
  for (const f of check.failed) {
    if (expected.has(f.name)) continue;
    inverted.failed.push({
      name: 'unexpected failure',
      detail: `${f.name}: ${f.detail}`,
    });
  }
  return inverted;
}

export function formatReport(trace, manifest, check, relPath) {
  const tag = trace.expected === 'FAIL' ? ' (negative)' : '';
  const head = `${relPath} — ${trace.squad}.${trace.workflow} [${trace.case ?? 'unnamed'}]${tag}`;
  const lines = [head, '─'.repeat(Math.max(20, head.length))];
  for (const p of check.passed) lines.push(`  ✔  ${p}`);
  for (const w of check.warnings) lines.push(`  ⚠  ${w.name}: ${w.detail}`);
  for (const f of check.failed) lines.push(`  ✖  ${f.name}: ${f.detail}`);
  lines.push('');
  return lines.join('\n');
}

export async function runOne(tracePath) {
  const trace = await loadTrace(tracePath);
  // squads/<name>/evals/replay/<workflow-id>/<case>.trace.json
  // climb up four directories to reach the squad bundle root.
  const squadDir = join(dirname(tracePath), '..', '..', '..');
  const manifest = await loadManifest(squadDir);
  const raw = runCheck({
    trace,
    manifest,
    squadName: manifest.name,
  });
  const check = applyExpectation(trace, raw);
  const rel = relative(process.cwd(), tracePath) || tracePath;
  return { check, report: formatReport(trace, manifest, check, rel) };
}
