const webpack = require('webpack');
const merge = require('webpack-merge');
const commonConfig = require('./webpack.config.common');

module.exports = merge(commonConfig, {
    mode: 'development',
    /**
     * All values are valid except these: eval, cheap-eval-source-map, cheap-module-eval-source-map, eval-source-map.
     * That's because they don't match Content Security Policy directive.
     * In others words, source map shouldn't be a string that browser must evaluate as JavaScript.
     */
    devtool: 'inline-cheap-source-map',
    output: {
        filename: '[name].js'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ]
});
