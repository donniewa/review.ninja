// unit test
var assert = require('assert');
var sinon = require('sinon');

// config
global.config = require('../../../config');

// documents
var star = require('../../../server/services/star');
// webhooks
var issue_comment = require('../../../server/webhooks/issue_comment');

// services
var github = require('../../../server/services/github');

describe('issue_comment', function(done) {
    it('should add a ninja star on thumbsup or plus-one', function(done) {
        var req = {
            args: {
                payload: require('../../fixtures/webhooks/issue_comment/created.json'),
                config: {token: 'token'}
            }
        };

        var githubStub = sinon.stub(github, 'call', function(args, done) {
            assert.equal(args.obj, 'pullRequests');
            assert.equal(args.fun, 'get');
            assert.equal(args.arg.user, 'reviewninja');
            assert.equal(args.arg.repo, 'foo');
            assert.equal(args.arg.number, 43);
            assert.equal(args.token, 'token');
            done(null, {
                head: {
                    sha: 'sha'
                }
            });
        });

        var starStub = sinon.spy(star, 'create');

        issue_comment(req, {
            end: function() {
                sinon.assert.called(starStub);
                githubStub.restore();
                done();
            }
        });
    });
});
