const fs = require('fs');
const path = require('path');

const baseDir = path.join(process.cwd(), 'admin/src');

const replacements = [
    { from: /@\/components\/admin\/AdminLayout/g, to: '@/components/admin/layout/AdminLayout' },
    { from: /@\/components\/admin\/AdminSidebar/g, to: '@/components/admin/layout/AdminSidebar' },
    { from: /@\/components\/admin\/BrandForm/g, to: '@/components/admin/catalog/brands/BrandForm' },
    { from: /@\/components\/admin\/ProductForm/g, to: '@/components/admin/catalog/products/ProductForm' },
    { from: /@\/components\/admin\/products\//g, to: '@/components/admin/catalog/products/' },
    { from: /@\/components\/admin\/CustomerForm/g, to: '@/components/admin/customers/CustomerForm' },
    { from: /@\/components\/admin\/DraftOrderForm/g, to: '@/components/admin/orders/DraftOrderForm' },
    { from: /@\/components\/admin\/RichTextEditor/g, to: '@/components/admin/shared/RichTextEditor' }
];

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            for (const r of replacements) {
                if (r.from.test(content)) {
                    content = content.replace(r.from, r.to);
                    changed = true;
                }
            }
            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

walk(baseDir);
console.log('Done!');
