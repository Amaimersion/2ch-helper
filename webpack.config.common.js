const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const {TsConfigPathsPlugin} = require('awesome-typescript-loader');

module.exports = {
    entry: {
        '/interface/js/scripts/popup': './src/build/interface/popup-build.js',
        '/interface/js/scripts/settings': './src/build/interface/settings-build.js',
        '/interface/js/scripts/settings-iframe': './src/build/interface/settings-iframe-build.js',
        '/interface/js/scripts/settings-screenshot': './src/build/interface/settings-screenshot-build.js',
        '/interface/js/scripts/settings-download': './src/build/interface/settings-download-build.js',
        '/interface/js/scripts/statistics': './src/build/interface/statistics-build.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.s(c|a)ss$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                minimize: true,
                                sourceMap: false
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: false
                            }
                        }
                    ]
                })
            },
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
        /*
         * Clean before build.
        */
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
            },
            {
                from: './static/interface/js/libs',
                to: './interface/js/libs'
            }
        ]),
        /*
         * Replace with mini-css-extract-plugin, when they do
         * this fucking support for filename function type.
         * https://github.com/webpack-contrib/mini-css-extract-plugin/issues/67
         * https://github.com/webpack-contrib/mini-css-extract-plugin/issues/143
         */
        new ExtractTextPlugin({
            filename: (getPath) => {
                let path = getPath('[name]');

                path = path.replace('/interface/js/scripts/', '/interface/css/styles/');
                path = new RegExp('(\.css$)').test(path) ? path : path.concat('.css');

                return path;
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
            /*
             * "bootstrap-slider.js have optional jquery dependency".
             * "So, in order to not include jquery, we redirect to the stub file".
             * https://github.com/seiyria/bootstrap-slider#how-do-i-exclude-the-optional-jquery-dependency-from-my-build
             */
            jquery: path.resolve(__dirname, './src/common/js/libs/jquery-stub.js'),
            Interface: path.resolve(__dirname, './src/interface')
        },
        plugins: [
            /*
             * "If you want to use new paths and baseUrl feature of TS 2.0 please include TsConfigPathsPlugin".
             * https://github.com/s-panferov/awesome-typescript-loader#advanced-path-resolution-in-typescript-20
             */
            new TsConfigPathsPlugin()
        ],
        extensions: [
            '.ts', '.tsx', '.d.ts',
            '.js', '.jsx',
            '.json',
            '.scss',
            '.pug'
        ]
    },
    externals: [
        function(context, request, callback) {
            if (request === 'bootstrap-slider' && !context.includes('build')) {
                callback(null, 'Slider');
            } else {
                callback();
            }
        }
    ]
};