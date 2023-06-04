# graphql-string

## Description

A simple module for avoiding duplicated fragments.

## Installation

```sh
$ npm i graphql-string 
```

## Usage

```javascript

const comparisonFields = gqls`
  fragment comparisonFields on Character {
    name
    appearsIn
    friends {
      name
    }
  }`;

const query = gqls`{
  ${comparisonFields}
  ${comparisonFields}
  leftComparison: hero(episode: EMPIRE) {
    ...comparisonFields
  }
  rightComparison: hero(episode: JEDI) {
    ...comparisonFields
  }
}`;
```
