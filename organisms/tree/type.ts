import {
    ClassNames,
    ValueFormatter,
    DefaultTreeNode,
    TreeData,
    TreeNode,
    TreeNodeEventHandler, NodeFormatter, Predicate,
} from '@/components/molecules/tree-node-2/type';


export interface Fetcher<T=any> {
    (node?: TreeNode<T>): Promise<TreeData<T>>;
}

export interface TreeProps<T=any> {
    padSize?: string;
    toggleSize?: string;
    disableToggle?: boolean;
    classNames?: ClassNames<T>;
    nodeFormatter?: NodeFormatter<T>;
    valueFormatter?: ValueFormatter<T>;
    idKey?: string|number;

    data?: TreeData<T>;
    fetcher?: Fetcher<T>;

    fetchOnToggle?: boolean;
    fetchOnInit?: boolean;
    selectable?: boolean;
    disableMultiSelect?: boolean;
    toggleOnSelect?: boolean;
    selectReleasable?: boolean;
}

export interface TreeFunctions<T=any> {
    fetch(node?: TreeNode<T>): Promise<void>;
    resetSelected(node?: TreeNode<T>): void;
    appendChild(data: T): void;
    deleteChild(node: TreeNode<T>): void;
    findChildNodes<T>(predicate: Predicate<T>, recursive?: boolean): TreeNode[];
}

export interface TreeRootNode<T=any> extends TreeFunctions<T> {
    nodeId: 'root';
    children: T[];
    childNodes: TreeNode<T>[];
    selectedNodes: TreeNode<T>[];
}

/* tree events: belows & '<native event names> + '-' + <row|node|toggle>' */
export interface TreeEventListeners<T=any> {
    init(tree: TreeRootNode<T>, ...args: any[]): Promise<void>|void;
    mounted(tree: TreeRootNode<T>, ...args: any[]): Promise<void>|void;
    select(tree: TreeRootNode<T>, node: TreeNode<T>, selected: boolean, ...args: any[]): Promise<void>|void;
    fetched(tree: TreeRootNode<T>, ...args: any[]): Promise<void>|void;
}
