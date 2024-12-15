import { actions } from "../config/mongoCollections.js"
import { ObjectId } from "mongodb"
import validation from "../validation.js"
import session from "express-session"

let createAction = async (type, value, actionOwner) => {
    let action = {}

    //Could have a checkType function to make sure it is a specific type of action
    action.type = validation.checkString(type)
    action.value = validation.checkString(value)
    action.actionOwner = validation.is_user_id(actionOwner)
    action.votingRecord = {"Yay": [], "Nay": [], "Abstain": []}

    const actionCollection = await actions()
    const newInsertInformation = await actionCollection.insertOne(action)
    
    //What do I return here?
    return newInsertInformation.insertedId.toString();
}

let deleteAction = async (id) => {
    id = validation.checkId(id)

    const actionCollection = await actions()
    const deletionInfo = await actionCollection.findOneAndDelete({
        _id: new ObjectId(id)
    })

    if (!deletionInfo) throw "Could not delete action with that id"

    return {...deletionInfo, deleted: true}
}

let getAction = async (id) => {
    id = validation.checkId(id)

    const actionCollection = await actions()
    const action = await actionCollection.findOne({
        _id: new ObjectId(id)
    })

    if (!action) throw "Could not find action with that id"

    return action
}

let addVote = async (actionID, vote, voterId) => {
    actionID = validation.checkId(actionID)
    vote = validation.checkString(vote)
    vote = validation.is_vote(vote)
    voterId = validation.is_user_id(voterId)

    const actionCollection = await actions()
    const updatedAction = await actionCollection.findOneAndUpdate(
        {_id: new ObjectId(actionID)},
        {$push: {votingRecord: {[vote]: voterId}}}
    )

    if (!updatedAction) throw "Could not update voting record of action with that id"
    
    return {action: updatedAction, vote: vote, voterId: voterId}
}

export default {createAction, deleteAction, getAction, addVote}

