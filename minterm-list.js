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

  containsMinterm(targetMinterm, ignoreDontCares = false) {
    for (const minterm of this.minterms) {
      if (ignoreDontCares) {
        if (minterm.equals(targetMinterm)) return true;
      } else {
        if (minterm.equals(targetMinterm) && !minterm.isDontCare) return true;
      }
    }
    return false;
  }

  containsMinterms(targetMinterms, ignoreDontCares = false) {
    for (const targetMinterm of targetMinterms) {
      if (!this.containsMinterm(targetMinterm, ignoreDontCares)) return false;
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

  getNumberOfMatchingMinterms(mintermList, ignoreDontCares = false) {
    let numOfMatches = 0;
    mintermList.forEach(minterm => {
      if (this.containsMinterm(minterm, ignoreDontCares)) {
        numOfMatches += 1;
      }
    })
    return numOfMatches;
  }

  getGroups() {
    const mintermQueue = [...this.minterms];
    const groups = [];
    const fixedIndiciesList = Util.generateFixedIndicies(this.numOfVariables);
    const visitedMinterms = new MintermList(this.numOfVariables);

    // Puts each non-dontcare minterm in a queue and generates all possible groupings for it
    // If the possible grouping contains only true minterms or dont cares, 
    // it is added to a list of all possible grouping. Only the group that covers
    // the most unvisited minterms is then added to the final groups list
    while (mintermQueue.length > 0) {
      const front = mintermQueue.shift();
      if (front.isDontCare || visitedMinterms.containsMinterm(front)) continue;

      const possibleGroupings = [];
      let largestGroupSize = null;

      // For a true minterm, go through all possible groups and add to possible groupings list
      // if they only cover other true minterms or dont cares
      for (const fixedIndicies of fixedIndiciesList) {
        const neighbors = front.getNeighborTerms(fixedIndicies);
        if (!this.containsMinterms(neighbors)) continue;

        this.__updateOtherMintermsDontCarenessWithThisList(neighbors);
        const currentGroup = [front, ...neighbors];

        if (largestGroupSize != null && currentGroup.length < largestGroupSize) break;
        largestGroupSize = currentGroup.length;
        let numOfMatches = visitedMinterms.getNumberOfMatchingMinterms(currentGroup, true);
        let numOfUnvisitedTargetMintermsInGroup = currentGroup.length - numOfMatches;
        possibleGroupings.push({group: currentGroup, numOfUnvisitedTargetMintermsInGroup, fixedIndicies});
      }

      // Only choose the possible grouping that has the most unvisited minterms
      possibleGroupings.sort((a, b) => a.numOfUnvisitedTargetMintermsInGroup < b.numOfUnvisitedTargetMintermsInGroup);
      if (possibleGroupings[0] != null) {
        visitedMinterms.addMinterms(possibleGroupings[0].group);
        groups.push(new KMapGroup(possibleGroupings[0].group, possibleGroupings[0].fixedIndicies));
      }
    }

    groups.sort((a, b) => a.groupSize < b.groupSize);
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
