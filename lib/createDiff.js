"use strict";

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');


function getBranch(git, branch) {
    try {
        return branch || child_process.execSync(
            `git tag --sort -version:refname`,
            { cwd: git }
        ).toString().split('\n')[1];
    } catch (e) {}
}

exports = module.exports = function createDiff(cache, git, tag) {
    const repository = path.join(git.replace(/\.git$/, ''), '.git');
    if (!(fs.existsSync(repository) && fs.statSync(repository).isDirectory())) {
        throw new Error(`git repository [${git}] not exit`);
    }

    const branch = getBranch(repository, tag);
    if (!branch) {
        throw new Error(`git repository [${repository}] not exist commit ${tag}`);
    }

    try {
        child_process.execSync(
            `git clone -l -b ${branch} ${repository} ${cache} >& /dev/null`
        );
    } catch (e) {
        throw new Error(`Git branch ${branch} not exist.`);
    }

    return branch;
};
