import "@lib/view/global.css";
import "./index.css";
import { confirm, prompt } from "@lib/view/dialog";
import {
    extractSegkeyFromPage,
    fetchCurrentPageUrl,
    fetchKeywordRepository,
    getSegkey,
    hasLearningData,
    isSegkeyExpanded,
    loadLearningData,
    makeInclusionRelation,
    modifySegkeyTitle,
    openKeywordMap,
    openSearchEnginePage,
    openSourceUrl,
    removeInclusionRelation,
    removeSegkey,
    saveLearningData,
    startLearning,
} from "@lib/service";
import { drawRepositoryContent } from "./view";
import { DataTransferFormat } from "@lib/view/dom";
import browser from "webextension-polyfill";
import { RuntimeMessage } from "@lib/service/utils/runtime-message";
import { isError } from "@lib/service/utils/result";
import { showContextMenu } from "@lib/view/context-menu";

document.addEventListener("DOMContentLoaded", async () => {
    const canResume = hasLearningData();
    const continued = canResume && await confirm("前回の続きから始めますか？", true);
    
    if (!continued) {
        const rootQkeyTitle = await prompt("学習する課題を入力", false);
        const username = await prompt("自分の名前を入力", false);
        if (rootQkeyTitle && username) {
            const rootQkey = startLearning(username, rootQkeyTitle);
            openKeywordMap();
            openSearchEnginePage(rootQkey.id);
        }
    }

    refresh();
});

const saveButton = document.getElementById("save-button")!;
saveButton.addEventListener("click", async () => {
    saveLearningData();
});

const loadButton = document.getElementById("load-button")!;
loadButton.addEventListener("click", async () => {
    loadLearningData();
    refresh();
});

document.body.addEventListener("dragover", (e) => {
    e.preventDefault();
});

document.body.addEventListener("drop", async (e) => {
    e.preventDefault();
    const dataTransfer = e.dataTransfer;
    if (!dataTransfer) return;

    await handleDropOfTextOrSegkey(e.dataTransfer, null);
    refresh();
});

browser.runtime.onMessage.addListener(async (message: RuntimeMessage) => {
    if (message.recipient !== "repository") return;
    switch (message.type) {
        case "requestRefresh":
            refresh();
            break;
        case "requestExtractSelectedText":
            const keyword = message.payload;
            console.log("Extracting keyword:", keyword);
            await handleExtractKeyword(keyword, null);
            refresh();
            break;
    }
});

const openQuestionTreeButton = document.getElementById("open-question-tree-button");
openQuestionTreeButton?.addEventListener("click", () => {
    openKeywordMap();
});

function refresh() {
    const { currentQkey, segkeys } = fetchKeywordRepository();
    drawRepositoryContent(currentQkey.title, segkeys, {
        onSegkeyTitleContextMenu: (e) => {
            e.preventDefault();
            const selfId = (e.target as HTMLElement).closest(".keyword")?.id;
            if (!selfId) return;

            e.stopPropagation();
            handleContextMenuOpen(selfId, e.pageX, e.pageY);
        },
        onSegkeyTitleDragStart: (e) => {
            const selfId = (e.target as HTMLElement).closest(".keyword")?.id;
            const dataTransfer = e.dataTransfer;
            if (!selfId || !dataTransfer) return;

            handleSegkeyDragStart(dataTransfer, selfId);
        },
        onSegkeyDrop: async (e) => {
            e.preventDefault();
            const selfId = (e.target as HTMLElement).closest(".keyword")?.id;
            const dataTransfer = e.dataTransfer;
            if (!selfId || !dataTransfer) return;

            e.stopPropagation();
            await handleDropOfTextOrSegkey(dataTransfer, selfId);

            refresh();
        }
    });
}

const handleContextMenuOpen = (targetSegkeyId: string, x: number, y: number) => {
    showContextMenu(x, y, [
        {label: "切り出し元のページに戻る", action: () => openSourceUrl(targetSegkeyId) },
        {label: "キーワード名を変更", action: async () => {
            const targetSegkey = getSegkey(targetSegkeyId);
            if (!targetSegkey) return;
            if (isSegkeyExpanded(targetSegkeyId)) {
                await confirm("このキーワードは展開済みのため変更できません。", false);
                return;
            }
            const newTitle = await prompt("新しいキーワード名を入力", true, targetSegkey.title);
            if (!newTitle) return;
            modifySegkeyTitle(targetSegkeyId, newTitle);
            refresh();
        }},
        {label: "キーワードを削除", action: async () => {
            if (isSegkeyExpanded(targetSegkeyId)) {
                await confirm("このキーワードは展開済みのため削除できません。", false);
                return;
            }
            const confirmed = await confirm("このキーワードを削除しますか？", true);
            if (!confirmed) return;
            removeSegkey(targetSegkeyId);
            refresh();
        }},
    ]);
};

const handleSegkeyDragStart = (targetDataTransferRef: DataTransfer, targetSegkeyId: string) => {
    targetDataTransferRef.setData(DataTransferFormat.DraggingSegkeyId, targetSegkeyId);
}

const handleDropOfTextOrSegkey = async (dataTransfer: DataTransfer, targetSegkeyId: string | null) => {
    const extractedKeyword = dataTransfer.getData("text/plain");
    const draggedId = dataTransfer.getData(DataTransferFormat.DraggingSegkeyId);
    if (extractedKeyword) {
        await handleExtractKeyword(extractedKeyword, targetSegkeyId);
    } else if (draggedId) {
        if (targetSegkeyId && targetSegkeyId !== draggedId) {
            makeInclusionRelation(targetSegkeyId, draggedId);
        } else if (!targetSegkeyId) {
            removeInclusionRelation(draggedId);
        }
    }
    refresh();
}

const handleExtractKeyword = async (keyword: string, targetSegkeyId: string | null) => {
    const currentPageUrl = await fetchCurrentPageUrl();
    const result = extractSegkeyFromPage(keyword, currentPageUrl || "", targetSegkeyId);
    if (isError(result) && result.error === "ExtractionFromGoogleNotAllowed") {
        confirm("Googleの検索結果からは分節化できません", false);
    }
}
