
const glob = require('glob')
const path = require('path')
const argv = require('yargs').argv
const fs = require('fs');
const stat = fs.stat;

var reg = /\\/g
// 末尾不带 /
var inputSrc = path.resolve(__dirname, "../").replace(reg,"/")
// 末尾不带 /
var outputDst = process.cwd().replace(reg,"/");

var countNum = 0;
var completeNum = 0;

var vscodeCmd = 'init';

//文件匹配用的是glob语法，详情可自行前往，https://github.com/isaacs/node-glob。以下将简单介绍
//  * 匹配0或多个除了 / 以外的字符
//  ?匹配单个除了 / 以外的字符
//  ** 匹配多个字符包括 /
//  {} 可以让多个规则用, 逗号分隔，起到或者的作用
//  !出现在规则的开头，表示取反。即匹配不命中后面规则的文件
// 
//init: 第一次copy sdk 设置的忽略文件
// update: 后期更新sdk 设置的忽略文件，更新时，init 已经忽略的就不必再次设置了。也可以根据项目的特点自行更改update元素
var ignoreConfig = {
    init: [
        '.svn',
        '*.laya',
        'node_modules',
        '.vscode',
        'release',
        'build',
        '{package.json,package-lock.json}'
    ],

    update: [
        '**/gamescenes',
        '**/.laya',
        '*.json',
        '.laya',
        'bin/*.html',
        'bin/project.config.json',
        'bin/version.json',
        'bin/weapp-adapter.js',
        'bin/swan-game-adapter.js',
        'bin/fileconfig.json',
        'laya/ignore.cfg',
        'bin/Dom',
        'bin/share',
        'bin/gameConfig.json',
        'bin/game.js',
        'bin/game.json',
        'bin/unpack.json',
        'laya/styles.xml',
        'laya/assets/**/game',
        'src/!(scripts)'
    ]
}
var ignoreInitArrray = [];

function initProject() {
    // 生成项目工程文件
    fs.readFile(inputSrc+'/laya2.laya',{flag:'r+',encoding:'utf8'},(err,data)=>{
        let fileJson = JSON.parse(data);
        fileJson.proName = argv._[1]
        fileJson = JSON.stringify(fileJson)
        fs.writeFile(outputDst + `/${argv._[1]}.laya`,fileJson,(err)=>{
            if(err)throw err
        })
    })
    var updateData = fs.readFileSync(inputSrc + '/build/paoya.config.json');
    fs.writeFileSync(outputDst + `/paoya.config.json`, updateData)

    let ignoreCount = 0;
    ignoreConfig.init.forEach((ignoreFile) => {
        glob(inputSrc + "/" + ignoreFile, (err, files) => {
            if (err) throw err;
            ignoreCount++;
            ignoreInitArrray = ignoreInitArrray.concat(files)
            if (ignoreCount == ignoreConfig.init.length) {
                copyFile(inputSrc, outputDst)
            }
        })
    })
}
function updateProject() {
    console.log('------update------')
    let ignoreCount = 0;
    // let ignoreArray = ignoreConfig.init.concat(ignoreConfig.update);
    let ignoreArray = [...ignoreConfig.init,...ignoreConfig.update]
    fs.readFile(outputDst + '/paoya.config.json', { flag: 'r+', encoding: 'utf8' }, (err, data) => {
        if (err) {
            throw err
        }
        let updateJson = JSON.parse(data);
        ignoreArray = [...ignoreArray,...updateJson.ignore]

        ignoreArray.forEach((ignoreFile) => {
            glob(inputSrc + "/" + ignoreFile, (err, files) => {
                if (err) throw err;
                ignoreCount++;
                ignoreInitArrray = ignoreInitArrray.concat(files)
                if (ignoreCount == ignoreArray.length) {
                    copyFile(inputSrc, outputDst)
                }
            })
        })
    })
}

/**
 * 
 * @param {*} origin 源文件地址
 * @param {*} dest 输出地址
 */
function copyFile(origin, dest) {

    fs.readdir(origin, (err, paths) => {
        if (err) {
            console.error(paths);
            throw err
        }
        countNum += paths.length;
        for (let index = 0; index < paths.length; index++) {
            let path = paths[index];
            let originPath = origin + "/" + path;
            let outputPath = dest + "/" + path;
            let frs;
            let fws;
            
            if (ignoreInitArrray.indexOf(originPath) > -1){
                countNum--;
                continue;
            } 
            stat(originPath, (err, st) => {
                if (err) {
                    console.error(originPath);
                    throw err
                }
                if (st.isFile()) {
                    frs = fs.createReadStream(originPath);
                    fws = fs.createWriteStream(outputPath)
                    frs.pipe(fws);
                    completeNum++

                } else if (st.isDirectory()) {
                    existsDir(originPath, outputPath, copyFile)
                    completeNum++
                }
                if (completeNum == countNum && process.argv[2] == 'init') {
                    console.log('----------init----------')
                }
                if(completeNum == countNum && process.argv[2] == 'update'){
                    console.log('----------updating----------')
                }
            })
        }
    })
}
function existsDir(origin, dest, callback) {
    fs.access(dest, (err) => {
        if (err) {
            fs.mkdir(dest, () => {
                callback(origin, dest);
            })
        } else {
            callback(origin, dest);
        }
    })
}

function init() {
    console.log('------initiation------')
    fs.access(outputDst, (err) => {
        if (err) {
            fs.mkdir(outputDst, () => {
                initProject()
            })
        } else {
            fs.readdir(outputDst,(err,files)=>{
                if(err)throw err
                if(files.length > 0){
                    console.log('ERROR 请到空目录下创建项目！')
                    return
                }else{
                    initProject()
                }
            })
           
        }
    })
}
console.log("输出目录：", outputDst)
if (process.argv[2] == 'init') {
    init();
} else if (process.argv[2] == 'update') {
    updateProject();
}
// vscode 运行 
if (process.execArgv[0] && process.execArgv[0].indexOf('--inspect-brk') != -1) {
    if (vscodeCmd == 'init'){
        init();
    }else if(vscodeCmd == 'update'){
        updateProject();
    }
}