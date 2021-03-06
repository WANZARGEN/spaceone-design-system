<template>
    <div class="p-tree" :class="{drag: !!draggingNode}">
        <p-tree-node key="root"
                     :level="0"
                     :index="0"
                     :pad-size="padSize"
                     :disable-toggle="disableToggle"
                     :select-options="selectOptions"
                     :edit-options="editOptions"
                     :drag-options="dragOptions"
                     :get-default-node="getDefaultNode"
                     :get-class-names="getClassNames"
                     data="root"
                     :children.sync="nodes"
                     expanded
                     @init="onInit"
                     @delete="onDelete"
                     @toggle="onToggle"
                     @fold="onFold"
                     @click-node="onClickNode"
                     @check-select="onCheckSelect"
                     @start-drag="onStartDrag"
                     @add-drag="onAddDrag"
                     @end-drag="onEndDrag"
                     @update-drag="onUpdateDrag"
                     @finish-edit="onFinishEdit"
                     @update-data="onUpdateData"
        >
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope" />
            </template>
        </p-tree-node>
    </div>
</template>

<script lang="ts">
/* eslint-disable no-await-in-loop */
import {
    ComponentRenderProxy, computed, defineComponent, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PTreeNode from '@/data-display/tree/tree-node/PTreeNode.vue';
import {
    DragOptions,
    EditOptions,
    SelectOptions,
    TreeItem, TreeNode,
} from '@/data-display/tree/tree-node/type';
import { makeOptionalProxy } from '@/util/composition-helpers';
import { get } from 'lodash';

const findParentWithLevel = (item: TreeItem, level: number): TreeItem|null => {
    if (!item.parent || item.level < level) return null;
    if (item.level === level) return item;

    return findParentWithLevel(item.parent, level);
};


interface Props {
    padSize?: string;
    disableToggle?: boolean;
    selectOptions?: SelectOptions;
    editOptions?: EditOptions;
    dragOptions?: DragOptions;
    idKey: string|number;
    childrenKey?: string|number;
    selectedNodes?: TreeItem[];
    fetchOnInit?: boolean;
    dataFetcher?: ((item?: TreeItem) => Promise<any[]|boolean>|any[]|boolean);
    nodeFormatter?: (node: TreeNode) => TreeNode;
    getClassNames?: (item: TreeItem) => string|string[]|object;
}
export default defineComponent<Props>({
    name: 'PTree',
    components: { PTreeNode: PTreeNode as any },
    props: {
        padSize: {
            type: String,
            default: undefined,
        },
        disableToggle: {
            type: Boolean,
            default: undefined,
        },
        selectOptions: {
            type: Object,
            default: () => ({}),
        },
        editOptions: {
            type: Object,
            default: () => ({}),
        },
        dragOptions: {
            type: Object,
            default: () => ({}),
        },
        idKey: {
            type: [String, Number],
            required: true,
        },
        childrenKey: {
            type: [String, Number],
            default: '',
        },
        selectedNodes: {
            type: Array,
            default: undefined,
        },
        fetchOnInit: {
            type: Boolean,
            default: false,
        },
        dataFetcher: {
            type: Function,
            default: () => ([]),
        },
        nodeFormatter: {
            type: Function,
            default: undefined,
        },
        getClassNames: {
            type: Function,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const proxyState = reactive({
            selectedNodes: makeOptionalProxy<TreeItem[]>('selectedNodes', vm, []),
        });
        const state = reactive({
            root: null as null|TreeItem,
            nodes: [] as TreeNode[],
            firstSelectedNode: computed<TreeItem>(() => proxyState.selectedNodes[0]),
            draggingNode: null as null|TreeNode,
        });


        const getDefaultNode = (data): TreeNode => {
            let children: any[] = props.childrenKey
                ? get<any[]>(data, props.childrenKey, [])
                : [];
            if (!props.dataFetcher) {
                children = children.map(d => getDefaultNode(d));
            }

            const node = {
                _id: get<string|number>(data, props.idKey, Math.floor(Math.random() * Date.now())),
                data,
                children,
                expanded: false,
                selected: false,
                loading: false,
            };
            if (props.nodeFormatter) return props.nodeFormatter(node);
            return node;
        };

        const getChildrenData = async (item?: TreeItem) => {
            if (!props.dataFetcher) return false;
            let res = props.dataFetcher(item);
            if (res instanceof Promise) res = await res;
            return res;
        };

        const rootFunctions = {
            async findNode<T>(id: string|number, paths: Array<string|number>): Promise<TreeItem<T>|null> {
                if (!state.root) return null;
                let node: TreeItem<T> = state.root;

                for (let i = 0; i < paths.length; i++) {
                    const childId = paths[i];
                    let next: TreeItem<T>|null = node.findChildNode(childId);

                    if (!next) {
                        const children = await getChildrenData(i === 0 ? undefined : node);
                        if (Array.isArray(children)) {
                            await node.setChildren(children);
                            next = node.findChildNode(childId);
                            if (!next) return null;
                        } else return null;
                    }

                    if (i < paths.length - 1) {
                        next.setExpanded(true);
                    }

                    node = next;
                }

                if (node?.level !== 0) return node;
                return null;
            },
        };


        const onInit = async (root: TreeItem) => {
            state.root = { ...root, ...rootFunctions };

            if (props.fetchOnInit && props.dataFetcher) {
                const res = await getChildrenData();
                await root.setChildren(res);
            }

            emit('init', state.root);
        };

        const onToggle = async (item: TreeItem) => {
            if (!props.dataFetcher) {
                item.setExpanded(true);
                return;
            }
            item.setLoading(true);
            const res = await getChildrenData(item);
            item.setChildren(res);
            item.setLoading(false);
            item.setExpanded(true);
        };

        const onFold = (item: TreeItem) => {
            proxyState.selectedNodes.forEach((d, i) => {
                if (item.level < d.level) {
                    const parent = findParentWithLevel(d, item.level);

                    if (parent && parent._id === item._id) {
                        proxyState.selectedNodes.splice(i, 1);
                    }
                }
            });
            item.setExpanded(false);
            item.setChildren(!!item.children);
        };


        const checkSingleSelect = (item: TreeItem, selected) => {
            if (selected) {
                if (state.firstSelectedNode) {
                    if (state.firstSelectedNode._id === item._id) {
                        return;
                    }
                    state.firstSelectedNode.setSelected(false, true);
                }

                proxyState.selectedNodes = [item];
                item.setSelected(true, true);
            } else {
                if (state.firstSelectedNode && state.firstSelectedNode._id === item._id) {
                    state.firstSelectedNode.setSelected(false, true);
                }
                proxyState.selectedNodes = [];
            }
        };

        // TODO: Apply multi select case
        const checkMultiSelect = (item: TreeItem, selected, cb) => {
            if (selected) {
                const selectedIdx = proxyState.selectedNodes.findIndex(d => item._id === d._id);
                if (selectedIdx === -1) {
                    proxyState.selectedNodes.push(item);
                    item.setSelected(true, true);
                }
            } else {
                const selectedIdx = proxyState.selectedNodes.findIndex(d => item._id === d._id);
                if (selectedIdx !== -1) {
                    proxyState.selectedNodes.splice(selectedIdx, 1);
                    item.setSelected(false, true);
                }
            }
        };

        const onCheckSelect = (item: TreeItem, selected) => {
            checkSingleSelect(item, selected);
        };

        const onClickNode = (item: TreeItem) => {
            if (props.selectOptions?.disabled) return;

            const validator = props.selectOptions?.validator;
            if (validator && !validator(item)) return;

            if (state.firstSelectedNode) {
                if (state.firstSelectedNode._id === item._id) {
                    if (!props.editOptions?.disabled && props.editOptions?.editStartValidator) {
                        if (props.editOptions?.editStartValidator(item)) item.startEdit();
                    }
                    return;
                }

                state.firstSelectedNode.setSelected(false, true);
                proxyState.selectedNodes.splice(0, 1);
            }

            item.setSelected(true, true);
            proxyState.selectedNodes.push(item);
        };

        const applyChangesToSelectedNodes = (item: TreeItem) => {
            if (item.selected && state.firstSelectedNode && item._id === state.firstSelectedNode._id) {
                proxyState.selectedNodes = [item];
            }
            // TODO: multi select mode
        };

        const onDelete = (item: TreeItem) => {
            if (item.selected) {
                checkSingleSelect(item, false);
            }

            const parent = item.parent;
            if (parent && Array.isArray(parent.children)) {
                parent.children.splice(item.index, 1);
                if (parent.children.length === 0) parent.setChildren(false);
            } else {
                state.nodes.splice(item.index, 1);
            }

            emit('delete', item.data);
        };


        const onStartDrag = (node: TreeNode) => {
            state.draggingNode = node;
        };

        const onAddDrag = (item: TreeItem) => {
            applyChangesToSelectedNodes(item);
            emit('update-drag', item);
        };

        const onEndDrag = () => {
            state.draggingNode = null;
        };

        const onUpdateDrag = (item: TreeItem) => {
            emit('update-drag', item);
        };

        const onFinishEdit = (item: TreeItem) => {
            applyChangesToSelectedNodes(item);
            emit('finish-edit', item);
        };

        const onUpdateData = (item) => {
            applyChangesToSelectedNodes(item);
            emit('update-data', item);
        };


        return {
            proxyState,
            ...toRefs(state),
            getDefaultNode,
            onInit,
            onDelete,
            onToggle,
            onFold,
            onClickNode,
            onCheckSelect,
            onStartDrag,
            onAddDrag,
            onEndDrag,
            onUpdateDrag,
            onFinishEdit,
            onUpdateData,
        };
    },
});
</script>

<style lang="postcss">
.p-tree {
    &.drag {
        .p-tree-node:not(.ghost) {
            > .tree-row:hover {
                @apply text-black;
                background-color: inherit;
            }
        }
    }
}
</style>
