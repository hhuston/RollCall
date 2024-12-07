import { ObjectId } from 'mongodb';
import {users, organizations} from './../config/mongoCollections.js';
import bcrypt from 'bcrypt';
import {is_str, is_number, is_arr, is_obj_id, exists, trim_obj, str_format, is_email, trim_arr} from './helpers.js'
const saltRounds = 16;

const createOrganization = async ( //enforce a minimum password length
    orgName,
    password,
    userName
  ) => {
    exists(orgName, "first")
    exists(password, "second")
    exists(userName, "fifth")
    is_str(orgName, "first")
    is_str(password, "second")
    is_str(userName, "fifth")
    userName = userName.trim()
    password = password.trim()
    orgName = orgName.trim()
    orgName = str_format(orgName)
    let userCollection = await users();
    const User = await userCollection.findOne({userName: userName})
    if (!User) {
        throw 'The provided username does not exist.'
    }
    let members = [User._id.toString()]
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
    return newOrg
    
  
  };

  const getOrganization = async (
    orgID
    ) => {
    exists(orgID, "first")
    is_str(orgID, "first")
    let object_id = is_obj_id(orgID)
    const OrgCollection = await organizations();
    const Org = await OrgCollection.findOne({_id: object_id});
    if (!Org) {
        throw 'No organization with that ID'
    }
    Org['_id'] = Org['_id'].toString()
    return Org
}

const deleteOrganization = async (
    orgID
) => {
    exists(orgID, "first")
    is_str(orgID, "first")
    let object_id = is_obj_id(orgID)
    const UserCollection = await users();
    const OrgCollection = await organizations()
    const deletedOrg = await OrgCollection.findOneAndDelete({_id: object_id});
    if (!deletedOrg) {
        throw 'No organization matches the provided id'
    }

    let members_list = deletedOrg.members
    for (let member of members_list) {
        let objectId = new ObjectId(member);
        const User = await UserCollection.findOne({_id: objectId})
        let newUserOrgs = User.memberOrganizations.filter(member => member !== deletedOrg._id.toString());
        let new_user_obj = {
            memberOrganizations: newUserOrgs
        }
        const updatedInfo = await UserCollection.findOneAndUpdate(
            {_id: objectId},
            {$set: new_user_obj},
            {returnDocument: 'after'}
        );
    }
    return `${deletedOrg.orgName} has been successfully deleted!`;
}

const updateOrganization = async (orgID, updateObject) => {
    exists(orgID, "first")
    exists(updateObject, "second")
    is_str(orgID, "first")
    let object_id = is_obj_id(orgID)
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
        is_str(updateObject.updateOrgName, "updateOrgName")
        new_org_name = updateObject.updateOrgName.trim()
    }
    if (updateObject.hasOwnProperty('updatePassword')) {
        is_str(updateObject.updatePassword, "updatePassword")
        new_hashed_password = await bcrypt.hash(updateObject.updatePassword.trim(), saltRounds);
    }
    if (updateObject.hasOwnProperty('updateMembers')) {//haven't made these changes apply to members, but may not need to
        is_arr(updateObject.updateMembers, "updateMembers")
        trim_arr(updateObject.updateMembers, "updateMembers")
        new_members = updateObject.updateMembers
        for (let member of new_members) {
            let objectId = new ObjectId(member);
            let Mem = await UserCollection.findOne({_id: objectId})
            if (!Mem) {
                throw 'A user in the updated list does not exist'
            }
        }
    }
    if (updateObject.hasOwnProperty('updateSessions')) {//haven't made these changes apply to session, but may not need to
        is_arr(updateObject.updateSessions, "updateSessions")
        trim_arr(updateObject.updateSessions, "updateSessions")
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
    updatedInfo._id = updatedInfo._id.toString();
    return updatedInfo;

}



export {createOrganization, getOrganization, deleteOrganization, updateOrganization}