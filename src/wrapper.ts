// @ts-ignore
// export { default as PButton } from '@/atoms/buttons/PButton.vue';
// export { default as PLabel } from './atoms/labels/PLabel.vue';
// export { default as PI } from './atoms/icons/PI.vue';
// export { default as PBadge } from './atoms/badges/PBadge.vue';
// export { default as PEmpty } from './atoms/empty/PEmpty.vue';
import PButton from '@/atoms/buttons/PButton.vue';

export default {
    install(Vue, options) {
        // Let's register our component globally
        // https://vuejs.org/v2/guide/components-registration.html
        Vue.component('p-button', PButton);
    },
};
