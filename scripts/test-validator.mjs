#!/usr/bin/env node
// Self-tests for scripts/validate.mjs.
//
// Each case builds a small bundle in a temp dir and runs the validator on it
// as a subprocess. The validator is treated as a black box — we assert on its
// exit code and the substring of its stdout/stderr.
//
// Positive cases prove a well-formed bundle is accepted. Negative cases prove
// the validator catches a specific class of breakage. If anyone weakens a
// check (e.g. loosens a regex or drops a forbidden filename), the matching
// case here turns red on CI.
//
// Zero deps; run with `node scripts/test-validator.mjs`. Exit 0 = all green.

import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VALIDATOR = join(REPO_ROOT, "scripts/validate.mjs");

// ── helpers ─────────────────────────────────────────────────────────────────

async function writeBundle(dir, files) {
  for (const [rel, content] of Object.entries(files)) {
    if (content === null) continue;
    const full = join(dir, rel);
    await mkdir(dirname(full), { recursive: true });
    const data = typeof content === "string" ? content : JSON.stringify(content, null, 2);
    await writeFile(full, data);
  }
}

function runValidator(bundleDir) {
  const r = spawnSync("node", [VALIDATOR, bundleDir], { encoding: "utf8" });
  return { exitCode: r.status ?? -1, output: (r.stdout || "") + (r.stderr || "") };
}

/** A minimum well-formed bundle. Each test mutates a fresh copy. */
function baseBundle() {
  return {
    "manifest.json": {
      name: "test-squad",
      version: "1.0.0",
      description: "test bundle",
      author: "tester",
      agents: ["test-agent"],
    },
    "SQUAD.md": "---\ntags: [test]\n---\n\nbody\n",
    "ONBOARD.md": "---\nrequired_tools: []\nrequired_identities: []\nestimated_setup_minutes: 1\n---\n\nonboard\n",
    "agents/test-agent/agent.json": {
      id: "test-agent",
      description: "test agent",
    },
    "agents/test-agent/IDENTITY.md": "identity\n",
    "agents/test-agent/SOUL.md": "soul\n",
  };
}

// ── cases ──────────────────────────────────────────────────────────────────
// expect: null  → must exit 0 (valid bundle)
// expect: RegExp → must exit non-zero AND match the regex in validator output

