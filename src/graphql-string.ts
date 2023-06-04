function gqlstr() {
  const fragmentNames: string[] = [];

  return function (strings: TemplateStringsArray, ...params: string[]) {
    let graphql = '';

    params.forEach((value) => {
      let fragment = '';

      const currentFragmentName = value.match(/(?<=fragment\s+).*?(?=\s+.*)/gs);

      if (currentFragmentName && !fragmentNames.includes(currentFragmentName[0])) {
        fragment = `${value}\n`;
        fragmentNames.push(currentFragmentName[0]);
      }

      graphql += fragment;
    });

    strings.forEach((value) => {
      graphql += value;
    });

    return graphql;
  };
}

const gqls = gqlstr();

export default gqls;
