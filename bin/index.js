#! /usr/bin/env node

const path = require('path');
const fs = require('fs');

const program = require('commander');
const inquirer = require('inquirer'); //命令行交互工具
const download = require('download-git-repo');
const chalk = require('chalk');
const shelljs = require('shelljs'); //执行shell 命令
const ora = require('ora');


const createPageTemp = require('../src/init-page');
const createComponentTemp = function (params) {

} // require('./init-component');

const COMMAND = ['project', 'page']; //选项

function getCommandIndex(command) {
    return COMMAND.indexOf(command);
}

program
    .version('1.0.0')
    .option('-i, --init', '初始化zz.js项目')
    .option('-p, --page', '帮助创建zz.js page，创建页面需要在zz.js项目的根目录下，否则提示异常')
    //.option('-u, --update', 'update self:更新 krs-cli 工具到最新版,update project 更新项目依赖到最新版');
    .option('-u, --update', '待开发...');

program
    .parse(process.argv);

const nameQuestion = {
    type: 'input',
    message: `项目名称: `,
    name: 'name',
    default: 'zzjs-ssr-project'
};

const versionQuestion = {
    type: 'input',
    message: `初始版本: `,
    name: 'version',
    default: '1.0.0'
};

const initPageQuestion = {
    type: 'input',
    message: `请输入page名称:`,
    name: 'pageName',
    default: 'index'
};

const promptList = {
    type: 'list',
    message: '请选择操作:',
    name: 'command',
    choices: COMMAND,
    filter: function (val) { // 使用filter将回答变为小写
        return val.toLowerCase();
    }
};

const promptList1 = {
    type: "expand",
    message: "请选择",
    name: "fruit",
    choices: [{
            key: "a",
            name: "Apple",
            value: "apple"
        },
        {
            key: "O",
            name: "Orange",
            value: "orange"
        }
    ]
};


//初始化项目
function initProject() {
    inquirer.prompt([
        nameQuestion,
        versionQuestion
    ]).then(function (answers) {
        const spinner = ora('正在从github下载[zz.js]').start();
        download('Bigerfe/koa-react-ssr', answers.name, function (err) {
            console.log(err);
            if (!err) {
                spinner.clear();
                console.info('');
                console.info(chalk.green('-----------------------------------------------------'));
                console.info('');
                spinner.succeed(['项目创建成功,请继续进行以下操作:'])
                console.info('');
                console.info(chalk.cyan(` -  cd ${answers.name}`));
                console.info(chalk.cyan(` -  npm install / yarn`));
                // console.info(chalk.cyan(` -  npm start / npm run dev`));
                console.info('');


                console.info('');
                console.info(chalk.green('-----------------------------------------------------'));
                console.info('');


                fs.readFile(`${process.cwd()}/${answers.name}/package.json`, (err, data) => {
                    if (err) throw err;
                    let _data = JSON.parse(data.toString())
                    _data.name = answers.name
                    _data.version = answers.version
                    let str = JSON.stringify(_data, null, 4);
                    fs.writeFile(`${process.cwd()}/${answers.name}/package.json`, str, function (err) {
                        if (err) throw err;
                        process.exit()
                    })
                });
            } else {
                spinner.warn(['如果发生错误，请在https://github.com/Bigerfe/koa-react-ssr，Issues留言'])
                process.exit()
            }
        })
    });
}

/**
 * 创建page 模板
 * 需要让用户输入页面名称
 */
function initPage() {

    console.log(process.cwd());

    inquirer.prompt([
        initPageQuestion
    ]).then(function (res) {
        if (res.pageName) {
            createPageTemp({
                pageName: res.pageName
            });
        }
    });

    //console.log(process.mainModule.filename); 获得bin root
}

/**
 * 创建组件文件
 */
function initComponent() {
    inquirer.prompt([
        initComponentQuestion
    ]).then(function (res) {
        if (res.componentName) {
            createComponentTemp({
                pageName: res.componentName
            });
        }
    });

}
//更新 cli
function updateCli() {

    const installSpinner = ora('npm installing...').start();
    const install = shelljs.exec(`npm install krs-cli@latest`, {
        silent: true
    });

    if (install.code === 0) {
        installSpinner.color = 'green'
        installSpinner.succeed('update success');
    } else {
        installSpinner.color = 'red'
        installSpinner.fail(chalk.red('install fail, please exec npm install uto-cli@latest youself'))
        console.log(`${install.stderr}${install.stdout}`)
    }

}

//检测当前目录下是否对uto-miniapp-core 存在依赖
function checkUtoCoreDependencies() {
    const path = process.cwd();
    const jsonFile = path + '/package.json';

    return new Promise((resolve) => {
        fs.readFile(jsonFile, (error, data) => {
            if (error) {
                throw new Error(error);
            }
            resolve(data.toString().indexOf('uto-miniapp-core') > -1);
        });

    });
}

/**
 * 项目依赖更新
 */
async function updateProject() {
    //console.log('请确保在当前项目根目录下执行此命令.');
    //读取当前目录下的package.json,判断是否存在uto-miniapp-core 依赖
    const isHasDependencies = await checkUtoCoreDependencies();
    if (!isHasDependencies) {
        console.log('当前目录下的package.json没有依赖 uto-miniapp-core 包,已停止更新');
        return;
    }

    // var childProcess = require('child_process');
    //const spinner = ora('正在更新项目依赖....').start();

    const installSpinner = ora('npm installing...').start();
    const install = shelljs.exec(`npm install uto-miniapp-core@latest`, {
        silent: true
    });

    if (install.code === 0) {
        installSpinner.color = 'green'
        installSpinner.succeed('update success');
    } else {
        installSpinner.color = 'red'
        installSpinner.fail(chalk.red('install fail, please exec npm install uto-miniapp-core@latest youself'))
        console.log(`${install.stderr}${install.stdout}`)
    }
}

//入口
function main() {

    if (program.page) {
        initPage();
    }
    if (program.init) {
       initProject();
    }
    //更新尚未开发
    // if (program.update) {
    //     let lastCommand = process.argv[process.argv.length - 1];
    //     switch (lastCommand) {
    //         case 'self':
    //             updateCli();
    //             break;
    //         case 'project':
    //             updateProject();
    //             break;
    //         default:
    //             console.log('command error');
    //             break;
    //     }

    // }
}

main();