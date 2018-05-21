"use strict";

const fs = require('fs');


exports = module.exports = option => {
    // const optionsValidationErrors = validateSchema(optionsSchema, options);
    // if (optionsValidationErrors.length) {
    //     throw new Error(optionsValidationErrors);
    // }

    if (!(fs.existsSync(option.root) && fs.statSync(option.root).isDirectory())) {
        throw new Error('Invalid argument: `option.root` must be directory');
    }
};
