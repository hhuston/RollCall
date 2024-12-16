import { sessions, users, organizations } from "../config/mongoCollections.js";
import validation from "../validation.js";
import session from "express-session";

let createSession = async (proposal, proposalOwner, orgName, seshName) => {
    //input: proposal, proposalOwner, orgName, seshName
    //output: the whole object, the the ID stringified
    //constraints: the usual
    let session = {};
    orgName = validation.checkOrgName(orgName);
    proposal = validation.checkString(proposal, "Proposal");
    seshName = validation.checkString(seshName, "Session Name");
    proposalOwner = validation.checkUserName(proposalOwner);

    session.members = [{ userName: proposalOwner, role: "moderator" }];
    session.actionQueue = [];
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();
    session.sessionDate = `${month}/${day}/${year}`;
    session.open = true;
    session.orgName = orgName;
    session.seshName = seshName;
    const UserCollection = await users();
    const OrgCollection = await organizations();
    const Org = await OrgCollection.findOne({ orgName: { $regex: new RegExp(orgName, "i") } });
    if (!Org) {
        throw "No organization matches the provided orgName";
    }

    let sessions_list = Org.sessions;
    const User = await UserCollection.findOne({ userName: proposalOwner });
    if (!User) {
        throw "No user matches the provided proposalOwner";
    }

    const sessionCollection = await sessions();
    const repeatSesh = await sessionCollection.findOne({ seshName: seshName });
    if (repeatSesh && repeatSesh.Date == session.Date) {
        throw "the provided seshName already exists on this date";
    }
    const newInsertInformation = await sessionCollection.insertOne(session);
    sessions_list.push(newInsertInformation.insertedId.toString());

    let new_org_obj = {
        sessions: sessions_list,
    };
    const updatedInfoOrg = await OrgCollection.findOneAndUpdate({ orgName: { $regex: new RegExp(orgName, "i") } }, { $set: new_org_obj }, { returnDocument: "after" });
    session._id = newInsertInformation.insertedId.toString();

    return session;
};

const getSession = async (seshID) => {
    //Args: seshID
    //successful output: whole object
    //constraints: seshID must be a valid objectId
    seshID = validation.checkId(seshID);
    const SeshCollection = await sessions();
    const Sesh = await SeshCollection.findOne({ _id: seshID });
    if (!Sesh) {
        throw "No session with that ID";
    }
    Sesh._id = Sesh._id.toString();
    return Sesh;
};

const joinSession = async (sessionId, role, userName) => {
    //Args: seshID
    //successful output: whole object
    //constraints: seshID must be a valid objectId
    role = validation.checkSessionRole(role);
    sessionId = validation.checkId(sessionId);
    userName = validation.checkUserName(userName, "Session User Name");
    const SeshCollection = await sessions();
    const Sesh = await SeshCollection.findOne({ _id: sessionId });
    if (!Sesh) {
        throw "No session with that ID";
    }
    if (Sesh.members.some((mem) => mem.userName === userName)) {
        throw "You are already in the session";
    }
    Sesh.members.push({ userName: validation.checkUserName(userName), role: validation.checkSessionRole(role) });
    const deletionInfo = await SeshCollection.findOneAndUpdate({ _id: sessionId }, { $set: Sesh }, { returnDocument: "after" });
    Sesh._id = Sesh._id.toString();
    return Sesh;
};

let deleteSession = async (id) => {
    id = validation.checkId(id);

    const sessionCollection = await sessions();
    const deletionInfo = await sessionCollection.findOneAndDelete({
        _id: id,
    });

    if (!deletionInfo) throw "Could not delete session with that id";

    return { ...deletionInfo, deleted: true };
};

let endSession = async (id) => {
    id = validation.checkId(id);

    const sessionCollection = await sessions();
    const updateInfo = await sessionCollection.updateOne({ _id: id }, { $set: { open: false } });

    if (!updateInfo || updateInfo.acknowledged === false) throw Error("Could not update session with that ID");
    
    return updateInfo;
}

let leaveSession = async (sessionId, userName) => {
    sessionId = validation.checkId(sessionId);
    userName = validation.checkUserName(userName);

    const sessionCollection = await sessions();
    const updatedInfo = await sessionCollection.findOneAndUpdate({ _id: sessionId }, { $pull: { members: userName } }, { projection: { _id: 0, orgName: 1 } });

    if (!updatedInfo) throw "Could not remove user from session";

    return updatedInfo.orgName;
};

export default { createSession, deleteSession, getSession, joinSession, endSession, leaveSession };
