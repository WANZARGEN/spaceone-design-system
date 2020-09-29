<script lang="ts">
import { get } from 'lodash';
import PDynamicField from '@/organisms/dynamic-field/PDynamicField.vue';
import { DynamicFieldProps } from '@/organisms/dynamic-field/type';
import { VNodeData } from 'vue';
import { EnumOptions } from '@/organisms/dynamic-field/type/field-schema';
import { EnumDynamicFieldProps } from '@/organisms/dynamic-field/templates/enum/type';

export default {
    name: 'PDynamicFieldEnum',
    functional: true,
    components: { PDynamicField },
    props: {
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: undefined,
        },
        typeOptions: {
            type: Object,
            default: () => ({}),
        },
        extraData: {
            type: Object,
            default: () => ({}),
        },
        beforeCreate: {
            type: Function,
            default: undefined,
        },
        handler: {
            type: Function,
            default: undefined,
        },
    },
    render(h, { props, listeners }: {props: EnumDynamicFieldProps; listeners: any}) {
        const option: EnumOptions[string] = get(
            props.options, props.data,
            { type: 'text' },
        );
        return h(PDynamicField, {
            props: {
                ...option,
                data: option.name || props.data,
                typeOptions: props.typeOptions,
                beforeCreate: props.beforeCreate,
                handler: props.handler,
                extraData: props.extraData,
            },
            on: listeners,
        } as VNodeData);
    },
};
</script>
