// models
var User = require('mongoose').model('User');

//services
var url = require('../services/url');
var status = require('../services/status');
var milestone = require('../services/milestone');
var pullRequest = require('../services/pullRequest');
var notification = require('../services/notification');

//////////////////////////////////////////////////////////////////////////////////////////////
// Github Pull Request Webhook Handler
//////////////////////////////////////////////////////////////////////////////////////////////

module.exports = function(req, res) {

    var action = req.args.payload.action;
    var user = req.args.payload.repository.owner.login;
    var repo = req.args.payload.repository.name;
    var number = req.args.payload.number;
    var sender = req.args.payload.sender;
    var repo_uuid = req.args.payload.repository.id;
    var sha = req.args.payload.pull_request.head.sha;
    var token = req.args.config.token;

    var notification_args = {
        user: user,
        repo: repo,
        number: number,
        sender: sender,
        url: url.reviewPullRequest(user, repo, number)
    };

    var actions = {
        opened: function() {
            status.update({
                sha: sha,
                user: user,
                repo: repo,
                number: number,
                repo_uuid: repo_uuid,
                token: token
            });

            notification.sendmail('pull_request_opened', user, repo, repo_uuid, token, number, {
                user: user,
                repo: repo,
                number: number,
                sender: sender,
                url: url.reviewPullRequest(user, repo, number)
            });

            pullRequest.badgeComment(user, repo, repo_uuid, number);
        },
        synchronize: function() {
            status.update({
                sha: sha,
                user: user,
                repo: repo,
                number: number,
                repo_uuid: repo_uuid,
                token: token
            });

            notification.sendmail('pull_request_synchronized', user, repo, repo_uuid, token, number, {
                user: user,
                repo: repo,
                number: number,
                sender: sender,
                url: url.reviewPullRequest(user, repo, number)
            });

        },
        closed: function() {
            milestone.close(user, repo, repo_uuid, number, token);
        },
        reopened: function() {
            // a pull request you have reviewed has a been reopened
            // send messages to responsible users?
        }
    };

    if (actions[action]) {
        actions[action]();
    }

    res.end();
};
