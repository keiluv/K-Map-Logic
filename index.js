'use strict';

const MintermList = require('./minterm-list')
const GroupingTree = require('./grouping-tree');

const a = new MintermList(3, [0, 1, 2, 5, 6, 7]).getGroups()
const b = new MintermList(4, [0, 1, 2, 3, 4, 5, 6, 7], [12, 13, 8, 9]).getGroups()
const c = new MintermList(3, [0, 1, 2, 5, 7], [3]).getGroups()
const d = new MintermList(3, [0, 1, 2, 6], [5]).getGroups()
// const d = new MintermList(3, [0, 2, 4, 5]).getGroups()
console.log()

console.dir(a, {depth: 100})

console.log()

console.dir(b, {depth: 100})

console.log()

console.dir(c, {depth: 100})

console.log()

console.dir(d, {depth: 100})
