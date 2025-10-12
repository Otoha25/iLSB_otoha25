import type { Meta, Qkey, Qlink, Segkey } from "@lib/types";

// local-storageのキー
const LS_KEY = {
	CurrentQkeyId: "iLSB_CurrentQkeyId",
	Meta: "iLSB_Meta",
	QkeyList: "iLSB_QuekeyList",
	QlinkList: "iLSB_QuelinkList",
	SegkeyList: "iLSB_SegkeyList",
};

type LSCurrentQkeyId = Qkey["id"];
type LSMeta = Meta;
type LSQkey = Qkey;
type LSQlink = Qlink;
type LSSegkey = Segkey;

/**
 * LocalStorage から，現在キーワードリポジトリに表示中の課題キーワードのIDを取得する．
 * @returns 課題キーワードのID
 */
export function getCurrentQkeyId() {
	const raw = localStorage.getItem(LS_KEY.CurrentQkeyId);
	if (raw === null) return null;

	const data = JSON.parse(raw) as LSCurrentQkeyId;
	return data;
}

/**
 * LocalStorage に，現在キーワードリポジトリに表示中の課題キーワードのIDを格納する．
 * @param lsCurrentQkeyId 課題キーワードのID
 */
export function setCurrentQkeyId(lsCurrentQkeyId: LSCurrentQkeyId) {
	const json = JSON.stringify(lsCurrentQkeyId);
	localStorage.setItem(LS_KEY.CurrentQkeyId, json);
}

/**
 * LocalStorage から，調べ学習に関するメタデータを取得する．
 * @returns 調べ学習のメタデータ
 */
export function getMeta() {
	const raw = localStorage.getItem(LS_KEY.Meta);
	if (raw === null) return null;

	const data = JSON.parse(raw) as LSMeta;
	return data;
}

/**
 * LocalStorage に，調べ学習に関するメタデータを格納する．
 * @param leMeta 調べ学習のメタデータ
 */
export function setMeta(leMeta: LSMeta) {
	const json = JSON.stringify(leMeta);
	localStorage.setItem(LS_KEY.Meta, json);
}

/**
 * LocalStorage から，課題キーワード情報のリストを取得する．
 * @returns 課題キーワードのリスト
 */
export function getQkeyList() {
	const raw = localStorage.getItem(LS_KEY.QkeyList);
	if (raw === null) return null;

	const data = JSON.parse(raw) as LSQkey[];
	return data;
}

/**
 * LocalStorage に，課題キーワード情報のリストを格納する．
 * @param lsQkeyList 課題キーワードのリスト
 */
export function setQkeyList(lsQkeyList: LSQkey[]) {
	const json = JSON.stringify(lsQkeyList);
	localStorage.setItem(LS_KEY.QkeyList, json);
}

/**
 * LocalStorage から，課題キーワードマップのリンク情報のリストを取得する．
 * @returns 課題キーワードマップのリンク情報のリスト
 */
export function getQlinkList() {
	const raw = localStorage.getItem(LS_KEY.QlinkList);
	if (raw === null) return null;

	const data = JSON.parse(raw) as LSQlink[];
	return data;
}

/**
 * LocalStorage に，課題キーワードマップのリンク情報のリストを格納する．
 * @param lsQlinkList 課題キーワードマップのリンク情報のリスト
 */
export function setQlinkList(lsQlinkList: LSQlink[]) {
	const json = JSON.stringify(lsQlinkList);
	localStorage.setItem(LS_KEY.QlinkList, json);
}

/**
 * LocalStorage から，分節化キーワード情報のリストを取得する．
 * @returns 分節化キーワードのリスト
 */
export function getSegkeyList() {
	const raw = localStorage.getItem(LS_KEY.SegkeyList);
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
	localStorage.setItem(LS_KEY.SegkeyList, json);
}

export function existsLocalStorage() {
	return (
		localStorage.getItem(LS_KEY.CurrentQkeyId) !== null ||
		localStorage.getItem(LS_KEY.Meta) !== null ||
		localStorage.getItem(LS_KEY.QkeyList) !== null ||
		localStorage.getItem(LS_KEY.QlinkList) !== null ||
		localStorage.getItem(LS_KEY.SegkeyList) !== null
	);
}

export function clearLocalStorage() {
	localStorage.removeItem(LS_KEY.CurrentQkeyId);
	localStorage.removeItem(LS_KEY.Meta);
	localStorage.removeItem(LS_KEY.QkeyList);
	localStorage.removeItem(LS_KEY.QlinkList);
	localStorage.removeItem(LS_KEY.SegkeyList);
}
