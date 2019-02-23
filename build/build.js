const webpack = require('webpack')
const merge = require('webpack-merge')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require("copy-webpack-plugin")
const ImageminPlugin = require('imagemin-webpack-plugin').default
const baseConfig = require('./webpack.base')
const webpackProdConfig = require('./webpack.prod')
const glob = require('glob')
const path = require('path')
const argv = require('yargs')
.boolean(['img']).argv

process.env.NODE_ENV = 'production'
var reg = /\\/g
var projectPath = process.cwd().replace(reg, "/");
var mainConfig = merge(baseConfig, {
    mode: 'none',
    devtool: 'inline-source-map'
})
if (argv.mini){
    console.log('---------纯净压缩----------');
    mainConfig.mode = 'production';
    mainConfig.devtool = 'none'
}

var statsConfig = {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
}
var cleanOptions = {
    root: `${projectPath}/release`,
    verbose: true,
    dry: false
}
var copyOptions = {
    from: `${projectPath}/bin`,
    ignore: ['js/*.js', '**/!(index|game|fundebug|Dom/)*.js', '.rec', 'remote/**/*.jpg', 'remote/**/*.png', 'remote/**/*.atlas', '**/remote/**/*.png', '**/remote/**/*.jpg', '**/remote/**/*.atlas']
}
var targetDir;
webpack(mainConfig, (err, stats) => {
    if (err) throw err
    process.stdout.write(stats.toString(statsConfig) + '\n\n')
    if (argv._[0] && argv._[0] === 'wxgame') {
        targetDir = 'wxgame'
        wxgameService()
    }
})
function wxgameService() {
    var entry = {}
    glob.sync(`${projectPath}/bin/**/!(fundebug|game|index)*.js`).forEach((file, index, array) => {
        var strIndex = file.indexOf('bin/');
        var key = `${file.substring(strIndex + 4, file.length - 3)}`
        if (key.indexOf('Dom/') == -1 && key.indexOf('platform.qq') == -1 && key.indexOf('platform.browser') == -1) {
            entry[key] = file
        }
    })
    // console.log(entry)
    // return
    // // entry['js/bundle'] = `${projectPath}/bin/js/bundle.js`

    webpackProdConfig.entry = entry
    webpackProdConfig.output.path = path.resolve(projectPath, './release/' + targetDir)
    copyOptions.to = `${projectPath}/release/${targetDir}`

    copyOptions.ignore = [...copyOptions.ignore, ...['swan-game-adapter.js']];
    executeWebpack()

}
function executeWebpack() {
    webpackProdConfig.plugins = [
        new CleanWebpackPlugin([targetDir], cleanOptions),
        new CopyWebpackPlugin([copyOptions]),
    ]
    if (argv.img) {
        console.log("----------压缩图片----------")
        webpackProdConfig.plugins.push(new ImageminPlugin({
            test: /\.(jpe?g|png|gif|svg)$/i,
            minFileSize: 10000,
            maxFileSize: 700000
        }))
    }
    webpack(webpackProdConfig, (err, stats) => {
        if (err) throw err
        process.stdout.write(stats.toString(statsConfig) + '\n\n')
    })
}