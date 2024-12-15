import {sessions} from "../config/mongoCollections.js"
import { ObjectId } from "mongodb"
import validation from "../validation.js"

let createSession = async (proposal, proposalOwner, sessionDate) => {
    let session = {}

    session.members = []
    session.proposal = validation.checkString(proposal)
    session.proposalOwner = validation.is_user_id(proposalOwner)
    session.actionQueue = []
    session.sessionDate = validation.checkDate(sessionDate)
    session.open = true

    const sessionCollection = await sessions()
    const newInsertInformation = await sessionCollection.insertOne(session)

    //What do we want to return here?
    //Also, this should be error checked
    return newInsertInformation.insertedId.toString();
}

let deleteSession = async (id) => {
    id = validation.checkId(id)

    const sessionCollection = await sessions()
    const deletionInfo = await sessionCollection.findOneAndDelete({
        _id: new ObjectId(id)
    })

    if (!deletionInfo) throw "Could not delete session with that id"

    return {...deletionInfo, deleted: true}
}

export default {createSession, deleteSession}

