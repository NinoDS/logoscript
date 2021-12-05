import { toFileUrl } from "https://deno.land/std@0.117.0/path/mod.ts";
import * as colors from "https://deno.land/std/fmt/colors.ts";
import { Token } from "./token.ts";

class CompileError extends Error {

	constructor(error: string, token: Token, source: string, file: string) {
		const line: string = source.split("\n")[token.line - 1];
		const fileUrl: string = toFileUrl(Deno.realPathSync(file)).href;
		const message = colors.red(colors.bold('Error: ') + error) + ` at line ${token.line}, column ${token.column}` + '\n'
		+ line.replace(token.lexeme, colors.red(colors.bold(token.lexeme))) + `\n`
		+ ' '.repeat(token.column - 1) + colors.red('^'.repeat(token.lexeme.length)) + '\n'
		+ `at ${fileUrl}:${token.line}:${token.column}`;

		super(message);
	}

	public static throw(error: string, token: Token, source: string, file: string) {
		throw new CompileError(error, token, source, file);
	}

	public print() {
		console.error(this.message);
	}
}

export default CompileError;