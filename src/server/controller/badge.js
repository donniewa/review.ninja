var express = require('express'),
    ejs = require('ejs'),
    fs = require('fs'),
    crypto = require('crypto');

//////////////////////////////////////////////////////////////////////////////////////////////
// Badge controller
//////////////////////////////////////////////////////////////////////////////////////////////

var router = express.Router();
var github = require('../services/github');
var Star = require('mongoose').model('Star');

router.all('/:repoId/pull/:number/badge', function(req, res) {
    github.call({
        obj: 'repos',
        fun: 'one',
        arg: {
            id: req.params.repoId
        }
    }, function(err, githubRepo) {
        if(err) {
            return res.send(err);
        }

        github.call({
            obj: 'issues',
            fun: 'repoIssues',
            arg: {
                user: githubRepo.owner.login,
                repo: githubRepo.name,
                labels: 'pull-request-' + req.params.number,
                state: 'open'
            }
        }, function(err, issues) {
            if(err) {
                return res.send(err);
            }

            github.call({
                obj: 'pullRequests',
                fun: 'get',
                arg: {
                    user: githubRepo.owner.login,
                    repo: githubRepo.name,
                    number: req.params.number
                }
            }, function(err, githubPullRequest) {
                Star.find({sha: githubPullRequest.head.sha, repo: githubRepo.id}, function(err, stars) {
                    if(err) {
                        return res.send(err);
                    }

                    var issuesLengthHash = crypto.createHash('md5').update(issues.length.toString(), 'utf8').digest('hex');
                    var starsLengthHash = crypto.createHash('md5').update(stars.length.toString(), 'utf8').digest('hex');
                    var hash = crypto.createHash('md5').update(issuesLengthHash + starsLengthHash, 'utf8').digest('hex');

                    if(req.get('If-None-Match') === hash) {
                        return res.status(304).send();
                    }
                    
                    res.set('Content-Type', 'image/svg+xml');
                    res.set('Cache-Control', 'no-cache');
                    res.set('Etag', hash);

                    var tmp = fs.readFileSync("src/server/templates/badge.svg", 'utf-8');
                    var svg = ejs.render(tmp, {openIssues: issues.length, stars: stars.length});
                    res.send(svg);
                });
            });
        });
    });
});

module.exports = router;
