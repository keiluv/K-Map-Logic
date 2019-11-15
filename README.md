# Karnaugh Maps Logic

This package contains the main solving logic behind the K-Maps Revisited Projects.
The solving logic is all packaged inside meaning no calls to a server are needed.

## How to Use

To solve a k-map, we use the **MintermList** class with the constructor:

`MintermList(numberOfVariables, minterms, dontCares)`

and use the *getGroups* function:

```javascript
const solutions = new MintermList(3, [0, 1, 2, 5, 6, 7]).getGroups()
```

The output is an array of groupings, where each grouping is an array of KMapGroups. 
KMapGroups are just a container class for each group.
```javascript
[ 
  [ KMapGroup {
      minterms:
       [ Minterm { terms: [ false, false, false ], isDontCare: false },
         Minterm { terms: [ false, true, false ], isDontCare: false } ],
      fixedIndicies: [ 0, 2 ],
      groupSize: 2,
      mintermSize: 3,
      outputTermRaw: [ 0, -1, 0 ],
      outputTerm: 'A\'C\'',
      decimalRepresentation: [ 0, 2 ] },
    KMapGroup { ... },
    KMapGroup { ... },
  ],
  [ 
    KMapGroup { ... },
    KMapGroup { ... },
    KMapGroup { ... }, 
  ],
]
```

## Current Issues

Right now, I'm working on a fix for some unoptimal answers depending on which minterm the algorithm starts on. Speed is also a potential concern as it copies the state for each iteration of the solving loop.