// models
var Star = require('mongoose').model('Star');

// services
var github = require('../services/github');
var star = require('../services/star');

module.exports = {

    /************************************************************************************************************

    @models

    + Star, where repo=repo_uuid, sha=sha

    ************************************************************************************************************/

    all: function(req, done) {
        Star.find({sha: req.args.sha, repo: req.args.repo_uuid}, done);
    },


    /************************************************************************************************************

    @models

    + Star, where repo=repo_uuid, sha=sha, user=user_uuid

    ************************************************************************************************************/

    get: function(req, done) {
        Star.findOne({
            sha: req.args.sha,
            user: req.user.id,
            repo: req.args.repo_uuid
        }, done);
    },

    /************************************************************************************************************

    @models

    + Star

    ************************************************************************************************************/

    set: function(req, done) {

        github.call({
            obj: 'repos',
            fun: 'one',
            arg: { id: req.args.repo_uuid },
            token: req.user.token
        }, function(err, repo) {

            if(err) {
                return done(err, repo);
            }

            if(!repo.permissions.pull) {
                return done({
                    code: 403,
                    text: 'Forbidden'
                });
            }

            star.create(req.args.sha, req.args.user, req.args.repo, req.args.repo_uuid, req.args.number, req.user, req.user.token, done);
        });
    },

    /************************************************************************************************************

    @models

    + Star

    ************************************************************************************************************/

    rmv: function(req, done) {

        github.call({
            obj: 'repos',
            fun: 'one',
            arg: { id: req.args.repo_uuid },
            token: req.user.token
        }, function(err, repo) {

            if(err) {
                return done(err, repo);
            }

            if(!repo.permissions.pull) {
                return done({
                    code: 403,
                    text: 'Forbidden'
                });
            }

            star.remove(req.args.sha, req.args.user, req.args.repo, req.args.repo_uuid, req.args.number, req.user, req.user.token, done);
        });
    },

    /************************************************************************************************************

    @models

    + Star sha: sha, repo_uuid: repo_uuid

    ************************************************************************************************************/

    threshold: function(req, done) {
        // Get the threshold by fetching .ninja file of the head commit and read the threshold value in config.
        github.call({
            obj: 'repos',
            fun: 'getContent',
            arg: {
                repo: req.args.repo_uuid,
                path: '.ninja',
                ref: 'heads' + req.args.sha
            },
            token: req.user.token
        }, function(err, file) {
            if(!err) {
                // TODO: Process file, read out config value and return it
                done(null, 1);
            }
        });
    }
};
