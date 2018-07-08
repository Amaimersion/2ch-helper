const webpack = require('webpack');
const merge = require('webpack-merge');
const ValidateHTMLLinksPlugin = require('validate-html-links-webpack-plugin');
const RemovePlugin = require('remove-files-webpack-plugin');


//#region Custom plugins.

const fs = require('fs');
const path = require('path');

class FixManifestPlugin {
    constructor(platform) {
        this.platform = platform;
    }

    apply(compiler) {
        compiler.hooks.afterEmit.tapAsync('fix-manifest-plugin', (compilation, callback) => {
            this.handleAfterEmitHook(compilation, callback);
        });
    }

    handleAfterEmitHook(compilation, callback) {
        console.log(this.platform);
        const files = fs.readdirSync(path.join(__dirname, 'dist', this.platform, 'interaction'));
        let manifest = fs.readFileSync(path.join(__dirname, 'dist', this.platform, 'manifest.json'), {encoding: 'utf-8'});

        for (let name of ['content', 'background']) {
            const regexp = new RegExp(`(${name})(.*)(\.js$)`, 'm');

            for (let file of files) {
                if (regexp.test(file)) {
                    manifest = manifest.replace(`${name}.js`, file);
                    break;
                }
            }
        }

        fs.writeFileSync(path.join(__dirname, 'dist', this.platform, 'manifest.json'), manifest);

        callback();
    }
}

//#endregion


module.exports = function(env) {
    env = env || {};

    const platform = env.platform ? env.platform : 'chromium';
    const commonConfig = require('./webpack.config.common')(env);

    return merge(commonConfig, {
        mode: 'production',
        devtool: 'nosources-source-map',
        output: {
            filename: "[name].[chunkhash].min.js",
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('production')
            }),
            /*
             * Webpack creates empty sources maps for css files.
             * So, we remove them.
             */
            env.dontRemove ? {apply: () => {return true}} : new RemovePlugin({
                after: {
                    root: __dirname,
                    test: [
                        {
                            folder: `dist/${platform}/interface/css/styles`,
                            method: (filePath) => {
                                return new RegExp(/\.map$/, 'm').test(filePath);
                            }
                        }
                    ]
                }
            }),
            /*
             * HTML files contains invalid links for JS files.
             * So, we replace [name].js to [name].[contenthash].min.js.
             */
            new ValidateHTMLLinksPlugin(),
            new FixManifestPlugin(platform)
        ]
    });
}
