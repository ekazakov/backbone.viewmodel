var tests = [];
var expect;
var regexp = /tests\/specs/;

for (var file in window.__karma__.files) {
    if ( regexp.test(file) ) { tests.push(file); }
}

requirejs.config({
    // Karma serves files from "/base"
    baseUrl: "/base/src/",

    paths: {
        "jquery":     "components/jquery/dist/jquery",
        "underscore": "components/underscore/underscore",
        "backbone":   "components/backbone/backbone",
        "chai":       "components/chai/chai",
        "sinon-chai": "components/sinon-chai/lib/sinon-chai",
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: testRun
});

function testRun () {
    require( ["chai", "sinon-chai"], function() {
        var chai      = require("chai");
        var sinonChai = require("sinon-chai");
        expect = chai.expect;
        chai.should();

        chai.use(sinonChai);

        window.__karma__.start();
    });
}

// Function.prototype.bind polyfill
(function () {
    var isFunction = function(o) {
      return typeof o == "function";
    };

    var bind,
      slice = [].slice,
      proto = Function.prototype,
      featureMap;

    featureMap = {
      "function-bind": "bind"
    };

    function has(feature) {
      var prop = featureMap[feature];
      return isFunction(proto[prop]);
    }

    // check for missing features
    if (!has("function-bind")) {
      // adapted from Mozilla Developer Network example at
      // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
      bind = function bind(obj) {
        var args = slice.call(arguments, 1),
          self = this,
          nop = function() {
          },
          bound = function() {
            return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
          };
        nop.prototype = this.prototype || {}; // Firefox cries sometimes if prototype is undefined
        bound.prototype = new nop();
        return bound;
      };
      proto.bind = bind;
    }
})();
