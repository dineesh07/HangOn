const { app, BrowserWindow, Tray, Menu, screen, globalShortcut, ipcMain, nativeImage, dialog, shell } = require('electron');
const path = require('path');
const { ConfigStore, PRESET_CHARMS } = require('./configStore');

// Single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
}

let configStore = null;
let win = null;
let settingsWin = null;
let tray = null;

function getWindowBounds(config) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;

  // Ultra-wide transparent canvas to prevent any clipping during extreme swings & long stretches
  const winWidth = Math.min(screenWidth, 850);
  const winHeight = 750;

  let x = screenWidth - winWidth;

  if (config.positionMode === 'top-center') {
    x = Math.round((screenWidth - winWidth) / 2);
  } else if (config.positionMode === 'top-left') {
    x = 0;
  }

  return {
    width: winWidth,
    height: winHeight,
    x: x,
    y: -15
  };
}

function createOverlayWindow() {
  const config = configStore.getAll();
  const bounds = getWindowBounds(config);

  win = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    fullscreenable: false,
    show: false, // will show after loaded if enabled
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  win.webContents.on('did-finish-load', () => {
    syncConfigToWindows();
    if (config.enabled) {
      win.showInactive();
    }
  });

  win.setIgnoreMouseEvents(true, { forward: true });
}

function updateOverlayBounds() {
  if (!win || win.isDestroyed()) return;
  const config = configStore.getAll();
  const bounds = getWindowBounds(config);
  win.setBounds(bounds);
}

const fs = require('fs');

function getAppIcon() {
  const defaultIconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  if (fs.existsSync(defaultIconPath)) {
    const defaultImg = nativeImage.createFromPath(defaultIconPath);
    if (!defaultImg.isEmpty()) return defaultImg;
  }
  return nativeImage.createEmpty();
}

function updateTrayIcon() {
  const icon = getAppIcon();
  if (tray && !icon.isEmpty()) {
    try {
      tray.setImage(icon.resize({ width: 16, height: 16 }));
    } catch (e) {}
  }
}

