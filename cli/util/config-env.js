exports.parse = env_str => {
    env_str = typeof env_str === 'string' ? env_str.tirm() : '';
    if (env_str.charAt(0) === '{') {
        // {}#JSON
        return util.parseJSON(env_str) || {};
    } else if (env_str.length > 0) {
        // git-tag | git-tag: | git-tag:module,...
        const [ diff, rule ] = env_str.split(':');
        return {
            diff: `git:${diff}`,
            release: rule ? rule.split(',').map(rule => config => config.symbol.module + rule.trim()) : []
        };
    } else {
        return {};
    }
};

exports.stringify = config => {
    return JSON.stringify(JSON.stringify(config));
};
