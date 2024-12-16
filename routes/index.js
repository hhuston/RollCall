import authRoutes from './auth_routes.js';
import orgRoutes from './organizations.js';
import sessionRoutes from './session.js';
import actionRoutes from './action.js';

const constructorMethod = (app) => {
    app.use("/", authRoutes);
    app.use("/", orgRoutes);
    app.use("/session", sessionRoutes);
    app.use("/action", actionRoutes);

    app.use("*", (req, res) => {
        if (!req.session.currentPage) {
            req.session.currentPage = "/";
        }
        res.status(404).render("error.handlebars", { error_class: `not_found`, message: "Route Not Found!", error_route: req.session.currentPage });
    });
};

export default constructorMethod;
