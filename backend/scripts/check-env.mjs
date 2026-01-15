import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

console.log('\n📋 Current Environment Variables:\n');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('\n');

if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    console.log('🔍 Parsed DATABASE_URL:');
    console.log('  Protocol:', url.protocol);
    console.log('  Username:', url.username);
    console.log('  Password:', url.password ? '***' : '(empty)');
    console.log('  Hostname:', url.hostname, url.hostname === 'localhost' ? '✅' : '❌ WRONG! Should be "localhost"');
    console.log('  Port:', url.port);
    console.log('  Database:', url.pathname.substring(1).split('?')[0]);
    console.log('  Schema:', url.searchParams.get('schema'));
    console.log('\n');

    if (url.hostname !== 'localhost') {
        console.log('❌ ERROR: Hostname should be "localhost", not "' + url.hostname + '"');
        console.log('\n✅ CORRECT DATABASE_URL should be:');
        console.log('DATABASE_URL="postgresql://postgres:##@Scottish!@localhost:5433/workit_backed_db?schema=public"');
    } else {
        console.log('✅ DATABASE_URL looks correct!');
    }
} else {
    console.log('❌ DATABASE_URL is not set!');
}
