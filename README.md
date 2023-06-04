# graphql-string

## Description

graphql-string is an essential npm module designed to simplify the process of avoiding duplicated fragments in GraphQL when used as strings. With its intuitive functionality, graphql-string empowers developers to eliminate redundant code fragments efficiently, ensuring clean and optimized GraphQL queries.

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
