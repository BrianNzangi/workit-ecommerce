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
    let changed = false;

    // Find the closest param name by looking up the directory tree
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

    console.log(`Fixing ${filePath} (param: ${paramName})`);

    // Match any exported async function for standard methods
    // We'll replace the entire signature and ensure the body starts correctly
    const methodRegex = /export async function (GET|POST|PUT|PATCH|DELETE)\s*\([\s\S]*?\)\s*\{/g;

    const newContent = content.replace(methodRegex, (match, method) => {
        changed = true;
        return `export async function ${method}(\n    request: NextRequest,\n    { params }: { params: Promise<{ ${paramName}: string }> }\n) {`;
    });

    content = newContent;

    // Now ensure we have EXACTLY ONE 'const { paramName } = await params;' in each function
    const functionBlockRegex = /export async function (?:GET|POST|PUT|PATCH|DELETE)[\s\S]*?\{([\s\S]*?)\}/g;

    content = content.replace(functionBlockRegex, (match, body) => {
        // Clean up body: remove ALL existing destructures of this paramName from params
        const destructurePattern = new RegExp(`const\\s*{\\s*${paramName}\\s*}\\s*=\\s*await\\s*params;?`, 'g');
        let cleanBody = body.replace(destructurePattern, "").trim();

        // Inject it at the very top
        return match.replace(body, `\n    const { ${paramName} } = await params;\n    ${cleanBody}\n`);
    });

    // Cleanup excessive newlines
    content = content.replace(/\n\s*\n\s*\n/g, "\n\n");

    if (changed) {
        console.log(`Updated ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
});

console.log('Done!');
