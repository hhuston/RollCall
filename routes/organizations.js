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
    }catch(e){
        return res.status(400).render("error.handlebars", { error_class: "input_error", message: e, error_route: req.session.currentPage});
    }
    let orgName = req.params.orgName.trim()
    const Org = await organizationData.getOrganizationByName(orgName);
    if (!Org) {
      return res.status(400).render("error.handlebars", { error_class: "input_error", message: `Organization ${orgName} does not exist`, error_route: req.session.currentPage});
  }
  if (Org.members.some(mem => mem.userName === req.session.user.userName)) {
    return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You are already signin in to this organization!", error_route: req.session.currentPage});
  } else {
    req.session.currentPage = `/signinorganization/${orgName}`
    return res.status(200).render("signinorganization.handlebars", {orgName: orgName});
  }
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
      let role = req.body.role
      validation.exists(role, "Role")
      validation.is_str(password, "Role")
      validation.is_role(role)
      role = role.trim().toLowerCase()
      password = password.trim()
      if (!req.session.user) {
        return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage});
      }
      let userName = req.session.user.userName
      let resp = await organizationData.loginOrg(userName, password, orgName, role)
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
  .route('/leaveorganization/:orgName')
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
    let orgName = req.params.orgName.trim()
    const Org = await organizationData.getOrganizationByName(orgName);
        if (!Org) {
            if (!req.session.currentPage) {
                req.session.currentPage = "/"
            }
            return res.status(400).render("error.handlebars", { error_class: "input_error", message: `Organization ${orgName} does not exist`, error_route: req.session.currentPage});
        }
        if (Org.members.some(mem => mem.userName === req.session.user.userName)) {
          req.session.currentPage = `/leaveorganization/${orgName}`
          return res.status(200).render("leaveorganization.handlebars", {orgName: orgName});
        } else {
          return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must be a member of this organization in order to leave it!", error_route: req.session.currentPage});
        }
    }catch(e){
        return res.status(400).render("error.handlebars", { error_class: "input_error", message: e, error_route: req.session.currentPage});
    }
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
      if (!req.session.user) {
        return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage});
      }
      let userName = req.session.user.userName
      let resp = await organizationData.leaveOrg(userName, orgName)
      if (!resp) {
        return res.status(500).render("error.handlebars", { error_class: "server_error", message: "Internal Server Error", error_route: req.session.currentPage});
      }
      req.session.user = resp[0]
      return res.redirect(`/home`);
      
    }catch(e) {
      return res.status(400).render("error.handlebars", { error_class: "input_error", message: e, error_route: req.session.currentPage});
    }

  })
  .patch(async (req, res) => {
    if (!req.session.currentPage) {
      req.session.currentPage = "/"
    }
    try {
      validation.exists(req.params.orgName, "orgName")
      validation.is_str(req.params.orgName, "orgName")
      let orgName = req.params.orgName.trim()
      if (!req.session.user) {
        return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage});
      }
      let userName = req.body.userName
      console.log(req)
      let resp = await organizationData.leaveOrg(userName, orgName)
      console.log(resp)
      if (!resp) {
        return res.status(500).render("error.handlebars", { error_class: "server_error", message: "Internal Server Error", error_route: req.session.currentPage});
      }
      return resp[1]
      
    }catch(e) {
      return res.status(400).render("error.handlebars", { error_class: "input_error", message: e, error_route: req.session.currentPage});
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
        if (Org.members.some(mem => mem.userName === req.session.user.userName)) {
            let curr_member = Org.members.filter(mem => mem.userName === req.session.user.userName)
            let members = Org.members.filter(mem => mem.userName !== req.session.user.userName)
            curr_member = curr_member[0]
            let owner = ""
            let moderator = ""
            if (curr_member.role == "owner") {
              owner = "true"
              moderator = "true"
            }
            if (curr_member.role == "moderator") {
              moderator = "true"
            }

            req.session.currentPage = `/organization/${orgName}`
            return res.status(200).render("organization.handlebars", {orgData: Org, userData: req.session.user, moderator: moderator, owner: owner, role:curr_member.role, members: members});
        }
        else {
            return res.redirect(`/signinorganization/${orgName}`);
        }
    } catch (e) {
      return res.status(400).render("error.handlebars", { error_class: "input_error", message: e, error_route: req.session.currentPage});
    }

  })

export default router;