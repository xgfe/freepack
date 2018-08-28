exports.parse = env => {
    if (typeof env === 'string') {
        env = env.tirm();
        if (env.charAt(0) === '{') {
            // {}#JSON
            return util.parseJSON(env);
        } else if (env.length > 0) {
            // git-tag | git-tag:  | :module | git-tag:module,...
            const index = env.indexOf(':');
            return {
                diff: `git:${env.slice(0, Math.max(index, 0))}`,
                release: env.length > index + 1 ? env.slice(index + 1).split(',').map(rule => {
                    return config => config.symbol.module + rule.trim();
                }) : []
            };
        } else {
            return {};
        }
    } else {
        return null;
    }
};

exports.stringify = config => {
    return JSON.stringify(JSON.stringify(config));
};
