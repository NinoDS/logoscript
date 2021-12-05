import Compiler from "./compiler.ts";
import Reporter from "./reporter.ts";
import { toFileUrl, parse } from "https://deno.land/std@0.117.0/path/mod.ts";
import clipboard from "https://deno.land/x/clipboard@v0.0.2/mod.ts";

// Deno flags: --allow-run --allow-read --allow-write

if (Deno.args.length < 1) {
	Reporter.panic("Usage: lsc <file>");
}

let flags: Map<string, boolean> = new Map();

for (const flag of Deno.args) {
	if (flag.startsWith("--")) {
		flags.set(flag.substring(2), true);
	}
}

const filepath = await Deno.realPath(Deno.args[0]);
const source = await Deno.readTextFile(filepath);

try {
	Reporter.info(`Compiling ${toFileUrl(filepath).href} ...`);
	const compiler = new Compiler(source, flags);
	const output = compiler.compile();
	Reporter.success("Compiled successfully");

	if (flags.has("copy")) {
		await copy(output);
	} else if (flags.has("save")) {
		await save(filepath, output);
	} else {
		Reporter.log(output);
	}
} catch (error) {
	Reporter.error(error.message);
	Reporter.panic("Compilation failed");
}

// Write output to a file with the same name as the input file
// but with the .result extension
async function save(filepath: string, output: string) {
	const parsed = parse(filepath);
	const outputFilepath = parsed.dir + "/" + parsed.name + ".result";
	await Deno.writeTextFile(outputFilepath, output);
	Reporter.info(`Wrote output to ${toFileUrl(outputFilepath).href}`);
}

// Copy output to the clipboard
async function copy(output: string) {
	await clipboard.writeText(output);
	Reporter.info("Copied output to clipboard");
}