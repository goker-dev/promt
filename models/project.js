/* The ProjectDAO must be constructed with a connected database object */
function ProjectDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof ProjectDAO)) {
        console.log('Warning: ProjectDAO constructor called without "new" operator');
        return new ProjectDAO(db);
    }

    var projects = db.collection("projects");

    this.addProject = function (title, description, tags, author, callback) {
        "use strict";
        console.log("inserting project" + title + description);

        // fix up the permalink to not include whitespace
        var permalink = title.replace( /\s/g, '_' );
        permalink = permalink.replace( /\W/g, '' );

        // Build a new post
        var project = {"title": title,
                "author": author,
                "description": description,
                "permalink":permalink,
                "tags": tags,
                "date": new Date()}

        // now insert the post
        // hw3.2 TODO
		  projects.insert(project, function(err, result) {
		  		if (err) {
					callback(err, null);
				} else {
					callback(null, project.permalink);
				}
		  });
    }
    
    this.updateProject = function (id, title, description, tags, author, callback) {
        "use strict";

        // fix up the permalink to not include whitespace
        var permalink = title.replace( /\s/g, '_' );
        permalink = permalink.replace( /\W/g, '' );

        // Build a new post
        var project = {"title": title,
                "description": description,
                "permalink":permalink,
                "tags": tags,
                "update": new Date()}
        console.log(id);
		  projects.update({'_id':new require('mongodb').ObjectID(id)}, {'$set':project}, {'$upsert':1}, function(err, item) {
		  		if (err) {
					callback(err, null);
				} else {
					callback(null, item);
				}
		  });
    }

    this.getProjects = function(num, callback) {
        "use strict";

        projects.find().sort('date', -1).limit(num).toArray(function(err, items) {
            "use strict";

            if (err) return callback(err, null);

            console.log("Found " + items.length + " projects");

            callback(err, items);
        });
    }
    
    
    this.getProject = function(id, callback) {
        "use strict";
        console.log(id);
        projects.findOne({'_id':new require('mongodb').ObjectID(id)}, function(err, item) {
            "use strict";
            if (err) return callback(err, null);
            callback(err, item);
        });
    }

    this.getProjectsByTag = function(tag, num, callback) {
        "use strict";

        projects.find({ tags : tag }).sort('date', -1).limit(num).toArray(function(err, items) {
            "use strict";

            if (err) return callback(err, null);

            console.log("Found " + items.length + " projects");

            callback(err, items);
        });
    }

    this.getProjectsByPermalink = function(permalink, callback) {
        "use strict";
        projects.findOne({'permalink': permalink}, function(err, item) {
            "use strict";

            if (err) return callback(err, null);

            callback(err, item);
        });
    }

}

module.exports.ProjectDAO = ProjectDAO;