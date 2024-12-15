import { ObjectId } from "mongodb";
import { organizations, users } from "./../config/mongoCollections.js";
import bcrypt from "bcrypt";
import validation from "../validation.js";
const saltRounds = 16;

const createUser = async (
    //enforce a minimum password length, make sure that the returns don't include password or id
    userName,
    password,
    firstName,
    lastName,
    email
) => {
    //Args: userName, password, firstName, lastName, email
    //successful output: an object containing the added user's firstName, lastName, memberOrganizations, and userName
    //constraints: all inputs must be strings and exist, email must be valid, password contraints from lab10, userName must be unique and between 5 and 25 chars with no spaces
    userName = validation.checkUserName(userName);
    password = validation.checkPassword(password, "Password");
    firstName = validation.checkName(firstName);
    lastName = validation.checkName(lastName);
    email = validation.checkEmail(email);

    let member_organizations = [];
    const hash_password = await bcrypt.hash(password, saltRounds);
    const new_user_info = {
        userName: userName,
        password: hash_password,
        firstName: firstName,
        lastName: lastName,
        email: email,
        memberOrganizations: member_organizations,
    };
    const UserCollection = await users();
    const repeatUser = await UserCollection.findOne({ userName: userName });
    if (repeatUser) {
        throw "The provided username is already used";
    }
    const insertInfo = await UserCollection.insertOne(new_user_info);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw "error (could not add User)";
    }

    const newUser = await UserCollection.findOne({ userName: userName });
    let return_obj = {
        userName: newUser.userName,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        memberOrganizations: newUser.memberOrganizations,
    };
    return return_obj;
};

const getUser = async (userName) => {
    //args: userName
    //successful output: an object containing the added user's firstName, lastName, memberOrganizations, userName
    //constraints: userName must exist and be a string and be between 5 and 25 chars with no spaces
    userName = validation.checkUserName(userName);
    const UserCollection = await users();
    const User = await UserCollection.findOne({ userName: userName });
    if (!User) {
        throw "The provided username is incorrect";
    }
    let return_obj = {
        userName: User.userName,
        firstName: User.firstName,
        lastName: User.lastName,
        memberOrganizations: User.memberOrganizations,
    };
    return return_obj;
};

const deleteUser = async (userName) => {
    //args: userName
    //successful output: 'userName has been successfully deleted!'
    //constraints: userName must exist and be a string and be between 5 and 25 chars with no spaces
    userName = validation.checkUserName(userName);
    const UserCollection = await users();
    const deletedUser = await UserCollection.findOneAndDelete({ userName: userName });
    if (!deletedUser) {
        throw "No user matches the provided username";
    }
    const OrgCollection = await organizations();

    let organizations_list = deletedUser.memberOrganizations;
    for (let org of organizations_list) {
        let objectId = new ObjectId(org);
        const Org = await OrgCollection.findOne({ _id: objectId });
        let newOrgMembers = Org.members.filter((member) => member.userName !== deletedUser._id.toString());
        let new_org_obj = {
            members: newOrgMembers,
        };
        const updatedInfo = await OrgCollection.findOneAndUpdate({ _id: objectId }, { $set: new_org_obj }, { returnDocument: "after" });
    }
    return `${deletedUser.userName} has been successfully deleted!`;
};

const loginUser = async (userName, password) => {
    //args: userName, password
    //successful output: an object containing the added user's firstName, lastName, memberOrganizations, userName
    //constraints: userName must exist and be a string and be between 5 and 25 chars with no spaces, password must match, exist, and be a string, plus lab10 constraints
    userName = validation.checkUserName(userName);
    password = validation.checkPassword(password);
    const UserCollection = await users();
    const User = await UserCollection.findOne({ userName: userName });
    if (!User) {
        throw "The provided username or password is incorrect";
    }
    let compare_password = await bcrypt.compare(password, User.password);
    if (!compare_password) {
        throw "The provided username or password is incorrect";
    }
    let return_obj = {
        userName: User.userName,
        firstName: User.firstName,
        lastName: User.lastName,
        memberOrganizations: User.memberOrganizations,
    };
    return return_obj;
};

const updateUser = async (userName, updateObject) => {
    //Args: userName, object containing at least one of the following: updatePassword, updateFirstName, updateLastName, updateEmail, updateOrganizations, updateUserName
    //successful output: an object containing the added user's firstName, lastName, memberOrganizations, and userName
    //constraints: userName must exists and be a string and be between 5 and 25 chars with no spaces, object must exist and can't be empty, object values must be proper types and abide by proper constraints
    userName = validation.checkUserName(userName);
    updateObject = validation.isObj(updateObject);
    const userCollection = await users();
    const orgCollection = await organizations();
    const User = await userCollection.findOne({ userName: userName });
    if (!User) {
        throw "The provided username is incorrect";
    }
    let new_user_name = User.userName;
    let new_hashed_password = User.password;
    let new_first_name = User.firstName;
    let new_last_name = User.lastName;
    let new_email = User.email;
    let new_organizations = User.memberOrganizations;
    if (Object.keys(updateObject).length < 1) {
        throw "Nothing provided in the update object";
    }
    if (updateObject.hasOwnProperty("updateUserName")) {
        new_user_name = validation.checkUserName(updateObject.updateUserName);

        const repeatedUser = await userCollection.findOne({ userName: new_user_name });
        if (repeatedUser) {
            throw "That username is already taken";
        }
        for (let org of User.memberOrganizations) {
            const update_org = await orgCollection.findOne({ _id: new ObjectId(org) });
            let newOrgUsers = update_org.members.filter((j) => j.userName !== userName);
            let oldOrgUsers = update_org.members.filter((j) => j.userName == userName);
            newOrgUsers = [...newOrgUsers, { userName: new_user_name, role: oldOrgUsers[0].role }];
            let new_org_obj = {
                members: newOrgUsers,
            };
            const updatedInfo = await orgCollection.findOneAndUpdate({ _id: update_org._id }, { $set: new_org_obj }, { returnDocument: "after" });
        }
    }
    if (updateObject.hasOwnProperty("updatePassword")) {
        new_hashed_password = await bcrypt.hash(validation.checkPassword(updateObject.updatePassword), saltRounds);
    }
    if (updateObject.hasOwnProperty("updateFirstName")) {
        new_first_name = validation.checkName(updateObject.updateFirstName, "First Name");
    }
    if (updateObject.hasOwnProperty("updateLastName")) {
        new_last_name = validation.checkName(updateObject.updateLastName, "Last Name");
    }
    if (updateObject.hasOwnProperty("updateEmail")) {
        new_email = validation.checkEmail(updateObject.updateEmail);
    }
    const new_user_info = {
        userName: new_user_name,
        password: new_hashed_password,
        firstname: new_first_name,
        lastName: new_last_name,
        email: new_email,
        memberOrganizations: new_organizations,
    };
    const updatedInfo = await userCollection.findOneAndUpdate({ _id: User._id }, { $set: new_user_info }, { returnDocument: "after" });
    let return_obj = {
        userName: updatedInfo.userName,
        firstName: updatedInfo.firstName,
        lastName: updatedInfo.lastName,
        memberOrganizations: updatedInfo.memberOrganizations,
    };
    return return_obj;
};

export default { createUser, getUser, deleteUser, loginUser, updateUser };
