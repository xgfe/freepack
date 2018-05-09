const fileStat = require('./util/fileStat');


exports = module.exports = option => {
    // const optionsValidationErrors = validateSchema(optionsSchema, options);
    // if (optionsValidationErrors.length) {
    //     throw new Error(optionsValidationErrors);
    // }


    if (!fileStat.isDirectory(option.root)) {
        throw new Error('Invalid argument: `option.root` must be directory');
    }
};
