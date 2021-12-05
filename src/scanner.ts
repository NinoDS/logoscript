import {Token, TokenType} from "./token.ts";
import {LogoValue} from "./value.ts";
import CompileError from "./compileerror.ts";

class Scanner {
	private source: string;
	private readonly tokens: Token[];
	private start: number;
	private current: number;
	private line: number;
	private column: number;
	private file: string;

	public constructor(source: string, file: string) {
		this.source = source;
		this.tokens = [];
		this.start = 0;
		this.current = 0;
		this.line = 1;
		this.column = 1;
		this.file = file;
	}

	public scanTokens(): Token[] {
		while (!this.isAtEnd()) {
			// We are at the beginning of the next lexeme.
			this.start = this.current;
			this.scanToken();
		}

		this.tokens.push(new Token(TokenType.EOF, "", this.line, this.column));
		return this.tokens;
	}

	private scanToken(): void {
		const c = this.advance();
		switch (c) {
			case '(': this.addToken(TokenType.LEFT_PAREN); break;
			case ')': this.addToken(TokenType.RIGHT_PAREN); break;
			case '{': this.addToken(TokenType.LEFT_BRACE); break;
			case '}': this.addToken(TokenType.RIGHT_BRACE); break;
			case '[': this.addToken(TokenType.LEFT_BRACKET); break;
			case ']': this.addToken(TokenType.RIGHT_BRACKET); break;
			case ',': this.addToken(TokenType.COMMA); break;
			case '-': this.addToken(TokenType.MINUS); break;
			case '+': this.addToken(TokenType.PLUS); break;
			case '*': this.addToken(TokenType.STAR); break;
			case '!': this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG); break;
			case '=': this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL); break;
			case '<': this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS); break;
			case '>': this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER); break;
			case '/':
				if (this.match('/')) {
					// A comment goes until the end of the line.
					while (this.peek() !== '\n' && !this.isAtEnd()) {
						this.advance();
					}
				} else {
					this.addToken(TokenType.SLASH);
				}
				break;
			case ' ':
			case '\r':
			case '\t':
				// Ignore whitespace.
				break;
			case '"': this.string(); break;
			default:
				if (Scanner.isDigit(c)) {
					this.number();
				} else if (Scanner.isAlpha(c)) {
					this.identifier();
				} else {
					throw new CompileError(`Unexpected character: '${c}'`,
						new Token(TokenType.ILLEGAL, c, this.line, this.column - 1),
						this.source, this.file);
				}
		}
	}

	private identifier(): void {
		while (Scanner.isAlphaNumeric(this.peek())) {
			this.advance();
		}

		// See if the identifier is a reserved word.
		const text = this.source.substring(this.start, this.current);
		const type = TokenType[text.toUpperCase() as keyof typeof TokenType];
		if (type !== undefined) {
			this.addToken(type);
		} else {
			this.addToken(TokenType.IDENTIFIER);
		}
	}

	private number(): void {
		while (Scanner.isDigit(this.peek())) {
			this.advance();
		}

		// Look for a fractional part.
		if (this.peek() === '.' && Scanner.isDigit(this.peekNext())) {
			// Consume the "."
			this.advance();

			while (Scanner.isDigit(this.peek())) {
				this.advance();
			}
		}

		this.addToken(TokenType.NUMBER, new LogoValue(Number(this.source.substring(this.start, this.current))));
	}

	private string(): void {
		while (this.peek() !== '"' && !this.isAtEnd()) {
			if (this.peek() === '\n') {
				this.line++;
			}
			this.advance();
		}

		// Unterminated string.
		if (this.isAtEnd()) {
			throw new Error('Unterminated string.');
		}

		// The closing ".
		this.advance();

		// Trim the surrounding quotes.
		const value = this.source.substring(this.start + 1, this.current - 1);
		this.addToken(TokenType.STRING, new LogoValue(value));
	}

	private peek(): string {
		if (this.isAtEnd()) return '\0';
		return this.source.charAt(this.current);
	}

	private peekNext(): string {
		if (this.current + 1 >= this.source.length) return '\0';
		return this.source.charAt(this.current + 1);
	}

	private static isAlpha(c: string): boolean {
		return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
	}

	private static isAlphaNumeric(c: string): boolean {
		return Scanner.isAlpha(c) || Scanner.isDigit(c);
	}

	private static isDigit(c: string): boolean {
		return c >= '0' && c <= '9';
	}

	private isAtEnd(): boolean {
		return this.current >= this.source.length;
	}

	private advance(): string {
		const c = this.source.charAt(this.current++);
		if (c === '\n') {
			this.line++;
			this.column = 1;
			this.tokens.push(new Token(TokenType.NEWLINE, c, this.line, this.column));
			return this.advance();
		} else {
			this.column++;
		}
		return c;
	}

	private addToken(type: TokenType, literal?: any): void {
		const text = this.source.substring(this.start, this.current);
		this.tokens.push(new Token(type, text, this.line, this.column - text.length, literal));
	}

	private match(expected: string): boolean {
		if (this.isAtEnd()) return false;
		if (this.source.charAt(this.current) !== expected) return false;

		this.current++;
		return true;
	}

}

export default Scanner;