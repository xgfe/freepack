exports.parseJSON = str => {
    try {
        return JSON.parse(str);
    } catch (e) {}
};
