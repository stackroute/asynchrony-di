var Injector = require('../src');
var should = require('should');

describe('Async Dependency Injection', function() {
  it('Basic Scenario', function(done) {
    var injector = new Injector();

    var rand = (Math.random()*99387593793);
    var count = 0;

    injector.add('thing1', [function(done) {
      setTimeout(function() {
        count++;
        return done(null, rand);
      },1000);
    }]);

    count.should.be.exactly(0);

    injector.invoke(['thing1', function(thing1) {
      count.should.be.exactly(1);
      thing1.should.be.exactly(rand);
      done();
    }]);
  });

  // TODO: Implementation can assume that there is only one dependency.
  it('Multiple Dependencies Invocation', function(done) {
    var injector = new Injector();

    var rand1 = (Math.random()*958728493827);
    var rand2 = (Math.random()*958728493827);
    var count1 = 0;
    var count2 = 0;

    injector.add('thing1', [function(done) {
      setTimeout(function() {
        count1++;
        return done(null, rand1);
      }, 1000);
    }]);

    injector.add('thing2', [function(done) {
      setTimeout(function() {
        count2++;
        return done(null, rand2);
      });
    }]);

    count1.should.be.exactly(0);
    count2.should.be.exactly(0);

    injector.invoke(['thing1', 'thing2', function(t1, t2) {
      t1.should.be.exactly(rand1);
      t2.should.be.exactly(rand2);
      count1.should.be.exactly(1);
      count2.should.be.exactly(1);
      done();
    }]);
  });

  it('Nested Dependency Invocation', function(done) {
    var injector = new Injector();

    var rand1 = Math.random() * 1837953092;
    var rand2 = Math.random() * 5849382729;

    var count1 = 0;
    var count2 = 0;

    injector.add('thing1', [function(done) {
      setTimeout(function() {
        count1++;
        return done(null, rand1);
      }, 300);
    }]);

    injector.add('thing2', ['thing1', function(t1, done) {
      setTimeout(function() {
        count2++;
        return done(null, t1+rand2);
      },1000);
    }]);

    count1.should.be.exactly(0);
    count2.should.be.exactly(0);

    injector.invoke(['thing2', function(t1) {
      t1.should.be.exactly(rand1 + rand2);
      count1.should.be.exactly(1);
      count2.should.be.exactly(1);
      done();
    }]);
  });

  it('Nested Multiple Dependencies Invocation', function(done) {
    var injector = new Injector();

    var rand1 = Math.random() * 1837953092;
    var rand2 = Math.random() * 5849382729;

    var count1 = 0;
    var count2 = 0;

    injector.add('thing1', [function(done) {
      setTimeout(function() {
        count1++;
        return done(null, rand1);
      }, 300);
    }]);

    injector.add('thing2', ['thing1', function(t1, done) {
      setTimeout(function() {
        count2++;
        return done(null, t1+rand2);
      },1000);
    }]);

    count1.should.be.exactly(0);
    count2.should.be.exactly(0);

    injector.invoke(['thing2', 'thing1', function(t1,t2) {
      t1.should.be.exactly(rand1 + rand2);
      t2.should.be.exactly(rand1);
      count1.should.be.exactly(1);
      count2.should.be.exactly(1);
      done();
    }]);
  });

  it('Extra Nested Multiple Dependencies', function(done) {
    var injector = new Injector();

    var rand1 = Math.random() * 1837953092;
    var rand2 = Math.random() * 5849382729;
    var rand3 = Math.random() * 5838308403;

    var count1 = 0;
    var count2 = 0;
    var count3 = 0;

    injector.add('thing1', [function(done) {
      setTimeout(function() {
        count1++;
        return done(null, rand1);
      }, 300);
    }]);

    injector.add('thing2', ['thing1', function(t1, done) {
      setTimeout(function() {
        count2++;
        return done(null, t1+rand2);
      },400);
    }]);

    injector.add('thing3', ['thing1', 'thing2', function(t1,t2, done) {
      setTimeout(function() {
        count3++;
        return done(null, t1+t2+rand3);
      }, 100);
    }]);

    count1.should.be.exactly(0);
    count2.should.be.exactly(0);
    count3.should.be.exactly(0);

    injector.invoke(['thing3', 'thing2', 'thing1', function(t3,t2,t1) {
      t1.should.be.exactly(rand1);
      t2.should.be.exactly(rand1+rand2);
      t3.should.be.exactly(2*rand1+rand2+rand3);
      count1.should.be.exactly(1);
      count2.should.be.exactly(1);
      count3.should.be.exactly(1);
      done();
    }]);
  });

  it('Remaining Task Execution Test', function(done) {
    var injector = new Injector();

    var rand1 = (Math.random()*99387593793);
    var rand2 = (Math.random()*67674367647);
    var rand3 = (Math.random()*19928738278);
    var count1 = 0;
    var count2 = 0;
    var count3 = 0;

    injector.add('thing1', [function(done) {
      setTimeout(function() {
        count1++;
        return done(null, rand1);
      },200);
    }]);
    injector.add('thing2', [function(done) {
      setTimeout(function() {
        count2++;
        return done(null, rand2);
      },300);
    }]);
    injector.add('thing3', [function(done) {
      setTimeout(function() {
        count3++;
        return done(null, rand3);
      },100);
    }]);
    count1.should.be.exactly(0);
    count2.should.be.exactly(0);
    count3.should.be.exactly(0);
    injector.invoke(['thing1', function(thing1) {
      count1.should.be.exactly(1);
      count2.should.be.exactly(0);
      count3.should.be.exactly(0);
      thing1.should.be.exactly(rand1);
      done();
    }]);
    count2.should.be.exactly(0);
    count3.should.be.exactly(0);
    injector.invokeReamainingTask(function(err,data){
      //data is an object(key:value) which has Remaining dependency value. Key is the name of the dependency and value which will be equal to returned value of the invoked dependency.
      data['thing2'].should.be.exactly(rand2);
      data['thing3'].should.be.exactly(rand3);
      count1.should.be.exactly(1);
      count2.should.be.exactly(1);
      count3.should.be.exactly(1);
      done();
    });
  });
});
