"use strict";

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');


function getBranch(tag, git) {
    let branch = '';
    if (tag === 'auto') {
        try {
            branch = child_process.execSync(
                `git tag --sort -version:refname`,
                { cwd: git }
            ).toString().split('\n')[1];
        } catch (e) {}
    } else if (/^(tag|branch):/.test(tag)) {
        branch = tag.replace(/^(tag|branch):/, '');
    }
    return branch;
}

exports = module.exports = function createDiff(option) {
    const git = option.git.replace(/\.git$/, '');

    const repository = path.join(git, '.git');
    if (!(fs.existsSync(repository) && fs.statSync(repository).isDirectory())) {
        throw new Error(`git repository [${git}] not exit`);
    }

    let branch = getBranch(option.tag, git);
    if (!branch) {
        throw new Error('Invalid argument: `option.tag` must be auto|tag:tagName|branch:branchName');
    }

    try {
        child_process.execSync(
            `git clone -l -b ${branch} ${git} ${option.dir} >& /dev/null`
        );
    } catch (e) {
        throw new Error(`Git branch ${branch} not exist.`);
    }

    console.log(`diff branch: ${branch}`);
    return path.join(
        option.dir,
        option.root.replace(git, '')
    );
};
