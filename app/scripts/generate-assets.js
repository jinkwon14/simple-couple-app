const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

const assets = [
  {
    name: 'icon.png',
    description: 'Simple 1x1 pink placeholder icon',
    base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X2MX8AAAAASUVORK5CYII=',
  },
  {
    name: 'splash.png',
    description: 'Simple 1x1 light background placeholder',
    base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X2MX8AAAAASUVORK5CYII=',
  },
  {
    name: 'adaptive-icon.png',
    description: 'Simple 1x1 adaptive icon placeholder',
    base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X2MX8AAAAASUVORK5CYII=',
  },
];

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

assets.forEach(({ name, base64, description }) => {
  const filePath = path.join(assetsDir, name);
  fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
  console.log(`Generated ${name} (${description}) at ${filePath}`);
});
