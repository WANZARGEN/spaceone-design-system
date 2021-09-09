import "@/styles/style.pcss";

import { app } from '@storybook/vue3';

import '@storybook/addon-console';
import { withDesign } from 'storybook-addon-designs';
import VueCompositionApi from '@vue/composition-api';
import Notifications from 'vue-notification';

// import Vue from 'vue';
// import VueRouter from 'vue-router';
import VueI18n from 'vue-i18n';
import velocity from 'velocity-animate';
import SvgIcon from 'vue-svgicon';

import webFontLoader from 'webfontloader';
import { fontUrls, webFonts } from '@/styles/web-fonts';

import tailwindConfig from './tailwind.config';
import VTooltip from 'v-tooltip';

import SpaceOneTheme from './SpaceOneTheme';
import {i18n} from '@/translations'

app.use(VueRouter)
app.use(VueI18n);
app.use(VueCompositionApi);
app.use(Notifications, { velocity });
app.use(SvgIcon, {
    tagName: 'svgicon',
    classPrefix: 'p-i'
})
app.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });

app.config.globalProperties.toJSON = function () {
    return this;
};

webFontLoader.load({
    google: {
        families: webFonts,
        urls: fontUrls,
    },
});


const viewports = {}
Object.keys(tailwindConfig.theme.screens).forEach(k => {
    const v = tailwindConfig.theme.screens[k];
    viewports[k] = {
        name: k,
        styles: {
            width: v.min || v.max,
            height: '100%',
        }
    }
})

export const decorators = [
    withDesign,
    () => ({
        i18n,
        router: new VueRouter(),
        template: '<story/>',
    })
]

export const parameters = {
    controls: { expanded: true },
    layout: 'centered',
    docs: {
        extractComponentDescription: (component, { notes }) => {
            if (notes) {
                return typeof notes === 'string' ? notes : notes.markdown || notes.text;
            }
            return null;
        },
        theme: SpaceOneTheme,
    },
    viewport: {
        viewports,
    },
    options: {
        storySort: (a, b) =>
            a[1].kind === b[1].kind ? 0 : a[1].id.localeCompare(b[1].id, undefined, { numeric: true }),
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
}
