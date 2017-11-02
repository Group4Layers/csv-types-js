
let opts = {

};
let defOpts = {
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
  firstLineHeader: false,
  cast: false,
  row: false,
};

function configure(cfg){
  if (cfg == null){
    cfg = defOpts;
  }
  for (let o in cfg){
    opts[o] = cfg[o];
  }
  if (typeof opts.fail !== 'function'){
    opts.fail = defOpts.fail;
  }
  if (typeof opts.trim !== 'boolean'){
    opts.trim = defOpts.trim;
  }
  if (typeof opts.trimEscaped !== 'boolean'){
    opts.trimEscaped = defOpts.trimEscaped;
  }
  if (typeof opts.types !== 'boolean'){
    opts.types = defOpts.types;
  }
  if (typeof opts.headers !== 'boolean'){
    opts.headers = defOpts.headers;
  }
  if (typeof opts.firstLineHeader !== 'boolean'){
    opts.firstLineHeader = defOpts.firstLineHeader;
  }
  if (opts.types){
    opts.headers = true;
  }
  if (typeof opts.cast !== 'function'){
    if (opts.cast === true){
      opts.cast = casters.number;
    }else{
      opts.cast = false;
    }
  }
  if (typeof opts.row !== 'function'){
    opts.row = false;
  }
}
configure(null);

const casters = {
  number: function(value, isHeader){
    let ret = value;
    if (!isHeader){
      if (/^[-+]?[\d.]+$/.test(value)){
        ret = Number(value);
      }
    }
    return ret;
  }
};

