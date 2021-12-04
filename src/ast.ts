export interface BinaryExpr {
    type: "BinaryExpr";
    operator: string;
    left: Expr;
    right: Expr;
}

export interface GroupingExpr {
    type: "GroupingExpr";
    expression: Expr;
}

export interface CallExpr {
    type: "CallExpr";
    callee: string;
    arguments: Expr[];
}

export interface IndexExpr {
    type: "IndexExpr";
    left: Expr;
    index: Expr;
}

export interface LiteralExpr {
    type: "LiteralExpr";
    value: any;
}

export interface UnaryExpr {
    type: "UnaryExpr";
    operator: string;
    right: Expr;
}

export interface VariableExpr {
    type: "VariableExpr";
    name: string;
}

export interface ListExpr {
    type: "ListExpr";
    elements: Expr[];
}

export type Expr =
    | BinaryExpr
    | GroupingExpr
    | CallExpr
    | IndexExpr
    | LiteralExpr
    | UnaryExpr
    | VariableExpr
    | ListExpr;

export interface ExprStmt {
    type: "ExprStmt";
    expression: Expr;
}

export interface ForeachStmt {
    type: "ForeachStmt";
    variable: string;
    collection: Expr;
    body: Stmt;
}

export interface DeclarationStmt {
    type: "DeclarationStmt";
    name: string;
    value: Expr;
}

export interface AssignStmt {
    type: "AssignStmt";
    name: string;
    value: Expr;
}

export interface IfStmt {
    type: "IfStmt";
    condition: Expr;
    thenBranch: Stmt;
    elseBranch?: Stmt;
}

export interface WhileStmt {
    type: "WhileStmt";
    condition: Expr;
    body: Stmt[];
}

export interface LetStmt {
    type: "LetStmt";
    name: string;
    value: Expr;
}

export interface FunctionStmt {
    type: "FunctionStmt";
    name: string;
    parameters: string[];
    body: Stmt[];
}

export interface ReturnStmt {
    type: "ReturnStmt";
    keyword: string;
    value: Expr;
}

export interface BlockStmt {
    type: "BlockStmt";
    statements: Stmt[];
}

export type Stmt =
    | ExprStmt
    | ForeachStmt
    | DeclarationStmt
    | AssignStmt
    | IfStmt
    | WhileStmt
    | LetStmt
    | FunctionStmt
    | ReturnStmt
    | BlockStmt;
