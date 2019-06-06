#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const program = require('commander');
const version = require('../package.json').version;

const readObj = (obj, prop) => {
    let propArr = prop.split('.');
    let result = obj;
    propArr.forEach(p => {
        result = result[p]
    })
    return result;
};

const readJson = (subpath, props) => {
    return new Promise((resolve, reject) => {
        const filepath = path.resolve(process.cwd(), subpath);
        const isExists = fs.existsSync(filepath);
        if (isExists) {
            let fileContent = fs.readFileSync(filepath).toString('utf-8');
            let fileObj = {};
            try {
                fileObj = JSON.parse(fileContent);
                resolve(fileObj);
            } catch (e) {
                reject(`file: ${subpath} can not be parsed as JSON:\n ${e}`);
            }
        } else {
            reject('file: ${subpath} can not be found');
        }
    })
}

const printJson = (obj, props) => {
    if (Array.isArray(props) && props.length > 0) {
        props.forEach(prop => {
            console.log(JSON.stringify(readObj(obj, prop), null, 4));
        });
    } else {
        console.log(JSON.stringify(obj, null, 4));
    }
}

const printJsonAfterRead = (subpath, props) => {
    return readJson(subpath)
        .then(obj => {
            printJson(obj, props)
        });
};

const printKeysAfterRead = (subpath, prop) => {
    return readJson(subpath)
        .then(obj => {
            let target = prop !== undefined ? readObj(obj, prop) : obj;
            (target && typeof target === 'object')
                ? console.log(Object.keys(target))
                : console.log('no prop exists in target');
        });
};

program
    .version(version);

program.arguments('<file> [props...]')
    .action(printJsonAfterRead);

program.command('read <file> [props...]')
    .action(printJsonAfterRead);

program.command('keys <file> [prop]')
    .action(printKeysAfterRead)

program.parse(process.argv);
