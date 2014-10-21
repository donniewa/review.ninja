var Keen = require('keen.io');
var github = require('../services/github');

module.exports = function(client) {
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

    function logevent(user, repo, prid, object, action) {
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
            addEvent([prefix, user, repo, object, action], data);
        });
    }

    this.setStar = function(user, repo, prid) {
        logevent(user, repo, prid, 'star', 'add');
    };

    this.removeStar = function(user, repo, prid) {
        logevent(user, repo, prid, 'star', 'remove');
    };

    this.addIssue = function(user, repo, prid) {
        logevent(user, repo, prid, 'issue', 'add');
    };

    this.closeIssue = function(user, repo, prid) {
        logevent(user, repo, prid, 'issue', 'close');
    };

    this.createPullrequest = function(user, repo, prid) {
        logevent(user, repo, prid, 'pull_request', 'create');
    };

    this.reopenPullrequest = function(user, repo, prid) {
        logevent(user, repo, prid, 'pull_request', 'reopen');
    };

    this.closePullrequest = function(user, repo, prid) {
        logevent(user, repo, prid, 'pull_request', 'close');
    };
};
