import type { Qkey } from "@lib/types";
import type { ValueStoreAPI } from "./api";
import { getCurrentQkeyId, setCurrentQkeyId } from "./local-storage";

const option: ValueStoreAPI<Qkey["id"]> = {
  get() {
    const qkeyId = getCurrentQkeyId();
    if (qkeyId === null) {
      throw new Error("CurrentQkeyId is not defined in LocalStorage.");
    }
    return qkeyId;
  },

  set(qkeyId) {
    setCurrentQkeyId(qkeyId);
    return qkeyId;
  },
};

export default option;
