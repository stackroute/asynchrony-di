var q = require('q');

var Asynchrony = function() {
  this.dependencies = {};
  this.dependencyPromises = {};
};

Asynchrony.prototype.add = function(name, dependency) {
  this.dependencies[name] = dependency;
  this.detectCyclicDependencies(name,[],[]);
};

Asynchrony.prototype.invoke = function(dependencies) {
  var func = dependencies.pop();
  var promises = dependencies.map((function(name) {
    return this.getValueOfDependency(name);
  }).bind(this));

  return q.spread(promises, func);
};

Asynchrony.prototype.getValueOfDependency = function(name) {
  // If promise is not created, create promise.
  if(!this.dependencyPromises.hasOwnProperty(name)) {
    this.dependencyPromises[name] = this.createPromiseForDependency(name);
  }

  // Grab value from promise.
  var deferred = q.defer();
  this.dependencyPromises[name].then(deferred.resolve);

  return deferred.promise;
};

Asynchrony.prototype.createPromiseForDependency = function(name) {

  var dependencies = this.dependencies[name];
  var func = dependencies.pop();

  var deferred = q.defer();
  var done = (function(err, resolve) {
    if(err) { /* TODO: Handle Error */ return;}
    return deferred.resolve(resolve);
  }).bind(this);

  if(dependencies.length === 0) {
    func(done);

    return deferred.promise;
  }

  var promises = dependencies.map((function(name) {
    return this.getValueOfDependency(name);
  }).bind(this));

  q.spread(promises, function() {
    var args = Array.from(arguments);
    args.push(done);
    func.apply(null, args);
  });

  return deferred.promise;
};
Asynchrony.prototype.invokeRemainingTask = function (done) {
  var dependencies=[];
  for (name in this.dependencies){
    if(!this.dependencyPromises.hasOwnProperty(name)){
      dependencies.push(name);
    }
  }
  var promises = dependencies.map((function(name) {
    return this.getValueOfDependency(name);
  }).bind(this));
  return q.spread(promises,function () {
    var values=Array.from(arguments);
    var count=0;
    remainingDependenciesValue={};
    dependencies.forEach(function (name) {
      remainingDependenciesValue[name]=values[count++];
    });
    done.apply(this,[null,remainingDependenciesValue]);
  });
};
Asynchrony.prototype.detectCyclicDependencies = function (name,resolved,unresolved) {
  unresolved.push(name);
  var dependencies=[];
  var depArray=this.dependencies[name]===undefined?[]:this.dependencies[name];
  for (var i = 0; i < depArray.length-1; i++) {
    dependencies.push(depArray[i]);
  }
  dependencies.forEach((function(edge){
    if (!(resolved.indexOf(edge) > -1)){
      if(unresolved.indexOf(edge) > -1){
        throw(new Error('Whoops! there is a circular dependency aborting !!!'));
      }
      this.detectCyclicDependencies(edge,resolved,unresolved)
    }
  }).bind(this));
  resolved.push(name);
  var index = unresolved.indexOf(name);
  unresolved.splice(index, 1);
};
module.exports = Asynchrony;
