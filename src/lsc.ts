import Compiler from "./compiler.ts";
import Reporter from "./reporter.ts";
import { toFileUrl, parse } from "https://deno.land/std@0.117.0/path/mod.ts";
import clipboard from "https://deno.land/x/clipboard@v0.0.2/mod.ts";
import CompileError from "./compileerror.ts";

// Deno flags: --allow-run --allow-read --allow-write

const usage: string = `
Usage:
  lsc <file> [options]
  
Options:
	--copy                      Copy the result to the clipboard
	--save                      Save the result to a file
	--suppress-warnings         Suppress warnings
	--debug                     Enable debug mode
	--help                      Show this help
`

let flags: Map<string, boolean> = new Map();

const args = Deno.args.filter(arg => {
	if (arg.startsWith("--")) {
		flags.set(arg.substring(2), true);
		return false;
	}
	return true;
});

if (flags.has("help")) {
	Reporter.info(usage);
	Deno.exit(0);
}

if (args.length !== 1) {
	Reporter.panic(usage);
}

const filepath: string = Deno.realPathSync(args[0]);
const source: string = Deno.readTextFileSync(filepath);

try {
	Reporter.info(`Compiling ${toFileUrl(filepath).href} ...`);
	const compiler = new Compiler(source, flags, filepath);
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
	if (error instanceof CompileError) {
		error.print();
		Deno.exit(1);
	} else {
		console.error(error);
	}
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