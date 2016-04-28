var Injector = require('../src');
var should = require('should');

describe('Async Dependency Injection', function() {

  // FIXME: Implementation can assume that there is only one dependency.
  // FIXME: Implementation can assume that add is receiving a synchronous function.
  // FIXME: Implementation can assume that dependencies can be injected as soon as they have been added.
  it('Basic Scenario', function(done) {
    var injector = new Injector();

    var rand = (Math.random()*99387593793);

    injector.add('thing1', [function(done) {
      return done(null, rand);
    }]);

    injector.invoke(['thing1', function(thing1) {
      thing1.should.be.exactly(rand);
      done();
    }]);
  });
});