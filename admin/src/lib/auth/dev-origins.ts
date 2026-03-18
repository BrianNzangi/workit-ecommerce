export const DEV_LOCAL_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
];

export const withDevOrigins = (origins: string[]): string[] => {
    if (process.env.NODE_ENV === "production") {
        return origins;
    }

    return Array.from(new Set([...origins, ...DEV_LOCAL_ORIGINS]));
};
