import Scanner from "./scanner.ts";
import { Token, TokenType } from "./token.ts";
import { LogoValue } from "./value.ts";
import Reporter from "./reporter.ts";
import CompileError from "./compileerror.ts";

class Compiler {
	private readonly tokens: Token[];
	private current: number = 0;
	private constants: Map<string, { value: LogoValue, used: boolean }> = new Map();
	private variables: Map<string, boolean> = new Map();
	private functions: Map<string, boolean> = new Map();
	private flags: Map<string, boolean>;
	private readonly file: string;

	public constructor(private source: string, flags: Map<string, boolean>, file: string) {
		this.tokens = new Scanner(source, file).scanTokens();
		this.flags = flags;
		this.file = file;
	}

	private error(message: string, token: Token): never {
		throw new CompileError(message, token, this.source, this.file);
	}

	private peek(): Token {
		return this.tokens[this.current];
	}

	private next(): Token {
		return this.tokens[this.current++];
	}

	private consume(type: TokenType, message: string): Token {
		if (this.peek().type === type) {
			return this.next();
		}
		this.error(message, this.peek());
	}

	public compile(): string {
		let statements: string = "";
		while (!this.isAtEnd()) {
			statements += this.global();
		}

		if (this.flags.has("debug")) {
			Reporter.debug(`Compiled ${this.tokens.length} tokens.`);
		}

		if (this.flags.has("suppress-warnings")) {
			return statements;
		}

		// Check for unused constants
		for (const [name, { used }] of this.constants) {
			if (!used) {
				Reporter.warn(`Constant \`${name}\` is never used.`);
			}
		}

		// Check for unused variables
		for (const [name, used] of this.variables) {
			if (!used) {
				Reporter.warn(`Variable \`${name}\` is never used.`);
			}
		}

		// Functions can be used from outside,
		// so we don't need to check for unused functions by default.
		if (this.flags.has("check-unused-functions")) {
			// Check for unused functions
			for (const [name, used] of this.functions) {
				if (!used) {
					Reporter.warn(`Function \`${name}\` is never used.`);
				}
			}
		}

		return statements;
	}

	private global(): string {
		if (this.match(TokenType.FUNCTION)) {
			return this.functionDeclaration();
		} else if (this.match(TokenType.CONST)) {
			return this.constDeclaration();
		} else if(this.match(TokenType.NEWLINE)) {
			return "";
		} else {
			this.error("Expected function or const declaration", this.peek());
		}
	}

	private functionDeclaration(): string {
		const name: string = this.consume(TokenType.IDENTIFIER, "Expected function name").lexeme;
		this.consume(TokenType.LEFT_PAREN, "Expected '(' after function name");
		const parameters: string[] = [];
		if (!this.check(TokenType.RIGHT_PAREN)) {
			do {
				parameters.push(this.consume(TokenType.IDENTIFIER, "Expected parameter name").lexeme);
			} while (this.match(TokenType.COMMA));
		}
		this.consume(TokenType.RIGHT_PAREN, "Expected ')' after parameters");
		this.consume(TokenType.LEFT_BRACE, "Expected '{' before function body");
		const body: string = this.block();
		this.functions.set(name, false);
		return `${body.includes("report ") ? "to-report" : "to"} ${name} [${parameters.join(" ")}]\n${body}end\n`;
	}

	private constDeclaration(): string {
		const name: string = this.consume(TokenType.IDENTIFIER, "Expected const name").lexeme;
		this.consume(TokenType.EQUAL, "Expected '=' after const name");
		const value: LogoValue = this.literal();
		this.consume(TokenType.NEWLINE, "Expected newline after const value");
		this.constants.set(name, { value, used: false });
		return "";
	}

	private literal(): LogoValue {
		if (this.match(TokenType.NUMBER, TokenType.STRING)) {
			let literal : LogoValue | undefined = this.previous().literal;
			if (literal === undefined) {
				this.error("Expected literal value", this.previous());
			}
			return literal;
		} else if (this.match(TokenType.TRUE)) {
			return new LogoValue(true);
		} else if (this.match(TokenType.FALSE)) {
			return new LogoValue(false);
		}
		else if(this.match(TokenType.LEFT_BRACKET)) {
			const values: LogoValue[] = [];
			while(!this.check(TokenType.RIGHT_BRACKET)) {
				values.push(this.literal());
				if(this.match(TokenType.RIGHT_BRACKET)) {
					break;
				}
				this.consume(TokenType.COMMA, "Expected ',' after value");
			}
			return new LogoValue(values);
		}
		else {
			this.error("Expected literal", this.peek());
		}
	}

