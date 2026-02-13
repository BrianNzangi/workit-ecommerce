import { db, schema, eq } from './dist/index.js';

async function check() {
    try {
        const result = await db.query.collections.findFirst();
        console.log('Columns in Collection:', Object.keys(result || {}));
        if (result && 'mostShoppedSortOrder' in result) {
            console.log('SUCCESS: mostShoppedSortOrder exists!');
        } else {
            console.log('FAILURE: mostShoppedSortOrder not found.');
        }
    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        process.exit(0);
    }
}

check();
