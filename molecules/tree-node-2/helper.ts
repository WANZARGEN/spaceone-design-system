import { get } from 'lodash';
import {
    TreeNodeProps, DefaultTreeNode,
} from '@/components/molecules/tree-node-2/type';

// UUID v4 generator in JavaScript (RFC4122 compliant)
export const getUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = Math.random() * 16 | 0;
    // eslint-disable-next-line no-bitwise,no-mixed-operators
    const v = c === 'x' ? r : (r & 3 | 8);
    return v.toString(16);
});


