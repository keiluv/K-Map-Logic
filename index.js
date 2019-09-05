class Minterm {
  constructor(minterm = '') {
    this.terms = convertBinaryStrToBoolArr(minterm);
  }

  getTerm(index) {
    if (index < 0 || index >= this.terms.length) {
      return null;
    }
    return this.terms[index];
  }
}

class MintermList {
  constructor(numOfVariables = 1, baseTenMinterms = [0]) {
    let mintermStrings = baseTenMinterms
      .map(term => convertToBinaryString(term, numOfVariables))
      .filter(term => term.length <= numOfVariables);
    this.minterms = mintermStrings.map(term => new Minterm(term));
  }
}

console.dir(new MintermList(2, [1, 2, 3, 4]), {depth: 100});

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

function generateNeighborTerms(minterm, fixedIndicies = []) {
  filteredFixedIndicies = fixedIndicies.filter(x => x >= 0 && x < minterm.terms.length);
  filteredFixedIndicies.sort();

  const numOfFreeTerms = minterm.terms.length - filteredFixedIndicies.length;
  if (numOfFreeTerms < 0) return [];

  const numOfNeighbors = Math.pow(2, numOfFreeTerms) - 1;
  const permutationMasks = range(numOfNeighbors)
    .map(num => convertToBinaryString(num + 1, numOfFreeTerms))
    .map(binaryNumStr => {
      let maskStr = binaryNumStr;
      filteredFixedIndicies.forEach(index => maskStr = insertIntoString(maskStr, index, '0'));
      return maskStr;
    })
    .map(convertBinaryStrToBoolArr);
  const neighbors = permutationMasks.map(mask => xorBoolArrays(mask, minterm.terms));
  return neighbors;
}

console.log(generateNeighborTerms(new Minterm('0000'), [1, 2]));