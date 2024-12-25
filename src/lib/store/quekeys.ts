import type { Quekey } from "@lib/types";
import type { ListStoreAPI } from "./api";
import { getQuekeyList, setQuekeyList } from "./local-storage";

const options: ListStoreAPI<Quekey> = {
	all() {
		const quekeys = getQuekeyList();
		if (quekeys === null) {
			throw new Error("Quekeys is not defined in LocalStorage.");
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
		setQuekeyList(newQuekeys);
		return newQuekeys;
	},

	remove(id) {
		const quekeys = this.all();
		const index = quekeys.findIndex((quekey) => quekey.id === id);
		quekeys.splice(index, 1);
		setQuekeyList(quekeys);
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
		setQuekeyList(quekeys);
		return quekeys;
	},
};

export default options;
