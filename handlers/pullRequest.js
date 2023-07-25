const { spellCheck } = require("./checkTypo");

const handlePullRequest = async (context) => {
  try {
    const baseBranch = context.payload.pull_request.base.ref;
    const defaultBranch = context.payload.repository.default_branch;
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    if (baseBranch == defaultBranch) {
      const pullNumber = context.payload.pull_request.number;
      var response = await context.octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: pullNumber,
      });
      var files = response.data;

      for (var i in files) {
        let patch = files[i].patch;
        /**
         * example: "@@ -8,9 +8,9 @@
         * let users = [\n \n export class TestView extends LitElement
         * {\n   static properties = {\n-    items: {},\n-    nameAttribute: {},
         * \n-    secondaryAttribute: {},\n+    items: Array,\n+    nameAttribute: String,
         * \n+    secondaryAttribute: String,\n   };\n \n   constructor() {"
         */
        let lines = patch.split("\n");
        lines.map((line) => {
          if (line.startsWith("+")) {
            let lineToCheck = line.replace("+", "").trim();

            const data = spellCheck(lineToCheck);
            context.log.info(data);
            if (data.length == 0)
              context.log.info("No typos found in line: " + lineToCheck);
          }
        });
      }
    }
  } catch (error) {
    context.log.error(error);
  }
};

module.exports = handlePullRequest;
