import {
  FileDirectoryFillIcon,
  FileIcon,
  GitBranchIcon,
  HomeFillIcon,
} from '@primer/octicons-react';
import {
  ActionList,
  ActionMenu,
  Breadcrumbs,
  Header,
  Link,
  PageLayout,
  StyledOcticon,
} from '@primer/react';
import classNames from 'classnames';
import React from 'react';

import { getBlob } from '../../ipc/git/blob';
import { getAllBranches } from '../../ipc/git/branch';
import { TreeEntry, getTreeByPath } from '../../ipc/git/tree';

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
                    onClick={(): void => controller.selectParentPath([])}
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
                              controller.selectParentPath(
                                controller.state.selectedPath.pathItems.slice(
                                  0,
                                  index + 1,
                                ),
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

          {controller.sortedTreeContent !== undefined && (
            <div className={classNames('Box')}>
              {controller.sortedTreeContent.map((treeItem) => (
                <div
                  key={`${treeItem.hash}-${treeItem.name}`}
                  className={classNames(
                    'Box-row',
                    'py-2',
                    'd-flex',
                    'flex-items-center',
                  )}
                >
                  <div className={classNames('pr-2')}>
                    {treeItem.type === 'blob' ? (
                      <StyledOcticon icon={FileIcon} />
                    ) : (
                      <StyledOcticon
                        icon={FileDirectoryFillIcon}
                        color="accent.muted"
                      />
                    )}
                  </div>

                  <div>
                    <Link
                      as="button"
                      className={classNames('Link--primary')}
                      onClick={(): void =>
                        controller.selectChildTreeItem(treeItem)
                      }
                    >
                      {treeItem.name}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {controller.state.treeOrBlobContent?.type === 'blob' && (
            <pre>{controller.state.treeOrBlobContent.content}</pre>
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

type TreeOrBlobContent = TreeContent | BlobContent;
interface TreeContent {
  type: 'tree';
  content: TreeEntry[];
}
interface BlobContent {
  type: 'blob';
  content: string;
}

interface State {
  branches: string[];
  selectedBranch: string | undefined;
  selectedPath: Path;

  treeOrBlobContent: TreeOrBlobContent | undefined;
}
interface Controller {
  state: State;

  sortedTreeContent: TreeEntry[] | undefined;

  setSelectedBranch: (branch: string) => void;

  selectChildTreeItem: (childTreeItem: TreeEntry) => void;
  selectParentPath: (fullPath: string[]) => void;
}
function useController(props: Props): Controller {
  const [state, setState] = React.useState<State>({
    branches: [],
    selectedBranch: undefined,
    selectedPath: ROOT_PATH,
    treeOrBlobContent: undefined,
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

  React.useEffect((): void => {
    void (async (): Promise<void> => {
      if (state.selectedBranch === undefined) {
        return;
      }

      if (state.selectedPath.type === 'blob') {
        const blobFetchResult = await getBlob({
          repoFolderPath: props.repoRootPath,
          commitIsh: state.selectedBranch,
          blobPath: state.selectedPath.pathItems,
        });
        if (!blobFetchResult.success) {
          return;
        }
        setState((state) => ({
          ...state,
          treeOrBlobContent: { type: 'blob', content: blobFetchResult.data },
        }));
        return;
      }

      const treeFetchResult = await getTreeByPath({
        repoFolderPath: props.repoRootPath,
        commitIsh: state.selectedBranch,
        treePath: state.selectedPath.pathItems,
      });
      if (!treeFetchResult.success) {
        return;
      }

      setState((state) => ({
        ...state,
        treeOrBlobContent: { type: 'tree', content: treeFetchResult.data },
      }));
    })();
  }, [
    props.repoRootPath,
    state.selectedBranch,
    state.selectedPath.pathItems,
    state.selectedPath.type,
  ]);

  const sortedTreeContent = React.useMemo((): TreeEntry[] | undefined => {
    if (!state.treeOrBlobContent || state.treeOrBlobContent.type !== 'tree') {
      return undefined;
    }

    const treeContentCopy = [...state.treeOrBlobContent.content];
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
  }, [state.treeOrBlobContent]);

  return {
    state: state,

    sortedTreeContent: sortedTreeContent,

    setSelectedBranch: (branch): void => {
      setState((state) => ({
        ...state,
        selectedBranch: branch,
        selectedPath: ROOT_PATH,
      }));
    },

    selectChildTreeItem: (childTreeItem): void => {
      setState((state): State => {
        const newPath: Path = {
          type: childTreeItem.type,
          pathItems: [...state.selectedPath.pathItems, childTreeItem.name],
        };

        return { ...state, selectedPath: newPath };
      });
    },

    selectParentPath: (fullPath): void => {
      setState((state) => ({
        ...state,
        selectedPath: { type: 'tree', pathItems: fullPath },
      }));
    },
  };
}
