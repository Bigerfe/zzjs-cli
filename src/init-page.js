/**
 * 创建page temp
 */
let fs = require('fs');
const PAGE_ROOT = "/src/pages/";
const binRoot = process.mainModule.filename.replace('/bin/index.js', '');
const pageTempRoot = binRoot + '/code-temp/page/temp';
const PageNameSign =/{{PageName}}/g;

function invokeFolder(soureFolder, destFolder,pageName) {
    fs.readdir(soureFolder, function (err, files) {
        if (err) {
            throw err;
        }
        // files是一个数组
        createPageFile(soureFolder, destFolder, files,pageName);
    });
}

function createPageFile(soureFolder, destFolder, files = [],pageName) {
    files.forEach(item => {
       
            let newDestFile = destFolder + '/' + item;
            let newSourceFile = soureFolder + '/' + item;

            console.log('newDestFile', newDestFile);
            console.log('newSourceFile', newSourceFile);

            let stat = fs.statSync(newSourceFile);
            if (stat.isDirectory()) {
                fs.mkdir(newDestFile, (err) => {
                    invokeFolder(newSourceFile, newDestFile,pageName);
                });
            } else {
                fs.readFile(newSourceFile, 'utf-8', (err, data) => {
                    if (err) {
                        throw err;
                    }
                    fs.writeFile(newDestFile, data.replace(PageNameSign,pageName), err => {
                        if (err)
                            throw err;
                        console.log('文件', item, '创建成功');
                    });
                });
            }

       
    });

}

module.exports = function (opt) {
    let {
        pageName
    } = opt;
    let destFolder = process.cwd() + PAGE_ROOT + pageName;


    if (!pageName) return;

    // 创建 newdir 目录
    fs.mkdir(destFolder, function (err) {
        if (err) {
            throw err;
        } else {
            invokeFolder(pageTempRoot, destFolder,pageName.toLowerCase());
        }
        console.log('make dir success.');
    });

}