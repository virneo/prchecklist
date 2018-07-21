const yaml = require('js-yaml')

class Configuration {
  constructor (settings) {
    if (settings === undefined) {
      this.settings = {}
    } else {
      this.settings = yaml.safeLoad(settings)
      if (this.settings.prchecklist === undefined) { throw new Error(Configuration.ERROR_INVALID_YML) }
    }

    this.loadDefaults()
  }

  loadDefaults () {
    let pullRequestOrIssuesSubOptionExists = false
    if (this.settings.prchecklist == null) this.settings.prchecklist = {}
    if (this.settings.prchecklist.pull_requests) pullRequestOrIssuesSubOptionExists = true

    for (let key in Configuration.DEFAULTS) {
      if (!pullRequestOrIssuesSubOptionExists && this.settings.prchecklist[key] === undefined) {
        this.settings.prchecklist[key] = Configuration.DEFAULTS[key]
      }
    }
  }

  static instanceWithContext (context) {
    let github = context.github
    let repo = context.repo()

    return github.repos.getContent({
      owner: repo.owner,
      repo: repo.repo,
      path: Configuration.FILE_NAME
    }).then(res => {
      let content = Buffer.from(res.data.content, 'base64').toString()
      return new Configuration(content)
    }).catch(error => {
      if (error.code === 404) return new Configuration()
      else throw error
    })
  }
}

Configuration.FILE_NAME = '.github/prchecklist.yml'
Configuration.ERROR_INVALID_YML = 'Invalid prchecklist YML file format. Root prchecklist node is missing.'
Configuration.DEFAULTS = {
  label: 'work in progress|do not merge|experimental|proof of concept',
  title: 'wip|dnm|exp|poc'
}

module.exports = Configuration
