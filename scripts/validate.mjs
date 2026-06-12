#!/usr/bin/env node
// Zero-dependency validator for Agent Squad bundles.
//
// It mirrors exactly what the Pancake marketplace checks when it ingests a
// bundle — so a bundle that passes here passes ingestion. The production
// sources it mirrors are:
//   - apps/marketplace/src/services/manifest.ts            (validateManifest)
//   - apps/marketplace/src/services/ingest.ts              (verifyBundleFiles)
//   - apps/pancake-claw/plugins/squad-store/src/deploy.ts  (assertSquadTargets)
//
// Usage:
//   node scripts/validate.mjs              validate every squads/* and template/
//   node scripts/validate.mjs <bundle-dir> validate one bundle directory
//
// Exits non-zero if any bundle has an error. Warnings never fail the run.

import { lstat, readdir, readFile, realpath } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ── manifest.json validation ────────────────────────────────────────────────
// Behaviour-identical port of apps/marketplace/src/services/manifest.ts.

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const MODELS = ["haiku", "sonnet", "opus"];
const CONTEXT_INJECTIONS = ["always", "continuation-skip", "never"];
const SECRET_TYPES = ["string", "api_key", "token"];
const MAX_DESCRIPTION = 200;

// Accepted tool keys for manifest.required_tool_permissions. Each tool is
// reachable via one or more keys (aliases) — both kebab- and snake-case
// variants are listed where Pancake itself accepts both. Anything not on
// this list is rejected: the marketplace will not grant a permission for
// a tool Pancake does not ship.
const ACCEPTED_TOOL_PERMISSIONS = {
  "Browser (Anchor)":   ["browser"],
  "Web search / fetch": ["exa", "web_search", "web_fetch"],
  "GitHub":             ["github"],
  "Google Workspace":   ["google-workspace", "google_workspace"],
  "Notion":             ["notion"],
  "Email (AgentMail)":  ["agentmail"],
  "Identity vault":     ["vault"],
  "Preview hosting":    ["preview-host", "publish_preview"],
  "MCP installer":      ["mcp-installer"],
  "Image generation":   ["image-generation", "image_generate", "image"],
  "Scheduling":         ["cron"],
};
const ACCEPTED_TOOL_KEYS = new Set(Object.values(ACCEPTED_TOOL_PERMISSIONS).flat());

// Heartbeat config is the curated subset of OpenClaw's
// agents.list[].heartbeat (see https://docs.openclaw.ai/gateway/config-agents)
// that squad authors are allowed to set. Pod-level fields (prompt, target,
// directPolicy, session, to, ackMaxChars, includeReasoning,
// includeSystemPromptSection, suppressToolErrorWarnings) are intentionally
// excluded — OpenClaw still accepts them at the pod level, but a squad
// bundle should not declare them. `every` is a duration string in OpenClaw's
// ms/s/m/h format (e.g. "30m", "2h", "24h", "0m" to disable) — named values
// like "daily" are invalid.
const HEARTBEAT_EVERY_PATTERN = /^\d+(ms|s|m|h)$/;
const HEARTBEAT_FIELDS = {
  every:           { kind: "duration" },
  model:           { kind: "enum", values: MODELS },
  lightContext:    { kind: "boolean" },
  isolatedSession: { kind: "boolean" },
  skipWhenBusy:    { kind: "boolean" },
  timeoutSeconds:  { kind: "positiveInteger" },
};

const FORBIDDEN_BASENAMES = new Set(["agents.md", "user.md", "bootstrap.md", "boot.md"]);

// workflows[] — outcome-typed entrypoints the squad publishes. `secrets` and
// `tools` scope the squad-level registries to the workflow that actually uses
// them: each entry references a key defined in required_vault_secrets /
// required_tool_permissions (the registries stay squad-level so install-time
// collection has one source of truth).
const WORKFLOW_ID = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
const WORKFLOW_ALLOWED_KEYS = new Set([
  "id",
  "summary",
  "inputs",
  "outcome",
  "outcome_schema",
  "agent",
  "secrets",
  "tools",
]);
// workflows[].inputs — rich descriptors, not string shorthand. Each input is
// { type, description, example?, required?, default?, enum? }: the cofounder
// writes its dispatch brief from these, so they are the workflow's API docs.
const WORKFLOW_INPUT_TYPES = new Set(["string", "integer", "number", "boolean", "enum", "object"]);
const WORKFLOW_INPUT_ALLOWED_KEYS = new Set(["type", "description", "example", "required", "default", "enum"]);
const WORKFLOW_INPUT_NAME = /^[a-z][a-z0-9_]*$/;
const MAX_INPUT_DESCRIPTION = 280;

const isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
const isStringArray = (v) => Array.isArray(v) && v.every((x) => typeof x === "string");

/** Returns every problem found in a parsed manifest (never fail-fast). */
function validateManifest(input) {
  const errors = [];
  const err = (path, message) => errors.push({ path, message });

  if (!isObject(input)) {
    return [{ path: "", message: "manifest must be a JSON object" }];
  }

  // name
  if (typeof input.name !== "string" || input.name.length === 0) {
    err("name", "required, must be a non-empty string");
  } else if (!KEBAB.test(input.name)) {
    err("name", "must be kebab-case (lowercase letters, digits, single hyphens)");
  } else if (input.name.length > 64) {
    err("name", "must be 64 characters or fewer");
  }

  // version
  if (typeof input.version !== "string" || !SEMVER.test(input.version)) {
    err("version", 'required, must be a semver string (e.g. "1.0.0")');
  }

  // description
  if (typeof input.description !== "string" || input.description.length === 0) {
    err("description", "required, must be a non-empty string");
  } else if (input.description.length > MAX_DESCRIPTION) {
    err("description", `must be ${MAX_DESCRIPTION} characters or fewer`);
  }

  // author
  if (typeof input.author !== "string" || input.author.length === 0) {
    err("author", "required, must be a non-empty string");
  }

  // license
  if (input.license !== undefined && typeof input.license !== "string") {
    err("license", "must be a string when present");
  }

  // skills (squad-wide)
  if (input.skills !== undefined && !isStringArray(input.skills)) {
    err("skills", "must be an array of bundle-relative file paths");
  }

  // agents — now a string[] of kebab ids; per-agent config lives in agents/<id>/agent.json
  if (!Array.isArray(input.agents) || input.agents.length === 0) {
    err("agents", "required, must be a non-empty array of kebab-case agent ids");
  } else {
    const seen = new Set();
    input.agents.forEach((id, i) => {
      const at = `agents[${i}]`;
      if (typeof id !== "string" || id.length === 0) {
        err(at, "must be a non-empty kebab-case agent id string");
        return;
      }
      if (!KEBAB.test(id)) {
        err(at, `"${id}" must be kebab-case`);
      } else if (seen.has(id)) {
        err(at, `duplicate agent id "${id}"`);
      } else {
        seen.add(id);
      }
    });
  }

  // workflows (optional) — published outcome-typed entrypoints. Inline metadata
  // so the cofounder's catalog can be generated without reading extra files.
  if (input.workflows !== undefined) {
    if (!Array.isArray(input.workflows)) {
      err("workflows", "must be an array when present");
    } else {
      const declaredAgents = new Set(
        Array.isArray(input.agents) ? input.agents.filter((a) => typeof a === "string") : [],
      );
      const declaredSecretKeys = new Set(
        Array.isArray(input.required_vault_secrets)
          ? input.required_vault_secrets
              .filter((s) => isObject(s) && typeof s.key === "string")
              .map((s) => s.key)
          : [],
      );
      const declaredToolKeys = new Set(
        isStringArray(input.required_tool_permissions) ? input.required_tool_permissions : [],
      );
      const seenW = new Set();
      input.workflows.forEach((w, i) => {
        const at = `workflows[${i}]`;
        if (!isObject(w)) {
          err(at, "must be an object");
          return;
        }
        for (const key of Object.keys(w)) {
          if (!WORKFLOW_ALLOWED_KEYS.has(key)) {
            err(`${at}.${key}`, `unknown field — allowed: ${[...WORKFLOW_ALLOWED_KEYS].join(", ")}`);
          }
        }
        if (typeof w.id !== "string" || w.id.length === 0) {
          err(`${at}.id`, "required, must be a non-empty string");
        } else if (!WORKFLOW_ID.test(w.id)) {
          err(`${at}.id`, `"${w.id}" must be lower-kebab/dotted (e.g. eng.triage_issue)`);
        } else if (seenW.has(w.id)) {
          err(`${at}.id`, `duplicate workflow id "${w.id}"`);
        } else {
          seenW.add(w.id);
        }
        if (typeof w.summary !== "string" || w.summary.length === 0) {
          err(`${at}.summary`, "required, must be a non-empty string");
        } else if (w.summary.length > MAX_DESCRIPTION) {
          err(`${at}.summary`, `must be ${MAX_DESCRIPTION} characters or fewer`);
        }
        if (typeof w.outcome !== "string" || w.outcome.length === 0) {
          err(`${at}.outcome`, "required, must be a non-empty string describing the defined outcome");
        }
        if (w.inputs !== undefined) {
          if (!isObject(w.inputs)) {
            err(`${at}.inputs`, "must be an object mapping input name → input descriptor when present");
          } else {
            for (const [inputName, inputSpec] of Object.entries(w.inputs)) {
              const ipath = `${at}.inputs.${inputName}`;
              if (!WORKFLOW_INPUT_NAME.test(inputName)) {
                err(ipath, `"${inputName}" must be lower_snake_case starting with a letter`);
              }
              if (!isObject(inputSpec)) {
                err(ipath, "must be an object — { type, description, example?, required?, default?, enum? }");
                continue;
              }
              for (const key of Object.keys(inputSpec)) {
                if (!WORKFLOW_INPUT_ALLOWED_KEYS.has(key)) {
                  err(`${ipath}.${key}`, `unknown field — allowed: ${[...WORKFLOW_INPUT_ALLOWED_KEYS].join(", ")}`);
                }
              }
              const type = inputSpec.type;
              if (typeof type !== "string" || !WORKFLOW_INPUT_TYPES.has(type)) {
                err(`${ipath}.type`, `required, must be one of: ${[...WORKFLOW_INPUT_TYPES].join(", ")}`);
              }
              if (typeof inputSpec.description !== "string" || inputSpec.description.length === 0) {
                err(`${ipath}.description`, "required, must be a non-empty one-line description of what this input means");
              } else if (inputSpec.description.length > MAX_INPUT_DESCRIPTION) {
                err(`${ipath}.description`, `must be ${MAX_INPUT_DESCRIPTION} characters or fewer`);
              }
              if (inputSpec.required !== undefined && typeof inputSpec.required !== "boolean") {
                err(`${ipath}.required`, "must be a boolean when present");
              }
              if (type === "enum") {
                if (!Array.isArray(inputSpec.enum) || inputSpec.enum.length === 0) {
                  err(`${ipath}.enum`, 'required when type is "enum"; must be a non-empty array of strings');
                } else if (!inputSpec.enum.every((v) => typeof v === "string")) {
                  err(`${ipath}.enum`, "every enum entry must be a string");
                }
              } else if (inputSpec.enum !== undefined) {
                err(`${ipath}.enum`, 'only allowed when type is "enum"');
              }
            }
          }
        }
        if (typeof w.agent !== "string" || w.agent.length === 0) {
          err(`${at}.agent`, "required, must name the squad agent that runs this workflow");
        } else if (declaredAgents.size && !declaredAgents.has(w.agent)) {
          err(`${at}.agent`, `"${w.agent}" is not a declared agent id (must be one of: ${[...declaredAgents].join(", ")})`);
        }
        if (w.secrets !== undefined) {
          if (!isStringArray(w.secrets)) {
            err(`${at}.secrets`, "must be an array of vault keys (strings) when present");
          } else {
            const seenS = new Set();
            w.secrets.forEach((key, j) => {
              const sat = `${at}.secrets[${j}]`;
              if (!declaredSecretKeys.has(key)) {
                err(sat, `"${key}" is not defined in required_vault_secrets (workflow secrets reference the squad-level registry)`);
              } else if (seenS.has(key)) {
                err(sat, `duplicate secret key "${key}"`);
              } else {
                seenS.add(key);
              }
            });
          }
        }
        if (w.tools !== undefined) {
          if (!isStringArray(w.tools)) {
            err(`${at}.tools`, "must be an array of tool keys (strings) when present");
          } else {
            const seenT = new Set();
            w.tools.forEach((key, j) => {
              const tat = `${at}.tools[${j}]`;
              if (!declaredToolKeys.has(key)) {
                err(tat, `"${key}" is not declared in required_tool_permissions (workflow tools reference the squad-level registry)`);
              } else if (seenT.has(key)) {
                err(tat, `duplicate tool key "${key}"`);
              } else {
                seenT.add(key);
              }
            });
          }
        }
      });
    }
  }

  // required_identities
  if (input.required_identities !== undefined) {
    if (!Array.isArray(input.required_identities)) {
      err("required_identities", "must be an array when present");
    } else {
      input.required_identities.forEach((id, i) => {
        const at = `required_identities[${i}]`;
        if (!isObject(id)) {
          err(at, "must be an object");
          return;
        }
        if (typeof id.site !== "string" || id.site.length === 0) {
          err(`${at}.site`, "required, must be a non-empty string");
        }
        if (typeof id.reason !== "string" || id.reason.length === 0) {
          err(`${at}.reason`, "required, must be a non-empty string");
        }
      });
    }
  }

  // required_vault_secrets
  if (input.required_vault_secrets !== undefined) {
    if (!Array.isArray(input.required_vault_secrets)) {
      err("required_vault_secrets", "must be an array when present");
    } else {
      input.required_vault_secrets.forEach((s, i) => {
        const at = `required_vault_secrets[${i}]`;
        if (!isObject(s)) {
          err(at, "must be an object");
          return;
        }
        if (typeof s.key !== "string" || s.key.length === 0) {
          err(`${at}.key`, "required, must be a non-empty vault dot-path");
        }
        if (typeof s.label !== "string" || s.label.length === 0) {
          err(`${at}.label`, "required, must be a non-empty string");
        }
        if (!SECRET_TYPES.includes(s.type)) {
          err(`${at}.type`, `must be one of: ${SECRET_TYPES.join(", ")}`);
        }
      });
    }
  }

  // required_tool_permissions
  if (input.required_tool_permissions !== undefined) {
    if (!isStringArray(input.required_tool_permissions)) {
      err("required_tool_permissions", "must be an array of strings when present");
    } else {
      const seen = new Set();
      input.required_tool_permissions.forEach((key, i) => {
        const at = `required_tool_permissions[${i}]`;
        if (!ACCEPTED_TOOL_KEYS.has(key)) {
          err(at, `"${key}" is not an accepted tool key — must be one of: ${[...ACCEPTED_TOOL_KEYS].join(", ")}`);
        } else if (seen.has(key)) {
          err(at, `duplicate tool key "${key}"`);
        } else {
          seen.add(key);
        }
      });
    }
  }

  // infra_tool_permissions — squad-infra tools used at onboarding/heartbeat
  // time rather than inside any workflow (e.g. mcp-installer). Entries
  // reference the required_tool_permissions registry; they are exempt from
  // the unreferenced-tool warning.
  if (input.infra_tool_permissions !== undefined) {
    if (!isStringArray(input.infra_tool_permissions)) {
      err("infra_tool_permissions", "must be an array of strings when present");
    } else {
      const registry = new Set(
        isStringArray(input.required_tool_permissions) ? input.required_tool_permissions : [],
      );
      const seen = new Set();
      input.infra_tool_permissions.forEach((key, i) => {
        const at = `infra_tool_permissions[${i}]`;
        if (!registry.has(key)) {
          err(at, `"${key}" is not declared in required_tool_permissions (infra tools reference the squad-level registry)`);
        } else if (seen.has(key)) {
          err(at, `duplicate tool key "${key}"`);
        } else {
          seen.add(key);
        }
      });
    }
  }

  // min_pancake_version
  if (input.min_pancake_version !== undefined && typeof input.min_pancake_version !== "string") {
    err("min_pancake_version", "must be a string when present");
  }

  // deprecated fields
  if ("token_intensity" in input) {
    err("token_intensity", "deprecated — Pancake Cloud now computes token usage automatically; remove this field");
  }

  return errors;
}

