import Compiler from "./compiler.ts";
import Reporter from "./reporter.ts";

if (Deno.args.length !== 0) {
	Reporter.panic("Usage: deno run --allow-read src/index.ts <file>");
	Deno.exit(1);
}

const filename = Deno.args[0];
const source = await Deno.readTextFile(filename);

try {
	const compiler = new Compiler(source);
	const output = compiler.compile();
	Reporter.success("Compiled successfully");
	Reporter.log(output);
} catch (error) {
	Reporter.error(error.message);
	Deno.exit(1);
}