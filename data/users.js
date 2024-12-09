import { ObjectId } from 'mongodb';
import {organizations, users} from './../config/mongoCollections.js';
import bcrypt from 'bcrypt';
import {is_str, is_number, is_arr, is_obj_id, exists, trim_obj, str_format, is_email, trim_arr, is_password} from './helpers.js'
const saltRounds = 16;

const createUser = async (
    userName,
    password,
    firstName,
    lastName,
    email
  ) => {
    //Args: userName, password, firstName, lastName, email
    //successful output: an object containing the added user's firstName, lastName, memberOrganizations, and userName
    //constraints: all inputs must be strings and exist, email must be valid, password contraints from lab10, userName must be unique
    exists(userName, "first")
    exists(password, "second")
    exists(firstName, "third")
    exists(lastName, "fourth")
    exists(email, "fifth")
    is_str(userName, "first")
    is_str(password, "second")
    is_password(password, "second")
    is_str(firstName, "third")
    is_str(lastName, "fourth")
    is_str(email, "fifth")
    userName = userName.trim()
    password = password.trim()
    firstName = firstName.trim()
    firstName = str_format(firstName)
    lastName = lastName.trim()
    lastName = str_format(lastName)
    email = email.trim()
    is_email(email)
    let member_organizations = []
    const hash_password = await bcrypt.hash(password, saltRounds);
    const new_user_info = {
      userName: userName,
      password: hash_password,
      firstName: firstName,
      lastName: lastName,
      email: email,
      memberOrganizations: member_organizations

    }
    const UserCollection = await users();
    const repeatUser = await UserCollection.findOne({userName: userName})
    if (repeatUser) {
        throw 'The provided username is already used'
    }
    const insertInfo = await UserCollection.insertOne(new_user_info);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
      throw 'error (could not add User)';
    }
    
    const newUser = await UserCollection.findOne({userName: userName})
    let return_obj = {
        userName: newUser.userName,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        memberOrganizations: newUser.memberOrganizations
    }
    return return_obj
  
  };

const getUser = async (
    userName
) => {
    //args: userName
    //successful output: an object containing the added user's firstName, lastName, memberOrganizations, userName
    //constraints: userName must exist and be a string
    exists(userName, "first")
    is_str(userName, "first")
    userName = userName.trim()
    const UserCollection = await users();
    const User = await UserCollection.findOne({userName: userName});
    if (!User) {
        throw 'The provided username is incorrect'
    }
    let return_obj = {
        userName: User.userName,
        firstName: User.firstName,
        lastName: User.lastName,
        memberOrganizations: User.memberOrganizations
    }
    return return_obj
}

const deleteUser = async (
    userName
) => {
    //args: userName
    //successful output: 'userName has been successfully deleted!'
    //constraints: userName must exist and be a string
    exists(userName, "first")
    is_str(userName, "first")
    userName = userName.trim()
    const UserCollection = await users();
    const deletedUser = await UserCollection.findOneAndDelete({userName: userName});
    if (!deletedUser) {
        throw 'No user matches the provided username'
    }
    const OrgCollection = await organizations()

    let organizations_list = deletedUser.memberOrganizations
    for (let org of organizations_list) {
        let objectId = new ObjectId(org);
        const Org = await OrgCollection.findOne({_id: objectId})
        let newOrgMembers = Org.members.filter(member => member !== deletedUser._id.toString());
        let new_org_obj = {
            members: newOrgMembers
        }
        const updatedInfo = await OrgCollection.findOneAndUpdate(
            {_id: objectId},
            {$set: new_org_obj},
            {returnDocument: 'after'}
        );
    }
    return `${deletedUser.userName} has been successfully deleted!`;
}

