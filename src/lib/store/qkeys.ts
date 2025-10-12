import type { Qkey } from "@lib/types";
import type { ListStoreAPI } from "./api";
import { getQkeyList, setQkeyList } from "./local-storage";

const options: ListStoreAPI<Qkey> = {
	all() {
		const quekeys = getQkeyList();
		if (quekeys === null) {
			setQkeyList([]);
			return [];
		}
		return quekeys;
	},

	get(id) {
		const quekeys = this.all();
		const quekey = quekeys.find((quekey) => quekey.id === id);
		if (quekey === undefined) {
			throw new Error(`Quekey id: ${id} is not defined.`);
		}
		return quekey;
	},

	create(partial_quekey) {
		const id = crypto.randomUUID();
		const quekey = { ...partial_quekey, id };
		this.insert(quekey);
		return quekey;
	},

	insert(quekey) {
		const oldQuekeys = this.all();
		const newQuekeys = [...oldQuekeys, quekey];
		setQkeyList(newQuekeys);
		return newQuekeys;
	},

	remove(id) {
		const quekeys = this.all();
		const index = quekeys.findIndex((quekey) => quekey.id === id);
		quekeys.splice(index, 1);
		setQkeyList(quekeys);
		return quekeys;
	},

	update(id, key, value) {
		const quekeys = this.all();
		const newQuekeys = quekeys.map((quekey) => {
			if (quekey.id === id) {
				quekey[key] = value;
			}
			return quekey;
		});
		setQkeyList(quekeys);
		return quekeys;
	},
};

export default options;
