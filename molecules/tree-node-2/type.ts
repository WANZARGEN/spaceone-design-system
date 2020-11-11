export interface ClassNames {
    (node: TreeNode): {[name: string]: boolean};
}

export interface DataFormatter<T=any> {
    (node: Omit<TreeNode, 'value'>): string|number;
}

export interface TreeNode {
    nodeKey: string|number;
    level: number;
    parent: TreeNode|null;
    children: TreeNode[] | boolean;
    data: any;
    value: string|number;
    expanded: boolean;
    selected: boolean;
    loading: boolean;
    element: HTMLElement|null;
}

export interface TreeNodeProps {
    padSize?: number;
    padUnit?: string;
    toggleSize?: string;
    disableToggle?: boolean;
    classNames?: ClassNames;
    dataFormatter?: DataFormatter;

    nodeKey?: string|number;
    level?: number;
    parent?: TreeNode|null;
    children?: TreeNode[] | boolean;
    data?: any;
    expanded?: boolean;
    selected?: boolean;
    loading?: boolean;
}

export type TreeNodeEventListenerArgs = [TreeNode, TreeNode[], GlobalEventHandlersEventMap[keyof GlobalEventHandlersEventMap]?]

export const getDefaultNode = (data: any, init?: TreeNodeProps): TreeNodeProps => ({
    data,
    children: false,
    expanded: false,
    selected: false,
    loading: false,
    ...init,
});
