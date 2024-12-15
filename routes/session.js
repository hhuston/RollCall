import Router from "express";
const router = Router();
import { sessionData } from "../data/index.js";

import validation from "../validation.js";

router.route("/") // /session
.put("")

router.route('/:sessionId') // /session/asd8987dsf
.get(async (req, res) => {
    let sessionId = req.params.sessionId
    try {
        sessionId = validation.checkId(sessionId);
    } catch (e) {
        if (!req.session.currentPage) {
            req.session.currentPage = "/";
        }
        res.status(400).render("error.handlebars", { error_class: `bad_param`, message: "Invalid sessionId!", error_route: req.session.currentPage});
    }
    return res.render("session", {
        // Will figure out what we need later
    });
});

export default router;