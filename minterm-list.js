'use strict';

const Util = require('./util');
const Minterm = require('./minterm');
const KMapGroup = require('./kmap-group');
const GroupingTree = require('./grouping-tree');

/**
 * Container class for minterms
 * Allows checks for existance and adding functions
 * Also generates kmap solutions using minterms in the list
 */
class MintermList {
  constructor(numOfVariables = 1, baseTenMinterms = [], baseTenDontCares = []) {
    this.numOfVariables = numOfVariables;
    const minterms = baseTenMinterms
      .sort((a, b) => a > b)
      .map(term => Util.convertToBinaryString(term, numOfVariables))
      .filter(term => term.length <= numOfVariables)
      .map(term => new Minterm(term));
    const dontCares = baseTenDontCares
      .sort((a, b) => a > b)
      .map(term => Util.convertToBinaryString(term, numOfVariables))
      .filter(term => term.length <= numOfVariables)
      .map(term => new Minterm(term, true));
    this.minterms = [...minterms, ...dontCares];
    this.dontCares = dontCares;
  }

  containsMinterm(targetMinterm, ignoreDontCares = false) {
    for (const minterm of this.minterms) {
      if (ignoreDontCares) {
        if (minterm.equals(targetMinterm) && !targetMinterm.isDontCare) return true;
      } else {
        if (minterm.equals(targetMinterm)) return true;
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

  /** 
   * For a true minterm, go through all possible groups and add to possible groupings list
   * if they only cover other true minterms or dont cares.
   */ 
  __getPossibleGroupingsOfLargestSize(front, visitedMinterms) {
    let largestGroupSize = null;
    const possibleGroupings = [];
    const fixedIndiciesList = Util.generateFixedIndicies(this.numOfVariables);
    for (const fixedIndicies of fixedIndiciesList) {
      const neighbors = front.getNeighborTerms(fixedIndicies);
      if (!this.containsMinterms(neighbors)) continue;

      this.__updateOtherMintermsDontCarenessWithThisList(neighbors);
      const currentGroup = [front, ...neighbors];

      if (largestGroupSize != null && currentGroup.length < largestGroupSize) break;
      largestGroupSize = currentGroup.length;
      let numOfMatches = visitedMinterms.getNumberOfMatchingMinterms(currentGroup);
      let numOfUnvisitedTargetMintermsInGroup = currentGroup.length - numOfMatches;
      possibleGroupings.push({group: currentGroup, numOfUnvisited: numOfUnvisitedTargetMintermsInGroup, fixedIndicies});
    }
    return possibleGroupings;
  }

  /**
   * Looks through all possible groupings for a specific minterm, and chooses
   * the one that covers the most unvisited minterms.
   */
  __getPossibleGroupingsWithMostUnvisitedMinterms(front, visitedMinterms) {
    let possibleGroupings = this.__getPossibleGroupingsOfLargestSize(front, visitedMinterms);
    possibleGroupings.sort((a, b) => a.numOfUnvisited < b.numOfUnvisited);
    possibleGroupings = possibleGroupings.filter(group => group.numOfUnvisited === possibleGroupings[0].numOfUnvisited);
    return possibleGroupings;
  }

  /** 
   * The crux of the minterm-list class. 
   * Gets all possible groupings (Groupings refer to one solution, containing groups)
   * The result is an array of groupings, where each grouping is an array of kmapGroups 
   */
  getGroups() {
    const visitedMinterms = new MintermList(this.numOfVariables);
    visitedMinterms.addMinterms(this.dontCares);
    const mintermQueue = [...this.minterms];
    const groupingTree = new GroupingTree(visitedMinterms, mintermQueue);
    const allSolutions = [];

    while (groupingTree.getCurrent() != null) {

      const { 
        mintermQueue: currentMintermQueue,
        visitedMinterms: currentVisitedMinterms,
        groups: currentGroups,
      } = groupingTree.getCurrent();

      /* Checks front of minterm queue.
       * If the queue is empty, adds final solution to list and exits loop
       * If the front is already visited or a don't-care, skip the minterm
       * Otherwise it will perform more groupings and expand the tree */
      const front = currentMintermQueue[0];
      if (front == null) {
        groupingTree.moveCurrentToNextActiveChild();
        allSolutions.push(currentGroups.map(group => new KMapGroup(group.group, group.fixedIndicies)));
        continue;
      } else if (front.isDontCare || currentVisitedMinterms.containsMinterm(front)) {
        const shiftedQueue = currentMintermQueue.slice(1);
        groupingTree.getCurrent().mintermQueue = shiftedQueue;
        continue;
      }

      /* Checks for all possible groups that include the current minterm 
       * If there are any, adds a child to the tree node but with an updated state
       * If not, the add all groups of current node to solution list */
      const possibleGroupings = this.__getPossibleGroupingsWithMostUnvisitedMinterms(front, currentVisitedMinterms);
      if (possibleGroupings.length !== 0) {
        for (const possibleGrouping of possibleGroupings) {
          const visitedMintermsCopy = currentVisitedMinterms.createCopy();
          visitedMintermsCopy.addMinterms(possibleGrouping.group);
          const groupsCopy = [...currentGroups, possibleGrouping];
          const mintermQueueCopy = currentMintermQueue.slice(1);
          groupingTree.addChildToCurrent(visitedMintermsCopy, mintermQueueCopy, groupsCopy);
        }
      } else {
        allSolutions.push(currentGroups.map(group => new KMapGroup(group.group, group.fixedIndicies)));
      }
      groupingTree.moveCurrentToNextActiveChild();
    }
    const filteredSolutions = Util.filterOnlySubarrayOfSmallestLength(allSolutions).map(grouping => {
      return grouping.sort((a, b) => a.groupSize < b.groupSize)
    });
    return filteredSolutions;
  }

  /**
   * Takes an array of minterms and matches it's dontcare values using this list. 
   */
  __updateOtherMintermsDontCarenessWithThisList(otherMinterms) {
    otherMinterms.forEach(otherMinterm => {
      const thisListEquivalent = this.getMintermUsingNumber(otherMinterm.getDecimal());
      if (thisListEquivalent !== null && thisListEquivalent.isDontCare) {
        otherMinterm.isDontCare = true;
      } else {
        otherMinterm.isDontCare = false;
      }
    });
  }

  createCopy() {
    const copy = new MintermList(this.numOfVariables);
    copy.minterms = this.minterms.slice();
    copy.dontCares = this.dontCares.slice();
    return copy;
  }
}

module.exports = MintermList;
