import Router from "express";
const router = Router();
import { actionData, userData } from "../data/index.js";

import validation from "../validation.js";

router.route("/:actionId").get(async (req, res) => {
    if (!req.session.currentPage) {
        req.session.currentPage = "/";
    }
    if (!req.session.user) {
        return res.status(403).render("error.handlebars", { title: "Error Page", error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
    }
    try {
        let actionId = validation.checkId(req.params.actionId).toString();
        let action = await actionData.getAction(actionId);

        let user = await userData.getUser(action.actionOwner);

        req.session.currentPage = `/actions/${actionId}`;
        return res.render("actiondetails.handlebars", { title: "List of Actions", action: action, firstName: user.firstName, lastName: user.lastName });
    } catch (e) {
        res.status(400).render("error.handlebars", { title: "Error Page", error_class: `bad_param`, message: e, error_route: req.session.currentPage });
    }
});

export default router;
