const { app, BrowserWindow, Menu, shell, dialog } = require("electron");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const USER_URL = "http://127.0.0.1:3000";
const ADMIN_URL = "http://127.0.0.1:3001/dashboard";
const DEV_URL = "http://127.0.0.1:3000/dev";
const POWERSHELL = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";

let mainWindow = null;
let stackStartedByDesktop = false;
let stackProcess = null;

function hasFile(target) {
  try {
    return fs.existsSync(target);
  } catch {
    return false;
  }
}

function resolveRepoRoot() {
  const candidates = [
    path.resolve(process.cwd()),
    path.resolve(__dirname, ".."),
    path.resolve(process.execPath, ".."),
    path.resolve(process.execPath, "..", ".."),
    path.resolve(process.execPath, "..", "..", ".."),
  ];

  for (const candidate of candidates) {
    if (hasFile(path.join(candidate, "scripts", "start_local_stack.ps1"))) {
      return candidate;
    }
  }

  return path.resolve(__dirname, "..");
}

const repoRoot = resolveRepoRoot();

function stackScript(name) {
  return path.join(repoRoot, "scripts", name);
}

function loadSplash(message) {
  if (!mainWindow) return;

  const html = `
    <!doctype html>
    <html>
      <body style="margin:0;font-family:Segoe UI,system-ui,sans-serif;background:#07111f;color:#eff7ff;display:grid;place-items:center;min-height:100vh;">
        <div style="width:min(560px,92vw);padding:28px;border-radius:24px;border:1px solid rgba(255,255,255,0.12);background:linear-gradient(135deg, rgba(18, 49, 86, 0.96), rgba(7, 17, 31, 0.96));box-shadow:0 24px 80px rgba(0,0,0,0.32);">
          <div style="font-size:13px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.72;">MANABU Desktop</div>
          <h1 style="margin:14px 0 0;font-size:34px;line-height:1.04;">Launching your local learning workspace</h1>
          <p style="margin:14px 0 0;color:rgba(239,247,255,0.76);line-height:1.65;">${message}</p>
        </div>
      </body>
    </html>
  `;

  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
}

function waitForUrl(url, timeoutMs = 180000) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    function probe() {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) {
          resolve();
          return;
        }

        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`));
          return;
        }

        setTimeout(probe, 1500);
      });

      request.on("error", () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`));
          return;
        }

        setTimeout(probe, 1500);
      });
    }

    probe();
  });
}

async function ensureLocalStack() {
  try {
    await waitForUrl(USER_URL, 4000);
    return;
  } catch {
    loadSplash("Starting backend services, learner web app, and admin dashboard. This can take a moment the first time.");
  }

  if (!hasFile(stackScript("start_local_stack.ps1"))) {
    throw new Error("Could not find scripts/start_local_stack.ps1 next to the desktop app.");
  }

  stackStartedByDesktop = true;
  stackProcess = spawn(
    POWERSHELL,
    ["-ExecutionPolicy", "Bypass", "-File", stackScript("start_local_stack.ps1"), "-SkipBuild", "-IncludeUI"],
    {
      cwd: repoRoot,
      windowsHide: true,
      stdio: "ignore",
    }
  );

  stackProcess.on("error", (error) => {
    dialog.showErrorBox("MANABU Desktop", `Could not start the local stack.\n\n${error.message}`);
  });

  await waitForUrl(USER_URL);
}

async function stopLocalStack() {
  if (!stackStartedByDesktop || !hasFile(stackScript("stop_local_stack.ps1"))) {
    return;
  }

  await new Promise((resolve) => {
    const stopper = spawn(
      POWERSHELL,
      ["-ExecutionPolicy", "Bypass", "-File", stackScript("stop_local_stack.ps1")],
      {
        cwd: repoRoot,
        windowsHide: true,
        stdio: "ignore",
      }
    );

    stopper.on("exit", () => resolve());
    stopper.on("error", () => resolve());
  });
}

async function openRoute(url) {
  if (!mainWindow) return;
  loadSplash("Opening MANABU...");
  await ensureLocalStack();
  await mainWindow.loadURL(url);
}

function createMenu() {
  const template = [
    {
      label: "Workspace",
      submenu: [
        { label: "Learner App", click: () => void openRoute(USER_URL) },
        { label: "Admin Dashboard", click: () => void openRoute(ADMIN_URL) },
        { label: "Developer Portal", click: () => void openRoute(DEV_URL) },
        { type: "separator" },
        {
          label: "Open Current URL in Browser",
          click: async () => {
            if (mainWindow) {
              await shell.openExternal(mainWindow.webContents.getURL());
            }
          },
        },
        { type: "separator" },
        { role: "reload", label: "Reload" },
        { role: "forceReload", label: "Force Reload" },
        { type: "separator" },
        {
          label: "Restart Local Stack",
          click: async () => {
            loadSplash("Restarting the local MANABU stack...");
            await stopLocalStack();
            stackStartedByDesktop = false;
            await openRoute(USER_URL);
          },
        },
        { type: "separator" },
        { role: "quit", label: "Quit" },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1480,
    height: 960,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: "#07111f",
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  createMenu();
  loadSplash("Preparing MANABU desktop...");
  await openRoute(USER_URL);
}

app.whenReady().then(() => {
  void createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on("window-all-closed", async () => {
  await stopLocalStack();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
