import { runtime } from "webextension-polyfill";

function sendSelectedText() {
    const selectedText = window.getSelection()?.toString();

    if (selectedText !== undefined) {
        runtime.sendMessage({
            selection: selectedText,
        });
    }
}

function onMouseUp() {
    sendSelectedText();
}

document.addEventListener("mouseup", onMouseUp);
