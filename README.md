# graphql-string

## Description

graphql-string is an essential npm module designed to simplify the process of avoiding duplicated fragments in GraphQL when used as strings. With its intuitive functionality, graphql-string empowers developers to eliminate redundant code fragments efficiently, ensuring clean and optimized GraphQL queries.

## Installation

```sh
$ npm i graphql-string 
```

## Usage

Use template literal 'gqls' as below:
```javascript

import gqls from 'graphql-string';

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

## Use cases

Could be used for pretty simple graphql queries and fragments 
as strings. Is good to use within NextJS Fetch function. 

For complex queries is recommended to use graphql-tag package, like:
```
import gql from 'graphql-tag';
import { print } from 'graphql/language/printer';

const ast = gql`
  ${someFragment}
  {
    data() {
      ...Data
    }
  }
`
const query = print(ast);
```