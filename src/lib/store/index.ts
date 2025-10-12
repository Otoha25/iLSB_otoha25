import meta from "./meta";
import qkeys from "./qkeys";
import qlinks from "./qlinks";
import segkeys from "./segkeys";
import currentQkeyId from "./current-qkey-id";
import { clearLocalStorage } from "./local-storage";

export const store = {
  meta,
  qkeys,
  qlinks,
  segkeys,
  currentQkeyId,
  
  clearAll () {
    clearLocalStorage();
  },
};
