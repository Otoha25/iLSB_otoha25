export type APIOptions<T extends { id: T["id"] }> = {
  all: () => T[];
  get: (id: T["id"]) => T;
  insert: (t: T) => void;
  update<K extends keyof Omit<T, "id">>(id: T["id"], key: K, value: T[K]): void;
  remove: (id: T["id"]) => void;
}
