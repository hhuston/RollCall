import { actions, sessions, users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validation from "../validation.js";

let createAction = async (type, value, actionOwner, sessionId) => {
    let action = {};

    type = type.toLowerCase();
    action.type = validation.checkActionType(type, "Type");
    action.value = validation.checkString(value, "Value");
    action.actionOwner = validation.checkUserName(actionOwner);
    action.votingRecord = { Yay: [], Nay: [], Abstain: [] };
    action.sessionId = validation.checkId(sessionId);
    action.status = "queued"; // (either queued, oncall, or logged)

    const sessionCollection = await sessions();
    const session = await sessionCollection.findOne({ _id: action.sessionId });
    if (!session) throw "Could not find session with that id";

    const userCollection = await users();
    const user = await userCollection.findOne({ userName: action.actionOwner });
    if (!user) throw "Could not find user with that username";

    const actionCollection = await actions();
    const newInsertInformation = await actionCollection.insertOne(action);
    if (!newInsertInformation) throw "Could not add action";
    const actionId = newInsertInformation.insertedId.toString();

    // Add action to its session's action queue
    session.actionQueue.push(actionId);
    const sessionUpdateInfo = await sessionCollection.findOneAndUpdate({ _id: action.sessionId }, { $set: session }, { returnDocument: "after" });
    if (!sessionUpdateInfo) throw `Could not add action to session with id ${sessionId}`;

    return actionId;
};

let deleteAction = async (id) => {
    id = validation.checkId(id);

    const actionCollection = await sessions();
    const deletionInfo = await actionCollection.findOneAndDelete({
        _id: id,
    });

    if (!deletionInfo) throw "Could not delete action with that id";

    return { ...deletionInfo, deleted: true };
};

let getAction = async (id) => {
    id = validation.checkId(id);

    const actionCollection = await sessions();
    const action = await actionCollection.findOne({
        _id: id,
    });

    if (!action) throw "Could not find action with that id";

    return action;
};

let getListofActions = async (actions) => {
    validation.isIdArr(actions, "actions");

    const actionCollection = await sessions();

    actions.map(async (action) => {
        let current_action = await getAction(action);
        return { actionId: current_action._id.toString(), type: current_action.type, value: current_action.value };
    });

    return actions;
};

export default { createAction, deleteAction, getAction, getListofActions };
