import { createRuntimeMessage } from "@lib/service/utils/runtime-message";
import { runtime } from "webextension-polyfill";
import browser from "webextension-polyfill";

browser.contextMenus.create({
    id: "add-keyword",
    title: "キーワードを追加する",
    contexts: ["selection"],
});

browser.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "add-keyword") {
        if (!info.selectionText) return;
        const msg = createRuntimeMessage({
            recipient: "repository",
            type: "requestExtractSelectedText",
            payload: info.selectionText,
        });
        runtime.sendMessage(msg);
    }
});
