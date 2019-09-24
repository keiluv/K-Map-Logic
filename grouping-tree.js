'use strict';

class GroupingTreeNode {
  constructor(visitedMinterms, mintermQueue = [], groups = []) {
    this.visitedMinterms = visitedMinterms;
    this.mintermQueue = mintermQueue;
    this.groups = groups;
    this.parent = null;
    this.children = [];
    this.activeChild = -1;
  }
}

class GroupingTree {
  constructor(visitedMinterms = [], mintermQueue = [], groups = []) {
    this.root = new GroupingTreeNode(visitedMinterms, mintermQueue, groups);
    this.current = this.root;
  }

  addChildToCurrent(visitedMinterms = [], mintermQueue = [], groups = []) {
    const child = new GroupingTreeNode(visitedMinterms, mintermQueue, groups);
    child.parent = this.current;
    this.current.children.push(child);
  }

  moveCurrentToChild(childIndex = 0) {
    if (this.current.children[childIndex] == null) return null;
    this.current = this.current.children[childIndex];
    return this.current;
  }

  moveCurrentToParent() {
    if (this.current.parent == null) return null;
    this.current = this.current.parent;
    return this.current;
  }

  moveCurrentToNextActiveChild() {
    this.current.activeChild += 1;
    const nextChild = this.moveCurrentToChild(this.current.activeChild);
    if (nextChild == null) {
      const parent = this.moveCurrentToParent();
      if (parent == null) {
        this.current = null;
        return null;
      }
      return this.moveCurrentToNextActiveChild();
    }
    return nextChild;
  }

  getCurrent() {
    return this.current;
  }
}

module.exports = GroupingTree;
