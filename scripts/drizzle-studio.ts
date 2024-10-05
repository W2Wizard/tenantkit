// ============================================================================
// W2Inc, Amsterdam 2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { $ } from "bun";
import { input } from "@inquirer/prompts";

// ============================================================================

// NOTE: Omit the --bun flag due to warning.
await $`bun run drizzle-kit studio --verbose`;
