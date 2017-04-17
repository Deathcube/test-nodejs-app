var express = require('express'),
    path = require('path'),

    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),

    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),

    fs = require('fs'),
    jade = require('jade'),

    moment = require('moment'),
    conform = require('conform'),

    dburl = 'mongodb://localhost:27017/db';


var insertNewComment = function(db, comment, callback) {
    // Get the documents collection
    var collection = db.collection('comments');

    comment['date'] = Date.now();


    var cv =
        conform.validate(comment, {
            properties: {
                name: {
                    description: 'username',
                    type: 'string',
                    required: true,
                    minLength: 5
                },
                theme: {
                    description: 'text',
                    type: 'string',
                    minLength: 5
                },
                comment: {
                    description: 'text',
                    type: 'string',
                    required: true,
                    minLength: 5
                },
                parent: {
                    description: 'include parent id or empty string if root',
                    type: 'string'
                },
                date: {
                    description: 'timestamp when create',
                    type: 'number'
                }
            }
    });

    if (true === cv.valid){
        collection.insertOne(comment, function(err) {
            assert.equal(err, null);
            callback();
        });
    } else {
        callback(cv);
    }
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
                comments[i]['date'] = moment(comments[i]['date']).fromNow();
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

            insertNewComment(db, comment, function (errors) {
                getAllComments(db, function (data) {

                    comments = buildCommentsTree(prepareJSONdata(data));

                    var _data = {
                        comments:comments,
                        errors:errors.errors
                    };

                    var fn = jade.compile(fs.readFileSync('views/comment_generator.jade', 'utf-8'), {
                        filename: path.join(__dirname, 'views/comment_generator.jade')
                    });

                    var html = fn(_data);
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
