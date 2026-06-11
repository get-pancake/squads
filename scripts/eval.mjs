#!/usr/bin/env node
// scripts/eval.mjs — replay every *.trace.json under squads/<name>/evals/
// against its bundle manifest. Mirrors the validate.mjs ergonomics.
//
// Usage:
//   node scripts/eval.mjs                       # every squad
//   node scripts/eval.mjs squads/<name>         # one squad
//   node scripts/eval.mjs path/to/case.trace.json  # one trace
//
// Exit 0 if every trace passes; 1 otherwise.

import { readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { runOne } from '../lib/eval-runner.mjs';

const ROOT = resolve(new URL('..', import.meta.url).pathname);

async function* findTraces(start) {
  let entries;
  try {
    entries = await readdir(start, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(start, e.name);
    if (e.isDirectory()) {
      yield* findTraces(p);
    } else if (e.isFile() && e.name.endsWith('.trace.json')) {
      yield p;
    }
  }
}

async function resolveTargets(args) {
  if (args.length === 0) {
    return [join(ROOT, 'squads')];
  }
  return args.map((a) => resolve(process.cwd(), a));
}

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const targets = await resolveTargets(args);
  const traces = [];
  for (const t of targets) {
    let s;
    try {
      s = await stat(t);
    } catch {
      process.stderr.write(`eval: cannot stat ${t}\n`);
      process.exit(2);
    }
    if (s.isFile() && t.endsWith('.trace.json')) {
      traces.push(t);
    } else if (s.isDirectory()) {
      for await (const p of findTraces(t)) traces.push(p);
    }
  }
  if (traces.length === 0) {
    process.stdout.write('No *.trace.json files found.\n');
    process.exit(0);
  }
  let failed = 0;
  for (const t of traces) {
    let result;
    try {
      result = await runOne(t);
    } catch (e) {
      process.stdout.write(`${t}\n  ✖  loader: ${e.message}\n\n`);
      failed++;
      continue;
    }
    process.stdout.write(result.report);
    if (!result.check.ok()) failed++;
  }
  const total = traces.length;
  const passed = total - failed;
  process.stdout.write(
    failed === 0
      ? `${total} trace(s) — all passed.\n`
      : `${passed}/${total} passed; ${failed} failed.\n`,
  );
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  process.stderr.write(`eval: ${e.stack ?? e.message ?? e}\n`);
  process.exit(2);
});
