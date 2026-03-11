import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const [, , url, outputPath] = process.argv;

if (!url || !outputPath) {
  console.error("Usage: node scripts/download_file.mjs <url> <outputPath>");
  process.exit(1);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

function download(currentUrl) {
  https
    .get(currentUrl, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        download(response.headers.location);
        return;
      }

      if (response.statusCode !== 200) {
        console.error(`Download failed with HTTP ${response.statusCode}`);
        process.exit(1);
      }

      const file = fs.createWriteStream(outputPath);
      response.pipe(file);
      file.on("finish", () => {
        file.close(() => {
          console.log(outputPath);
        });
      });
    })
    .on("error", (error) => {
      console.error(error.message);
      process.exit(1);
    });
}

download(url);
