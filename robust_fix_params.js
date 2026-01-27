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

    console.log(`Auditing ${filePath} (param: ${paramName})`);

    // Split by function signature to process each handler individually
    const splitRegex = /(export async function (?:GET|POST|PUT|PATCH|DELETE)\s*\()/g;
    const pieces = content.split(splitRegex);

    if (pieces.length > 1) {
        let newContent = pieces[0];
        for (let i = 1; i < pieces.length; i += 2) {
            let signatureStart = pieces[i];
            let rest = pieces[i + 1];

            // Find end of signature (closing brace of arguments)
            const signatureEndIndex = rest.indexOf(') {');
            if (signatureEndIndex === -1) {
                newContent += signatureStart + rest;
                continue;
            }

            let signatureArgs = rest.substring(0, signatureEndIndex);
            let bodyWithBrace = rest.substring(signatureEndIndex);

            // 1. Fix Signature Arguments
            signatureArgs = `request: NextRequest, { params }: { params: Promise<{ ${paramName}: string }> }`;

            // 2. Fix Body
            // Find the end of this function body to avoid affecting subsequent functions
            // Simple brace counting
            let braceCount = 0;
            let bodyEndIndex = -1;
            for (let j = 0; j < bodyWithBrace.length; j++) {
                if (bodyWithBrace[j] === '{') braceCount++;
                if (bodyWithBrace[j] === '}') braceCount--;
                if (braceCount === 0 && j > 0) {
                    bodyEndIndex = j;
                    break;
                }
            }

            if (bodyEndIndex === -1) {
                newContent += signatureStart + signatureArgs + bodyWithBrace;
                continue;
            }

            let body = bodyWithBrace.substring(3, bodyEndIndex); // skip ') {'
            let restOfFile = bodyWithBrace.substring(bodyEndIndex + 1);

            // Clean body: remove ALL existing destructures of this paramName from params
            const destructurePattern = new RegExp(`const\\s*{\\s*${paramName}\\s*}\\s*=\\s*await\\s*params;?`, 'g');
            body = body.replace(destructurePattern, "").trim();

            // Re-inject once at the top
            body = `\n    const { ${paramName} } = await params;\n    ${body}`;

            newContent += `${signatureStart}${signatureArgs}) {${body}\n}`;

            // If it's the last piece, add the rest of the file
            if (i + 2 >= pieces.length) {
                newContent += restOfFile;
            } else {
                // Otherwise update the rest for next iteration
                pieces[i + 1] = restOfFile;
            }
        }

        // Final cleanup of excessive newlines
        newContent = newContent.replace(/\n\s*\n\s*\n/g, "\n\n");

        if (newContent !== content) {
            console.log(`Fixed ${filePath}`);
            fs.writeFileSync(filePath, newContent, 'utf8');
            changed = true;
        }
    }
});

console.log('Done!');
