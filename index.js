const Handler = require('./lib/handler')

module.exports = (robot) => {
  robot.on(
    [ 'pull_request',
      'pull_request_review',
      'pull_request_review_comment'
    ],
    context => Handler.handlePullRequest(context)
  )

  robot.on(
    [ 'issue_comment',
      'issues'
    ],
    (context) => { Handler.handleIssue(context) }
  )
}
