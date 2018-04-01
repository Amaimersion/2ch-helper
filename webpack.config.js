const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        '/interface/js/scripts/popup': './src/interface/popup-build.js'
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
                loader: 'ts-loader'
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
            }
        ]),
        new ExtractTextPlugin({
            filename: '/interface/css/styles/popup.css',
        }),
        new HTMLWebpackPlugin({
            template: './src/interface/html/popup.pug',
            filename: '/interface/html/popup.html',
            inject: false
        })
    ]
};
