import gqls from '../src/graphql-string';

describe('multiple operations per document', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('query and mutation in same document', () => {
    const userFragment = gqls`fragment userFields on User {
      id
      name
      email
    }`;

    const input = gqls`${userFragment}
query GetUser {
  user(id: 1) {
    ...userFields
  }
}

mutation UpdateUser {
  updateUser(id: 1, name: "John") {
    ...userFields
  }
}`;

    const output = `fragment userFields on User {
      id
      name
      email
    }

query GetUser {
  user(id: 1) {
    ...userFields
  }
}

mutation UpdateUser {
  updateUser(id: 1, name: "John") {
    ...userFields
  }
}`;

    expect(input).toEqual(output);
  });

  it('multiple queries with shared fragment', () => {
    const sharedFields = gqls`fragment shared on Type {
      id
      name
    }`;

    const input = gqls`${sharedFields}
query First {
  first {
    ...shared
  }
}

query Second {
  second {
    ...shared
  }
}`;

    const output = `fragment shared on Type {
      id
      name
    }

query First {
  first {
    ...shared
  }
}

query Second {
  second {
    ...shared
  }
}`;

    expect(input).toEqual(output);
  });

  it('query, mutation, and subscription together', () => {
    const dataFragment = gqls`fragment data on Data {
      id
      value
    }`;

    const input = gqls`${dataFragment}
query GetData {
  getData {
    ...data
  }
}

mutation SetData {
  setData(value: "test") {
    ...data
  }
}

subscription OnDataChange {
  onDataChange {
    ...data
  }
}`;

    const output = `fragment data on Data {
      id
      value
    }

query GetData {
  getData {
    ...data
  }
}

mutation SetData {
  setData(value: "test") {
    ...data
  }
}

subscription OnDataChange {
  onDataChange {
    ...data
  }
}`;

    expect(input).toEqual(output);
  });
});
