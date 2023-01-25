import { FileDirectoryFillIcon, FileIcon } from '@primer/octicons-react';
import { Box, Link, RelativeTime, StyledOcticon } from '@primer/react';
import classNames from 'classnames';
import React from 'react';

import {
  ShortCommitDetails,
  getLastAffectingCommit,
} from '../../../ipc/git/log';
import { TreeEntry } from '../../../ipc/git/tree';
import { CommitDetailsDialog } from '../commit-details-dialog';
import { useRepoServiceContext } from '../services/repo-service';

interface Props {
  treeItem: TreeEntry;
  treeItemPath: string[];

  onClick: () => void;
}
export const TreeDetailsItem: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      <Box
        key={`${props.treeItem.hash}-${props.treeItem.name}`}
        sx={{
          paddingY: 2,
          display: 'flex',
          alignItems: 'center',
        }}
        className={classNames('Box-row')}
      >
        <Box sx={{ paddingRight: 3 }}>
          {props.treeItem.type === 'blob' ? (
            <StyledOcticon icon={FileIcon} color="fg.muted" />
          ) : (
            <StyledOcticon
              icon={FileDirectoryFillIcon}
              sx={{ color: 'var(--color-scale-blue-3)' }}
            />
          )}
        </Box>

        <Box
          sx={{
            width: '250px',
            marginRight: 4,
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <Link
            as="button"
            className={classNames('Link--primary')}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
            onClick={(): void => props.onClick()}
          >
            {props.treeItem.name}
          </Link>
        </Box>

        {controller.state.commitDetails && (
          <React.Fragment>
            <Box
              sx={{
                flexGrow: 1,
                overflow: 'hidden',
                marginRight: 4,
              }}
            >
              <Link
                as="button"
                className={classNames('Link--primary')}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                }}
                onClick={(): void =>
                  controller.setShowCommitDetailsDialog(true)
                }
              >
                <span>{controller.state.commitDetails.subject}</span>
              </Link>
            </Box>

            <Box sx={{ flexGrow: 0, flexShrink: 0 }}>
              <RelativeTime
                date={
                  new Date(controller.state.commitDetails.authorDate * 1000)
                }
                format="relative"
                tense="past"
              />
            </Box>
          </React.Fragment>
        )}
      </Box>

      {controller.state.commitDetails &&
        controller.state.showCommitDetailsDialog && (
          <CommitDetailsDialog
            commitIsh={controller.state.commitDetails.longCommitHash}
            hide={(): void => controller.setShowCommitDetailsDialog(false)}
          />
        )}
    </React.Fragment>
  );
};

interface State {
  commitDetails: ShortCommitDetails | undefined;

  showCommitDetailsDialog: boolean;
}
interface Controller {
  state: State;

  setShowCommitDetailsDialog: (show: boolean) => void;
}
function useController(props: Props): Controller {
  const repoService = useRepoServiceContext();

  const [state, setState] = React.useState<State>({
    commitDetails: undefined,

    showCommitDetailsDialog: false,
  });

  React.useEffect(() => {
    void (async (): Promise<void> => {
      const commitFetchResult = await getLastAffectingCommit({
        repoFolderPath: repoService.repoFolderPath,
        itemPath: props.treeItemPath,
        startCommitIsh: repoService.selectedCommitIsh,
      });

      if (!commitFetchResult.success) {
        return;
      }

      setState((state) => ({
        ...state,
        commitDetails: commitFetchResult.data,
      }));
    })();
  }, [
    props.treeItemPath,
    repoService.repoFolderPath,
    repoService.selectedCommitIsh,
  ]);

  return {
    state: state,

    setShowCommitDetailsDialog: (show): void => {
      setState((state) => ({ ...state, showCommitDetailsDialog: show }));
    },
  };
}
