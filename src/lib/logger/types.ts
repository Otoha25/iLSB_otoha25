type Log = {
	id: `${string}-${string}-${string}-${string}-${string}`;
	date: number; // Date 型だと JSON でパースできないため，number 型を使用
	level: "INFO" | "WARN" | "ERROR" | "FATAL";
	event: string;
	message: string;
};