	private block(): string {
		let statements: string = "";
		while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
			statements += this.statement();
		}
		this.consume(TokenType.RIGHT_BRACE, "Expected '}' after block");
		return statements;
	}

	private statement(): string {
		if (this.match(TokenType.FOREACH)) {
			return this.foreachStatement();
		} else if (this.match(TokenType.IF)) {
			return this.ifStatement();
		} else if (this.match(TokenType.RETURN)) {
			return this.returnStatement();
		} else if (this.match(TokenType.WHILE)) {
			return this.whileStatement();
		} else if (this.match(TokenType.NEWLINE)) {
			return "";
		} else if(this.match(TokenType.LET)) {
			return this.declaration();
		} else {
			return this.expressionStatement();
		}
	}

	private declaration(): string {
		const name: string = this.consume(TokenType.IDENTIFIER, "Expected variable name").lexeme;
		this.consume(TokenType.EQUAL, "Expected '=' after variable name");
		const value: string = this.expression();
		this.consume(TokenType.NEWLINE, "Expected newline after variable value");
		this.variables.set(name, false);
		return `let ${name} ${value}\n`;
	}

	private foreachStatement(): string {
		const name: string = this.consume(TokenType.IDENTIFIER, "Expected foreach name").lexeme;
		this.consume(TokenType.IN, "Expected 'in' after foreach name");
		const list: string = this.expression();
		this.consume(TokenType.LEFT_BRACE, "Expected '{' before foreach body");
		const body: string = this.block();
		return `foreach ${list} [${name} ->\n${body}]\n`;
	}

	private ifStatement(): string {
		this.consume(TokenType.LEFT_PAREN, "Expected '(' after if");
		const condition: string = this.expression();
		this.consume(TokenType.RIGHT_PAREN, "Expected ')' after if condition");
		const thenBranch: string = this.block();
		let elseBranch: string = "";
		if (this.match(TokenType.ELSE)) {
			elseBranch = this.block();
		}
		if (elseBranch.length > 0) {
			return `ifelse ${condition} [\n${thenBranch}]\n [\n${elseBranch}]\n`;
		} else {
			return `if ${condition} [\n${thenBranch}]\n`;
		}
	}

	private returnStatement(): string {
		if (this.check(TokenType.NEWLINE)) {
			return "stop\n";
		}
		const value: string = this.expression();
		this.consume(TokenType.NEWLINE, "Expected newline after return");
		return `report ${value}\n`;
	}

	private whileStatement(): string {
		this.consume(TokenType.LEFT_PAREN, "Expected '(' after while");
		const condition: string = this.expression();
		this.consume(TokenType.RIGHT_PAREN, "Expected ')' after while condition");
		const body: string = this.block();
		return `while [${condition}] [\n${body}]\n`;
	}

	private expressionStatement(): string {
		const expression: string = this.expression();
		this.consume(TokenType.NEWLINE, "Expected newline after expression");
		return `${expression}\n`;
	}

	private expression(): string {
		return this.assignment();
	}

	private assignment(): string {
		const expression: string = this.or();
		if (this.match(TokenType.EQUAL)) {
			const equals: Token = this.previous();
			const value: string = this.assignment();
			if (equals.type === TokenType.IDENTIFIER) {
				return `set ${equals.lexeme} ${value}`;
			} else {
				this.error("Invalid assignment target", equals);
			}
		}
		return expression;
	}

	private or(): string {
		let expression: string = this.and();
		while (this.match(TokenType.OR)) {
			const right: string = this.and();
			expression = `${expression} or ${right}`;
		}
		return expression;
	}

	private and(): string {
		let expression: string = this.equality();
		while (this.match(TokenType.AND)) {
			const right: string = this.equality();
			expression = `${expression} or ${right}`;
		}
		return expression;
	}

	private equality(): string {
		let expression: string = this.comparison();
		while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
			const operator: Token = this.previous();
			const right: string = this.comparison();
			if (operator.type === TokenType.BANG_EQUAL) {
				expression = `not ${expression} = ${right}`;
			} else {
				expression = `${expression} = ${right}`;
			}
		}
		return expression;
	}

	private comparison(): string {
		let expression: string = this.addition();
		while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
			const operator: Token = this.previous();
			const right: string = this.addition();
			if (operator.type === TokenType.GREATER) {
				expression = `${expression} > ${right}`;
			} else if (operator.type === TokenType.GREATER_EQUAL) {
				expression = `${expression} >= ${right}`;
			} else if (operator.type === TokenType.LESS) {
				expression = `${expression} < ${right}`;
			} else if (operator.type === TokenType.LESS_EQUAL) {
				expression = `${expression} <= ${right}`;
			}
		}
		return expression;
	}

	private addition(): string {
		let expression: string = this.multiplication();
		while (this.match(TokenType.MINUS, TokenType.PLUS)) {
			const operator: Token = this.previous();
			const right: string = this.multiplication();
			if (operator.type === TokenType.MINUS) {
				expression = `${expression} - ${right}`;
			} else if (operator.type === TokenType.PLUS) {
				expression = `${expression} + ${right}`;
			}
		}
		return expression;
	}

	private multiplication(): string {
		let expression: string = this.unary();
		while (this.match(TokenType.SLASH, TokenType.STAR)) {
			const operator: Token = this.previous();
			const right: string = this.unary();
			if (operator.type === TokenType.SLASH) {
				expression = `${expression} / ${right}`;
			} else if (operator.type === TokenType.STAR) {
				expression = `${expression} * ${right}`;
			}
		}
		return expression;
	}

	private unary(): string {
		if (this.match(TokenType.BANG, TokenType.MINUS)) {
			const operator: Token = this.previous();
			const right: string = this.unary();
			if (operator.type === TokenType.BANG) {
				return `not ${right}`;
			} else if (operator.type === TokenType.MINUS) {
				return `-${right}`;
			}
		}
		return this.call();
	}

	private call(): string {
		let expression: string = this.primary();
		while (true) {
			if (this.match(TokenType.LEFT_PAREN)) {
				expression = this.finishCall(expression);
			} else if (this.match(TokenType.LEFT_BRACKET)) {
				expression = this.finishIndex(expression);
			} else {
				break;
			}
		}
		return expression;
	}

	private finishCall(callee: string): string {
		const args: string[] = [];
		if (!this.check(TokenType.RIGHT_PAREN)) {
			do {
				args.push(this.expression());
			} while (this.match(TokenType.COMMA));
		}
		this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.");
		this.functions.set(callee, true);
		return `${callee} ${args.join(' ')}`;
	}

	private finishIndex(callee: string): string {
		const index: string = this.expression();
		this.consume(TokenType.RIGHT_BRACKET, "Expect ']' after index.");
		return `item ${index} ${callee}`;
	}

	private primary(): string {
		if (this.match(TokenType.FALSE)) {
			return 'false';
		} else if (this.match(TokenType.TRUE)) {
			return 'true';
		} else if(this.match(TokenType.NUMBER, TokenType.STRING)){
			let literal: LogoValue | undefined = this.previous().literal;
			// All numbers and string tokens must have a literal value,
			// so this should never throw an error.
			if (literal === undefined) {
				this.error("Expected a literal value.", this.previous());
			}
			return literal.toString();
		} else if (this.match(TokenType.IDENTIFIER)) {
			const lexeme: string = this.previous().lexeme;
			if (this.constants.has(lexeme)) {
				const constant: { value: LogoValue, used: boolean } | undefined = this.constants.get(lexeme);
				// We already know that the constant exists,
				// so this should never throw an error.
				if (constant === undefined) {
					this.error(`Constant '${lexeme}' is not found.`, this.previous());
				}
				constant.used = true;
				return constant.value.toString();
			} else {
				this.variables.set(lexeme, true);
				return lexeme;
			}
		} else if (this.match(TokenType.LEFT_PAREN)) {
			const expression: string = this.expression();
			this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
			return `(${expression})`;
		} else if (this.match(TokenType.LEFT_BRACKET)) {
			const elements: string[] = [];
			if (!this.check(TokenType.RIGHT_BRACKET)) {
				do {
					elements.push(this.expression());
				} while (this.match(TokenType.COMMA));
			}
			this.consume(TokenType.RIGHT_BRACKET, "Expect ']' after elements.");
			return `( list ${elements.join(' ')} )`;
		} else {
			this.error("Expect expression.", this.peek());
		}
	}

	private check(...types: TokenType[]): boolean {
		return types.some(type => this.checkType(type));
	}

	private checkType(type: TokenType): boolean {
		return this.peek().type === type;
	}

	private match(...types: TokenType[]): boolean {
		return types.some(type => this.matchType(type));
	}

	private matchType(type: TokenType): boolean {
		if (this.checkType(type)) {
			this.advance();
			return true;
		}
		return false;
	}

	private advance(): void {
		if (!this.isAtEnd()) {
			this.current++;
		}
	}

	private isAtEnd(): boolean {
		return this.peek().type === TokenType.EOF;
	}

	private previous(): Token {
		return this.tokens[this.current - 1];
	}
}

export default Compiler;