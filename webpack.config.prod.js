const webpack = require('webpack');
const merge = require('webpack-merge');

/*
My own raw plugins. Will be included later.

const RemoveFilesPlugin = require('./temp/remove');
const ReplaceResourcesLinksPlugin = require('./temp/replace');
*/

const commonConfig = require('./webpack.config.common');

module.exports = merge(commonConfig, {
    mode: 'production',
    devtool: 'nosources-source-map',
    output: {
        // When will be included ReplaceResourcesLinksPlugin.
        //filename: "[name].[chunkhash].min.js",
        filename: '[name].js'
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
         * So, we replace [name].js to [name].[contenthash].min.js based on the files names.
         */
        //new ReplaceResourcesLinksPlugin()
    ]
});
