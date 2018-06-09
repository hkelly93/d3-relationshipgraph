/* global module, __dirname */
var path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: './dest/d3.relationshipgraph.js'
    },
    module: {
        preLoaders: [
            {
                test: /\.js?$/,
                include: [
                    path.resolve(__dirname, 'src/index.js')
                ],
                exclude: /(node_modules|bower_components)/,
                loaders: ['jshint']
            },
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'src/index.js')
                ],
                exclude: /(node_modules|bower_components)/,
                loader: 'jscs-loader'
            }
        ],
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel', // 'babel-loader' is also a legal name to reference
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
};
