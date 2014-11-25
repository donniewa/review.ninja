// module
var url = require('../services/url');
var github = require('../services/github');

module.exports = {
    get: function(req, done) {
        github.call({
            obj: 'repos',
            fun: 'getHooks',
            arg: {
                user: req.args.user,
                repo: req.args.repo
            },
            token: req.user.token
        }, function(err, hooks) {
            var hook = null;
            if(!err) {
                hooks.forEach(function(webhook) {
                    if(webhook.name === 'reviewninja') {
                        hook = webhook;
                    }
                });
            }
            done(err, hook);
        });
    },

    create: function(req, done) {
        github.call({
            obj: 'repos',
            fun: 'createHook',
            arg: {
                user: req.args.user,
                repo: req.args.repo,
                name: 'reviewninja',
                config: {domain: url.baseUrl, token: req.user.token},
                active: true
            },
            token: req.user.token
        }, done);
    }
};
