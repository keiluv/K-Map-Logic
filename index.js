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
  constructor(minterm = '', isDontCare = false) {
    if (typeof minterm === 'string') {
      this.terms = convertBinaryStrToBoolArr(minterm);
    } else if (typeof minterm === 'number') {
      this.terms = convertBinaryStrToBoolArr(convertToBinaryString(minterm));
    } else {
      this.terms = minterm;
    }
    this.isDontCare = isDontCare;
  }

  getTerm(index) {
    if (index < 0 || index >= this.terms.length) {
      return null;
    }
    return this.terms[index];
  }

  getBinaryString() {
    return this.terms.map(term => term ? '1' : '0').join('');
  }

  getDecimal() {
    return parseInt(this.getBinaryString(), 2);
  }

  generateNeighborTerms(fixedIndicies = []) {
    const filteredFixedIndicies = fixedIndicies.filter(x => x >= 0 && x < this.terms.length);
    filteredFixedIndicies.sort();
  
    const numOfFreeTerms = this.terms.length - filteredFixedIndicies.length;
    if (numOfFreeTerms < 0) return [];

    const permutationMasks = generateMasks(numOfFreeTerms, filteredFixedIndicies);
    const neighbors = permutationMasks
      .map(mask => xorBoolArrays(mask, this.terms))
      .map(neighbor => new Minterm(neighbor));

    return neighbors;
  }

  equals(other) {
    if (this.terms.length !== other.terms.length) return false;
    for (let i = 0; i < this.terms.length; i++) {
      if (this.terms[i] !== other.terms[i]) return false;
    }
    return true;
  }
}


class MintermList {
  constructor(numOfVariables = 1, baseTenMinterms = [], baseTenDontCares = []) {
    this.numOfVariables = numOfVariables;
    const minterms = baseTenMinterms
      .map(term => convertToBinaryString(term, numOfVariables))
      .filter(term => term.length <= numOfVariables)
      .map(term => new Minterm(term));
    const dontCares = baseTenDontCares
      .map(term => convertToBinaryString(term, numOfVariables))
      .filter(term => term.length <= numOfVariables)
      .map(term => new Minterm(term, true));
    this.minterms = [...minterms, ...dontCares];
  }

  containsMinterm(targetMinterm) {
    for (const minterm of this.minterms) {
      if (minterm.equals(targetMinterm)) return true;
    }
    return false;
  }

  containsMinterms(targetMinterms) {
    for (const targetMinterm of targetMinterms) {
      if (!this.containsMinterm(targetMinterm)) return false;
    }
    return true;
  }

  addMinterm(minterm) {
    this.minterms.push(minterm);
  }

  getMintermWithNumber(targetDecimalMinterm) {;
    for (const minterm of this.minterms) {
      if (minterm.getDecimal() === targetDecimalMinterm) return minterm;
    }
    return null;
  }

  generateGroups() {
    const mintermQueue = [...this.minterms];
    const groups = [];
    const fixedIndiciesList = generateFixedIndicies(this.numOfVariables);
    const visitedMinterms = new MintermList(this.numOfVariables);

    while (mintermQueue.length > 0) {
      const front = mintermQueue.shift();
      if (front.isDontCare || visitedMinterms.containsMinterm(front)) continue;

      for (const fixedIndicies of fixedIndiciesList) {
        const neighbors = front.generateNeighborTerms(fixedIndicies);
        if (!this.containsMinterms(neighbors)) continue;

        visitedMinterms.addMinterm(front);
        neighbors.forEach(neighbor => {
          if (this.getMintermWithNumber(neighbor.getDecimal()).isDontCare) {
            neighbor.isDontCare = true;
          }
          visitedMinterms.addMinterm(neighbor);
        });
        groups.push([front,...neighbors]);
        break;
      }
    }

    return groups;
  }
}

function generateFixedIndicies(numOfTerms) {
  const fixedIndiciesList = generateMasks(numOfTerms)
    .map(mask => {
      const indicies = range(numOfTerms);
      mask.forEach((bool, idx) => {
        if (!bool) indicies[idx] = -1;
      });
      return indicies;
    });
  const allFixed = [];
  return [allFixed, ...fixedIndiciesList];
}

const test = new MintermList(3, [2, 4, 6], [0]).generateGroups();
console.log(' ');
console.log(' ');
console.log(' ');
console.dir(test, {depth: 100});

console.log(new Minterm(3).getBinaryString());
console.log(new Minterm(3).getDecimal());