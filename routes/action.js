import Router from "express";
const router = Router();
import { actionData, sessionData } from "../data/index.js";
import validation from "../validation.js";

// Route to render create action page for motion
router.get('/createmotion/:sessionId', async (req, res) => {
    if (!req.session.currentPage) {
        req.session.currentPage = "/";
    }
    // TODO: check if user has permission to create action
    if (!req.session.user) {
        return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
    }
    try {
        const sessionId = validation.checkId(req.params.sessionId);
        req.session.currentPage = `/action/createaction/${sessionId}`;
        return res.render('createaction.handlebars', { sessionId: sessionId, actionType: 'Motion' });
    } catch (e) {
        res.status(400).render('error', { error_class: 'input_error', message: e, error_route: req.session.currentPage });
    }
});

// Route to render create action page for amendment
router.get('/createamendment/:sessionId', async (req, res) => {
    if (!req.session.currentPage) {
        req.session.currentPage = "/";
    }
    if (!req.session.user) {
        return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
    }
    // TODO: check if user has permission to create action
    try {
        const sessionId = validation.checkId(req.params.sessionId);
        req.session.currentPage = `/action/createaction/${sessionId}`;
        return res.render('createaction.handlebars', { sessionId: sessionId, actionType: 'Amendment' });
    } catch (e) {
        res.status(400).render('error', { error_class: 'input_error', message: e, error_route: req.session.currentPage });
    }
});

// Route to handle action creation
router.post('/create/:sessionId', async (req, res) => {
    if (!req.session.currentPage) {
        req.session.currentPage = "/";
    }
    if (!req.session.user) {
        return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
    }
    // TODO: check if user has permission to create action
    try {
        const sessionId = validation.checkId(req.params.sessionId).toString();
        const actionText = validation.checkString(req.body.actionText, 'Action Text');
        const actionType = req.body.actionType;
        const actionOwner = req.session.user.userName;

        await actionData.createAction(actionType, actionText, actionOwner, sessionId);
        res.redirect(`/session/${sessionId}`);
    } catch (e) {
        res.status(400).render('error', { error_class: 'input_error', message: e, error_route: req.session.currentPage });
    }
});

router
    .route("/:actionId") // /session/orgId
    .get(async (req, res) => {
        if (!req.session.currentPage) {
            req.session.currentPage = "/";
        }
        if (!req.session.user) {
            return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
        }
        try {
            let actionId = validation.checkId(req.params.actionId).toString();
            let action = await actionData.getAction(actionId);

            let user = await userData.getUser(action.actionOwner);

            req.session.currentPage = `/actions/${actionId}`;
            return res.render("actiondetails.handlebars", { action: action, firstName: user.firstName, lastName: user.lastName });
        } catch (e) {
            res.status(400).render("error.handlebars", { error_class: `bad_param`, message: e, error_route: req.session.currentPage });
        }
    });

router
    .route("/delete/:actionId")
    .patch(async (req, res) => {
        // TODO: implemment 
        // then update data/actions.js: deleteAction to remove action from session queue
    });

router
    .route("/callvote/:actionId")
    .patch(async (req, res) => {
        // TODO: implement 
        // first check that session doesn't already have an action on call
        // then create new data/actions.js function to update action status from queued to oncall
    });

export default router;
