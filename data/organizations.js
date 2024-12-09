import { ObjectId } from 'mongodb';
import {users, organizations} from './../config/mongoCollections.js';
import bcrypt from 'bcrypt';
import validation from '../validation.js'
const saltRounds = 16;

const createOrganization = async ( //enforce a minimum password length
    orgName,
    password,
    userName
  ) => {
    //Args: orgName, password, username
    //successful output: an object containing the added org's orgName, its _id, its empty session list, and its member list with only one userName
    //constraints: all inputs must exists and be strings no contraint to password or orgName beyonf that
    validation.is_str(orgName, "orgName")
    validation.exists(password, "password")
    validation.exists(userName, "userName")
    validation.is_str(orgName, "orgName")
    validation.is_str(password, "password")
    validation.is_str(userName, "userName")
    userName = userName.trim()
    password = password.trim()
    orgName = orgName.trim()
    orgName = validation.str_format(orgName)
    let userCollection = await users();
    const User = await userCollection.findOne({userName: userName})
    if (!User) {
        throw 'The provided username does not exist.'
    }
    let members = [User.userName]
    let sessions = []
    const hash_password = await bcrypt.hash(password, saltRounds);
    const orgCollection = await organizations();
    const new_org_info = {
        orgName: orgName,
        password: hash_password,
        members: members,
        sessions: sessions
    }
    const insertInfo = await orgCollection.insertOne(new_org_info);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw 'error (could not add Organization)';
    }
    const newOrg = await orgCollection.findOne({_id: insertInfo.insertedId})
    let orgID = newOrg['_id'].toString()
    User.memberOrganizations.push(orgID)
    let newMemberOrganizations = User.memberOrganizations
    let new_user_obj = {
      memberOrganizations: newMemberOrganizations
    }
    const updatedInfo = await userCollection.findOneAndUpdate(
        {_id: User._id},
        {$set: new_user_obj},
        {returnDocument: 'after'}
    );
    newOrg._id = orgID
    const return_info = {
        _id: orgID,
        orgName: newOrg.orgName,
        members: newOrg.members,
        sessions: newOrg.sessions
    }
    return return_info
    
  
  };

  const getOrganization = async (
    orgID
    ) => {
    //Args: orgID
    //successful output: an object containing the added org's orgName, its _id, its session list, and its member list
    //constraints: orgID must exist, be a string, and be a valid sessionID MUST ACCOUNT FOR LEADING 0s For the IDs
    validation.exists(orgID, "orgID")
    validation.is_str(orgID, "orgID")
    let object_id = validation.is_obj_id(orgID)
    const OrgCollection = await organizations();
    const Org = await OrgCollection.findOne({_id: object_id});
    if (!Org) {
        throw 'No organization with that ID'
    }
    const return_info = {
        _id: Org._id.toString(),
        orgName: Org.orgName,
        members: Org.members,
        sessions: Org.sessions
    }
    return return_info
}

const deleteOrganization = async (
    orgID
) => {
    //Args: orgID
    //successful output: 'orgName has been successfully deleted!'
    //constraints: orgID must exist, be a string, and be a valid sessionID MUST ACCOUNT FOR LEADING 0s For the IDs
    validation.exists(orgID, "orgID")
    validation.is_str(orgID, "orgID")
    let object_id = validation.is_obj_id(orgID)
    const UserCollection = await users();
    const OrgCollection = await organizations()
    const deletedOrg = await OrgCollection.findOneAndDelete({_id: object_id});
    if (!deletedOrg) {
        throw 'No organization matches the provided id'
    }

    let members_list = deletedOrg.members
    for (let member of members_list) {
        const User = await UserCollection.findOne({userName: member})
        let newUserOrgs = User.memberOrganizations.filter(j => j !== deletedOrg._id.toString());
        let new_user_obj = {
            memberOrganizations: newUserOrgs
        }
        const updatedInfo = await UserCollection.findOneAndUpdate(
            {userName: member},
            {$set: new_user_obj},
            {returnDocument: 'after'}
        );
    }
    return `${deletedOrg.orgName} has been successfully deleted!`;
}

