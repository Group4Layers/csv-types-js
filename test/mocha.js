
var assert = require('assert');

var tests = require('./tests.defs');

var CSV = require('../').CSV;

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

        if (cfg != null){
          cfg = cfg || {};
          cfg.fail = cfgTest.fail;
        }
        let lCSV = new CSV(cfg);
        // lCSV.configure(cfg);

        let out = lCSV.parse(input);

        assert.deepEqual(out, expected);
      });
    // }
  }

});
