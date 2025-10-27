import { Tree } from "@lib/service";
import { Segkey } from "@lib/types";

export function drawRepositoryContent(
    currentQkeyTitle: string,
    segkeys: Tree<Segkey>[],
    listener: {
        onSegkeyTitleContextMenu: (e: MouseEvent) => void;
        onSegkeyTitleDragStart: (e: DragEvent) => void;
        onSegkeyDrop: (e: DragEvent) => void;
    }
) {
    const container = document.getElementById("repository");
    if (container === null) return;

    container.innerHTML = "";

    const currentKeywordNameElem = document.getElementById("current-keyword-name");
    if (currentKeywordNameElem) {
        currentKeywordNameElem.innerText = currentQkeyTitle;
    }

    for (const segkey of segkeys) {
        const segkeyElem = createSegkeyElem(
            segkey,
            listener.onSegkeyTitleContextMenu,
            listener.onSegkeyTitleDragStart,
            listener.onSegkeyDrop,
        );
        container.appendChild(segkeyElem);
    }
}

function createSegkeyElem(
    segkey: Tree<Segkey>,
    onTitleContextMenu: (e: MouseEvent) => void,
    onTitleDragStart: (e: DragEvent) => void,
    onDrop: (e: DragEvent) => void,
) {
    const elem = document.createElement("div");
    elem.setAttribute("id", segkey.id);
    elem.setAttribute("class", "keyword");
    elem.addEventListener("dragover", (e) => e.preventDefault());
    elem.addEventListener("drop", onDrop);
    
    const titleElem = document.createElement("div");
    titleElem.setAttribute("class", "keyword-name");
    titleElem.setAttribute("draggable", "true");
    titleElem.style.setProperty("--len", segkey.title.length.toString());
    titleElem.innerText = segkey.title;
    titleElem.addEventListener("dragstart", onTitleDragStart);
    titleElem.addEventListener("contextmenu", onTitleContextMenu);
    elem.appendChild(titleElem);

    if (segkey.children.length > 0) {
        elem.classList.add("parent");
        const childrenContainer = document.createElement("div");
        childrenContainer.setAttribute("class", "keyword-children");
        for (const child of segkey.children) {
            const childElem = createSegkeyElem(child, onTitleContextMenu, onTitleDragStart, onDrop);
            childrenContainer.appendChild(childElem);
        }
        elem.appendChild(childrenContainer);
    }
    
    return elem;
}