const cases = [
  // Positive baselines
  {
    name: "valid minimum bundle (no heartbeat)",
    mutate: () => {},
    expect: null,
  },
  {
    name: "valid bundle with heartbeat object + HEARTBEAT.md",
    mutate: (b) => {
      b["agents/test-agent/agent.json"].heartbeat = { every: "30m" };
      b["agents/test-agent/HEARTBEAT.md"] = "wake procedure\n";
    },
    expect: null,
  },
  {
    name: "valid bundle with TOOLS.md (allowed)",
    mutate: (b) => {
      b["TOOLS.md"] = "tools doc\n";
    },
    expect: null,
  },
  {
    name: "valid bundle with every curated heartbeat sub-field",
    mutate: (b) => {
      b["agents/test-agent/agent.json"].heartbeat = {
        every: "2h",
        model: "haiku",
        lightContext: true,
        isolatedSession: true,
        skipWhenBusy: true,
        timeoutSeconds: 45,
      };
      b["agents/test-agent/HEARTBEAT.md"] = "wake procedure\n";
    },
    expect: null,
  },

  // Workflow-scoped secrets/tools — the registries live at the squad level
  // (required_vault_secrets / required_tool_permissions); each workflow
  // references the keys it actually uses.
  {
    name: "workflow secrets/tools referencing the registries is accepted, no warnings",
    mutate: (b) => {
      b["manifest.json"].required_vault_secrets = [
        { key: "team.api_key", label: "API key", type: "api_key" },
      ];
      b["manifest.json"].required_tool_permissions = ["browser"];
      b["manifest.json"].workflows = [
        {
          id: "test.do_thing",
          summary: "does the thing",
          outcome: "thing done",
          agent: "test-agent",
          secrets: ["team.api_key"],
          tools: ["browser"],
        },
      ];
    },
    expect: null,
    expectNoWarn: true,
  },
  {
    name: "rich workflow input descriptors are accepted",
    mutate: (b) => {
      b["manifest.json"].workflows = [
        {
          id: "test.do_thing",
          summary: "does the thing",
          outcome: "thing done",
          agent: "test-agent",
          inputs: {
            target: { type: "string", description: "what to act on", example: "acme/api" },
            mode: { type: "enum", description: "how to act", enum: ["fast", "slow"], required: false, default: "fast" },
          },
        },
      ];
    },
    expect: null,
    expectNoWarn: true,
  },
  {
    name: "legacy string-shorthand workflow inputs are rejected",
    mutate: (b) => {
      b["manifest.json"].workflows = [
        {
          id: "test.do_thing",
          summary: "does the thing",
          outcome: "thing done",
          agent: "test-agent",
          inputs: { target: "string (what to act on)" },
        },
      ];
    },
    expect: /workflows\[0\]\.inputs\.target.*must be an object/,
  },
  {
    name: "input descriptor missing type/description, bad enum, bad name, unknown field are rejected",
    mutate: (b) => {
      b["manifest.json"].workflows = [
        {
          id: "test.do_thing",
          summary: "does the thing",
          outcome: "thing done",
          agent: "test-agent",
          inputs: {
            no_type: { description: "missing type" },
            no_desc: { type: "string" },
            bad_enum: { type: "enum", description: "no enum array" },
            extra_field: { type: "string", description: "ok", bogus: 1 },
            "BAD-NAME": { type: "string", description: "bad name" },
            enum_on_string: { type: "string", description: "ok", enum: ["a"] },
          },
        },
      ];
    },
    expect: /inputs\.no_type\.type.*required/,
  },
  {
    name: "workflow outcome_schema is an accepted field",
    mutate: (b) => {
      b["manifest.json"].workflows = [
        {
          id: "test.do_thing",
          summary: "does the thing",
          outcome: "thing done",
          agent: "test-agent",
          outcome_schema: { type: "object", required: ["status"], properties: { status: { type: "string" } } },
        },
      ];
    },
    expect: null,
    expectNoWarn: true,
  },
  {
    name: "workflow secret not defined in required_vault_secrets is rejected",
    mutate: (b) => {
      b["manifest.json"].workflows = [
        {
          id: "test.do_thing",
          summary: "does the thing",
          outcome: "thing done",
          agent: "test-agent",
          secrets: ["team.undeclared_key"],
        },
      ];
    },
    expect: /workflows\[0\]\.secrets\[0\].*not defined in required_vault_secrets/,
  },
  {
    name: "workflow tool not declared in required_tool_permissions is rejected",
    mutate: (b) => {
      b["manifest.json"].required_tool_permissions = ["browser"];
      b["manifest.json"].workflows = [
        {
          id: "test.do_thing",
          summary: "does the thing",
          outcome: "thing done",
          agent: "test-agent",
          tools: ["github"],
        },
      ];
    },
    expect: /workflows\[0\]\.tools\[0\].*not declared in required_tool_permissions/,
  },
  {
    name: "duplicate workflow secret key is rejected",
    mutate: (b) => {
      b["manifest.json"].required_vault_secrets = [
        { key: "team.api_key", label: "API key", type: "api_key" },
      ];
      b["manifest.json"].workflows = [
        {
          id: "test.do_thing",
          summary: "does the thing",
          outcome: "thing done",
          agent: "test-agent",
          secrets: ["team.api_key", "team.api_key"],
        },
      ];
    },
    expect: /workflows\[0\]\.secrets\[1\].*duplicate secret key/,
  },
  {
    name: "registry secret unreferenced by any workflow warns (but stays valid)",
    mutate: (b) => {
      b["manifest.json"].required_vault_secrets = [
        { key: "team.api_key", label: "API key", type: "api_key" },
      ];
      b["manifest.json"].workflows = [
        {
          id: "test.do_thing",
          summary: "does the thing",
          outcome: "thing done",
          agent: "test-agent",
        },
      ];
    },
    expect: null,
    expectWarn: /"team\.api_key" is not referenced by any workflow/,
  },
  {
    name: "no-workflow squad with registry secrets does not warn",
    mutate: (b) => {
      b["manifest.json"].required_vault_secrets = [
        { key: "team.api_key", label: "API key", type: "api_key" },
      ];
    },
    expect: null,
    expectNoWarn: true,
  },

  // infra_tool_permissions — onboarding/heartbeat-time tools, exempt from the
  // unreferenced-tool warning but still required to live in the registry.
  {
    name: "infra tool unreferenced by any workflow does not warn",
    mutate: (b) => {
      b["manifest.json"].required_tool_permissions = ["browser", "mcp-installer"];
      b["manifest.json"].infra_tool_permissions = ["mcp-installer"];
      b["manifest.json"].workflows = [
        {
          id: "test.do_thing",
          summary: "does the thing",
          outcome: "thing done",
          agent: "test-agent",
          tools: ["browser"],
        },
      ];
    },
    expect: null,
    expectNoWarn: true,
  },
  {
    name: "non-infra registry tool unreferenced by any workflow still warns",
    mutate: (b) => {
      b["manifest.json"].required_tool_permissions = ["browser", "web_fetch", "mcp-installer"];
      b["manifest.json"].infra_tool_permissions = ["mcp-installer"];
      b["manifest.json"].workflows = [
        {
          id: "test.do_thing",
          summary: "does the thing",
          outcome: "thing done",
          agent: "test-agent",
          tools: ["browser"],
        },
      ];
    },
    expect: null,
    expectWarn: /"web_fetch" is not referenced by any workflow/,
  },
  {
    name: "infra tool not declared in required_tool_permissions is rejected",
    mutate: (b) => {
      b["manifest.json"].required_tool_permissions = ["browser"];
      b["manifest.json"].infra_tool_permissions = ["mcp-installer"];
    },
    expect: /infra_tool_permissions\[0\].*not declared in required_tool_permissions/,
  },
  {
    name: "duplicate infra_tool_permissions key is rejected",
    mutate: (b) => {
      b["manifest.json"].required_tool_permissions = ["browser", "mcp-installer"];
      b["manifest.json"].infra_tool_permissions = ["mcp-installer", "mcp-installer"];
    },
    expect: /infra_tool_permissions\[1\].*duplicate tool key "mcp-installer"/,
  },

  // Negative — heartbeat shape
  {
    name: "heartbeat as bare string is rejected",
    mutate: (b) => {
      b["agents/test-agent/agent.json"].heartbeat = "daily";
      b["agents/test-agent/HEARTBEAT.md"] = "wake\n";
    },
    expect: /must be an object mirroring OpenClaw's agents\.list\[\]\.heartbeat/,
  },
  {
    name: 'heartbeat.every = "daily" is rejected',
    mutate: (b) => {
      b["agents/test-agent/agent.json"].heartbeat = { every: "daily" };
      b["agents/test-agent/HEARTBEAT.md"] = "wake\n";
    },
    expect: /must be an OpenClaw duration string in units ms\/s\/m\/h/,
  },
  {
    name: "unknown heartbeat sub-field is rejected",
    mutate: (b) => {
      b["agents/test-agent/agent.json"].heartbeat = { every: "30m", bogus: true };
      b["agents/test-agent/HEARTBEAT.md"] = "wake\n";
    },
    expect: /heartbeat\.bogus.*unknown field/,
  },
  {
    name: "heartbeat.lightContext as a string is rejected",
    mutate: (b) => {
      b["agents/test-agent/agent.json"].heartbeat = { every: "30m", lightContext: "yes" };
      b["agents/test-agent/HEARTBEAT.md"] = "wake\n";
    },
    expect: /heartbeat\.lightContext.*must be a boolean/,
  },
  {
    name: "heartbeat.model outside haiku|sonnet|opus is rejected",
    mutate: (b) => {
      b["agents/test-agent/agent.json"].heartbeat = { every: "30m", model: "openai/gpt-5.4-mini" };
      b["agents/test-agent/HEARTBEAT.md"] = "wake\n";
    },
    expect: /heartbeat\.model.*must be one of: haiku, sonnet, opus/,
  },
  {
    name: "pod-level heartbeat field (e.g. directPolicy) is rejected",
    mutate: (b) => {
      b["agents/test-agent/agent.json"].heartbeat = { every: "30m", directPolicy: "allow" };
      b["agents/test-agent/HEARTBEAT.md"] = "wake\n";
    },
    expect: /heartbeat\.directPolicy.*unknown field/,
  },
  {
    name: "heartbeat.timeoutSeconds = 0 is rejected (must be positive)",
    mutate: (b) => {
      b["agents/test-agent/agent.json"].heartbeat = { every: "30m", timeoutSeconds: 0 };
      b["agents/test-agent/HEARTBEAT.md"] = "wake\n";
    },
    expect: /heartbeat\.timeoutSeconds.*must be a positive integer/,
  },
  {
    name: "heartbeat declared but HEARTBEAT.md missing is rejected",
    mutate: (b) => {
      b["agents/test-agent/agent.json"].heartbeat = { every: "30m" };
    },
    expect: /agents\/test-agent\/HEARTBEAT\.md.*not found/,
  },

  // Negative — agent.json schema
  {
    name: "agent.model outside haiku|sonnet|opus is rejected",
    mutate: (b) => {
      b["agents/test-agent/agent.json"].model = "claude-3";
    },
    expect: /model.*must be one of: haiku, sonnet, opus/,
  },
  {
    name: "agent.id mismatched with directory is rejected",
    mutate: (b) => {
      b["agents/test-agent/agent.json"].id = "wrong-id";
    },
    expect: /must match the directory name "test-agent"/,
  },
  {
    name: "unknown top-level agent.json field is rejected",
    mutate: (b) => {
      b["agents/test-agent/agent.json"].bogus = true;
    },
    expect: /agent\.json.*bogus.*unknown field/,
  },
  {
    name: "agent id in manifest but no agent.json is rejected",
    mutate: (b) => {
      b["manifest.json"].agents = ["test-agent", "ghost-agent"];
    },
    expect: /agents\/ghost-agent\/agent\.json.*not found/,
  },

  // Negative — manifest schema
  {
    name: "agents[] with object items (old shape) is rejected",
    mutate: (b) => {
      b["manifest.json"].agents = [{ id: "test-agent", description: "x" }];
    },
    expect: /must be a non-empty kebab-case agent id string/,
  },
  {
    name: "token_intensity in manifest.json is rejected (deprecated)",
    mutate: (b) => {
      b["manifest.json"].token_intensity = "medium";
    },
    expect: /token_intensity.*deprecated/,
  },

  // Negative — SQUAD.md frontmatter
  {
    name: "token_intensity in SQUAD.md frontmatter is rejected (deprecated)",
    mutate: (b) => {
      b["SQUAD.md"] = "---\ntags: [test]\ntoken_intensity: medium\n---\n\nbody\n";
    },
    expect: /SQUAD\.md.*deprecated `token_intensity:`/,
  },

  // Negative — forbidden filenames
  {
    name: "bundle-local AGENTS.md is rejected",
    mutate: (b) => { b["AGENTS.md"] = "x\n"; },
    expect: /AGENTS\.md.*forbidden filename/,
  },
  {
    name: "bundle-local USER.md is rejected",
    mutate: (b) => { b["USER.md"] = "x\n"; },
    expect: /USER\.md.*forbidden filename/,
  },
  {
    name: "bundle-local BOOTSTRAP.md is rejected",
    mutate: (b) => { b["BOOTSTRAP.md"] = "x\n"; },
    expect: /BOOTSTRAP\.md.*forbidden filename/,
  },
  {
    name: "bundle-local BOOT.md is rejected",
    mutate: (b) => { b["BOOT.md"] = "x\n"; },
    expect: /BOOT\.md.*forbidden filename/,
  },
  {
    name: "nested forbidden file (agents/<id>/USER.md) is rejected",
    mutate: (b) => { b["agents/test-agent/USER.md"] = "x\n"; },
    expect: /agents\/test-agent\/USER\.md.*forbidden filename/,
  },

  // Negative — TODO markers
  {
    name: "unresolved TODO marker in SQUAD.md body is rejected",
    mutate: (b) => {
      b["SQUAD.md"] = "---\ntags: [test]\n---\n\nTODO: fill this in\n";
    },
    expect: /SQUAD\.md.*unresolved TODO marker/,
  },

  // Negative — required_tool_permissions
  {
    name: "unknown required_tool_permissions key is rejected",
    mutate: (b) => {
      b["manifest.json"].required_tool_permissions = ["browser", "message"];
    },
    expect: /required_tool_permissions\[1\].*"message" is not an accepted tool key/,
  },
  {
    name: "slack-block-kit is rejected (intentionally not authorable from a squad)",
    mutate: (b) => {
      b["manifest.json"].required_tool_permissions = ["browser", "slack-block-kit"];
    },
    expect: /required_tool_permissions\[1\].*"slack-block-kit" is not an accepted tool key/,
  },
  {
    name: "voice / tts are rejected (intentionally not authorable from a squad)",
    mutate: (b) => {
      b["manifest.json"].required_tool_permissions = ["browser", "voice"];
    },
    expect: /required_tool_permissions\[1\].*"voice" is not an accepted tool key/,
  },
  {
    name: "duplicate required_tool_permissions key is rejected",
    mutate: (b) => {
      b["manifest.json"].required_tool_permissions = ["browser", "browser"];
    },
    expect: /required_tool_permissions\[1\].*duplicate tool key "browser"/,
  },
  {
    name: "valid required_tool_permissions list (with web_fetch + exa) passes",
    mutate: (b) => {
      b["manifest.json"].required_tool_permissions = ["browser", "web_search", "web_fetch", "exa", "github"];
    },
    expect: null,
  },

  // Workflow-ref crons — schedule + workflow binding, generated dispatch
  {
    name: "workflow-ref cron bound to a declared workflow is accepted, no warnings",
    mutate: (b) => {
      b["manifest.json"].workflows = [
        { id: "test.do_thing", summary: "does the thing", outcome: "thing done", agent: "test-agent" },
      ];
      b["crons/jobs.json"] = JSON.stringify({
        version: 1,
        jobs: [
          { id: "daily", schedule: { kind: "cron", expr: "0 9 * * *", tz: "UTC" }, workflow: "test.do_thing" },
        ],
      });
    },
    expect: null,
    expectNoWarn: true,
  },
  {
    name: "workflow-ref cron referencing an undeclared workflow is rejected",
    mutate: (b) => {
      b["crons/jobs.json"] = JSON.stringify({
        version: 1,
        jobs: [
          { id: "daily", schedule: { kind: "cron", expr: "0 9 * * *", tz: "UTC" }, workflow: "ghost.flow" },
        ],
      });
    },
    expect: /cron job "daily" references workflow "ghost\.flow"/,
  },
  {
    name: "workflow-ref cron also declaring sessionTarget/payload is rejected",
    mutate: (b) => {
      b["manifest.json"].workflows = [
        { id: "test.do_thing", summary: "does the thing", outcome: "thing done", agent: "test-agent" },
      ];
      b["crons/jobs.json"] = JSON.stringify({
        version: 1,
        jobs: [
          {
            id: "daily",
            schedule: { kind: "cron", expr: "0 9 * * *", tz: "UTC" },
            workflow: "test.do_thing",
            sessionTarget: "test-agent",
            payload: { kind: "systemEvent", text: "hand-written" },
          },
        ],
      });
    },
    expect: /declares both `workflow` and `sessionTarget`/,
  },
  {
    name: "workflow-ref cron passing an undeclared input is rejected",
    mutate: (b) => {
      b["manifest.json"].workflows = [
        {
          id: "test.do_thing",
          summary: "does the thing",
          outcome: "thing done",
          agent: "test-agent",
          inputs: { target: { type: "string", description: "what to act on" } },
        },
      ];
      b["crons/jobs.json"] = JSON.stringify({
        version: 1,
        jobs: [
          {
            id: "daily",
            schedule: { kind: "cron", expr: "0 9 * * *", tz: "UTC" },
            workflow: "test.do_thing",
            inputs: { bogus: 1 },
          },
        ],
      });
    },
    expect: /passes input "bogus" that workflow "test\.do_thing" does not declare/,
  },
  {
    name: "bare cron dispatching a workflow with a required input is rejected",
    mutate: (b) => {
      b["manifest.json"].workflows = [
        {
          id: "test.do_thing",
          summary: "does the thing",
          outcome: "thing done",
          agent: "test-agent",
          inputs: { target: { type: "string", description: "what to act on" } },
        },
      ];
      b["crons/jobs.json"] = JSON.stringify({
        version: 1,
        jobs: [
          { id: "daily", schedule: { kind: "cron", expr: "0 9 * * *", tz: "UTC" }, workflow: "test.do_thing" },
        ],
      });
    },
    expect: /dispatches "test\.do_thing" without required input "target"/,
  },
  {
    name: "bare cron is fine when the workflow input is optional or supplied",
    mutate: (b) => {
      b["manifest.json"].workflows = [
        {
          id: "test.do_thing",
          summary: "does the thing",
          outcome: "thing done",
          agent: "test-agent",
          inputs: {
            target: { type: "string", description: "what to act on", required: false },
            mode: { type: "string", description: "how" },
          },
        },
      ];
      b["crons/jobs.json"] = JSON.stringify({
        version: 1,
        jobs: [
          {
            id: "daily",
            schedule: { kind: "cron", expr: "0 9 * * *", tz: "UTC" },
            workflow: "test.do_thing",
            inputs: { mode: "fast" },
          },
        ],
      });
    },
    expect: null,
    expectNoWarn: true,
  },
  {
    name: "legacy sessionTarget+payload cron still validates but warns to migrate",
    mutate: (b) => {
      b["crons/jobs.json"] = JSON.stringify({
        version: 1,
        jobs: [
          {
            id: "old-style",
            sessionTarget: "test-agent",
            schedule: { kind: "cron", expr: "0 9 * * *", tz: "UTC" },
            payload: { kind: "systemEvent", text: "hi" },
          },
        ],
      });
    },
    expect: null,
    expectWarn: /"old-style" uses the legacy sessionTarget\+payload shape/,
  },

  // Negative — cron targeting
  {
    name: "cron sessionTarget naming a non-declared agent is rejected",
    mutate: (b) => {
      b["crons/jobs.json"] = JSON.stringify({
        version: 1,
        jobs: [
          {
            id: "x",
            sessionTarget: "other-agent",
            schedule: { kind: "cron", expr: "0 9 * * *", tz: "UTC" },
            payload: { kind: "systemEvent", text: "hi" },
          },
        ],
      });
    },
    expect: /crons\/jobs\.json.*sessionTarget "other-agent" is not a declared agent id/,
  },
];

