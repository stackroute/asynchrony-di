## Synopsis

An unopinionated asynchronous Dependency Injector and Orchestrator.

## The need for another Dependency Injection Framework

Asynchrony DI was created at [StackRoute](http://stackroute.in) ([Github](https://github.com/stackroute)) to solve the problem of asynchronous dependency injection and orchestration of extensible counters in it's Quiz Framework, for awarding badges to quiz players in real-time. For instance, when the player wins his 10th quiz in a streak, we could award him a "Super Streak" badge. The challenges were as follows:

1. Counters ("Winning Streak") and badges ("Super Streak"), are extensible. This means, new counters and badges could be added to the platform, and counters that have to be evaluated for any given event may increase.
1. Counters need to be evaluated only once. A cached value needs to be returned when it is depended upon subsequently.
1. To award the badges to the player in real-time, they need to be evaluated with the highest priority, which in turn require that their dependent counters be evaluated. This requires an IOC / DI framework.
1. Counter values are stored in a shared In-Memory store, which can be retrieved with an async call.

As such, we first evaluated [wagner-core](https://www.npmjs.com/package/wagner-core), [orchestrator](https://www.npmjs.com/package/orchestrator), and Angular's [di](https://github.com/angular/di.js/). Wagner and Angular's di are designed to bootstrap functions as dependencies, which are called during runtime in a synchronous fashion. This would not allow for returning and caching of asynchronous data. Wagner's synchronous approach would not let us retrieve counter values from an external data store. It's asynchronous dependencies, on the other hand, does not cache responses for re-use. Orchestrator is good at orchestrating and running dependencies in the right order, but lacks the ability to inject asynchronous cached values. Hence, we created Asynchrony-DI package, which would cache values retrieved in an asynchronous manner, and also orchestrate dependency execution.

## Code Example

### Installation
use npm to install the asynchrony-di module.
```shell
npm install asynchrony-di --save
```

### Get a reference:
```javascript
var Asynchrony = require('asynchrony-di');
var asynchrony = new Asynchrony();
```
### Load it up with stuff to retrieve:
```javascript
asynchrony.add('thing1',[function(done){
  setTimeout(function() {
    done(null, 'foo')
  });
}]);

asynchrony.add('thing2', [function(done){
  setTimeout(function() {
    done(null, 'bar');
  });
}]);
```
These dependencies are not evaluated until depended upon.

### Run the tasks:
```javascript
asynchrony.invoke(['thing1', 'thing2', function (t1, t2) {
  console.log(t1); // prints foo;
  console.log(t2); // prints bar;
}]);
```


## API Reference

### Add a task
```javascript
asynchrony.add(name,[deps,fn]);
```
#### Parameter	Type	Description
name
: String	The name of the task.  

deps
: Task names to be executed before running the given task, it is optional.  

fn
: Function	The actual function that gets executed when the given task is invoked.  
_Note:_ Take in a callback (done) for Async tasks  

#### Example:
```javascript
async_di.add('FirstName',[function(done){
    return done(null,'foo');
  }]);
async_di.add('SecondName',[function(done){
  return done(null,'bar')
}]);
async_di.add('FullName', ['FirstName','LastName', function(firstName, lastName, done) {
  //Form full name from the dependency values
    return done(null,firstName+" "+lastName);
}]);
```
### Invoke
```
asynchrony.invoke(names[, fn(,value)]);
```

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

#### Example
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

### Invoke Remaining Dependencies
asynchrony.invokeRemainingTask (fn);

Execute tasks which weren’t explicitly invoked
```javascript
asynchrony.invokeRemainingTask (function(){
  // do something after all the remaining tasks are completed
});
```

#### Parameter	Type	Description
fn Function - The callback function which will be executed after all the remaining tasks are complete.  

#### Example
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
## License
MIT
