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
                var ninjafile = new Buffer(file.content, 'base64').toString('ascii');
                ninja = JSON.parse(ninjafile);
            } catch(ex) {}
            done(err, ninja);
        });
    }
};
