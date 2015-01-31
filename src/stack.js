/**
 * Stack Class
 *
 * - manages a set of middlewares
 *
 * @param {Function} errorHandler
 */

var _ = require('underscore');
var async = require('async');

var Stack = function(errorHandler){
  this.middlewares = [];
  this.errorHandler = errorHandler;
};

Stack.prototype.use = function(middleware) {
  middleware.stack = this;
  this.middlewares.push(middleware);
};

Stack.prototype.handle = function(client) {
  var self = this;
  _.each(this.middlewares, function(m){
    if(m.install) {
      m.install(client);
    }
  });

  client.on('data', function(packet){
    self.runStack(client, packet);
  });
};

Stack.prototype.runStack = function(client, packet) {
  var self = this;
  var l = this.middlewares.length;
  var i = -1;
  function next(err) {
    if(err) {
      return self.errorHandler(err, client, packet);
    } else {
      i++;
      if(i < l) {
        if(self.middlewares[i].handle) {
          return self.middlewares[i].handle(client, packet, next);
        } else {
          return next();
        }
      }
    }
  }
  next();
};

Stack.prototype.execute = function(fn, data, store, callback){
  if(typeof store === 'function') {
    callback = store;
    store = null;
  }

  var tasks = [];

  _.each(this.middlewares, function(m){
    if(m[fn]) {
      tasks.push(function(cb){
        if(store) {
          m[fn](data, store, cb);
        } else {
          m[fn](data, cb);
        }
      });
    }
  });

  async.parallel(tasks, callback);
};

module.exports = Stack;
