import { store } from "@lib/store";
import { Qkey, Qlink, Segkey } from "@lib/types";
import browser from "webextension-polyfill";
import { convertToTree, Tree } from "./utils/tree-convertion";
import { clearLocalStorage, existsLocalStorage } from "@lib/store/local-storage";
import { createRuntimeMessage } from "./utils/runtime-message";
import { error, Result, success } from "./utils/result";
import { exportLocalStorageData, importLocalStorageData } from "@lib/store/importer-and-exporter";

export { Tree };

export function hasLearningData() {
    const existing = existsLocalStorage();
    return existing;
}

export function startLearning(username: string, root_qkey_title: string) {
    clearLocalStorage();

    const root_qkey = store.qkeys.create({
        parent_id: null,
        segkey_id: null,
        title: root_qkey_title,
        node_x: 150,
        node_y: 150,
        qtype_name: null
    });

    store.meta.init({
        username: username,
        root_qkey_id: root_qkey.id,
        start_date: Date.now(),
        end_date: undefined,
    });

    store.currentQkeyId.set(root_qkey.id);

    return root_qkey;
}

export function resetLearning() {
    store.clearAll();
}

export async function fetchCurrentPageUrl() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) return null;
    return tabs[0].url || null;
}

export function switchKeywordRepository(qkey_id: Qkey["id"]) {
    const qkey = store.qkeys.get(qkey_id);
    if (!qkey) return null;

    store.currentQkeyId.set(qkey_id);

    const msg = createRuntimeMessage({
        recipient: "repository",
        type: "requestRefresh",
    });
    browser.runtime.sendMessage(msg);

    return qkey;
}

export function fetchKeywordRepository() {
    const id = store.currentQkeyId.get();
    if (id === null) {
        throw new Error("No currentQkeyId set in the store.");
    }

    const qkey = store.qkeys.get(id);
    if (!qkey) {
        throw new Error(`Qkey with id ${id} not found.`);
    }

    store.currentQkeyId.set(id);

    const segkeys = store.segkeys.all().filter(segkey => segkey.belonged_qkey_id === id);
    const segkeysAsTree = convertToTree(segkeys);
    return {
        currentQkey: qkey,
        segkeys: segkeysAsTree,
    };
}

export function getSegkey(id: Segkey["id"]) {
    const segkey = store.segkeys.get(id);
    if (!segkey) return null;
    return segkey;
}

export function extractSegkeyFromPage(
    selectedText: string, pageUrl: string, parentSegkeyId: Segkey["id"] | null
): Result<Segkey, 'ExtractionFromGoogleNotAllowed'> {
    const currentQkeyId = store.currentQkeyId.get();
    if (currentQkeyId === null) throw Error("No currentQkeyId set in the store.");

    const extractedFromGoogle = pageUrl?.includes("google.com");
    if (extractedFromGoogle) return error("ExtractionFromGoogleNotAllowed");

    const segkey = store.segkeys.create({
        title: selectedText,
        source_url: pageUrl,
        parent_id: parentSegkeyId,
        belonged_qkey_id: currentQkeyId,
    });

    return success(segkey);
}

export function makeInclusionRelation(
    parent_segkey_id: Segkey["id"],
    child_segkey_id: Segkey["id"]
) {
    const parent_segkey = store.segkeys.get(parent_segkey_id);
    const child_segkey = store.segkeys.get(child_segkey_id);
    if (!parent_segkey || !child_segkey) return null;

    store.segkeys.update(child_segkey_id, "parent_id", parent_segkey_id);
}

export function removeInclusionRelation(segkey_id: Segkey["id"]) {
    const segkey = store.segkeys.get(segkey_id);
    if (!segkey) return null;

    store.segkeys.update(segkey_id, "parent_id", null);
}

export function isSegkeyExpanded(id: Segkey["id"]) {
    const segkey = store.segkeys.get(id);
    if (!segkey) throw new Error("Segkey not found");

    const expandedAsQkey = store.qkeys.all().find(q => q.segkey_id === id);
    return expandedAsQkey !== undefined;
}

export function removeSegkey(id: Segkey["id"]): Result<true, 'AlreadyExpanded'> {
    const segkey = store.segkeys.get(id);
    if (!segkey) throw new Error("Segkey not found");

    const expandedAsQkey = isSegkeyExpanded(id);
    if (expandedAsQkey) return error("AlreadyExpanded");

    const newParentId = segkey.parent_id;
    store.segkeys.all().forEach(segkey => {
        if (segkey.parent_id === id) {
            store.segkeys.update(segkey.id, "parent_id", newParentId);
        }
    });

    store.segkeys.remove(id);
    return success(true);
}

export function modifySegkeyTitle(id: Segkey["id"], newTitle: string): Result<true, 'AlreadyExpanded'> {
    const segkey = store.segkeys.get(id);
    if (!segkey) throw new Error("Segkey not found");

    const expandedAsQkey = isSegkeyExpanded(id);
    if (expandedAsQkey) return error("AlreadyExpanded");

    store.segkeys.update(id, "title", newTitle);
    return success(true);
}

export function openSourceUrl(id: Segkey["id"]) {
    const segkey = store.segkeys.get(id);
    if (!segkey) return null;

    browser.tabs.create({ url: segkey.source_url });
}

export function openKeywordMap() {
    browser.tabs.create({ url: "../tree.html" });
}

