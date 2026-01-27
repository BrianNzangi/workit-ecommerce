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

    console.log(`Fixing mangled signatures in ${filePath}`);

    // Pattern to match the mangled signature
    const mangledPattern = /export async function (GET|POST|PUT|PATCH|DELETE)\(\s*request: NextRequest,\s*\{\s*const\s*\{\s*(\w+)\s*\}\s*=\s*await\s*params;\s*params\s*\}:\s*\{\s*params:\s*Promise<\{\s*\w+:\s*string\s*\}\s*>\s*\}\s*\)\s*\{/g;

    let newContent = content.replace(mangledPattern, (match, method, pName) => {
        return `export async function ${method}(\n    request: NextRequest,\n    { params }: { params: Promise<{ ${pName}: string }> }\n) {\n    const { ${pName} } = await params;`;
    });

    // Also remove any existing orphan 'const { id } = await params;' that might have been duplicated inside the body
    const orphanPattern = new RegExp(`const\\s*{\\s*${paramName}\\s*}\\s*=\\s*await\\s*params;?`, 'g');

    // Strategy: Split by function signature, clean body, reassemble
    const splitPattern = /export async function (?:GET|POST|PUT|PATCH|DELETE)[\s\S]*?\{/g;
    const pieces = newContent.split(splitPattern);
    const signatures = newContent.match(splitPattern);

    if (signatures) {
        let result = pieces[0];
        for (let i = 0; i < signatures.length; i++) {
            let body = pieces[i + 1];
            // Remove ALL occurrences of the destructure from body
            body = body.replace(orphanPattern, "");
            // Re-add precisely ONE at the top of the body (it's already in the signature's replacement if it was mangled, 
            // but if it wasn't mangled we need to be careful)

            // Actually, if I use the mangledPattern replacement, it includes the destructure.
            // If the signature WASN'T mangled, I should still ensure it's correct.

            result += signatures[i] + body;
        }
        newContent = result;
    }

    // Final sweep to ensure every { method } ( ... ) { has exactly one await params
    const finalRegex = /(export async function (?:GET|POST|PUT|PATCH|DELETE)\(\s*request: NextRequest,\s*\{\s*params\s*\}:\s*\{\s*params:\s*Promise<\{\s*\w+:\s*string\s*\}\s*>\s*\}\s*\)\s*\{)([\s\S]*?)/g;
    newContent = newContent.replace(finalRegex, (match, sig, body) => {
        let cleanBody = body.replace(orphanPattern, "").trim();
        return `${sig}\n    const { ${paramName} } = await params;\n    ${cleanBody}\n`;
    });

    // Cleanup excessive newlines
    newContent = newContent.replace(/\n\s*\n\s*\n/g, "\n\n");

    if (newContent !== content) {
        console.log(`Fixed ${filePath}`);
        fs.writeFileSync(filePath, newContent, 'utf8');
    }
});

console.log('Done!');
