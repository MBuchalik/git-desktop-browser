import React from 'react';

import { getAllBranches } from '../../ipc/git/branch';

interface Props {
  repoRootPath: string;

  close: () => void;
}
export const RepoPage: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <div>
      Repo Page
      <button type="button" onClick={(): void => props.close()}>
        Close
      </button>
      {controller.state.branches.map((branch) => (
        <span key={branch}>{branch}</span>
      ))}
    </div>
  );
};

interface State {
  branches: string[];
}
interface Controller {
  state: State;
}
function useController(props: Props): Controller {
  const [state, setState] = React.useState<State>({
    branches: [],
  });

  React.useEffect((): void => {
    void (async (): Promise<void> => {
      const branchesFetchResult = await getAllBranches(props.repoRootPath);
      if (!branchesFetchResult.success) {
        return;
      }

      setState((state) => ({ ...state, branches: branchesFetchResult.data }));
    })();
  }, [props.repoRootPath]);

  return {
    state: state,
  };
}
