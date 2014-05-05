
var SessionHandler = require('./session')
  , DashboardHandler = require('./dashboard')
  , ErrorHandler = require('./error').errorHandler;

module.exports = exports = function(app, db) {

    var sessionHandler = new SessionHandler(db);
    var dashboardHandler = new DashboardHandler(db);

    // Middleware to see if a user is logged in
    app.use(sessionHandler.isLoggedInMiddleware);

    // The main page of the system
    app.get('/', dashboardHandler.displayMainPage);

    // Signup form
    app.get('/signup', sessionHandler.displaySignupPage);
    app.post('/signup', sessionHandler.handleSignup);

    // Login form
    app.get('/login', sessionHandler.displayLoginPage);
    app.post('/login', sessionHandler.handleLoginRequest);

    // Logout page
    app.get('/logout', sessionHandler.displayLogoutPage);

    app.post("/dashboard/project/add", dashboardHandler.addProject);
    app.post("/dashboard/project/update", dashboardHandler.updateProject);
    app.post("/dashboard/project/order", dashboardHandler.orderProject);
    app.post("/dashboard/project/delete", dashboardHandler.deleteProject);
    
    app.get("/dashboard/info", dashboardHandler.getInfo);
    app.post("/dashboard/info", dashboardHandler.updateInfo);
    
    app.post("/dashboard/goals/add", dashboardHandler.addGoal);
    app.get("/dashboard/goals/list", dashboardHandler.listGoals);
    app.post("/dashboard/goals/update", dashboardHandler.updateGoal);
    app.post("/dashboard/goals/order", dashboardHandler.orderGoals);
    app.post("/dashboard/goals/delete", dashboardHandler.deleteGoal);
    
    app.post("/dashboard/scope/add", dashboardHandler.addScope);
    app.get("/dashboard/scope/list", dashboardHandler.listScopes);
    app.post("/dashboard/scope/update", dashboardHandler.updateScope);
    app.post("/dashboard/scope/order", dashboardHandler.orderScopes);
    app.post("/dashboard/scope/delete", dashboardHandler.deleteScope);
    
    
    app.post("/dashboard/risk/add", dashboardHandler.addRisk);
    app.get("/dashboard/risk/list", dashboardHandler.listRisks);
    app.post("/dashboard/risk/update", dashboardHandler.updateRisk);
    app.post("/dashboard/risk/order", dashboardHandler.orderRisks);
    app.post("/dashboard/risk/delete", dashboardHandler.deleteRisk);
    
    
    // Dashboard
    app.get("/dashboard/set", dashboardHandler.setDashboardPage);
    app.get("/dashboard/:section?", dashboardHandler.displayDashboardPage);

    // Error handling middleware
    app.use(ErrorHandler);
}
