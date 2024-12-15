import {sessions, users, organizations} from "../config/mongoCollections.js"
import { ObjectId } from "mongodb"
import validation from "../validation.js"

let createSession = async (proposal, proposalOwner, orgName, seshName) => {
    //input: proposal, proposalOwner, orgName, seshName
    //output: the whole object, the the ID stringified
    //constraints: the usual
    let session = {}

    validation.exists(orgName, "orgName");
    validation.is_str(orgName, "orgName")
    validation.exists(proposal, "proposal");
    validation.is_str(proposal, "proposal")
    validation.exists(seshName, "seshName");
    validation.is_str(seshName, "seshName")
    validation.exists(proposalOwner, "proposalOwner");
    validation.is_str(proposalOwner, "proposalOwner")
    validation.is_user_id(proposalOwner, "proposalOwner")
    session.members = [{userName: proposalOwner, role:"moderator"}]
    session.proposal = proposal.trim()
    session.proposalOwner = proposalOwner.trim().toLowerCase()
    session.actionQueue = []
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    session.sessionDate = `${month}/${day}/${year}`
    session.open = true
    session.orgName = orgName
    session.seshName = seshName
    const UserCollection = await users();
    const OrgCollection = await organizations()
    const Org = await OrgCollection.findOne({orgName: orgName});
    if (!Org) {
        throw 'No organization matches the provided orgName'
    }

    let sessions_list = Org.sessions
    const User = await UserCollection.findOne({userName: proposalOwner})
    if (!User) {
        throw 'No user matches the provided proposalOwner'
    }

    const sessionCollection = await sessions()
    const repeatSesh = await sessionCollection.findOne({seshName: seshName})
    if (repeatSesh && repeatSesh.Date == session.Date) {
        throw 'the provided seshName already exists on this date'
    }
    const newInsertInformation = await sessionCollection.insertOne(session)
    sessions_list.push(newInsertInformation.insertedId.toString())

    let new_org_obj = {
        sessions: sessions_list
    }
    const updatedInfoOrg = await OrgCollection.findOneAndUpdate(
        {orgName: orgName},
        {$set: new_org_obj},
        {returnDocument: 'after'}
    );
    session._id = newInsertInformation.insertedId.toString()

    return session
}

const getSession = async (
    seshID
    ) => {
    //Args: seshID
    //successful output: whole object
    //constraints: seshID must be a valid objectId
    validation.exists(seshID, "orgID")
    validation.is_str(seshID, "orgID")
    let object_id = validation.is_obj_id(seshID)
    const SeshCollection = await sessions();
    const Sesh = await SeshCollection.findOne({_id: object_id});
    if (!Sesh) {
        throw 'No session with that ID'
    }
    Sesh._id = Sesh._id.toString()
    return Sesh
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

export default {createSession, deleteSession, getSession}

