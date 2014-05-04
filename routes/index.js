var SessionHandler = require('./session')
  , ContentHandler = require('./content')
  , ErrorHandler = require('./error').errorHandler;

module.exports = exports = function(app, db) {

    var sessionHandler = new SessionHandler(db);
    var contentHandler = new ContentHandler(db);

    // Middleware to see if a user is logged in
    app.use(sessionHandler.isLoggedInMiddleware);

    // The main page of the blog
    app.get('/', contentHandler.displayMainPage);

    // The main page of the blog, filtered by tag
    app.get('/tag/:tag', contentHandler.displayMainPageByTag);

    // A single post, which can be commented on
    app.get("/post/:permalink", contentHandler.displayPostByPermalink);
    //app.post('/newcomment', contentHandler.handleNewComment);
    app.get("/post_not_found", contentHandler.displayPostNotFound);

    // Displays the form allowing a user to add a new post. Only works for logged in users
    app.get('/newpost', contentHandler.displayNewPostPage);
    app.post('/newpost', contentHandler.handleNewPost);

    // Login form
    app.get('/login', sessionHandler.displayLoginPage);
    app.post('/login', sessionHandler.handleLoginRequest);

    // Logout page
    app.get('/logout', sessionHandler.displayLogoutPage);

    // Welcome page
    //app.get("/dashboard", sessionHandler.displayDashoardPage);
    app.get("/dashboard/set", contentHandler.setDashboardPage);
    app.get("/dashboard/info", contentHandler.displayInfoPage);
    app.get("/dashboard/:section?", contentHandler.displayDashboardPage);
    //app.post("/dashboard", contentHandler.handleDashboardPage);
    
    //app.get("/dashboard/project/add", contentHandler.displayAddProject);
    app.post("/dashboard/project/add", contentHandler.addProject);
    app.post("/dashboard/project/update", contentHandler.updateProject);
    app.post("/dashboard/project/order", contentHandler.orderProject);
    app.post("/dashboard/project/delete", contentHandler.deleteProject);
    
    app.post("/dashboard/info", contentHandler.updateInfo);
    app.post("/dashboard/info/add", contentHandler.addInfo);
    app.post("/dashboard/info/update", contentHandler.updateInfo);
    app.post("/dashboard/info/order", contentHandler.orderInfo);
    app.post("/dashboard/info/delete", contentHandler.deleteInfo);
    
    app.get("/dashboard/goals/get", contentHandler.getGoals);
    app.post("/dashboard/goals/add", contentHandler.addGoal);
    app.post("/dashboard/goals/update", contentHandler.updateGoal);
    app.post("/dashboard/goals/order", contentHandler.orderGoals);
    app.post("/dashboard/goals/delete", contentHandler.deleteGoal);
    
    app.post("/dashboard/scope", contentHandler.handleScopePage);

    // Signup form
    app.get('/signup', sessionHandler.displaySignupPage);
    app.post('/signup', sessionHandler.handleSignup);

    // Error handling middleware
    app.use(ErrorHandler);
}
