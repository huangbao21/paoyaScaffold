const path = require('path')

var reg = /\\/g
var projectPath = process.cwd().replace(reg, "/");

module.exports = {
    entry: {
        bundle: `${projectPath}/src/Main.js`,
    },
    output: {
        filename: '[name].js',
        path: path.resolve(projectPath, './bin/js')
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|libs)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [
                        require.resolve(path.resolve(__dirname,'../node_modules/@babel/preset-env'))
                    ],
                    plugins: [
                        require.resolve(path.resolve(__dirname,'../node_modules/@babel/plugin-transform-runtime'))
                    ],
                }
            }
        }]
    },
    resolve:{
        modules: [path.resolve(__dirname, '../node_modules')]
    },
    resolveLoader: {
        modules: [path.resolve(__dirname, '../node_modules')]
    }
}