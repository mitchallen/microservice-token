/**
    module: @mitchallen/microservice-core
    author: Mitch Allen
*/

/* Usage:
 *
 * var token = require( '@mitchallen/microservice-token' )( _secret );
 *
 * router.use( token );
 *
 * router.get('/heartbeat', function (req, res) { ... }
 *
 */

/*jslint es6 */

"use strict";

var jwt = require('jwt-simple');

module.exports = function (secret) {

    return function (req, res, next) {
        var emsg = "";
        if (!req) {
            emsg = "INTERNAL ERROR (getToken): req not defined.";
            return next(emsg);
        }
        if (req.headers['x-auth']) {
            try {
                if (secret) {
                    req.token = jwt.decode(req.headers['x-auth'], secret);
                } else {
                    emsg = "ERRNULLSECRET: secret is null, can't decode token";
                    return next(emsg);
                }
            } catch (ex) {
                // If secret doesn't match, will get error:
                //   [Error: Signature verification failed]
                // If a bad token string may return:
                //   [Error: Not enough or too many segments]
                // If slightly hacked token:
                //   [SyntaxError: Unexpected token]
                emsg = "ERROR: jwt.decode: " + ex;
                return next(emsg);
            }
        }
        next();
    };
};