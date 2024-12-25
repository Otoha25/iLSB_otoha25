// segkey.ts
import type { Segkey } from "@lib/types";
import type { ListStoreAPI } from "./api";
import { getSegkeyList, setSegkeyList } from "./local-storage";

const options: ListStoreAPI<Segkey> = {
	all() {
		const segkeys = getSegkeyList();
		if (segkeys === null) {
			throw new Error("Segkeys is not defined in LocalStorage.");
		}
		return segkeys;
	},

	get(id) {
		const segkeys = this.all();
		const segkey = segkeys.find((segkey) => segkey.id === id);
		if (segkey === undefined) {
			throw new Error(`Segkey id: ${id} is not defined.`);
		}
		return segkey;
	},

	create(partial_segkey) {
		const id = crypto.randomUUID();
		const segkey = { ...partial_segkey, id };
		this.insert(segkey);
		return segkey;
	},

	insert(segkey) {
		const oldSegkeys = this.all();
		const newSegkeys = [...oldSegkeys, segkey];
		setSegkeyList(newSegkeys);
		return newSegkeys;
	},

	remove(id) {
		const segkeys = this.all();
		const index = segkeys.findIndex((segkey) => segkey.id === id);
		if (index !== -1) {
			segkeys.splice(index, 1);
		}
		setSegkeyList(segkeys);
		return segkeys;
	},

	update(id, key, value) {
		const segkeys = this.all();
		const newSegkeys = segkeys.map((segkey) => {
			if (segkey.id === id) {
				segkey[key] = value;
			}
			return segkey;
		});
		setSegkeyList(newSegkeys);
		return newSegkeys;
	},
};

export default options;
