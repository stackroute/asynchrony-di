var q = require('q');

var Injector = function() {
  this.dependencies = {};
  this.dependencyPromises = {};
};

Injector.prototype.add = function(name, dependency) {
  return this.dependencies[name] = dependency;
};

Injector.prototype.invoke = function(dependencies) {
  var func = dependencies.pop();
  var promises = dependencies.map((function(name) {
    return this.getValueOfDependency(name);
  }).bind(this));

  return q.spread(promises, func);
};

Injector.prototype.getValueOfDependency = function(name) {
  // If promise is not created, create promise.
  if(!this.dependencyPromises.hasOwnProperty(name)) {
    this.dependencyPromises[name] = this.createPromiseForDependency(name);
  }

  // Grab value from promise.
  var deferred = q.defer();
  this.dependencyPromises[name].then(deferred.resolve);

  return deferred.promise;
};

Injector.prototype.createPromiseForDependency = function(name) {

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

module.exports = Injector;