# CSV Types (csv-types-js)

[![JavaScript](https://img.shields.io/badge/made_in-javascript-fed93d.svg?style=flat-square)](https://developer.mozilla.org/docs/Web/JavaScript) [![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/rNoz/csv-types-js/blob/master/LICENSE.md) [![Coverage](https://img.shields.io/badge/coverage-98.15%25-green.svg)](https://github.com/rNoz/csv-types-js) [![Tests](https://img.shields.io/badge/tests-32%2F32-green.svg)](https://github.com/rNoz/csv-types-js)

CSV Types (csv-types-js) is a JavaScript library to parse CSV (comma separated values) strings and produce a JavaScript AST (abstract syntax tree) with the data. It also supports *types specs*: multiple headers-values (tables) per csv string.

## Table of Contents

1. [Description](#description)
1. [Installation](#installation)
1. [Examples](#examples)
1. [Options](#options)
1. [Test & Coverage](#test-coverage)
1. [Group4Layers use case (or why CSV Types)](#group4layers-use-case-or-why-csv-types)
1. [New features](#new-features)
1. [Author](#author)
1. [ChangeLog](#changelog)
1. [License](#license)

## Description

CSV Types (csv-types-js) is a JavaScript library to parse CSV (comma separated values) strings and produce a JavaScript AST (abstract syntax tree) with the data. It also supports *types specs*: multiple headers-values (tables) per csv string.

It parses four types of CSV formats, being the first two common between different applications and parsers, but have disadvantages over the last two that we are using in Group4Layers.

Format 1: **Values**.

```csv
event,2017-01-03,sport,running,minutes,35
event,2017-02-05,sport,press bench,kg,85-100-104-106-106
event,2017-02-05,sport,press bench,repetitions,12-10-10-8-7
event,2017-02-07,sport,pull-up,repetitions,12-12-10-10-10
```

Format 2: **Header** and **values**.

```csv
date,activity,action,units,value
2017-01-03,sport,running,minutes,35
2017-02-05,sport,press bench,kg,85-100-104-106-106
2017-02-05,sport,press bench,repetitions,12-10-10-8-7
2017-02-07,sport,pull-up,repetitions,12-12-10-10-10
```

Format 3: Allow **comments**, **header is commented** and **values**. Now you can provide more info, avoid confusing values with comments and headers (using a highlighter editor/viewer like *Emacs*) easing the interpretation and modification.

```csv
#date,activity,action,units,value
2017-01-03,sport,running,minutes,35
# I slept just 5 hours
2017-02-05,sport,press bench,kg,85-100-104-106-106
2017-02-05,sport,press bench,repetitions,12-10-10-8-7
# I had some pain in my right shoulder
# the gym was closed 2017-02-06, so, I work-out the next day
2017-02-07,sport,pull-up,repetitions,12-12-10-10-10
```

Format 4: **Types specs**: **comments**, **multiple commented headers** and **multiple type of values**. Now you can provide CSV files that are self-contained, with multiple type of values in the same file. It is flexible and you can alter the number of columns in the future, improving the expressivity of the data. It has the advantages of the previous format but with the maximum flexibility (multiple tables in the same file).

```csv
#type-sport,date,activity,action,units,value
#type-sleep,date,hours
type-sport,2017-01-03,sport,running,minutes,35
type-sleep,2017-02-05,5
type-sport,2017-02-05,sport,press bench,kg,85-100-104-106-106
type-sport,2017-02-05,sport,press bench,repetitions,12-10-10-8-7
#type-body-condition,part,severity,description
type-body-condition,right shoulder,high,concentrated pain in the back part of my right shoulder
# the gym was closed 2017-02-06, so, I work-out the next day
type-sport,2017-02-07,sport,pull-up,repetitions,12-12-10-10-10
```

A real-world example of this format (Types specs) can be seen in section [Group4Layers use case (or why CSV Types)](#group4layers-use-case-or-why-csv-types).

## Installation

```sh
npm i "http://github.com/rNoz/csv-types-js.git"
```

## Examples

The best way to learn something is to see how it behaves.

The configuration is configured with `CSV.configure()`. It will preserve the configuration between `parse` operations. To reset the configuration use `CSV.configure(null)`. Therefore, the best practice would be to do:

```js
const CSV = require('csv-types');
CSV.configure(null);
CSV.configure(yourOptions); // configure if you need to change the defaults
```

See the available options for configure in [Options](#options).

**CSV with types**

```csv
#type-a,col1,col2
type-a,1,2
type-a,2,3
#type-b,2
type-b,2
```

```js
const CSV = require('csv-types');
let results = CSV.parse(`#type-a,col1,col2
type-a,1,2
type-a,2,3
#type-b,2
type-b,2`);
```

`results`:

```js
{ "a": { headers: ["col1", "col2"],
         hlength: 2,
         values: [["1", "2"], ["2", "3"]] },
  "b": { headers: ["2"], hlength: 1, values: [["2"]] } }
```

**Normal CSV (no types)**

```csv
#type-a,col1,col2
type-a,1,2
type-a,2,3
```

```js
const CSV = require('csv-types');
CSV.configure({ types: false });
let results = CSV.parse(`#type-a,col1,col2
type-a,1,2
type-a,2,3`);
```
`results`:
```js
{ "a": { headers: ["type-a", "col1", "col2"],
         hlength: 3,
         values: [["type-a", "1", "2"], ["type-a", "2", "3"]] } }
```

**Normal csv (no types) and no header definition**

```csv
#type-a,col1,col2
type-a,1,2
type-a,2,3,4,5
```

```js
const CSV = require('csv-types');
CSV.configure({ types: false, headers: false });
let results = CSV.parse(`#type-a,col1,col2
type-a,1,2
type-a,2,3,4,5`);
```

`results`:
```js
{ "a": { headers: [],
         hlength: 0,
         values: [["type-a", "1", "2"], ["type-a", "2", "3", "4", "5"]],
         vlength: 2 } }
```

**Using number casting**

```csv
case,first,second
type-a,1.01,2
type-a,2,-3
```

```js
const CSV = require('csv-types');

CSV.configure({ cast: true, firstLineHeader: true });
let results = CSV.parse(`case,first,second
type-a,1.01,2
type-a,2,-3`);
```

`results`:
```
{ headers: ["case", "first", "second"],
  hlength: 3,
  values: [["type-a", 1.01, 2], ["type-a", 2, -3]], vlength: 2 } }
```

**Using casting with types**

```csv
#type-a,1,2
type-a,1,2
type-a,2,3
```

```js
const CSV = require('csv-types');

function castFn(value, isHeader, type, column){
  let ret = value;
  if (isHeader){
    ret = "the" + value;
  }else{
    if (/^[\d.]+$/.test(value)){
      ret = Number(value);
    }
  }
  return ret;
}

CSV.configure({ types: true, cast: castFn });
let results = CSV.parse(`#type-a,1,2
type-a,1,2
type-a,2,3`);
```

`results`:
```
{ "a": { headers: ["the1", "the2"],
         hlength: 2,
         values: [[1, 2], [2, 3]], vlength: 2 } }
```

**Using casting without types**

```csv
#type-a,1,2,3
type-a,1,2,tres
# comment
type-a,1,2,tres
```

```js
const CSV = require('csv-types');

function castFn(value, isHeader, type, column, row){
  let ret = value;
  if (/^[\d.]+$/.test(value)){
    ret = Number(value);
  }else if (type == ''){
    ret = `r${row}c${column}`;
  }
  return ret;
}

CSV.configure({ types: false, headers: false, cast: castFn });
let results = CSV.parse(`#type-a,1,2,3
type-a,1,2,tres
# comment
type-a,1,2,tres`);
```

```
{ headers: [],
  hlength: 0,
  values: [['r0c0', 1, 2, "r0c3"], ['r1c0', 1, 2, "r1c3"]], vlength: 2 } }
```


**Using row function to alter based on postprocessing**

```csv
⮒
#type-a,1,2
type-a,1,2
type-a,3,5
#type-b,1,2,3
type-b,1,2,tres
⮒
```

```js
const CSV = require('csv-types');

function rowFn(array, type, definition, row){
  if (type === 'b'){
    return false;
  }else{
    let idx = definition.headers.indexOf("2");
    if (array[0] == "1" && array[idx] == "2"){
      array[0] = "2";
      array[idx] = -1;
    }
  }
}

CSV.configure({ row: rowFn });
let results = CSV.parse(`
#type-a,1,2
type-a,1,2
type-a,3,5
#type-b,1,2,3
type-b,1,2,tres
`);
```

`results`:
```
{ a: { headers: [ '1', '2' ],
       hlength: 2,
       values: [ ["2", -1], ["3", "5"] ], vlength: 2 },
  b: { headers: [ '1', '2', '3' ], hlength: 3,
       values: [], vlength: 0 } }
```

**Using row function to alter based on postprocessing with no types**

```csv
⮒
#type-a,b,c,d
type-a,1,2,3
type-a,4,0,-1
⮒
```

```
function rowFn(array, type, definition, row){
  let sum = 0;
  let i = 0;
  for (let col of array){
    if (i > 0){
      sum += col;
      array[i] = Number(col);
    }
    i++;
  }
  if (sum > 3){
    return false;
  }
}
CSV.configure({ types: false, headers: false, row: rowFn });
let results = CSV.parse(`
#type-a,b,c,d
type-a,1,2,3
type-a,4,0,-1
`);
```

`results`:
```
{ headers: [], values: [["type-a", 4, 0, -1]], vlength: 1 },
```

**Capturing error**

```csv
#type-a,1,2,3
type-a,1,2
```

```
CSV.configure({ fail: function(m){ popup.error(m); return m; } });
let results = CSV.parse(`
#type-a,1,2,3
type-a,1,2
`);
```

In this case the `CSV.parse` method would trigger `popup.error(m)` instead of `console.log(m)`.

`results`:
```js
"invalid row length 2 (header length 3) in line 3 col 11:\ntype-a,1,2\n"
```

## Options

By default:

```js
const opts = {
  fail: function(m){
    console.log(m);
    return {
      fail: m,
    };
  },
  trim: true,
  trimEscaped: false,
  types: false,
  headers: true,
  firstNotEmptyLineIsHeader: false,
  cast: false,
  row: false,
};

CSV.configure(opts);
```

| option          | type      | description                                                    |
|-----------------|-----------|----------------------------------------------------------------|
| fail            | func      | function to fail (error is capturable)                         |
| trim            | bool      | trim space in value (headers are always trimmed)               |
| trimEscaped     | bool      | trim space in those escaped values (eg. " a " to "a")          |
| types           | bool      | use types (allows multiple definitions per string)             |
| headers         | bool      | you can omit headers when used with no types (flexible values) |
| firstLineHeader | bool      | headers are in the first not empty line (and not commented)    |
| cast            | bool/func | cast function for every value (by default false: no casting)   |
| row             | bool/func | row function for every row values                              |

If the cast function receives `true` it casts values that match the regexp `/^[-+]?[\d.]+$/` to numbers. Those that do not match are not casted, so, they are considered strings.

The cast function receives this parameters:
- `value` (`any`): the value (after the trimming, if applicable)
- `isHeader` (`bool`): true if it is a header or not
- `type` (`string`): type of the row (receives an empty string `''` if types are not used)
- `column` (`int`): the column index starting from 0 (the first)
- `row` (`int`): the row index starting from 0 (the first)

The row function receives this parameters:
- `value` (`any[]`): array of values
- `type` (`string`): type of the row (receives `''` if no types)
- `definition` (`definition{}`): the global object with definitions (headers) and values so far
- `row` (`int`): the row index starting from 0 (the first)

The `definition{}` object is:
```
{
  headers: any[],       // list of values
  hlength: int,         // headers length
  values: [any[], ...], // list of lists
  vlength: int          // values length (rows)
}
```

## Options for formats

Depending on the CSV format different options are needed for `CSV.configure`. It is assumed the default options are applied (`CSV.configure(null)` or first time used this package after importing it).

Format 1: **Values**

```csv
event,2017-01-03,sport,running,minutes,35
event,2017-02-05,sport,press bench,kg,85-100-104-106-106
```

```js
CSV.configure({ headers: false })
```

Format 2: **Header** and **values**.

```csv
date,activity,action,units,value
2017-01-03,sport,running,minutes,35
```

```js
CSV.configure({ firstLineHeader: true })
```

Format 3: Allow **comments**, **header is commented** and **values**.

```csv
#date,activity,action,units,value
2017-01-03,sport,running,minutes,35
# I slept just 5 hours
2017-02-05,sport,press bench,kg,85-100-104-106-106
```

Default options.

Format 4: **Types specs**: **comments**, **multiple commented headers** and **multiple type of values**.

```csv
#type-sport,date,activity,action,units,value
#type-sleep,date,hours
type-sport,2017-01-03,sport,running,minutes,35
type-sleep,2017-02-05,5
type-sport,2017-02-05,sport,press bench,kg,85-100-104-106-106
type-sport,2017-02-05,sport,press bench,repetitions,12-10-10-8-7
#type-body-condition,part,severity,description
type-body-condition,right shoulder,high,concentrated pain in the back part of my right shoulder
# the gym was closed 2017-02-06, so, I work-out the next day
type-sport,2017-02-07,sport,pull-up,repetitions,12-12-10-10-10
```

```js
CSV.configure({ types: true })
```

## Group4Layers use case (or why CSV Types)

We develop the CSV types specification to allow self-contained CSV files for some applications we are developing. The advantage of CSV over other formats is that our clients (and ourselves) can modify the files without JavaScript knowledge (JSON or JavaScript objects) and with a simple text editor.

One of the applications is highly used in different areas of the company, involving benchmarking, analysis and comparisions. We have many systems/apps to be tested, and some of them create charts with data of different nature. After days of executions we ended with thousands of files, often, connected between them. With the application of CSV Types we ended writing CSV files self-contained (different format types in the same file), reducing drastically the amount of them and having a whole execution in the same file.

```csv
#type-bench,bench_ts,name,compilation_opts,use_c1,use_c2,use_c3,max_cs,devices,scheduler_num,scheduler,c1_power,c2_power,c2_power,num_packages,hguided_params,min_pkg_c1,min_pkg_c2,min_pkg_c3,k,program_args,total_time,total_ws,num_packages_launched,lws,gws,joules_cs,joules_cgs,
type-bench,1498616602,"binomial","-O2",1,0,0,0,"c1",1,"static",1.000000,1.270000,1.000000,80,2409901,40,99,1,2,"40960000 255",235.331238,163840000,1,256,2621440000,45147.984375,50370.000000,
#type-event,bench_ts,event_type,event_id,device,status,package_size,time_offset,index,value,event_info,
# ...
type-event,1498617107,"CB_KERNEL_END",159,"C1","NULL",736,66.736061,163833200,0.000000,"",
type-event,1498617107,"CB_KERNEL_END",160,"C2","NULL",1584,66.736267,163831616,0.000000,"",
type-event,1498617107,"CB_KERNEL_END",161,"C1","NULL",656,66.737885,163833936,0.000000,"",
type-event,1498617107,"CB_KERNEL_END",162,"C3","NULL",1584,66.739273,163834592,0.000000,"",
type-event,1498617107,"CB_KERNEL_END",163,"C1","NULL",640,66.739395,163836176,0.000000,"",
type-event,1498617107,"CB_KERNEL_END",164,"C3","NULL",640,66.740936,163838400,0.000000,"",
type-event,1498617107,"CB_KERNEL_END",165,"C2","NULL",1584,66.741219,163836816,0.000000,"",
type-event,1498617107,"CB_KERNEL_END",166,"C1","NULL",640,66.742310,163839040,0.000000,"",
#type-energy,bench_ts,id,time_offset,watts_cs,joules_total_cs,watts_cgs,joules_total_cgs,
# ...
type-energy,1498616602,1,0.001046,0.000000,0.000000,107.000000,42.800000,
type-energy,1498616602,2,0.215948,-0.000000,11.641693,109.000000,86.400000,
type-energy,1498616602,3,0.415947,61.951837,24.031937,109.000000,130.000000,
type-energy,1498616602,4,0.615965,56.104850,35.253860,109.000000,173.600000,
type-energy,1498616602,5,0.815941,56.532052,46.558914,107.000000,216.400000,
type-energy,1498616602,6,1.016038,57.687933,58.102097,107.000000,259.200000,
type-energy,1498616602,7,1.215941,52.626995,68.622391,107.000000,302.000000,
```

## Test & Coverage

```sh
npm test
npm run coverage
```

Tests covered:

```markdown
  CSV Types Parser
    ✓ single type
    ✓ multiple types
    ✓ escaped by double quotes
    ✓ trim
    ✓ trim escaped
    ✓ not trim
    ✓ not trim and trim escaped
    ✓ open escape double quotes fail
    ✓ no header definition fails
    ✓ no header definition fails (no types)
    ✓ diff header definition fails
    ✓ invalid header definition fails
    ✓ all comments are ok
    ✓ rows can start with optional spaces
    ✓ headers are trimmed
    ✓ headers can have no values
    ✓ last row value is parsed when EOF
    ✓ last header is parsed when EOF
    ✓ repeated type header definition fails
    ✓ single (no type)
    ✓ invalid row length fails (no type)
    ✓ different row lengths without headers (no type)
    ✓ types overwrite the config headers false
    ✓ cast with types
    ✓ cast with types (using number caster)
    ✓ cast with no types
    ✓ row postprocessing with types
    ✓ row postprocessing with no types
    ✓ valid type row has to start with type-
    ✓ overwrite options with defaults
    ✓ default is with headers but not types
    ✓ firstLineHeader is true


  32 passing (43ms)
```

## New features

You can request new features for this library by opening new issues. If we find it useful (or there are at least 2 users interested in a proposal) we can implement it. Also, we accept pull requests with bugfixes or new features.

## Author

rNoz <rnoz.commits@gmail.com> (Group4Layers®).

## ChangeLog

*GitHub/Gitlab readers (repo, no docs): [CHANGELOG.md](CHANGELOG.md).*

## License

CSV Types (csv-types-js) source code is released under the MIT License.

*GitHub/Gitlab readers (repo, no docs): [LICENSE.md](LICENSE.md).*
