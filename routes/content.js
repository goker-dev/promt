var ProjectDAO = require('../models/project').ProjectDAO
  , GoalsDAO = require('../models/goals').GoalsDAO
  , SessionsDAO = require('../models/sessions').SessionsDAO 
  , sanitize = require('validator').sanitize,// Helper to sanitize form input
    gravatar = require('gravatar');

/* The ContentHandler must be constructed with a connected db */
function ContentHandler (db) {
    "use strict";

    var projects = new ProjectDAO(db);
    var goals = new GoalsDAO(db);
    var sessions = new SessionsDAO(db)

    this.displayMainPage = function(req, res, next) {
        "use strict";
        if (req.session && req.session.username) return res.redirect("/dashboard");
        return res.render('index', {});
    }
    
    this.displayDashboardPage = function(req, res, next) {
        "use strict";
        
        var section = req.params.section ? './sections/'+req.params.section+'.html' : '';
        
        if (!req.session || !req.session.username) return res.redirect("/login");
        
        projects.getProjects(10, function(err, results) {
            "use strict";

            if (err) return next(err);
            
            var image = gravatar.url(req.session.email, {s: '100', r: 'pg', d: 'retro'});

            return res.render("dashboard", {'section':section, 'session':req.session, 'projects': results, 'image':image});
        });
        
        
    }
    
    this.setDashboardPage = function(req, res, next) {
        "use strict";
        
        if (!req.session || !req.session.username) return res.redirect("/login");
        
        console.log(req.query);
        
        if (req.query.project) {
            
            sessions.setSession(req.session['_id'], {'project':req.query.project}, function(err, session){
                
                if (err) return next(err);
                return res.redirect("/dashboard/info");
                
            });
            
        } else return res.redirect("/dashboard");
        
    }
    
    this.handleDashboardPage = function(req, res, next) {
        "use strict"; 
        
        var section = req.params.section;
        var sectionView = './sections/'+section+'.html';
        
        var title = req.body.title;
        var description = req.body.description;
        var tags = req.body.tags;

        if (!req.session || !req.session.username) return res.redirect("/login");

        if (!title) {
            var errors = "Project must contain a title";
            return res.render("dashboard", {section:sectionView, subject:title, username:req.username, description:description, tags:tags, errors:errors});
        }

        var tags_array = extract_tags(tags)

        // looks like a good entry, insert it escaped
        var escaped_post = sanitize(description).escape();

        // substitute some <br> for the paragraph breaks
        var formatted_post = escaped_post.replace(/\r?\n/g,'<br>');

        projects.addProject(title, formatted_post, tags_array, req.username, function(err, permalink) {
            "use strict";

            if (err) return next(err);

            // now redirect to the blog permalink
            //return res.redirect("/" + permalink)
            return res.redirect("/")
        });
        
    }

    
    this.displayInfoPage = function(req, res, next) {
        "use strict";
        
        var section = './sections/info.html';
        
        if (!req.session || !req.session.username) return res.redirect("/login");
        
        projects.getProject(req.session.project, function(err, object) {
            "use strict";

            if (err) return next(err);
            //console.log(req.session.project, object);
            var image = gravatar.url(req.session.email, {s: '100', r: 'pg', d: 'retro'});

            return res.render("dashboard", {'section':section, 'session':req.session, 'image':image, 'project': object});
        });
        
        
    }
    this.handleInfoPage = function(req, res, next) {
        "use strict";

        var tag = req.params.tag;
        
    }
    
    this.getGoals = function(req, res, next) {
        "use strict";

        var project = req.body.project;
        
        if (!req.session || !req.session.username) return res.redirect("/login");

        if (!title) {
            var errors = "Goal must contain a title";
        }
        
        // looks like a good entry, insert it escaped
        var escaped_title = sanitize(title).escape();
        var escaped_description = sanitize(description).escape();

        goals.addGoal(0, type, escaped_title, escaped_description, priotry, null, req.username, function(err, object) {
            "use strict";
            if (err) return next(err);
            else return res.json(object);
        });
        
    }
    
    this.addGoal = function(req, res, next) {
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
        var escaped_title = sanitize(title).escape();
        var escaped_description = sanitize(description).escape();

        goals.addGoal(req.session.project, type, escaped_title, escaped_description, priotry, null, req.username, function(err, object) {
            "use strict";
            if (err) return next(err);
            else return res.json(object);
        });
        
    }
    this.updateGoal = function(req, res, next) {
        "use strict";

        res.json(req);
        
    }
    this.orderGoals = function(req, res, next) {
        "use strict";

        var tag = req.params.tag;
        
    }
    this.deleteGoal = function(req, res, next) {
        "use strict";

        var tag = req.params.tag;
        
    }
    
    
    this.handleScopePage = function(req, res, next) {
        "use strict";

        var tag = req.params.tag;
        
    }
    
    
    
    this.displayMainPageByTag = function(req, res, next) {
        "use strict";

        var tag = req.params.tag;

        projects.getPostsByTag(tag, 10, function(err, results) {
            "use strict";

            if (err) return next(err);

            return res.render('blog_template', {
                title: 'blog homepage',
                username: req.username,
                myposts: results
            });
        });
    }

    this.displayPostByPermalink = function(req, res, next) {
        "use strict";

        var permalink = req.params.permalink;

        projects.getPostByPermalink(permalink, function(err, post) {
            "use strict";

            if (err) return next(err);

            if (!post) return res.redirect("/post_not_found");

            // init comment form fields for additional comment
            var comment = {'name': req.username, 'body': "", 'email': ""}

            return res.render('entry_template', {
                title: 'blog post',
                username: req.username,
                post: post,
                comment: comment,
                errors: ""
            });
        });
    }

    this.displayPostNotFound = function(req, res, next) {
        "use strict";
        return res.send('Sorry, post not found', 404);
    }

    this.displayNewPostPage = function(req, res, next) {
        "use strict";

        if (!req.session.username) return res.redirect("/login");

        return res.render('newpost_template', {
            subject: "",
            body: "",
            errors: "",
            tags: "",
            username: req.username
        });
    }

    function extract_tags(tags) {
        "use strict";

        var cleaned = [];

        var tags_array = tags.split(',');

        for (var i = 0; i < tags_array.length; i++) {
            if ((cleaned.indexOf(tags_array[i]) == -1) && tags_array[i] != "") {
                cleaned.push(tags_array[i].replace(/\s/g,''));
            }
        }

        return cleaned
    }

    this.handleNewPost = function(req, res, next) {
        "use strict";

        var title = req.body.subject
        var post = req.body.body
        var tags = req.body.tags

        if (!req.session.username) return res.redirect("/signup");

        if (!title || !post) {
            var errors = "Post must contain a title and blog entry";
            return res.render("newpost_template", {subject:title, username:req.username, body:post, tags:tags, errors:errors});
        }

        var tags_array = extract_tags(tags)

        // looks like a good entry, insert it escaped
        var escaped_post = sanitize(post).escape();

        // substitute some <br> for the paragraph breaks
        var formatted_post = escaped_post.replace(/\r?\n/g,'<br>');

        posts.insertEntry(title, formatted_post, tags_array, req.username, function(err, permalink) {
            "use strict";

            if (err) return next(err);

            // now redirect to the blog permalink
            return res.redirect("/post/" + permalink)
        });
    }
}

module.exports = ContentHandler;
