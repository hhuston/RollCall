import * as users from "../data/users.js";
import * as organizations from "../data/organizations.js";
import validation from '../validation.js'
import {Router} from 'express';
const router = Router();

router.route('/').get(async (req, res) => {
  //code here for GET THIS ROUTE SHOULD NEVER FIRE BECAUSE OF MIDDLEWARE #1 IN SPECS.
  return res.json({error: 'YOU SHOULD NOT BE HERE!'});
});

router
  .route('/signupuser')
  .get(async (req, res) => {
    //code here for GET
    req.session.currentPage = "/signupuser"
    return res.status(200).render("signupuser.handlebars");
  })
  .post(async (req, res) => {
    //code here for POST
    let userName = req.body.userName
    let firstName = req.body.firstName
    let lastName = req.body.lastName
    let password = req.body.password
    let confirmPassword = req.body.confirmPassword
    let email = req.body.email
    try {
      validation.exists(userName, "UserName")
      validation.exists(password, "Password")
      validation.exists(confirmPassword, "Confirm Password")
      validation.exists(firstName, "First Name")
      validation.exists(lastName, "Last Name")
      validation.exists(email, "Email")
      validation.is_str(userName, "UserName")
      validation.is_str(password, "Password")
      validation.is_str(confirmPassword, "Confirm Password")
      validation.is_str(firstName, "First Name")
      validation.is_str(lastName, "Last Name")
      validation.is_str(email, "Email")
      validation.is_email(email)
      validation.is_name(firstName, "First Name")
      validation.is_name(lastName, "Last Name")
      userName = userName.trim()
      validation.is_user_id(userName, "userName")
      userName = userName.toLowerCase()
      password = password.trim()
      validation.is_password(password, "Password")
      confirmPassword = confirmPassword.trim()
      validation.is_password(confirmPassword, "Confirm Password")
      if (password != confirmPassword) {
        throw 'passwords must match'
      }
      firstName = firstName.trim()
      lastName = lastName.trim()
      email = email.trim()
    
      let resp = await users.createUser(userName, password, firstName, lastName, email)
      if (!resp.userName) {
        return res.status(500).render("error.handlebars", { error_class: "server_error", message: "Internal Server Error", error_route: "/signupuser"});
      }
      return res.redirect('/signinuser');
    } catch(e) {
      return res.status(400).render("error.handlebars", { error_class: "input_error", message: e, error_route: "/signupuser"});
    }
  });

router
  .route('/signinuser')
  .get(async (req, res) => {
    //code here for GET
    req.session.currentPage = "/signinuser"
    return res.status(200).render("signinuser.handlebars");
  })
  .post(async (req, res) => {
    //code here for POST
    let userName = req.body.user_name
    let password = req.body.password
    try {
      validation.exists(userName, "UserName")
      validation.exists(password, "Password")
      validation.is_str(userName, "UserName")
      validation.is_str(password, "Password")
      userName = userName.trim()
      validation.is_user_id(userName, "userName")
      password = password.trim()
      validation.is_password(password, "Password")
      userName = userName.toLowerCase()
      let resp = await users.loginUser(userName, password)
      if (!resp.userName) {
        return res.status(500).render("error.handlebars", { error_class: "server_error", message: "Internal Server Error", error_route: "/signinuser"});
      }
      req.session.user = resp
      return res.redirect('/home');
      
    }catch(e) {
      return res.status(400).render("error.handlebars", { error_class: "input_error", message: e, error_route: "/signinuser"});
    }

  });

router.route('/home').get(async (req, res) => {
  //code here for GET

  if (!req.session.currentPage) {
    req.session.currentPage = "/"
}
  if(!req.session.user) {
    return res.status(403).render("error.handlebars", { error_class: "input_error", message: "You must sign in to access this page!", error_route: req.session.currentPage});
  }
  req.session.currentPage = "/home"
  return res.status(200).render("home.handlebars");


});

router.route('/signoutuser').get(async (req, res) => {
  //code here for GET
  req.session.destroy((err) => {
    if (err) {
        return res.status(500).send('Session unable to be destroyed')
    }
    res.clearCookie('AuthenticationState')
  });
  return res.status(200).render("signoutuser.handlebars");
});

export default router