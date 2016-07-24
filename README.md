@ mitchallen / microservice-token
==============================

A microservice module for tokens
----------------------------------------------------
Middleware for [ExpressJS](http://expressjs.com) that decodes an __x-auth__ header and attaches the result to the request as a token.

This module works in association with other modules based on the [@mitchallen/microservice-core](https://www.npmjs.com/package/@mitchallen/microservice-core) module. For a background on the core and microservices, visit the core npm page.

* * * 

## Disclaimer

__The author makes no claims that this system is secure. Use at your own risk.__

* * *

## Installation

You must use __npm__ __2.7.0__ or higher because of the scoped package name.

    $ npm init
    $ npm install @mitchallen/microservice-token --save
  
* * *

## Usage

Make a Web request setting the __x-auth__ header to an encrypted string using __jwt-simple__. 

	var jwt = require('jwt-simple'),
	    secret = process.env.SECRET;

	var testData = {"user":"Jack","role":"admin"};

	setHeader('x-auth', jwt.encode( testData, secret));
	
Then inside your route handler, retrieve the decoded token. You must set __route.use__ to the middleware first. Then it can decode the encrypted __x-auth__ header.

    var secret = process.env.SECRET;
    
    var tokenWare = require( '@mitchallen/microservice-token' )( secret );

    router.use( tokenWare );
    
    router.get('/heartbeat', function (req, res) { 
        var token = req.token;
        if( token.role ... ) { ... }
    }
    
See the test cases for more examples.
    
* * *

## Login Scenario

If you want to build a login service, I strongly suggest that you check out options like [Amazon Cognito](https://aws.amazon.com/cognito/).  But if you are building something simple, internal or just want to roll your own, here is one idea. __Again, use at our own risk.__

1. User logs in
2. An encrypted token is returned by the login service containing things like the user name and role
3. The token is passed along in the __x-auth__ header to all other requests while the user is logged in
4. Thanks to the middleware, every route handler receives the decoded values contained in __req.token__
5. The route handler can then review the token to determine if the requester contains sufficient access rights 
6. If the users role does not have sufficient rights, then an unauthorized response (__401__) can be generated
7. When the user logs out, the token can be cleared
8. The lack of a token can be used as an indicator that the user is not logged in

## Protect Your Secret

In production, never, ever, ever hard-code your __secret__ string. Always get it from the environment. Be careful about storing it in shell scripts too.

## Testing

To test, go to the root folder and type (sans __$__):

    $ npm test
   
* * *
 
## Repo(s)

* [bitbucket.org/mitchallen/microservice-token.git](https://bitbucket.org/mitchallen/microservice-token.git)

* * *

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

* * *

## Version History

#### Version 0.1.0 release notes

* initial release
