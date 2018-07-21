module.exports = async (pr, context, settings) => {
    let desc = pr.body
    let mergeable = false
    return {mergeable, description: desc}
}

const postChecklist = (context, checkList) => {
    console.log("postchecklist")
}

const verifyChecklist = (context, checkList) => {
    console.log("verifyChecklist")
}