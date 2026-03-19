import { spawn } from "node:child_process";

function isDevelopmentLikeEnvironment() {
    const env = process.env.NODE_ENV;
    return !env || env === "development";
}

function shouldAutoPushSchema() {
    if (!isDevelopmentLikeEnvironment()) {
        return false;
    }

    const flag = process.env.DB_AUTO_PUSH;
    if (!flag) {
        return true;
    }

    return flag !== "false" && flag !== "0";
}

export async function ensureDevelopmentSchema() {
    if (!shouldAutoPushSchema()) {
        return;
    }

    if (!process.env.DATABASE_URL) {
        console.warn("[dev-db] DATABASE_URL is missing; skipping automatic schema push.");
        return;
    }

    await new Promise<void>((resolve, reject) => {
        const child = spawn("pnpm", ["--dir", "..", "--filter", "@workit/db", "push"], {
            cwd: process.cwd(),
            env: process.env,
            stdio: "inherit",
            shell: true,
        });

        child.on("error", reject);
        child.on("exit", (code) => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(`[dev-db] Automatic schema push failed with exit code ${code ?? "unknown"}.`));
        });
    });
}