function parse(str){
  let types = {};

  let lDefType = null;

  let lTyped = false; // if the row got the type
  let lType = null;
  let lArray = null;
  let lArrayLen = 0;
  let lStr = null;
  let lDQuoted = false; // if has escape double quote ""
  let lDQuotedOpen = false;
  let lValues = 0; // rows in values

  let line = 1;
  let lineI = 0;

  let lastNL = null; // append a last newline when EOF, to append last locals/tmp

  let optTypes = opts.types;
  let optHeaders = opts.headers;
  let headerParsed = false; // only for optTypes == false
  let optCast = opts.cast;
  let optRow = opts.row;

  let optFirstHeader = opts.firstLineHeader;
  // if (opts.firstLineHeader){
  //   // str = '#' + str.trim();
  //   str = '#' + str;
  // }

  let i = 0;
  let cont = true;
  let state = 0;
  while(cont){
    let char = str[i];
    if (lastNL) {
      char = lastNL;
      lastNL = false; // finish
    }
    if (char){
      // DEBUG: console.log(`${i} ${state}: '${char}'`)
      switch(state){
      case 0: // read
        if (char === '#'){
          if (optTypes && str.substr(i, 6) === '#type-'){
            state = 1; // header
            i += 5;
            lType = '';
            lStr = '';
          } else if (!optTypes && !headerParsed) {
            state = 1;
            lType = '';
            lTyped = true;
            lArray = [];
            lArrayLen = 0;
            lStr = '';
          }else{
            state = 3; // omit until EOL
          }
        }else if (char === ' ' || char === '\t'){ // omit

        }else if (char === '\n'){ // omit
          line++;
          lineI = i + 1;
        }else if (optTypes && char === 't'){
          if (str.substr(i, 5) === 'type-'){
            state = 2; // value
            i += 4;
            lType = '';
            lStr = '';
          }else{
            return opts.fail(`invalid row value in line ${line}:\n${str.substr(lineI, i - lineI + 1)}`);
          }
        }else if (!optTypes && headerParsed){
          state = 2; // value
          lType = '';
          lTyped = true;
          lArray = [];
          lArrayLen = 0;
          lDefType = types[''];
          lStr = char;
        }else if (!optTypes && optFirstHeader){
          state = 1;
          lType = '';
          lTyped = true;
          lArray = [];
          lArrayLen = 0;
          lStr = char;
        }else if (!optTypes && !headerParsed){
          return opts.fail(`invalid row (no header definition) in line ${line} col ${i - lineI + 1}:\n${str.substr(lineI, i - lineI + 1)}`);
        }
        break;
      case 1: // header
        if (char === '\n' || char === ','){
          if (lStr === ''){
            return opts.fail(`invalid header '${lStr}' in line ${line} col ${i - lineI + 1}:\n${str.substr(lineI, i - lineI + 1)}`);
          }else{
            if (lTyped){
              let value = lStr.trim();
              lArray.push(optCast ? optCast(value, true, lType, lArrayLen) : value);
              lArrayLen++;
            }else{
              lType = lStr;
              lTyped = true;
              lStr = '';
              lArray = [];
              lArrayLen = 0;
            }
          }
          if (char === ','){
            lStr = '';
          }else if (char === '\n'){
            if (types[lType]){
              return opts.fail(`previous header definition for '${lType}' in line ${line} col ${i - lineI + 1}:\n${str.substr(lineI, i - lineI + 1)}`);
            }
            if (!optHeaders){
              lArrayLen = 0;
              lArray = [];
            }
            types[lType] = {
              headers: lArray,
              hlength: lArrayLen,
              values: [],
              vlength: 0,
            };
            lValues = 0;
            lType = null;
            lArray = null;
            lArrayLen = 0;
            lStr = null;
            lTyped = false;
            state = 0;
            line++;
            lineI = i + 1;
            if (!optTypes){
              headerParsed = true;
            }
          }
        }else{
          lStr += char;
        }
        break;
      case 2: // value
        if (char === '\n' || char === ',' || char === '"'){
          if (lDQuotedOpen){
            if (char === ','){
              lStr += char;
            }else if (char === '"'){
              lDQuotedOpen = false;
            }else if (char === '\n'){
              return opts.fail(`invalid row with open escaped double quote and reach EOL in line ${line} col ${i - lineI + 1}:\n${str.substr(lineI, i - lineI + 1)}`);
            }
          }else{
            if (lTyped){
              let value = lStr;
              if (lDQuoted){
                if (opts.trimEscaped){
                  value = lStr.trim();
                }
              }else if (opts.trim){
                value = lStr.trim();
              }
              lArray.push(optCast ? optCast(value, false, lType, lArrayLen, lValues) : value);
              lArrayLen++;
              lDQuoted = false;
              lDQuotedOpen = false;
            }else{
              if (optTypes){ // can !optTypes come here?
                lDefType = types[lStr];
                // lDefType = types[''];
              }
              if (!lDefType){
                return opts.fail(`invalid type (no header definition) '${lStr}' in line ${line} col ${i - lineI + 1}:\n${str.substr(lineI, i - lineI + 1)}`);
              }
              lType = lStr;
              lTyped = true;
              lStr = '';
              lArray = [];
              lArrayLen = 0;
              lDQuoted = false;
              lDQuotedOpen = false;
            }
            if (char === ','){
              lStr = '';
              if (str[i+1] === '"'){
                lDQuoted = true;
                lDQuotedOpen = true;
                i++;
              }
            }else if (char === '\n'){
              if (optHeaders && lDefType.hlength !== lArrayLen){
                return opts.fail(`invalid row length ${lArrayLen} (header length ${lDefType.hlength}) in line ${line} col ${i - lineI + 1}:\n${str.substr(lineI,  i - lineI + 1)}`);
              }
              let insert = optRow ? optRow(lArray, lType, lDefType, lValues) !== false : true;
              if (insert){
                lDefType.values.push(lArray);
                lValues++;
                lDefType.vlength++;
              }
              lType = null;
              lArray = null;
              lArrayLen = 0;
              lStr = null;
              lTyped = false;
              lDQuoted = false;
              lDQuotedOpen = false;
              state = 0;
              line++;
              lineI = i + 1;
            }
          }
        }else{
          if (lDQuotedOpen){
            if (char === '\\' && str[i+1] === '"'){
              char = '"';
              i++; // omit next
            }
          }
          lStr += char;
        }
        break;
      case 3: // next until EOL
        if (char === '\n'){
          state = 0;
        }
        break;
      }
    }else{ // EOF
      if (lastNL == null){ // avoid problems when EOF is in the last row (no next line)
        lastNL = '\n';
        i = i - 1;
      }else{ // now can exit
        cont = false;
      }
    }
    i++;
  }

  if (!optTypes){
    types = types[''];
  }

  return types;
}

module.exports = {
  version: { major: 0, minor: 2, patch: 4 },
  parse,
  configure,
  casters,
};
