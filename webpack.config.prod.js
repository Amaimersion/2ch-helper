const webpack = require('webpack');
const merge = require('webpack-merge');
const ValidateHTMLLinksPlugin = require('validate-html-links-webpack-plugin');

/*
My own raw plugins. Will be included later.

const RemoveFilesPlugin = require('./temp/remove');
*/

module.exports = function(env) {
    env = env || {};

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
             * Remove files after build.
             * Webpack creates empty sources maps for css files.
             * So, we remove them.
             */
            //new RemoveFilesPlugin(),
            /*
             * HTML files contains invalid links for JS files.
             * So, we replace [name].js to [name].[contenthash].min.js.
             */
            new ValidateHTMLLinksPlugin()
        ]
    });
}
