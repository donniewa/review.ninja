// module
var github = require('../services/github');
var url = require('../services/url');
var Keenio = require('../services/keenlogger');

module.exports = {

    /************************************************************************************************************

     @github

     + issues.create

     ************************************************************************************************************/

    add: function(req, done) {
        if(!req.args.sha) {
            return done({
                code: 400,
                text: 'sha must be set'
            }, null);
        }
        if(!req.args.user) {
            return done({
                code: 400,
                text: 'user must be set'
            }, null);
        }
        if(!req.args.repo) {
            return done({
                code: 400,
                text: 'repo must be set'
            }, null);
        }
        if(!req.args.title) {
            return done({
                code: 400,
                text: 'title must be set'
            }, null);
        }
        if(!req.args.number) {
            return done({
                code: 400,
                text: 'number must be set'
            }, null);
        }

        var fileReference = '`none`';
        var ninjaReference = '[' + '#' + req.args.number + ']' + '(' + url.reviewPullRequest(req.args.user, req.args.repo, req.args.number) + ')';

        if(req.args.reference) {
            var referenceUrl = url.githubFileReference(req.args.user, req.args.repo, req.args.reference);
            // req.args.reference is 'sha/path/to/file#Lline_number this line trims the sha
            fileReference = '[' + req.args.reference.replace(req.args.sha + '/', '') + ']' + '(' + referenceUrl + ')';
        }

        var body = req.args.body + '\r\n\r\n';
        body += '|commit|file reference|ReviewNinja|\r\n';
        body += '|------|--------------|-----------|\r\n';
        body += '|' + req.args.sha + '|' + fileReference + '|' + ninjaReference + '|';

        github.call({
            obj: 'issues',
            fun: 'create',
            arg: {
                user: req.args.user,
                repo: req.args.repo,
                body: body,
                title: req.args.title,
                labels: ['review.ninja', 'pull-request-' + req.args.number]
            },
            token: req.user.token
        }, function(err, res) {
            done(err, res);
            if(!err) {
                new Keenio().addIssue(req.args.user, req.args.repo, req.args.number);
            }
        });
    }
};
