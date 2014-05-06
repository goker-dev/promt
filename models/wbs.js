/* The DAO must be constructed with a connected database object */
function WorkBreakdownStructuresDAO(db) {
    "use strict";

    var collection = "workbreakdownstructures";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof WorkBreakdownStructuresDAO)) {
        console.log('Warning: ' + collection + 'DAO constructor called without "new" operator');
        return new WorkBreakdownStructuresDAO(db);
    }

    var mongo = db.collection(collection);

    // ADD
    // ========================================================================    
    this.add = function (project, level, parent, title, bound, author, callback) {
        "use strict";

        // Build a new item
        var item = {
            "project": project,
            "level": level,
            "parent": parent,
            "title": title,
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
    this.list = function (project, level, callback) {
        "use strict";

        console.log("list items from ", collection, project, level);

        var query = {
            'project': project,
            'status': 'active'
        };
        if (level) query.level = level;
        mongo.find(query).sort('date', 1)
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
                "title": title || item['title'],
                "user": user || item['user'],
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

    this.delete = function (ID, callback, sub) {
        //"use strict";
        var self = this;

        console.log('delete an item in', collection, ID, sub);

        mongo.find({
            'parent': ID
        })
            .toArray(function (err, items) {
                "use strict";
                for (var i in items)
                    self.delete(items[i]['_id'], null, true);

            });
        console.log('delete an item in', collection, ID, sub);
        mongo.update({
            '_id': new require('mongodb').ObjectID(ID.toString())
        }, {
            '$set': {
                'status': 'removed'
            }
        }, function (err) {
            if (callback) callback(err, ID);
        });

    }
}

module.exports.WorkBreakdownStructuresDAO = WorkBreakdownStructuresDAO;