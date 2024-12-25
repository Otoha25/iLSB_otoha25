// quelink.ts
import type { Quelink } from "@lib/types";
import type { ListStoreAPI } from "./api";
import { getQuelinkList, setQuelinkList } from "./local-storage";

const options: ListStoreAPI<Quelink> = {
	all() {
		const quelinks = getQuelinkList();
		if (quelinks === null) {
			throw new Error("Quelinks is not defined in LocalStorage.");
		}
		return quelinks;
	},

	get(id) {
		const quelinks = this.all();
		const quelink = quelinks.find((quelink) => quelink.id === id);
		if (quelink === undefined) {
			throw new Error(`Quelink id: ${id} is not defined.`);
		}
		return quelink;
	},

	create(partial_quelink) {
		const id = crypto.randomUUID();
		const quelink = { ...partial_quelink, id };
		this.insert(quelink);
		return quelink;
	},

	insert(quelink) {
		const oldQuelinks = this.all();
		const newQuelinks = [...oldQuelinks, quelink];
		setQuelinkList(newQuelinks);
		return newQuelinks;
	},

	remove(id) {
		const quelinks = this.all();
		const index = quelinks.findIndex((quelink) => quelink.id === id);
		if (index !== -1) {
			quelinks.splice(index, 1);
		}
		setQuelinkList(quelinks);
		return quelinks;
	},

	update(id, key, value) {
		const quelinks = this.all();
		const newQuelinks = quelinks.map((quelink) => {
			if (quelink.id === id) {
				quelink[key] = value;
			}
			return quelink;
		});
		setQuelinkList(newQuelinks);
		return newQuelinks;
	},
};

export default options;
