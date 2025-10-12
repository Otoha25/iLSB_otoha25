import { Qkey, Qlink } from "@lib/types";
import { getPropertiesByQtype, getQtypes } from "../property-and-qtype";

const containerElem = document.getElementById("selector-container")!;
const containerHeaderElem = document.getElementById("selector-container-header")!;
const containerCloseButton = document.getElementById("selector-close-button")!;
const titleElem = document.getElementById("selector-title")!;
const bodyElem = document.getElementById("selector-body")!;

containerHeaderElem?.addEventListener("mousedown", handleHeaderMouseDown);

function handleHeaderMouseDown(e: MouseEvent) {
    if (!containerElem) throw new Error("Selector container element not found");

    e.preventDefault();
    const startX = e.pageX;
    const startY = e.pageY;
    const origX = containerElem.offsetLeft;
    const origY = containerElem.offsetTop;

    const onMouseMove = (e: MouseEvent) => {
        const deltaX = e.pageX - startX;
        const deltaY = e.pageY - startY;
        containerElem.style.left = `${origX + deltaX}px`;
        containerElem.style.top = `${origY + deltaY}px`;
    };

    const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };
    
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
}

function showSelectionBox(x: number, y: number) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const boxWidth = containerElem.offsetWidth;
    const boxHeight = containerElem.offsetHeight;
    const left = Math.min(x, windowWidth - boxWidth);
    const top = Math.min(y, windowHeight - boxHeight);

    containerElem.classList.add("visible");
    containerElem.style.left = `${left}px`;
    containerElem.style.top = `${top}px`;
}

function hideSelectionBox() {
    containerElem.classList.remove("visible");
}

export function openQtypeSelectionBox(x: number, y: number, qkey: Qkey, listeners: {
    onSelect: (qtypeName: NonNullable<Qkey["qtype_name"]>) => void;
    onClose: () => void;
}) {
    const onQtypeButtonClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const selectedQtypeName = target.getAttribute("data-qtype-name") as Qkey["qtype_name"];
        if (!selectedQtypeName) return;

        listeners.onSelect(selectedQtypeName);
        listeners.onClose();
        hideSelectionBox();
    }

    const onCloseButtonClick = (e: MouseEvent) => {
        listeners.onClose();
        hideSelectionBox();
    };
    
    showSelectionBox(x, y);
    titleElem.innerText = `「${qkey.title}」の課題タイプを選択`;
    bodyElem.innerHTML = "";
    containerCloseButton.addEventListener("click", onCloseButtonClick, { once: true });

    const qtypes = getQtypes();
    for (const group of qtypes) {
        const groupElem = document.createElement("div");
        groupElem.classList.add("selector-group");

        const groupHeaderElem = document.createElement("div");
        groupHeaderElem.classList.add("selector-group-header");
        groupHeaderElem.innerText = group.group_name;
        groupElem.appendChild(groupHeaderElem);

        for (const qtype of group.items) {
            const qtypeElem = document.createElement("button");
            qtypeElem.setAttribute("data-qtype-name", qtype);
            qtypeElem.classList.add("selector-item", "button");
            qtypeElem.innerText = qtype;
            qtypeElem.addEventListener("click", onQtypeButtonClick);
            groupElem.appendChild(qtypeElem);
        }
        bodyElem.appendChild(groupElem);
    }
}

export function openPropertySelectionBox(x: number, y: number, parentQkey: Qkey, childQkey: Qkey, listeners: {
    onSelect: (property: NonNullable<Qlink["property_name"]>) => void;
    onClose: () => void;
}) {
    const onPropertyButtonClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const selectedProperty = target.getAttribute("data-property-name") as Qlink["property_name"];
        if (!selectedProperty) return;

        listeners.onSelect(selectedProperty);
        listeners.onClose();
        hideSelectionBox();
    }

    const onCloseButtonClick = (e: MouseEvent) => {
        listeners.onClose();
        hideSelectionBox();
    };

    showSelectionBox(x, y);
    titleElem.innerText = `「${parentQkey.title}」から「${childQkey.title}」へのリンクの属性を選択`;
    bodyElem.innerHTML = "";
    containerCloseButton.addEventListener("click", onCloseButtonClick, { once: true });

    const properties = getPropertiesByQtype(parentQkey.qtype_name);
    for (const group of properties) {
        const groupElem = document.createElement("div");
        groupElem.classList.add("selector-group");
        
        const groupHeaderElem = document.createElement("div");
        groupHeaderElem.classList.add("selector-group-header");
        groupHeaderElem.innerText = group.group_name;
        groupElem.appendChild(groupHeaderElem);

        for (const property of group.items) {
            const propertyElem = document.createElement("button");
            propertyElem.setAttribute("data-property-name", property);
            propertyElem.classList.add("selector-item", "button");
            propertyElem.innerText = property;
            propertyElem.addEventListener("click", onPropertyButtonClick);
            groupElem.appendChild(propertyElem);
        }
        bodyElem.appendChild(groupElem);
    }
}
