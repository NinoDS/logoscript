import { LogoValue } from "./value.ts";

enum TokenType {
	// Single-character tokens.
	LEFT_PAREN, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE, RIGHT_BRACKET, LEFT_BRACKET,
	COMMA, MINUS, PLUS,  SLASH, STAR,
	NEWLINE,

	// One or two character tokens.
	BANG, BANG_EQUAL,
	EQUAL, EQUAL_EQUAL,
	GREATER, GREATER_EQUAL,
	LESS, LESS_EQUAL,

	// Literals.
	IDENTIFIER, STRING, NUMBER,

	// Keywords.
	AND, CONST, ELSE, FALSE, FUNCTION, FOREACH,
	IF, IN, LET, OR, RETURN, TRUE, WHILE,

	EOF, ILLEGAL,
}

class Token {
	public type: TokenType;
	public lexeme: string;
	public literal?: LogoValue;
	public line: number;
	public column: number;

	constructor(type: TokenType, lexeme: string, line: number, column: number, literal?: LogoValue) {
		this.type = type;
		this.lexeme = lexeme;
		this.literal = literal;
		this.line = line;
		this.column = column;
	}
}

export { TokenType, Token };
