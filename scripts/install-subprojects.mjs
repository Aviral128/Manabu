import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const projects = ["backend_api", "backend_services", "admin_panel", "user_web_app", "mobile_app"];

for (const project of projects) {
  const cwd = path.join(root, project);
  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const args = process.platform === "win32" ? ["/d", "/s", "/c", "npm install"] : ["install"];

  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