// ── runner ──────────────────────────────────────────────────────────────────

async function main() {
  let pass = 0;
  let fail = 0;
  const failures = [];

  console.log(`Running ${cases.length} validator self-tests…\n`);

  for (const c of cases) {
    const dir = await mkdtemp(join(tmpdir(), "squad-test-"));
    try {
      const files = baseBundle();
      c.mutate(files);
      await writeBundle(dir, files);

      const { exitCode, output } = runValidator(dir);
      let ok;
      let reason;
      if (c.expect === null) {
        ok = exitCode === 0;
        reason = ok
          ? ""
          : `expected exit 0 (valid bundle), got exit ${exitCode}`;
        if (ok && c.expectWarn && !c.expectWarn.test(output)) {
          ok = false;
          reason = `expected a warning matching ${c.expectWarn}`;
        }
        if (ok && c.expectNoWarn && /⚠/.test(output)) {
          ok = false;
          reason = `expected zero warnings, but the validator emitted one`;
        }
      } else {
        if (exitCode === 0) {
          ok = false;
          reason = `expected validator to reject bundle, but it exited 0`;
        } else if (!c.expect.test(output)) {
          ok = false;
          reason = `expected output to match ${c.expect}`;
        } else {
          ok = true;
        }
      }

      if (ok) {
        console.log(`  ✓ ${c.name}`);
        pass++;
      } else {
        console.log(`  ✗ ${c.name}`);
        console.log(`      ${reason}`);
        failures.push({ name: c.name, reason, output });
        fail++;
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }

  console.log("");
  if (fail > 0) {
    console.log(`${fail} of ${cases.length} test(s) failed.\n`);
    for (const f of failures) {
      console.log(`── ${f.name} ──`);
      console.log(`reason: ${f.reason}`);
      console.log(`validator output:\n${f.output}`);
    }
    process.exit(1);
  }
  console.log(`${pass} of ${cases.length} test(s) passed.`);
  process.exit(0);
}

main().catch((e) => {
  console.error("test runner crashed:", e);
  process.exit(2);
});
