/**
 * Created by ChenMinli on 13-12-13.
 */
var config = require('../global').config;
var util = require('../libs/util.js');
var db = require('../global.js').database;

db.bind('user');


exports.auth = function (req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        var cookie = req.cookies[config.auth_cookie_name];
        if (!cookie) {
            return res.redirect(config.login_path);
        }

        var auth_token = util.decrypt(cookie, config.session_secret);
        var auth = auth_token.split('\t');
        var user_name = auth[0];

        db.user.findOne({'name': user_name}, function (err, user) {
            if (!err && user) {
                if (user.email == config.admin_user_email)
                    user.isAdmin = true
                req.session.user = user;
                return next();
            }
            else {
                return res.redirect(config.login_path);
            }
        });
    }

};
exports.login = function (req, res, next) {

    if (req.method == 'GET') {
        res.clearCookie(config.auth_cookie_name, {
            path: '/'
        });
        switch (req.query['tip']) {
            case 'error':
                var tip = "wrong input";
                break;
            default :
                var tip = null;
                break;
        }
        res.render('login', {tip: tip});
    }
    else if (req.method == "POST") {

        var account = req.body.username;
        var password = util.md5(req.body.password);

        var query = null;

        query = {'name': account, 'password': password}

        db.user.findOne(query, function (err, user) {
            if (!err) {
                if (user != null) {
                    util.gen_session(user.name, user.password, res);
                    res.redirect('/');
                } else {
                    res.redirect('/login?tip=error')
                }
            } else {
                res.redirect('/login?tip=error')
            }
        })
    }
}
exports.register = function (req, res) {
    if (req.method == "GET") {
        switch (req.query['tip']) {
            case 'notemtpy':
                var tip = "not empty";
                break;
            case 'exists_name':
                var tip = "existed";
                break;
            case 'failure':
                var tip = "fail";
                break
            default :
                var tip = null;
                break;
        }
        res.render('register', {tip: tip});
    } else if (req.method == "POST") {

        var name = req.body.username;
        var password = req.body.password;

        if (name == "" || password == "") {
            res.redirect('/register?tip=notemtpy');
            return;
        }

        db.user.findOne({name: name}, function (err, name_result) {
            if (name_result == null) {//


                password = util.md5(password);
                var reg_time = util.getUTC8Time("YYYY-MM-DD HH:mm:ss");

                db.user.insert({
                    'name': name,
                    'reg_time': reg_time,
                    'password': password,
                    'isAdmin': true,
                    'canOperateShop': true
                }, function (err, user) {
                    if (!err && user && user.length > 0) {
                        if (user.length > 0) {
                            util.gen_session(user[0].name, user[0].password, res);
                            req.session.user = user[0];
                            res.redirect('/?tip=welcome');
                        } else {
                            res.redirect('/register?tip=failure')
                        }
                    } else {
                        res.redirect('/register?tip=failure')
                    }
                });


            } else {//
                res.redirect('/register?tip=exists_name')
            }
        });
    }
};
exports.logout = function (req, res) {
    req.session.destroy();
    res.clearCookie(config.auth_cookie_name, {
        path: '/'
    });
    res.redirect('/login');
}