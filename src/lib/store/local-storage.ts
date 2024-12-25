import type { Header, Quekey, Quelink, Segkey } from "@lib/types";

// local-storageのキー
const LSKey = {
	CURRENT_QUEKEY_ID: "iLSB_CurrentQkeyId",
	METADATA: "iLSB_MetaData",
	QUEKET_LIST: "iLSB_QuekeyList",
	QUELINK_LIST: "iLSB_QuelinkList",
	SEGKEY_LIST: "iLSB_SegkeyList",
};

type LSCurrentQuekeyId = Quekey["id"];
type LSMetaData = Header;
type LSQuekey = Quekey;
type LSQuelink = Quelink;
type LSSegkey = Segkey;

/**
 * LocalStorage から，現在キーワードリポジトリに表示中の課題キーワードのIDを取得する．
 * @returns 課題キーワードのID
 */
export function getCurrentQuekeyId() {
	const raw = localStorage.getItem(LSKey.CURRENT_QUEKEY_ID);
	if (raw === null) return null;

	const data = JSON.parse(raw) as LSCurrentQuekeyId;
	return data;
}

/**
 * LocalStorage に，現在キーワードリポジトリに表示中の課題キーワードのIDを格納する．
 * @param lsCurrentQuekeyId 課題キーワードのID
 */
export function setCurrentQuekeyId(lsCurrentQuekeyId: LSCurrentQuekeyId) {
	const json = JSON.stringify(lsCurrentQuekeyId);
	localStorage.setItem(LSKey.CURRENT_QUEKEY_ID, json);
}

/**
 * LocalStorage から，調べ学習に関するメタデータを取得する．
 * @returns 調べ学習のメタデータ
 */
export function getMetaData() {
	const raw = localStorage.getItem(LSKey.METADATA);
	if (raw === null) return null;

	const data = JSON.parse(raw) as LSMetaData;
	return data;
}

/**
 * LocalStorage に，調べ学習に関するメタデータを格納する．
 * @param lsMetaData 調べ学習のメタデータ
 */
export function setMetaData(lsMetaData: LSMetaData) {
	const json = JSON.stringify(lsMetaData);
	localStorage.setItem(LSKey.METADATA, json);
}

/**
 * LocalStorage から，課題キーワード情報のリストを取得する．
 * @returns 課題キーワードのリスト
 */
export function getQuekeyList() {
	const raw = localStorage.getItem(LSKey.QUEKET_LIST);
	if (raw === null) return null;

	const data = JSON.parse(raw) as LSQuekey[];
	return data;
}

/**
 * LocalStorage に，課題キーワード情報のリストを格納する．
 * @param lsQuekeyList 課題キーワードのリスト
 */
export function setQuekeyList(lsQuekeyList: LSQuekey[]) {
	const json = JSON.stringify(lsQuekeyList);
	localStorage.setItem(LSKey.QUEKET_LIST, json);
}

/**
 * LocalStorage から，課題キーワードマップのリンク情報のリストを取得する．
 * @returns 課題キーワードマップのリンク情報のリスト
 */
export function getQuelinkList() {
	const raw = localStorage.getItem(LSKey.QUELINK_LIST);
	if (raw === null) return null;

	const data = JSON.parse(raw) as LSQuelink[];
	return data;
}

/**
 * LocalStorage に，課題キーワードマップのリンク情報のリストを格納する．
 * @param lsQuekeyList 課題キーワードマップのリンク情報のリスト
 */
export function setQuelinkList(lsQuekeyList: LSQuelink[]) {
	const json = JSON.stringify(lsQuekeyList);
	localStorage.setItem(LSKey.QUELINK_LIST, json);
}

/**
 * LocalStorage から，分節化キーワード情報のリストを取得する．
 * @returns 分節化キーワードのリスト
 */
export function getSegkeyList() {
	const raw = localStorage.getItem(LSKey.SEGKEY_LIST);
	if (raw === null) return null;

	const data = JSON.parse(raw) as LSSegkey[];
	return data;
}

/**
 * LocalStorage に，分節化キーワード情報のリストを格納する．
 * @param lsSegkeyList 分節化キーワードのリスト
 */
export function setSegkeyList(lsSegkeyList: LSSegkey[]) {
	const json = JSON.stringify(lsSegkeyList);
	localStorage.setItem(LSKey.SEGKEY_LIST, json);
}
