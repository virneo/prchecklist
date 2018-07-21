const fetch = require('node-fetch')
const Configuration = require('../lib/configuration')
const prchecklist = require('../lib/prchecklist')

class Handler {
    static async handlePullRequest(context) {
        var pullRequest = context.payload.pull_request
        const checkRunResult = await prchecklist.create(context, 'PRChecklist')
        // let the user know that we are validating if PR is mergeable
        
        var config = await Configuration.instanceWithContext(context)
        console.info(config)
        let settings = config.settings.prchecklists
        let validators = []
        let excludes = (settings.exclude)
            ? settings.exclude.split(',').map(val => val.trim()) : []
        let includes = ['checklist']
            .filter(validator => excludes.indexOf(validator) === -1)

        includes.forEach(validator => {
            validators.push(require(`../lib/${validator}`)(pullRequest, context, settings))
        })

        return Promise.all(validators).then(results => {
            let failures = results.filter(validated => !validated.mergeable)

            let status, description
            if (failures.length === 0) {
                status = 'success'
                description = 'Okay to merge.'
            } else {
                status = 'failure'
                description = `## PRChecklist has found the following failed checks`
                description += `\n **Please verify that checklist is complete.!**`
            }

            prchecklist.update(
                context,
                checkRunResult.data.id,
                'PRChecklist',
                'completed',
                status,
                {
                    title: `Result: ${status}`,
                    summary: description
                })

            console.info({ state: status, description: description })
        }).catch(error => {
            console.error(error)
        })
    }
}

module.exports = Handler