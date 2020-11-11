<template>
    <div ref="nodeRef" class="p-tree-node">
        <div :class="{...classNames(node),
                      expanded: proxyState.expanded,
                      selected: proxyState.selected,
                      loading: proxyState.loading,
                      [`level-${level}`]: true}"
             :style="{paddingLeft: depth}"
             v-on="getListeners('row')"
        >
            <slot :name="`row-${level}`" v-bind="slotProps">
                <slot name="row" v-bind="slotProps">
                    <div class="node" v-on="getListeners('node')">
                        <slot :name="`node-level-${level}`" v-bind="slotProps">
                            <slot name="node" v-bind="slotProps">
                                <span v-if="$scopedSlots[`left-extra-${level}`] || $scopedSlots[`left-extra`]"
                                      class="left-extra" v-on="getListeners('left-extra')"
                                >
                                    <slot :name="`left-extra-level-${level}`" v-bind="slotProps">
                                        <slot name="left-extra" v-bind="slotProps" />
                                    </slot>
                                </span>
                                <span v-if="!disableToggle" class="toggle"
                                      :style="{width: toggleSize}"
                                      v-on="getListeners('toggle')"
                                >
                                    <slot v-if="$scopedSlots[`toggle-${level}`] || $scopedSlots[`toggle`]"
                                          :name="`toggle-${level}`" v-bind="slotProps"
                                    >
                                        <slot name="toggle" v-bind="slotProps">
                                            <p-i v-if="proxyState.children"
                                                 :name="proxyState.expanded ? 'ic_tree_arrow--opened' : 'ic_tree_arrow'"
                                                 :width="toggleSize" :height="toggleSize"
                                                 color="inherit transparent"
                                            />
                                        </slot>
                                    </slot>
                                </span>
                                <span v-if="$scopedSlots[`toggle-right-${level}`] || $scopedSlots[`toggle-right`]"
                                      class="toggle-right" v-on="getListeners('toggle-right')"
                                >
                                    <slot :name="`toggle-right-level-${level}`" v-bind="slotProps">
                                        <slot name="toggle-right" v-bind="slotProps" />
                                    </slot>
                                </span>
                                <span v-if="$scopedSlots[`icon-${level}`] || $scopedSlots[`icon`]"
                                      class="icon" v-on="getListeners('icon')"
                                >
                                    <slot :name="`icon-level-${level}`" v-bind="slotProps">
                                        <slot name="icon" v-bind="slotProps" />
                                    </slot>
                                </span>
                                <span class="data" v-on="getListeners('data')">
                                    <slot :name="`data-${level}`" v-bind="slotProps">
                                        <slot name="data" v-bind="slotProps">
                                            {{ node.value }}
                                        </slot>
                                    </slot>
                                </span>
                                <span v-if="$scopedSlots[`right-extra-${level}`] || $scopedSlots[`right-extra`]"
                                      class="right-extra" v-on="getListeners('right-extra')"
                                >
                                    <slot :name="`right-extra-${level}`" v-bind="slotProps">
                                        <slot name="right-extra" v-bind="slotProps" />
                                    </slot>
                                </span>
                            </slot>
                        </slot>
                    </div>
                </slot>
            </slot>
        </div>
        <div v-if="proxyState.expanded" class="children">
            <p-tree-node v-for="(child, idx) in proxyState.children" :key="idx"
                         :pad-size="padSize"
                         :pad-unit="padUnit"
                         :toggle-size="toggleSize"
                         :disable-toggle="disableToggle"
                         :class-names="classNames"
                         :data-formatter="dataFormatter"

                         :node-key="child.nodeKey"
                         :level="level + 1"
                         :parent="node"
                         :data="child.data"

                         v-on="passChildEventToParentNode()"
            >
                <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                    <slot :name="slot" v-bind="scope" />
                </template>
            </p-tree-node>
        </div>
    </div>
</template>

