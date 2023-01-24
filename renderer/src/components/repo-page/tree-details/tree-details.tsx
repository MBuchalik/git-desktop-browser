import { Box, Button } from '@primer/react';
import classNames from 'classnames';
import React from 'react';

import { TreeEntry, getTreeByPath } from '../../../ipc/git/tree';
import { History } from '../history';

import { TreeDetailsItem } from './tree-details-item';

interface Props {
  repoRootPath: string;
  branch: string;
  treePath: string[];

  selectChildTree: (childTreeName: string) => void;
  selectChildBlob: (childBlobName: string) => void;
}
export const TreeDetails: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      {controller.sortedTreeContent !== undefined && (
        <React.Fragment>
          <Box sx={{ display: 'flex', justifyContent: 'end', marginBottom: 2 }}>
            <Button onClick={(): void => controller.toggleShowHistory()}>
              {controller.state.showHistory ? 'Tree' : 'History'}
            </Button>
          </Box>

          {controller.state.showHistory && (
            <History
              repoRootPath={props.repoRootPath}
              commitIsh={props.branch}
              itemPath={props.treePath}
            />
          )}

          {!controller.state.showHistory && (
            <Box className={classNames('Box')}>
              {controller.sortedTreeContent.map((treeItem) => (
                <TreeDetailsItem
                  key={`${treeItem.hash}-${treeItem.name}`}
                  repoRootPath={props.repoRootPath}
                  branch={props.branch}
                  treeItem={treeItem}
                  treeItemPath={[...props.treePath, treeItem.name]}
                  onClick={(): void =>
                    treeItem.type === 'blob'
                      ? props.selectChildBlob(treeItem.name)
                      : props.selectChildTree(treeItem.name)
                  }
                />
              ))}
            </Box>
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

interface State {
  treeContent: TreeEntry[] | undefined;

  showHistory: boolean;
}
interface Controller {
  state: State;

  sortedTreeContent: TreeEntry[] | undefined;

  toggleShowHistory: () => void;
}
function useController(props: Props): Controller {
  const [state, setState] = React.useState<State>({
    treeContent: undefined,

    showHistory: false,
  });

  React.useEffect((): void => {
    void (async (): Promise<void> => {
      const treeFetchResult = await getTreeByPath({
        repoFolderPath: props.repoRootPath,
        commitIsh: props.branch,
        treePath: props.treePath,
      });
      if (!treeFetchResult.success) {
        return;
      }

      setState((state) => ({
        ...state,
        treeContent: treeFetchResult.data,
      }));
    })();
  }, [props.branch, props.repoRootPath, props.treePath]);

  const sortedTreeContent = React.useMemo((): TreeEntry[] | undefined => {
    if (!state.treeContent) {
      return undefined;
    }

    const treeContentCopy = [...state.treeContent];
    treeContentCopy.sort((a, b) => {
      if (a.type === 'tree' && b.type === 'blob') {
        return -1;
      }
      if (a.type === 'blob' && b.type === 'tree') {
        return 1;
      }

      return a.name.localeCompare(b.name);
    });

    return treeContentCopy;
  }, [state.treeContent]);

  return {
    state: state,

    sortedTreeContent: sortedTreeContent,

    toggleShowHistory: (): void => {
      setState((state) => ({ ...state, showHistory: !state.showHistory }));
    },
  };
}
