import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const publicDir = join(projectRoot, 'public');
const adsUrl = 'https://monetumo.com/ads-txt/workit-co-ke';
const adsFile = join(publicDir, 'ads.txt');

async function main() {
  try {
    const response = await fetch(adsUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const content = await response.text();

    if (!existsSync(publicDir)) {
      mkdirSync(publicDir, { recursive: true });
    }

    writeFileSync(adsFile, content, 'utf-8');
    console.log(`ads.txt fetched from ${adsUrl} and saved to ${adsFile}`);
  } catch (error) {
    console.error(`Failed to fetch ads.txt: ${error.message}`);
    if (existsSync(adsFile)) {
      console.log('Keeping existing ads.txt from previous fetch');
    } else {
      writeFileSync(adsFile, '', 'utf-8');
      console.log('Created empty ads.txt placeholder');
    }
  }
}

main();
