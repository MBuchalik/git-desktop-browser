import { GitBranchIcon, TriangleDownIcon } from '@primer/octicons-react';
import {
  ActionList,
  AnchoredOverlay,
  Box,
  Button,
  Flash,
  TabNav,
} from '@primer/react';
import React from 'react';

import { getAllBranches } from '../../ipc/git/branch';
import { getAllTags } from '../../ipc/git/tag';

enum MenuTab {
  Branches,
  Tags,
}

interface Props {
  repoRootPath: string;

  currentlySelectedCommitIsh: string | undefined;

  selectCommitIsh: (commitIsh: string) => void;
}
export const CommitIshSelector: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <AnchoredOverlay
      renderAnchor={(anchorProps): React.ReactElement => (
        <Button
          {...anchorProps}
          leadingIcon={GitBranchIcon}
          trailingIcon={TriangleDownIcon}
        >
          {props.currentlySelectedCommitIsh ?? 'Select a branch or tag'}
        </Button>
      )}
      open={controller.state.isMenuOpen}
      onOpen={(): void => controller.setIsMenuOpen(true)}
      onClose={(): void => controller.setIsMenuOpen(false)}
    >
      {controller.currentCommitIshList && (
        <Box sx={{ width: '300px' }}>
          <TabNav sx={{ marginTop: 2 }}>
            <TabNav.Link
              as="button"
              sx={{
                fontSize: '0.8rem',
                lineHeight: '10px',
                marginLeft: 2,
                paddingX: 3,
              }}
              selected={controller.state.activeMenuTab === MenuTab.Branches}
              onClick={(): void =>
                controller.setActiveMenuTab(MenuTab.Branches)
              }
            >
              Branches
            </TabNav.Link>
            <TabNav.Link
              as="button"
              sx={{
                padding: 1,
                fontSize: '0.8rem',
                lineHeight: '10px',
                paddingX: 3,
              }}
              selected={controller.state.activeMenuTab === MenuTab.Tags}
              onClick={(): void => controller.setActiveMenuTab(MenuTab.Tags)}
            >
              Tags
            </TabNav.Link>
          </TabNav>

          {controller.currentCommitIshList.length < 1 && (
            <Flash sx={{ margin: 4, padding: 2 }}>
              {controller.state.activeMenuTab === MenuTab.Branches
                ? 'No branches found'
                : 'No tags found'}
            </Flash>
          )}

          {controller.currentCommitIshList.length > 0 && (
            <ActionList selectionVariant="single">
              {controller.currentCommitIshList.map((commitIsh) => (
                <ActionList.Item
                  key={commitIsh}
                  selected={commitIsh === props.currentlySelectedCommitIsh}
                  onSelect={(): void => {
                    props.selectCommitIsh(commitIsh);
                    controller.setIsMenuOpen(false);
                  }}
                >
                  {commitIsh}
                </ActionList.Item>
              ))}
            </ActionList>
          )}
        </Box>
      )}
    </AnchoredOverlay>
  );
};

interface BranchesAndTags {
  branches: string[];
  tags: string[];
}
interface State {
  branchesAndTags: BranchesAndTags | undefined;

  isMenuOpen: boolean;

  activeMenuTab: MenuTab;
}
interface Controller {
  state: State;

  currentCommitIshList: string[] | undefined;

  setIsMenuOpen: (isOpen: boolean) => void;

  setActiveMenuTab: (menuTab: MenuTab) => void;
}
function useController(props: Props): Controller {
  const [state, setState] = React.useState<State>({
    branchesAndTags: undefined,

    isMenuOpen: false,

    activeMenuTab: MenuTab.Branches,
  });

  React.useEffect((): void => {
    void (async (): Promise<void> => {
      const branchesFetchResult = await getAllBranches(props.repoRootPath);
      if (!branchesFetchResult.success) {
        return;
      }

      const tagsFetchResult = await getAllTags(props.repoRootPath);
      if (!tagsFetchResult.success) {
        return;
      }

      setState((state) => ({
        ...state,
        branchesAndTags: {
          branches: branchesFetchResult.data,
          tags: tagsFetchResult.data,
        },
      }));
    })();
  }, [props.repoRootPath]);

  React.useEffect(() => {
    if (!state.branchesAndTags) {
      return;
    }

    // This is a pretty hacky solution: We want to be able to display content by default, so we try to guess a default branch and if it exists, we behave as if the user has manually selected this branch.

    if (props.currentlySelectedCommitIsh !== undefined) {
      return;
    }

    const probablyDefaultBranchNames = ['main', 'master'];
    for (const singleBranchName of probablyDefaultBranchNames) {
      if (state.branchesAndTags.branches.includes(singleBranchName)) {
        props.selectCommitIsh(singleBranchName);
        return;
      }
    }
  }, [props, state.branchesAndTags]);

  const currentCommitIshList =
    state.activeMenuTab === MenuTab.Tags
      ? state.branchesAndTags?.tags
      : state.branchesAndTags?.branches;

  return {
    state: state,

    currentCommitIshList: currentCommitIshList,

    setIsMenuOpen: (isOpen): void => {
      setState((state) => ({ ...state, isMenuOpen: isOpen }));
    },

    setActiveMenuTab: (menuTab): void => {
      setState((state) => ({ ...state, activeMenuTab: menuTab }));
    },
  };
}
