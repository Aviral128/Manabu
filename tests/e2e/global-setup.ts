import { execFileSync } from "node:child_process";
import path from "node:path";

export default async function globalSetup() {
  const root = path.resolve(__dirname, "..", "..");
  execFileSync(
    "powershell.exe",
    ["-ExecutionPolicy", "Bypass", "-File", path.join(root, "scripts", "start_local_stack.ps1"), "-SkipBuild", "-IncludeUI"],
    {
      cwd: root,
      stdio: "inherit",
    }
  );
}
