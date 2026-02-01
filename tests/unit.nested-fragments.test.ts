import gqls from '../src/graphql-string';

describe('nested fragments', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('fragment that uses another fragment', () => {
    const friendFields = gqls`fragment friendFields on Character {
      id
      name
    }`;

    const characterFields = gqls`fragment characterFields on Character {
      ...friendFields
      age
      email
    }`;

    const input = gqls`{
      ${friendFields}
      ${characterFields}
      hero {
        ...characterFields
      }
    }`;

    const output = `fragment friendFields on Character {
      id
      name
    }
fragment characterFields on Character {
      ...friendFields
      age
      email
    }
{
      
      
      hero {
        ...characterFields
      }
    }`;

    expect(input).toEqual(output);
  });

  it('deeply nested fragments', () => {
    const level1 = gqls`fragment level1 on Type {
      field1
    }`;

    const level2 = gqls`fragment level2 on Type {
      ...level1
      field2
    }`;

    const level3 = gqls`fragment level3 on Type {
      ...level2
      field3
    }`;

    const input = gqls`{
      ${level1}
      ${level2}
      ${level3}
      data {
        ...level3
      }
    }`;

    const output = `fragment level1 on Type {
      field1
    }
fragment level2 on Type {
      ...level1
      field2
    }
fragment level3 on Type {
      ...level2
      field3
    }
{
      
      
      
      data {
        ...level3
      }
    }`;

    expect(input).toEqual(output);
  });
});