/**
 * Non-fatal manifest findings. When a squad publishes workflows, every
 * squad-level secret and tool permission should be referenced by at least one
 * workflow's `secrets`/`tools` — an unreferenced entry usually means the
 * author forgot to scope it (or it is dead weight from a removed workflow).
 */
function manifestWarnings(input) {
  const warnings = [];
  if (!isObject(input) || !Array.isArray(input.workflows) || input.workflows.length === 0) {
    return warnings;
  }
  const workflows = input.workflows.filter(isObject);
  const referenced = (field) =>
    new Set(workflows.flatMap((w) => (isStringArray(w[field]) ? w[field] : [])));

  const usedSecrets = referenced("secrets");
  if (Array.isArray(input.required_vault_secrets)) {
    for (const s of input.required_vault_secrets) {
      if (isObject(s) && typeof s.key === "string" && !usedSecrets.has(s.key)) {
        warnings.push({
          path: "manifest.json",
          message: `required_vault_secrets key "${s.key}" is not referenced by any workflow's \`secrets\` — scope it to the workflow(s) that use it`,
        });
      }
    }
  }

  const usedTools = referenced("tools");
  const infraTools = new Set(
    isStringArray(input.infra_tool_permissions) ? input.infra_tool_permissions : [],
  );
  if (isStringArray(input.required_tool_permissions)) {
    for (const key of input.required_tool_permissions) {
      if (!usedTools.has(key) && !infraTools.has(key)) {
        warnings.push({
          path: "manifest.json",
          message: `required_tool_permissions key "${key}" is not referenced by any workflow's \`tools\` — scope it to the workflow(s) that use it, or list it in infra_tool_permissions if it is an onboarding/heartbeat-time tool`,
        });
      }
    }
  }
  return warnings;
}

