const fs = require('fs');
const path = require('path');


exports = module.exports = function readConfig(subPath) {
  const configPath = path.join(process.cwd(), subPath);

  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath));
    } catch (e) {
      return require(configPath);
    }
  }
};
