var Keen = require('keen.io');
var keenconfig = require('./keenconfig');
var github = require('../services/github');

Array.prototype.last = function() {
    return this[this.length - 1];
};

module.exports = function() {
    var client = Keen.configure(keenconfig);
    var prefix = 'dev90001';

    function addEvent(name, data) {
        client.addEvent(name.join(), data, function(err) {
            if(err) {
                return console.log('Keen.io log error', err);
            }
        });
    }

    function getPullRequest(user, repo, pr, done) {
        github.call({
            obj: 'pullRequests',
            fun: 'get',
            arg: {
                user: user,
                repo: repo,
                number: pr
            }
        }, function(err, pr) {
            if(err) {
                return done(err, {});
            }
            var pull_request = {
                id: pr.id,
                title: pr.title,
                number: pr.number,
                created_at: pr.created_at,
                comments: pr.comments,
                commits: pr.commits
            };
            return done(null, pull_request);
        });
    }

    function star(user, repo, prid, action) {
        var data = {
            object: {
                user: user,
                repo: repo
            },
            action: action
        };
        getPullRequest(user, repo, prid, function(err, pull_request) {
            if(err) {
                return console.log('Error fetching pull request', err);
            }
            data.pull_request = pull_request;
            addEvent([prefix, user, repo, 'star', action], data);
        });
    }

    this.setStar = function(user, repo, prid) {
        star(user, repo, prid, 'add');
    };

    this.removeStar = function(user, repo, prid) {
        star(user, repo, prid, 'remove');
    };

    this.addIssue = function(user, repo, prid) {
        var data = {
            object: {
                user: user,
                repo: repo
            },
            action: 'addissue'
        };
        getPullRequest(user, repo, prid, function(err, pull_request) {
            if(err) {
                return console.log('Error fetching pull request', err);
            }
            data.pull_request = pull_request;
            addEvent([prefix, user, repo, 'issue', 'add'], data);
        })
    }

};
