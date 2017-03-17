const AuthenticationController = require('./controllers/authentication');
const UserController = require('./controllers/user');
const SeasonalProductController = require('./controllers/seasonal_product');
const TagController = require('./controllers/tag');
const NetworkController = require('./controllers/network');
const RecipeController = require('./controllers/recipes');
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
        userRoutes = express.Router(),
        networkRoutes = express.Router(),
        seasonalProductRoutes = express.Router(),
        tagRoutes = express.Router(),
        recipeRoutes = express.Router();

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

    authRoutes.post('/update-password', requireAuth, AuthenticationController.changePassword);

    //= ========================
    // User Routes
    //= ========================

    // Set user routes as a subgroup/middleware to apiRoutes
    apiRoutes.use('/user', userRoutes);

    // View user profile route
    userRoutes.get('/:userId', requireAuth, UserController.viewProfile);
    userRoutes.get('/external/:userId', requireAuth, UserController.viewExternalProfile);
   // userRoutes.get('/thumb/:userId', requireAuth, UserController.thumbImg);

    userRoutes.post('/media/update', requireAuth, UserController.updateMedia);
    userRoutes.post('/profile/update', requireAuth, UserController.updateProfile);
    userRoutes.post('/provider/update', requireAuth, UserController.updateProvider);
    userRoutes.post('/config/update', requireAuth, UserController.updateConfig);
    userRoutes.post('/activation/update', requireAuth, UserController.updateActivation);

    userRoutes.get('/autocomplete/:userId/:name', requireAuth, UserController.getAllUserAutoComplete);


    // Test protected route
    apiRoutes.get('/protected', requireAuth, (req, res) => {
        res.send({ content: 'The protected test route is functional!' });
    });

    apiRoutes.get('/admins-only', requireAuth, AuthenticationController.roleAuthorization(ROLE_ADMIN), (req, res) => {
        res.send({ content: 'Admin dashboard is working.' });
    });

    //
    // = ========================
    // Tag Routes
    //= ========================


    apiRoutes.use('/recipes', recipeRoutes);

    recipeRoutes.get('/traite', requireAuth, RecipeController.getTraitementRecipe);
   recipeRoutes.get('/:userId', requireAuth, RecipeController.getAllRecipesByUserId);
   recipeRoutes.post('/recipe/delete', requireAuth, RecipeController.deleteRecipe);


    //= ========================
    // Seasonal product Routes
    //= ========================

    apiRoutes.use('/network', networkRoutes);

    networkRoutes.get('/abos/:userId', requireAuth, NetworkController.getAllNetworkHost);
    networkRoutes.get('/follow/:userId', requireAuth, NetworkController.getAllNetworkGuest);
    networkRoutes.post('/follow/add', requireAuth, NetworkController.addFollower);
    networkRoutes.post('/follow/remove', requireAuth, NetworkController.removeFollower);

     //= ========================
    // Seasonal product Routes
    //= ========================

    apiRoutes.use('/seasonal-products', seasonalProductRoutes);

    seasonalProductRoutes.get('/:lng', requireAuth, SeasonalProductController.getAllSeasonalProducts);
    seasonalProductRoutes.get('/:lng/:season', requireAuth, SeasonalProductController.getSeasonalProducts);


    // = ========================
    // Tag Routes
    //= ========================

    apiRoutes.use('/tags', tagRoutes);

    tagRoutes.get('/:lng', requireAuth, TagController.getAllTags);
    tagRoutes.get('/suggest/:lng', requireAuth, TagController.getAllTagsSuggest);
    tagRoutes.get('/autocomplete/:lng/:name', requireAuth, TagController.getAllTagsAutoComplete);





    // Set url for API group routes
    app.use('/api', apiRoutes);
};