var Asynchrony = require('../src');
var should = require('should');

describe('Async Dependency Injection', function() {
  it('Basic Scenario', function(done) {
    var asynchrony = new Asynchrony();

    var rand = (Math.random()*99387593793);
    var count = 0;

    asynchrony.add('thing1', [function(done) {
      setTimeout(function() {
        count++;
        return done(null, rand);
      },1000);
    }]);

    count.should.be.exactly(0);

    asynchrony.invoke(['thing1', function(thing1) {
      count.should.be.exactly(1);
      thing1.should.be.exactly(rand);
      done();
    }]);
  });
  it('Multiple Dependencies Invocation', function(done) {
    var asynchrony = new Asynchrony();

    var rand1 = (Math.random()*958728493827);
    var rand2 = (Math.random()*958728493827);
    var count1 = 0;
    var count2 = 0;

    asynchrony.add('thing1', [function(done) {
      setTimeout(function() {
        count1++;
        return done(null, rand1);
      }, 1000);
    }]);

    asynchrony.add('thing2', [function(done) {
      setTimeout(function() {
        count2++;
        return done(null, rand2);
      });
    }]);

    count1.should.be.exactly(0);
    count2.should.be.exactly(0);

    asynchrony.invoke(['thing1', 'thing2', function(t1, t2) {
      t1.should.be.exactly(rand1);
      t2.should.be.exactly(rand2);
      count1.should.be.exactly(1);
      count2.should.be.exactly(1);
      done();
    }]);
  });

  it('Nested Dependency Invocation', function(done) {
    var asynchrony = new Asynchrony();

    var rand1 = Math.random() * 1837953092;
    var rand2 = Math.random() * 5849382729;

    var count1 = 0;
    var count2 = 0;

    asynchrony.add('thing1', [function(done) {
      setTimeout(function() {
        count1++;
        return done(null, rand1);
      }, 300);
    }]);

    asynchrony.add('thing2', ['thing1', function(t1, done) {
      setTimeout(function() {
        count2++;
        return done(null, t1+rand2);
      },1000);
    }]);

    count1.should.be.exactly(0);
    count2.should.be.exactly(0);

    asynchrony.invoke(['thing2', function(t1) {
      t1.should.be.exactly(rand1 + rand2);
      count1.should.be.exactly(1);
      count2.should.be.exactly(1);
      done();
    }]);
  });

  it('Nested Multiple Dependencies Invocation', function(done) {
    var asynchrony = new Asynchrony();

    var rand1 = Math.random() * 1837953092;
    var rand2 = Math.random() * 5849382729;

    var count1 = 0;
    var count2 = 0;

    asynchrony.add('thing1', [function(done) {
      setTimeout(function() {
        count1++;
        return done(null, rand1);
      }, 300);
    }]);

    asynchrony.add('thing2', ['thing1', function(t1, done) {
      setTimeout(function() {
        count2++;
        return done(null, t1+rand2);
      },1000);
    }]);

    count1.should.be.exactly(0);
    count2.should.be.exactly(0);

    asynchrony.invoke(['thing2', 'thing1', function(t1,t2) {
      t1.should.be.exactly(rand1 + rand2);
      t2.should.be.exactly(rand1);
      count1.should.be.exactly(1);
      count2.should.be.exactly(1);
      done();
    }]);
  });

  it('Remaining Task Execution Test', function(done) {
    var asynchrony = new Asynchrony();

    var rand1 = (Math.random()*99387593793);
    var rand2 = (Math.random()*67674367647);
    var rand3 = (Math.random()*19928738278);
    var count1 = 0;
    var count2 = 0;
    var count3 = 0;

    asynchrony.add('thing1', [function(done) {
      setTimeout(function() {
        count1++;
        return done(null, rand1);
      },200);
    }]);
    asynchrony.add('thing2', [function(done) {
      setTimeout(function() {
        count2++;
        return done(null, rand2);
      },300);
    }]);
    asynchrony.add('thing3', [function(done) {
      setTimeout(function() {
        count3++;
        return done(null, rand3);
      },100);
    }]);
    count1.should.be.exactly(0);
    count2.should.be.exactly(0);
    count3.should.be.exactly(0);
    asynchrony.invoke(['thing1', function(thing1) {
      count1.should.be.exactly(1);
      count2.should.be.exactly(0);
      count3.should.be.exactly(0);
      thing1.should.be.exactly(rand1);
      asynchrony.invokeRemainingTask(function(err,data){
        //data is an object(key:value) which has Remaining dependency value. Key is the name of the dependency and value which will be equal to returned value of the invoked dependency.
        data['thing2'].should.be.exactly(rand2);
        data['thing3'].should.be.exactly(rand3);
        count1.should.be.exactly(1);
        count2.should.be.exactly(1);
        count3.should.be.exactly(1);
        done();
      });
    }]);
  });
});
