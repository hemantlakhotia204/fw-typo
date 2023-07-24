/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

const handlePullRequest = require("./handlers/pullRequest");
const handlePush = require("./handlers/push");
module.exports = (app) => {
  // Your code here
  app.log.info("Yay, the app was loaded!");

  // app.on("issues.opened", async (context) => {
  //   const issueComment = context.issue({
  //     body: "Thanks for opening this issue!",
  //   });
  //   return context.octokit.issues.createComment(issueComment);
  // });

  // app.on("push", handlePush);

  app.on(["pull_request.opened", "pull_request.reopened"], handlePullRequest);
};
