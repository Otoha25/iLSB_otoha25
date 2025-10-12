export type ValueStoreAPI<T extends string | number> = {
	get: () => T;
	set: (t: T) => T;
}

export type ItemStoreAPI<T extends {}> = {
	get: () => T;
	init: (t: T) => T;
	update<K extends keyof T>(key: K, value: T[K]): T;
};

export type ListStoreAPI<T extends { id: T["id"] }> = {
	all: () => T[];
	get: (id: T["id"]) => T;
	create: (t: Omit<T, "id">) => T;
	insert: (t: T) => T[];
	update<K extends keyof Omit<T, "id">>(id: T["id"], key: K, value: T[K]): T[];
	remove: (id: T["id"]) => T[];
};