// ── heartbeat sub-schema validation ─────────────────────────────────────────
// Mirrors OpenClaw's heartbeat config exactly. Every sub-field is optional;
// unknown sub-fields are rejected.

function validateHeartbeat(input, prefix, err) {
  for (const key of Object.keys(input)) {
    const spec = HEARTBEAT_FIELDS[key];
    if (!spec) {
      err(`${prefix}.${key}`, `unknown field — allowed: ${Object.keys(HEARTBEAT_FIELDS).join(", ")}`);
      continue;
    }
    const v = input[key];
    const at = `${prefix}.${key}`;
    switch (spec.kind) {
      case "duration":
        if (typeof v !== "string" || !HEARTBEAT_EVERY_PATTERN.test(v)) {
          err(at, 'must be an OpenClaw duration string in units ms/s/m/h (e.g. "30m", "2h", "24h", "0m" to disable). Named values like "daily" are not valid.');
        }
        break;
      case "boolean":
        if (typeof v !== "boolean") err(at, "must be a boolean");
        break;
      case "positiveInteger":
        if (!Number.isInteger(v) || v < 1) err(at, "must be a positive integer");
        break;
      case "enum":
        if (!spec.values.includes(v)) err(at, `must be one of: ${spec.values.join(", ")}`);
        break;
    }
  }
}

