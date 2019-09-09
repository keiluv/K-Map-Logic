'use strict';

class KMapGroup {
  constructor(minterms, fixedIndicies, variableNames) {
    this.minterms = minterms;
    this.fixedIndicies = fixedIndicies;
    this.groupSize = minterms.length;
    this.mintermSize = this.groupSize === 0 ? 0 : minterms[0].getSize();
    this.outputTermRaw = this.getOutputTermRaw();
    this.outputTerm = this.getOutputTerm(variableNames);
  }

  getOutputTermRaw(variable) {
    if (this.groupSize === 0) return null;
    const outputTerm = (new Array(this.mintermSize)).fill(-1);
    this.fixedIndicies.forEach(fixedIndex => {
      outputTerm[fixedIndex] = (this.minterms[0].getTerm(fixedIndex) === true) ? 1 : 0;
    })
    return outputTerm;
  }

  getOutputTerm(variableNames = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    return this.outputTermRaw
      .map((rawValue, idx) => {
        if (rawValue === -1) return null;
        let outputVariable = variableNames[idx];
        if (outputVariable == null) outputVariable = '(N/A)';
        if (rawValue === 1) return outputVariable;
        return outputVariable + '\'';
      })
      .filter(x => x !== null)
      .join('');
  }
}

module.exports = KMapGroup;
