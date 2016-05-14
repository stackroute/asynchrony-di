var q = require('q');

var Asynchrony = function() {
  this.dependencies = {};
  this.dependencyPromises = {};
};

Asynchrony.prototype.add = function(name, dependency) {
  this.dependencies[name] = dependency;
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


exports = module.exports = Asynchrony;