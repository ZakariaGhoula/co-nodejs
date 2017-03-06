const AuthenticationController = require('./controllers/authentication');
const UserController = require('./controllers/user');
const express = require('express');
const passport = require('passport');
const ROLE_USER = require('./constants').ROLE_USER;
const ROLE_TEAM = require('./constants').ROLE_TEAM;
const ROLE_ADMIN = require('./constants').ROLE_ADMIN;

const passportService = require('./config/passport');

// Middleware to require login/auth
const requireAuth = passport.authenticate('jwt', { session: false });
const requireLogin = passport.authenticate('local', { session: false });

module.exports = function (app) {
    // Initializing route groups
    const apiRoutes = express.Router(),
        authRoutes = express.Router(),
        userRoutes = express.Router();

    //= ========================
    // Auth Routes
    //= ========================

    // Set auth routes as subgroup/middleware to apiRoutes
    apiRoutes.use('/auth', authRoutes);

    // Registration route
    authRoutes.post('/register', AuthenticationController.register);

    // Login route
    authRoutes.post('/login', requireLogin, AuthenticationController.login);

    // Password reset request route (generate/send token)
    authRoutes.post('/forgot-password', AuthenticationController.forgotPassword);

    // Password reset route (change password using token)
    authRoutes.post('/reset-password/:token', AuthenticationController.verifyToken);

    //= ========================
    // User Routes
    //= ========================

    // Set user routes as a subgroup/middleware to apiRoutes
    apiRoutes.use('/user', userRoutes);

    // View user profile route
    userRoutes.get('/:userId', requireAuth, UserController.viewProfile);

    // Test protected route
    apiRoutes.get('/protected', requireAuth, (req, res) => {
        res.send({ content: 'The protected test route is functional!' });
    });

    apiRoutes.get('/admins-only', requireAuth, AuthenticationController.roleAuthorization(ROLE_ADMIN), (req, res) => {
        res.send({ content: 'Admin dashboard is working.' });
    });


    // Set url for API group routes
    app.use('/api', apiRoutes);
};