export const Class = {
  Keyword: "keyword",
  Keyword_Parent: "parent",
  KeywordName: "keyword-name",
  KeywordChildren: "keyword-children",
}

export const DataTransferFormat = {
  DraggingSegkeyId: "application/dragging-segkey-id",
}

export const createDivElem = (options: {
  id?: string;
  classes?: string[];
  styles?: Record<string, string>;
  onClick?: (e: MouseEvent) => void;
  onContextMenu?: (e: MouseEvent) => void;
  onDragStart?: (e: DragEvent) => void;
  onDragEnd?: (e: DragEvent) => void;
  onDrop?: (e: DragEvent) => void;
} = {}) => {
  const div = document.createElement("div");
  if (options.classes) {
    div.classList.add(...options.classes);
  }
  if (options.id) {
    div.id = options.id;
  }
  if (options.styles) {
    Object.entries(options.styles).forEach(([key, value]) => {
      div.style.setProperty(key, value);
    });
  }
  return div;
};