// ── agent.json validation ───────────────────────────────────────────────────
// Validates agents/<id>/agent.json against the agent.schema.json subset of
// OpenClaw's agents.list[].

const AGENT_ALLOWED_KEYS = new Set([
  "id",
  "description",
  "model",
  "heartbeat",
  "skills",
  "contextInjection",
  "bootstrapMaxChars",
  "params",
]);

function validateAgentJson(input, expectedId, pathPrefix) {
  const errors = [];
  const err = (path, message) => errors.push({ path: `${pathPrefix}  ${path}`, message });

  if (!isObject(input)) {
    return [{ path: pathPrefix, message: "must be a JSON object" }];
  }

  for (const key of Object.keys(input)) {
    if (!AGENT_ALLOWED_KEYS.has(key)) {
      err(key, `unknown field — allowed: ${[...AGENT_ALLOWED_KEYS].join(", ")}`);
    }
  }

  if (typeof input.id !== "string" || input.id.length === 0) {
    err("id", "required, must be a non-empty kebab-case string");
  } else if (!KEBAB.test(input.id)) {
    err("id", "must be kebab-case");
  } else if (input.id !== expectedId) {
    err("id", `"${input.id}" must match the directory name "${expectedId}"`);
  }

  if (typeof input.description !== "string" || input.description.length === 0) {
    err("description", "required, must be a non-empty string");
  }

  if (input.model !== undefined && !MODELS.includes(input.model)) {
    err("model", `must be one of: ${MODELS.join(", ")}`);
  }

  if (input.heartbeat !== undefined) {
    if (!isObject(input.heartbeat)) {
      err("heartbeat", "must be an object mirroring OpenClaw's agents.list[].heartbeat (see docs.openclaw.ai/gateway/config-agents)");
    } else {
      validateHeartbeat(input.heartbeat, "heartbeat", err);
    }
  }

  if (input.skills !== undefined && !isStringArray(input.skills)) {
    err("skills", "must be an array of bundle-relative file paths");
  }

  if (input.contextInjection !== undefined && !CONTEXT_INJECTIONS.includes(input.contextInjection)) {
    err("contextInjection", `must be one of: ${CONTEXT_INJECTIONS.join(", ")}`);
  }

  if (
    input.bootstrapMaxChars !== undefined &&
    (!Number.isInteger(input.bootstrapMaxChars) || input.bootstrapMaxChars < 1)
  ) {
    err("bootstrapMaxChars", "must be a positive integer when present");
  }

  if (input.params !== undefined && !isObject(input.params)) {
    err("params", "must be an object when present");
  }

  return errors;
}

// ── referenced-file verification ────────────────────────────────────────────
// Behaviour-identical port of verifyBundleFiles in ingest.ts: a referenced
// path must exist, be a regular file, not be a symlink, and resolve inside the
// bundle root (no `..` escape, no absolute path).

async function checkReferencedFile(bundleDir, bundleRoot, rel) {
  const candidate = join(bundleDir, rel);
  let st;
  try {
    st = await lstat(candidate);
  } catch {
    return "referenced by the manifest but not found";
  }
  if (st.isSymbolicLink()) return "must not be a symlink";
  let resolved;
  try {
    resolved = await realpath(candidate);
  } catch {
    return "could not be resolved (broken path)";
  }
  const relToRoot = relative(bundleRoot, resolved);
  if (relToRoot === ".." || relToRoot.startsWith(`..${sep}`) || isAbsolute(relToRoot)) {
    return "resolves outside the bundle root";
  }
  if (!st.isFile()) return "must be a regular file (found a directory or special file)";
  return null;
}

