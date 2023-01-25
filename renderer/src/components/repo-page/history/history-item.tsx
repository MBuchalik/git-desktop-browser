import { SearchIcon } from '@primer/octicons-react';
import { Box, IconButton, Link, RelativeTime, Tooltip } from '@primer/react';
import classNames from 'classnames';
import React from 'react';

import { ShortCommitDetails } from '../../../ipc/git/log';
import { CommitDetailsDialog } from '../commit-details-dialog';
import { useRepoServiceContext } from '../services/repo-service';

interface Props {
  commit: ShortCommitDetails;

  leaveHistory: () => void;
}
export const HistoryItem: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <Box
      key={props.commit.longCommitHash}
      className={classNames('Box-row')}
      sx={{ paddingY: 2 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Box>
            <Link
              as="button"
              className={classNames('Link--primary')}
              sx={{ fontWeight: 'bold' }}
              onClick={(): void => controller.setShowCommitDetailsDialog(true)}
            >
              {props.commit.subject}
            </Link>
          </Box>

          <Box>
            {props.commit.authorEmail} committed{' '}
            <RelativeTime
              date={new Date(props.commit.authorDate * 1000)}
              format="relative"
              tense="past"
            />
          </Box>
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          <Tooltip aria-label="Browse repository at this commit" direction="nw">
            <IconButton
              aria-label="Browse repository at this commit"
              icon={SearchIcon}
              onClick={(): void => controller.browseRepositoryAtThisCommit()}
            />
          </Tooltip>
        </Box>
      </Box>

      {controller.state.showCommitDetailsDialog && (
        <CommitDetailsDialog
          commitIsh={props.commit.longCommitHash}
          hide={(): void => controller.setShowCommitDetailsDialog(false)}
        />
      )}
    </Box>
  );
};

interface State {
  showCommitDetailsDialog: boolean;
}
interface Controller {
  state: State;

  setShowCommitDetailsDialog: (show: boolean) => void;

  browseRepositoryAtThisCommit: () => void;
}
function useController(props: Props): Controller {
  const repoService = useRepoServiceContext();

  const [state, setState] = React.useState<State>({
    showCommitDetailsDialog: false,
  });

  return {
    state: state,

    setShowCommitDetailsDialog: (show): void => {
      setState((state) => ({ ...state, showCommitDetailsDialog: show }));
    },

    browseRepositoryAtThisCommit: (): void => {
      props.leaveHistory();
      repoService.setSelectedCommitIsh(props.commit.shortCommitHash, true);
    },
  };
}
