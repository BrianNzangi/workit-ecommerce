// Simple script to test PostgreSQL connection
import pg from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const { Client } = pg;

async function testConnection() {
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5433/workit_back?schema=public",
  });

  try {
    await client.connect();
    console.log("✅ Successfully connected to PostgreSQL database");

    const result = await client.query("SELECT version()");
    console.log("📊 PostgreSQL version:", result.rows[0].version);

    await client.end();
    console.log("✅ Connection closed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to connect to database:", error.message);
    process.exit(1);
  }
}

testConnection();
