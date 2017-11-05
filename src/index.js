const defOpts = {
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
  delimiter: ',',
  escape: '"',
  comment: '#',
  cast: false,
  row: false,
};

class CSV {
  constructor(cfg){
    this.configure(cfg);
  }
  configure(cfg){
    if (cfg == null){
      cfg = {};
    }
    for (let opt in defOpts){
      let value = cfg[opt];
      this['_' + opt] = value != null ? value : defOpts[opt];
    }
    if (typeof this._fail !== 'function'){
      this._fail = defOpts.fail;
    }
    if (typeof this._trim !== 'boolean'){
      this._trim = defOpts.trim;
    }
    if (typeof this._trimEscaped !== 'boolean'){
      this._trimEscaped = defOpts.trimEscaped;
    }
    if (typeof this._types !== 'boolean'){
      this._types = defOpts.types;
    }
    if (typeof this._headers !== 'boolean'){
      this._headers = defOpts.headers;
    }
    if (typeof this._firstLineHeader !== 'boolean'){
      this._firstLineHeader = defOpts.firstLineHeader;
    }
    if (typeof this._delimiter !== 'string' || this._delimiter.length !== 1){
      this._delimiter = defOpts.delimiter;
    }
    if (typeof this._escape !== 'string' || this._escape.length !== 1){
      this._escape = defOpts.escape;
    }
    if (typeof this._comment !== 'string' || this._comment.length !== 1){
      this._comment = defOpts.comment;
    }
    if (this._types){
      this._headers = true;
    }
    if (!this._headers){
      this._firstLineHeader = false;
    }
    if (typeof this._cast !== 'function'){
      if (this._cast === true){
        this._cast = casters.number;
      }else{
        this._cast = false;
      }
    }
    if (typeof this._row !== 'function'){
      this._row = false;
    }
  }
  parse(str){
    let types = {};

    let lDefType = null;

    let lTyped = false; // if the row got the type
    let lType = null;
    let lArray = null;
    let lArrayLen = 0;
    let lStr = null;
    let lEsc = false; // if has escape double quote ""
    let lEscOpen = false;
    let lValues = 0; // rows in values

    let line = 1;
    let lineI = 0;

    let lastNL = null; // append a last newline when EOF, to append last locals/tmp

    const optTypes = this._types;
    const optHeaders = this._headers;
    let headerParsed = false; // only for optTypes == false
    const optCast = this._cast;
    const optRow = this._row;
    const optDel = this._delimiter;
    const optEsc = this._escape;
    const optComm = this._comment;

    let optFirstHeader = this._firstLineHeader;

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
        // uncomment for debug:
        // console.log(`${i} ${state}: '${char}'`)
        switch(state){
        case 0: // read
          if (char === optComm){
            if (optTypes && str.substr(i+1, 5) === 'type-'){
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
              return this._fail(`invalid row value in line ${line}:\n${str.substr(lineI, i - lineI + 1)}`);
            }
          }else{ // previously: else if (!optTypes)
            if (char === optEsc){
              lEsc = true;
              lEscOpen = true;
              // i++;
            }else if (headerParsed){
              state = 2; // value
              lType = '';
              lTyped = true;
              lArray = [];
              lArrayLen = 0;
              lDefType = types[''];
              lStr = char;
            }else if (optFirstHeader){
              state = 1;
              lType = '';
              lTyped = true;
              lArray = [];
              lArrayLen = 0;
              lStr = char;
            }else if (!optHeaders){
              state = 2; // value
              lType = '';
              lTyped = true;
              lArray = [];
              lArrayLen = 0;
              if (lDefType == null){
                lDefType = types[''] = {
                  headers: [],
                  hlength: 0,
                  values: [],
                  vlength: 0,
                };
              }
              lStr = char;
            }else{ // previously: else if (!headerParsed)
              return this._fail(`invalid row (no header definition) in line ${line} col ${i - lineI + 1}:\n${str.substr(lineI, i - lineI + 1)}`);
            }
          }
          break;
        case 1: // header
          if (char === '\n' || char === optDel){
            if (lStr === ''){
              return this._fail(`invalid header '${lStr}' in line ${line} col ${i - lineI + 1}:\n${str.substr(lineI, i - lineI + 1)}`);
            }else{
              if (lTyped){
                let value = lStr.trim();
                lArray.push(optCast ? optCast(value, true, lType, lArrayLen, 0) : value);
                lArrayLen++;
              }else{
                lType = lStr;
                lTyped = true;
                lStr = '';
                lArray = [];
                lArrayLen = 0;
              }
            }
            if (char === optDel){
              lStr = '';
            }else{ // previously: else if (char === '\n'){
              if (types[lType]){
                return this._fail(`previous header definition for '${lType}' in line ${line} col ${i - lineI + 1}:\n${str.substr(lineI, i - lineI + 1)}`);
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
          if (char === '\n' || char === optDel || char === optEsc){
            if (lEscOpen){
              if (char === optDel){
                lStr += char;
              }else if (char === optEsc){
                lEscOpen = false;
              }else{ // previously: else if (char === '\n')
                return this._fail(`invalid row with open escaped char ${optEsc} and reach EOL in line ${line} col ${i - lineI + 1}:\n${str.substr(lineI, i - lineI + 1)}`);
              }
            }else{
              if (lTyped){
                let value = lStr;
                if (lEsc){
                  if (this._trimEscaped){
                    value = lStr.trim();
                  }
                }else if (this._trim){
                  value = lStr.trim();
                }
                lArray.push(optCast ? optCast(value, false, lType, lArrayLen, lValues) : value);
                lArrayLen++;
                lEsc = false;
                lEscOpen = false;
              }else{
                if (optTypes){ // can !optTypes come here?
                  lDefType = types[lStr];
                  // lDefType = types[''];
                }
                if (!lDefType){
                  return this._fail(`invalid type (no header definition) '${lStr}' in line ${line} col ${i - lineI + 1}:\n${str.substr(lineI, i - lineI + 1)}`);
                }
                lType = lStr;
                lTyped = true;
                lStr = '';
                lArray = [];
                lArrayLen = 0;
                lEsc = false;
                lEscOpen = false;
              }
              if (char === optDel){
                lStr = '';
                if (str[i+1] === optEsc){
                  lEsc = true;
                  lEscOpen = true;
                  i++;
                }
              }else{ // previously: else if (char === '\n'){
                if (optHeaders && lDefType.hlength !== lArrayLen){
                  return this._fail(`invalid row length ${lArrayLen} (header length ${lDefType.hlength}) in line ${line} col ${i - lineI + 1}:\n${str.substr(lineI,  i - lineI + 1)}`);
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
                lEsc = false;
                lEscOpen = false;
                state = 0;
                line++;
                lineI = i + 1;
              }
            }
          }else{
            if (lEscOpen){
              if (char === '\\' && str[i+1] === optEsc){
                char = optEsc;
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
}

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



module.exports = {
  version: { major: 0, minor: 3, patch: 0 },
  CSV,
  casters
};
