var UsersDAO = require('../models/users').UsersDAO,
    ProjectDAO = require('../models/project').ProjectDAO,
    GoalsDAO = require('../models/goals').GoalsDAO,
    ScopesDAO = require('../models/scopes').ScopesDAO,
    OrganizationsDAO = require('../models/organization').OrganizationsDAO,
    WorkBreakdownStructuresDAO = require('../models/wbs').WorkBreakdownStructuresDAO,
    RisksDAO = require('../models/risks').RisksDAO,
    SessionsDAO = require('../models/sessions').SessionsDAO,
    sanitize = require('validator').sanitize, // Helper to sanitize form input
    gravatar = require('gravatar');

/* The ContentHandler must be constructed with a connected db */
function DashboardHandler(db) {
    "use strict";

    var users = new UsersDAO(db);
    var projects = new ProjectDAO(db);
    var goals = new GoalsDAO(db);
    var scopes = new ScopesDAO(db);
    var organizations = new OrganizationsDAO(db);
    var wbs = new WorkBreakdownStructuresDAO(db);
    var risks = new RisksDAO(db);
    var sessions = new SessionsDAO(db)


    // ========================================================================
    // DASHBOARD & MAIN HANDLER
    // ======================================================================== 
    this.displayMainPage = function (req, res, next) {
        "use strict";
        if (req.session && req.session.username) return res.redirect("/dashboard");
        return res.render('index', {});
    }

    this.displayDashboardPage = function (req, res, next) {
        "use strict";

        var section = req.params.section ? './sections/' + req.params.section + '.html' : '';

        if (!req.session || !req.session.username) return res.redirect("/login");

        projects.list(10, function (err, results) {
            "use strict";

            if (err) return next(err);

            var image = gravatar.url(req.session.email, {
                s: '100',
                r: 'pg',
                d: 'retro'
            });

            return res.render("dashboard", {
                'section': section,
                'session': req.session,
                'projects': results,
                'image': image
            });
        });


    }

    // set project
    this.setDashboardPage = function (req, res, next) {
        "use strict";
        if (!req.session || !req.session.username) return res.redirect("/login");
        if (req.query.project) {
            sessions.setSession(req.session['_id'], {
                'project': req.query.project
            }, function (err, session) {
                if (err) return next(err);
                return res.redirect("/dashboard/info");
            });
        } else return res.redirect("/dashboard");
    }

    // ========================================================================
    // USER HANDLERS
    // ========================================================================
    // LIST
    // ------------------------------------------------------------------------
    this.listUsers = function (req, res, next) {
        "use strict";
        if (!req.session || !req.session.username) return res.redirect("/login");
        users.list(req.query.search, function (err, items) {
            if (err) return next(err);
            return res.json(items);
        });
    }
    
    // ========================================================================
    // PROJECT HANDLERS
    // ========================================================================
    this.addProject = function (req, res, next) {
        "use strict";

        var section = 'newproject';
        var sectionView = './sections/' + section + '.html';

        var title = req.body.title;
        var description = req.body.description;
        var tags = req.body.tags;

        if (!req.session || !req.session.username) return res.redirect("/login");

        if (!title) {
            var errors = "Project must contain a title";
            return res.render("dashboard", {
                section: sectionView,
                subject: title,
                username: req.session.username,
                description: description,
                tags: tags,
                errors: errors
            });
        }

        tags = extract_tags(tags)

        // looks like a good entry, insert it escaped
        description = sanitize(description).escape();

        // substitute some <br> for the paragraph breaks
        //description = description.replace(/\r?\n/g, '<br>');

        project.add(title, description, tags, req.session.username,
            function (err, item) {
                "use strict";
                if (err) return next(err);
                return res.redirect("/")
            });
    }
    this.updateProject = function (req, res, next) {
        "use strict";
        res.json(req);
    }
    this.orderProject = function (req, res, next) {
        "use strict";
        res.json(req);
    }
    this.deleteProject = function (req, res, next) {
        "use strict";
        res.json(req);
    }

    // ========================================================================
    // INFO HANDLERS
    // ========================================================================
    this.getInfo = function (req, res, next) {
        "use strict";

        var section = './sections/info.html';

        if (!req.session || !req.session.username) return res.redirect("/login");

        projects.get(req.session.project, function (err, object) {
            "use strict";

            if (err) return next(err);

            var image = gravatar.url(req.session.email, {
                s: '100',
                r: 'pg',
                d: 'retro'
            });

            return res.render("dashboard", {
                'section': section,
                'session': req.session,
                'image': image,
                'project': object
            });
        });
    }
    this.addInfo = function (req, res, next) {
        "use strict";
        res.json(req);
    }
    this.updateInfo = function (req, res, next) {
        "use strict";

        var section = 'info';
        var sectionView = './sections/' + section + '.html';

        var title = req.body.title;
        var description = req.body.description;
        var tags = req.body.tags;

        if (!req.session || !req.session.username) return res.redirect("/login");
        if (!req.session.project) return res.redirect("/dashboard");

        if (!title) {
            var errors = "Project must contain a title";
            return res.render("dashboard", {
                'section': sectionView,
                'subject': title,
                'session': req.session,
                'description': description,
                'tags': tags,
                'errors': errors
            });
        }

        tags = extract_tags(tags)

        // looks like a good entry, insert it escaped
        description = sanitize(description).escape();

        // substitute some <br> for the paragraph breaks
        //description = description.replace(/\r?\n/g, '<br>');

        projects.update(req.session.project, title, description, tags, req.session.username,
            function (err, item) {
                "use strict";
                if (err) return next(err);
                return res.redirect("/dashboard/" + section);
            });
    }
    this.orderInfo = function (req, res, next) {
        "use strict";
        res.json(req);
    }
    this.deleteInfo = function (req, res, next) {
        "use strict";
        res.json(req);
    }



    // ========================================================================
    // GOALS HANDLERS
    // ========================================================================
    // ADD
    // ------------------------------------------------------------------------
    this.addGoal = function (req, res, next) {
        "use strict";

        var type = req.body.type;
        var title = req.body.title;
        var description = req.body.description;
        var priotry = req.body.priotry * 1;

        if (!req.session || !req.session.username) return res.redirect("/login");
        if (!req.session.project) return res.redirect("/dashboard");

        if (!title) {
            var errors = "Goal must contain a title";
        }

        // looks like a good entry, insert it escaped
        title = sanitize(title).escape();
        description = sanitize(description).escape();

        goals.add(req.session.project, type, title, description, priotry, null, req.session.username,
            function (err, item) {
                "use strict";
                if (err) return next(err);
                return res.json(item);
            });

    }
    // LIST
    // ------------------------------------------------------------------------
    this.listGoals = function (req, res, next) {
        "use strict";
        if (!req.session || !req.session.username) return res.redirect("/login");
        goals.list(req.session.project, function (err, items) {
            if (err) return next(err);
            return res.json(items);
        });
    }
    // UPDATE
    // ------------------------------------------------------------------------
    this.updateGoal = function (req, res, next) {
        "use strict";
        res.json(req);
    }
    // ORDER
    // ------------------------------------------------------------------------
    this.orderGoals = function (req, res, next) {
        "use strict";
        res.json(req);
    }
    // DELETE
    // ------------------------------------------------------------------------
    this.deleteGoal = function (req, res, next) {
        "use strict";
        goals.delete(req.body.id, function (err, item) {
            "use strict";
            if (err) return next(err);
            return res.json(item);
        });
    }




    // ========================================================================
    // SCOPE HANDLERS
    // ========================================================================
    // ADD
    // ------------------------------------------------------------------------
    this.addScope = function (req, res, next) {
        "use strict";

        var type = req.body.type;
        var title = req.body.title;
        var description = req.body.description;
        var priotry = req.body.priotry * 1;

        if (!req.session || !req.session.username) return res.redirect("/login");
        if (!req.session.project) return res.redirect("/dashboard");

        if (!title) {
            var errors = "Scope must contain a title";
        }

        // looks like a good entry, insert it escaped
        title = sanitize(title).escape();
        description = sanitize(description).escape();

        scopes.add(req.session.project, type, title, description, priotry, null, req.session.username,
            function (err, item) {
                "use strict";
                if (err) return next(err);
                return res.json(item);
            });

    }
    // LIST
    // ------------------------------------------------------------------------
    this.listScopes = function (req, res, next) {
        "use strict";
        if (!req.session || !req.session.username) return res.redirect("/login");
        scopes.list(req.session.project, function (err, items) {
            if (err) return next(err);
            return res.json(items);
        });
    }
    // UPDATE
    // ------------------------------------------------------------------------
    this.updateScope = function (req, res, next) {
        "use strict";
        res.json(req);
    }
    // ORDER
    // ------------------------------------------------------------------------
    this.orderScopes = function (req, res, next) {
        "use strict";
        res.json(req);
    }
    // DELETE
    // ------------------------------------------------------------------------
    this.deleteScope = function (req, res, next) {
        "use strict";
        scopes.delete(req.body.id, function (err, item) {
            "use strict";
            if (err) return next(err);
            return res.json(item);
        });
    }
    
    
    
    // ========================================================================
    // ORGANIZATION HANDLERS
    // ========================================================================
    // ADD
    // ------------------------------------------------------------------------
    this.addOrganization = function (req, res, next) {
        "use strict";

        var title = req.body.title;
        var user = req.body.user;

        if (!req.session || !req.session.username) return res.redirect("/login");
        if (!req.session.project) return res.redirect("/dashboard");

        // looks like a good entry, insert it escaped
        title = sanitize(title).escape();

        organizations.add(req.session.project, title, user, null, req.session.username,
            function (err, item) {
                "use strict";
                if (err) return next(err);
                return res.json(item);
            });

    }
    // LIST
    // ------------------------------------------------------------------------
    this.listOrganization = function (req, res, next) {
        "use strict";
        if (!req.session || !req.session.username) return res.redirect("/login");
        organizations.list(req.session.project, function (err, items) {
            if (err) return next(err);
            return res.json(items);
        });
    }
    // UPDATE
    // ------------------------------------------------------------------------
    this.updateOrganization = function (req, res, next) {
        "use strict";
        res.json(req);
    }
    // ORDER
    // ------------------------------------------------------------------------
    this.orderOrganization = function (req, res, next) {
        "use strict";
        res.json(req);
    }
    // DELETE
    // ------------------------------------------------------------------------
    this.deleteOrganization = function (req, res, next) {
        "use strict";
        organizations.delete(req.body.id, function (err, item) {
            "use strict";
            if (err) return next(err);
            return res.json(item);
        });
    }

    
    
    
    // ========================================================================
    // WBS HANDLERS
    // ========================================================================
    // ADD
    // ------------------------------------------------------------------------
    this.addWBS = function (req, res, next) {
        "use strict";

        var level = req.body.level * 1;
        var parent = req.body.parent;
        var title = req.body.title;

        if (!req.session || !req.session.username) return res.redirect("/login");
        if (!req.session.project) return res.redirect("/dashboard");

        if (level > 1 && !title) {
            return res.json({'error':'Level 2 and up needs a parent work property'});
        }

        // looks like a good entry, insert it escaped
        title = sanitize(title).escape();

        wbs.add(req.session.project, level, parent, title, null, req.session.username,
            function (err, item) {
                "use strict";
                if (err) return next(err);
                return res.json(item);
            });

    }
    // LIST
    // ------------------------------------------------------------------------
    this.listWBS = function (req, res, next) {
        "use strict";
        if (!req.session || !req.session.username) return res.redirect("/login");
        var level = (req.query.level * 1) -1 || 0
        wbs.list(req.session.project, level, function (err, items) {
            if (err) return next(err);
            return res.json(items);
        });
    }
    // UPDATE
    // ------------------------------------------------------------------------
    this.updateWBS = function (req, res, next) {
        "use strict";
        res.json(req);
    }
    // ORDER
    // ------------------------------------------------------------------------
    this.orderWBS = function (req, res, next) {
        "use strict";
        res.json(req);
    }
    // DELETE
    // ------------------------------------------------------------------------
    this.deleteWBS = function (req, res, next) {
        "use strict";
        wbs.delete(req.body.id, function (err, item) {
            "use strict";
            if (err) return next(err);
            return res.json(item);
        });
    }

    
    

    // ========================================================================
    // RISK HANDLERS
    // ========================================================================
    // ADD
    // ------------------------------------------------------------------------
    this.addRisk = function (req, res, next) {
        "use strict";

        var category = req.body.category;
        var description = req.body.description;
        var probability = Math.abs(req.body.probability * 1);
        var impact = Math.abs(req.body.impact * 1);
        var cost = req.body.cost;

        if (!req.session || !req.session.username) return res.redirect("/login");
        if (!req.session.project) return res.redirect("/dashboard");

        // looks like a good entry, insert it escaped
        description = sanitize(description).escape();
        cost = sanitize(cost).escape();

        risks.add(req.session.project, category, description, probability, impact, cost, null, req.session.username,
            function (err, item) {
                "use strict";
                if (err) return next(err);
                return res.json(item);
            });

    }
    // LIST
    // ------------------------------------------------------------------------
    this.listRisks = function (req, res, next) {
        "use strict";
        if (!req.session || !req.session.username) return res.redirect("/login");
        risks.list(req.session.project, function (err, items) {
            if (err) return next(err);
            return res.json(items);
        });
    }
    // UPDATE
    // ------------------------------------------------------------------------
    this.updateRisk = function (req, res, next) {
        "use strict";
        res.json(req);
    }
    // ORDER
    // ------------------------------------------------------------------------
    this.orderRisks = function (req, res, next) {
        "use strict";
        res.json(req);
    }
    // DELETE
    // ------------------------------------------------------------------------
    this.deleteRisk = function (req, res, next) {
        "use strict";
        risks.delete(req.body.id, function (err, item) {
            "use strict";
            if (err) return next(err);
            return res.json(item);
        });
    }

    
    
    // FUNCTIONS
    // ========================================================================
    function extract_tags(tags) {
        "use strict";

        var cleaned = [];

        var tags_array = tags.split(',');

        for (var i = 0; i < tags_array.length; i++) {
            if ((cleaned.indexOf(tags_array[i]) == -1) && tags_array[i] != "") {
                cleaned.push(tags_array[i].replace(/\s/g, ''));
            }
        }

        return cleaned
    }
}

module.exports = DashboardHandler;