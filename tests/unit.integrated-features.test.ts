import gqls from '../src/graphql-string';

describe('integrated feature tests', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('conflict detection works with deterministic ordering', () => {
    const frag1 = `fragment a on T { id }`;
    const frag2 = `fragment b on T { name }`;
    const frag1Dup = `fragment a on T { id }`;

    const input = gqls`${frag1}
${frag2}
${frag1Dup}
{ d { ...a ...b } }`;

    const aIndex = input.indexOf('fragment a on T');
    const bIndex = input.indexOf('fragment b on T');

    expect(aIndex).toBeLessThan(bIndex);
    expect(input).toContain('fragment a on T');
    expect(input).toContain('fragment b on T');
  });

  it('conflict detection prevents whitespace normalization bypass', () => {
    const frag1 = `fragment user on User { id   name }`;
    const frag2 = `fragment user on User { id name email }`;

    expect(() => {
      return gqls`${frag1}
${frag2}
{ d { ...user } }`;
    }).toThrow(/Fragment "user" defined twice with different selection sets/);
  });

  it('deterministic ordering preserved with many fragments', () => {
    const fragments = Array.from({ length: 5 }, (_, i) => `fragment f${i} on T { field${i} }`);
    const duplicates = fragments.slice(0, 3);

    const allFrags = [...fragments, ...duplicates];

    const input = gqls`${allFrags.join('\n')}
{ d { ...f0 ...f1 ...f2 ...f3 ...f4 } }`;

    const indices = Array.from({ length: 5 }, (_, i) => input.indexOf(`fragment f${i} on T`));

    for (let i = 0; i < indices.length - 1; i++) {
      expect(indices[i]).toBeLessThan(indices[i + 1]);
    }
  });

  it('whitespace normalization for conflict detection is consistent', () => {
    const frag1 = `fragment test on T { a b c }`;
    const frag2 = `fragment test on T {
  a
  b
  c
}`;

    // These should NOT conflict because they have the same normalized form
    const input = gqls`${frag1}
${frag2}
{ d { ...test } }`;

    const fragmentCount = (input.match(/fragment test on T/g) || []).length;
    expect(fragmentCount).toBe(1);
  });

  it('comprehensive scenario with all features', () => {
    const shared = `fragment shared on Type { id }`;
    const user = `fragment user on User { ...shared name }`;
    const post = `fragment post on Post { ...shared title }`;

    const input = gqls`${shared}
${user}
${post}
${shared}
query {
  me { ...user }
  posts { ...post }
}`;

    // Should have no conflicts
    const lines = input.split('\n');
    const fragmentLines = lines.filter((l) => l.startsWith('fragment'));
    expect(fragmentLines.length).toBe(3);

    // Check ordering
    const sharedIdx = input.indexOf('fragment shared on Type');
    const userIdx = input.indexOf('fragment user on User');
    const postIdx = input.indexOf('fragment post on Post');

    expect(sharedIdx).toBeLessThan(userIdx);
    expect(userIdx).toBeLessThan(postIdx);
  });
});
