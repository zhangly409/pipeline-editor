import moment from "moment";

function dateFormatCommon(row, column, onlyDate) {
  let date;
  if (typeof row == "object") {
    date = row[column.property];
  } else {
    date = row;
  }
  let formatDate = "";
  if (date === undefined) {
    return "-";
  }
  let format = onlyDate ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm:ss";
  formatDate = moment(date).format(format);
  return formatDate;
}

function timeFormat (seconds) {
  if (seconds === undefined) {
    return "-";
  }
  let s = Math.floor(seconds % 60)
  let m = Math.floor((seconds / 60) % 60)
  let h = Math.floor(seconds / 3600)
  let time = ''
  if (h > 0) {
    if (m > 0) {
      if (s > 0) {
        time = h + ' 小时' + m + ' 分' + s + ' 秒'
      } else {
        time = h + ' 小时' + m + ' 分'
      }
    } else {
      time = h + ' 小时' + s + ' 秒'
    }
  } else {
    if (m > 0) {
      if (s > 0) {
        time = m + ' 分' + s + ' 秒'
      } else {
        time = m + ' 分'
      }
    } else {
      time = s + ' 秒'
    }
  }
  return time
}
function timeFormatSimple (seconds) {
  if (seconds === undefined) {
    return "-";
  }
  let s = Math.floor(seconds % 60)
  let m = Math.floor((seconds / 60) % 60)
  let h = Math.floor(seconds / 3600)
  let time = ''
  if (h > 0) {
    if (m > 0) {
      if (s > 0) {
        time = h + 'h' + m + 'min' + s + 's'
      } else {
        time = h + 'h' + m + 'min'
      }
    } else {
      time = h + 'h' + s + 's'
    }
  } else {
    if (m > 0) {
      if (s > 0) {
        time = m + 'min' + s + 's'
      } else {
        time = m + 'min'
      }
    } else {
      time = s + 's'
    }
  }
  return time
}

function debounce(e, fn, delay) {
  clearTimeout(e.id);
  e.id = setTimeout(() => {
    fn();
  }, delay);
}

function textWrap(text, maxLen) {
  let pattern1 = new RegExp("[\u4E00-\u9FA5]+");
  let pattern2 = new RegExp("[A-Za-z]+");
  let pattern3 = new RegExp("[0-9]+");
  let num = 0;
  let textFormat = [];
  text.split("").map(v => {
    if (pattern1.test(v)) {
      num = num + 2;
      textFormat.push(v);
    } else if (pattern2.test(v)) {
      num++;
      textFormat.push(v);
    } else if (pattern3.test(v)) {
      num++;
      textFormat.push(v);
    } else {
      num = num + 2;
      textFormat.push(v);
    }
    if (num >= maxLen) {
      textFormat.push("\n");
      num = 0
    }
  });
  textFormat = textFormat.join("");
  return textFormat;
}
function textOverflow(text, maxLen) {
  let pattern1 = new RegExp("[\u4E00-\u9FA5]+");
  let pattern2 = new RegExp("[A-Za-z]+");
  let pattern3 = new RegExp("[0-9]+");
  let num = 0;
  let textFormat = [];
  let textArray = text.split("");
  for(let i=0;i<textArray.length;i++) {
    if (pattern1.test(textArray[i])) {
      num = num + 2;
      textFormat.push(textArray[i]);
    } else if (pattern2.test(textArray[i])) {
      num++;
      textFormat.push(textArray[i]);
    } else if (pattern3.test(textArray[i])) {
      num++;
      textFormat.push(textArray[i]);
    } else {
      num = num + 2;
      textFormat.push(textArray[i]);
    }
    if (num >= maxLen) {
      textFormat.push("...");
      break
    }
  }
  textFormat = textFormat.join("");
  return textFormat;
}

function convertVariable(value, variables) {
  if (variables === {}) {
    return value;
  }
  let matchWords = value.match(/\$\{.+?\}/g)
  if (matchWords) {
    matchWords.forEach(matchWord => {
      let key = matchWord.substring(2, matchWord.length - 1)
      if (variables.hasOwnProperty(key)) {
        value = value.replace(matchWord, variables[key])
      }
    })
  }
  return value;
}

export { dateFormatCommon, timeFormat, timeFormatSimple, debounce, textWrap, textOverflow, convertVariable };
