import { spawn } from "node:child_process";

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const useShell = process.platform === "win32";

function run(args, env = process.env) {
    return new Promise((resolve, reject) => {
        const child = spawn(pnpmCommand, args, {
            cwd: process.cwd(),
            env,
            shell: useShell,
            stdio: "inherit",
        });

        child.on("error", reject);
        child.on("exit", (code) => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(`${pnpmCommand} ${args.join(" ")} exited with code ${code ?? "unknown"}`));
        });
    });
}

await run(["build"]);

await run(
    [
        "exec",
        "drizzle-kit",
        "studio",
        "--config=drizzle.config.ts",
        "--host",
        "127.0.0.1",
        "--port",
        "4983",
    ],
    {
        ...process.env,
        DRIZZLE_SCHEMA_PATH: process.env.DRIZZLE_SCHEMA_PATH || "./dist/schema/*.js",
    }
);
