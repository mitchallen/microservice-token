/**
    Module: @mitchallen/microservice-token
      Test: smoke-test
    Author: Mitch Allen
*/

"use strict";

var request = require('supertest'),
    should = require('should'),
    jwt = require('jwt-simple'),
    testName = require("../package").name,
    testVersion = require("../package").version,
    verbose = process.env.SERVICE_VERBOSE || false,
    testPort = process.env.TEST_SERVICE_PORT || 8100,
    testHost = "http://localhost:" + testPort;

describe('microservice token smoke test', function() {

    let coreModulePath = "@mitchallen/microservice-core";
    let prefix = "/test1";
    let path = "/heartbeat";
    let dataType = "heartbeat";
    let dataStatus = "OK";

    it('should get url with token', function(done) {

        let testUser = "Jack";
        let testRole = "admin";

        let testData = {
            user: testUser,
            role: testRole
        }

        let secret = "mySecret";

        let tokenHandler = require('../index')(secret);

        should.exist(tokenHandler);

        var options = {
            service: {
                name: testName,
                version: testVersion,
                verbose: verbose,
                port: testPort,
                apiVersion: "/test1",
                method: function (info) {
                    var router = info.router;
                    router.use(tokenHandler);
                    router.get('/heartbeat', function (req, res) {
                        should.exist(req.token);
                        // console.log(JSON.stringify(req.token));
                        should.exist(req.token.user);
                        should.exist(req.token.role);
                        req.token.user.should.eql(testUser);
                        req.token.role.should.eql(testRole);
                        var data = {
                            type: dataType,
                            status: dataStatus,
                        };
                        res.json(data);
                    });
                    return router;
                }
            }
        };
        
        // Needed for cleanup between tests
        delete require.cache[require.resolve(coreModulePath)];
        var retObj = require(coreModulePath)(options);
        should.exist(retObj);
        var server = retObj.server;
        should.exist(server);
        
        var testUrl =  prefix + path;
        request(testHost)
            .get(testUrl)
            .set('x-auth', jwt.encode( testData, secret))
            .set('Content-Type', 'application/json')
            .expect(200)
            .end(function (err, res){
                should.not.exist(err);
                should.exist(res.body);
                should.exist(res.body.type);
                res.body.type.should.eql(dataType);
                should.exist(res.body.status);
                res.body.status.should.eql(dataStatus);
                server.close(done);
            });
    });

    it('should return an error for a null secret', function(done) {

        let secret = "mySecret";

        // Pass in a null secret here to generate an error
        let tokenHandler = require('../index')(null);

        should.exist(tokenHandler);

        var options = {
            service: {
                name: testName,
                version: testVersion,
                verbose: verbose,
                port: testPort,
                apiVersion: "/test1",
                method: function (info) {
                    var router = info.router;
                    router.use(tokenHandler);
                    router.get('/heartbeat', function (req, res) {
                        var data = {
                            type: dataType,
                            status: dataStatus,
                        };
                        res.json(data);
                    });
                    return router;
                }
            }
        };
        
        // Needed for cleanup between tests
        delete require.cache[require.resolve(coreModulePath)];
        var retObj = require(coreModulePath)(options);
        should.exist(retObj);
        var server = retObj.server;
        should.exist(server);
        
        var testUrl =  prefix + path;
        request(testHost)
            .get(testUrl)
            .set('x-auth', jwt.encode( { username: "Mitch", role: "user" }, secret))
            .expect(500)
            .end(function (err, res){
                should.not.exist(err);
                should.exist(res.body);
                res.text.should.containEql('ERRNULLSECRET');
                server.close(done);
            });
    });

    it('should return an error if secret does not match', function(done) {

        let secret = "mySecret";
        let badSecret = "bogus";

        // Pass in a bad secret here to generate an error
        let tokenHandler = require('../index')(badSecret);

        should.exist(tokenHandler);

        var options = {
            service: {
                name: testName,
                version: testVersion,
                verbose: verbose,
                port: testPort,
                apiVersion: "/test1",
                method: function (info) {
                    var router = info.router;
                    router.use(tokenHandler);
                    router.get('/heartbeat', function (req, res) {
                        var data = {
                            type: dataType,
                            status: dataStatus,
                        };
                        res.json(data);
                    });
                    return router;
                }
            }
        };
        
        // Needed for cleanup between tests
        delete require.cache[require.resolve(coreModulePath)];
        var retObj = require(coreModulePath)(options);
        should.exist(retObj);
        var server = retObj.server;
        should.exist(server);
        
        var testUrl =  prefix + path;
        request(testHost)
            .get(testUrl)
            .set('x-auth', jwt.encode( { username: "Mitch", role: "user" }, secret))
            .expect(500)
            .end(function (err, res){
                should.not.exist(err);
                should.exist(res.body);
                res.text.should.containEql('Signature verification failed');
                server.close(done);
            });
    });

    it('should return an error if token is random string', function(done) {

        let secret = "mySecret";
        let badSecret = "bogus";

        // Pass in a bad secret here to generate an error
        let tokenHandler = require('../index')(badSecret);

        should.exist(tokenHandler);

        var options = {
            service: {
                name: testName,
                version: testVersion,
                verbose: verbose,
                port: testPort,
                apiVersion: "/test1",
                method: function (info) {
                    var router = info.router;
                    router.use(tokenHandler);
                    router.get('/heartbeat', function (req, res) {
                        var data = {
                            type: dataType,
                            status: dataStatus,
                        };
                        res.json(data);
                    });
                    return router;
                }
            }
        };
        
        // Needed for cleanup between tests
        delete require.cache[require.resolve(coreModulePath)];
        var retObj = require(coreModulePath)(options);
        should.exist(retObj);
        var server = retObj.server;
        should.exist(server);
        
        var testUrl =  prefix + path;
        request(testHost)
            .get(testUrl)
            .set('x-auth', 'BAD-TOKEN-STRING')
            .expect(500)
            .end(function (err, res){
                should.not.exist(err);
                should.exist(res.body);
                res.text.should.containEql('Not enough or too many segments');
                server.close(done);
            });
    });

});