const updateOrganization = async (orgID, updateObject) => {
    //Args: orgID, object containing at least one of the following fields: updateOrgName, updatePassword, updateMembers, updateSessions
    //successful output: an object containing the added org's orgName, its _id, its session list, and its member list
    //constraints: orgID must exist, be a string, and be a valid ID MUST ACCOUNT FOR LEADING 0s For the IDs, updated object can't be empty and must contain at least on of the fields, each value must also be of correct type
    validation.exists(orgID, "orgID")
    validation.exists(updateObject, "updateObject")
    validation.is_str(orgID, "orgID")
    orgID = orgID.trim()
    let object_id = validation.is_obj_id(orgID)
    const UserCollection = await users();
    const OrgCollection = await organizations();
    const Org = await OrgCollection.findOne({_id: object_id});
    if (!Org) {
        throw 'No organization exists for that id'
    }
    let new_org_name = Org.orgName
    let new_hashed_password = Org.password
    let new_members = Org.members
    let new_sessions = Org.sessions
    if (Object.keys(updateObject).length < 1) {
        throw 'Nothing provided in the update object'
    }
    if (updateObject.hasOwnProperty('updateOrgName')) {
        validation.is_str(updateObject.updateOrgName, "updateOrgName")
        new_org_name = updateObject.updateOrgName.trim()
    }
    if (updateObject.hasOwnProperty('updatePassword')) {
        validation.is_str(updateObject.updatePassword, "updatePassword")
        new_hashed_password = await bcrypt.hash(updateObject.updatePassword.trim(), saltRounds);
    }
    if (updateObject.hasOwnProperty('updateMembers')) {//haven't made these changes apply to members, but may not need to
        if (!Array.isArray(updateObject.updateMembers)) {
            throw `updateMembers is not an array`
        }
        new_members = validation.trim_arr(updateObject.updateMembers, "updateMembers")
        for (let member of new_members) {
            let Mem = await UserCollection.findOne({userName: member})
            if (!Mem) {
                throw 'A user in the updated list does not exist'
            }
            let newUserOrgs = []
            newUserOrgs = [...Mem.memberOrganizations, orgID]
            newUserOrgs = [...new Set(newUserOrgs)];
            let new_user_obj = {
                memberOrganizations: newUserOrgs
            }
            const updatedInfo = await UserCollection.findOneAndUpdate(
                {userName: member},
                {$set: new_user_obj},
                {returnDocument: 'after'}
            );
        }
        for (let member of Org.members) {
            if (!new_members.includes(member)) {
                let Mem = await UserCollection.findOne({userName: member})
                let newUserOrgs = []
                newUserOrgs = Mem.memberOrganizations.filter(item => item !== orgID);
                let new_user_obj = {
                    memberOrganizations: newUserOrgs
                }
                const updatedInfo = await UserCollection.findOneAndUpdate(
                    {userName: member},
                    {$set: new_user_obj},
                    {returnDocument: 'after'}
                );
            }
        }
    }
    if (updateObject.hasOwnProperty('updateSessions')) {//haven't made these changes apply to session, but may not need to
        validation.is_arr(updateObject.updateSessions, "updateSessions")
        validation.trim_arr(updateObject.updateSessions, "updateSessions")
        new_sessions = updateObject.updateSessions
    }
    const new_org_info = {
        orgName: new_org_name,
        password: new_hashed_password,
        members: new_members,
        sessions: new_sessions
    }
      const updatedInfo = await OrgCollection.findOneAndUpdate(
        {_id: Org._id},
        {$set: new_org_info},
        {returnDocument: 'after'}
      );
      const return_info = {
        _id: updatedInfo._id.toString(),
        orgName: updatedInfo.orgName,
        members: updatedInfo.members,
        sessions: updatedInfo.sessions
    }
    return return_info

}



export {createOrganization, getOrganization, deleteOrganization, updateOrganization}