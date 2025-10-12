export type TreeConvertable = {
    id: string;
    parent_id: string | null;
};

export type Tree<T extends TreeConvertable> = T & {
    children: Tree<T>[];
};

export function convertToTree<T extends TreeConvertable>(items: T[]): Tree<T>[] {
    const roots: Tree<T>[] = [];
    const itemMap: Record<string, Tree<T>> = Object.fromEntries(items.map(item => [
        item.id,
        { ...item, children: [] }
    ]));

    for (const item of items) {
        if (item.parent_id) {
            const parent = itemMap[item.parent_id];
            if (parent) {
                parent.children.push(itemMap[item.id]);
            }
        } else {
            roots.push(itemMap[item.id]);
        }
    }

    return roots;
}
