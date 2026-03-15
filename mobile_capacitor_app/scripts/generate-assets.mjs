import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Resvg } from "@resvg/resvg-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const sourceSvgPath = path.resolve(projectRoot, "..", "user_web_app", "src", "app", "icon.svg");
const androidResPath = path.resolve(projectRoot, "android", "app", "src", "main", "res");
const resourceOutputPath = path.resolve(projectRoot, "resources");

const launcherSizes = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
};

const splashSizes = {
  mdpi: 120,
  hdpi: 180,
  xhdpi: 240,
  xxhdpi: 360,
  xxxhdpi: 480,
};

async function ensureDir(targetPath) {
  await mkdir(targetPath, { recursive: true });
}

async function renderSvg(svg, width, height) {
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: width,
    },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}

async function main() {
  const svg = await readFile(sourceSvgPath, "utf8");
  await ensureDir(resourceOutputPath);

  const baseIcon = await renderSvg(svg, 1024, 1024);
  await writeFile(path.join(resourceOutputPath, "manabu-logo-1024.png"), baseIcon);

  for (const [density, size] of Object.entries(launcherSizes)) {
    const densityPath = path.join(androidResPath, `mipmap-${density}`);
    await ensureDir(densityPath);
    const iconPng = await renderSvg(svg, size, size);
    await writeFile(path.join(densityPath, "ic_launcher.png"), iconPng);
    await writeFile(path.join(densityPath, "ic_launcher_round.png"), iconPng);
  }

  for (const [density, size] of Object.entries(splashSizes)) {
    const densityPath = path.join(androidResPath, `drawable-${density}`);
    await ensureDir(densityPath);
    const splashPng = await renderSvg(svg, size, size);
    await writeFile(path.join(densityPath, "splashscreen_logo.png"), splashPng);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
