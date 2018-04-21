const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const {TsConfigPathsPlugin} = require('awesome-typescript-loader');


module.exports = {
    mode: 'development',
    devtool: 'cheap-module-source-map', // if mode = development, then this option must be enabled. otherwise will be security policy error.

    entry: {
        '/interface/js/scripts/popup': './src/interface/popup-build.js',
        '/interface/js/scripts/settings': './src/interface/settings-build.js',
        '/interface/js/scripts/settings-screenshot': './src/interface/settings-screenshot-build.js',
        '/interface/js/scripts/settings-download': './src/interface/settings-download-build.js',
        '/interface/js/scripts/statistics': './src/interface/statistics-build.js',
        '/interface/js/scripts/settings-iframe': './src/interface/settings-iframe-build.js'
    },

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },

    module: {
        rules: [
            {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                use: ['css-loader', 'sass-loader']
            })},
            {
                test: /\.pug$/,
                loader: 'pug-loader'
            },
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader'
            }
        ]
    },

    plugins: [
        new CleanWebpackPlugin([
            'dist'
        ]),
        new CopyWebpackPlugin([
            {
                from: './static/manifest'
            },
            {
                from: './static/interface',
                to: './interface'
            },
            {
                from: './static/interaction',
                to: './interaction'
            }
        ]),
        new ExtractTextPlugin({
            filename: (getPath) => {
                const pathName = getPath('[name]');

                if (pathName === '/interface/js/scripts/popup') {
                    return '/interface/css/styles/popup.css';
                } else if (pathName === '/interface/js/scripts/settings') {
                    return '/interface/css/styles/settings.css';
                } else if (pathName === '/interface/js/scripts/settings-iframe') {
                    return '/interface/css/styles/settings-iframe.css';
                } else if (pathName === '/interface/js/scripts/statistics') {
                    return '/interface/css/styles/statistics.css';
                } else {
                    return '/interface/css/styles/undefined.css';
                }
            }
        }),
        new HTMLWebpackPlugin({
            template: './src/interface/html/popup.pug',
            filename: '/interface/html/popup.html',
            inject: false
        }),
        new HTMLWebpackPlugin({
            template: './src/interface/html/settings.pug',
            filename: '/interface/html/settings.html',
            inject: false
        }),
        new HTMLWebpackPlugin({
            template: './src/interface/html/settings-download.pug',
            filename: '/interface/html/settings-download.html',
            inject: false
        }),
        new HTMLWebpackPlugin({
            template: './src/interface/html/settings-screenshot.pug',
            filename: '/interface/html/settings-screenshot.html',
            inject: false
        }),
        new HTMLWebpackPlugin({
            template: './src/interface/html/statistics.pug',
            filename: '/interface/html/statistics.html',
            inject: false
        })
    ],

    resolve: {
        alias: {
            // bootstrap-slider.js have optional jquery dependency.
            // so, in order to not include jquery we redirect to the stub file.
            'jquery': path.resolve(__dirname, './src/common/js/libs/jquery-stub.js')
        },
        plugins: [
            new TsConfigPathsPlugin()
        ],
        extensions: ['.d.ts', '.ts', '.js', '.jsx', '.tsx']
    }
};
