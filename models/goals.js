/* The GoalsDAO must be constructed with a connected database object */
function GoalsDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof GoalsDAO)) {
        console.log('Warning: GoalsDAO constructor called without "new" operator');
        return new GoalsDAO(db);
    }

    var goals = db.collection("goals");

    this.addGoal = function (project, type, title, description, priotry, bound, author, callback) {
        "use strict";
        console.log("add a goal", title);

        // Build a new goal
        var goal = {
                "project": project,
                "type": type,
                "title": title,
                "description": description,
                "priotry": priotry,
                "status": 'active',
                "bound": bound,
                "author": author,
                "date": new Date()}

          goals.insert(goal, function(err, id) {
		  		if (err) {
					callback(err, null);
				} else {
					callback(null, goal);
				}
		  });
    }

    this.getGoals = function(num, callback) {
        "use strict";

        goals.find().sort('date', -1).limit(num).toArray(function(err, items) {
            "use strict";

            if (err) return callback(err, null);

            console.log("Found " + items.length + " goals");

            callback(err, items);
        });
    }

    this.getGoalsByTag = function(tag, num, callback) {
        "use strict";

        goals.find({ tags : tag }).sort('date', -1).limit(num).toArray(function(err, items) {
            "use strict";

            if (err) return callback(err, null);

            console.log("Found " + items.length + " goals");

            callback(err, items);
        });
    }

    this.getGoalByPermalink = function(permalink, callback) {
        "use strict";
        goals.findOne({'permalink': permalink}, function(err, goal) {
            "use strict";

            if (err) return callback(err, null);

            callback(err, goal);
        });
    }

    this.addComment = function(permalink, name, email, body, callback) {
        "use strict";

        var comment = {'author': name, 'body': body}

        if (email != "") {
            comment['email'] = email
        }

        // hw3.3 TODO
		  goals.findOne({permalink:permalink}, function(err, doc) {
		  		if (err) {
					callback(err, null);
				} else {
					if (doc) {
						goals.update({_id:doc._id}, {$push: {comments:comment}}, function(err) {
		  					if (err) {
								callback(err, null);
							} else {
								callback(null, 1);
							}
						});
					} else {
						callback(null, 0);
					}
				}
		  });
    }
}

module.exports.GoalsDAO = GoalsDAO;