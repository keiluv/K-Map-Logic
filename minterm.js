'use strict';

const Util = require('./util');

/** 
 * Stores a minterm as a boolean array 
 * Accepts a boolean string, decimal number, or array directly 
 * [true, true, false, true] for '1101' or 13 
 */
class Minterm {
  constructor(minterm = '', isDontCare = false) {
    this.terms = (() => {
      if (typeof minterm === 'string') {
        return Util.convertBinaryStrToBoolArr(minterm);
      }
      if (typeof minterm === 'number') {
        return Util.convertBinaryStrToBoolArr(Util.convertToBinaryString(minterm));
      }
      return minterm;
    })();
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

  /** 
   * Returns list of all neighboring minterm objects the share the same binary value
   * at fixedIndicies. For example, the neighbours of 1101 with fixedIndicies=[0, 1]
   * would be 1100, 1111, and 1110 
   */
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

  /**
   * Checks minterm equality by comparing terms 
   * Note that this ignores the dontcareness in the comparison 
   */
  equals(other) {
    if (this.terms.length !== other.terms.length) return false;
    for (let i = 0; i < this.terms.length; i++) {
      if (this.terms[i] !== other.terms[i]) return false;
    }
    return true;
  }
}

module.exports = Minterm;
