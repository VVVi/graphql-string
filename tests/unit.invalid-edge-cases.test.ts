import gqls from '../src/graphql-string';

describe('invalid and edge case fragments', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('handles fragment without fields', () => {
    const fragment = gqls`fragment empty on Type`;

    const input = gqls`${fragment}
{
  data {
    ...empty
  }
}`;

    expect(input).toContain('fragment empty on Type');
  });

  it('fragment name with numbers', () => {
    const fragment = gqls`fragment User1Fields2 on User {
  id
  name
}`;

    const input = gqls`${fragment}
{
  user {
    ...User1Fields2
  }
}`;

    expect(input).toContain('fragment User1Fields2 on User');
  });

  it('fragment with underscores in name', () => {
    const fragment = gqls`fragment user_fields_v2 on User {
  id
  name
}`;

    const input = gqls`${fragment}
{
  user {
    ...user_fields_v2
  }
}`;

    expect(input).toContain('fragment user_fields_v2 on User');
  });

  it('multiple fragments with similar naming', () => {
    const frag1 = gqls`fragment user on User { id }`;
    const frag2 = gqls`fragment userData on User { name }`;
    const frag3 = gqls`fragment userInfo on User { email }`;

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

  it('fragment keyword in different context is preserved', () => {
    const fragment = gqls`fragment fields on Type {
  id
  fragmentedData
}`;

    const input = gqls`${fragment}
{
  test {
    ...fields
  }
}`;

    expect(input).toContain('fragmentedData');
  });
});
