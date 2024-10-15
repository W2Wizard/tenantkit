// ============================================================================
// W2Inc, Amsterdam 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================
import { $ } from "bun";
import { input } from "@inquirer/prompts";
import { addScriptToPackage } from "./utils";
// ============================================================================
const template = `
// ============================================================================
// W2Inc, Amsterdam 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================
import { $ } from 'bun';
import { input } from '@inquirer/prompts';
// ============================================================================
// Write some code as to what to what the command should do.
`;
const name = await input({
	message: "Enter a name for the script",
	validate: async (v) => {
		if (!/^[a-zA-Z]+(:[a-zA-Z]+)*$/.test(v)) {
			return "Invalid script name";
		}
		if (await Bun.file(`./scripts/${v}.ts`).exists()) {
			return "Script with that name already exists";
		}
		return true;
	},
});

const sanitized_name = name.replace(/[\/:*?"<>|\\]/g, "-");
const file = `./scripts/${sanitized_name}.ts`;
if (await addScriptToPackage(name, `bun --bun run ${file}`)) {
	await $`echo "${template}" > ${file}`;
}
