import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const sql = postgres(process.env.DATABASE_URL!);

async function checkAuth() {
    console.log("Checking authentication setup...\n");

    // Check if there are any users
    const users = await sql`SELECT id, email, role FROM "user" LIMIT 5`;
    console.log(`Total users found: ${users.length}`);

    if (users.length > 0) {
        console.log("\nUsers:");
        users.forEach(u => {
            console.log(`- ${u.email} (${u.role})`);
        });
    } else {
        console.log("\n⚠️  No users found! You need to create an admin user.");
    }

    // Check sessions
    const sessions = await sql`SELECT COUNT(*) as count FROM "session"`;
    console.log(`\nActive sessions: ${sessions[0].count}`);

    // Check accounts
    const accounts = await sql`SELECT COUNT(*) as count FROM "account"`;
    console.log(`Accounts: ${accounts[0].count}`);

    await sql.end();
}

checkAuth();
