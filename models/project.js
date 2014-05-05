/* The DAO must be constructed with a connected database object */
function ProjectDAO(db) {
    "use strict";

    var collection = "projects";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof ProjectDAO)) {
        console.log('Warning:  ' + collection + 'DAO constructor called without "new" operator');
        return new ProjectDAO(db);
    }

    var mongo = db.collection(collection);

    // ADD
    // ========================================================================       
    this.add = function (title, description, tags, author, callback) {
        "use strict";
        console.log("inserting project" + title + description);

        // fix up the permalink to not include whitespace
        var permalink = title.replace(/\s/g, '_').replace(/\W/g, '');

        // Build a new post
        var item = {
            "title": title,
            "author": author,
            "description": description,
            "permalink": permalink,
            "tags": tags,
            "date": new Date()
        }

        console.log("add an item in ", collection, item);

        mongo.insert(item, function (err, item) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, item);
            }
        });
    }

    // GET
    // ========================================================================   
    this.get = function (ID, callback) {
        "use strict";

        console.log("get an item in ", collection, ID);

        mongo.findOne({
            '_id': new require('mongodb').ObjectID(ID)
        }, function (err, item) {
            if (err) return callback(err, null);
            callback(err, item);
        });
    }


    // LIST
    // ========================================================================   
    this.list = function (limit, callback) {
        "use strict";

        console.log("list items from ", collection);

        mongo.find().sort('date', -1).limit(limit)
            .toArray(function (err, items) {
                "use strict";
                if (err) return callback(err, null);
                return callback(err, items);
            });
    }

    // UPDATE
    // ========================================================================   
    this.update = function (ID, title, description, tags, author, callback) {
        "use strict";

        // fix up the permalink to not include whitespace
        var permalink = title.replace(/\s/g, '_');
        permalink = permalink.replace(/\W/g, '');

        // Build a new item
        var item = {
            "title": title,
            "description": description,
            "permalink": permalink,
            "tags": tags,
            "update": new Date()
        }
        
        console.log('update an item in', collection, ID);
        
        mongo.update({
            '_id': new require('mongodb').ObjectID(ID)
        }, {
            '$set': item
        }, {
            '$upsert': 1
        }, function (err, item) {
            if (err) return callback(err, null);
            callback(null, item);
        });
    }

    // DELETE
    // ========================================================================   
    this.delete = function (tag, num, callback) {
        "use strict";
        
    }

}

module.exports.ProjectDAO = ProjectDAO;