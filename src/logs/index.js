const colors = require('colors');

module.exports.error = (message, text) => {
  console.log(message, colors.red(text), '\n');
};
