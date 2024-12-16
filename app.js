import express from 'express';
const app = express();
import session from 'express-session';
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';
 
app.use(express.json());
app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));

app.use(session({

     name: 'AuthenticationState',
   
     secret: 'some secret string!',
   
     resave: false,
   
     saveUninitialized: false
   
   })); // How does page cookie work when user not logged in?

app.use('/', async (req, res, next) => {
     let url = req.originalUrl
     let user = req.session.user
     if(!user) {
          if (url == "/") {
               return res.redirect('/signinuser');
          }
          else {
               next()
          }
     }
     else {
        if (url == "/") {
            return res.redirect("/home")
       }
       else {
            next()
       }
     }
     
   });

   app.use('/signinuser', async (req, res, next) => {
     let user = req.session.user
     if (!user) {
          next()
     }
     else {
        return res.redirect('/home');
     }
   });

   app.use('/signupuser', async (req, res, next) => {
     let user = req.session.user
     if (!user) {
          next()
     }
     else {
          return res.redirect('/home');
     }
   });

   app.use('/signoutuser', async (req, res, next) => {
     let user = req.session.user
     if (!user) {
          return res.redirect('/signinuser')
     }
     else {
          next()
     }
   });

app.use("/session/endsession", async (req, res, next) => {
    if (req.method == "GET")
        req.method = "PATCH";
    next()
});
app.use("/session/leavesession", async (req, res, next) => {
    if (req.method == "GET")
        req.method = "PATCH";
    next()
});
app.use("/session/sendvote", async (req, res, next) => {
    if (req.method == "GET")
        req.method = "PATCH";
    next()
});
app.use("/action/delete", async (req, res, next) => {
    if (req.method == "GET")
        req.method = "PATCH";
    next()
});
app.use("/action/callvote", async (req, res, next) => {
    if (req.method == "GET")
        req.method = "PATCH";
    next()
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});