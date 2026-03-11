const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("manabuDesktop", {
  platform: process.platform,
});
