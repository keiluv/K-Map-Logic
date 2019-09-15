'use strict';

const Util = {
  insertIntoString(string, index, text) {
    return string.slice(0, index) + text + string.slice(index);
  },
  
  range(n) {
    return [...Array(n).keys()];
  },
  
  convertToBinaryString(num, padding = 0) {
    return num.toString(2).padStart(padding, '0');
  },
  
  convertBinaryStrToBoolArr(binaryStr) {
    return binaryStr.split('').map(x => x === '1');
  },
  
  xorBoolArrays(arr1, arr2) {
    const outputLength = Math.min(arr1.length, arr2.length);
    const outputArr = [];
    for (let i = 0; i < outputLength; i++) {
      outputArr.push(( arr1[i] && !arr2[i] ) || ( !arr1[i] && arr2[i] ));
    }
    return outputArr;
  },
  
  generateMasks(numOfTerms, fixedIndicies = []) {
    const numOfNeighbors = Math.pow(2, numOfTerms) - 1;
    const masks = this.range(numOfNeighbors)
      .map(num => this.convertToBinaryString(num + 1, numOfTerms))
      .map(binaryNumStr => {
        let maskStr = binaryNumStr;
        fixedIndicies.forEach(index => maskStr = this.insertIntoString(maskStr, index, '0'));
        return maskStr;
      })
      .map(this.convertBinaryStrToBoolArr);
    return masks;
  },
  
  generateFixedIndicies(numOfTerms) {
    const fixedIndiciesList = this.generateMasks(numOfTerms)
      .map(mask => {
        const indicies = this.range(numOfTerms);
        mask.forEach((bool, idx) => {
          if (!bool) indicies[idx] = -1;
        });
        return indicies.filter(x => x !== -1);
      });
    const allFixed = [];
    return [allFixed, ...fixedIndiciesList].sort((a, b) => a.length > b.length);
  },
};

module.exports = Util;
