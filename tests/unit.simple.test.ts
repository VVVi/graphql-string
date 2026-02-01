import gqls from '../src/graphql-string';

describe('graphql string import', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('simple query', async () => {
    const input = gqls`{
        hero {
          name
        }
      }`;

    const output = `{
        hero {
          name
        }
      }`;

    expect(input).toEqual(output);
  });
});
