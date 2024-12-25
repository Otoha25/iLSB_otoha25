type TreeConvertable = {
    parentId: string
};

type Tree<T extends TreeConvertable> = T & {
    children: T
}


