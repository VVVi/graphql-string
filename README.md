# graphql-string

Compose GraphQL operations as **strings** — with **automatic fragment deduplication**.

If you build queries by interpolating reusable fragments (especially across modules), you’ve probably hit this runtime error:

> `There can be only one fragment named "..."`

`graphql-string` solves it by producing a single final query string where every fragment definition appears **once**.

---

## Why this exists

Many GraphQL clients accept a **plain string** (e.g. `fetch`, `graphql-request`, server-to-server calls).  
But plain strings don’t help you manage fragments:

- You want to reuse fragments across files
- You want to compose queries with template literals
- You accidentally include the same fragment definition multiple times
- Your request fails at runtime

`graphql-string` lets you keep the *string workflow* while making fragment reuse safe.

---

## Install

```bash
npm i graphql-string
# or
pnpm add graphql-string
# or
yarn add graphql-string
````

---

## Quick start

Create reusable fragments:

```ts
// fragments/user.ts
import { gqls } from "graphql-string";

export const UserFields = gqls`
  fragment UserFields on User {
    id
    email
    name
  }
`;
```

Compose them into operations without worrying about duplicates:

```ts
// queries/getMe.ts
import { gqls } from "graphql-string";
import { UserFields } from "../fragments/user";

export const GetMe = gqls`
  query GetMe {
    me {
      ...UserFields
    }
  }

  ${UserFields}
`;
```

If `UserFields` is interpolated multiple times (directly or indirectly), it will still appear **once** in the final output.

---

## Example: the problem it fixes

Without dedupe, it’s easy to accidentally ship this:

```graphql
query GetMe { me { ...UserFields } }

fragment UserFields on User { id email name }

fragment UserFields on User { id email name } # ← duplicated
```

With `gqls`, duplicates are removed and you get a valid query string.

---

## Usage with `fetch` (Next.js / Node)

```ts
import { GetMe } from "./queries/getMe";

const res = await fetch("https://api.example.com/graphql", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    query: GetMe,        
    variables: {},
  }),
});

const json = await res.json();
```

---

## Usage with `graphql-request`

```ts
import { GraphQLClient } from "graphql-request";
import { GetMe } from "./queries/getMe";

const client = new GraphQLClient("https://api.example.com/graphql");

const data = await client.request(GetMe, {});
```

---

## API

### `gqls\`...``

A tagged template that returns a **string**.

* Keeps your composed template literal structure
* Removes **duplicate fragment definitions** in the final output
* Intended for GraphQL operations sent as raw strings

```ts
import { gqls } from "graphql-string";

const Frag = gqls`
  fragment A on User { id }
`;

const Query = gqls`
  query Q { me { ...A } }
  ${Frag}
`;
```

`typeof Query === "string"`.

---

## Guarantees

* **String in → string out**
* **Stable output**: fragments are emitted once (first-seen)
* **Safe reuse**: the same fragment may be interpolated multiple times without breaking the request

> Note: If you define the **same fragment name** with **different bodies**, your GraphQL server will treat it as an error.
> (Recommended improvement for this project: detect and throw early — PRs welcome.)

---

## When not to use

Use something else if you need AST-level tooling:

* validation, linting, formatting
* persisted queries / GraphQL compiler workflows
* schema-aware transformations

In those cases, `graphql-tag` + AST workflows may be a better fit.

---

## Contributing

Issues and PRs are welcome:

* fragment name conflict detection (same name, different body)
* more test cases (nested fragments, multiple operations, comments/whitespace)
* examples (Next.js, Remix, Nuxt, Apollo, etc.)

---

## License

MIT
