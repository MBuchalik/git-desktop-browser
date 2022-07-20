import { GitBranchIcon, HomeFillIcon } from '@primer/octicons-react';
import { ActionList, ActionMenu, Header, StyledOcticon } from '@primer/react';
import React from 'react';

import { getAllBranches } from '../../ipc/git/branch';

interface Props {
  repoRootPath: string;

  close: () => void;
}
export const RepoPage: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      <Header>
        <Header.Item>
          <Header.Link onClick={(): void => props.close()}>
            <StyledOcticon icon={HomeFillIcon} />
          </Header.Link>
        </Header.Item>
      </Header>

      <div>
        <ActionMenu>
          <ActionMenu.Button leadingIcon={GitBranchIcon}>
            Select Branch
          </ActionMenu.Button>

          <ActionMenu.Overlay height="xsmall" sx={{ overflowY: 'auto' }}>
            <ActionList>
              {controller.state.branches.map((branch) => (
                <ActionList.Item key={branch}>{branch}</ActionList.Item>
              ))}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </div>
    </React.Fragment>
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
