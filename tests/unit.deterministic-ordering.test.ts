import gqls from '../src/graphql-string';

describe('deterministic ordering', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('fragments are emitted in first-seen order', () => {
    const frag1 = gqls`fragment first on Type { id }`;
    const frag2 = gqls`fragment second on Type { name }`;
    const frag3 = gqls`fragment third on Type { value }`;

    const input = gqls`${frag1}
${frag2}
${frag3}
{
  data {
    ...first
    ...second
    ...third
  }
}`;

    const firstIndex = input.indexOf('fragment first on Type');
    const secondIndex = input.indexOf('fragment second on Type');
    const thirdIndex = input.indexOf('fragment third on Type');

    expect(firstIndex).toBeLessThan(secondIndex);
    expect(secondIndex).toBeLessThan(thirdIndex);
  });

  it('maintains order even with duplicates', () => {
    const frag1 = gqls`fragment a on Type { id }`;
    const frag2 = gqls`fragment b on Type { name }`;
    const frag3 = gqls`fragment c on Type { value }`;

    const input = gqls`${frag1}
${frag2}
${frag1}
${frag3}
${frag2}
{
  data {
    ...a
    ...b
    ...c
  }
}`;

    const aIndex = input.indexOf('fragment a on Type');
    const bIndex = input.indexOf('fragment b on Type');
    const cIndex = input.indexOf('fragment c on Type');

    expect(aIndex).toBeLessThan(bIndex);
    expect(bIndex).toBeLessThan(cIndex);
  });

  it('consistent output across multiple calls with same order', () => {
    const frag1 = gqls`fragment x on T { id }`;
    const frag2 = gqls`fragment y on T { name }`;

    const output1 = gqls`${frag1}
${frag2}
{ d { ...x ...y } }`;

    // Reset for new instance
    const frag1b = gqls`fragment x on T { id }`;
    const frag2b = gqls`fragment y on T { name }`;

    const output2 = gqls`${frag1b}
${frag2b}
{ d { ...x ...y } }`;

    expect(output1).toEqual(output2);
  });

  it('reverse order produces different output', () => {
    const frag1 = gqls`fragment a on T { id }`;
    const frag2 = gqls`fragment b on T { name }`;

    const output1 = gqls`${frag1}${frag2}{ d { ...a ...b } }`;

    const frag1c = gqls`fragment a on T { id }`;
    const frag2c = gqls`fragment b on T { name }`;

    const output2 = gqls`${frag2c}${frag1c}{ d { ...a ...b } }`;

    // Fragments appear in different order
    const output1FirstIndex = output1.indexOf('fragment a on T');
    const output2FirstIndex = output2.indexOf('fragment a on T');

    expect(output1FirstIndex).toBeLessThan(output1.indexOf('fragment b on T'));
    expect(output2FirstIndex).toBeGreaterThan(output2.indexOf('fragment b on T'));
  });

  it('multiple fragments maintain stable order', () => {
    const fragments = [
      gqls`fragment f1 on T { a }`,
      gqls`fragment f2 on T { b }`,
      gqls`fragment f3 on T { c }`,
      gqls`fragment f4 on T { d }`,
      gqls`fragment f5 on T { e }`,
    ];

    const input = gqls`${fragments[0]}
${fragments[1]}
${fragments[2]}
${fragments[3]}
${fragments[4]}
{ data { ...f1 ...f2 ...f3 ...f4 ...f5 } }`;

    const indices = [
      input.indexOf('fragment f1 on T'),
      input.indexOf('fragment f2 on T'),
      input.indexOf('fragment f3 on T'),
      input.indexOf('fragment f4 on T'),
      input.indexOf('fragment f5 on T'),
    ];

    for (let i = 0; i < indices.length - 1; i++) {
      expect(indices[i]).toBeLessThan(indices[i + 1]);
    }
  });
});
