import "@lib/view/global.css";
import "./index.css";
import { assignPropertyToQlink, assignQtypeToQkey, expandQkey, fetchKeywordMap, fetchKeywordMapComponentsByQkeyId, getQkey, getQlink, hasChildQkey, isRootQkey, makeQlink, moveQkey, openSearchEnginePage, removeQkey, switchKeywordRepository } from "@lib/service";
import { drawQuestionTree, repositionGhostLinkElem, repositionKeywordMapElems, showGhostLinkElem } from "./view/keyword-map";
import { DataTransferFormat } from "@lib/view/dom";
import { openPropertySelectionBox, openQtypeSelectionBox } from "./view/selection-box";
import { isError } from "@lib/service/utils/result";
import { confirm } from "@lib/view/dialog";
import { showContextMenu } from "@lib/view/context-menu";


document.addEventListener("DOMContentLoaded", () => {
    refresh();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Shift") {
        onLinkModifyingModeTurnOn();
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "Shift") {
        onLinkModifyingModeTurnOff();
    }
});

const linkModifyingModeSwitcher = document.getElementById("link-modifying-mode-switcher") as HTMLInputElement;
linkModifyingModeSwitcher.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    if (target.checked) {
        onLinkModifyingModeTurnOn();
    } else {
        onLinkModifyingModeTurnOff();
    }
});

function refresh() {
    const { qkeys, qlinks } = fetchKeywordMap();
    drawQuestionTree(qkeys, qlinks, linkModifyingMode, {
        onDrop: (e) => {
            const segkeyId = e.dataTransfer?.getData(DataTransferFormat.DraggingSegkeyId);
            if (!segkeyId) return;
            const result = expandQkey(segkeyId, e.pageX, e.pageY);
            if (isError(result) && result.error === "QkeyAlreadyExists") {
                confirm("このキーワードは既に展開されています" , false);
                return;
            }
            refresh();
        },
        onQkeyClick: (e) => {
            const selfId = (e.target as HTMLElement).closest(".qkeyword")?.id;
            if (!selfId) return;
            switchKeywordRepository(selfId);
        },
        onQkeyDoubleClick: (e) => {
            const selfId = (e.target as HTMLElement).closest(".qkeyword")?.id;
            if (!selfId) return;
            openSearchEnginePage(selfId);
        },
        onQkeyContextMenu: (e) => {
            e.preventDefault();
            const selfId = (e.target as HTMLElement).closest(".qkeyword")?.id;
            if (!selfId) return;
            showContextMenu(e.pageX, e.pageY, [
                { label: "キーワードを検索する", action: () => {
                    openSearchEnginePage(selfId);
                }},
                { label: "課題タイプを設定する", action: (e) => {
                    handleQtypeSelection(e.pageX, e.pageY, selfId);
                }},
                { label: "課題キーワードを削除する", action: async () => {
                    await handleQkeyRemove(selfId);
                }},
            ]);
        },
        onMouseDown: (e) => {
            const selfId = (e.target as HTMLElement).closest(".qkeyword")?.id;
            if (!selfId) return;
            if (linkModifyingMode) {
                handleLinkDrawingMouseDown(selfId);
            } else {
                handleQkeyRepositionMouseDown(e.pageX, e.pageY, selfId);
            }
        },
        onMouseMove: (e) => {
            if (linkModifyingMode) {
                handleLinkDrawingMouseMove(e.pageX, e.pageY);
            } else {
                handleQkeyRepositionMouseMove(e.pageX, e.pageY);
            }
        },
        onMouseUp: (e) => {
            if (linkModifyingMode) {
                const selfId = (e.target as HTMLElement).closest(".qkeyword")?.id || null;
                if (!selfId) return;
                handleLinkDrawingMouseUp(selfId);
            } else {
                handleQkeyRepositionMouseUp(e.pageX, e.pageY);
            }
        },
        onQkeyTypeClick: (e) => {
            e.stopPropagation();
            const qkeyId = (e.target as HTMLElement).closest(".qkeyword")!.id;
            handleQtypeSelection(e.pageX, e.pageY, qkeyId);
        },
        onLinkPropertyClick: (e) => {
            const qlinkId = (e.target as HTMLElement).closest(".link")!.id;
            handlePropertySelection(e.pageX, e.pageY, qlinkId);
        },
        onLinkPropertyContextMenu: (e) => {
            e.preventDefault();
            const qlinkId = (e.target as HTMLElement).closest(".link")!.id;
            if (!qlinkId) return;
            showContextMenu(e.pageX, e.pageY, [
                { label: "属性を設定する", action: async (e) => {
                    handlePropertySelection(e.pageX, e.pageY, qlinkId);
                }},
            ]);
        },
    });
}

let linkModifyingMode = false;
function onLinkModifyingModeTurnOn() {
    linkModifyingMode = true;
    linkModifyingModeSwitcher.checked = true;
    refresh();
}

