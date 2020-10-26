type ClassNames = (node: TreeItem) => {[name: string]: boolean};

export interface NodeState {
    expanded: boolean;
    selected: boolean;
    loading: boolean;
}

export interface TreeNodeProps {
    id?: string;
    level?: number;
    padSize?: number;
    padUnit?: string;
    toggleSize?: string;
    disableToggle?: boolean;
    classNames?: ClassNames;
    state?: NodeState;
}

export interface TreeNode {
    data: any;
    children: TreeNode[] | boolean;
    state: NodeState;
}

export const getBaseNodeState = (): NodeState => ({ expanded: false, selected: false, loading: false });

export const getDefaultNode = (data: any, init?: Partial<TreeNode>): TreeNode => ({
    data,
    children: false,
    state: getBaseNodeState(),
    ...init,
});

export const getTreeItem = (
    key: number, level: number, node: TreeNode, parent: TreeItem|null = null,
): TreeItem => ({
    key,
    level,
    node,
    parent,
});

export interface TreeItem {
    key: number;
    level: number;
    parent: TreeItem|null;
    node: TreeNode;
    el?: HTMLElement;
}
