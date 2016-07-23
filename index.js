/**
    module: @mitchallen/microservice-core
    author: Mitch Allen
*/

/* Usage: 
 *
 * var token = require( '@mitchallen/microservice-token' )( _secret );
 * var rights = ...
 * 
 * app.use( token );
 *
 * router.get('/heartbeat', token, rights, function (req, res) { ... }
 * 
 */

/*jslint es6 */

var jwt = require('jwt-simple');

module.exports = function (secret) {

    return function (req, res, next) {
        var emsg = "";
        if (!req) {
            emsg = "INTERNAL ERROR (getToken): req not defined.";
            return next({ status: 500, message: emsg, type: 'internal' });
        }
        if (req.headers['x-auth']) {
            try {
                if (secret) {
                    req.token = jwt.decode(req.headers['x-auth'], secret);
                } else {
                    emsg = "ERROR: secret is null, can't decode token. See: .secret()";
                    return next({ status: 500, message: emsg, type: 'internal' });
                }
            } catch (ex) {
                // If secret doesn't match, will get error:
                //   [Error: Signature verification failed]
                // If a bad token string may return:
                //   [Error: Not enough or too many segments]
                // If slightly hacked token:
                //   [SyntaxError: Unexpected token]
                emsg = "ERROR: jwt.decode: " + ex;
                return next({ status: 500, message: emsg, type: 'internal' });
            }
        }
        next();
    };
};