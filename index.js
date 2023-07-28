/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

const {handlePullRequest, handlePullRequestEdited} = require("./handlers/pullRequest");
module.exports = (app) => {
  // Your code here
  app.log.info("Yay, the app was loaded!");
  // app.onAny((context) => console.log(context.payload));

  // app.on("issues.opened", async (context) => {
  //   const issueComment = context.issue({
  //     body: "Thanks for opening this issue!",
  //   });
  //   return context.octokit.issues.createComment(issueComment);
  // });

  // app.on("push", handlePush);

  app.on(["pull_request.opened", "pull_request.reopened"], handlePullRequest);

  app.on(["pull_request_review_comment.edited"], handlePullRequestEdited);
};
