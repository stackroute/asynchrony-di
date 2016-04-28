var Injector = function() {
  this.dependencyCache = {};
};

Injector.prototype.add = function(name, dependency) {
  var func = dependency.pop();
  var done = (function(err, resolve) {
    this.dependencyCache[name] = resolve;
  }).bind(this);
  return func(done);
};

Injector.prototype.invoke = function(dependencies) {
  var func = dependencies.pop();

  func(this.dependencyCache[dependencies[0]]);
};

module.exports = Injector;