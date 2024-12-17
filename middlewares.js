import { sessionData, organizationData } from "./data/index.js";
import validation from "./validation.js";

//Can absolutely send somewhere else or redirect somewhere.
let checkIfInSessionAndOrg = async (req, res, next) => {
    if (!req.session.currentPage) {
        req.session.currentPage = "/";
    }
    if (!req.session.user) {
        return res.status(403).render("error.handlebars", { title: "Error Page", error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
    }
    try {
    let sessionId = validation.checkId(req.params.sessionId).toString();
    let Sesh = await sessionData.getSession(sessionId);
    if (!Sesh) {
        return res.status(403).render("error.handlebars", { title: "Error Page", error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
    }

    if (!Sesh.members.some((mem) => mem.userName === req.session.user.userName)) {
        return res.status(403).render("error.handlebars", {
            error_class: "input_error",
            message: "You are not a member of this session",
            error_route: req.session.currentPage,
        });
    }

    let Org = await organizationData.getOrganizationByName(Sesh.orgName);
    if (!Org) {
        return res.status(403).render("error.handlebars", { title: "Error Page", error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
    }
    if (!Org.members.some((mem) => mem.userName === req.session.user.userName)) {
        return res.status(403).render("error.handlebars", {
            title: "Error Page",
            error_class: "input_error",
            message: "You are not a member of this organization",
            error_route: req.session.currentPage,
        });
    }
} catch(e) {
    return res.status(400).render("error.handlebars", { title: "Error Page", error_class: "input_error", message: e, error_route: req.session.currentPage });
}
    next();
};
let checkIfInOrg = async (req, res, next) => {
    if (!req.session.currentPage) {
        req.session.currentPage = "/";
    }
    if (!req.session.user) {
        return res.status(403).render("error.handlebars", { title: "Error Page", error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
    }
    try {
    let sessionId = validation.checkId(req.params.sessionId).toString();
    let Sesh = await sessionData.getSession(sessionId);
    if (!Sesh) {
        return res.status(403).render("error.handlebars", { title: "Error Page", error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
    }

    let Org = await organizationData.getOrganizationByName(Sesh.orgName);
    if (!Org) {
        return res.status(403).render("error.handlebars", { title: "Error Page", error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
    }
    if (!Org.members.some((mem) => mem.userName === req.session.user.userName)) {
        return res.status(403).render("error.handlebars", {
            title: "Error Page",
            error_class: "input_error",
            message: "You are not a member of this organization",
            error_route: req.session.currentPage,
        });
    }
}catch(e) {
    return res.status(400).render("error.handlebars", { title: "Error Page", error_class: "input_error", message: e, error_route: req.session.currentPage });
}
    next();
};


export default { checkIfInSessionAndOrg, checkIfInOrg };
