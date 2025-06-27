import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginBasicSsl } from '@rsbuild/plugin-basic-ssl';

const path = require('path');

export default defineConfig({
    plugins: [
        pluginSass({
            sassLoaderOptions: {
                sourceMap: true,
            },
            exclude: /node_modules/,
        }),
        pluginReact(),
        // pluginBasicSsl(), // Disabled SSL for easier development
    ],
    source: {
        entry: {
            index: './src/main.tsx',
        },
        define: {
            'process.env': {
                DERIV_APP_ID: JSON.stringify(process.env.DERIV_APP_ID), // ✅ Added App ID
                TRANSLATIONS_CDN_URL: JSON.stringify(process.env.TRANSLATIONS_CDN_URL),
                R2_PROJECT_NAME: JSON.stringify(process.env.R2_PROJECT_NAME),
                CROWDIN_BRANCH_NAME: JSON.stringify(process.env.CROWDIN_BRANCH_NAME),
                TRACKJS_TOKEN: JSON.stringify(process.env.TRACKJS_TOKEN),
                APP_ENV: JSON.stringify(process.env.APP_ENV),
                REF_NAME: JSON.stringify(process.env.REF_NAME),
                REMOTE_CONFIG_URL: JSON.stringify(process.env.REMOTE_CONFIG_URL),
                GD_CLIENT_ID: JSON.stringify(process.env.GD_CLIENT_ID),
                GD_APP_ID: JSON.stringify(process.env.GD_APP_ID),
                GD_API_KEY: JSON.stringify(process.env.GD_API_KEY),
                DATADOG_SESSION_REPLAY_SAMPLE_RATE: JSON.stringify(process.env.DATADOG_SESSION_REPLAY_SAMPLE_RATE),
                DATADOG_SESSION_SAMPLE_RATE: JSON.stringify(process.env.DATADOG_SESSION_SAMPLE_RATE),
                DATADOG_APPLICATION_ID: JSON.stringify(process.env.DATADOG_APPLICATION_ID),
                DATADOG_CLIENT_TOKEN: JSON.stringify(process.env.DATADOG_CLIENT_TOKEN),
                RUDDERSTACK_KEY: JSON.stringify(process.env.RUDDERSTACK_KEY),
                GROWTHBOOK_CLIENT_KEY: JSON.stringify(process.env.GROWTHBOOK_CLIENT_KEY),
                GROWTHBOOK_DECRYPTION_KEY: JSON.stringify(process.env.GROWTHBOOK_DECRYPTION_KEY),
            },
        },
        alias: {
            react: path.resolve('./node_modules/react'),
            'react-dom': path.resolve('./node_modules/react-dom'),
            '@/external': path.resolve(__dirname, './src/external'),
            '@/components': path.resolve(__dirname, './src/components'),
            '@/hooks': path.resolve(__dirname, './src/hooks'),
            '@/utils': path.resolve(__dirname, './src/utils'),
            '@/constants': path.resolve(__dirname, './src/constants'),
            '@/stores': path.resolve(__dirname, './src/stores'),
        },
    },
    output: {
        copy: [
            {
                from: 'node_modules/@deriv/deriv-charts/dist/*',
                to: 'js/smartcharts/[name][ext]',
                globOptions: {
                    ignore: ['**/*.LICENSE.txt'],
                },
            },
            { from: 'node_modules/@deriv/deriv-charts/dist/chart/assets/*', to: 'assets/[name][ext]' },
            { from: 'node_modules/@deriv/deriv-charts/dist/chart/assets/fonts/*', to: 'assets/fonts/[name][ext]' },
            { from: 'node_modules/@deriv/deriv-charts/dist/chart/assets/shaders/*', to: 'assets/shaders/[name][ext]' },
            { from: path.join(__dirname, 'public') },
        ],
        assetPrefix: '/',
        filename: {
            js: '[name].[contenthash:8].js',
            css: '[name].[contenthash:8].css',
        },
    },
    performance: {
        chunkSplit: {
            strategy: 'split-by-experience',
        },
        preload: {
            type: 'all-chunks',
        },
        prefetch: {
            type: 'all-chunks',
        },
    },
    html: {
        template: './index.html',
    },
    server: {
        port: 3000,
        compress: true,
        https: false,
    },
    dev: {
        hmr: true,
    },
    tools: {
        rspack: {
            plugins: [],
            resolve: {},
            optimization: {
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'vendors',
                            chunks: 'all',
                            priority: 10,
                        },
                        blockly: {
                            test: /[\\/]node_modules[\\/]blockly[\\/]/,
                            name: 'blockly',
                            chunks: 'all',
                            priority: 20,
                        },
                        charts: {
                            test: /[\\/]node_modules[\\/]@deriv[\\/]deriv-charts[\\/]/,
                            name: 'charts',
                            chunks: 'all',
                            priority: 20,
                        },
                    },
                },
            },
            module: {
                rules: [
                    {
                        test: /\.xml$/,
                        exclude: /node_modules/,
                        use: 'raw-loader',
                    },
                ],
            },
        },
    },
});
