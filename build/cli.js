#!/usr/bin/env node

const chalk = require('chalk')
const path = require('path')
const shell = require('shelljs')
const webpack = require('webpack')
const webpackDevServer = require('webpack-dev-server');
const devConfig = require('./webpack.dev');


const argv = require('yargs')
    .boolean(['img'])
    .option('p', {
        alias: 'publish',
        describe: 'your project platform'
    }).usage('Usage: paoya [examples][options]')
    .example('paoya init projectName', 'init laya project base on paoya')
    .example('paoya update', 'update sdk')
    .example('paoya dev', 'it is convenient to code')
    .example('paoya -p/--publish wx', 'publish project')
    .example('paoya -p/--publish wx --img false', 'imagemin unuseful')
    .example('paoya build', 'only complile main code -> produce bundle.js')
    .example('paoya build --mini', 'it is pure to uglify')
    .help('h')
    .alias('h', 'help')
    .epilog('BJ copyright 2019').argv

var port = 8080
var host = 'localhost'

if (argv._[0] === 'init') {
    if (argv._[1]) {
        shell.exec(`node ${path.resolve(__dirname, 'paoya.file.js')} init ${argv._[1]}`);
    } else {
        console.log(`${chalk.red('ERROR')}
        usage:${chalk.green('paoya init projectName')}`)
    }
} else if (argv._[0] === 'update') {
    shell.exec(`node ${path.resolve(__dirname, 'paoya.file.js')} update`)
} else if (argv._[0] === 'dev') {
    var devServerOption = Object.assign({}, devConfig.devServer, {
        publicPath: '/bin/js/',
        host: host,
        proxy: {
            "/ServiceCore": 'http://47.96.1.255:8080'
        },
    })
    webpackDevServer.addDevServerEntrypoints(devConfig, devServerOption)
    var compiler = webpack(devConfig)

    var server = new webpackDevServer(compiler, devServerOption)
    server.listen(port, host, () => {
        console.log(`Starting server on ${chalk.green(`http://${host}:${port}`)}
        access to the address: ${chalk.green(`http://${host}:${port}/bin`)}`)
    })
} else if (argv.p) {
    if (argv.p === 'wx') {
        shell.exec(`node ${path.resolve(__dirname, 'build.js')} wxgame --img ${argv.img}`)
    } else {
        console.log(`${chalk.red('ERROR')}
        usage:${chalk.yellow('please choose one platform to publish')}
        for instance:${chalk.green(' paoya -p wx')} or ${chalk.green('paoya -h')} get more info`)
    }
} else if (argv._[0] === 'build') {
    // 纯净压缩
    if(argv.mini){
        shell.exec(`node ${path.resolve(__dirname, 'build.js')} --mini`)
    }else{
        shell.exec(`node ${path.resolve(__dirname, 'build.js')}`)
    }
} else {
    console.log(`${chalk.red('ERROR')}
        usage:${chalk.green('paoya -h, get help info')}`)
}