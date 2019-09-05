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

function generateNeighborTerms(minterm, fixedIndicies) {
  const numOfFreeTerms = minterm.terms.length - fixedIndicies.length;
  const numOfNeighbors = Math.pow(2, numOfFreeTerms) - 1;
  fixedIndicies.sort((a, b) => a > b);
console.log(fixedIndicies)
  const permutationMasks = range(numOfNeighbors)
    .map(num => convertToBinaryString(num + 1, numOfFreeTerms))
    .map(binaryNumStr => {
      console.log(binaryNumStr)
      let maskStr = binaryNumStr;
      fixedIndicies.forEach(index => {
        console.log('maskStr:', maskStr);
        maskStr = insertIntoString(maskStr, index, '0');
      });
      console.log('maskStr:', maskStr);
      return maskStr;
    })
    .map(convertBinaryStrToBoolArr);
  console.dir(permutationMasks, {depth: 100});
}

generateNeighborTerms(new Minterm('1010'), [2])
