import gqls from '../src/graphql-string';

describe('deduplication edge cases', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('same fragment passed multiple times appears only once', () => {
    const userFragment = gqls`fragment userFields on User {
  id
  name
}`;

    const input = gqls`${userFragment}
${userFragment}
${userFragment}
{
  user {
    ...userFields
  }
}`;

    const fragmentCount = (input.match(/fragment userFields on User/g) || []).length;
    expect(fragmentCount).toBe(1);
  });

  it('fragment deduplication with different fragment names', () => {
    const fragment1 = gqls`fragment first on Type { id }`;
    const fragment2 = gqls`fragment second on Type { name }`;
    const fragment1Again = gqls`fragment first on Type { id }`;

    const input = gqls`${fragment1}
${fragment2}
${fragment1Again}
{
  data {
    ...first
    ...second
  }
}`;

    const firstCount = (input.match(/fragment first on Type/g) || []).length;
    const secondCount = (input.match(/fragment second on Type/g) || []).length;

    expect(firstCount).toBe(1);
    expect(secondCount).toBe(1);
  });

  it('fragment reuse in nested structures', () => {
    const baseFrag = gqls`fragment base on User { id }`;

    const input = gqls`${baseFrag}
${baseFrag}
{
  user1 { ...base }
  nested {
    user2 { ...base }
  }
}`;

    expect(input).toContain('fragment base on User');
  });
});
