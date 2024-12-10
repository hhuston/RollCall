import validation from "../validation.js"
import {Router} from 'express';
const router = Router();
import {organizationData, userData} from '../data/index.js';
// 
//when patching game, should game stay same place in the array

router
  .route('/createorganization')
  .get(async (req, res) => {
    //code here for GET
    if (!req.session.user) {
        if (!req.session.currentPage) {
            req.session.currentPage = "/"
        }
        if (!req.session.user) {
            return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage});
        }
    }
    req.session.currentPage = "/createorganization"
    return res.status(200).render("createorganization.handlebars");
  })
  .post(async (req, res) => {
    //code here for POST
    let orgName = req.body.orgName
    let password = req.body.password
    let confirmPassword = req.body.confirmPassword
    try {
        if (!req.session.currentPage) {
            req.session.currentPage = "/"
        }
        if (!req.session.user) {
            return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage});
        }
      validation.exists(orgName, "OrgName")
      validation.exists(password, "Password")
      validation.exists(confirmPassword, "Confirm Password")
      validation.is_str(orgName, "OrgName")
      validation.is_str(password, "Password")
      validation.is_str(confirmPassword, "Confirm Password")
      orgName = orgName.trim()
      password = password.trim()
      confirmPassword = confirmPassword.trim()
      if (password != confirmPassword) {
        throw 'passwords must match'
      }
    
      let resp = await organizationData.createOrganization(orgName, password, req.session.user.userName)
      if (!resp) {
        return res.status(500).render("error.handlebars", { error_class: "server_error", message: "Internal Server Error", error_route: "/createorganization"});
      }
      req.session.user.memberOrganizations.push(resp._id.toString())
      return res.redirect(`/organization/${orgName}`);
    } catch(e) {
      return res.status(400).render("error.handlebars", { error_class: "input_error", message: e, error_route: "/createorganization"});
    }
  });

router
  .route('/signinorganization/:orgName')
  .get(async (req, res) => {
    //code here for GET
    if (!req.session.currentPage) {
        req.session.currentPage = "/"
    }
    if (!req.session.user) {
        return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage});
    }
    try {
    validation.exists(req.params.orgName, "orgName")
    validation.is_str(req.params.orgName, "orgName")
    if (!req.session.currentPage) {
        req.session.currentPage = "/"
    }
    }catch(e){
        return res.status(400).render("error.handlebars", { error_class: "input_error", message: e, error_route: req.session.currentPage});
    }
    let orgName = req.params.orgName.trim()
    req.session.currentPage = `/signinorganization/${orgName}`
    return res.status(200).render("signinorganization.handlebars", {orgName: orgName});
  })
  .post(async (req, res) => {
    //code here for POST
    if (!req.session.currentPage) {
        req.session.currentPage = "/"
    }
    try {
      validation.exists(req.params.orgName, "orgName")
      validation.is_str(req.params.orgName, "orgName")
      let orgName = req.params.orgName.trim()
      let password = req.body.password
      validation.exists(password, "Password")
      validation.is_str(password, "Password")
      password = password.trim()
      if (!req.session.user) {
        return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage});
      }
      let userName = req.session.user.userName
      let resp = await organizationData.loginOrg(userName, password, orgName)
      if (!resp) {
        return res.status(500).render("error.handlebars", { error_class: "server_error", message: "Internal Server Error", error_route: "/signinuser"});
      }
      req.session.user = resp[0]
      return res.redirect(`/organization/${orgName}`);
      
    }catch(e) {
      return res.status(400).render("error.handlebars", { error_class: "input_error", message: e, error_route: "/signinuser"});
    }

  });

router
.route('/organization')
.post(async (req, res) => {
    try {
        if (!req.session.currentPage) {
            req.session.currentPage = "/"
        }
        if (!req.session.user) {
            return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage});
        }
        validation.exists(req.body.org_search_term, "orgName")
        validation.is_str(req.body.org_search_term, "orgName")
        let orgName = req.body.org_search_term.trim()
        return res.redirect(`/organization/${orgName.toLowerCase()}`);
    } catch (e) {
      return res.status(400).render("error.handlebars", { error_class: "input_error", message: e, error_route: req.session.currentPage});
    }
});

  router
  .route('/organization/:orgName')
  .get(async (req, res) => {
    //code here for GET
    try {
        if (!req.session.currentPage) {
            req.session.currentPage = "/"
        }
        if (!req.session.user) {
            return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage});
        }
        validation.exists(req.params.orgName, "orgName")
        validation.is_str(req.params.orgName, "orgName")
        let orgName = req.params.orgName.trim()
        const Org = await organizationData.getOrganizationByName(orgName);
        if (!Org) {
            if (!req.session.currentPage) {
                req.session.currentPage = "/"
            }
            return res.status(400).render("error.handlebars", { error_class: "input_error", message: `Organization ${orgName} does not exist`, error_route: req.session.currentPage});
        }
        if (Org.members.includes(req.session.user.userName)) {
            req.session.currentPage = `/organization/${orgName}`
            return res.status(200).render("organization.handlebars", {orgData: Org, userData: req.session.user});
        }
        else {
            return res.redirect(`/signinorganization/${orgName}`);
        }
    } catch (e) {
      return res.status(400).render("error.handlebars", { error_class: "input_error", message: e, error_route: req.session.currentPage});
    }

  })

export default router;