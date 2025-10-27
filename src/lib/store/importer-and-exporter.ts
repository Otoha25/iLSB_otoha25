import { Meta, Qkey, Qlink, Segkey } from "@lib/types";
import { getCurrentQkeyId, getMeta, getQkeyList, getQlinkList, getSegkeyList, setCurrentQkeyId, setMeta, setQkeyList, setQlinkList, setSegkeyList } from "./local-storage";

export function exportLocalStorageData() {
  const currentQkeyId = getCurrentQkeyId();
  const meta = getMeta();
  const qkeys = getQkeyList();
  const qlinks = getQlinkList();
  const segkeys = getSegkeyList();
  
  if (!currentQkeyId || !meta || !qkeys || !qlinks || !segkeys) {
    return null;
  }

  return {
    iLSBVersion: "Std-25.0.0",
    currentQkeyId,
    meta,
    qkeys,
    qlinks,
    segkeys,
  };
}

export function importLocalStorageData(data: {
  currentQkeyId: Qkey["id"];
  meta: Meta;
  qkeys: Qkey[];
  qlinks: Qlink[];
  segkeys: Segkey[];
}) {
  setCurrentQkeyId(data.currentQkeyId);
  setMeta(data.meta);
  setQkeyList(data.qkeys);
  setQlinkList(data.qlinks);
  setSegkeyList(data.segkeys);
}
