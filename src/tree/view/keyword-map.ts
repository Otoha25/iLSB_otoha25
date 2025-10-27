import { Qkey, Qlink } from "@lib/types";

let cleanupKeywordMapContainer = () => {};
export function drawQuestionTree(qkeys: Qkey[], links: Qlink[], linkModifyingMode: boolean, listeners: {
    onDrop: (e: DragEvent) => void;
    onMouseDown: (e: MouseEvent) => void;
    onMouseMove: (e: MouseEvent) => void;
    onMouseUp: (e: MouseEvent) => void;
    onQkeyClick: (e: MouseEvent) => void;
    onQkeyDoubleClick: (e: MouseEvent) => void;
    onQkeyContextMenu: (e: MouseEvent) => void;
    onQkeyTypeClick: (e: MouseEvent) => void;
    onLinkPropertyClick: (e: MouseEvent) => void;
    onLinkPropertyContextMenu: (e: MouseEvent) => void;
}) {
    const container = document.getElementById("keyword-map");
    if (container === null) throw new Error("Keyword map container not found");

    /*
        Initialize container
    */
    container.innerHTML = "";
    cleanupKeywordMapContainer();

    /*
        Set up listeners
    */

    const onDragOver = (e: DragEvent) => e.preventDefault();
    container.addEventListener("dragover", onDragOver);
    container.addEventListener("drop", listeners.onDrop);
    container.addEventListener("mousedown", listeners.onMouseDown);
    container.addEventListener("mousemove", listeners.onMouseMove);
    container.addEventListener("mouseup", listeners.onMouseUp);

    cleanupKeywordMapContainer = () => {
        container.removeEventListener("dragover", onDragOver);
        container.removeEventListener("drop", listeners.onDrop);
        container.removeEventListener("mousedown", listeners.onMouseDown);
        container.removeEventListener("mousemove", listeners.onMouseMove);
        container.removeEventListener("mouseup", listeners.onMouseUp);
    };

    /*
        Draw elements
    */

    if (linkModifyingMode) {
        container.classList.add("link-modifying-mode");
    } else {
        container.classList.remove("link-modifying-mode");
    }

    for (const qkey of qkeys) {
        const qkeyElem = createQkeyElem(qkey, {
            onClick: listeners.onQkeyClick,
            onDoubleClick: listeners.onQkeyDoubleClick,
            onTypeClick: listeners.onQkeyTypeClick,
            onContextMenu: listeners.onQkeyContextMenu,
        });
        container.appendChild(qkeyElem);
    }
    
    for (const link of links) {
        const parentQkey = qkeys.find(q => q.id === link.parent_qkey_id);
        const childQkey = qkeys.find(q => q.id === link.child_qkey_id);
        if (parentQkey && childQkey) {
            const linkElem = createQlinkElem(link, parentQkey, childQkey, {
                onPropertyClick: listeners.onLinkPropertyClick,
                onPropertyContextMenu: listeners.onLinkPropertyContextMenu,
            });
            container.appendChild(linkElem);
        }
    }

    const ghostLinkElem = createGhostLinkElem();
    container.appendChild(ghostLinkElem);
}

export function repositionKeywordMapElems(qkeys: Qkey[], links: Qlink[]) {
    const container = document.getElementById("keyword-map");
    if (container === null) return;

    for (const qkey of qkeys) {
        const qkeyElem = document.getElementById(qkey.id);
        if (qkeyElem) {
            const { left, top } = calcQkeyElemPosition(qkey.node_x, qkey.node_y);
            qkeyElem.style.left = `${left}px`;
            qkeyElem.style.top = `${top}px`;
        }
    }

    for (const link of links) {
        const linkElem = document.getElementById(link.id);
        const parentQkey = qkeys.find(q => q.id === link.parent_qkey_id);
        const childQkey = qkeys.find(q => q.id === link.child_qkey_id);
        if (!linkElem || !parentQkey || !childQkey) continue;

        const { left, top, length, angle, labelLeft, labelTop } = calcQlinkElemPosition(
            parentQkey.node_x, parentQkey.node_y,
            childQkey.node_x, childQkey.node_y
        );
        
        const linkArrowElem = linkElem?.querySelector<HTMLElement>(".link-arrow");
        if (linkArrowElem) {
            linkArrowElem.style.left = `${left}px`;
            linkArrowElem.style.top = `${top}px`;
            linkArrowElem.style.width = `${length}px`;
            linkArrowElem.style.transform = `rotate(${angle}deg)`;
        }

        const linkLabelElem = linkElem?.querySelector<HTMLElement>(".link-label");
        if (linkLabelElem) {
            linkLabelElem.style.left = `${labelLeft}px`;
            linkLabelElem.style.top = `${labelTop}px`;
        }
    }
}

export function showGhostLinkElem() {
    const ghostLinkElem = document.getElementById("ghost-link");
    if (ghostLinkElem) {
        ghostLinkElem.style.visibility = "visible";
    }
}

