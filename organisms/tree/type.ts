import { ClassNames, DataFormatter, TreeNode } from '@/components/molecules/tree-node-2/type';

export interface Fetcher {
    (node?: TreeNode): Promise<any[]>;
}


export interface TreeProps {
    padSize?: string;
    padUnit?: string;
    toggleSize?: string;
    disableToggle?: boolean;
    classNames?: ClassNames;
    dataFormatter?: DataFormatter;

    data?: any[]|Record<string|number, any>;
    selectIndex?: number[];
    fetcher?: Fetcher;
}
