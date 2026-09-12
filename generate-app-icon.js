const { app, BrowserWindow, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 512,
    height: 512,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: {
      offscreen: true
    }
  });

  const svgPath = path.join(__dirname, 'assets', 'charms', 'evil-eye.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 512px;
            height: 512px;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          svg {
            width: 480px;
            height: 480px;
            filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.45));
          }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
    </html>
  `;

  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));

  // Wait a bit for SVG to render
  await new Promise(r => setTimeout(r, 600));

  const image = await win.webContents.capturePage();
  const png512 = image.toPNG();

  // Save 512x512 icon.png
  fs.writeFileSync(path.join(__dirname, 'assets', 'icon.png'), png512);
  console.log('Saved assets/icon.png (512x512)');

  // Save 64x64 tray-icon.png
  const trayImg = image.resize({ width: 64, height: 64 });
  fs.writeFileSync(path.join(__dirname, 'assets', 'tray-icon.png'), trayImg.toPNG());
  console.log('Saved assets/tray-icon.png (64x64)');

  // Build multi-size Windows .ico file with PNG buffers (256, 128, 64, 48, 32, 16)
  const sizes = [256, 128, 64, 48, 32, 16];
  const pngBuffers = sizes.map(sz => {
    return {
      size: sz,
      buffer: image.resize({ width: sz, height: sz }).toPNG()
    };
  });

  // Calculate ICO file header & directory
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + (numImages * dirEntrySize);

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon type (1 = ICO)
  header.writeUInt16LE(numImages, 4);

  const dirEntries = [];
  const imageBuffers = [];

  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    const w = item.size === 256 ? 0 : item.size;
    const h = item.size === 256 ? 0 : item.size;

    entry.writeUInt8(w, 0);
    entry.writeUInt8(h, 1);
    entry.writeUInt8(0, 2); // color palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // size of image data
    entry.writeUInt32LE(offset, 12); // offset in file

    dirEntries.push(entry);
    imageBuffers.push(item.buffer);
    offset += item.buffer.length;
  }

  const icoBuffer = Buffer.concat([header, ...dirEntries, ...imageBuffers]);
  fs.writeFileSync(path.join(__dirname, 'assets', 'icon.ico'), icoBuffer);
  console.log('Saved assets/icon.ico successfully with multi-resolution frames!');

  app.quit();
});