<script lang="ts">
import {
    TreeNodeProps, TreeNode, TreeNodeEventHandler, TreeNodeFunctions,
} from '@/components/molecules/tree-node-2/type';
import {
    ComponentRenderProxy,
    computed, defineComponent, getCurrentInstance, onMounted, reactive, toRefs,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import {
    forEach, get,
} from 'lodash';
import { makeOptionalProxy } from '@/components/util/composition-helpers';


const PTreeNode = import('@/components/molecules/tree-node-2/PTreeNode.vue');

export default defineComponent({
    name: 'PTreeNode',
    components: { PI, PTreeNode: PTreeNode as any },
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
            type: Function,
            default: undefined,
        },
        idKey: {
            type: [String, Number],
            default: undefined,
        },
        nodeKey: {
            type: [String, Number],
            default: undefined,
        },
        level: {
            type: Number,
            default: 0,
        },
        data: {
            type: [Array, Object, String, Number, Boolean],
            default: '',
            required: true,
        },
        parent: {
            type: Object,
            default: () => null,
        },
    },
    setup(props: TreeNodeProps, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const proxyState = reactive({
            children: [] as TreeNodeProps[]|null,
            expanded: false,
            selected: false,
            loading: false,
            data: makeOptionalProxy('data', vm, ''),
        });

        const setChildren: TreeNodeFunctions['setChildren'] = (childrenData: any[]|null = null) => {
            if (!childrenData || childrenData.length === 0) {
                proxyState.children = null;
                return;
            }
            proxyState.children = childrenData.map((d, i) => ({
                nodeKey: props.idKey ? get(d, props.idKey, i) : i,
                data: d,
            }));
        };

        const setState: TreeNodeFunctions['setState'] = (name, value) => {
            proxyState[name] = value;
        };

        const state = reactive({
            depth: computed(() => `${(props.level || 0) * (props.padSize || 1)}${props.padUnit || 'rem'}`),
            nodeRef: null as null | HTMLElement,
            proxyNodeKey: computed(() => (props.nodeKey === undefined ? vm.$vnode.key || 0 : props.nodeKey)),
            node: computed(() => {
                const res = {
                    nodeKey: state.proxyNodeKey,
                    level: props.level,
                    parent: props.parent,
                    children: proxyState.children,
                    data: proxyState.data,
                    value: props.data,
                    expanded: proxyState.expanded,
                    selected: proxyState.selected,
                    loading: proxyState.loading,
                    element: state.nodeRef,
                    setChildren,
                    setState,
                };

                if (props.dataFormatter) res.value = props.dataFormatter(res);

                return res;
            }),
        });

        const getListeners = (type: string) => {
            const res = {};
            forEach(vm.$listeners, (l, eventName: string) => {
                if (eventName.startsWith(type)) {
                    res[`${eventName.substring(type.length + 1)}`] = (e) => {
                        const node = { ...state.node };
                        emit(eventName, node, [node], e);
                    };
                }
            });
            return res;
        };

        const passChildEventToParentNode = () => {
            const res: Record<string, TreeNodeEventHandler> = {};
            forEach(vm.$listeners, (l, eventName: string) => {
                res[eventName] = (node, matched, e) => {
                    emit(eventName, node, [{ ...state.node }, ...matched], e);
                };
            });
            return res;
        };

        const slotProps = computed(() => ({
            node: state.node, depth: state.depth, props,
        }));


        onMounted(() => {
            const node = { ...state.node };
            emit('mounted', node, [node]);
        });

        const appendNode = () => {
        };


        return {
            proxyState,
            ...toRefs(state),
            slotProps,
            getListeners,
            passChildEventToParentNode,
            setChildren,
        };
    },
});
</script>

<style lang="postcss">
.p-tree-node {
    .basic {
        @apply h-8 rounded-sm text-sm text-black cursor-pointer;
        .node {
            @apply h-full w-full inline-flex items-center;
        }
        .toggle {
            @apply cursor-pointer;
            color: inherit;
        }
        .icon {
            @apply flex-shrink-0 flex-grow-0;
        }
        .data {
            @apply leading-normal truncate;
        }
        .right-extra {
            @apply flex-grow;
        }
        &:hover {
            @apply text-secondary bg-secondary2;
        }
        &.selected {
            @apply bg-blue-200 border border-secondary;
        }
    }
}
</style>
