import { execFileSync } from "node:child_process";
import path from "node:path";

export default async function globalTeardown() {
  const root = path.resolve(__dirname, "..", "..");
  execFileSync(
    "powershell.exe",
    ["-ExecutionPolicy", "Bypass", "-File", path.join(root, "scripts", "stop_local_stack.ps1")],
    {
      cwd: root,
      stdio: "inherit",
    }
  );
}