export function expandQkey(id: Segkey["id"], x: number, y: number) {
    const segkey = store.segkeys.get(id);
    if (!segkey) throw new Error("Segkey not found");

    const existingQkey = store.qkeys.all().find(q => q.segkey_id === segkey.id);
    if (existingQkey) return error("QkeyAlreadyExists");

    const qkey = store.qkeys.create({
        parent_id: segkey.belonged_qkey_id,
        segkey_id: segkey.id,
        title: segkey.title,
        node_x: x,
        node_y: y,
        qtype_name: null
    });

    return success(qkey);
}

export function fetchKeywordMap () {
    const qkeys = store.qkeys.all();
    const qlinks = store.qlinks.all();
    return { qkeys, qlinks };
}

export function fetchKeywordMapComponentsByQkeyId(qkey_id: Qkey["id"]) {
    const qkey = store.qkeys.get(qkey_id);
    const parentQkeys = store.qkeys.all().filter(q => q.id === qkey?.parent_id);
    const child_qkeys = store.qkeys.all().filter(q => q.parent_id === qkey_id);
    const inboundQlinks = store.qlinks.all().filter(qlink => qlink.child_qkey_id === qkey_id);
    const outboundQlinks = store.qlinks.all().filter(qlink => qlink.parent_qkey_id === qkey_id);

    return {
        qkey,
        parentQkeys,
        child_qkeys,
        inboundQlinks,
        outboundQlinks,
    };
}

export function getQkey(id: Qkey["id"]) {
    const qkey = store.qkeys.get(id);
    if (!qkey) return null;
    return qkey;
}

export function getQlink(id: Qlink["id"]) {
    const qlink = store.qlinks.get(id);
    if (!qlink) return null;
    return qlink;
}

export function isRootQkey(qkey: Qkey) {
    const isRoot = store.meta.get().root_qkey_id === qkey.id;
    return isRoot;
}

export function hasChildQkey(qkey: Qkey) {
    const hasChild = store.qkeys.all().some(q => q.parent_id === qkey.id);
    return hasChild;
}

export function moveQkey(id: Qkey["id"], x: number, y: number) {
    const qkey = store.qkeys.get(id);
    if (!qkey) return null;

    store.qkeys.update(id, "node_x", x);
    store.qkeys.update(id, "node_y", y);
}

export function removeQkey(id: Qkey["id"]): Result<true, 'RootQkeyCannotBeRemoved' | 'ChildQkeyExists'> {
    const qkey = store.qkeys.get(id);
    if (!qkey) throw new Error("Qkey not found");

    if (isRootQkey(qkey)) return error("RootQkeyCannotBeRemoved");
    if (hasChildQkey(qkey)) return error("ChildQkeyExists");

    store.qkeys.remove(id);
    const qlink = store.qlinks.all().find(qlink => (qlink.child_qkey_id === id));
    if (qlink) {
        store.qlinks.remove(qlink.id);
    }

    return success(true);
}

export function makeQlink(
    parent_qkey_id: Qkey["id"],
    child_qkey_id: Qkey["id"]
): Result<Qlink, 'ParentChildRelationNotMatch' | 'QlinkAlreadyExists'> {
    const parent_qkey = store.qkeys.get(parent_qkey_id);
    const child_qkey = store.qkeys.get(child_qkey_id);
    if (!parent_qkey || !child_qkey) throw Error("Qkeys not found");

    if (child_qkey.parent_id !== parent_qkey.id) return error("ParentChildRelationNotMatch");
    
    const existingQlink = store.qlinks.all().find(qlink => (
        qlink.parent_qkey_id === parent_qkey_id &&
        qlink.child_qkey_id === child_qkey_id
    ));
    if (existingQlink) return error("QlinkAlreadyExists");

    const newQlink = store.qlinks.create({
        parent_qkey_id,
        child_qkey_id,
        property_name: null,
    });

    return success(newQlink);
}

export function assignQtypeToQkey(qkey_id: Qkey["id"], qtype_name: string) {
    const qkey = store.qkeys.get(qkey_id);
    if (!qkey) return null;

    store.qkeys.update(qkey_id, "qtype_name", qtype_name);
}

export function assignPropertyToQlink(qlink_id: Qlink["id"], property_name: string) {
    const qlink = store.qlinks.get(qlink_id);
    if (!qlink) return null;

    store.qlinks.update(qlink_id, "property_name", property_name);
}

export function openSearchEnginePage(qkey_id: Qkey["id"]) {
    const qkey = store.qkeys.get(qkey_id);
    if (!qkey) return null;

    const query = encodeURIComponent(qkey.title);
    const url = `https://www.google.com/search?q=${query}`;
    browser.tabs.create({ url });
}

export function saveLearningData() {
    const data = exportLocalStorageData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const meta = store.meta.get();
    if (!meta) throw new Error("Meta information is missing.");
    const rootQkey = store.qkeys.get(meta.root_qkey_id);
    if (!rootQkey) throw new Error("Root Qkey not found.");
    const filename = `${rootQkey.title}_${meta.username}.ls.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function loadLearningData() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'application/json');

    input.addEventListener('change', async () => {
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result;
                    if (typeof content === 'string') {
                        const data = JSON.parse(content);
                        importLocalStorageData(data);
                        console.log('Learning data imported successfully.');
                    } else {
                        throw new Error('Failed to read file content.');
                    }
                } catch (err) {
                    console.error(err);
                    throw new Error('Error parsing JSON file.');
                }
            };
            reader.readAsText(file);
        }
    });

    // Trigger the file input dialog
    input.click();
}
