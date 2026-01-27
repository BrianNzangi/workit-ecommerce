const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'admin', 'app', 'api', 'admin');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (file === 'route.ts') {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk(baseDir);

files.forEach((filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Pattern for the BACKEND_URL definition with localhost/127.0.0.1 fallbacks
    const urlPattern = /const\s+BACKEND_URL\s*=\s*process\.env\.NEXT_PUBLIC_BACKEND_URL\s*\|\|\s*['"]http:\/\/(?:localhost|127\.0\.0\.1):3001['"];?/g;

    if (urlPattern.test(content)) {
        content = content.replace(urlPattern, "const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;");
        changed = true;
    }

    if (changed) {
        console.log(`Updated ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
});

console.log('Done!');
