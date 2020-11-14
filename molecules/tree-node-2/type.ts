// eslint-disable-next-line import/no-cycle
import { TreeRootNode } from '@/components/organisms/tree/type';

export interface ClassNames<T=any> {
    (node: TreeNode<T>): {[name: string]: boolean};
}

export interface TreeNodeMutableData<T=any> {
    data?: T;
    children?: T[]|null;
    expanded?: boolean;
    selected?: boolean;
    loading?: boolean;
}

export interface NodeFormatter<T=any> {
    (node: TreeNode<T>): Promise<void>|void;
}

export interface ValueFormatter<T=any> {
    (node: TreeNode<T>): any;
}

export interface Predicate<T=any> {
    (node: TreeNode<T>): boolean;
}

export interface TreeNodeFunctions<T=any> {
    setData<T>(data: T): void;
    setSelected<T>(value: boolean): void;
    setLoading<T>(value: boolean): void;
    setExpanded<T>(value: boolean): void;
    setChildren<T>(children: T[]|null): void;
    appendChild(data: T): void;
    deleteChild<T>(node: TreeNode<T>): void;
    findChildNodes<T>(predicate: Predicate<T>, recursive?: boolean): TreeNode[];
}


export interface TreeNode<T=any> extends TreeNodeFunctions<T> {
    nodeId: string|number;
    index: number;
    level: number;
    parent: TreeNode<T>|TreeRootNode<T>|null;
    children: T[]|null;
    childNodes: TreeNode<T>[];
    data: T;
    value: any;
    expanded?: boolean;
    selected?: boolean;
    loading?: boolean;
    element: HTMLElement|null;
    matched: TreeNode<T>[];
}

export type TreeData<T> = T[]

export interface DefaultTreeNode<T=any> extends TreeNodeProps {
    data: TreeData<T>;
    expanded: boolean;
    selected: boolean;
    loading: boolean;
}

export interface TreeNodeProps<T=any> {
    padSize?: number;
    padUnit?: string;
    toggleSize?: string;
    disableToggle?: boolean;
    classNames?: ClassNames<T>;
    idKey?: string|number;
    valueFormatter?: ValueFormatter<T>;
    nodeFormatter?: NodeFormatter<T>;

    index?: number;
    level?: number;
    parent?: TreeNode<T>|TreeRootNode<T>;
    data?: T;
}


export interface TreeNodeEventHandler<T=any> {
    (node: TreeNode<T>, e?: any, ...args: any[]): Promise<void>|void;
}

/* tree node events: belows & '<native event names> + '-' + <row|node|toggle>' */
export interface TreeNodeEventListeners<T=any> {
    init: TreeNodeEventHandler<T>;
    update: TreeNodeEventHandler<T>;
    'update-selected': TreeNodeEventHandler<T>;
}
