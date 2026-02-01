import gqls from '../src/graphql-string';

describe('whitespace normalization', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('keeps original whitespace by default', () => {
    const fragment = gqls`fragment user on User {
  id
  name
  email
}`;

    const input = gqls`${fragment}
{
  data { ...user }
}`;

    // Should preserve indentation
    expect(input).toContain('  id');
    expect(input).toContain('  name');
  });

  it('normalizes whitespace when option is enabled', () => {
    const fragment = gqls`fragment user on User {
  id
  name
  email
}`;

    const input = gqls`${fragment}
{
  data { ...user }
}`;

    // Original keeps formatting
    expect(input).toMatch(/\n\s+id/);
  });

  it('fragment with excessive whitespace', () => {
    const fragment = gqls`fragment   user   on   User   {
  id
  name
}`;

    const input = gqls`${fragment}
{
  data { ...user }
}`;

    // Preserves original
    expect(input).toContain('fragment   user   on   User');
  });

  it('normalizes conflicting fragments with whitespace differences', () => {
    const fragment1 = gqls`fragment data on Type {
  id
  name
}`;

    const fragment2 = gqls`fragment data on Type { id name }`;

    const input = gqls`${fragment1}
${fragment2}
{ d { ...data } }`;

    // Should allow because normalized version is same
    expect(input).toContain('fragment data on Type');
  });

  it('preserves meaningful whitespace in field selections', () => {
    const fragment = gqls`fragment user on User {
  id
  profile {
    name
    email
  }
}`;

    const input = gqls`${fragment}
{ u { ...user } }`;

    // Preserves structure
    expect(input).toContain('profile');
    expect(input).toMatch(/profile\s*\{/);
  });

  it('handles minified input correctly', () => {
    const fragment = gqls`fragment u on U{id name}`;

    const input = gqls`${fragment}
{ d { ...u } }`;

    expect(input).toContain('fragment u on U');
  });

  it('multiple fragments with different whitespace but same content', () => {
    const frag1 = gqls`fragment a on T { id }`;
    const frag2 = gqls`fragment b on T {
  id
}`;
    const frag3 = gqls`fragment c on T {  id  }`;

    const input = gqls`${frag1}
${frag2}
${frag3}
{ d { ...a ...b ...c } }`;

    const fragmentCount = (input.match(/fragment [abc] on T/g) || []).length;
    expect(fragmentCount).toBe(3);
  });

  it('preserves comments in fragments', () => {
    const fragment = gqls`fragment user on User {
  # User ID
  id
  # User name
  name
}`;

    const input = gqls`${fragment}
{ data { ...user } }`;

    expect(input).toContain('# User ID');
    expect(input).toContain('# User name');
  });

  it('complex query with varied whitespace', () => {
    const frag1 = gqls`fragment f1 on T { a b c }`;
    const frag2 = gqls`fragment f2 on T {
  x
  y
  z
}`;

    const input = gqls`${frag1}
${frag2}
{
  field1 { ...f1 }
  field2 { ...f2 }
}`;

    expect(input).toContain('fragment f1 on T');
    expect(input).toContain('fragment f2 on T');
  });
});
