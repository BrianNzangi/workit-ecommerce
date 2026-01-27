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
        } else if (file === 'route.ts' && fullPath.includes('[')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk(baseDir);

files.forEach((filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');

    // Determine param name from path
    let currentDir = path.dirname(filePath);
    let paramName = null;
    while (currentDir.length >= baseDir.length) {
        const match = path.basename(currentDir).match(/\[(.*?)\]/);
        if (match) {
            paramName = match[1];
            break;
        }
        currentDir = path.dirname(currentDir);
    }
    if (!paramName) return;

    console.log(`Processing ${filePath} (param: ${paramName})`);

    // Strategy: Clean up the file completely and re-apply standard structure
    // 1. Remove ALL occurrences of { params } related logic to start fresh
    const orphanSignaturePattern = /export async function (GET|POST|PUT|PATCH|DELETE)\s*\([\s\S]*?\)\s*\{/g;
    const destructurePattern = new RegExp(`const\\s*{\\s*${paramName}\\s*}\\s*=\\s*await\\s*params;?`, 'g');

    // We'll replace the entire function head + inject destructure once
    let newContent = content.replace(orphanSignaturePattern, (match, method) => {
        return `export async function ${method}(request: NextRequest, { params }: { params: Promise<{ ${paramName}: string }> }) {`;
    });

    // Remove all existing destructures
    newContent = newContent.replace(destructurePattern, "");

    // Filter out accidental mangled residue like '}{' or 'const { id } = await params; params'
    newContent = newContent.replace(/\s*{\s*const\s*{\s*\w+\s*}\s*=\s*await\s*params;\s*params\s*}\s*:\s*{\s*params:\s*Promise<.*?>\s*}/g, "");
    newContent = newContent.replace(/\)\s*{\s*const\s*{\s*\w+\s*}\s*=\s*await\s*params;\s*}\s*{\s*/g, ") {");

    // 2. Inject destructure at the start of each function body
    // We match our newly standardized signature and add the line
    const finalSignaturePattern = /export async function (GET|POST|PUT|PATCH|DELETE)\(request: NextRequest, \{ params \}: \{ params: Promise<\{ .*?: string \}> \}\) \{/g;
    newContent = newContent.replace(finalSignaturePattern, (match) => {
        return `${match}\n    const { ${paramName} } = await params;`;
    });

    // Clean up excessive whitespace/mangled residue
    newContent = newContent.replace(/\)\s*{\s*}\s*{/g, ") {");
    newContent = newContent.replace(/\n\s*\n\s*\n/g, "\n\n");

    if (newContent !== content) {
        console.log(`Updated ${filePath}`);
        fs.writeFileSync(filePath, newContent, 'utf8');
    }
});

console.log('Done!');
