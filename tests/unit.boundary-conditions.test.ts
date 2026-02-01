import gqls from '../src/graphql-string';

describe('boundary conditions and edge cases', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('empty query with only fragments', () => {
    const frag1 = gqls`fragment first on Type { id }`;
    const frag2 = gqls`fragment second on Type { name }`;

    const input = gqls`${frag1}
${frag2}`;

    expect(input).toContain('fragment first on Type');
    expect(input).toContain('fragment second on Type');
  });

  it('query without any fragments', () => {
    const input = gqls`{
  user {
    id
    name
  }
}`;

    expect(input).not.toContain('fragment');
  });

  it('single fragment with minimal content', () => {
    const fragment = gqls`fragment m on T { i }`;

    const input = gqls`${fragment}
{
  data { ...m }
}`;

    expect(input).toContain('fragment m on T');
  });

  it('fragment with only whitespace between elements', () => {
    const fragment = gqls`fragment   spaced   on   Type   {
  id
}`;

    const input = gqls`${fragment}
{
  data {
    ...spaced
  }
}`;

    expect(input).toContain('spaced');
  });

  it('document with many operations using single fragment', () => {
    const frag = gqls`fragment data on Data { id }`;

    const input = gqls`${frag}
query One { d1 { ...data } }
query Two { d2 { ...data } }
query Three { d3 { ...data } }
mutation Update { update { ...data } }`;

    const fragmentCount = (input.match(/fragment data on Data/g) || []).length;
    expect(fragmentCount).toBe(1);
  });

  it('fragment remains unchanged with trailing content', () => {
    const fragment = gqls`fragment userFields on User {
  id
  name
}`;

    const input = gqls`${fragment}
#end of fragment
{
  user { ...userFields }
}`;

    expect(input).toContain('fragment userFields on User');
  });

  it('preserves query structure with fragments', () => {
    const frag = gqls`fragment userFields on User { id }`;

    const input = gqls`${frag}
query GetUser($id: ID!) {
  user(id: $id) {
    ...userFields
  }
}`;

    expect(input).toContain('query GetUser($id: ID!)');
    expect(input).toContain('user(id: $id)');
  });

  it('handles repeated fragment usage in query', () => {
    const frag = gqls`fragment uF on User { id }`;

    const input = gqls`${frag}
{
  user1 { ...uF }
  user2 { ...uF }
  user3 { ...uF }
}`;

    const spreadCount = (input.match(/\.\.\./g) || []).length;
    expect(spreadCount).toBeGreaterThan(0);
  });

  it('maintains fragment deduplication within single query call', () => {
    const sharedFrag = gqls`fragment shared on Type { value }`;

    const input = gqls`${sharedFrag}
${sharedFrag}
${sharedFrag}
{
  item { ...shared }
}`;

    const lines = input.split('\n');
    const fragmentLines = lines.filter((l) => l.includes('fragment shared on Type'));
    expect(fragmentLines.length).toBe(1);
  });
});
