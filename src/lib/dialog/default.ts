export function confirm(message: string): Promise<boolean> {
	return new Promise((resolve, _reject) => {
		const result = window.confirm(message);
		resolve(result);
	});
}

export function prompt(
	message: string,
	defaultValue?: string,
): Promise<string> {
	return new Promise((resolve, reject) => {
		const result = window.prompt(message, defaultValue);

		if (result !== null) {
			resolve(result);
		} else {
			reject();
		}
	});
}

export function promptForcely(
	message: string,
	defaultValue?: string,
): Promise<string> {
	return new Promise((resolve, _reject) => {
		let result: string | null = null;
		while (result === null) {
			result = window.prompt(message, defaultValue);
		}
		resolve(result);
	});
}
