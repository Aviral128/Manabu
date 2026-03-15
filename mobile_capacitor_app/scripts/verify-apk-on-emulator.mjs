import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const emulatorPath = "C:\\Users\\sulta\\AppData\\Local\\Android\\Sdk\\emulator\\emulator.exe";
const adbPath = "C:\\Users\\sulta\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe";
const avdName = "Medium_Phone_API_36.1";
const apkPath = path.join(projectRoot, "android", "app", "build", "outputs", "apk", "release", "app-release.apk");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      ...options,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}.\n${stdout}\n${stderr}`));
    });
  });
}

async function waitForBoot(deviceId) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 240_000) {
    try {
      const { stdout } = await run(adbPath, ["-s", deviceId, "shell", "getprop", "sys.boot_completed"]);
      if (stdout.trim() === "1") {
        return;
      }
    } catch {
      // Device may still be starting.
    }

    await sleep(5_000);
  }

  throw new Error("Emulator did not finish booting in time.");
}

async function resolveDeviceId() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 300_000) {
    const { stdout } = await run(adbPath, ["devices"]);
    const deviceLine = stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith("List of devices attached") && /\tdevice$/.test(line));

    if (deviceLine) {
      return deviceLine.split("\t")[0];
    }

    await sleep(3_000);
  }

  throw new Error("ADB did not detect an emulator device in time.");
}

async function main() {
  await run(adbPath, ["start-server"]).catch(() => undefined);

  const emulator = spawn(
    emulatorPath,
    ["-avd", avdName, "-no-snapshot-load", "-no-boot-anim", "-noaudio", "-no-window", "-gpu", "swiftshader_indirect"],
    {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    },
  );
  emulator.unref();

  let deviceId = "";

  try {
    deviceId = await resolveDeviceId();
    await waitForBoot(deviceId);
    await run(adbPath, ["-s", deviceId, "install", "-r", apkPath]);
    await run(adbPath, ["-s", deviceId, "shell", "monkey", "-p", "com.manabu.app", "-c", "android.intent.category.LAUNCHER", "1"]);
    const { stdout } = await run(adbPath, ["-s", deviceId, "shell", "dumpsys", "package", "com.manabu.app"]);

    if (!/Package \[com\.manabu\.app\]/.test(stdout)) {
      throw new Error("APK install verification failed. Package com.manabu.app was not found on the emulator.");
    }

    console.log(`Verified emulator install for ${deviceId}.`);
  } finally {
    if (deviceId) {
      await run(adbPath, ["-s", deviceId, "emu", "kill"]).catch(() => undefined);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
