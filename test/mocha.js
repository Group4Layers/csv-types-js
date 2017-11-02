
var assert = require('assert');

var tests = require('./tests.defs');

var CSV = require('../src/index');

let cfgTest = {
  fail: function(m){
    return {
      fail: m,
    };
  }
};

describe('CSV Types Parser', function() {

  for (let test of tests){
    // if (test.wip){
      it(test.test, function() {
        let input = test.input;
        let expected = test.expected;
        let cfg = test.cfg;

        CSV.configure(null);
        cfg = cfg || {};
        cfg.fail = cfgTest.fail;
        CSV.configure(cfg);

        let out = CSV.parse(input);

        assert.deepEqual(out, expected);
      });
    // }
  }

});
