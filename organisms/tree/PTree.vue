<template>
    <div class="p-tree">
        <p-tree-node v-for="(node, idx) in data" :key="idx"
                     :pad-size="pad"
                     :pad-unit="unit"
                     :toggle-size="toggleSize"
                     :disable-toggle="disableToggle"
                     :class-names="classNames"
                     :id-key="idKey"
                     :value-formatter="valueFormatter"
                     :node-formatter="nodeFormatter"
                     :index="idx"
                     :data="node"
                     :parent="root"
                     v-on="nodeListeners"
        >
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope" />
            </template>
        </p-tree-node>
    </div>
</template>

<script lang="ts">
/* eslint-disable no-use-before-define */

import PTreeNode from '@/components/molecules/tree-node-2/PTreeNode.vue';
import {
    ComponentRenderProxy, computed, getCurrentInstance, isRef, onMounted, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import {
    DefaultTreeNode,
    TreeNode, TreeNodeEventHandler, TreeNodeEventListeners, TreeNodeProps,
} from '@/components/molecules/tree-node-2/type';
import {
    Fetcher, TreeRootNode, TreeFunctions, TreeProps,
} from '@/components/organisms/tree/type';
import { makeOptionalProxy } from '@/components/util/composition-helpers';
import {
    findIndex, forEach, get, remove, set, find,
} from 'lodash';


export default {
    name: 'PTree',
    components: { PTreeNode },
    props: {
        padSize: {
            type: String,
            default: '1rem',
        },
        toggleSize: {
            type: String,
            default: '1rem',
        },
        disableToggle: {
            type: Boolean,
            default: false,
        },
        classNames: {
            type: Function,
            default: (node: TreeNode) => ({
                basic: true,
            }),
        },
        nodeFormatter: {
            type: Function,
            default: undefined,
        },
        valueFormatter: {
            type: Function,
            default: undefined,
        },
        idKey: {
            type: [Number, String],
            default: undefined,
        },

        data: {
            type: [Array, Object],
            default: undefined,
        },
        fetcher: {
            type: Function,
            default: d => d,
        },
        fetchOnToggle: {
            type: Boolean,
            default: true,
        },
        fetchOnInit: {
            type: Boolean,
            default: true,
        },
        selectable: {
            type: Boolean,
            default: true,
        },
        disableMultiSelect: {
            type: Boolean,
            default: true,
        },
        toggleOnSelect: {
            type: Boolean,
            default: true,
        },
        selectReleasable: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: TreeProps) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        let nodeInitCount = 0;

        const proxyState = reactive({
            data: makeOptionalProxy<any>('data', vm, []),
        });

        // eslint-disable-next-line no-empty-function
        const dummyFunction: any = () => {};

        const state = reactive({
            nodeData: computed<any[]|null>(() => {
                if (Array.isArray(proxyState.data)) return proxyState.data;
                if (proxyState.data === null || proxyState.data === undefined) return null;
                return [proxyState.data];
            }),
            selectedNodes: [] as TreeNode[],
            firstSelectedNode: computed<TreeNode|null>(() => state.selectedNodes[0]),
            pad: computed(() => {
                const size = props.padSize?.match(/\d+/g);
                return size ? Number(size[0]) : 1;
            }),
            unit: computed(() => {
                const unit = props.padSize?.match(/[a-zA-Z]+/g);
                return unit ? unit[0] : 'rem';
            }),
            initiatedNodes: [] as TreeNode[],
            root: computed<TreeNode>(() => ({
                nodeId: 'root',
                index: -1,
                level: -1,
                parent: null,
                children: state.nodeData,
                childNodes: state.initiatedNodes,
                data: undefined,
                value: undefined,
                element: null,
                matched: [],
                selectedNodes: state.selectedNodes,
                fetch,
                resetSelected,
                appendChild,
                deleteChild,
                findChildNodes,
                setData: dummyFunction,
                setSelected: dummyFunction,
                setLoading: dummyFunction,
                setExpanded: dummyFunction,
                setChildren: dummyFunction,
            })),
        });

        const appendChild: TreeFunctions['appendChild'] = (data) => {
            if (proxyState.data) proxyState.data.push(data);
            else proxyState.data = [data];
        };

        const deleteChild: TreeFunctions['deleteChild'] = (node) => {
            if (node.parent) {
                const parent = node.parent;
                parent.deleteChild(node);
            } else {
                remove<TreeNode>(state.initiatedNodes, d => d.index === node?.index);
            }
        };

        const findChildNodes: TreeFunctions['findChildNodes'] = (predicate, recursive) => {
            const res = [] as TreeNode[];
            state.initiatedNodes.forEach((d) => {
                if (predicate(d)) res.push(d);
                if (recursive) res.push(...d.findChildNodes(predicate, true));
            });
            return res;
        };


        const resetSelected: TreeFunctions['resetSelected'] = (node?) => {
            if (node) {
                node.setSelected(false);
                if (node.children) {
                    state.selectedNodes.forEach((d) => {
                        if (d.matched.some(m => node.nodeId === m.nodeId)) node.setSelected(false);
                    });
                }
            } else {
                state.selectedNodes.forEach(d => d.setSelected(false));
            }
        };

        const fetch: TreeFunctions['fetch'] = async (node?: TreeNode): Promise<void> => {
            if (!props.fetcher) return;

            if (node) {
                node.setLoading(true);

                const res = await props.fetcher(node);
                node.setChildren(res.length > 0 ? res : null);

                node.setLoading(false);
            } else {
                proxyState.data = await props.fetcher();
            }

            vm.$emit('fetched', state.root);
        };


        const onClickToggle: TreeNodeEventHandler = async (node, e) => {
            (e as MouseEvent).stopPropagation();

            if (node.expanded) {
                resetSelected(node);
                node.setExpanded(false);
                return;
            }

            node.setExpanded(true);
            if (props.fetchOnToggle) await fetch(node);

            vm.$emit('click-toggle', node, e);
        };

        const emitSelect = (node, selected) => {
            vm.$emit('select', state.root, node, selected);
        };

        const onClickNode: TreeNodeEventHandler = (node, e) => {
            vm.$emit('click-node', node, e);

            if (!props.selectable) return;

            if (props.disableMultiSelect) {
                if (state.firstSelectedNode) {
                    if (state.firstSelectedNode.nodeId === node.nodeId) {
                        if (props.selectReleasable) {
                            node.setSelected(false);
                            emitSelect(node, false);
                        }
                    } else {
                        state.firstSelectedNode.setSelected(false);
                        node.setSelected(true);
                        emitSelect(node, true);
                    }
                } else {
                    node.setSelected(true);
                    emitSelect(node, true);
                }
            } else {
                // TODO: multi select case
            }
        };

        const emitInit = () => {
            vm.$emit('init', state.root);
        };

        const onNodeInit: TreeNodeEventHandler = (node: TreeNode, ...args) => {
            state.initiatedNodes[node.index] = node;
            nodeInitCount += 1;
            if (nodeInitCount === state.nodeData?.length) {
                emitInit();
            }
        };

        const onNodeSelected: TreeNodeEventListeners['update-selected'] = (node) => {
            const idx = findIndex(state.selectedNodes, { nodeId: node.nodeId });
            if (node.selected) {
                if (idx === -1) state.selectedNodes.push(node);
            } else if (idx !== -1) state.selectedNodes.splice(idx, 1);
        };

        const nodeListeners = {
            ...vm.$listeners,
            init: onNodeInit,
            'click-toggle': onClickToggle,
            'click-node': onClickNode,
            'update-selected': onNodeSelected,
        };


        onMounted(() => {
            vm.$emit('mounted', state.root);
        });

        watch(() => state.nodeData, (data) => {
            state.initiatedNodes = [];
            nodeInitCount = 0;
        }, { immediate: true });


        const init = async () => {
            if (props.fetcher && props.fetchOnInit) await fetch();
        };

        /* init */
        (async () => {
            await init();
        })();

        return {
            ...toRefs(state),
            nodeListeners,
            onClickToggle,
            onClickNode,
            fetch,
        };
    },
};
</script>

<style lang="postcss">
.p-tree{

}

</style>
