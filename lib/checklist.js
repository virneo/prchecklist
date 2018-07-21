module.exports = async (pr, context, settings) => {
    if(context.event == "pull_request.opened" )
        return postChecklist(context, settings.checklist)
    else
        return modify_verifyChecklist(context, settings.checklist, settings.title)
}

const postChecklist = (context, checkList, header) => {
    let mergeable = false
    let body = "<!--prchecklist|15006-->\n" + header + "\n"
    for (let key of checkList){
        body += "- [ ] " + key + "\n"
    }
    body += "<!--prchecklist-->"
    const issue = context.issue({ body })
    context.github.issues.createComment(issue);
    return {mergeable}
}

const modify_verifyChecklist = (context, checkList, header) => {
    let mergeable = false
    let issue = context.issue()
    let pullRequest = context.payload.pull_request
    //let body = pullRequest.data.body
    console.log(pullRequest)
    return {mergeable}
}

const getCheckList = (body) =>{

}