// local-storageのキー
const LSKEY_CURRENT_QUEKEY_ID = "iLSBCurrentQKId";
const LSKEY_HEADER = "iLSBHeader";
const LSKEY_QUEKEY_LIST = "iLSBQKList";
const LSKEY_QUELINK_LIST = "iLSBQLinkList";
const LSKEY_SEGKEY_LIST = "iLSBSKList";

export function hasLearningData () {
    let header = localStorage.getItem(LSKEY_HEADER);
    return header != null;
}

export function clearStorage() {
    localStorage.clear()
}

// export function putCurrentQK () {
    
// }
