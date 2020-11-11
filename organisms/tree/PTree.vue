<template>
    <div class="p-tree">
        <p-tree-node v-for="(node, idx) in nodes" :key="idx"
                     :pad-size="padSize"
                     :pad-unit="padUnit"
                     :toggle-size="toggleSize"
                     :disable-toggle="disableToggle"
                     :class-names="classNames"
                     :data-formatter="dataFormatter"

                     :node-key="node.nodeKey"
                     :level="idx"
                     :parent="null"
                     :children="node.children"
                     :data="node.data"
                     :expanded="node.expanded"
                     :selected="node.selected"
                     :loading="node.loading"
                     @update:data="onUpdateNodeData(node, idx, ...$arguments)"
                     @update:children="onUpdateNodeChildren(node, idx, ...$arguments)"
                     @update:state="onUpdateNodeState(node, idx, ...$arguments)"
                     @toggle:click="onNodeToggle"
                     @node:click="onSelectNode"
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
    TreeNode,
} from '@/components/molecules/tree-node-2/type';
import { Fetcher, TreeProps } from '@/components/organisms/tree/type';
import { makeOptionalProxy } from '@/components/util/composition-helpers';
import { findIndex, forEach } from 'lodash';

export default {
    name: 'PTree',
    components: { PTreeNode },
    props: {
        padSize: {
            type: Number,
            default: 1,
        },
        padUnit: {
            type: String,
            default: 'rem',
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
            type: Object,
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

    },
    setup(props: TreeProps) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const data = makeOptionalProxy('data', vm, []);
        const getData = computed<Fetcher>(() => props.fetcher || ((d: any) => Promise.resolve([])));

        const state = reactive({
            nodes: computed<TreeNode[]>(() => {
                if (Array.isArray(data.value)) return data.value;
                return [data.value];
            }),
            selectedNodes: makeOptionalProxy('selected', vm, []),
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


        // const deleteNode = ({ parent, nodeKey }: TreeNode) => {
        //     if (parent && Array.isArray(parent.children)) {
        //         parent.children.splice(nodeKey, 1);
        //         if (parent.children.length === 0) parent.children = false;
        //     } else {
        //         state.nodes.splice(nodeKey, 1);
        //     }
        // };

        const resetSelectedNode = (node: TreeNode, compare?: TreeNode) => {
            if (compare) {
                if (compare.nodeKey === node.nodeKey) {
                    state.selectedNodes = [node];
                    node.selected = true;
                } else if (compare.parent) resetSelectedNode(node, compare.parent);
            } else {
                if (!state.firstSelectedNode) return;
                if (!state.firstSelectedNode.parent) return;
                if (state.firstSelectedNode.level <= node.level) return;
                resetSelectedNode(node, state.firstSelectedNode.parent);
            }
        };


        const onUpdateNodeData = () => {
        };

        const onUpdateNodeChildren = () => {
        };

        const onUpdateNodeState = () => {
        };

        const onNodeToggle = (node: TreeNode, matched: TreeNode[], e: MouseEvent) => {
            e.stopPropagation();
            if (node.expanded) {
                resetSelectedNode(node);
                node.expanded = false;
                node.children = !!node.children;
                return;
            }

            vm.$emit('toggle', node, matched, e);
        };

        const onSelectNode = (node: TreeNode, ...args) => {
            if (state.firstSelectedNode) {
                state.firstSelectedNode.selected = false;
                if (state.firstSelectedNode.nodeKey === node.nodeKey && state.firstSelectedNode.level === node.level) {
                    state.selectedNodes = [];
                    return;
                }
            }
            node.selected = true;
            state.selectedNodes = [node];

            vm.$emit('select', node, ...args);
        };

        const onNodeMounted = (...args) => {
            vm.$emit('node-mounted', ...args);
        };

        const fetch = async (node?: TreeNode): Promise<void> => {
            if (node) {
                node.expanded = true;
                node.loading = true;
                node.children = await getData.value(node);
                node.loading = false;
            } else {
                const res = await getData.value();
                state.nodes = Array.isArray(res) ? res : [];
            }
        };


        onMounted(() => {
            vm.$emit('mounted');
        });

        const nodeListeners = {};

        const init = () => {
            forEach(vm.$listeners, (l, eventName: string) => {
                if (!eventName.startsWith('update')) {
                    nodeListeners[eventName] = (...args) => { vm.$emit(eventName, ...args); };
                }
            });
        };

        /* init */
        init();

        return {
            nodeListeners,
            ...toRefs(state),
            onUpdateNodeData,
            onUpdateNodeChildren,
            onUpdateNodeState,
            onNodeToggle,
            onSelectNode,
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
