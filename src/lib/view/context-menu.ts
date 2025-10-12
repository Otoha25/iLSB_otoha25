const contextMenu = document.getElementById("context-menu") as HTMLDivElement;
if (!contextMenu) throw new Error("Context menu element not found");

export function showContextMenu(
    x: number,
    y: number,
    items: { label: string; action: (e: MouseEvent) => void }[],
    onMenuClose?: () => void
) {
    const onOpen = () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const width = contextMenu.offsetWidth;
        const height = contextMenu.offsetHeight;
        const left = Math.min(x, windowWidth - width);
        const top = Math.min(y, windowHeight - height);

        contextMenu.classList.add("visible");
        contextMenu.style.left = `${left}px`;
        contextMenu.style.top = `${top}px`;

        contextMenu.innerHTML = "";
        items.forEach(item => {
            const menuItem = document.createElement("button");
            menuItem.classList.add("context-menu-item");
            menuItem.innerText = item.label;
            menuItem.addEventListener("click", item.action);
            contextMenu.appendChild(menuItem);
        });
    }

    const onClose = () => {
        contextMenu.classList.remove("visible");
        onMenuClose?.();
    }

    onOpen();
    document.addEventListener("click", onClose, { once: true });
}