// ── cron targeting ──────────────────────────────────────────────────────────
// Behaviour-identical port of assertSquadTargets in deploy.ts: a cron job's
// sessionTarget may only name an agent the squad itself declares.

function collectAgentIds(manifest) {
  const ids = new Set();
  if (isObject(manifest) && Array.isArray(manifest.agents)) {
    for (const id of manifest.agents) {
      if (typeof id === "string" && id.length > 0) ids.add(id);
    }
  }
  return ids;
}

async function checkTargeting(bundleDir, agentIds, manifest) {
  const errors = [];
  const warnings = [];
  const allowed = agentIds.size ? [...agentIds].join(", ") : "(none declared)";
  const relPath = "crons/jobs.json";

  const workflowIds = new Map(); // id -> workflow (for inputs check)
  if (isObject(manifest) && Array.isArray(manifest.workflows)) {
    for (const w of manifest.workflows) {
      if (isObject(w) && typeof w.id === "string") workflowIds.set(w.id, w);
    }
  }

  const raw = await readFileOrNull(join(bundleDir, "crons", "jobs.json"));
  if (raw === null) return { errors, warnings };
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    errors.push({ path: relPath, message: "is not valid JSON" });
    return { errors, warnings };
  }
  const list = isObject(parsed) ? parsed.jobs : undefined;
  if (!Array.isArray(list)) {
    warnings.push({
      path: relPath,
      message: "has no `jobs` array — nothing will be registered from it",
    });
    return { errors, warnings };
  }

  list.forEach((job, i) => {
    const itemId = isObject(job) && typeof job.id === "string" ? job.id : `index ${i}`;
    if (!isObject(job)) {
      errors.push({ path: relPath, message: `cron job at index ${i} must be an object` });
      return;
    }
    const sched = job.schedule;
    if (!isObject(sched) || sched.kind !== "cron" || typeof sched.expr !== "string" || typeof sched.tz !== "string") {
      errors.push({
        path: relPath,
        message: `cron job "${itemId}" needs a schedule { kind: "cron", expr, tz }`,
      });
    }

    if (typeof job.workflow === "string") {
      // Workflow-ref shape: { id, schedule, workflow, inputs?, name?, enabled? }.
      // sessionTarget and payload are GENERATED at deploy from the workflow —
      // declaring them here is drift waiting to happen.
      if (!workflowIds.has(job.workflow)) {
        errors.push({
          path: relPath,
          message:
            `cron job "${itemId}" references workflow "${job.workflow}", which is not ` +
            `declared in manifest.workflows`,
        });
      } else if (job.inputs !== undefined) {
        if (!isObject(job.inputs)) {
          errors.push({ path: relPath, message: `cron job "${itemId}" inputs must be an object` });
        } else {
          const declared = new Set(Object.keys(workflowIds.get(job.workflow).inputs ?? {}));
          for (const key of Object.keys(job.inputs)) {
            if (!declared.has(key)) {
              errors.push({
                path: relPath,
                message:
                  `cron job "${itemId}" passes input "${key}" that workflow ` +
                  `"${job.workflow}" does not declare`,
              });
            }
          }
        }
      }
      for (const forbidden of ["sessionTarget", "payload"]) {
        if (job[forbidden] !== undefined) {
          errors.push({
            path: relPath,
            message:
              `cron job "${itemId}" declares both \`workflow\` and \`${forbidden}\` — ` +
              `the deploy generates ${forbidden} from the workflow; remove it`,
          });
        }
      }
      return;
    }

    // Legacy shape: sessionTarget + hand-written payload. Still deployable,
    // but the workflow-ref shape gets generated dispatch briefs and
    // readiness-gated enablement — migrate.
    const target = job.sessionTarget;
    if (typeof target !== "string" || !agentIds.has(target)) {
      errors.push({
        path: relPath,
        message:
          `cron job "${itemId}" sessionTarget ${JSON.stringify(target)} is not a ` +
          `declared agent id (squad cron jobs may only target: ${allowed})`,
      });
    }
    warnings.push({
      path: relPath,
      message:
        `cron job "${itemId}" uses the legacy sessionTarget+payload shape — bind it to a ` +
        `published workflow instead ({ id, schedule, workflow }) to get the generated ` +
        `dispatch brief and readiness-gated enablement`,
    });
  });

  return { errors, warnings };
}

