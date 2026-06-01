import sharp from 'sharp';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svg = readFileSync(join(root, 'public', 'icon.svg'));

for (const size of [192, 512]) {
  await sharp(svg).resize(size, size).png().toFile(join(root, 'public', `icon-${size}.png`));
  console.log(`Generated public/icon-${size}.png`);
}
