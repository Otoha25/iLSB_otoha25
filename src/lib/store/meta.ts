import type { Meta } from "@lib/types";
import type { ItemStoreAPI } from "./api";
import { getMeta, setMeta } from "./local-storage";

const option: ItemStoreAPI<Meta> = {
	get() {
		const meta = getMeta();
		if (meta === null) {
			throw new Error("Meta is not defined in LocalStorage.");
		}
		return meta;
	},

	init(meta) {
		setMeta(meta);
		return meta;
	},

	update(key, value) {
		const meta = this.get();
		meta[key] = value;
		setMeta(meta);
		return meta;
	},
};

export default option;
