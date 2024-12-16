import Router from "express";
const router = Router();
import { sessionData, organizationData, actionData } from "../data/index.js";

import validation from "../validation.js";
import middlewares from "../middlewares.js";

//Middle ware to check if user is in the organization
router
    .route( "/createsession/:orgName") // /session/orgId
    .get( async (req, res) => {
        if (!req.session.currentPage) {
            req.session.currentPage = "/";
        }
        if (!req.session.user) {
            return res
                .status(403)
                .render("error.handlebars", { title: "Error Page", error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
        }
        try {
            let orgName = validation.checkOrgName(req.params.orgName);
            let Org = await organizationData.getOrganizationByName(orgName);
            if (!Org.members.some((mem) => mem.userName === req.session.user.userName)) {
                return res
                    .status(403)
                    .render("error.handlebars", { title: "Error Page", error_class: "input_error", message: "You are not a member of this organization", error_route: req.session.currentPage });
            }
            req.session.currentPage = `/session/createsession/${orgName}`;
            return res.render("createsession.handlebars", { title: "Create Session", orgName: orgName });
        } catch (e) {
            res.status(400).render("error.handlebars", { title: "Error Page", error_class: `bad_param`, message: e, error_route: req.session.currentPage });
        }
    })
    .post( async (req, res) => {
        if (!req.session.currentPage) {
            req.session.currentPage = "/";
        }
        if (!req.session.user) {
            return res
                .status(403)
                .render("error.handlebars", { title: "Error Page", error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
        }
        try {
            let orgName = validation.checkOrgName(req.params.orgName);
            let Org = await organizationData.getOrganizationByName(orgName);
            if (!Org.members.some((mem) => mem.userName === req.session.user.userName)) {
                return res
                    .status(403)
                    .render("error.handlebars", { title: "Error Page", error_class: "input_error", message: "You are not a member of this organization", error_route: req.session.currentPage });
            }
            let proposal = validation.checkString(req.body.firstProposal, "Original Proposal");
            let seshName = validation.checkString(req.body.seshName, "Session Name");
            let resp = await sessionData.createSession(proposal, req.session.user.userName, orgName, seshName);
            return res.redirect(`/session/${resp._id}`);
        } catch (e) {
            res.status(400).render("error.handlebars", { title: "Error Page", error_class: `bad_param`, message: e, error_route: req.session.currentPage });
        }
    });

router
    .route("/joinsession/:sessionId")
    .get( middlewares.checkIfInOrg, async (req, res) => {
        let sessionId = req.params.sessionId;
        if (!req.session.currentPage) {
            req.session.currentPage = "/";
        }
        if (!req.session.user) {
            return res
                .status(403)
                .render("error.handlebars", { title: "Error Page", error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
        }
        try {
            sessionId = validation.checkId(sessionId).toString();

            let Sesh = await sessionData.getSession(sessionId);

            if (Sesh.members.some((mem) => mem.userName === req.session.user.userName)) {
                return res.redirect(`/session/${sessionId}`);
            }
            if (Sesh.open) {
                req.session.currentPage = `/session/joinsession/${sessionId}`;
                return res.render("joinsession.handlebars", { title: "Join Session", sessionInfo: Sesh });
            }
            else {
                return res.redirect(`/session/${sessionId}`);
            }
        } catch (e) {
            res.status(400).render("error.handlebars", { title: "Error Page", error_class: `bad_param`, message: e, error_route: req.session.currentPage });
        }
    })
    .post(middlewares.checkIfInOrg, async (req, res) => {
        if (!req.session.currentPage) {
            req.session.currentPage = "/";
        }
        if (!req.session.user) {
            return res
                .status(403)
                .render("error.handlebars", { title: "Error Page", error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
        }
        try {
            let sessionId = validation.checkId(req.params.sessionId).toString();
            let role = validation.checkSessionRole(req.body.session_role);

            let resp = await sessionData.joinSession(sessionId, role, req.session.user.userName);
            return res.redirect(`/session/${sessionId}`);
        } catch (e) {
            res.status(400).render("error.handlebars", { title: "Error Page", error_class: `bad_param`, message: e, error_route: req.session.currentPage });
        }
    });

router
    .route("/:sessionId") // /session/asd8987dsf
    .get(middlewares.checkIfInOrg, async (req, res) => {
        //TODO add share url logic
        if (!req.session.currentPage) {
            req.session.currentPage = "/";
        }
        if (!req.session.user) {
            return res
                .status(403)
                .render("error.handlebars", { title: "Error Page", error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
        }
        try {
            let sessionId = validation.checkId(req.params.sessionId).toString();
            let Sesh = await sessionData.getSession(sessionId);
            if (!Sesh) {
                throw `no session with id ${sessionId}`;
            }
            if (Sesh.open) {
            if (!Sesh.members.some((mem) => mem.userName === req.session.user.userName)) {
                return res.status(403).render("error.handlebars", {
                    error_class: "input_error",
                    message: "You are not a member of this session",
                    error_route: req.session.currentPage,
                });
            }
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
            req.session.currentPage = `/session/${Sesh._id.toString()}`;
            let actions = await actionData.getListofActions(Sesh.actionQueue);
            let queuedActions = actions.filter((action) => action.status === "queued");
            let oncallActions = actions.filter((action) => action.status === "oncall");
            let loggedActions = actions.filter((action) => action.status === "logged");
            req.session.currentPage = `/session/${Sesh._id.toString()}`;
            return res.render("session.handlebars", { title: "Session", sessionData: Sesh, Role: role, isModerator: moderator, isVoter: voter, isGuest: guest, isObserver: observer });
            }
            else {
                let actions = await actionData.getListofActions(Sesh.actionQueue);
                req.session.currentPage = `/session/${Sesh._id.toString()}`;
                return res.render("listofactions.handlebars", { title: "List of Actions", actions: actions, session_route: `/organization/${Sesh.orgName}` });
            }
        } catch (e) {
            return res.status(400).render("error.handlebars", { title: "Error Page", error_class: `bad_param`, message: e, error_route: req.session.currentPage });
        }
    });

router
    .route("/leavesession/:sessionId") // /session/leavesession/asd8987dsf
    .patch(middlewares.checkIfInSessionAndOrg, async (req, res) => {
        if (!req.session.currentPage) {
            req.session.currentPage = "/";
        }
        if (!req.session.user) {
            return res
                .status(403)
                .render("error.handlebars", { title: "Error Page", error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
        }
        try {
            let userName = req.session.user.userName;
            let sessionId = validation.checkId(req.params.sessionId).toString();

            let orgName = await sessionData.leaveSession(sessionId, userName);
            return res.redirect(`/organization/${orgName}`);
        } catch (e) {
            return res.status(400).render("error.handlebars", { title: "Error Page", error_class: `bad_param`, message: e, error_route: req.session.currentPage });
        }
    });

router
    .route("/leavesession/:sessionId") // /session/leavesession/asd8987dsf
    .patch(middlewares.checkIfInSessionAndOrg, async (req, res) => {
        if (!req.session.currentPage) {
            req.session.currentPage = "/";
        }
        if (!req.session.user) {
            return res
                .status(403)
                .render("error.handlebars", { title: "Error Page", error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
        }
        try {
            let userName = req.session.user.userName;
            let sessionId = validation.checkId(req.params.sessionId).toString();

            let orgName = await sessionData.leaveSession(sessionId, userName);
            return res.redirect(`/organization/${orgName}`);
        } catch (e) {
            return res.status(400).render("error.handlebars", { title: "Error Page", error_class: `bad_param`, message: e, error_route: req.session.currentPage });
        }
    });

router.route('/endsession/:sessionId')
.patch(middlewares.checkIfInSessionAndOrg, async (req, res) => {
    let sessionId = req.params.sessionId;
    try {
        sessionId = validation.checkId(sessionId);
    } catch (e) {
        return res.status(400).render("error", { title: "Error Page", error_class: `bad_param`, message: e.message, error_route: req.session.currentPage });
    }

    try {
        await sessionData.endSession(sessionId.toString());
    } catch (e) {
        return res.status(500).render("error", { title: "Error Page", error_class: `server_error`, message: e.message, error_route: req.session.currentPage });
    }

    return res.redirect("/home");
});

router.route('/:sessionId/api/actions')
.get(middlewares.checkIfInSessionAndOrg, async (req, res) => {
    let sessionId = req.params.sessionId;
    try {
        sessionId = validation.checkId(sessionId).toString();
    } catch (e) {
        return res.status(400).json({ error: e.message });
    }

    try {
        let session = await sessionData.getSession(sessionId);
        for (let i in session.actionQueue) {
            session.actionQueue[i] = await actionData.getAction(session.actionQueue[i]);
        }
        let queue = session.actionQueue.filter((action) => action.status === "queued");
        let oncall = session.actionQueue.filter((action) => action.status === "oncall");
        let logged = session.actionQueue.filter((action) => action.status === "logged");

        return res.json({ 
            queue,
            oncall,
            logged,
         });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

export default router;
