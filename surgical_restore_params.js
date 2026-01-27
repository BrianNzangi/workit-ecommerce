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

    console.log(`Restoring ${filePath} (param: ${paramName})`);

    // Strategy: Parse by function keywords and braces
    const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
    let newContent = "";

    // Keep everything BEFORE the first method (imports, constants)
    const firstMethodIndex = content.search(/export async function (GET|POST|PUT|PATCH|DELETE)/);
    if (firstMethodIndex !== -1) {
        newContent = content.substring(0, firstMethodIndex);
        let rest = content.substring(firstMethodIndex);

        while (rest.length > 0) {
            const methodMatch = rest.match(/export async function (GET|POST|PUT|PATCH|DELETE)\s*\([\s\S]*?\)\s*\{/);
            if (!methodMatch) {
                newContent += rest;
                break;
            }

            const method = methodMatch[1];
            const signatureLength = methodMatch[0].length;
            const bodyStart = methodMatch.index + signatureLength;

            // Rebuild signature
            newContent += `export async function ${method}(request: NextRequest, { params }: { params: Promise<{ ${paramName}: string }> }) {`;

            // Find end of body
            let braceCount = 1;
            let bodyEnd = -1;
            for (let j = bodyStart; j < rest.length; j++) {
                if (rest[j] === '{') braceCount++;
                if (rest[j] === '}') braceCount--;
                if (braceCount === 0) {
                    bodyEnd = j;
                    break;
                }
            }

            if (bodyEnd === -1) {
                newContent += rest.substring(bodyStart);
                break;
            }

            let body = rest.substring(bodyStart, bodyEnd);

            // CLEAN BODY: Remove ALL params-related mess
            // 1. Remove old signatures if they got merged into the body
            body = body.replace(/export async function (GET|POST|PUT|PATCH|DELETE)\s*\([\s\S]*?\)\s*\{/g, "");
            // 2. Remove all destructures
            const destructurePattern = new RegExp(`const\\s*{\\s*${paramName}\\s*}\\s*=\\s*await\\s*params;?`, 'g');
            body = body.replace(destructurePattern, "");
            // 3. Remove other mangled residue
            body = body.replace(/\{\s*params\s*\}:\s*\{\s*params:\s*Promise<.*?>\s*\}|params:\s*Promise<.*?>|\{\s*params\s*\}|params/g, (m) => {
                // Only remove if it looks like signature residue, not a variable use
                if (m === "params") return "params"; // Keep variable use
                return "";
            });
            // Specific clean for the mangled residue seen in logs
            body = body.replace(/\)\s*{\s*}\s*{/g, "");
            body = body.replace(/\{\s*const\s*{\s*\w+\s*}\s*=\s*await\s*params;\s*params\s*}\s*:\s*{\s*params:\s*Promise<.*?>\s*}/g, "");

            // Re-inject the destructure ONCE at the top
            body = `\n    const { ${paramName} } = await params;\n    ${body.trim()}\n`;

            newContent += body + "}\n\n";
            rest = rest.substring(bodyEnd + 1).trim();
        }
    } else {
        newContent = content;
    }

    // Final clean up of multiple newlines and common residues
    newContent = newContent.replace(/\)\s*{\s*}\s*{/g, ") {");
    newContent = newContent.replace(/\n\s*\n\s*\n/g, "\n\n");

    if (newContent !== content) {
        console.log(`Restored ${filePath}`);
        fs.writeFileSync(filePath, newContent, 'utf8');
    }
});

console.log('Done!');