function onLinkModifyingModeTurnOff() {
    linkModifyingMode = false;
    linkModifyingModeSwitcher.checked = false;
    refresh();
}

let draggingQkeyId: string | null = null;
let draggingOffsetX = 0;
let draggingOffsetY = 0;
function handleQkeyRepositionMouseDown(x: number, y: number, qkeyId: string) {
    draggingQkeyId = qkeyId;
    const { qkey } = fetchKeywordMapComponentsByQkeyId(qkeyId);
    draggingOffsetX = x - qkey.node_x;
    draggingOffsetY = y - qkey.node_y;
}

function handleQkeyRepositionMouseMove(x: number, y: number) {
    if (!draggingQkeyId) return;
    const {
        qkey, parentQkeys, child_qkeys, inboundQlinks, outboundQlinks
    } = fetchKeywordMapComponentsByQkeyId(draggingQkeyId);
    qkey.node_x = x - draggingOffsetX;
    qkey.node_y = y - draggingOffsetY;
    const qkeys = [...parentQkeys, qkey, ...child_qkeys];
    const qlinks = [...inboundQlinks, ...outboundQlinks];
    repositionKeywordMapElems(qkeys, qlinks);
}

function handleQkeyRepositionMouseUp(x: number, y: number) {
    if (!draggingQkeyId) return;
    moveQkey(draggingQkeyId, x - draggingOffsetX, y - draggingOffsetY);
    draggingQkeyId = null;
}

let drawingLinkSourceQkeyId: string | null = null;
function handleLinkDrawingMouseDown(targetQkeyId: string) {
    drawingLinkSourceQkeyId = targetQkeyId;
    showGhostLinkElem();
}

function handleLinkDrawingMouseMove(x: number, y: number) {
    if (!drawingLinkSourceQkeyId) return;
    const qkey = getQkey(drawingLinkSourceQkeyId);
    if (!qkey) return;
    const arrowEndOffset = 2;
    repositionGhostLinkElem(qkey.node_x, qkey.node_y, x - arrowEndOffset, y - arrowEndOffset);
}

function handleLinkDrawingMouseUp(targetQkeyId: string) {
    if (!drawingLinkSourceQkeyId) return;
    const result = makeQlink(drawingLinkSourceQkeyId, targetQkeyId);
    if (isError(result)) {
        if (result.error === "ParentChildRelationNotMatch") {
            confirm("展開元が誤っています。\nキーワードを取り出したリポジトリの課題を展開元としてください。", false);
        } else if (result.error === "QlinkAlreadyExists") {
            confirm("このリンクは既に存在しています", false);
        }
    }
    refresh();
    drawingLinkSourceQkeyId = null;
}

let isSelectionBoxOpen = false;
function handleQtypeSelection(x: number, y: number, qkeyId: string) {
    if (isSelectionBoxOpen) return;

    const qkey = getQkey(qkeyId);
    if (!qkey) return;

    isSelectionBoxOpen = true;
    openQtypeSelectionBox(x, y, qkey, {
        onSelect: (qtypeName) => {
            assignQtypeToQkey(qkeyId, qtypeName);
            refresh();
        },
        onClose: () => {
            isSelectionBoxOpen = false;
        }
    });
}

function handlePropertySelection(x: number, y: number, qlinkId: string) {
    if (isSelectionBoxOpen) return;

    const qlink = getQlink(qlinkId);
    if (!qlink) return;
    const parentQkey = getQkey(qlink.parent_qkey_id);
    const childQkey = getQkey(qlink.child_qkey_id);
    if (!parentQkey || !childQkey) return;

    isSelectionBoxOpen = true;
    openPropertySelectionBox(x, y, parentQkey, childQkey, {
        onSelect: (property) => {
            assignPropertyToQlink(qlinkId, property);
            refresh();
        },
        onClose: () => {
            isSelectionBoxOpen = false;
        }
    });
}

async function handleQkeyRemove(selfId: string) {
    const qkey = getQkey(selfId);
    if (!qkey) return;

    const isRoot = isRootQkey(qkey);
    if (isRoot) {
        await confirm("初期課題キーワードは削除できません。", false);
        return;
    }
    const hasChild = hasChildQkey(qkey);
    if (hasChild) {
        await confirm("子の課題キーワードが存在するため削除できません。", false);
        return;
    }

    const confirmed = await confirm(`課題キーワード「${qkey.title}」を削除しますか？`, true);
    if (!confirmed) return;

    const parentQkeyId = qkey.parent_id!;
    const result = removeQkey(selfId);
    if (isError(result)) {
        if (result.error === "RootQkeyCannotBeRemoved") {
            await confirm("初期課題キーワードは削除できません。", false);
        } else if (result.error === "ChildQkeyExists") {
            await confirm("子の課題キーワードが存在するため削除できません。", false);
        }
        return;
    }
    refresh();
    switchKeywordRepository(parentQkeyId);
}