module.exports = async (pr, context, settings) => {
    createOrEditChecklist(context, settings.checklist, settings.title)
    return verifyChecklist(context)
}

const createOrEditChecklist = async (context, checkList, header) => {
    let owner = context.payload.repository.owner.login
    let repo = context.payload.repository.name
    let number = context.payload.number
    let {found, body, comment_id} = await getCheckList(context)
    if (!found && checkList.length > 0) {
        body = header + "\n"
        for (let key of checkList) {
            body += "- [ ] " + key + "\n"
        }
        await context.github.issues.createComment({ owner, repo, number, body})
    }
}

const verifyChecklist = async (context) => {
    let mergeable = true
    let {found, body, comment_id} = await getCheckList(context)
    if(found){
        for(let str of body){
            let res = str.match(/(-\s\[(\s)])(.*)/gm)
            if(res != null){
                mergeable = false
                break
            }
        }
    }
    return { mergeable }
}

const getCheckList = async (context) => {
    try{
        let owner = context.payload.repository.owner.login
        let repo = context.payload.repository.name
        let number = context.payload.number
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
        return false
    }
}

const checkPRChecklist = (str) =>{
    let res = str.match(/(-\s\[(\s|x)])(.*)/gm)
    let found = false
    let body = null
    if (res && res.length > 1){
        found = true
        body = res
    }
    return {found, body} 
}