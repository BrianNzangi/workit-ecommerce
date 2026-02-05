import { buildApp } from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const start = async () => {
    const app = await buildApp();
    const port = Number(process.env.PORT) || 3001;

    try {
        await app.listen({ port, host: "0.0.0.0" });
        console.log(`🚀 Server ready at http://localhost:${port}`);
    } catch (err) {
        console.error("STARTUP ERROR:", err);
        app.log.error(err);
        process.exit(1);
    }
};

start();