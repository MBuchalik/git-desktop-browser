import { HomeFillIcon } from '@primer/octicons-react';
import {
  Box,
  Breadcrumbs,
  Header,
  PageLayout,
  StyledOcticon,
} from '@primer/react';
import React from 'react';

import { doesPathExist } from '../../ipc/git/show';

import { BlobDetails } from './blob-details';
import { CommitIshSelector } from './commitish-selector';
import { RepoServiceContextProvider } from './services/repo-service';
import { TreeDetails } from './tree-details';

interface Props {
  repoFolderPath: string;

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
          <Box sx={{ marginBottom: 3, display: 'flex', alignItems: 'center' }}>
            <Box>
              <CommitIshSelector
                repoRootPath={props.repoFolderPath}
                currentlySelectedCommitIsh={controller.state.selectedCommitIsh}
                selectCommitIsh={(commitIsh): void =>
                  controller.setSelectedCommitIsh(commitIsh)
                }
              />
            </Box>

            {controller.state.selectedPath.pathItems.length > 0 && (
              <Box sx={{ marginLeft: 2 }}>
                <Breadcrumbs>
                  <Breadcrumbs.Item
                    sx={{ cursor: 'pointer' }}
                    onClick={(): void => controller.setSelectedPath(ROOT_PATH)}
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
                              controller.setSelectedPath({
                                pathItems:
                                  controller.state.selectedPath.pathItems.slice(
                                    0,
                                    index + 1,
                                  ),
                                type: 'tree',
                              })
                            }
                          >
                            {item}
                          </Breadcrumbs.Item>
                        )}
                      </React.Fragment>
                    ),
                  )}
                </Breadcrumbs>
              </Box>
            )}
          </Box>

          {controller.state.selectedCommitIsh !== undefined && (
            <RepoServiceContextProvider
              repoFolderPath={props.repoFolderPath}
              selectedCommitIsh={controller.state.selectedCommitIsh}
              setSelectedCommitIsh={(commitIsh, navigateToRepoRoot): void => {
                controller.setSelectedCommitIsh(commitIsh);
                if (navigateToRepoRoot === true) {
                  controller.setSelectedPath(ROOT_PATH);
                }
              }}
            >
              {controller.state.selectedPath.type === 'tree' && (
                <TreeDetails
                  treePath={controller.state.selectedPath.pathItems}
                  selectChildTree={(childTreeName: string): void =>
                    controller.setSelectedPath({
                      pathItems: [
                        ...controller.state.selectedPath.pathItems,
                        childTreeName,
                      ],
                      type: 'tree',
                    })
                  }
                  selectChildBlob={(childBlobName: string): void =>
                    controller.setSelectedPath({
                      pathItems: [
                        ...controller.state.selectedPath.pathItems,
                        childBlobName,
                      ],
                      type: 'blob',
                    })
                  }
                />
              )}

              {controller.state.selectedPath.type === 'blob' && (
                <BlobDetails
                  blobPath={controller.state.selectedPath.pathItems}
                />
              )}
            </RepoServiceContextProvider>
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
  selectedCommitIsh: string | undefined;
  selectedPath: Path;
}
interface Controller {
  state: State;

  setSelectedCommitIsh: (commitIsh: string) => void;
  setSelectedPath: (path: Path) => void;
}
function useController(props: Props): Controller {
  const [state, setState] = React.useState<State>({
    selectedCommitIsh: undefined,
    selectedPath: ROOT_PATH,
  });

  // Whenever the selected path or branch changes, scroll the page to the top.
  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [state.selectedCommitIsh, state.selectedPath]);

  React.useEffect(() => {
    void (async (): Promise<void> => {
      if (state.selectedCommitIsh === undefined) {
        return;
      }
      const pathExistsResult = await doesPathExist({
        repoFolderPath: props.repoFolderPath,
        commitIsh: state.selectedCommitIsh,
        itemPath: state.selectedPath.pathItems,
      });

      if (!pathExistsResult.exists) {
        setState((state) => ({ ...state, selectedPath: ROOT_PATH }));
      }
    })();
  }, [
    props.repoFolderPath,
    state.selectedCommitIsh,
    state.selectedPath.pathItems,
  ]);

  return {
    state: state,

    setSelectedCommitIsh: (commitIsh): void => {
      setState((state) => ({
        ...state,
        selectedCommitIsh: commitIsh,
      }));
    },

    setSelectedPath: (path): void => {
      setState((state) => ({
        ...state,
        selectedPath: path,
      }));
    },
  };
}
