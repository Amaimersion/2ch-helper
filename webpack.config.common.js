const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const RemovePlugin = require('remove-files-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const {TsConfigPathsPlugin} = require('awesome-typescript-loader');

class CreateManifestPlugin {
    constructor(options) {
        this.pluginName = 'create-manifest-plugin';
        this.commonManifestPath = options.commonManifestPath;
        this.platformManifestPath = options.platformManifestPath;
        this.resultManifestPath = options.resultManifestPath;
    }

    apply(compiler) {
        /**
         * webpack 4+ comes with a new plugin system.
         * Check for hooks in-order to support old plugin system.
         */
        if (compiler.hooks) {
            compiler.hooks.emit.tapAsync(this.pluginName, (compilation, callback) => {
                this.handleEmit(compilation, callback);
            });
        } else {
            compiler.plugin('emit', (compilation, callback) => {
                this.handleEmit(compilation, callback);
            });
        }
    }

    handleEmit(compilation, callback) {
        const commonManifest = require(this.commonManifestPath);
        const platformManifest = require(this.platformManifestPath);

        const resultManifest = merge(commonManifest, platformManifest);

        compilation.assets[this.resultManifestPath] = {
            source: () => {
                return JSON.stringify(resultManifest);
            },
            size: () => {
                return resultManifest.length;
            }
        };

        callback();
    }
}

module.exports = function(env) {
    env = env || {};
    const platform = env.platform ? env.platform : 'chromium';

    return {
        entry: {
            '/interface/js/scripts/popup': './src/build/interface/popup-build.js',
            '/interface/js/scripts/settings': './src/build/interface/settings-build.js',
            '/interface/js/scripts/settings-iframe': './src/build/interface/settings-iframe-build.js',
            '/interface/js/scripts/settings-screenshot': './src/build/interface/settings-screenshot-build.js',
            '/interface/js/scripts/settings-download': './src/build/interface/settings-download-build.js',
            '/interface/js/scripts/statistics': './src/build/interface/statistics-build.js',
            '/interaction/js/scripts/content/content': './src/build/interaction/content.js',
            '/interaction/js/scripts/background/background': './src/build/interaction/background.js'
        },
        output: {
            path: path.resolve(__dirname, 'dist', platform)
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
            new RemovePlugin({
                before: {
                    root: __dirname,
                    include: [`dist/${platform}`]
                }
            }),
            new CopyWebpackPlugin([
                {
                    from: './static/interface',
                    to: './interface'
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
            }),
            new CreateManifestPlugin({
                commonManifestPath: './src/manifest/common.json',
                platformManifestPath: `./src/manifest/${platform}.json`,
                resultManifestPath: 'manifest.json'
            }),
        ],
        resolve: {
            alias: {
                Interface: path.resolve(__dirname, './src/interface'),
                Interaction: path.resolve(__dirname, './src/interaction')
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
        }
    }
}
