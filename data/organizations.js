import { ObjectId } from "mongodb";
import { users, organizations } from "./../config/mongoCollections.js";
import bcrypt from "bcrypt";
import validation from "../validation.js";
const saltRounds = 16;

const createOrganization = async (
    //enforce a minimum password length
    orgName,
    password,
    userName
) => {
    //Args: orgName, password, username
    //successful output: an object containing the added org's orgName, its _id, its empty session list, and its member list with only one userName
    //constraints: all inputs must exists and be strings. orgName must be unique
    orgName = validation.checkString(orgName, "Org Name");
    password = validation.checkPassword(password, "Password");
    userName = validation.checkUserName(userName);

    let userCollection = await users();
    const User = await userCollection.findOne({ userName: userName });
    if (!User) {
        throw "The provided username does not exist.";
    }
    let members = [{ userName: User.userName, role: "owner" }];
    let sessions = [];
    const hash_password = await bcrypt.hash(password, saltRounds);
    const orgCollection = await organizations();
    //Maybe can find a way to not need to make orgName lowercase
    const repeatOrg = await orgCollection.findOne({ orgName: orgName.toLowerCase() }).collation({ locale: "en", strength: 2 });
    if (repeatOrg) {
        throw `There is an organization with that name`;
    }
    const new_org_info = {
        orgName: orgName,
        password: hash_password,
        members: members,
        sessions: sessions,
    };
    const insertInfo = await orgCollection.insertOne(new_org_info);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw "error (could not add Organization)";
    }
    const newOrg = await orgCollection.findOne({ _id: insertInfo.insertedId });
    let orgID = newOrg["_id"].toString();
    User.memberOrganizations.push(orgID);
    let newMemberOrganizations = User.memberOrganizations;
    let new_user_obj = {
        memberOrganizations: newMemberOrganizations,
    };
    const updatedInfo = await userCollection.findOneAndUpdate({ _id: User._id }, { $set: new_user_obj }, { returnDocument: "after" });
    newOrg._id = orgID;
    const return_info = {
        _id: orgID.toString(),
        orgName: newOrg.orgName,
        members: newOrg.members,
        sessions: newOrg.sessions,
    };
    return return_info;
};

const getOrganization = async (orgID) => {
    //Args: orgID
    //successful output: an object containing the added org's orgName, its _id, its session list, and its member list
    //constraints: orgID must exist, be a string, and be a valid sessionID MUST ACCOUNT FOR LEADING 0s For the IDs
    orgID = validation.checkId(orgID, "Org Id");
    const OrgCollection = await organizations();
    const Org = await OrgCollection.findOne({ _id: orgID });
    if (!Org) {
        throw "No organization with that ID";
    }
    const return_info = {
        _id: Org._id.toString(),
        orgName: Org.orgName,
        members: Org.members,
        sessions: Org.sessions,
    };
    return return_info;
};
const getOrganizationByName = async (orgName) => {
    //Args: orgName
    //successful output: an object containing the added org's orgName, its _id, its session list, and its member list
    //constraints: orgName must exist and be a string
    orgName = validation.checkString(orgName, "Org Name");
    const OrgCollection = await organizations();
    const Org = await OrgCollection.findOne({ orgName: orgName }).collation({ locale: "en", strength: 2 });
    if (!Org) {
        throw "No organization with that Name";
    }
    const return_info = {
        _id: Org._id.toString(),
        orgName: Org.orgName,
        members: Org.members,
        sessions: Org.sessions,
    };
    return return_info;
};

