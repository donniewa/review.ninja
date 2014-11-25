// services
var url = require('../services/url');
var github = require('../services/github');
// models
var User = require('mongoose').model('User');

module.exports = {

    get: function(req, done) {

        User.findOne({ uuid: req.user.id }, function(err, user) {
            if(err) {
                return done(err, null);
            }

            done(err, {repos: user ? user.repos : null});
        });
    },

    addRepo: function(req, done) {

            github.call({
                obj: 'repos',
                fun: 'one',
                arg: { id: req.args.repo_uuid },
                token: req.user.token
            }, function(err, repo) {

                if(!repo.permissions.push) {
                    return done({
                        code: 403,
                        text: 'Forbidden'
                    });
                }

                User.findOne({ uuid: req.user.id }, function(err, user) {
                    if(user) {
                        var found = false;
                        user.repos.forEach(function(repo) {
                            if(repo === req.args.repo_uuid) {
                                found = true;
                            }
                        });

                        if(!found) {
                            user.repos.push(req.args.repo_uuid);
                            user.save();
                        }
                    }

                    done(err, {repos: user ? user.repos : null});
                });
            });

        },

        rmvRepo: function(req, done) {

            // remove from user array
            User.findOne({ uuid: req.user.id }, function(err, user) {
                if(user) {
                    var repos = [];
                    user.repos.forEach(function(repo) {
                        if(repo !== req.args.repo_uuid) {
                            repos.push(repo);
                        }
                    });

                    user.repos = repos;
                    user.save();
                }

                done(err, {repos: user ? user.repos : null});
            });
        }
};
