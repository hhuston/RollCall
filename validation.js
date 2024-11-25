import { ObjectId } from "mongodb"

let checkId = (id) => {
    if (!id) throw "Must provide an Id"
    if (typeof id !== "string") throw "id must be a string"
    id = id.trim()

    if (id.length === 0) throw "id must not be an empty string"
    if (!ObjectId.isValid(id)) throw "invalid Object ID"

    return id
}

let checkString = (str) => {
    if (!str) throw "Must provide a string"
    if (typeof str !== "string") throw "Must provide a string"
    str = str.trim()

    // We may decide to get rid of this
    if (str.length === 0) throw "string must not be empty"
    
    return str
}

let checkDate = (date) => {
    date = checkString(date)

    //TODO: Check if its a valid MM/DD/YYYY
    return date
}


export {checkId, checkString, checkDate}