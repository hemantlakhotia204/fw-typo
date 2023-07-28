const spell = require("spell-checker-js");
const parseDiff = require("parse-diff");
const gitdiffParser = require("gitdiff-parser");
const Typo = require("typo-js");
const { error } = require("console");

const checkWord = async () => {};

const spellCheck = async (dict, words_dict) => {
  try {
    // var modifications = [];

    words_dict.forEach((word) => {
      var suggestions = dict.suggest(word.target_word);
      word.suggestions = suggestions;
    });

    return words_dict;
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
  //load dictionaries;
  await spell.load({ input: "en", async: true });
  var dict = new Typo("en_US");

  var patches = parseDiff(diff);
  // var patches = gitdiffParser.parse(diff);
  var modifications = [];
  var words_dict = [];

  for (let i in patches) {
    var patch = patches[i];
    if (patch.additions > 0) {
      const file_path = patch.to;
      for (var j in patch.chunks) {
        var chunk = patch.chunks[j];
        for (var k in chunk.changes) {
          var change = chunk.changes[k];
          if (change.add) {
            // get list of words with typo mistk.
            var target_words = spell.check(change.content);
            if (target_words.length > 0) {
              // looping through the target_words.
              for (i in target_words) {
                var target_word = target_words[i];
                var find_word_index = words_dict.findIndex(
                  (word) => word.target_word == target_word
                );

                // if [target_word] exists in words_dict,
                // update appearance atrribute.
                // else push new object to word_dict.
                if (find_word_index != -1) {
                  words_dict[find_word_index].appearance.push({
                    position: ++k,
                    line_no: change.ln,
                    file_path,
                  });
                } else {
                  words_dict.push({
                    target_word,
                    suggestions: [],
                    appearance: [
                      { position: ++k, line_no: change.ln, file_path },
                    ],
                  });
                }
              }
            }

            modifications = await spellCheck(dict, words_dict);
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
  modifications,
  base_branch
) => {
  var comments = [];
  for (let i in modifications) {
    var modification = modifications[i];
    var body = `Typo found: "${modification.target_word}"`;
    modification.appearance.forEach((appearance) => {
      body += `\n\tat line ${appearance.line_no} in [${appearance.file_path}](https://github.com/${owner}/${repo}/blob/${base_branch}/${appearance.file_path})`;
    });
    // modification.suggestions.forEach((s) => {
    //   body += `\n- [ ] ${s}`;
    // });
    body += "\n- [ ] Add to Dictionary";

    comments.push({
      path: modification.appearance[0].file_path,
      position: modification.appearance[0].position,
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
