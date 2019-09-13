'use strict';

const Util = require('./util');


class Minterm {
  constructor(minterm = '', isDontCare = false) {
    if (typeof minterm === 'string') {
      this.terms = Util.convertBinaryStrToBoolArr(minterm);
    } else if (typeof minterm === 'number') {
      this.terms = Util.convertBinaryStrToBoolArr(Util.convertToBinaryString(minterm));
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

  getNeighborTerms(fixedIndicies = []) {
    const filteredFixedIndicies = fixedIndicies.filter(x => x >= 0 && x < this.terms.length);
    filteredFixedIndicies.sort();
  
    const numOfFreeTerms = this.terms.length - filteredFixedIndicies.length;
    if (numOfFreeTerms < 0) return [];

    const permutationMasks = Util.generateMasks(numOfFreeTerms, filteredFixedIndicies);
    const neighbors = permutationMasks
      .map(mask => Util.xorBoolArrays(mask, this.terms))
      .map(neighbor => new Minterm(neighbor));

    return neighbors;
  }

  getSize() {
    return this.terms.length;
  }

  equals(other) {
    if (this.terms.length !== other.terms.length) return false;
    for (let i = 0; i < this.terms.length; i++) {
      if (this.terms[i] !== other.terms[i]) return false;
    }
    return true;
  }
}

module.exports = Minterm;
