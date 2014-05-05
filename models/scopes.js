/* The DAO must be constructed with a connected database object */
function ScopesDAO(db) {
    "use strict";
    
    var collection = "scopes";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof ScopesDAO)) {
        console.log('Warning: '+ collection +'DAO constructor called without "new" operator');
        return new ScopesDAO(db);
    }
    
    var mongo = db.collection(collection);

    // ADD
    // ========================================================================    
    this.add = function (project, type, title, description, priotry, bound, author, callback) {
        "use strict";

        // Build a new item
        var item = {
            "project": project,
            "type": type,
            "description": description,
            "status": 'active',
            "bound": bound,
            "author": author,
            "date": new Date()
        }

        console.log("add an item in ", collection, item);

        mongo.insert(item, function (err, id) {
            if (err) return callback(err, null);
            callback(null, item);
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
    this.list = function (project, callback) {
        "use strict";

        console.log("list items from ", collection, project);
        
        mongo.find({
            'project': project,
            'status': 'active'
        }).sort('date', -1)
            .toArray(function (err, items) {
                "use strict";
                if (err) return callback(err, null);
                callback(err, items);
            });
    }

    // UPDATE
    // ========================================================================  
    this.update = function (project, callback) {
        "use strict";

        console.log('update an item in', collection, ID);

        mongo.findOne({
            '_id': new require('mongodb').ObjectID(ID)
        }, function (err, item) {
            if (err) return callback(err, null);

            var item = {
                "project": project,
                "type": type || item['type'],
                "description": description || item['description'],
                "status": 'active',
                "bound": item['_id'],
                "author": author,
                "date": new Date()
            }

            mongo.insert(item, function (err, id) {
                if (err) return callback(err, null);
                callback(null, item);
            });

        });

    }

    // DELETE
    // ========================================================================   

    this.delete = function (ID, callback) {
        "use strict";

        console.log('delete an item in', collection, ID);

        mongo.update({
            '_id': new require('mongodb').ObjectID(ID)
        }, {
            '$set': {
                'status': 'removed'
            }
        }, function (err, item) {
            if (err) return callback(err, null);
            callback(err, ID);
        });
    }
}

module.exports.ScopesDAO = ScopesDAO;