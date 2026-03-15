import { access } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const androidPath = path.join(projectRoot, "android");
const gradleWrapperPath = path.join(androidPath, "gradlew.bat");
const cmdPath = process.env.ComSpec || "C:\\Windows\\System32\\cmd.exe";

const javaHomeCandidates = [
  process.env.MANABU_JAVA_HOME,
  "C:\\Progra~1\\ECLIPS~1\\JDK-25~1.10-",
  process.env.JAVA_HOME,
  "C:\\Program Files\\Eclipse Adoptium\\jdk-25.0.2.10-hotspot",
].filter(Boolean);

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function resolveJavaHome() {
  for (const candidate of javaHomeCandidates) {
    const javaExecutable = path.join(candidate, "bin", "java.exe");
    if (await pathExists(javaExecutable)) {
      return candidate;
    }
  }

  return null;
}

async function main() {
  const javaHome = await resolveJavaHome();
  const args = ["assembleRelease"];

  if (javaHome) {
    args.unshift(`-Dorg.gradle.java.home=${javaHome}`);
  }

  await new Promise((resolve, reject) => {
    const child = spawn(cmdPath, ["/c", gradleWrapperPath, ...args], {
      cwd: androidPath,
      stdio: "inherit",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Gradle release build failed with exit code ${code ?? "unknown"}.`));
    });

    child.on("error", reject);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
