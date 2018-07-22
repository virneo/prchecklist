module.exports = async (pr, context, settings) => {
    return verifyChecklist(context, settings)
}

const createOrEditChecklist = async (context, checkList, header) => {
    let owner = context.payload.repository.owner.login
    let repo = context.payload.repository.name
    let number = context.payload.pull_request.number
    if (checkList && checkList.length > 0) {
        let body = "<!--prchecklist--> \n" + header + "\n"
        for (let key of checkList) {
            body += "- [ ] " + key + "\n"
        }
        await context.github.issues.createComment({ owner, repo, number, body})
    }
}

const verifyChecklist = async (context, settings) => {
    let mergeable = true
    let {found, body, comment_id} = await getCheckList(context)
    if(found){
        if(body){
            for(let str of body){
                let res = str.match(/(-\s\[(\s)])(.*)/gm)
                if(res != null){
                    mergeable = false
                    break
                }
            }
        }else{
            mergeable = false
        }
    }else {
        await createOrEditChecklist(context, settings.checklist, settings.title)
        mergeable = false
    }
    return { mergeable }
}

const getCheckList = async (context) => {
    try{
        let owner = context.payload.repository.owner.login
        let repo = context.payload.repository.name
        let number = context.payload.pull_request.number
        let comments = await context.github.issues.getComments({ owner, repo, number});
        comments = comments.data
        for (let comment of comments){
            let {found, body} = checkPRChecklist(comment.body)
            if(found){
                return {found, body, comment_id:comment.id}
            }
        }
        return false
    } catch(e){
        return true
    }
}

const checkPRChecklist = (str) =>{
    let found = false
    let body = null
    let isBotcomment = str.match(/(<!--prchecklist-->)/g)
    if(isBotcomment == null) return {found, body}
    let res = str.match(/(-\s\[(\s|x)])(.*)/gm)
    if (res && res.length > 0){
        found = true
        body = res
    }
    return {found, body} 
}