// ── frontmatter sanity ──────────────────────────────────────────────────────
// SQUAD.md frontmatter is minimal after the refactor: `tags` (recommended) and
// optional `preview_image`. The deprecated `token_intensity` field is an error.

async function checkFrontmatter(bundleDir) {
  const errors = [];
  const warnings = [];

  const squadMd = await readFileOrNull(join(bundleDir, "SQUAD.md"));
  if (squadMd !== null) {
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(squadMd);
    if (!fm) {
      warnings.push({
        path: "SQUAD.md",
        message: "no YAML frontmatter block — the marketplace reads `tags` (and optional `preview_image`) from it",
      });
    } else {
      const block = fm[1];
      if (!/^tags:\s*\[.*\]\s*$/m.test(block)) {
        warnings.push({
          path: "SQUAD.md",
          message: "frontmatter has no `tags: [...]` line — the catalog card will show no tags",
        });
      }
      if (/^token_intensity:/m.test(block)) {
        errors.push({
          path: "SQUAD.md",
          message: "frontmatter has a deprecated `token_intensity:` line — Pancake Cloud computes token usage automatically; remove this line",
        });
      }
    }
  }

  const onboardMd = await readFileOrNull(join(bundleDir, "ONBOARD.md"));
  if (onboardMd !== null && !/^---\r?\n[\s\S]*?\r?\n---/.test(onboardMd)) {
    warnings.push({
      path: "ONBOARD.md",
      message: "no YAML frontmatter block — expected `required_tools`, `required_identities`, `estimated_setup_minutes`",
    });
  }
  return { errors, warnings };
}

// ── forbidden filenames ─────────────────────────────────────────────────────
// AGENTS.md, USER.md, BOOTSTRAP.md, BOOT.md are pod-level files managed by
// Pancake Cloud — never ship them inside a bundle. TOOLS.md is allowed; it is
// bundle-authored documentation of the squad's tool surface.

async function scanForbiddenFiles(bundleDir) {
  const errors = [];
  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full);
        continue;
      }
      if (e.isFile() && FORBIDDEN_BASENAMES.has(e.name.toLowerCase())) {
        errors.push({
          path: relative(bundleDir, full),
          message:
            "forbidden filename — AGENTS.md / USER.md / BOOTSTRAP.md / BOOT.md are pod-managed by Pancake Cloud and must not appear inside a bundle (TOOLS.md is allowed)",
        });
      }
    }
  }
  await walk(bundleDir);
  return errors;
}

// ── TODO scan ───────────────────────────────────────────────────────────────
// Catches the three placeholder shapes the template ships with: `<!-- TODO`
// comment blocks, `TODO:` colon markers, and a bare `TODO` line on its own.
// Plain prose using the word "TODO" (e.g. "my TODO list") is not flagged.
// The template/ bundle is exempt — it must ship placeholders to be useful.

const TODO_PATTERNS = [
  /<!--\s*TODO\b/i,
  /\bTODO:/,
  /^\s*TODO\s*$/,
];

async function scanForTodos(bundleDir) {
  const errors = [];
  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!e.isFile() || !e.name.toLowerCase().endsWith(".md")) continue;
      const content = await readFileOrNull(full);
      if (content === null) continue;
      const lines = content.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        if (TODO_PATTERNS.some((p) => p.test(lines[i]))) {
          errors.push({
            path: relative(bundleDir, full),
            message: `unresolved TODO marker on line ${i + 1} — strip placeholders before publishing`,
          });
          break;
        }
      }
    }
  }
  await walk(bundleDir);
  return errors;
}

// ── per-bundle orchestration ────────────────────────────────────────────────

async function readFileOrNull(path) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

async function loadAgentJsons(bundleDir, agentIds) {
  // Returns { byId: Map<id, agent>, errors: [...] }. A missing or invalid
  // agent.json is an error; the returned agent is undefined in that case so
  // downstream checks can still emit useful messages.
  const byId = new Map();
  const errors = [];
  for (const id of agentIds) {
    const rel = `agents/${id}/agent.json`;
    const raw = await readFileOrNull(join(bundleDir, rel));
    if (raw === null) {
      errors.push({ path: rel, message: "not found — every agent id in manifest.agents must have an agent.json" });
      continue;
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      errors.push({ path: rel, message: "is not valid JSON" });
      continue;
    }
    for (const e of validateAgentJson(parsed, id, rel)) errors.push(e);
    byId.set(id, parsed);
  }
  return { byId, errors };
}

