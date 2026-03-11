import { spawn } from "node:child_process";

function readArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

const cwd = readArg("--cwd");
const cmd = readArg("--cmd");
const argsIndex = process.argv.indexOf("--args");
const args = argsIndex === -1 ? [] : process.argv.slice(argsIndex + 1);

if (!cwd || !cmd) {
  console.error("Usage: node scripts/spawn_detached.mjs --cwd <dir> --cmd <file> --args <...>");
  process.exit(1);
}

const child = spawn(cmd, args, {
  cwd,
  detached: true,
  stdio: "ignore",
  windowsHide: true,
  shell: false,
});

child.unref();
console.log(`spawned pid=${child.pid}`);
