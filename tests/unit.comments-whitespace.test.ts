import gqls from '../src/graphql-string';

describe('comments & whitespace edge-cases', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('fragment with comments', () => {
    const input = gqls`# This is a comment
fragment userFields on User {
  # User id field
  id
  # User name field
  name
}

query GetUser {
  user {
    ...userFields
  }
}`;

    const output = `# This is a comment
fragment userFields on User {
  # User id field
  id
  # User name field
  name
}

query GetUser {
  user {
    ...userFields
  }
}`;

    expect(input).toEqual(output);
  });

  it('fragment with excessive whitespace', () => {
    const input = gqls`

fragment   spaced   on  Type  {
  field1
  
  
  field2
}


query   Test   {
  test   {
    ...spaced
  }
}

`;

    const output = `

fragment   spaced   on  Type  {
  field1
  
  
  field2
}


query   Test   {
  test   {
    ...spaced
  }
}

`;

    expect(input).toEqual(output);
  });

  it('fragment name with underscores and numbers', () => {
    const fragment1 = gqls`fragment User_Fields_1 on User {
      id
      name
    }`;

    const input = gqls`${fragment1}
query {
  user {
    ...User_Fields_1
  }
}`;

    const output = `fragment User_Fields_1 on User {
      id
      name
    }

query {
  user {
    ...User_Fields_1
  }
}`;

    expect(input).toEqual(output);
  });

  it('multiline strings with tabs and spaces mixed', () => {
    const fragment = gqls`fragment	tabbed	on	Type	{
	id
        name
	  mixed
}`;

    const input = gqls`${fragment}
query {
  data {
    ...tabbed
  }
}`;

    const output = `fragment	tabbed	on	Type	{
	id
        name
	  mixed
}

query {
  data {
    ...tabbed
  }
}`;

    expect(input).toEqual(output);
  });

  it('inline comments with fragments', () => {
    const fragment = gqls`fragment UserInfo on User { id name } # end of fragment`;

    const input = gqls`${fragment}
query {
  user {
    ...UserInfo
  }
}`;

    const output = `fragment UserInfo on User { id name } # end of fragment

query {
  user {
    ...UserInfo
  }
}`;

    expect(input).toEqual(output);
  });

  it('fragment with trailing commas and special formatting', () => {
    const fragment = gqls`fragment formatted on Type {
  field1,
  field2,
}`;

    const input = gqls`${fragment}
{
  test {
    ...formatted
  }
}`;

    const output = `fragment formatted on Type {
  field1,
  field2,
}

{
  test {
    ...formatted
  }
}`;

    expect(input).toEqual(output);
  });
});
