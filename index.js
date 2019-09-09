'use strict';

const MintermList = require('./minterm-list');


const test = new MintermList(6, [0, 2, 4, 13, 15, 8, 10, 16, 20, 23, 18, 24, 26, 32, 34, 45, 47, 40, 41, 42, 48, 50, 60, 61, 56, 57, 58]).getGroups();
console.dir(test, {depth: 100});
