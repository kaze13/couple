var index = require('./routes/index');
var auth = require('./routes/auth');
module.exports = function (app) {

    app.get('/', auth.auth, index.index);
    app.get('/login', auth.login);
    app.post('/login', auth.login);
    app.get('/register', auth.register);
    app.post('/register', auth.register);
    app.get('/logout', auth.logout);
    app.get('/post',auth.auth, index.post);
    app.post('/newblog',auth.auth, index.newblog);
    app.get('/newblog',auth.auth,  index.newblog);
    app.get('/blog/:id',auth.auth,  index.blog);
    app.post('/blog/comment', auth.auth, index.comment);

};
