import type { MetaData } from "@lib/types";
import type { ItemStoreAPI } from "./api";
import { getMetaData, setMetaData } from "./local-storage";

const option: ItemStoreAPI<MetaData> = {
	get() {
		const metadata = getMetaData();
		if (metadata === null) {
			throw new Error("MetaData is not defined in LocalStorage.");
		}
		return metadata;
	},

	init(metadata) {
		setMetaData(metadata);
		return metadata;
	},

	update(key, value) {
		const metadata = this.get();
		metadata[key] = value;
		setMetaData(metadata);
		return metadata;
	},
};

export default option;
