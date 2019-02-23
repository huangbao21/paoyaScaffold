const merge = require('webpack-merge')
const baseConfig = require('./webpack.base')

module.exports = merge(baseConfig, {
    mode: 'development',
    // devServer: {
    //     port: 8080,
    //     proxy: {
    //         "/ServiceCore": 'http://47.96.1.255:8080'
    //     }
    // },
    devtool: 'eval-source-map',
    plugins: [
    ],
    module: {
    }
})    