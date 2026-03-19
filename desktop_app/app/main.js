const { app, BrowserWindow, Menu, shell } = require("electron");

const USER_URL = "https://manabu-mu.vercel.app";
const ADMIN_URL = `${USER_URL}/admin`;
const DEV_URL = `${USER_URL}/dev`;

let mainWindow = null;

function getSplashUrl(message) {
  const html = `
    <!doctype html>
    <html>
      <body style="margin:0;font-family:Segoe UI,system-ui,sans-serif;background:#07111f;color:#eff7ff;display:grid;place-items:center;min-height:100vh;">
        <div style="width:min(560px,92vw);padding:28px;border-radius:24px;border:1px solid rgba(255,255,255,0.12);background:linear-gradient(135deg, rgba(18, 49, 86, 0.96), rgba(7, 17, 31, 0.96));box-shadow:0 24px 80px rgba(0,0,0,0.32);">
          <div style="font-size:13px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.72;">MANABU Desktop</div>
          <h1 style="margin:14px 0 0;font-size:34px;line-height:1.04;">Launching MANABU...</h1>
          <p style="margin:14px 0 0;color:rgba(239,247,255,0.76);line-height:1.65;">${message}</p>
        </div>
      </body>
    </html>
  `;

  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

function isManabuUrl(targetUrl) {
  try {
    return new URL(targetUrl).origin === new URL(USER_URL).origin;
  } catch {
    return false;
  }
}

function loadRoute(url) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return Promise.resolve();
  }

  return mainWindow.loadURL(url);
}

function createMenu() {
  const template = [
    {
      label: "Workspace",
      submenu: [
        { label: "Learner App", click: () => void loadRoute(USER_URL) },
        { label: "Admin Dashboard", click: () => void loadRoute(ADMIN_URL) },
        { label: "Dev Portal", click: () => void loadRoute(DEV_URL) },
        { type: "separator" },
        {
          label: "Open Current URL in Browser",
          click: () => {
            if (!mainWindow || mainWindow.isDestroyed()) {
              return;
            }

            void shell.openExternal(mainWindow.webContents.getURL());
          },
        },
        { type: "separator" },
        { role: "reload", label: "Reload" },
        { role: "forceReload", label: "Force Reload" },
        { type: "separator" },
        { role: "quit", label: "Quit" },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function attachWindowHandlers(window) {
  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  window.webContents.on("will-navigate", (event, url) => {
    if (isManabuUrl(url)) {
      return;
    }

    event.preventDefault();
    void shell.openExternal(url);
  });

  window.webContents.on(
    "did-fail-load",
    (_event, errorCode, _errorDescription, validatedURL, isMainFrame) => {
      if (errorCode === -3 || !isMainFrame || validatedURL === USER_URL) {
        return;
      }

      void loadRoute(USER_URL);
    }
  );
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
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  attachWindowHandlers(mainWindow);
  createMenu();

  await mainWindow.loadURL(getSplashUrl("Opening the production MANABU experience."));
  mainWindow.show();
  void loadRoute(USER_URL);
}

app.whenReady().then(() => {
  void createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
