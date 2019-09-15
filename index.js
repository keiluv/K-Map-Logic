'use strict';

const MintermList = require('./minterm-list')

const a = new MintermList(3, [0, 1, 2, 5, 6, 7]).getGroups()
const b = new MintermList(4, [0, 1, 2, 3, 4, 5, 6, 7], [12, 13, 8, 9]).getGroups()
const c = new MintermList(3, [0, 1, 2, 5, 7], [3]).getGroups()

console.log()

console.dir(a, {depth: 100})

console.log()

console.dir(b, {depth: 100})

console.log()

console.dir(c, {depth: 100})
