const child_process = require('child_process');
const path = require('path');


function getBranch(tag, git) {
    let branch = '';
    if (tag === 'auto') {
        try {
            branch = child_process.execSync(
                `git tag --sort -version:refname`,
                { cwd: git }
            ).toString().split('\n')[1];
        } catch (e) {
            throw new Error('Failed to get tag automatically, please specify manually by `tag:tagName` in `option.tag`');
        }
    } else if (/^(tag|branch):/.test(tag)) {
        branch = tag.replace(/^(tag|branch):/, '');
    }
    return branch;
}

exports = module.exports = function createDiff(option) {
    let branch = getBranch(option.tag, option.git);
    if (!branch) {
        throw new Error('Invalid argument: `option.tag` must be auto|tag:tagName|branch:branchName');
    }

    try {
        child_process.execSync(
            `git clone -l -b ${branch} ${option.git} ${option.dir}`
        );
    } catch (e) {
        throw new Error(`Git branch ${branch} not exist.`);
    }

    console.log(`Clone branch: ${branch}`);
    return path.join(
        option.dir,
        option.root.replace(option.git, '')
    );
};
