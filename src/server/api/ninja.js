// libraries
var merge = require('merge');

// services
var github = require('../services/github');

module.exports = {

/************************************************************************************************************

    @models

    + Ninja user: user, repo: repo, ref: ref of branch/commit, path: filepath

    ************************************************************************************************************/

    get: function(req, done) {
        github.call({
            obj: 'repos',
            fun: 'getContent',
            arg: {
                user: req.args.user,
                repo: req.args.repo,
                ref: req.args.ref,
                path: '.ninja'
            },
            token: req.user.token
        }, function(err, file) {
            var ninja;
            try {
                ninja = new Buffer(file.content, 'base64').toString('ascii');
                ninja = JSON.parse(ninja);
            } catch(ex) {
                console.log('ex', ex);
            }
            done(err, ninja);
        });
    }
};
