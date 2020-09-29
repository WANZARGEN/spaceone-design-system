/* eslint-disable global-require, @typescript-eslint/no-var-requires */

module.exports = {
    plugins: () => {
        const res = [
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
        ];
        return res;
    },
};