function openSettingsWindow() {
  if (settingsWin && !settingsWin.isDestroyed()) {
    settingsWin.show();
    settingsWin.focus();
    return;
  }

  const icon = getAppIcon();

  settingsWin = new BrowserWindow({
    width: 680,
    height: 760,
    minWidth: 550,
    minHeight: 600,
    title: 'Hang On Settings',
    icon: icon.isEmpty() ? undefined : icon.resize({ width: 32, height: 32 }),
    backgroundColor: '#f8fafc',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  settingsWin.loadFile(path.join(__dirname, 'renderer', 'settings.html'));

  settingsWin.once('ready-to-show', () => {
    settingsWin.show();
  });
}

function syncConfigToWindows() {
  const fullConfig = configStore.getAll();
  const activeCharm = configStore.getActiveCharm();
  const payload = {
    ...fullConfig,
    activeCharm
  };

  if (win && !win.isDestroyed()) {
    if (fullConfig.enabled) {
      if (!win.isVisible()) {
        win.showInactive();
      }
    } else {
      if (win.isVisible()) {
        win.hide();
      }
    }
    win.webContents.send('config-updated', payload);
  }
  if (settingsWin && !settingsWin.isDestroyed()) {
    settingsWin.webContents.send('config-updated', payload);
  }

  updateOverlayBounds();
  updateTrayMenu();
  updateTrayIcon();
}

function toggleVisibility() {
  const current = configStore.get('enabled');
  configStore.set('enabled', !current);
  syncConfigToWindows();
}

function performBlessing() {
  if (!win || win.isDestroyed()) return;

  if (!configStore.get('enabled')) {
    configStore.set('enabled', true);
  }
  syncConfigToWindows();
  win.webContents.send('perform-ritual');
}

async function promptAddCustomCharm() {
  const result = await dialog.showOpenDialog({
    title: 'Select Custom Dangle Charm Image',
    filters: [
      { name: 'Images & Animations', extensions: ['png', 'gif', 'webp', 'svg', 'jpg', 'jpeg'] }
    ],
    properties: ['openFile']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    try {
      configStore.addCustomCharm(filePath);
      syncConfigToWindows();
    } catch (err) {
      dialog.showErrorBox('Upload Failed', 'Could not load custom dangle image: ' + err.message);
    }
  }
}

function updateTrayMenu() {
  if (!tray) return;

  const isEnabled = configStore.get('enabled');
  const activeId = configStore.get('selectedCharmId');
  const allCharms = [
    ...PRESET_CHARMS,
    ...(configStore.get('customCharms') || [])
  ];

  const currentHang = configStore.get('hangingLength');
  const currentSize = configStore.get('charmSize');

  const charmMenuItems = allCharms.map((c) => ({
    label: c.name,
    type: 'radio',
    checked: c.id === activeId,
    click: () => {
      configStore.set('selectedCharmId', c.id);
      syncConfigToWindows();
    }
  }));

  const menu = Menu.buildFromTemplate([
    {
      label: isEnabled ? 'Enabled (Showing)' : 'Disabled (Hidden)',
      type: 'checkbox',
      checked: isEnabled,
      click: toggleVisibility
    },
    { type: 'separator' },
    {
      label: 'Select Dangle Charm',
      submenu: [
        ...charmMenuItems,
        { type: 'separator' },
        {
          label: 'Add Custom Dangle Image...',
          click: promptAddCustomCharm
        }
      ]
    },
    {
      label: 'Hanging Length',
      submenu: [
        {
          label: 'Short (50px)',
          type: 'radio',
          checked: currentHang === 50,
          click: () => { configStore.set('hangingLength', 50); syncConfigToWindows(); }
        },
        {
          label: 'Medium (90px) [Default]',
          type: 'radio',
          checked: currentHang === 90,
          click: () => { configStore.set('hangingLength', 90); syncConfigToWindows(); }
        },
        {
          label: 'Long (150px)',
          type: 'radio',
          checked: currentHang === 150,
          click: () => { configStore.set('hangingLength', 150); syncConfigToWindows(); }
        }
      ]
    },
    {
      label: 'Dangle Size',
      submenu: [
        {
          label: 'Small (80px)',
          type: 'radio',
          checked: currentSize === 80,
          click: () => { configStore.set('charmSize', 80); syncConfigToWindows(); }
        },
        {
          label: 'Medium (110px) [Default]',
          type: 'radio',
          checked: currentSize === 110,
          click: () => { configStore.set('charmSize', 110); syncConfigToWindows(); }
        },
        {
          label: 'Large (150px)',
          type: 'radio',
          checked: currentSize === 150,
          click: () => { configStore.set('charmSize', 150); syncConfigToWindows(); }
        }
      ]
    },
    { type: 'separator' },
    {
      label: 'Perform Blessing Ritual (Ctrl+Q)',
      click: performBlessing
    },
    {
      label: 'Settings & Customizer...',
      click: openSettingsWindow
    },
    { type: 'separator' },
    {
      label: 'Quit Hang On',
      click: () => app.quit()
    }
  ]);

  tray.setContextMenu(menu);
}

function createTray() {
  const icon = getAppIcon();
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon.resize({ width: 16, height: 16 }));
  tray.setToolTip('Hang On - Click to toggle');

  // Single left-click toggles Enable / Disable
  tray.on('click', () => {
    toggleVisibility();
  });

  // Double-click opens settings
  tray.on('double-click', () => {
    openSettingsWindow();
  });

  updateTrayMenu();
}

function registerShortcuts() {
  globalShortcut.register('Control+D', toggleVisibility);
  globalShortcut.register('Control+Q', performBlessing);
}

// Custom protocol hangon://bless or luckydangle://bless
function handleProtocolUrl(url) {
  if (!url) return;
  if (url.includes('bless')) {
    performBlessing();
  } else if (url.includes('settings')) {
    openSettingsWindow();
  }
}

app.setAsDefaultProtocolClient('hangon');

app.on('second-instance', (event, argv) => {
  const url = argv.find((arg) => arg.startsWith('hangon://') || arg.startsWith('luckydangle://'));
  if (url) {
    handleProtocolUrl(url);
  } else {
    // If user ran the app again, toggle or show settings
    toggleVisibility();
  }
});

// IPC Handlers
ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  if (win && !win.isDestroyed()) {
    win.setIgnoreMouseEvents(ignore, options);
  }
});

ipcMain.on('trigger-ritual', () => {
  performBlessing();
});

ipcMain.handle('get-config', () => {
  const fullConfig = configStore.getAll();
  return {
    ...fullConfig,
    activeCharm: configStore.getActiveCharm()
  };
});

ipcMain.handle('update-config', (event, partial) => {
  configStore.update(partial);
  if (partial.startOnBoot !== undefined) {
    app.setLoginItemSettings({ openAtLogin: !!partial.startOnBoot });
  }
  syncConfigToWindows();
  return configStore.getAll();
});

ipcMain.handle('pick-custom-charm', async () => {
  await promptAddCustomCharm();
  return configStore.getAll();
});

ipcMain.handle('open-charms-folder', () => {
  if (configStore && configStore.customCharmsDir) {
    shell.openPath(configStore.customCharmsDir);
  }
});

ipcMain.handle('save-generated-charm', (event, dataUrl, name, hasBeads) => {
  if (configStore) {
    configStore.saveGeneratedCharm(dataUrl, name, hasBeads);
    syncConfigToWindows();
  }
  return configStore.getAll();
});

ipcMain.handle('delete-custom-charm', (event, id) => {
  configStore.removeCustomCharm(id);
  syncConfigToWindows();
  return configStore.getAll();
});

ipcMain.handle('open-settings', () => {
  openSettingsWindow();
});

app.whenReady().then(() => {
  app.setAppUserModelId('com.hangon.app');
  configStore = new ConfigStore();
  createOverlayWindow();
  createTray();
  registerShortcuts();
});

app.on('window-all-closed', (e) => {
  // Keep alive in tray
  e.preventDefault();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
