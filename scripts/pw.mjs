// Loads Playwright for the capture scripts. Playwright is a dev-only tool, not shipped with the app.
// Set PLAYWRIGHT_FROM to any folder whose node_modules has playwright (default: this repo).
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { join } from "node:path";

const from = process.env.PLAYWRIGHT_FROM || process.cwd();
const require = createRequire(pathToFileURL(join(from, "package.json")));
export const { chromium } = require("playwright");
