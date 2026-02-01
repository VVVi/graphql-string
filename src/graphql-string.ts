interface GqlsOptions {
  normalize?: boolean;
}

interface FragmentStore {
  name: string;
  content: string;
  normalized: string;
}

function normalizeFragment(content: string): string {
  return content
    .replace(/\s+/g, ' ')
    .replace(/\{\s+/g, '{ ')
    .replace(/\s+\}/g, ' }')
    .replace(/\s+\(/g, '(')
    .replace(/\)\s+/g, ')')
    .trim();
}

function computeFragmentDiff(existingName: string, existingContent: string, newContent: string): string {
  const existingNorm = normalizeFragment(existingContent);
  const newNorm = normalizeFragment(newContent);

  if (existingNorm === newNorm) {
    return '';
  }

  return `Fragment "${existingName}" defined twice with different selection sets.\nExisting: ${existingNorm}\nNew: ${newNorm}`;
}

function gqlstr(options: GqlsOptions = {}) {
  return function (strings: TemplateStringsArray, ...params: string[]) {
    const fragments: Map<string, FragmentStore> = new Map();
    const fragmentOrder: string[] = [];
    let graphql = '';

    params.forEach((value) => {
      const currentFragmentName = value.match(/(?<=fragment\s+).*?(?=\s+.*)/gs);

      if (currentFragmentName) {
        const fragmentName = currentFragmentName[0];
        const normalized = normalizeFragment(value);

        if (fragments.has(fragmentName)) {
          const existing = fragments.get(fragmentName)!;
          if (existing.normalized !== normalized) {
            throw new Error(computeFragmentDiff(fragmentName, existing.content, value));
          }
        } else {
          fragments.set(fragmentName, {
            name: fragmentName,
            content: value,
            normalized: normalized,
          });
          fragmentOrder.push(fragmentName);
        }
      }
    });

    // Add fragments in stable order (first-seen)
    fragmentOrder.forEach((fragmentName) => {
      const fragment = fragments.get(fragmentName)!;
      const content = options.normalize ? fragment.normalized : fragment.content;
      graphql += `${content}\n`;
    });

    strings.forEach((value) => {
      graphql += value;
    });

    return graphql;
  };
}

const gqls = gqlstr();

export default gqls;
