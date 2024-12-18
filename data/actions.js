import { actions, sessions, users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validation from "../validation.js";
import id from "date-and-time/locale/id";

let createAction = async (type, value, actionOwner, sessionId) => {
  let action = {};

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
  const sessionUpdateInfo = await sessionCollection.findOneAndUpdate(
    { _id: action.sessionId },
    { $set: session },
    { returnDocument: "after" }
  );
  if (!sessionUpdateInfo)
    throw `Could not add action to session with id ${sessionId}`;

  return actionId;
};

let getAction = async (id) => {
  id = validation.checkId(id);

  const actionCollection = await actions();
  const action = await actionCollection.findOne({
    _id: id,
  });

  if (!action) throw "Could not find action with that id";
  action._id = action._id.toString();
  return action;
};

let getListofActions = async (actions) => {
  validation.isIdArr(actions, "actions");

  const actionCollection = await sessions();

  let actionData = await Promise.all(
    actions.map(async (action) => {
      let current_action = await getAction(action);
      return {
        actionId: current_action._id.toString(),
        type: current_action.type,
        value: current_action.value,
        status: current_action.status,
        actionOwner: current_action.actionOwner,
      };
    })
  );

  return actionData;
};

let deleteAction = async (id) => {
  id = validation.checkId(id);

  const actionCollection = await actions();
  const deletionInfo = await actionCollection.findOneAndDelete({
    _id: id,
  });

  if (!deletionInfo) throw "Could not delete action with that id";

  const sessionCollection = await sessions();
  const updateInfo = await sessionCollection.findOneAndUpdate(
    { actionQueue: id.toString() },
    { $pull: { actionQueue: id.toString() } }
  );

  if (!updateInfo || updateInfo.acknowledged)
    throw "Could not remove action from the session";

  return { ...deletionInfo, deleted: true };
};

let forwardActionStatus = async (id) => {
  id = validation.checkId(id);

  const actionCollection = await actions();
  const action = await actionCollection.findOne({
    _id: id,
  });

  if (!action) throw "Could not find action with that id";

  // Update action's status
  if (action.status === "queued") {
    action.status = "oncall";
  } else if (action.status === "oncall") {
    action.status = "logged";
  } else if (action.status === "logged") {
    throw "Action has already been logged";
  } else {
    throw "Action has an invalid status";
  }

  // Update action in the database
  const updatedAction = await actionCollection.findOneAndUpdate(
    { _id: id },
    { $set: action },
    { returnDocument: "after" }
  );

  if (!updatedAction) throw "Could not update action";

  return { ...updatedAction, updated: true };
};

let addActionVote = async (vote, actionId, voterUserName) => {
    actionId = validation.checkId(actionId);

    const actionCollection = await actions();
    const action = await actionCollection.findOne({
    _id: actionId,
    });

    if (!action) throw "Could not find action with that id";

    // Make sure the user has not voted already
    for (let voteType in action.votingRecord) {
        let record = action.votingRecord[voteType]
        if (record.includes(voterUserName)) throw "User has already voted on this action";
    }

    if (!["Yay", "Nay", "Abstain"].includes(vote)) throw "Invalid vote option";
    // Update action in the database
    const updatedAction = await actionCollection.findOneAndUpdate(
    { _id: actionId },
    { $push: { [`votingRecord.${vote}`]: voterUserName }},
    { returnDocument: "after" }
    );

    if (!updatedAction) throw "Could not update action";

    return { ...updatedAction, updated: true };
}

export default {
  createAction,
  deleteAction,
  getAction,
  getListofActions,
  forwardActionStatus,
  addActionVote
};
