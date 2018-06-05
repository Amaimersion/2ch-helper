const webpack = require('webpack');
const merge = require('webpack-merge');
const ValidateHTMLLinksPlugin = require('validate-html-links-webpack-plugin');
const RemovePlugin = require('remove-files-webpack-plugin');

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
            new RemovePlugin({
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
            new ValidateHTMLLinksPlugin()
        ]
    });
}
