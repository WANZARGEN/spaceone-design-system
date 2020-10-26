<template>
    <div class="p-tree">
        <p-tree-node v-for="(node, idx) in nodes"
                     :id="node.id"
                     :key="idx"
                     :level="idx"
                     :pad-size="padSize"
                     :pad-unit="padUnit"
                     :toggle-size="toggleSize"
                     :disable-toggle="disableToggle"
                     :class-names="classNames"
                     :data="node.data"
                     :children="node.children"
                     :state="node.state"
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
    NodeState, TreeItem, TreeNode,
} from '@/components/molecules/tree-node-2/type';
import { Fetcher, TreeProps } from '@/components/organisms/tree/type';
import { makeOptionalProxy } from '@/components/util/composition-helpers';
import { findIndex, forEach } from 'lodash';

const getBaseNodeState = (): NodeState => ({ expanded: false, selected: false, loading: false });

const getDefaultNode = (data: any, init?: Partial<NodeState>): TreeNode => ({
    data,
    children: false,
    state: getBaseNodeState(),
    ...init,
});

const getTreeItem = (
    key: number, level: number, node: TreeNode, parent: TreeItem,
) => ({
    key,
    level,
    node,
    parent,
});

const setNodeState = ({ node }: TreeItem, _state: Partial<NodeState>) => {
    node.state = {
        ...node.state,
        ..._state,
    };
};

export default {
    name: 'PTree',
    components: { PTreeNode },
    props: {
        data: {
            type: [Array, Object],
            default: undefined,
        },
        selected: {
            type: Array,
            default: undefined,
        },
        fetcher: {
            type: Function,
            default: d => d,
        },
        mapper: {
            type: Object,
            default: () => ({}),
        },
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
    },
    setup(props: TreeProps) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const data = makeOptionalProxy('data', vm, []);
        const getData = computed<Fetcher>(() => props.fetcher || ((d: any) => Promise.resolve([])));

        const state = reactive({
            nodes: computed(() => {
                if (Array.isArray(data.value)) return data.value;
                return [data.value];
            }),
            selectedNodes: makeOptionalProxy('selected', vm, []),
            firstSelectedNode: computed(() => state.selectedNodes[0]),
            pad: computed(() => {
                const size = props.padSize?.match(/\d+/g);
                return size ? Number(size[0]) : 1;
            }),
            unit: computed(() => {
                const unit = props.padSize?.match(/[a-zA-Z]+/g);
                return unit ? unit[0] : 'rem';
            }),
        });

        const applyState = ({ node }: TreeItem) => {
            node.state = {
                ...node.state,
            };
        };

        const deleteNode = ({ parent, key }: TreeItem) => {
            if (parent && Array.isArray(parent.node.children)) {
                parent.node.children.splice(key, 1);
                if (parent.node.children.length === 0) parent.node.children = false;
            } else {
                state.nodes.splice(key, 1);
            }
        };

        const resetSelectedNode = (item: TreeItem, compare?: TreeItem) => {
            if (compare) {
                if (compare.node.data.id === item.node.data.id) {
                    state.selectedNodes = [item];
                    item.node.state.selected = true;
                } else if (compare.parent) resetSelectedNode(item, compare.parent);
            } else {
                if (!state.firstSelectedNode) return;
                if (!state.firstSelectedNode.parent) return;
                if (state.firstSelectedNode.level <= item.level) return;
                resetSelectedNode(item, state.firstSelectedNode.parent);
            }
        };


        const onUpdateNodeData = () => {
        };

        const onUpdateNodeChildren = () => {
        };

        const onUpdateNodeState = () => {
        };

        const onNodeToggle = (item: TreeItem, matched: TreeItem[], e: MouseEvent) => {
            e.stopPropagation();
            if (item.node.state.expanded) {
                resetSelectedNode(item);
                item.node.state.expanded = false;
                applyState(item);
                item.node.children = !!item.node.children;
                return;
            }

            vm.$emit('toggle', item, matched);
        };

        const onSelectNode = (item, ...args) => {
            if (state.firstSelectedNode) {
                setNodeState(state.firstSelectedNode, { selected: false });
                if (state.firstSelectedNode.key === item.key && state.firstSelectedNode.level === item.level) {
                    state.selectedNodes = [];
                    return;
                }
            }
            setNodeState(item, { selected: true });
            state.selectedNodes = [item];

            vm.$emit('select', item, ...args);
        };

        const onNodeMounted = (...args) => {
            vm.$emit('node-mounted', ...args);
        };

        const fetch = async (item?: TreeItem): Promise<void> => {
            if (item) {
                item.node.state.expanded = true;
                item.node.state.loading = true;
                applyState(item);

                item.node.children = await getData.value(item);

                item.node.state.loading = false;
                applyState(item);
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
