 const path = require('path');
 const forkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const postCssLoader = {
        loader: 'postcss-loader',
        options: require('./postcss.config'),
    };

module.exports = {
    stories: [
        '../src/**/*.stories.@(ts|mdx)',
    ],
    addons: [
        '@storybook/addon-actions',
        '@storybook/addon-links',
        // '@storybook/addon-knobs/register',
        '@storybook/addon-storysource',
        '@storybook/addon-a11y',
        '@storybook/addon-docs',
        '@storybook/addon-viewport',
        '@storybook/addon-google-analytics',
        '@storybook/addon-controls',
        'storybook-addon-designs/register',
        "@storybook/addon-essentials",
        {
            name: "@storybook/addon-postcss",
            options: {
                postcssLoaderOptions: {
                    implementation: require("postcss"),
                },
            },
        },
    ],
    webpackFinal:  async (config) => {

        /* alis settings */
        config.resolve.alias = {
            'vue': path.resolve('/node_modules/vue/dist/vue.runtime.global.js'),
            '@': path.resolve(__dirname, '../src'),
            'fs': path.resolve(__dirname, 'fsMock.js'),
        };


        /* SASS settings */
        config.module.rules.push({
            test: /\.s?css$/,
            use: ['style-loader', 'css-loader', 'postcss-loader',
                {
                  loader: 'sass-loader',
                    options: {
                        sassOptions: {
                            indentedSyntax: true
                        }
                    }
                },
            ],
            include: path.resolve(__dirname, '../'),
        });

        /* POSTCSS settings */
        config.module.rules.push({
            test: /\.(postcss|pcss)$/,
            use: ['style-loader', 'css-loader', postCssLoader],
            include: path.resolve(__dirname, '../'),
        });

        config.plugins.push(new forkTsCheckerWebpackPlugin());

        return config;
    },
};

