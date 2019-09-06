'use strict';

function insertIntoString(string, index, text) {
  return string.slice(0, index) + text + string.slice(index);
}

function range(n) {
  return [...Array(n).keys()];
}

function convertToBinaryString(num, padding = 0) {
  return num.toString(2).padStart(padding, '0');
}

function convertBinaryStrToBoolArr(binaryStr) {
  return binaryStr.split('').map(x => x === '1');
}

function xorBoolArrays(arr1, arr2) {
  const outputLength = Math.min(arr1.length, arr2.length);
  const outputArr = [];
  for (let i = 0; i < outputLength; i++) {
    outputArr.push(( arr1[i] && !arr2[i] ) || ( !arr1[i] && arr2[i] ));
  }
  return outputArr;
}

function generateMasks(numOfTerms, fixedIndicies = []) {
  const numOfNeighbors = Math.pow(2, numOfTerms) - 1;
  const masks = range(numOfNeighbors)
    .map(num => convertToBinaryString(num + 1, numOfTerms))
    .map(binaryNumStr => {
      let maskStr = binaryNumStr;
      fixedIndicies.forEach(index => maskStr = insertIntoString(maskStr, index, '0'));
      return maskStr;
    })
    .map(convertBinaryStrToBoolArr);
  return masks;
}


class Minterm {
  constructor(minterm = '') {
    this.terms = convertBinaryStrToBoolArr(minterm);
    this.isClaimed = false;
  }

  getTerm(index) {
    if (index < 0 || index >= this.terms.length) {
      return null;
    }
    return this.terms[index];
  }

  generateNeighborTerms(fixedIndicies = []) {
    const filteredFixedIndicies = fixedIndicies.filter(x => x >= 0 && x < this.terms.length);
    filteredFixedIndicies.sort();
  
    const numOfFreeTerms = this.terms.length - filteredFixedIndicies.length;
    if (numOfFreeTerms < 0) return [];

    const permutationMasks = generateMasks(numOfFreeTerms, filteredFixedIndicies);
    const neighbors = permutationMasks.map(mask => xorBoolArrays(mask, this.terms));
    return neighbors;
  }
}


class MintermList {
  constructor(numOfVariables = 1, baseTenMinterms = [0]) {
    let mintermStrings = baseTenMinterms
      .map(term => convertToBinaryString(term, numOfVariables))
      .filter(term => term.length <= numOfVariables);
    this.minterms = mintermStrings.map(term => new Minterm(term));
  }

  generateGroups() {
    const mintermQueue = [...this.minterms];
    while (mintermQueue.length > 0) {
      const front = mintermQueue.shift();
      if (front.isClaimed) continue;

      const neighbors = front.generateNeighborTerms();
    }
  }
}

function generateFixedIndicies(numOfTerms) {
  const fixedIndiciesList = generateMasks(numOfTerms).map(mask => {
    const indicies = range(numOfTerms);
    mask.forEach((bool, idx) => {
      if (!bool) indicies[idx] = -1;
    });
    return indicies;
  });
  return fixedIndiciesList;
}

console.dir(new MintermList(3, [1, 2, 3, 4]), {depth: 100})
generateFixedIndicies(3);