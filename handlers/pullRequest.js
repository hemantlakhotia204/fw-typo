const { createReview, getModifications } = require("./checkTypo");

const handlePullRequest = async (context) => {
  try {
    const baseBranch = context.payload.pull_request.base.ref;
    const defaultBranch = context.payload.repository.default_branch;
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;
    const pullNumber = context.payload.pull_request.number;

    if (baseBranch == defaultBranch) {
      const dif_url = `GET https://github.com/${owner}/${repo}/pull/${pullNumber}.diff`;
      var response = await context.octokit.request(dif_url);
      const diff = decodeURIComponent(response.data);
      let modifications = await getModifications(diff);

      console.log(modifications);

      if (modifications.length > 0) {
        //creating a review for the pull request
        await createReview(context, owner, repo, pullNumber, modifications);
      }
    }
  } catch (error) {
    context.log.error(error);
  }
};

const handlePullRequestEdited = async (context) => {
  const baseBranch = context.payload.pull_request.base.ref;
  const defaultBranch = context.payload.repository.default_branch;
  const owner = context.payload.repository.owner.login;
  const repo = context.payload.repository.name;
  const pullNumber = context.payload.pull_request.number;

  console.log("Edited");

  if (baseBranch == defaultBranch) {
    const comment_body = context.payload.comment;
    const file_path = comment_body.path;
    const relative_pos = comment_body.position;
    const line_no = comment_body.line;
    const body = comment_body.body;
    console.log(body);

    const target_word = body.match(/"(\w|-|_)+(\.|\?|\!)?"/g)[0].slice(1, -1);
    var selected_word = body.match(/\[x\] .*/gm); 
    if (!selected_word) {
      return console.log("No matching selection word found!");
    } else if (selected_word.length != 1) {
      return console.log("Invalid group selecton: ", target_word);
    } else {
      if (selected_word[0] == "Add to Dictionary") {
        // Add to dictionary.
        console.log("Adding to dictionary")
      } else {
        selected_word = selected_word[0].replace("[x] ", "");
        //update file
      }
      console.log(selected_word, target_word);
    }

  }
};

module.exports = { handlePullRequest, handlePullRequestEdited };
