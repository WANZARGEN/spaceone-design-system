/* eslint-disable @typescript-eslint/no-var-requires,global-require */
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs'; // Convert CommonJS modules to ES6
import VuePlugin from 'rollup-plugin-vue'; // Handle .vue SFC files
import css from 'rollup-plugin-css-only';
import buble from 'rollup-plugin-buble'; // Transpile/polyfill with reasonable browser support
import typescript from 'rollup-plugin-typescript2';
import jsx from 'acorn-jsx';

export default {
    input: 'src/wrapper.js',
    output: [
        {
            format: 'cjs',
            name: 'spaceone-component.cjs',
        },
        {
            format: 'esm',
            name: 'spaceone-component.esm',

        },
        {
            format: 'iife',
            name: 'spaceone-component.iife',
        },

    ],
    acornInjectPlugins: [jsx()],
    external: ['vue'],
    plugins: [
        typescript({
            typescript: require('typescript'),
            // tsconfig: 'tsconfig.json',
        }),
        VuePlugin({
            preprocessStyles: true,
            postcssPlugins: [
                require('postcss-easy-import')({
                    path: ['src', 'node_modules'],
                }),
                require('tailwindcss'),
                require('postcss-hexrgba'),
                require('postcss-mixins'),
                require('postcss-conditionals'),
                require('postcss-nested'),
                require('postcss-simple-vars')(),
                require('autoprefixer'),
                require('postcss-preset-env')({ stage: 3 }),
            ],
        }),
        css(),
        buble({
            transforms: { forOf: false, generator: false },
            objectAssign: 'Object.assign',
        }), // Transpile to ES5
        resolve({ browser: true, jsnext: true, main: true }),
        commonjs(),
    ],
};
