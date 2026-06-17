/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "")

	return {
		plugins: [react()],
		server: {
			host: "0.0.0.0",
			hmr: {
				host: "127.0.0.1",
				clientPort: 5173,
			},
			proxy: {
				"/api": {
					target: env.API_PROXY_TARGET || "http://localhost:8000",
					changeOrigin: true,
					secure: false,
					rewrite: (path) => path.replace(/^\/api/, ""),
				},
			},
		},
		resolve: {
			alias: {
				"@": resolve(__dirname, "src"),
			},
		},
		test: {
			globals: true,
			environment: "jsdom",
			setupFiles: "./src/test/setup.ts",
		},
	}
})
