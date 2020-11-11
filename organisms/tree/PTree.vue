<template>
    <div class="p-tree">
        <p-tree-node v-for="(node, idx) in nodes" :key="idx" :ref="nodeRefs"
                     :pad-size="pad"
                     :pad-unit="unit"
                     :toggle-size="toggleSize"
                     :disable-toggle="disableToggle"
                     :class-names="classNames"
                     :data-formatter="dataFormatter"

                     :node-key="getNodeKey(node, idx)"
                     :level="0"
                     :parent="null"
                     :data="node.data"
                     :expanded="node.expanded"
                     :selected="node.selected"
                     :loading="node.loading"
                     v-on="nodeListeners"
                     @mounted="onNodeMounted"
        >
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope" />
            </template>
        </p-tree-node>
    </div>
</template>

<script lang="ts">
import PTreeNode from '@/components/molecules/tree-node-2/PTreeNode.vue';
import {
    ComponentRenderProxy, computed, getCurrentInstance, isRef, onMounted, reactive, ref, toRefs,
} from '@vue/composition-api';
import {
    TreeNode, TreeNodeProps,
} from '@/components/molecules/tree-node-2/type';
import {
    DefaultTreeNode, Fetcher, TreeFunctions, TreeProps,
} from '@/components/organisms/tree/type';
import { makeOptionalProxy } from '@/components/util/composition-helpers';
import { findIndex, forEach, get } from 'lodash';

const getDefaultNode = (data: any, init?: TreeNodeProps): DefaultTreeNode => ({
    data,
    expanded: false,
    selected: false,
    loading: false,
    ...init,
});


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
        dataFormatter: {
            type: Function,
            default: undefined,
        },

        data: {
            type: [Array, Object],
            default: undefined,
        },
        selectIndex: {
            type: Array,
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
    },
    setup(props: TreeProps) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const proxyState = reactive({
            data: makeOptionalProxy('data', vm, []),
        });

        const state = reactive({
            nodeRefs: {},
            nodes: computed<DefaultTreeNode[]>(() => {
                if (Array.isArray(proxyState.data)) return proxyState.data.map(d => getDefaultNode(d));
                return [getDefaultNode(proxyState.data)];
            }),
            selectedNodes: makeOptionalProxy('selectIndex', vm, []),
            firstSelectedNode: computed<TreeNode|null>(() => state.selectedNodes[0]),
            pad: computed(() => {
                const size = props.padSize?.match(/\d+/g);
                return size ? Number(size[0]) : 1;
            }),
            unit: computed(() => {
                const unit = props.padSize?.match(/[a-zA-Z]+/g);
                return unit ? unit[0] : 'rem';
            }),
        });

        const getNodeKey = (node: DefaultTreeNode, idx: number) => {
            if (props.idKey) return get(node.data, props.idKey, idx);
            return idx;
        };


        // const deleteNode = ({ parent, nodeKey }: TreeNode) => {
        //     if (parent && Array.isArray(parent.children)) {
        //         parent.children.splice(nodeKey, 1);
        //         if (parent.children.length === 0) parent.children = false;
        //     } else {
        //         state.nodes.splice(nodeKey, 1);
        //     }
        // };


        const resetSelectedState = (node: TreeNode, compare?: TreeNode) => {
            if (compare) {
                if (compare.nodeKey === node.nodeKey) {
                    state.selectedNodes = [node];
                    node.setState('selected', true);
                } else if (compare.parent) resetSelectedState(node, compare.parent);
            } else {
                if (!state.firstSelectedNode) return;
                if (!state.firstSelectedNode.parent) return;
                if (state.firstSelectedNode.level <= node.level) return;
                resetSelectedState(node, state.firstSelectedNode.parent);
            }
        };

        const fetch: TreeFunctions['fetch'] = async (node?: TreeNode): Promise<void> => {
            if (!props.fetcher) return;

            if (node) {
                node.setState('loading', true);

                const res = await props.fetcher(node);
                node.setChildren(res);

                node.setState('loading', false);

            } else {
                proxyState.data = await props.fetcher();
            }

            console.debug('proxyState.data', proxyState.data);
        };


        const onToggleClick = async (node: TreeNode, matched: TreeNode[], e: MouseEvent) => {
            e.stopPropagation();
            if (node.expanded) {
                resetSelectedState(node);
                node.setState('expanded', false);
                return;
            }

            node.setState('expanded', true);
            if (props.fetchOnToggle) await fetch(node);

            vm.$emit('toggle', node, matched, e);
        };

        const onNodeSelect = (node: TreeNode, ...args) => {
            if (state.firstSelectedNode) {
                state.firstSelectedNode.selected = false;
                if (state.firstSelectedNode.nodeKey === node.nodeKey && state.firstSelectedNode.level === node.level) {
                    state.selectedNodes = [];
                    return;
                }
            }
            node.setState('selected', true);
            state.selectedNodes = [node];

            vm.$emit('select', node, ...args);
        };

        const nodeListeners = {
            ...vm.$listeners,
            'toggle-click': onToggleClick,
            'node-select': onNodeSelect,
        };


        const onNodeMounted = (...args) => {
            vm.$emit('node-mounted', ...args);
        };


        onMounted(() => {
            console.debug('nodeRefs', state.nodeRefs);
            vm.$emit('mounted');
        });


        const init = async () => {
            if (props.fetcher) await fetch();
        };

        /* init */
        (async () => {
            await init();
        })();

        return {
            ...toRefs(state),
            getNodeKey,
            nodeListeners,
            onToggleClick,
            onNodeSelect,
            onNodeMounted,
            fetch,
        };
    },
};
</script>

<style lang="postcss">
.p-tree{

}

</style>
