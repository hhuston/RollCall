import { actions } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validation from "../validation.js";

let createAction = async (type, value, actionOwner) => {
    let action = {};

    //Could have a checkType function to make sure it is a specific type of action
    action.type = validation.checkString(type, "Type");
    action.value = validation.checkString(value, "Value");
    action.actionOwner = validation.checkUserName(actionOwner);
    action.votingRecord = { Yay: [], Nay: [], Abstain: [] };

    const actionCollection = await actions();
    const newInsertInformation = await actionCollection.insertOne(action);

    if (!newInsertInformation) throw "Could not add action";
    
    return newInsertInformation.insertedId.toString();
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
