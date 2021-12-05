import * as colors from "https://deno.land/std/fmt/colors.ts";

class Reporter {
	public static panic(message: string): never {
		console.error(colors.bold(colors.red(message)));
		Deno.exit(1);
	}

	public static error(message: string): void {
		console.log(colors.red(colors.bold("Error: ") + message));

	}

	public static warn(message: string): void {
		console.log(colors.yellow(colors.bold("Warning:") + " " + message));
	}

	public static info(message: string): void {
		console.log(colors.blue(message));
	}

	public static success(message: string): void {
		console.log(colors.bold(colors.green(message)));
	}

	public static debug(message: string): void {
		console.log(colors.magenta(message));
	}

	public static log(message: string): void {
		console.log(message);
	}
}

export default Reporter;