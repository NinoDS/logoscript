enum LogoValueType {
	NUMBER,
	STRING,
	BOOLEAN,
	LIST,
}

class LogoValue {
	public type: LogoValueType;
	public value: number | string | boolean | LogoValue[];
	public constructor(value: number | string | boolean | LogoValue[]) {
		if (typeof value === "number") {
			this.type = LogoValueType.NUMBER;
		} else if (typeof value === "string") {
			this.type = LogoValueType.STRING;
		} else if (typeof value === "boolean") {
			this.type = LogoValueType.BOOLEAN;
		} else if (value instanceof Array) {
			this.type = LogoValueType.LIST;
		} else {
			throw new Error("Invalid value type");
		}
		this.value = value;
	}

	public toString(): string {
		if (this.type === LogoValueType.NUMBER) {
			return this.value.toString();
		} else if (this.type === LogoValueType.STRING) {
			return `"${this.value}"`;
		} else if (this.type === LogoValueType.BOOLEAN) {
			return this.value.toString();
		} else if (this.type === LogoValueType.LIST) {
			return `( list ${(this.value as LogoValue[]).map((v) => v.toString()).join(" ")} )`;
		} else {
			throw new Error("Unknown type");
		}
	}
}

export { LogoValue, LogoValueType };