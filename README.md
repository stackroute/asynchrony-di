## Synopsis

asynchrony-di is a lightweight simplistic library for performing asynchronous dependency injection for optimized injection and orchestration of interdependent tasks.
It provides DI similar to AngularJS 1.x's dependency injector

## Code Example

### Get a reference:
  ```javascript
      var Asynchrony = require('asynchrony-di');
      var asynchrony = new Asynchrony();
  ```
### Load it up with stuff to do:
  ```javascript
      asynchrony.add('thing1',[function(done){
          // do stuff
      }]);

      asynchrony.add('thing2', [function(done){
          // do stuff
      }]);
  ```
### Run the tasks:
  ```javascript
      asynchrony.invoke(['thing1', 'thing2', function (t1, t2) {
          // do stuff
        }]);
  ```
## Motivation

We have created this framework for the  user badges manipulation in our project. with help of this asynchronous framework, we have achieved our goal. This framework has been published as npm module and this is in development phase.

## Installation
use npm to install the asynchrony-di module.
> npm install asynchrony-di --save

## API Reference

### Add a task
  asynchrony.add(name,[deps,fn]);
####Parameter	Type	Description
  name - String	The name of the task.  
  deps - task names to be executed before running the given task, it is optional.  
  fn- Function	The actual function that gets executed when the given task is invoked.  
  Note:  Take in a callback (done) for Async tasks  

####Example:
```javascript
    async_di.add('FirstName',[function(done){
        return done(null,'Wipro');
      }]);
    async_di.add('SecondName',[function(done){
      return done(null,'Digital')
    }]);
    async_di.add('FullName', ['FirstName','LastName', function(firstName, lastName, done) {
      //Form full name from the dependency values
        return done(null,firstName+" "+lastName);
    }]);
```
### Invoke
    asynchrony.invoke(names[, fn(,value)]);

#### Execute a task
  ```javascript
  asynchrony.invoke(['thing1', function(t1){
  // do stuff
  }]);
  ```
##### Parameter	Type	Description
names - String	The names of the tasks to be invoked  
fn - Function	The callback function which will be executed after all the mentioned tasks are complete.  
value - Object	Possess the return values from the invoked tasks  

####Example
```javascript
    asynchrony.add('FullName', ['FirstName','LastName', function(firstName, lastName, done) {
      //Form full name from the dependency values
        return done(null,firstName+lastName);
    }]);

    asynchrony.invoke([‘FullName’, function(fullName){
      //Perform something after getting full name
      console.log(fullName);
    }]);
```

###Invoke Remaining
  asynchrony.invokeRemainingTask (fn);

  Execute tasks which weren’t explicitly invoked
  ```javascript
  asynchrony.invokeRemainingTask (function(){
    // do something after all the remaining tasks are completed
  });
  ```
####Parameter	Type	Description
fn Function - The callback function which will be executed after all the remaining tasks are complete.  

####Example
```javascript
    asynchrony.add('FirstName',[function(done){
      // return done(null,firstName);
    }]);
    asynchrony.add('SecondName',[function(done){
      // return done(null,secondName)
    }]);
    asynchrony.invoke( [‘FirstName’, function(firstName) {
      //do something with firstname
    }]);
    asynchrony.invokeRemainingTask(function(){
      //do something after lastname is also executed
    });
```
## Tests
### Asynchronous dependency injection test
```javascript
var Asynchrony = require('asynchrony-di');
var should = require('should');
describe('Async Dependency Injection', function() {
  it('Basic Scenario for async test', function(done) {
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
});
```
### Multiple Dependencies Invocation
```javascript
var Asynchrony = require('asynchrony-di');
var should = require('should');
describe('Async Dependency Injection', function() {
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
});
```
### Nested Dependency Invocation

```javascript
var Asynchrony = require('asynchrony-di');
var should = require('should');
describe('Async Dependency Injection', function() {
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
});
```
### Extra Nested Multiple Dependencies
```javascript
var Asynchrony = require('asynchrony-di');
var should = require('should');
describe('Async Dependency Injection', function() {
  it('Extra Nested Multiple Dependencies', function(done) {
    var asynchrony = new Asynchrony();

    var rand1 = Math.random() * 1837953092;
    var rand2 = Math.random() * 5849382729;
    var rand3 = Math.random() * 5838308403;

    var count1 = 0;
    var count2 = 0;
    var count3 = 0;

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
      },400);
    }]);

    asynchrony.add('thing3', ['thing1', 'thing2', function(t1,t2, done) {
      setTimeout(function() {
        count3++;
        return done(null, t1+t2+rand3);
      }, 100);
    }]);

    count1.should.be.exactly(0);
    count2.should.be.exactly(0);
    count3.should.be.exactly(0);

    asynchrony.invoke(['thing3', 'thing2', 'thing1', function(t3,t2,t1) {
      t1.should.be.exactly(rand1);
      t2.should.be.exactly(rand1+rand2);
      t3.should.be.exactly(2*rand1+rand2+rand3);
      count1.should.be.exactly(1);
      count2.should.be.exactly(1);
      count3.should.be.exactly(1);
      done();
    }]);
  });
});
```
### Remaining Task Execution
```javascript
var Asynchrony = require('asynchrony-di');
var should = require('should');
describe('Async Dependency Injection', function() {
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
```
###Cyclic dependency Scenario
Note - If the cycle will be detected, it will throw the error.
```javascript
var Asynchrony = require('asynchrony-di');
var should = require('should');
describe('Async Dependency Injection', function() {

  it('Cyclic dependency Scenario', function(done) {
    var asynchrony = new Asynchrony();

    var rand1 = (Math.random()*99387593793);
    var rand2 = (Math.random()*76876767677);
    var count1 = 0;

    asynchrony.add('thing1', ['thing2',function(t2,done) {
      setTimeout(function() {
        count1++;
        return done(null, t2+rand1);
      },1000);
    }]);

    asynchrony.add('thing2', ['thing1',function(t1,done) {
      setTimeout(function() {
        count2++;
        return done(null, t1+rand2);
      },1000);
    }]);
    asynchrony.invoke(['thing1',function(t1) {
      t1.should.be.exactly(rand1+rand2);
      done();
    }]);
  });
});
```
## License
MIT
