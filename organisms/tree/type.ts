import {
    ClassNames, DataFormatter, TreeNode, TreeNodeProps,
} from '@/components/molecules/tree-node-2/type';

type DataType<T> = T[]

export interface Fetcher<T=any> {
    (node?: TreeNode<T>): Promise<DataType<T>>;
}

export interface DefaultTreeNode<T=any> extends TreeNodeProps {
    data: DataType<T>;
    expanded: boolean;
    selected: boolean;
    loading: boolean;
}

export interface TreeProps<T=any> {
    padSize?: string;
    toggleSize?: string;
    disableToggle?: boolean;
    classNames?: ClassNames<T>;
    dataFormatter?: DataFormatter<T>;

    idKey?: number|string;
    data?: DataType<T>;
    selectIndex?: number[];
    fetcher?: Fetcher<T>;
    fetchOnToggle?: boolean;
}

export interface TreeFunctions<T=any> {
    fetch(node?: TreeNode<T>): Promise<void>;
}
