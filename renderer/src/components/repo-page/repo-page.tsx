import { GitBranchIcon, HomeFillIcon } from '@primer/octicons-react';
import {
  ActionList,
  ActionMenu,
  Breadcrumbs,
  Header,
  PageLayout,
  StyledOcticon,
} from '@primer/react';
import classNames from 'classnames';
import React from 'react';

import { getAllBranches } from '../../ipc/git/branch';

import { BlobDetails } from './blob-details';
import { TreeDetails } from './tree-details';

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

      <PageLayout containerWidth="large">
        <PageLayout.Content>
          <div className={classNames('mb-3', 'd-flex', 'flex-items-center')}>
            <div>
              <ActionMenu>
                <ActionMenu.Button leadingIcon={GitBranchIcon}>
                  {controller.state.selectedBranch === undefined
                    ? 'Select Branch'
                    : controller.state.selectedBranch}
                </ActionMenu.Button>

                <ActionMenu.Overlay height="xsmall" sx={{ overflowY: 'auto' }}>
                  <ActionList selectionVariant="single">
                    {controller.state.branches.map((branch) => (
                      <ActionList.Item
                        key={branch}
                        selected={branch === controller.state.selectedBranch}
                        onSelect={(): void =>
                          controller.setSelectedBranch(branch)
                        }
                      >
                        {branch}
                      </ActionList.Item>
                    ))}
                  </ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
            </div>

            {controller.state.selectedPath.pathItems.length > 0 && (
              <div className={classNames('ml-2')}>
                <Breadcrumbs>
                  <Breadcrumbs.Item
                    sx={{ cursor: 'pointer' }}
                    onClick={(): void => controller.setSelectedPath([], 'tree')}
                  >
                    root
                  </Breadcrumbs.Item>

                  {controller.state.selectedPath.pathItems.map(
                    (item, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <React.Fragment key={index}>
                        {index ===
                        controller.state.selectedPath.pathItems.length - 1 ? (
                          <Breadcrumbs.Item selected>{item}</Breadcrumbs.Item>
                        ) : (
                          <Breadcrumbs.Item
                            sx={{ cursor: 'pointer' }}
                            onClick={(): void =>
                              controller.setSelectedPath(
                                controller.state.selectedPath.pathItems.slice(
                                  0,
                                  index + 1,
                                ),
                                'tree',
                              )
                            }
                          >
                            {item}
                          </Breadcrumbs.Item>
                        )}
                      </React.Fragment>
                    ),
                  )}
                </Breadcrumbs>
              </div>
            )}
          </div>

          {controller.state.selectedBranch !== undefined && (
            <React.Fragment>
              {controller.state.selectedPath.type === 'tree' && (
                <TreeDetails
                  repoRootPath={props.repoRootPath}
                  branch={controller.state.selectedBranch}
                  treePath={controller.state.selectedPath.pathItems}
                  selectChildTree={(childTreeName: string): void =>
                    controller.setSelectedPath(
                      [
                        ...controller.state.selectedPath.pathItems,
                        childTreeName,
                      ],
                      'tree',
                    )
                  }
                  selectChildBlob={(childBlobName: string): void =>
                    controller.setSelectedPath(
                      [
                        ...controller.state.selectedPath.pathItems,
                        childBlobName,
                      ],
                      'blob',
                    )
                  }
                />
              )}

              {controller.state.selectedPath.type === 'blob' && (
                <BlobDetails
                  repoRootPath={props.repoRootPath}
                  branch={controller.state.selectedBranch}
                  blobPath={controller.state.selectedPath.pathItems}
                />
              )}
            </React.Fragment>
          )}
        </PageLayout.Content>
      </PageLayout>
    </React.Fragment>
  );
};

interface Path {
  type: 'tree' | 'blob';
  pathItems: string[];
}
const ROOT_PATH: Path = {
  type: 'tree',
  pathItems: [],
};

interface State {
  branches: string[];
  selectedBranch: string | undefined;
  selectedPath: Path;
}
interface Controller {
  state: State;

  setSelectedBranch: (branch: string) => void;
  setSelectedPath: (fullPath: string[], itemType: 'tree' | 'blob') => void;
}
function useController(props: Props): Controller {
  const [state, setState] = React.useState<State>({
    branches: [],
    selectedBranch: undefined,
    selectedPath: ROOT_PATH,
  });

  // Whenever the selected path or branch changes, scroll the page to the top.
  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [state.selectedBranch, state.selectedPath]);

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

    setSelectedBranch: (branch): void => {
      setState((state) => ({
        ...state,
        selectedBranch: branch,
        selectedPath: ROOT_PATH,
      }));
    },

    setSelectedPath: (fullPath, itemType): void => {
      setState((state) => ({
        ...state,
        selectedPath: { pathItems: fullPath, type: itemType },
      }));
    },
  };
}
