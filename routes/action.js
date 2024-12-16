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
        const sessionId = validation.checkId(req.params.sessionId);
        const actionText = validation.checkString(req.body.actionText, 'Action Text');
        const actionType = req.body.actionType;
        const actionOwner = req.session.user.userName;

        await actionData.createAction(actionType, actionText, actionOwner);
        res.redirect(`/session/${sessionId}`);
    } catch (e) {
        res.status(400).render('error', { error_class: 'input_error', message: e, error_route: req.session.currentPage });
    }
});

export default router;
