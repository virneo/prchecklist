const yaml = require('js-yaml')

class Configuration {
  constructor (settings) {
    if (settings === undefined) {
      this.settings = {}
    } else {
      this.settings = yaml.safeLoad(settings)
      if (this.settings.prchecklists === undefined) { throw new Error(Configuration.ERROR_INVALID_YML) }
    }

    this.loadDefaults()
  }

  loadDefaults () {
    if (this.settings.prchecklists == null) this.settings.prchecklists = {}
    if (this.settings.prchecklists.checklist == null) this.settings.prchecklists.checklist = {}
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

Configuration.FILE_NAME = '.github/prchecklists.yml'
Configuration.ERROR_INVALID_YML = 'Invalid prchecklist YML file format. Root prchecklists node is missing.'
Configuration.DEFAULTS = {

}

module.exports = Configuration
