'use strict';

const Util = require('./util');
const Minterm = require('./minterm');
const KMapGroup = require('./kmap-group');


class MintermList {
  constructor(numOfVariables = 1, baseTenMinterms = [], baseTenDontCares = []) {
    this.numOfVariables = numOfVariables;
    const minterms = baseTenMinterms
      .map(term => Util.convertToBinaryString(term, numOfVariables))
      .filter(term => term.length <= numOfVariables)
      .map(term => new Minterm(term));
    const dontCares = baseTenDontCares
      .map(term => Util.convertToBinaryString(term, numOfVariables))
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

  addMinterms(minterms) {
    for (const minterm of minterms) {
      this.addMinterm(minterm);
    }
  }

  getMintermUsingNumber(targetDecimalMinterm) {;
    for (const minterm of this.minterms) {
      if (minterm.getDecimal() === targetDecimalMinterm) return minterm;
    }
    return null;
  }

  getGroups() {
    const mintermQueue = [...this.minterms];
    const groups = [];
    const fixedIndiciesList = Util.generateFixedIndicies(this.numOfVariables);
    const visitedMinterms = new MintermList(this.numOfVariables);

    while (mintermQueue.length > 0) {
      const front = mintermQueue.shift();
      if (front.isDontCare || visitedMinterms.containsMinterm(front)) continue;

      for (const fixedIndicies of fixedIndiciesList) {
        const neighbors = front.getNeighborTerms(fixedIndicies);
        if (this.containsMinterms(neighbors)) {
          this.__updateOtherMintermsDontCarenessWithThisList(neighbors);
          const currentGroup = [front, ...neighbors];
          visitedMinterms.addMinterms(currentGroup);
          groups.push(new KMapGroup(currentGroup, fixedIndicies));
          break;
        }
      }
    }
    groups.sort((a, b) => a.groupSize < b.groupSize );
    return groups;
  }

  __updateOtherMintermsDontCarenessWithThisList(otherMinterms) {
    otherMinterms.forEach(otherMinterm => {
      const thisListEquivalent = this.getMintermUsingNumber(otherMinterm.getDecimal());
      if (thisListEquivalent !== null && thisListEquivalent.isDontCare) {
        otherMinterm.isDontCare = true;
      }
    })
  }
}

module.exports = MintermList;
