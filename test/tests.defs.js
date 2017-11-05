module.exports = [
  {
    test: 'single type',
    expected: {
      "a": {
        headers: ["1", "2", "3"],
        hlength: 3,
        values: [
          ["1", "2", "tres"],
          ["1", "2", "tres"],
        ],
        vlength: 2
      }
    },
    cfg: {
      types: true,
    },
    input: `
#type-a,1,2,3
type-a,1,2,tres

# comment
type-a,1,2,tres
`
  },

  {
    test: 'multiple types',
    expected: {
      "a": {
        headers: ["1", "2", "3"],
        hlength: 3,
        values: [
          ["1", "2", "tres"],
          ["1", "2", "tres"],
          ["3", "5", "cuatro"],
        ],
        vlength: 3,
      },
      "b": {
        headers: ["uno", "dos"],
        hlength: 2,
        values: [
          ["uno", "dos"],
          ["uno", "tres"],
        ],
        vlength: 2,
      }
    },
    cfg: {
      types: true,
    },
    input: `
#type-a,1,2,3
type-a,1,2,tres

# comment
type-a,1,2,tres

#type-b,uno,dos
type-b,uno,dos
type-a,3,5,cuatro
type-b,uno,tres
`
  },

  {
    test: 'escaped by double quotes',
    expected: {
      "a": {
        headers: ["1", "2", "3"],
        hlength: 3,
        values: [
          ["1", "2", "tres"],
          ["1", "2", 'tres",'],
          ["3", "5", "cuatro"],
        ],
        vlength: 3,
      },
      "b": {
        headers: ["uno", "dos"],
        hlength: 2,
        values: [
          ["uno, ,uno", "dos"],
          ["uno", "tres"],
        ],
        vlength: 2,
      }
    },
    cfg: {
      types: true,
    },
    input: `
#type-a,1,2,3
type-a,1,2,tres

# comment
type-a,1,2,"tres\\","

#type-b,uno,dos
type-b,"uno, ,uno",dos
type-a,3,5,cuatro
type-b,uno,tres
`
  },

  {
    test: 'trim',
    expected: {
      "a": {
        headers: ["1", "2", "3"],
        hlength: 3,
        values: [
          ["1", "2", "tres"],
          ["1", "2", 'tres'],
          ["3", "", "cuatro"],
        ],
        vlength: 3,
      },
    },
    cfg: {
      types: true,
    },
    input: `
#type-a,1,2,3
type-a,1,2 ,  tres
type-a, 1, 2 ,  tres
type-a, 3  ,,  cuatro
`
  },

  {
    test: 'trim escaped',
    expected: {
      "a": {
        headers: ["1", "2", "3"],
        hlength: 3,
        values: [
          ["1", "2", "tres"],
          ["1", "2", 'tres'],
          ["3", "", "cuatro"],
        ],
        vlength: 3,
      },
    },
    cfg: {
      types: true,
      trimEscaped: true,
    },
    input: `
#type-a,1,2,3
type-a,1,"2 ",  tres
type-a," 1", 2 ,"  tres  "
type-a, 3  ,,  cuatro
`
  },

  {
    test: 'not trim',
    expected: {
      "a": {
        headers: ["1", "2", "3"],
        hlength: 3,
        values: [
          ["1", "2 ", "  tres"],
          [" 1", " 2 ", '  tres'],
          [" 3  ", "", "  cuatro"],
        ],
        vlength: 3,
      },
    },
    cfg: {
      types: true,
      trim: false,
    },
    input: `
#type-a,1,2,3
type-a,1,2 ,  tres
type-a, 1, 2 ,  tres
type-a, 3  ,,  cuatro
`
  },

  {
    test: 'not trim and trim escaped',
    expected: {
      "a": {
        headers: ["1", "2", "3"],
        hlength: 3,
        values: [
          ["1", "2", " tres"],
          ["1", " 2 ", 'tres'],
        ],
        vlength: 2,
      },
    },
    cfg: {
      types: true,
      trim: false,
      trimEscaped: true,
    },
    input: `
#type-a,1,2,3
type-a,1,"2 ", tres
type-a," 1", 2 ,"  tres  "
`
  },

  {
    test: 'open escape double quotes fail',
    expected: {
      fail: 'invalid row with open escaped char " and reach EOL in line 3 col 19:\ntype-a,1,"2 , tres\n'
    },
    cfg: {
      types: true,
    },
    input: `
#type-a,1,2,3
type-a,1,"2 , tres
`
  },
  {
    test: 'open escape single quotes fail (custom escape char)',
    expected: {
      fail: 'invalid row with open escaped char \' and reach EOL in line 3 col 19:\ntype-a,1,\'2 , tres\n'
    },
    cfg: {
      types: true,
      escape: "'",
    },
    input: `
#type-a,1,2,3
type-a,1,'2 , tres
`
  },

  {
    test: 'no header definition works (no types, no headers)',
    expected: {
      headers: [],
      hlength: 0,
      values: [["type-b", "1", "2", "tres"]],
      vlength: 1,
    },
    cfg: {
      types: false,
      headers: false,
    },
    input: `
type-b,1,2 , tres
`
  },

  {
    test: 'discard comments',
    expected: {
      headers: ["str", "num"],
      hlength: 2,
      values: [],
      vlength: 0,
    },
    cfg: {
      escape: "'",
    },
    input: `
#str,num
#a,1,'2 , tres
`
  },
  {
    test: 'discard comments (custom comment char)',
    expected: {
      headers: [],
      hlength: 0,
      values: [],
      vlength: 0,
    },
    cfg: {
      headers: false,
      comment: '-',
    },
    input: `
-type-a,1,2,3
-type-a,1,'2 , tres
`
  },
  {
    test: 'use custom delimiter char (; with no headers)',
    expected: {
      headers: [],
      hlength: 0,
      values: [['type-a,1,\'2 , tres']],
      vlength: 1,
    },
    cfg: {
      headers: false,
      delimiter: ';',
    },
    input: `
#type-a,1;2,3
type-a,1,'2 , tres
`
  },
  {
    test: 'use custom delimiter char (; with one col)',
    expected: {
      headers: ['type-a,1', ',2,3'],
      hlength: 2,
      values: [['type-a,1,\'2', ', tres']],
      vlength: 1,
    },
    cfg: {
      delimiter: ';',
    },
    input: `
#type-a,1;,2,3
type-a,1,'2 ;, tres
`
  },

  {
    test: 'use custom delimiter, escape and comment chars',
    expected: {
      headers: ['field', 'num', 'str'],
      hlength: 3,
      values: [['escaped; as you see', '243', 'string'], ['escaped', 'as you see', '243']],
      vlength: 2,
    },
    cfg: {
      comment: '%',
      escape: '`',
      delimiter: ';',
    },
  input: `
%field;num;str
% comment
\`escaped; as you see\`;243;string
\`escaped\`; as you see;243
`
  },

  {
    test: 'no header definition fails',
    expected: {
      fail: 'invalid type (no header definition) \'b\' in line 3 col 7:\ntype-b,',
    },
    cfg: {
      types: true,
    },
    input: `
#type-a,1,2,3
type-b,1,"2 , tres
`
  },

  {
    test: 'no header definition fails (no types)',
    expected: {
      fail: 'invalid row (no header definition) in line 2 col 1:\nt',
    },
    cfg: {
      types: false,
    },
    input: `
type-b,1,2 , tres
`
  },

  {
    test: 'diff header definition fails',
    expected: {
      fail: 'invalid row length 2 (header length 3) in line 3 col 11:\ntype-a,1,2\n'
    },
    cfg: {
      types: true,
    },
    input: `
#type-a,1,2,3
type-a,1,2
`
  },

  {
    test: 'invalid header definition fails',
    expected: {
      fail: 'invalid header \'\' in line 2 col 11:\n#type-a,1,,'
    },
    cfg: {
      types: true,
    },
    input: `
#type-a,1,,3
type-a,1,2
`
  },

  {
    test: 'all comments are ok',
    expected: {
    },
    cfg: {
      types: true,
    },
    input: `
#pe-a,1,,3
# xtype-a,1,,3
`
  },

  {
    test: 'rows can start with optional spaces',
    expected: {
      "a": {
        headers: ["1", "2", "3"],
        hlength: 3,
        values: [
          ["1", "2", "tres"],
          ["1", "2", "tres"],
          ["3", "5", "cuatro"],
        ],
        vlength: 3,
      },
      "b": {
        headers: ["uno", "dos"],
        hlength: 2,
        values: [
          ["uno", "dos"],
          ["uno", "tres"],
        ],
        vlength: 2,
      }
    },
    cfg: {
      types: true,
    },
    input: `
  #type-a,1,2,3
  type-a,1,2,tres

 # comment
   type-a,1,2,tres

#type-b,uno,dos
        type-b,uno,dos
type-a,3,5,cuatro


   type-b,uno,tres
`
  },

  {
    test: 'headers are trimmed',
    expected: {
      "a": {
        headers: ["1", "2", "3"],
        hlength: 3,
        values: [
          ["1", "tres", "3"],
        ],
        vlength: 1,
      },
    },
    cfg: {
      types: true,
    },
    input: `
#type-a, 1, 2,3
type-a,1,tres,3
`
  },

  {
    test: 'headers can have no values',
    expected: {
      "a": {
        headers: ["1", "2", "3"],
        hlength: 3,
        values: [
          ["1", "tres", "3"],
        ],
        vlength: 1,
      },
      "b": {
        headers: ["uno", "dos"],
        hlength: 2,
        values: [],
        vlength: 0,
      }
    },
    cfg: {
      types: true,
    },
    input: `
#type-a, 1, 2,3
type-a,1,tres,3

# comment

#type-b,uno,dos
`
  },

  {
    test: 'last row value is parsed when EOF',
    expected: {
      "a": {
        headers: ["1", "2", "3"],
        hlength: 3,
        values: [
          ["1", "tres", ""],
          ["2", "tres", ""],
          ["3", "tres", ""],
        ],
        vlength: 3,
      }
    },
    cfg: {
      types: true,
    },
    input: `#type-a,1,2,3
type-a,1,tres,
type-a,2,tres,
type-a,3,tres,`
  },

  {
    test: 'last header is parsed when EOF',
    expected: {
      "a": {
        headers: ["1", "2", "3"],
        hlength: 3,
        values: [],
        vlength: 0,
      }
    },
    cfg: {
      types: true,
    },
    input: `#type-a,1,2,3`
  },

  {
    test: 'repeated type header definition fails',
    expected: {
      fail: 'previous header definition for \'a\' in line 3 col 14:\n#type-a,1,2,3\n'
    },
    cfg: {
      types: true,
    },
    input: `
#type-a,1,2,3
#type-a,1,2,3
`
  },

  {
    test: 'single (no type)',
    expected: {
      headers: ["type-a", "1", "2", "3"],
      hlength: 4,
      values: [
        ["type-a", "1", "2", "tres"],
        ["type-a", "1", "2", "tres"],
      ],
      vlength: 2,
    },
    cfg: {
      types: false
    },
    input: `
#type-a,1,2,3
type-a,1,2,tres

# comment
type-a,1,2,tres
`
  },

  {
    test: 'invalid row length fails (no type)',
    expected: {
      fail: 'invalid row length 5 (header length 4) in line 4 col 18:\ntype-a,1,2,tres,3\n'
    },
    cfg: {
      types: false
    },
    input: `
#type-a,1,2,3
type-a,1,2,tres
type-a,1,2,tres,3
`
  },

  {
    test: 'different row lengths without headers (no type)',
    expected: {
      headers: [],
      hlength: 0,
      values: [
        ["type-a", "1", "2", "tres"],
        ["type-b", "1", "2", "tres", "longer", ""],
      ],
      vlength: 2,
    },
    cfg: {
      types: false,
      headers: false,
    },
    input: `
#type-a,1,2,3
type-a,1,2,tres
# comment
type-b,1,2,tres,longer,
`
  },

  {
    test: 'types overwrite the config headers false',
    expected: {
      "a": {
        headers: ["1", "2", "3"],
        hlength: 3,
        values: [
          ["1", "2", "tres"],
          ["1", "2", "tres"],
        ],
        vlength: 2,
      }
    },
    cfg: {
      types: true,
      headers: false,
    },
    input: `
#type-a,1,2,3
type-a,1,2,tres
# comment
type-a,1,2,tres
`
  },

  {
    test: 'cast with types',
    expected: {
      "a": {
        headers: ["the1", "the2", "the3"],
        hlength: 3,
        values: [
          [1, 2, "tres"],
          [1, 2, "tres"],
        ],
        vlength: 2,
      }
    },
    cfg: {
      types: true,
      headers: false,
      cast: function(value, isHeader, type, column){
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
    },
    input: `
#type-a,1,2,3
type-a,1,2,tres
# comment
type-a,1,2,tres
`
  },

  {
    test: 'cast with types (using number caster)',
    expected: {
      "a": {
        headers: ["num1", "num2", "c"],
        hlength: 3,
        values: [
          [1, 2.221, "2,3"],
          [-1, -2.34, "34tres"],
        ],
        vlength: 2,
      }
    },
    cfg: {
      types: true,
      headers: false,
      cast: true,
    },
    input: `
#type-a,num1,num2,c
type-a,+1,2.221,"2,3"
# comment
type-a,-1,-2.34,34tres
`
  },
  {
    test: 'cast with no types',
    expected: {
      headers: [],
      hlength: 0,
      values: [
        ['r0c0', 1, 2, "r0c3"],
        ['r1c0', 1, 2, "r1c3"],
      ],
      vlength: 2,
    },
    cfg: {
      types: false,
      headers: false,
      cast: function(value, isHeader, type, column, row){
        let ret = value;
        if (/^[\d.]+$/.test(value)){
          ret = Number(value);
        }else if (type == ''){
          ret = `r${row}c${column}`;
        }
        return ret;
      }
    },
    input: `
#type-a,1,2,3
type-a,1,2,tres
# comment
type-a,1,2,tres
`
  },

  {
    test: 'row postprocessing with types',
    expected: {
      "a": {
        headers: ["1", "2"],
        hlength: 2,
        values: [
          ["2", -1],
          ["3", "5"],
        ],
        vlength: 2,
      },
      "b": {
        headers: ["1", "2", "3"],
        hlength: 3,
        values: [],
        vlength: 0,
      }
    },
    cfg: {
      types: true,
      row: function(array, type, definition, row){
        if (type === 'b'){
          return false;
        }else{
          let idx = definition.headers.indexOf("2");
          if (array[0] == "1" && array[idx] == "2"){
            array[0] = "2";
            array[idx] = -1;
          }
        }
      },
    },
    input: `
#type-a,1,2
type-a,1,2
type-a,3,5
#type-b,1,2,3
type-b,1,2,tres
`
  },

  {
    test: 'row postprocessing with no types',
    expected: {
      headers: [],
      hlength: 0,
      values: [
        ["type-a", 4, 0, -1],
      ],
      vlength: 1,
    },
    cfg: {
      types: false,
      headers: false,
      row: function(array, type, definition, row){
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
      },
    },
    input: `
#type-a,b,c,d
type-a,1,2,3
type-a,4,0,-1
`
  },

  {
    test: 'valid type row has to start with type-',
    expected: {
      fail: 'invalid row value in line 4:\nt',
    },
    cfg: {
      types: true,
    },
    input: `
#type-a,b,c,d
type-a,1,2,3
tye-a,4,0,-1
`
  },

  {
    test: 'overwrite options with defaults',
    expected: {
      fail: "invalid row length 4 (header length 3) in line 3 col 13:\ntype-a,1,2,3\n"
    },
    cfg: {
      trim: 1,
      trimEscaped: /xx/,
      types: "xx",
      headers: [],
    },
    input: `
#type-a,b,d
type-a,1,2,3
tye-a,4,0,-1
`
  },

  {
    test: 'default is with headers but not types',
    expected: {
      headers: ["type-a", "b", "c", "d"],
      hlength: 4,
      values: [
        ["type-a", "1", "2", "3"],
        ["tye-b", "4", "0", "-1"],
      ],
      vlength: 2,
    },
    input: `
#type-a,b,c,d
type-a,1,2,3
tye-b,4,0,-1
`
  },

  {
    test: 'firstLineHeader is true',
    expected: {
      headers: ["type-a", "b", "c", "d"],
      hlength: 4,
      values: [
        ["type-a", "1", "2", "3"],
        ["tye-b", "4", "0", "-1"],
      ],
      vlength: 2,
    },
    cfg: {
      firstLineHeader: true,
    },
    input: `
type-a,b,c,d
type-a,1,2,3
tye-b,4,0,-1
`
  },
  {
    test: 'firstLineHeader only works when headers is true',
    expected: {
      headers: [],
      hlength: 0,
      values: [
        ["type-a", "b", "c", "d"],
        ["type-a", "1", "2", "3"],
        ["tye-b", "4", "0", "-1"],
      ],
      vlength: 3,
    },
    cfg: {
      firstLineHeader: true,
      headers: false,
    },
    input: `
type-a,b,c,d
type-a,1,2,3
tye-b,4,0,-1
`
  },
  {
    test: 'firstLineHeader is true (with headers)',
    expected: {
      headers: ["type-a", "b", "c", "d"],
      hlength: 4,
      values: [
        ["type-a", "1", "2", "3"],
        ["tye-b", "4", "0", "-1"],
      ],
      vlength: 2,
    },
    cfg: {
      firstLineHeader: true,
      headers: true,
    },
    input: `
type-a,b,c,d
type-a,1,2,3
tye-b,4,0,-1
`
  },

  {
    test: 'wrong options are discarded',
    expected: {
      headers: ["type-a", "b", "c", "d"],
      hlength: 4,
      values: [
        ["type-a", "1", "2", "3"],
        ["tye-b", "4", "0", "-1"],
      ],
      vlength: 2,
    },
    cfg: {
      fail: 'f',
      trim: 2,
      trimEscaped: /x/g,
      types: -4,
      headers: {},
      firstLineHeader: [],
      delimiter: 'xx',
      escape: true,
      comment: false,
      cast: "x",
      row: `r`,
    },
    input: `
#type-a,b,c,d
type-a,1,2,3
tye-b,4,0,-1
`
  },
];
