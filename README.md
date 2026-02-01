# graphql-string

Compose GraphQL operations as **plain strings** — with **automatic fragment deduplication**.

If you build GraphQL requests by interpolating reusable fragments (often across modules), you’ve probably seen this runtime error:

> `There can be only one fragment named "..."`

`graphql-string` prevents that by producing one final query string where each fragment definition appears **only once**.

---

## Key features

- **Tiny & fast** — minimal work at runtime.
- **Zero dependencies** — no external runtime packages.
- **String-in / string-out** — returns a `string` you can send directly to any GraphQL endpoint.
- **No GraphQL parser / no AST** — does _not_ parse documents into GraphQL AST.
- **No `graphql-tag` needed** — keep the "template literal as a string" workflow.
- **Fragment deduplication** — repeated fragment definitions are emitted once (first-seen).
- **Conflict detection** — detects when the same fragment name is defined with different content and throws a clear error.
- **Deterministic ordering** — fragments are always emitted in first-seen order, ensuring consistent, reproducible output.
- **Whitespace normalization** — internally normalizes whitespace for accurate conflict detection, while preserving original formatting in output.
- **Works everywhere** — Node, serverless, Next.js `fetch`, simple scripts, server-to-server calls.

---

## Install

```bash
npm i graphql-string
# or
pnpm add graphql-string
# or
yarn add graphql-string
```

---

## Example

Create a fragment:

```ts
// fragments/user.ts
import gqls from 'graphql-string';

export const UserFields = gqls`
  fragment UserFields on User {
    id
    email
    name
  }
`;
```

Compose an operation:

```ts
// queries/getMe.ts
import gqls from 'graphql-string';
import { UserFields } from '../fragments/user';

export const GetMe = gqls`
  query GetMe {
    me {
      ...UserFields
    }
  }

  ${UserFields}
`;
```

Even if `UserFields` is interpolated multiple times (directly or indirectly), it will appear **once** in the final output.

---

## What it fixes (the real-world problem)

Without dedupe, it’s easy to accidentally produce:

```graphql
query GetMe {
  me {
    ...UserFields
  }
}

fragment UserFields on User {
  id
  email
  name
}

fragment UserFields on User {
  id
  email
  name
} # ← duplicated
```

GraphQL servers reject that document. With `gqls`, duplicate fragment definitions are removed.

---

## Usage

### API: `gqls\`...``

`gqls` is a **tagged template** that returns a **string**.

```ts
import gqls from 'graphql-string';

const Frag = gqls`
  fragment A on User {
    id
  }
`;

const Query = gqls`
  query Q {
    me {
      ...A
    }
  }

  ${Frag}
`;

console.log(typeof Query); // "string"
```

---

## Using with `fetch` (Node / Next.js)

```ts
import { GetMe } from './queries/getMe';

const res = await fetch('https://api.example.com/graphql', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    query: GetMe,
    variables: {},
  }),
});

const json = await res.json();
```

---

## Multiple fragments (and nested reuse)

```ts
import gqls from 'graphql-string';

const NameFields = gqls`
  fragment NameFields on User {
    id
    name
  }
`;

const UserCardFields = gqls`
  fragment UserCardFields on User {
    ...NameFields
    avatarUrl
  }

  ${NameFields}
`;

const Query = gqls`
  query Users {
    users {
      ...UserCardFields
    }
  }

  ${UserCardFields}
  ${NameFields}  # safe even if added again
`;
```

---

## Guarantees

- **String-in → string-out** — always returns a plain string
- **Stable output** — each fragment definition is emitted exactly once, in first-seen order
- **Safe reuse** — you can interpolate the same fragment multiple times without issues
- **Conflict detection** — throws a descriptive error if the same fragment name is defined with different content (with whitespace normalization for accurate comparison)
- **Deterministic ordering** — fragments appear in consistent order across calls, making output reproducible and cache-friendly

---

## Advanced features

### Conflict Detection

If two fragments share the **same name** but have **different definitions**, `graphql-string` will throw a descriptive error:

```ts
const frag1 = `fragment User on User { id name }`;
const frag2 = `fragment User on User { id email age }`; // different!

const query = gqls`
  ${frag1}
  ${frag2}  // ← throws error
  { me { ...User } }
`;
// Error: Fragment "User" defined twice with different selection sets.
// Existing: fragment User on User { id name }
// New: fragment User on User { id email age }
```

**Whitespace is normalized** for comparison, so these are treated as identical:

```ts
const a = `fragment User on User { id }`;
const b = `fragment User on User {  id  }`; // same after normalization
gqls`${a}${b} { ... }`; // ✓ no conflict
```

### Deterministic Ordering

Fragments are always emitted in **first-seen order**, ensuring consistent output:

```ts
const frag1 = `fragment A on T { id }`;
const frag2 = `fragment B on T { name }`;
const frag3 = `fragment C on T { value }`;

const query = gqls`
  ${frag1}
  ${frag2}
  ${frag3}
  { data { ...A ...B ...C } }
`;

// Output fragments always in order: A, B, C
// even if interpolated in different order elsewhere
```

---

## Important notes & limitations

### This is not an AST tool

Use something else if you need schema-aware tooling like:

- validation / linting
- formatting
- persisted query compilation
- advanced transforms

In those workflows, AST-based approaches (e.g. `graphql-tag` + printers / compilers) are usually a better fit.

---

## Contributing

PRs and issues are welcome. High-impact additions:

- Detect and throw on **fragment name conflicts** (same name, different body)
- Examples for popular setups:
  - Next.js App Router
  - Remix
  - server-to-server scripts

---

## License

MIT
