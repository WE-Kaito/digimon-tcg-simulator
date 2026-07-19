import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    // Override with VITE_PROXY_TARGET (e.g. in a local .env) to point at a
    // backend on another host; defaults to a locally running backend.
    const target = env.VITE_PROXY_TARGET ?? "http://localhost:8080";

    return {
        plugins: [react()],
        server: {
            proxy: {
                "/api": {
                    target,
                    changeOrigin: true,
                    ws: true,
                },
            },
        },
    };
});
