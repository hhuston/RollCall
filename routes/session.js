import Router from "express";
const router = Router();
import { sessionData, organizationData, actionData } from "../data/index.js";

import validation from "../validation.js";

router
    .route("/createsession/:orgName") // /session/orgId
    .get(async (req, res) => {
        if (!req.session.currentPage) {
            req.session.currentPage = "/";
        }
        if (!req.session.user) {
            return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
        }
        try {
            let orgName = validation.checkOrgName(req.params.orgName);
            let Org = await organizationData.getOrganizationByName(orgName);
            if (!Org.members.some((mem) => mem.userName === req.session.user.userName)) {
                return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You are not a member of this organization", error_route: req.session.currentPage });
            }
            req.session.currentPage = `/session/createsession/${orgName}`;
            return res.render("createsession.handlebars", { orgName: orgName });
        } catch (e) {
            res.status(400).render("error.handlebars", { error_class: `bad_param`, message: e, error_route: req.session.currentPage });
        }
    })
    .post(async (req, res) => {
        if (!req.session.currentPage) {
            req.session.currentPage = "/";
        }
        if (!req.session.user) {
            return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
        }
        try {
            let orgName = validation.checkOrgName(req.params.orgName);
            let proposal = validation.checkString(req.body.firstProposal, "Original Proposal");
            let seshName = validation.checkString(req.body.seshName, "Session Name");
            let resp = await sessionData.createSession(proposal, req.session.user.userName, orgName, seshName);
            return res.redirect(`/session/${resp._id}`);
        } catch (e) {
            res.status(400).render("error.handlebars", { error_class: `bad_param`, message: e, error_route: req.session.currentPage });
        }
    });

router
    .route("/joinsession/:sessionId")
    .get(async (req, res) => {
        let sessionId = req.params.sessionId;
        if (!req.session.currentPage) {
            req.session.currentPage = "/";
        }
        if (!req.session.user) {
            return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
        }
        try {
            sessionId = validation.checkId(sessionId).toString();

            let Sesh = await sessionData.getSession(sessionId);
            let Org = await organizationData.getOrganizationByName(Sesh.orgName);
            if (!Org.members.some((mem) => mem.userName === req.session.user.userName)) {
                return res.status(400).render("error.handlebars", { error_class: `bad_param`, message: `You are not a member of ${Sesh.orgName}`, error_route: req.session.currentPage });
            }
            if (Sesh.members.some((mem) => mem.userName === req.session.user.userName)) {
                return res.redirect(`/session/${sessionId}`);
            }

            req.session.currentPage = `/session/joinsession/${sessionId}`;
            return res.render("joinsession.handlebars", { sessionInfo: Sesh });
        } catch (e) {
            res.status(400).render("error.handlebars", { error_class: `bad_param`, message: e, error_route: req.session.currentPage });
        }
    })
    .post(async (req, res) => {
        if (!req.session.currentPage) {
            req.session.currentPage = "/";
        }
        if (!req.session.user) {
            return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
        }
        try {
            let sessionId = validation.checkId(req.params.sessionId).toString();
            let role = validation.checkSessionRole(req.body.session_role);

            let resp = sessionData.joinSession(sessionId, role, req.session.user.userName);
            return res.redirect(`/session/${sessionId}`);
        } catch (e) {
            res.status(400).render("error.handlebars", { error_class: `bad_param`, message: e, error_route: req.session.currentPage });
        }
    });

router
    .route("/:sessionId") // /session/asd8987dsf
    .get(async (req, res) => {
        //TODO add share url logic
        if (!req.session.currentPage) {
            req.session.currentPage = "/";
        }
        if (!req.session.user) {
            return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
        }
        try {
            let sessionId = validation.checkId(req.params.sessionId).toString();
            let Sesh = await sessionData.getSession(sessionId);
            if (!Sesh) {
                throw `no session with id ${sessionId}`;
            }
            //console.log("JAWN2")
            if (!Sesh.members.some((mem) => mem.userName === req.session.user.userName)) {
                return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You are not a member of this session", error_route: req.session.currentPage });
            }
            //console.log("JAWN3")
            let Org = await organizationData.getOrganizationByName(Sesh.orgName);
            if (!Org.members.some((mem) => mem.userName === req.session.user.userName)) {
                return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You are not a member of this organization", error_route: req.session.currentPage });
            }
            //console.log("JAWN4")
            let role = Sesh.members.filter((mem) => mem.userName === req.session.user.userName)[0].role;
            let voter = "";
            let moderator = "";
            let guest = "";
            let observer = "";
            //TODO add logic to make sure the proper permissions are granted
            if (role == "voter") {
                voter = "true";
            }
            if (role == "moderator") {
                moderator = "true";
            }
            if (role == "guest") {
                guest = "true";
            }
            if (role == "observer") {
                observer = "true";
            }
            req.session.currentPage = `/session/${Sesh._id}`;

            if (Sesh.open) {
                return res.render("session.handlebars", { sessionData: Sesh, Role: role, isModerator: moderator, isVoter: voter, isGuest: guest, isObserver: observer });
            } else {
                let actions = actionData.getListofActions(Sesh.actionQueue);
                return res.render("listofactions.handlebars", { actions: actions });
            }
        } catch (e) {
            return res.status(400).render("error.handlebars", { error_class: `bad_param`, message: e, error_route: req.session.currentPage });
        }
    });

// TODO: implement (frank)
// TODO: implement (frank)
// AJAX call routes to handle actions
// TODO: verify validation and error checking (include exists for all?)

// THIS ROUTE GOT FUCKED UP IN THE MERGE, MAY HAVE TO REIMPLEMENT
// router
//     .route('sendvote/')
//     .patch(async (req, res) => {
//         let actionId = xss(req.body.actionId);
//         let vote = xss(req.body.vote);
//         let voterId = req.session.user.userName;

// THIS ROUTE GOT FUCKED UP WITH THE ABOVE IN THE MERGE
// MAY HAVE TO FIX BUGS HERE

// router
// .route('createAction/')
// .post(async (req, res) => {
//     let type = xss(req.body.type);
//     let value = xss(req.body.value);
//     let actionOwner = req.session.user.userName;
//     try {
//         validation.exists(type, "type");
//         validation.is_str(type, "type");
//         validation.exists(value, "value");
//         validation.is_str(value, "value");
//         validation.exists(actionOwner, "actionOwner");
//         validation.is_str(actionOwner, "actionOwner");
//         validation.is_user_id(actionOwner, "actionOwner");
//         let resp = actionData.createAction(type, value, actionOwner);
//         return res.json(resp);
//     } catch (e) {
//         res.status(400).json({error: e});
//     }
// });

router.route('/endSession/:sessionId')
.patch(async (req, res) => {
    let sessionId = xss(req.params.sessionId);
    try {
        sessionId = validation.checkId(sessionId);
    } catch (e) {
        return res.status(400).render("error", { error_class: `bad_param`, message: e.message, error_route: req.session.currentPage });
    }

    try {
        await sessionData.endSession(sessionId);
    } catch (e) {
        return res.status(500).render("error", { error_class: `server_error`, message: e.message, error_route: req.session.currentPage });
    }

    return res.redirect("/home");
});

export default router;
