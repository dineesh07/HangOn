const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dangle', {
  // Mouse events for transparent click-through
  setIgnoreMouseEvents: (ignore, options) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options);
  },

  // Ritual trigger
  onRitual: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('perform-ritual', handler);
    return () => ipcRenderer.removeListener('perform-ritual', handler);
  },

  // Config management
  getConfig: () => ipcRenderer.invoke('get-config'),
  updateConfig: (partial) => ipcRenderer.invoke('update-config', partial),
  onConfigUpdated: (callback) => {
    const handler = (event, config) => callback(config);
    ipcRenderer.on('config-updated', handler);
    return () => ipcRenderer.removeListener('config-updated', handler);
  },

  // Custom charms
  pickCustomCharm: () => ipcRenderer.invoke('pick-custom-charm'),
  deleteCustomCharm: (id) => ipcRenderer.invoke('delete-custom-charm', id),
  openCharmsFolder: () => ipcRenderer.invoke('open-charms-folder'),
  openSettings: () => ipcRenderer.invoke('open-settings'),
  performRitual: () => ipcRenderer.send('trigger-ritual')
});
