//services
var github = require('../services/github');
var star = require('../services/star');

//////////////////////////////////////////////////////////////////////////////////////////////
// Github Issue comment Webhook Handler
//////////////////////////////////////////////////////////////////////////////////////////////

module.exports = function(req, res) {

    var action = req.args.payload.action;
    var user = req.args.payload.repository.owner.login;
    var repo = req.args.payload.repository.name;
    var number = req.args.payload.issue.number;
    var sender = req.args.payload.sender;
    var comment = req.args.payload.comment.body;
    var repo_uuid = req.args.payload.repository.id;
    var token = req.args.config.token;

    var actions = {
        created: function() {

            //
            // Add ninja star if comment is +1 or thumbs up (:+1:)
            //

            if(comment.match(/(\+1)|(:\+1:)/)) {
                github.call({
                    obj: 'pullRequests',
                    fun: 'get',
                    arg: {
                        user: user,
                        repo: repo,
                        number: number
                    },
                    token: token
                }, function(err, pull) {
                    if(!err) {
                        star.create(pull.head.sha, user, repo, repo_uuid, number, sender, token);
                    }
                });
            }
        }
    };

    if (actions[action]) {
        actions[action]();
    }

    res.end();
};