export function repositionGhostLinkElem(startX: number, startY: number, endX: number, endY: number) {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const centerX = (startX + endX) / 2;
    const centerY = (startY + endY) / 2;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    const left = centerX - length / 2;
    const top = centerY;
    
    const ghostLinkElem = document.getElementById("ghost-link");
    const arrowElem = ghostLinkElem?.querySelector<HTMLElement>(".link-arrow");
    if (!arrowElem) return;
    
    arrowElem.style.left = `${left}px`;
    arrowElem.style.top = `${top}px`;
    arrowElem.style.width = `${length}px`;
    arrowElem.style.transform = `rotate(${angle}deg)`;
}

const QKEY_ELEM_WIDTH = 180;
const QKEY_ELEM_HEIGHT = 60;
const LINK_LABEL_ELEM_WIDTH = 92;
const LINK_LABEL_ELEM_HEIGHT = 24;

function createQkeyElem(qkey: Qkey, listener: {
  onClick: (e: MouseEvent) => void;
  onDoubleClick: (e: MouseEvent) => void;
  onTypeClick: (e: MouseEvent) => void;
  onContextMenu: (e: MouseEvent) => void;
}) {
    const elem = document.createElement("div");
    elem.setAttribute("id", qkey.id);
    elem.classList.add("qkeyword");
    const { left, top } = calcQkeyElemPosition(qkey.node_x, qkey.node_y);
    elem.innerText = qkey.title;
    elem.style.left = `${left}px`;
    elem.style.top = `${top}px`;
    elem.style.setProperty("--len", qkey.title.length.toString());
    elem.addEventListener("click", listener.onClick);
    elem.addEventListener("dblclick", listener.onDoubleClick);
    elem.addEventListener("contextmenu", listener.onContextMenu);

    const qtypeElem = document.createElement("div");
    qtypeElem.classList.add("qtype-label");
    if (qkey.qtype_name === null) {
        qtypeElem.classList.add("unset");
    } else {
        qtypeElem.classList.add("set");
        qtypeElem.innerText = qkey.qtype_name;
    }
    qtypeElem.addEventListener("click", listener.onTypeClick);
    elem.appendChild(qtypeElem);
    return elem;
}

function calcQkeyElemPosition(centerX: number, centerY: number) {
    const left = centerX - QKEY_ELEM_WIDTH / 2;
    const top = centerY - QKEY_ELEM_HEIGHT / 2;
    return { left, top };
}

function createQlinkElem(link: Qlink, parentQkey: Qkey, childQkey: Qkey, listener: {
    onPropertyClick: (e: MouseEvent) => void;
    onPropertyContextMenu: (e: MouseEvent) => void;
}) {
    const elem = document.createElement("div");
    elem.setAttribute("id", link.id);
    elem.classList.add("link");

    const { left, top, length, angle, labelLeft, labelTop } = calcQlinkElemPosition(
        parentQkey.node_x, parentQkey.node_y,
        childQkey.node_x, childQkey.node_y
    );

    const arrowElem = document.createElement("div");
    arrowElem.classList.add("link-arrow");
    arrowElem.style.left = `${left}px`;
    arrowElem.style.top = `${top}px`;
    arrowElem.style.width = `${length}px`;
    arrowElem.style.transform = `rotate(${angle}deg)`;
    elem.appendChild(arrowElem);

    const labelElem = document.createElement("div");
    labelElem.classList.add("link-label");
    if (link.property_name === null) {
        labelElem.classList.add("unset");
    } else {
        labelElem.classList.add("set");
        labelElem.innerText = link.property_name;
    }
    labelElem.style.left = `${labelLeft}px`;
    labelElem.style.top = `${labelTop}px`;
    labelElem.addEventListener("click", listener.onPropertyClick);
    labelElem.addEventListener("contextmenu", listener.onPropertyContextMenu);
    elem.appendChild(labelElem);

    return elem;
}

function createGhostLinkElem() {
    const elem = document.createElement("div");
    elem.setAttribute("id", "ghost-link");
    elem.classList.add("link");
    elem.style.visibility = "hidden";

    const arrowElem = document.createElement("div");
    arrowElem.classList.add("link-arrow");
    elem.appendChild(arrowElem);

    return elem;
}

function calcQlinkElemPosition(parentX: number, parentY: number, childX: number, childY: number) {
    const start = getRectEdgeIntersection(parentX, parentY, childX, childY);
    const end = getRectEdgeIntersection(childX, childY, parentX, parentY);

    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    const left = centerX - length / 2;
    const top = centerY;
    const labelLeft = centerX;
    const labelTop = centerY;
    return { left, top, length, angle, labelLeft, labelTop };
}

function getRectEdgeIntersection(
    x1: number, y1: number, x2: number, y2: number
): { x: number, y: number } {
    // Vector from (x1, y1) to (x2, y2)
    const dx = x2 - x1;
    const dy = y2 - y1;
    // Half sizes
    const HW = QKEY_ELEM_WIDTH / 2;
    const HH = QKEY_ELEM_HEIGHT / 2;

    // Normalize direction
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    let scale;
    if (absDx / HW > absDy / HH) {
        scale = HW / absDx;
    } else {
        scale = HH / absDy;
    }

    return {
        x: x1 + dx * scale,
        y: y1 + dy * scale,
    };
}