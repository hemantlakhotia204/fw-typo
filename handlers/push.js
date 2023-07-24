const handlePush = async (context) => {
  context.log.info(context.payload);
  //   if(context.payload.repository.default_branch == context.payload.)

  const issueComment = context.issue({
    body: "Some issue",
  });
  return context.octokit.issues.createComment(issueComment);
};

module.exports = handlePush;
