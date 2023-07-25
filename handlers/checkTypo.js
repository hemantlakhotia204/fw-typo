const spell = require("spell-checker-js");

const spellCheck = async (lineToCheck) => {
  spell.load("en");
  return spell.check(lineToCheck);
  // lineToCheck.split(" ").map(word => {
  // 1. check for capital letters in between,
  // 2. check for hyphen in between html tags
  // 3. add to dictionary

  // try this: https://www.npmjs.com/package/spell-checker-js

  // check this out: https://www.npmjs.com/package/danger-plugin-git-spellcheck
  // check this out: https://www.npmjs.com/package/cypress-spellcheck
  // check this out: https://www.npmjs.com/package/@cantoo/node-languagetool
  // research: https://www.npmjs.com/package/cspell
  // });
};

const typo = async (lineToCheck) => {
  // replace all special chars from line
  // lineToCheck = lineToCheck.replace(/[^\w\s]/gi, '');
};

module.exports = { spellCheck };
