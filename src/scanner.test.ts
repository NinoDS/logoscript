import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import Scanner from "./scanner.ts";
import { Token, TokenType } from "./token.ts";
import {LogoValue} from "./value.ts";


Deno.test("identifier", () => {
  const scanner = new Scanner("foo");
  assertEquals(scanner.scanTokens()[0] , new Token(TokenType.IDENTIFIER, "foo", 1));
});

Deno.test("number", () => {
  const scanner = new Scanner("42");
  assertEquals(scanner.scanTokens()[0] , new Token(TokenType.NUMBER, "42", 1, new LogoValue(42)));
});

Deno.test("string", () => {
  const scanner = new Scanner('"foo"');
  assertEquals(scanner.scanTokens()[0] , new Token(TokenType.STRING, "\"foo\"", 1, new LogoValue("foo")));
});

Deno.test("comment", () => {
  const scanner = new Scanner("// foo");
  assertEquals(scanner.scanTokens()[0] , new Token(TokenType.EOF, "", 1));
});

Deno.test("parens", () => {
  const scanner = new Scanner("(foo)");
  assertEquals(scanner.scanTokens()[0] , new Token(TokenType.LEFT_PAREN, "(", 1));
  assertEquals(scanner.scanTokens()[1] , new Token(TokenType.IDENTIFIER, "foo", 1));
  assertEquals(scanner.scanTokens()[2] , new Token(TokenType.RIGHT_PAREN, ")", 1));
  assertEquals(scanner.scanTokens()[3] , new Token(TokenType.EOF, "", 1));
});

Deno.test("punctuation", () => {
  const scanner = new Scanner("()[]{}");
  assertEquals(scanner.scanTokens()[0] , new Token(TokenType.LEFT_PAREN, "(", 1));
  assertEquals(scanner.scanTokens()[1] , new Token(TokenType.RIGHT_PAREN, ")", 1));
  assertEquals(scanner.scanTokens()[2] , new Token(TokenType.LEFT_BRACKET, "[", 1));
  assertEquals(scanner.scanTokens()[3] , new Token(TokenType.RIGHT_BRACKET, "]", 1));
  assertEquals(scanner.scanTokens()[4] , new Token(TokenType.LEFT_BRACE, "{", 1));
  assertEquals(scanner.scanTokens()[5] , new Token(TokenType.RIGHT_BRACE, "}", 1));
  assertEquals(scanner.scanTokens()[6] , new Token(TokenType.EOF, "", 1));
});

Deno.test("operators", () => {
  const scanner = new Scanner("+-*/");
  assertEquals(scanner.scanTokens()[0] , new Token(TokenType.PLUS, "+", 1));
  assertEquals(scanner.scanTokens()[1] , new Token(TokenType.MINUS, "-", 1));
  assertEquals(scanner.scanTokens()[2] , new Token(TokenType.STAR, "*", 1));
  assertEquals(scanner.scanTokens()[3] , new Token(TokenType.SLASH, "/", 1));
  assertEquals(scanner.scanTokens()[4] , new Token(TokenType.EOF, "", 1));
});


Deno.test("keywords", () => {
  const scanner = new Scanner("and const else false function foreach if in let or return true while");
  assertEquals(scanner.scanTokens()[0] , new Token(TokenType.AND, "and", 1));
  assertEquals(scanner.scanTokens()[1] , new Token(TokenType.CONST, "const", 1));
  assertEquals(scanner.scanTokens()[2] , new Token(TokenType.ELSE, "else", 1));
  assertEquals(scanner.scanTokens()[3] , new Token(TokenType.FALSE, "false", 1));
  assertEquals(scanner.scanTokens()[4] , new Token(TokenType.FUNCTION, "function", 1));
  assertEquals(scanner.scanTokens()[5] , new Token(TokenType.FOREACH, "foreach", 1));
  assertEquals(scanner.scanTokens()[6] , new Token(TokenType.IF, "if", 1));
  assertEquals(scanner.scanTokens()[7] , new Token(TokenType.IN, "in", 1));
  assertEquals(scanner.scanTokens()[8] , new Token(TokenType.LET, "let", 1));
  assertEquals(scanner.scanTokens()[9] , new Token(TokenType.OR, "or", 1));
  assertEquals(scanner.scanTokens()[10] , new Token(TokenType.RETURN, "return", 1));
  assertEquals(scanner.scanTokens()[11] , new Token(TokenType.TRUE, "true", 1));
  assertEquals(scanner.scanTokens()[12] , new Token(TokenType.WHILE, "while", 1));
  assertEquals(scanner.scanTokens()[13] , new Token(TokenType.EOF, "", 1));
});

