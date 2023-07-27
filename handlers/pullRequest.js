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

module.exports = handlePullRequest;
