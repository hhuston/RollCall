import Router from "express";
const router = Router();
import { sessionData, organizationData } from "../data/index.js";

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
            let resp = sessionData.createSession(proposal, req.session.user.userName, orgName, seshName);
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
            let sessionId = validation.checkId(req.params.sessionId).toString();

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
            if (!Sesh.members.some((mem) => mem.userName === req.session.user.userName)) {
                return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You are not a member of this session", error_route: req.session.currentPage });
            }
            let Org = await organizationData.getOrganizationByName(Sesh.orgName);
            if (!Org.members.some((mem) => mem.userName === req.session.user.userName)) {
                return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You are not a member of this organization", error_route: req.session.currentPage });
            }
            let role = Sesh.members.filter((mem) => mem.userName === req.session.user.userName);
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
            return res.render("session.handlebars", { sessionData: Sesh, Role: role, isModerator: moderator, isVoter: voter, isGuest: guest, isObserver: observer });
        } catch (e) {
            res.status(400).render("error.handlebars", { error_class: `bad_param`, message: e, error_route: req.session.currentPage });
        }
        return res.render("session.handlebars");
    });

export default router;
