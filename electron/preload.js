const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('gameRuntime', {
  platform: process.platform,
  versions: process.versions
});
