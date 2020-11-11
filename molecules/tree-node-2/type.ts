export interface ClassNames<T=any> {
    (node: TreeNode<T>): {[name: string]: boolean};
}

export interface DataFormatter<T=any> {
    (node: Omit<TreeNode<T>, 'value'>): string|number;
}

export interface TreeNodeFunctions<T=any> {
    setData<T>(data: T): void;
    setState<T>(name: 'expanded'|'selected'|'loading', value: boolean): void;
    setChildren<T>(children?: T[]): void;
}

export interface TreeNode<T=any> extends TreeNodeFunctions<T> {
    nodeKey: string|number;
    level: number;
    parent: TreeNode<T>|null;
    children: TreeNodeProps<T>[];
    data: T;
    value: string|number;
    expanded: boolean;
    selected: boolean;
    loading: boolean;
    element: HTMLElement|null;
}

export interface TreeNodeProps<T=any> {
    padSize?: number;
    padUnit?: string;
    toggleSize?: string;
    disableToggle?: boolean;
    classNames?: ClassNames<T>;
    dataFormatter?: DataFormatter<T>;
    idKey?: number|string;

    nodeKey?: string|number;
    level?: number;
    parent?: TreeNode<T>|null;
    data?: T;
}


export interface TreeNodeEventHandler<T=any> {
    (node: TreeNode<T>, matched: TreeNode<T>[], e: GlobalEventHandlersEventMap[keyof GlobalEventHandlersEventMap], ...args: any[]): Promise<void>|void;
}
export interface TreeNodeMountEventListener<T=any> {
    (node: TreeNode<T>, matched: TreeNode<T>[], e?: GlobalEventHandlersEventMap[keyof GlobalEventHandlersEventMap]): Promise<void>|void;
}
