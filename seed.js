import { userData, organizationData, sessionData, actionData }from "./data/index.js";
import { users, organizations, sessions, actions } from "./config/mongoCollections.js";
import { dbConnection, closeConnection } from "./config/mongoConnection.js";

// Create DB connections
console.log("Connecting to MongoDB...");
const db = await dbConnection();
const userCollection = await users();
const orgCollection = await organizations();
const sessionCollection = await sessions();
const actionCollection = await actions();

// Clear DB
console.log("Clearing MongoDB Collections...");
await userCollection.deleteMany({});
await orgCollection.deleteMany({});
await sessionCollection.deleteMany({});
await actionCollection.deleteMany({});

// Insert test users
console.log("Inserting test users...");
const testUsers = [
    {userName: 'hhuston', password: 'Password@1', firstName: 'Harrison', lastname: 'Huston', email: 'hhuston@stevens.edu'},
    {userName: 'jknuckles', password: 'Password@1', firstName: 'Jesse', lastname: 'Knuckles', email: 'jknuckle@stevens.edu'},
    {userName: 'fbarton', password: 'Password@1', firstName: 'Frank', lastname: 'Barton', email: 'fbarton@stevens.edu'},
    {userName: 'jsimon', password: 'Password@1', firstName: 'Joel', lastname: 'Simon', email: 'jsimon@stevens.edu'},
    {userName: 'shuston', password: 'Password@1', firstName: 'Steve', lastname: 'Huston', email: 'shuston@gmail.com'},
];
for (let i in testUsers) {
    let user = testUsers[i];
    testUsers[i] = await userData.createUser(user.userName, user.password, user.firstName, user.lastname, user.email);
}

console.log("Inserting test organizations...");
const testOrgs = [
    {_id: '', orgName: 'First Presbyterian Church of Ramsey', password: 'Password@1', userName: testUsers[4].userName},
];

for (let i in testOrgs) {
    let org = testOrgs[i];
    testOrgs[i]._id = (await organizationData.createOrganization(org.orgName, org.password, org.userName))._id;
}

// hhuston (user i = 0) is left as organization moderator
// shuston (user i = 4) is left as organization owner
// all other users are added as organization members
console.log("Adding users to organization...");
const returnData = await organizationData.loginOrg(testUsers[0].userName, testOrgs[0].password, testOrgs[0].orgName, "Moderator");
for (let i in testUsers) {
    if (i == 4) break;
    if (i == 0) continue;
    const returnData = await organizationData.loginOrg(testUsers[i].userName, testOrgs[0].password, testOrgs[0].orgName, "Member");

    testOrgs[0].members = returnData[1].members;
}

console.log("Inserting test sessions...")
const testSessions = [
    {_id: '', proposal: 'Session should be held once a week', proposalOwner: testUsers[0].userName, orgName: 'First Presbyterian Church of Ramsey', seshName: "How many sessions?"},
    {_id: '', proposal: 'Harrison should be given $1000', proposalOwner: testUsers[4].userName, orgName: 'First Presbyterian Church of Ramsey', seshName: "Give Harrison money?"},
];
for (let i in testSessions) {
    let session = testSessions[i];
    testSessions[i] = await sessionData.createSession(session.proposal, session.proposalOwner, session.orgName, session.seshName);
}

console.log("Adding users to test sessions");
testSessions[0] = await sessionData.joinSession(testSessions[0]._id, "Voter",testUsers[1].userName);
testSessions[0] = await sessionData.joinSession(testSessions[0]._id, "Guest",testUsers[2].userName);
testSessions[0] = await sessionData.joinSession(testSessions[0]._id, "Observer",testUsers[3].userName);
for (let i in testUsers) {
    if (i <= 3) continue;
    testSessions[0] = await sessionData.joinSession(testSessions[0]._id, "Voter",testUsers[i].userName);
}

console.log("Inserting test actions...");
const testActions = [
    {_id: '', type: 'Motion', value: 'Motion to close session', actionOwner: testUsers[0].userName, sessionId: testSessions[0]._id},
    {_id: '', type: 'Motion', value: 'Motion to open moderated debate', actionOwner: testUsers[1].userName, sessionId: testSessions[0]._id},
    {_id: '', type: 'Amendment', value: 'Sessions should be held twice a week', actionOwner: testUsers[1].userName, sessionId: testSessions[0]._id},
    {_id: '', type: 'Amendment', value: 'Sessions should be held thrice a week', actionOwner: testUsers[2].userName, sessionId: testSessions[0]._id},
    {_id: '', type: 'Motion', value: 'Motion to censor Steve', actionOwner: testUsers[0].userName, sessionId: testSessions[0]._id},
    {_id: '', type: 'Motion', value: 'Motion to close session', actionOwner: testUsers[0].userName, sessionId: testSessions[0]._id},
    {_id: '', type: 'Motion', value: 'Motion to open moderated debate', actionOwner: testUsers[1].userName, sessionId: testSessions[0]._id},
    {_id: '', type: 'Amendment', value: 'Sessions should be held twice a week', actionOwner: testUsers[1].userName, sessionId: testSessions[0]._id},
    {_id: '', type: 'Amendment', value: 'Sessions should be held thrice a week', actionOwner: testUsers[2].userName, sessionId: testSessions[0]._id},
    {_id: '', type: 'Motion', value: 'Motion to censor Steve', actionOwner: testUsers[0].userName, sessionId: testSessions[0]._id},
];
for (let i in testActions) {
    let action = testActions[i];
    testActions[i]._id = await actionData.createAction(action.type, action.value, action.actionOwner, action.sessionId);
    testSessions[0] = await sessionData.getSession(action.sessionId);
}

await closeConnection();
console.log("Done");
