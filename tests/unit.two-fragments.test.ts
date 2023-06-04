import { describe, it, expect } from '@jest/globals';

import gqls from '../src/graphql-string';

describe('graphql string import', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('query with using the same fragment two times', async () => {
    const comparisonFields = gqls`fragment comparisonFields on Character {
        name
        appearsIn
        friends {
          name
        }
      }`;

    const input = gqls`{
        ${comparisonFields}
        ${comparisonFields}
        leftComparison: hero(episode: EMPIRE) {
          ...comparisonFields
        }
        rightComparison: hero(episode: JEDI) {
          ...comparisonFields
        }
      }`;

    const output = `fragment comparisonFields on Character {
        name
        appearsIn
        friends {
          name
        }
      }
{
        
        
        leftComparison: hero(episode: EMPIRE) {
          ...comparisonFields
        }
        rightComparison: hero(episode: JEDI) {
          ...comparisonFields
        }
      }`;

    expect(input).toEqual(output);
  });
});