const loginUser = async (
    userName,
    password
) => {
    //args: userName, password
    //successful output: an object containing the added user's firstName, lastName, memberOrganizations, userName
    //constraints: userName must exist and be a string, password must match, exist, and be a string, plus lab10 constraints
    exists(userName, "first")
    exists(password, "second")
    is_str(userName, "first")
    is_str(password, "second")
    is_password(password, "second")
    userName = userName.trim()
    password = password.trim()
    const UserCollection = await users();
    const User = await UserCollection.findOne({userName: userName});
    if (!User) {
        throw 'The provided username or password is incorrect'
    }
    let compare_password = await bcrypt.compare(password, User.password);
    if (!compare_password) {
        throw 'The provided username or password is incorrect'
    }
    let return_obj = {
        userName: User.userName,
        firstName: User.firstName,
        lastName: User.lastName,
        memberOrganizations: User.memberOrganizations
    }
    return return_obj
}

const updateUser = async (userName, updateObject) => {
    //Args: userName, object containing at least one of the following: updatePassword, updateFirstName, updateLastName, updateEmail, updateOrganizations
    //successful output: an object containing the added user's firstName, lastName, memberOrganizations, and userName
    //constraints: userName must exists and be a string, object must exist and can't be empty, object values must be proper types and abide by proper constraints
    exists(userName, "first")
    is_str(userName, "first")
    exists(updateObject, "second")
    userName = userName.trim()
    const userCollection = await users();
    const orgCollection = await organizations();
    const User = await userCollection.findOne({userName: userName});
    if (!User) {
        throw 'The provided username or password is incorrect'
    }
    let new_user_name = User.userName
    let new_hashed_password = User.password
    let new_first_name = User.firstName
    let new_last_name = User.lastName
    let new_email = User.email
    let new_organizations = User.memberOrganizations
    if (Object.keys(updateObject).length < 1) {
        throw 'Nothing provided in the update object'
    }
    if (updateObject.hasOwnProperty('updatePassword')) {
        is_str(updateObject.updateUserName, "updateUserName")
        new_user_name = updateObject.updateUserName.trim()
        const repeatedUser = await userCollection.findOne({userName: new_user_name});
        if (repeatedUser) {
            throw 'That username is already taken'
        }
    }
    if (updateObject.hasOwnProperty('updatePassword')) {
        is_str(updateObject.updatePassword, "updatePassword")
        is_password(updateObject.updatePassword, "updatePassword")
        new_hashed_password = await bcrypt.hash(updateObject.updatePassword.trim(), saltRounds);
    }
    if (updateObject.hasOwnProperty('updateFirstName')) {
        is_str(updateObject.updateFirstName, "updateFirstName")
        new_first_name = str_format(updateObject.updateFirstName.trim())
    }
    if (updateObject.hasOwnProperty('updateLastName')) {
        is_str(updateObject.updateLastName, "updateLastName")
        new_last_name = str_format(updateObject.updateLastName.trim())
    }
    if (updateObject.hasOwnProperty('updateEmail')) {
        is_str(updateObject.updateEmail, "updateEmail")
        is_email(updateObject.updateEmail.trim())
        new_email = updateObject.updateEmail.trim()
    }
    if (updateObject.hasOwnProperty('updateOrganizations')) {//haven't made these changes apply to organization, but may not need to
        is_arr(updateObject.updateOrganizations, "updateOrganizations")
        trim_arr(updateObject.updateOrganizations)
        new_organizations = updateObject.updateOrganizations
        for (let org of new_organizations) {
            let objectId = new ObjectId(org);
            let Org = await orgCollection.findOne({_id: objectId})
            if (!Org) {
                throw 'An organization does not exist in the updated list'
            }
        }
    }
    const new_user_info = {
        userName: new_user_name,
        password: new_hashed_password,
        firstname: new_first_name,
        lastName: new_last_name,
        email: new_email,
        memberOrganizations: new_organizations
      }
      const updatedInfo = await userCollection.findOneAndUpdate(
        {_id: User._id},
        {$set: new_user_info},
        {returnDocument: 'after'}
      );
      let return_obj = {
        userName: updatedInfo.userName,
        firstName: updatedInfo.firstName,
        lastName: updatedInfo.lastName,
        memberOrganizations: updatedInfo.memberOrganizations
    }
    return return_obj

}

export {createUser, getUser, deleteUser, loginUser, updateUser}