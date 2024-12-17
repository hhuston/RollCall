import { userData, organizationData } from "../data/index.js";
import validation from "../validation.js";
import { Router } from "express";
const router = Router();

router.route("/").get(async (req, res) => {
    //code here for GET THIS ROUTE SHOULD NEVER FIRE BECAUSE OF MIDDLEWARE #1 IN SPECS.
    return res.json({ error: "YOU SHOULD NOT BE HERE!" });
});

router
    .route("/signupuser")
    .get(async (req, res) => {
        //code here for GET
        req.session.currentPage = "/signupuser";
        return res.status(200).render("signupuser.handlebars", { title: "Sign Up" });
    })
    .post(async (req, res) => {
        //code here for POST
        try {
            let userName = validation.checkUserName(req.body.userName);
            let firstName = validation.checkName(req.body.firstName, "First Name");
            let lastName = validation.checkName(req.body.lastName, "Last Name");
            let password = req.body.password;
            let confirmPassword = req.body.confirmPassword;
            password = validation.checkPassword(password, "Password");
            confirmPassword = validation.checkPassword(confirmPassword, "Confirm Password");
            if (password != confirmPassword) {
                throw "passwords must match";
            }

            let email = validation.checkEmail(req.body.email);

            let resp = await userData.createUser(userName, password, firstName, lastName, email);
            if (!resp) {
                return res.status(500).render("error.handlebars", { title: "Error Page", error_class: "server_error", message: "Internal Server Error", error_route: "/signupuser" });
            }
            return res.redirect("/signinuser");
        } catch (e) {
            return res.status(400).render("error.handlebars", { title: "Error Page", error_class: "input_error", message: e, error_route: "/signupuser" });
        }
    });

router
    .route("/signinuser")
    .get(async (req, res) => {
        //code here for GET
        req.session.currentPage = "/signinuser";
        return res.status(200).render("signinuser.handlebars", { title: "Sign In" });
    })
    .post(async (req, res) => {
        //code here for POST
        try {
            let userName = validation.checkUserName(req.body.user_name);
            let password = validation.checkPassword(req.body.password, "Password");

            let resp = await userData.loginUser(userName, password);
            if (!resp) {
                return res.status(500).render("error.handlebars", { title: "Error Page", error_class: "server_error", message: "Internal Server Error", error_route: "/signinuser" });
            }
            req.session.user = resp;
            return res.redirect("/home");
        } catch (e) {
            return res.status(400).render("error.handlebars", { title: "Error Page", error_class: "input_error", message: e, error_route: "/signinuser" });
        }
    });

router.route("/home").get(async (req, res) => {
    //code here for GET
    if (!req.session.currentPage) {
        req.session.currentPage = "/";
    }
    if (!req.session.user) {
        return res.status(403).render("error.handlebars", { title: "Error Page", error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage });
    }
    let orgNames;
    try {
    orgNames = [];
    for (let id of req.session.user.memberOrganizations) {
        let Org = await organizationData.getOrganization(id);
        if (!Org) {
            throw "User belongs to an organization that does not exist";
        }
        orgNames.push(validation.str_format(Org.orgName));
    }
    req.session.currentPage = "/home";
} catch(e) {
    return res.status(400).render("error.handlebars", { title: "Error Page", error_class: "input_error", message: e, error_route: req.session.currentPage });
}
    return res.status(200).render("home.handlebars", { title: "Organizations", orgList: orgNames });
});

router.route("/signoutuser").get(async (req, res) => {
    //code here for GET
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Session unable to be destroyed");
        }
        res.clearCookie("AuthenticationState");
    });
    return res.status(200).render("signoutuser.handlebars", { title: "Sign Out" });
});

export default router;