const loginOrg = async (userName, password, orgName, role) => {
    //Args: userName, password, orgName
    //successful output: a tuple containing the same outputs found in both the getorg by name and get user by name functions
    //constraints: userName must exist, be a string, and be a valid userName, password must exist and be a string, orgName must exist in the db and be a string
    userName = validation.checkUserName(userName);
    password = validation.checkPassword(password, "Password");
    orgName = validation.checkString(orgName, "Org Name");
    role = validation.checkOrgRole(role);
    if (role == "owner") {
        throw "There is already an owner for this organization";
    }
    const UserCollection = await users();
    const OrgCollection = await organizations();
    const Org = await OrgCollection.findOne({ orgName: orgName }).collation({ locale: "en", strength: 2 });
    if (!Org) {
        throw "No organization matches the provided orgName";
    }
    let compare_password = await bcrypt.compare(password, Org.password);
    if (!compare_password) {
        throw "The provided password is incorrect";
    }

    let members_list = Org.members;
    const User = await UserCollection.findOne({ userName: userName });
    if (!User) {
        throw "No user matches the provided userName";
    }
    members_list.push({ userName: User.userName, role: role });
    let newUserOrgs = User.memberOrganizations;
    newUserOrgs.push(Org._id.toString());
    newUserOrgs = [...new Set(newUserOrgs)];

    let new_user_obj = {
        memberOrganizations: newUserOrgs,
    };
    let new_org_obj = {
        members: members_list,
    };
    //may need to check for errors below
    const updatedInfoUser = await UserCollection.findOneAndUpdate({ userName: User.userName }, { $set: new_user_obj }, { returnDocument: "after" });

    const updatedInfoOrg = await OrgCollection.findOneAndUpdate({ orgName: orgName }, { $set: new_org_obj }, { returnDocument: "after" }).collation({ locale: "en", strength: 2 });

    const return_info_org = {
        _id: updatedInfoOrg._id,
        orgName: updatedInfoOrg.orgName,
        members: updatedInfoOrg.members,
        sessions: updatedInfoOrg.sessions,
    };

    let return_info_user = {
        userName: updatedInfoUser.userName,
        firstName: updatedInfoUser.firstName,
        lastName: updatedInfoUser.lastName,
        memberOrganizations: updatedInfoUser.memberOrganizations,
    };

    return [return_info_user, return_info_org];
};
//TODO propogate through sessions
const leaveOrg = async (userName, orgName) => {
    //Args: userName, orgName
    //successful output: a tuple containing the same outputs found in both the getorg by name and get user by name functions
    //constraints: userName must exist, be a string, and be a valid userName, orgName must exist in the db and be a string
    userName = validation.checkUserName(userName);

    validation.exists(orgName, "orgName");
    validation.is_str(orgName, "orgName");
    orgName = validation.checkString(orgName, "Org Name");

    const UserCollection = await users();
    const OrgCollection = await organizations();
    const Org = await OrgCollection.findOne({ orgName: orgName }).collation({ locale: "en", strength: 2 });
    if (!Org) {
        throw "No organization matches the provided orgName";
    }
    const User = await UserCollection.findOne({ userName: userName });
    if (!User) {
        throw "No user matches the provided userName";
    }
    let members_list = Org.members;
    let role = members_list.filter((item) => item.userName == User.userName)[0].role;
    if (role == "owner") {
        throw "you can't leave if you are the owner! Must make someone else the Owner first!";
    }
    members_list = members_list.filter((item) => item.userName !== User.userName);
    let newUserOrgs = User.memberOrganizations;
    newUserOrgs = newUserOrgs.filter((item) => item !== Org._id.toString());

    let new_user_obj = {
        memberOrganizations: newUserOrgs,
    };
    let new_org_obj = {
        members: members_list,
    };
    //may need to check for errors below
    const updatedInfoUser = await UserCollection.findOneAndUpdate({ userName: User.userName }, { $set: new_user_obj }, { returnDocument: "after" });

    const updatedInfoOrg = await OrgCollection.findOneAndUpdate({ orgName: orgName }, { $set: new_org_obj }, { returnDocument: "after" }).collation({ locale: "en", strength: 2 });

    const return_info_org = {
        _id: updatedInfoOrg._id,
        orgName: updatedInfoOrg.orgName,
        members: updatedInfoOrg.members,
        sessions: updatedInfoOrg.sessions,
    };

    let return_info_user = {
        userName: updatedInfoUser.userName,
        firstName: updatedInfoUser.firstName,
        lastName: updatedInfoUser.lastName,
        memberOrganizations: updatedInfoUser.memberOrganizations,
    };

    return [return_info_user, return_info_org];
};

//TODO propogate through sessions
const deleteOrganization = async (orgName) => {
    //Args: orgName
    //successful output: the toString() of the deleted org _id
    //constraints: orgName must exist, and be a string
    orgName = validation.checkString(orgName, "Org Name");
    const UserCollection = await users();
    const OrgCollection = await organizations();
    const deletedOrg = await OrgCollection.findOneAndDelete({ orgName: orgName }).collation({ locale: "en", strength: 2 });
    if (!deletedOrg) {
        throw "No organization matches the provided id";
    }

    let members_list = deletedOrg.members;
    for (let member of members_list) {
        const User = await UserCollection.findOne({ userName: member.userName });
        let newUserOrgs = User.memberOrganizations.filter((j) => j !== deletedOrg._id.toString());
        let new_user_obj = {
            memberOrganizations: newUserOrgs,
        };
        const updatedInfo = await UserCollection.findOneAndUpdate({ userName: member.userName }, { $set: new_user_obj }, { returnDocument: "after" });
    }
    return deletedOrg._id.toString();
};

