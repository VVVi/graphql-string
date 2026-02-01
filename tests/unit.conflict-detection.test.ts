import gqls from '../src/graphql-string';

describe('conflict detection', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('throws error when same fragment name has different content', () => {
    const fragment1 = gqls`fragment user on User { id }`;
    const fragment2 = gqls`fragment user on User { name }`;

    expect(() => {
      return gqls`${fragment1}
${fragment2}
{
  data { ...user }
}`;
    }).toThrow(/Fragment "user" defined twice with different selection sets/);
  });

  it('error message includes diff information', () => {
    // Create raw fragments (not using gqls)
    const fragment1 = `fragment userData on User { id name }`;
    const fragment2 = `fragment userData on User { id email age }`;

    expect(() => {
      return gqls`${fragment1}
${fragment2}
{
  data { ...userData }
}`;
    }).toThrow(/Fragment "userData" defined twice with different selection sets/);
  });

  it('allows identical fragments with same name', () => {
    const fragment1 = gqls`fragment user on User { id }`;
    const fragment2 = gqls`fragment user on User { id }`;

    const input = gqls`${fragment1}
${fragment2}
{
  data { ...user }
}`;

    const fragmentCount = (input.match(/fragment user on User/g) || []).length;
    expect(fragmentCount).toBe(1);
  });

  it('allows identical fragments with whitespace differences', () => {
    const fragment1 = gqls`fragment user on User { id }`;
    const fragment2 = gqls`fragment   user   on   User   {   id   }`;

    const input = gqls`${fragment1}
${fragment2}
{
  data { ...user }
}`;

    const fragmentCount = (input.match(/fragment user on User/g) || []).length;
    expect(fragmentCount).toBe(1);
  });

  it('detects conflicts in complex fragments', () => {
    const fragment1 = gqls`fragment user on User {
  id
  name
  email
}`;

    const fragment2 = gqls`fragment user on User {
  id
  name
}`;

    expect(() => {
      return gqls`${fragment1}
${fragment2}
{
  data { ...user }
}`;
    }).toThrow(/Fragment "user" defined twice with different selection sets/);
  });

  it('different fragment names can coexist', () => {
    const frag1 = gqls`fragment user on User { id }`;
    const frag2 = gqls`fragment userData on User { id }`;
    const frag3 = gqls`fragment userInfo on User { id }`;

    const input = gqls`${frag1}
${frag2}
${frag3}
{
  data {
    ...user
    ...userData
    ...userInfo
  }
}`;

    expect(input).toContain('fragment user on User');
    expect(input).toContain('fragment userData on User');
    expect(input).toContain('fragment userInfo on User');
  });
});