async function validateBundle(bundleDir) {
  const label = basename(bundleDir);
  const isTemplate = label === "template";
  const errors = [];
  const warnings = [];

  // 1. manifest.json
  let manifest;
  const manifestRaw = await readFileOrNull(join(bundleDir, "manifest.json"));
  if (manifestRaw === null) {
    errors.push({ path: "manifest.json", message: "not found at the bundle root" });
  } else {
    try {
      manifest = JSON.parse(manifestRaw);
    } catch {
      errors.push({ path: "manifest.json", message: "is not valid JSON" });
    }
    if (manifest !== undefined) {
      for (const e of validateManifest(manifest)) errors.push(e);
      warnings.push(...manifestWarnings(manifest));
    }
  }

  const agentIds = collectAgentIds(manifest);

  // 2. agent.json per declared agent
  const { byId: agentsById, errors: agentJsonErrors } = await loadAgentJsons(bundleDir, agentIds);
  errors.push(...agentJsonErrors);

  // 3. referenced files exist, are regular files, no symlink/traversal.
  const bundleRoot = await realpath(bundleDir).catch(() => bundleDir);
  const refs = ["SQUAD.md", "ONBOARD.md"];
  if (isObject(manifest) && isStringArray(manifest.skills)) refs.push(...manifest.skills);
  for (const id of agentIds) {
    refs.push(`agents/${id}/IDENTITY.md`, `agents/${id}/SOUL.md`);
    const agent = agentsById.get(id);
    if (isObject(agent)) {
      if (isObject(agent.heartbeat) && typeof agent.heartbeat.every === "string") {
        refs.push(`agents/${id}/HEARTBEAT.md`);
      }
      if (isStringArray(agent.skills)) refs.push(...agent.skills);
    }
  }
  for (const rel of [...new Set(refs)]) {
    const problem = await checkReferencedFile(bundleDir, bundleRoot, rel);
    if (problem) errors.push({ path: rel, message: problem });
  }

  // 4. cron / task targeting
  const targeting = await checkTargeting(bundleDir, agentIds, manifest);
  errors.push(...targeting.errors);
  warnings.push(...targeting.warnings);

  // 5. frontmatter — warnings for missing tags, errors for deprecated token_intensity
  const fm = await checkFrontmatter(bundleDir);
  errors.push(...fm.errors);
  warnings.push(...fm.warnings);

  // 6. forbidden filenames (AGENTS.md / USER.md / BOOTSTRAP.md / BOOT.md)
  errors.push(...(await scanForbiddenFiles(bundleDir)));

  // 7. TODO markers in markdown — skipped for template/, which ships placeholders
  if (!isTemplate) {
    errors.push(...(await scanForTodos(bundleDir)));
  }

  return { label, errors, warnings };
}

async function discoverBundles() {
  const bundles = [];

  const squadsDir = join(REPO_ROOT, "squads");
  let squadEntries = null;
  try {
    squadEntries = await readdir(squadsDir, { withFileTypes: true });
  } catch {
    squadEntries = null;
  }
  if (squadEntries === null) {
    console.log("note: no squads/ directory found — validating template/ only.\n");
  } else {
    for (const d of squadEntries) {
      if (d.isDirectory()) bundles.push(join(squadsDir, d.name));
    }
  }

  const templateDir = join(REPO_ROOT, "template");
  try {
    if ((await lstat(templateDir)).isDirectory()) bundles.push(templateDir);
  } catch {
    /* template/ is optional for discovery */
  }

  return bundles.sort();
}

async function main() {
  const arg = process.argv[2];
  const bundles = arg
    ? [resolve(process.cwd(), arg)]
    : await discoverBundles();

  if (bundles.length === 0) {
    console.log("No bundles to validate (no squads/* and no template/).");
    process.exit(0);
  }

  console.log("Validating Agent Squad bundles…\n");
  let invalid = 0;
  for (const dir of bundles) {
    const { label, errors, warnings } = await validateBundle(dir);
    if (errors.length === 0) {
      console.log(`✔ ${label}`);
    } else {
      invalid++;
      console.log(`✖ ${label}`);
      for (const e of errors) {
        console.log(`    ${e.path ? `${e.path}  ` : ""}${e.message}`);
      }
    }
    for (const w of warnings) {
      console.log(`    ⚠ ${w.path ? `${w.path}  ` : ""}${w.message}`);
    }
  }

  console.log("");
  if (invalid > 0) {
    console.log(`${invalid} of ${bundles.length} bundle(s) invalid.`);
    process.exit(1);
  }
  console.log(`${bundles.length} bundle(s) checked — all valid.`);
  process.exit(0);
}

main().catch((e) => {
  console.error("validator crashed:", e);
  process.exit(2);
});
