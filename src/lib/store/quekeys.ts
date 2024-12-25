import { Quekey } from "../types";
import { APIOptions } from "./api"

const LS_QUEKEYS = "iLSB_Quekeys"

const options: APIOptions<Quekey> = {
  all() {
    const json = localStorage.getItem(LS_QUEKEYS);
    if (json === null) {
      throw new Error("Quekeys is not defined in LocalStorage.");
    }
    const quekeys = JSON.parse(json) as Quekey[];
    return quekeys;
  },

  get(id) {
    const allQuekeys = this.all();
    const quekey = allQuekeys.find(quekey => quekey.id === id);
    if (quekey === undefined) {
      throw new Error(`Quekey id: ${id} is not defined.`);
    }
    return quekey;
  },

  insert(quekey) {
    const oldQuekeys = this.all();
    const newQuekeys = [...oldQuekeys, quekey];
    const json = JSON.stringify(newQuekeys);
    localStorage.setItem(LS_QUEKEYS, json);
  },

  remove(id) {
    const quekeys = this.all();
    const index = quekeys.findIndex(quekey => quekey.id === id);
    quekeys.splice(index, 1);
  },
  
  update(id, key, value) {
    throw new Error("Unimplemented!")
  },
};

export default options;
