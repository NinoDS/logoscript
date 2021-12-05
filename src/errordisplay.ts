import { toFileUrl } from "https://deno.land/std@0.117.0/path/mod.ts";
import * as colors from "https://deno.land/std/fmt/colors.ts";
import { Token } from "./token.ts";

class ErrorDisplay {
	constructor(private token: Token, private source: string, private error: string, private fileName: string) { }

	public display() {
		const line = this.source.split("\n")[this.token.line - 1];
		const fileUrl = toFileUrl(Deno.realPathSync(this.fileName)).href;
		console.error(colors.red(colors.bold('Error: ') + this.error) + ` at line ${this.token.line}, column ${this.token.column}`);
		console.error(`${line.replace(this.token.lexeme, colors.red(this.token.lexeme))}`);
		console.error(`${' '.repeat(this.token.column - 1)}${colors.red('^'.repeat(this.token.lexeme.length))}`);
		console.error(`${colors.bold('at ')}${fileUrl}:${this.token.line}:${this.token.column}`);
	}
}

export default ErrorDisplay;