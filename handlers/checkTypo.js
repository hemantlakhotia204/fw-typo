const spell = require("spell-checker-js");
const parseDiff = require("parse-diff");
const Typo = require("typo-js");
const { error } = require("console");

const spellCheck = async (data, position) => {
  try {
    await spell.load({ input: "en", async: true });
    var dict = new Typo("en_US");
    var words = spell.check(data.content);
    var modifiedData = [];

    words.forEach((word) => {
      modifiedData.push({
        suggestions: dict.suggest(word),
        targetWord: word,
        position,
        filePath: data.filePath,
        ln: data.ln,
      });
      // suggestions.push({targetWord: word, words: dict.suggest(word)});
    });

    return modifiedData;
  } catch (e) {
    error(e);
  }

  // check this out: https://www.npmjs.com/package/cypress-spellcheck
  // check this out: https://www.npmjs.com/package/@cantoo/node-languagetool
  // research: https://www.npmjs.com/package/cspell
  // });
};

// funtion to get content from git diff file.
const getModifications = async (diff = "") => {
  var patches = parseDiff(diff);
  var modifications = [];

  for (let i in patches) {
    var patch = patches[i];
    if (patch.additions > 0) {
      const filePath = patch.to;
      for (var j in patch.chunks) {
        var chunk = patch.chunks[j];
        for (var k in chunk.changes) {
          var change = chunk.changes[k];
          if (change.add) {
            const modifedData = await spellCheck(
              { ...change, filePath },
              ++k
            );
            if (modifedData.length > 0) modifications.push(...modifedData);
          }
        }
      }
    }
  }

  return modifications;
};

// function to create a review on pull_request action opened.
const createReview = async (
  context,
  owner,
  repo,
  pullNumber,
  modifications
) => {
  var comments = [];
  for (let i in modifications) {
    var modification = modifications[i];
    var body = `\"${modification.targetWord}\" at ${modification.ln}`;
    modification.suggestions.forEach((s) => {
      body += `\n- [ ] ${s}`;
    });
    body += "\n- [ ] Add to Dictionary";

    comments.push({
      path: modification.filePath,
      position: modification.position,
      body,
    });
  }

  console.log(comments);

  return await context.octokit.pulls.createReview({
    owner,
    repo,
    pull_number: pullNumber,
    body: "Review from bot",
    event: "COMMENT",
    comments,
  });
};

module.exports = { spellCheck, createReview, getModifications };
