'use strict';

const tty = require('tty');

let supported = tty.isatty(process.stdout);

const codes = {
  bold: 1,
  underline: 4,
  reverse: 7,
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37
};

for (const [name, code] of Object.entries(codes)) {
  if (code >= 30 && code < 40) {
    codes['bg' + name] = code + 10;
  }
}

codes.b = codes.bold;
codes.u = codes.underline;

for (let num = 0; num <= 109; num++) {
  codes[num] = num;
}

const resetStr = '\x1B[0m';
const resetRegex = /\x1B\[0m/g;
const tagRegex = /(<\w+>|<A\d+>)|(<\/\w+>|<A\d+>)/i;
const numRegex = /\d+/;

const codeStr = code => {
  if (Array.isArray(code)) {
    return code.map(codeStr).join('');
  }

  return `\x1B[${code}m`;
};

const styleStr = (str, code) => {
  str = ('' + str).replace(resetRegex, `${resetStr}${codeStr(code)}`);
  return `${codeStr(code)}${str}${resetStr}`;
};

const applyStyle = code => str => {
  if (str == null) {
    str = '';
  }

  if (supported) {
    return styleStr(str, code);
  }

  return str;
};

for (const [name, code] of Object.entries(codes)) {
  module.exports[name] = applyStyle(code);
}

module.exports.enable = () => {
  supported = true;
};

module.exports.disable = () => {
  supported = false;
};

module.exports.parse = str => {
  if (str == null) {
    str = '';
  }

  let result = '';
  const activeCodes = [];
  let match;

  while ((match = str.match(tagRegex))) {
    result += str.slice(0, match.index);

    if (match[1]) {
      let tag = match[1].slice(1, -1).toLowerCase();
      if (tag.match(numRegex)) {
        tag = tag.slice(1);
      }
      if (tag in codes) {
        if (activeCodes && supported) {
          result += resetStr;
        }
        activeCodes.push(codes[tag]);
        if (supported) {
          result += codeStr(activeCodes);
        }
      } else {
        console.warn(`Unknown ANSI tag: ${match[1]}`);
        result += match[1];
      }
    } else {
      let tag = match[2].slice(2, -1).toLowerCase();
      if (tag.match(numRegex)) {
        tag = tag.slice(1);
      }
      if (tag in codes) {
        const code = codes[tag];
        const index = activeCodes.indexOf(code);
        if (index !== -1) {
          activeCodes.splice(index, 1);
        }
        if (supported) {
          result += resetStr + codeStr(activeCodes);
        }
      } else {
        console.warn(`Unknown ANSI tag: ${match[2]}`);
        result += match[2];
      }
    }

    str = str.slice(match.index + (match[1] || match[2]).length);
  }

  if (activeCodes && supported) {
    result += str + resetStr;
  }

  return result;
};