const updateOrganization = async (orgID, updateObject) => {
    //Args: orgID, object containing at least one of the following fields: updateOrgName, updatePassword, updateMembers, updateSessions
    //successful output: an object containing the added org's orgName, its _id, its session list, and its member list
    //constraints: orgID must exist, be a string, and be a valid ID MUST ACCOUNT FOR LEADING 0s For the IDs, updated object can't be empty and must contain at least on of the fields, each value must also be of correct type, newOrgName must be unique
    updateObject = validation.isObj(updateObject);
    orgID = validation.checkId(orgID, "Org Id");
    const UserCollection = await users();
    const OrgCollection = await organizations();
    const Org = await OrgCollection.findOne({ _id: orgID });
    if (!Org) {
        throw "No organization exists for that id";
    }
    let new_org_name = Org.orgName;
    let new_hashed_password = Org.password;
    let new_members = Org.members;
    let new_sessions = Org.sessions;
    if (Object.keys(updateObject).length < 1) {
        throw "Nothing provided in the update object";
    }
    if (updateObject.hasOwnProperty("updateOrgName")) {
        new_org_name = validation.checkString(updateObject.updateOrgName, "updateOrgName");
        const repeatOrg = await OrgCollection.findOne({ orgName: new_org_name }).collation({ locale: "en", strength: 2 });
        if (repeatOrg) {
            throw `There is an org with that name`;
        }
    }
    if (updateObject.hasOwnProperty("updatePassword")) {
        updateObject.updatePassword = validation.checkPassword(updateObject.updatePassword, "updatePassword");
        new_hashed_password = await bcrypt.hash(updateObject.updatePassword, saltRounds);
    }
    if (updateObject.hasOwnProperty("updateMembers")) {
        //haven't made these changes apply to members, but may not need to
        new_members = validation.isArr(updateObject.updateMembers, "Update Members");
        for (let member of new_members) {
            member = validation.checkUserName(member.userName, "an updateMember");
            let Mem = await UserCollection.findOne({ userName: member.userName });
            if (!Mem) {
                throw "A user in the updated list does not exist";
            }
            let newUserOrgs = [];
            newUserOrgs = [...Mem.memberOrganizations, orgID];
            newUserOrgs = [...new Set(newUserOrgs)];
            let new_user_obj = {
                memberOrganizations: newUserOrgs,
            };
            const updatedInfo = await UserCollection.findOneAndUpdate({ userName: member.userName }, { $set: new_user_obj }, { returnDocument: "after" });
        }
        for (let member of Org.members) {
            //Not sure if this works cause member is an object
            if (!new_members.includes(member)) {
                let Mem = await UserCollection.findOne({ userName: member.userName });
                let newUserOrgs = [];
                newUserOrgs = Mem.memberOrganizations.filter((item) => item !== orgID);
                let new_user_obj = {
                    memberOrganizations: newUserOrgs,
                };
                const updatedInfo = await UserCollection.findOneAndUpdate({ userName: member.userName }, { $set: new_user_obj }, { returnDocument: "after" });
            }
        }
    }
    if (updateObject.hasOwnProperty("updateSessions")) {
        //haven't made these changes apply to session, but may not need to
        new_sessions = validation.isArr(updateObject.updateSessions, "updateSessions");
    }
    const new_org_info = {
        orgName: new_org_name,
        password: new_hashed_password,
        members: new_members,
        sessions: new_sessions,
    };
    const updatedInfo = await OrgCollection.findOneAndUpdate({ _id: Org._id }, { $set: new_org_info }, { returnDocument: "after" });
    const return_info = {
        _id: updatedInfo._id.toString(),
        orgName: updatedInfo.orgName,
        members: updatedInfo.members,
        sessions: updatedInfo.sessions,
    };
    return return_info;
};

let updateRoleOrg = async (userName, role, orgName) => {
    //input: userName, role, orgName with the usal contraints
    //output: the _id, orgName, members, and sessions of the updated Org
    //contraints: usual

    userName = validation.checkUserName(userName, "Username");
    role = validation.checkOrgRole(role);
    checkOrgName = validation.checkString(orgName, "Org Name");

    const UserCollection = await users();
    const OrgCollection = await organizations();
    const Org = await OrgCollection.findOne({ orgName: orgName }).collation({ locale: "en", strength: 2 });
    if (!Org) {
        throw "No organization matches the provided orgName";
    }

    let members_list = Org.members;
    const User = await UserCollection.findOne({ userName: userName });
    if (!User) {
        throw "No user matches the provided userName";
    }
    members_list.forEach((item) => {
        if (item.userName == userName) {
            item.role = role;
        }
    });
    let new_org_obj = {
        members: members_list,
    };
    const updatedInfoOrg = await OrgCollection.findOneAndUpdate({ orgName: orgName }, { $set: new_org_obj }, { returnDocument: "after" }).collation({ locale: "en", strength: 2 });

    const return_info_org = {
        _id: updatedInfoOrg._id,
        orgName: updatedInfoOrg.orgName,
        members: updatedInfoOrg.members,
        sessions: updatedInfoOrg.sessions,
    };
    return return_info_org;
};

export default { createOrganization, getOrganization, getOrganizationByName, deleteOrganization, updateOrganization, loginOrg, leaveOrg, updateRoleOrg };
