var config = require('../global').config;
var util = require('../libs/util.js');
var db = require('../global.js').database;

db.user = db.bind('blog');
db.user = db.bind('comment');

exports.index = function (req, res) {
    db.blog.find().toArray(function (err, blogs) {
        if (!err) {
            res.render('index', {'blogs': blogs});
        } else {
            next();
        }
    });
};

exports.post = function (req, res) {
    res.render('post');
}

exports.newblog = function (req, res) {


    if (req.method == "GET") {
        switch (req.query['tip']) {
            case 'failure':
                var tip = "failure";
                break;
            default :
                var tip = null;
                break;
        }
        res.render('newblog', {tip: tip});
    } else if (req.method == "POST") {
        var title = req.body.title;
        var content = req.body.content;
        var author = req.session.user.name;

        db.blog.insert({
            'title': title,
            'content': content,
            'author': author,
            'time': (new Date()).getTime()
        }, function (err, blog) {
            if (!err && blog && blog.length > 0) {
                if (blog.length > 0) {
                    res.redirect('/');
                } else {
                    res.redirect('/newblog/tip=failure');
                }
            } else {
                res.redirect('/newblog/tip=failure');
            }
        });
    }
}


exports.blog = function (req, res) {


        var tip;
        var test = new db.ObjectID(req.params.id);
        console.log(test);

        db.blog.findOne({'_id': db.ObjectID.createFromHexString(req.params.id)}, function (err, blog) {
            if (!err) {
                db.comment.find({blog: blog.id}).toArray(function (err, comments) {

                    if (!err) {

                        res.render('blog', {'comments': comments, 'tip': tip, 'blog': blog});


                    } else {
                        res.redirect('/tip=failure');
                    }


                })
            } else {
                console.log('error happened: ' + req.params.id);
                next();
            }
        })



}

exports.comment = function(req,res) {

    var content = req.body.comment;
    var blogid = req.body.blogid;
    var author = req.session.user.name;
    var tip = null;
    db.comment.insert({
        'blog': req.params.id,
        'content': content,
        'author': author,
        'time': (new Date()).getTime()
    }, function (err, comment) {
        if (!err) {
            db.comment.find({blog: comment.blog}).toArray(function (err, comments) {
                if (!err) {
                    res.redirect('/blog/' + blogid);

                } else {
                    res.redirect('/blog/tip=failure');
                }
            })
        }
        else {
            res.redirect('/blog/tip=failure');
        }
    });
}

