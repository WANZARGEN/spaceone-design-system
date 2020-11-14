<template>
    <div v-show="isReady" ref="nodeRef" class="p-tree-node">
        <div :class="{...classNames(node),
                      expanded: mutableState.expanded,
                      selected: mutableState.selected,
                      loading: mutableState.loading,
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
                                      class="left-extra"
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
                                            <p-i v-if="hasChild"
                                                 :name="mutableState.expanded ? 'ic_tree_arrow--opened' : 'ic_tree_arrow'"
                                                 :width="toggleSize" :height="toggleSize"
                                                 color="inherit transparent"
                                            />
                                        </slot>
                                    </slot>
                                </span>
                                <span v-if="$scopedSlots[`toggle-right-${level}`] || $scopedSlots[`toggle-right`]"
                                      class="toggle-right"
                                >
                                    <slot :name="`toggle-right-level-${level}`" v-bind="slotProps">
                                        <slot name="toggle-right" v-bind="slotProps" />
                                    </slot>
                                </span>
                                <span v-if="$scopedSlots[`icon-${level}`] || $scopedSlots[`icon`]"
                                      class="icon"
                                >
                                    <slot :name="`icon-level-${level}`" v-bind="slotProps">
                                        <slot name="icon" v-bind="slotProps" />
                                    </slot>
                                </span>
                                <span class="data">
                                    <slot :name="`data-${level}`" v-bind="slotProps">
                                        <slot name="data" v-bind="slotProps">
                                            {{ node.value }}
                                        </slot>
                                    </slot>
                                </span>
                                <span v-if="$scopedSlots[`right-extra-${level}`] || $scopedSlots[`right-extra`]"
                                      class="right-extra"
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
        <div v-if="mutableState.expanded" class="children">
            <p-tree-node v-for="(child, idx) in mutableState.children" :key="idx"
                         :pad-size="padSize"
                         :pad-unit="padUnit"
                         :toggle-size="toggleSize"
                         :disable-toggle="disableToggle"
                         :class-names="classNames"
                         :node-formatter="nodeFormatter"
                         :value-formatter="valueFormatter"
                         :id-key="idKey"

                         :index="idx"
                         :level="level + 1"
                         :parent="node"
                         :data="child"

                         v-on="childrenListeners"
            >
                <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                    <slot :name="slot" v-bind="scope" />
                </template>
            </p-tree-node>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable no-use-before-define */

import {
    TreeNodeProps, TreeNode, TreeNodeFunctions, TreeNodeMutableData,
} from '@/components/molecules/tree-node-2/type';
import {
    ComponentRenderProxy,
    computed, defineComponent, getCurrentInstance, onMounted, onUpdated, reactive, toRefs,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import {
    forEach, get, set, remove, find,
} from 'lodash';
import { getUUID } from '@/components/molecules/tree-node-2/helper';


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
        index: {
            type: Number,
            default: 0,
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
        const id = getUUID();
        let childrenInitCount = 0;

        const mutableState = reactive({
            children: null as null|any[],
            expanded: false,
            selected: false,
            loading: false,
            data: props.data,
        });

        const setChildren: TreeNodeFunctions['setChildren'] = (childrenData: any[]|null, emitEvent = true) => {
            /** init childrenNodes */
            childrenInitCount = 0;
            state.childNodes = [];

            /** set children */
            if (!childrenData || !Array.isArray(childrenData)) mutableState.children = null;
            else mutableState.children = childrenData;
            emitUpdate({ children: mutableState.children });
        };

        const setSelected: TreeNodeFunctions['setSelected'] = (value) => {
            mutableState.selected = value;
            emit('update-selected', state.node);
            emitUpdate({ selected: value });
        };

        const setLoading: TreeNodeFunctions['setLoading'] = (value) => {
            mutableState.loading = value;
            emitUpdate({ loading: value });
        };

        const setExpanded: TreeNodeFunctions['setExpanded'] = (value) => {
            mutableState.expanded = value;
            emitUpdate({ expanded: value });
        };

        const setData: TreeNodeFunctions['setData'] = (data) => {
            mutableState.data = data;
            emitUpdate({ data });
        };

        const appendChild: TreeNodeFunctions['appendChild'] = (data) => {
            if (mutableState.children) setChildren([...mutableState.children, data]);
            else setChildren([data]);
        };

        const deleteChild: TreeNodeFunctions['deleteChild'] = (node) => {
            if (mutableState.children) {
                setChildren(mutableState.children.splice(node.index, 1));
            }
        };

        const findChildNodes: TreeNodeFunctions['findChildNodes'] = (predicate, recursive = false) => {
            const res = [] as TreeNode[];
            state.childNodes.forEach((d) => {
                if (predicate(d)) res.push(d);
                if (recursive) res.push(...d.findChildNodes(predicate, true));
            });
            return res;
        };

        const state = reactive({
            initFinished: false,
            nodeId: computed(() => (props.idKey ? get(mutableState.data, props.idKey, id) : id)),
            hasChild: computed(() => !!mutableState.children),
            isReady: false,
            depth: computed(() => `${(props.level || 0) * (props.padSize || 1)}${props.padUnit || 'rem'}`),
            nodeRef: null as null|HTMLElement,
            childNodes: [] as TreeNode[],
            node: computed(() => {
                const res: TreeNode = {
                    nodeId: state.nodeId,
                    index: props.index as number,
                    level: props.level as number,
                    parent: props.parent || null,
                    children: mutableState.children ? [...mutableState.children] : mutableState.children,
                    childNodes: state.childNodes,
                    data: mutableState.data,
                    value: mutableState.data,
                    expanded: mutableState.expanded,
                    selected: mutableState.selected,
                    loading: mutableState.loading,
                    element: state.nodeRef,
                    matched: [],
                    setChildren,
                    setSelected,
                    setLoading,
                    setExpanded,
                    setData,
                    appendChild,
                    deleteChild,
                    findChildNodes,
                };

                if (props.valueFormatter) res.value = props.valueFormatter(res);

                // @ts-ignore
                if (props.parent && props.parent.matched) res.matched = [...props.parent.matched, res];
                else res.matched = [res];

                return res;
            }),
        });

        const getListeners = (type: string) => {
            const res = {};
            forEach(vm.$listeners, (l, eventName: string) => {
                if (eventName.endsWith(type)) {
                    res[`${eventName.substring(0, eventName.length - type.length - 1)}`] = (e) => {
                        emit(eventName, state.node, e);
                    };
                }
            });
            return res;
        };

        const emitUpdate = (item: Partial<TreeNode>) => {
            emit('update', state.node, item);
        };

        const emitInit = () => {
            emit('init', state.node);
            state.initFinished = true;
        };

        const slotProps = computed(() => ({
            node: state.node, depth: state.depth, props,
        }));


        const childrenListeners = {
            ...vm.$listeners,
            init(node: TreeNode) {
                if (mutableState.children === null) return;

                childrenInitCount += 1;
                state.childNodes.push(node);
                if (childrenInitCount === mutableState.children.length) {
                    if (state.initFinished) {
                        emitUpdate({ childNodes: state.childNodes });
                    } else emitInit();
                }
            },
        };

        (async () => {
            if (props.nodeFormatter) {
                const res = props.nodeFormatter(state.node);
                if (res instanceof Promise) await res;
            }
            state.isReady = true;
            if (mutableState.children === null) emitInit();
        })();


        return {
            ...toRefs(state),
            mutableState,
            slotProps,
            getListeners,
            setChildren,
            childrenListeners,
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
