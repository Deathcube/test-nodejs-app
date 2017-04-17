var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs');
var jade = require('jade');

var dburl = 'mongodb://localhost:27017/db';


var insertNewComment = function(db, comment, callback) {
    // Get the documents collection
    var collection = db.collection('comments');

    comment['date'] = Date.now();

    collection.insertOne(comment, function(err, result) {
        assert.equal(err, null);
        callback(result);
    });
};


var getAllComments = function(db, callback) {
    // Get the documents collection
    var collection = db.collection('comments');


    var comments = [];
    var cursor = collection.find({});
    cursor.each(function(err, item) {

        // If the item is null then the cursor is exhausted/empty and closed
        if(item == null) {

            for (var i = 0; i < comments.length; i += 1) {
                comments[i]['id'] = comments[i]._id.toString();
            }
            callback(comments);
            db.close();
        } else {
            comments.push(item);
        }
    });
};

var buildCommentsTree = function (nodes) {
    var map = {}, node, tree = [];
    for (var i = 0; i < nodes.length; i += 1) {
        node = nodes[i];
        node.children = [];
        map[node.id] = i;
        if (node.parent !== "") {
            nodes[map[node.parent]].children.push(node);
        } else {
            tree.push(node);
        }
    }
    return tree;
};


var prepareJSONdata = function (data) {
    for (var i = 0; i < data.length; i += 1) {
        data[i]['children'] = null;
    }
    return data;
};


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.route('/')
    .get(function (req, res) {
        var comments = [];

        MongoClient.connect(dburl, function(err, db) {
            assert.equal(null, err);

            getAllComments(db, function (data) {
                comments = buildCommentsTree(prepareJSONdata(data));
                res.render('index', {'comments':comments, 'title':'Comments'});
            });
        });
    })
    .post(function (req,res) {
        var comment = req.body;

        MongoClient.connect(dburl, function(err, db) {
            assert.equal(null, err);

            insertNewComment(db, comment, function () {
                getAllComments(db, function (data) {

                    comments = buildCommentsTree(prepareJSONdata(data));

                    var fn = jade.compile(fs.readFileSync('views/comment_generator.jade', 'utf-8'), {
                        filename: path.join(__dirname, 'views/comment_generator.jade')
                    });

                    var html = fn(comments);
                    res.send(html);
                });
            });
        });
    });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
