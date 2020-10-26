import { TreeItem, TreeNode } from '@/components/molecules/tree-node-2/type';

export interface Fetcher {
    (item?: TreeItem): Promise<any[]>;
}

interface MapperFunction<T> {
    (data: any): T;
}

export interface Mapper {
    key?: string|MapperFunction<string>;
    data?: string|number|boolean|object|Array<string|number|boolean|object>|MapperFunction<string>;
}

export interface TreeProps {
    data?: any[]|Record<string, any>;
    selected?: number[];
    fetcher?: Fetcher;
    mapper?: Mapper;
    padSize?: string;
    toggleSize?: string;
    disableToggle?: boolean;
}
