import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
	plugins: [
		sveltekit(),
		enhancedImages(),
		viteStaticCopy({
			targets: [
				{
					src: "drizzle/*", // Source folder
					dest: "drizzle", // Destination folder in the build output
				},
			],
		}),
	],
});
