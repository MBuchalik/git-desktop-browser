import { Box, Link, RelativeTime } from '@primer/react';
import classNames from 'classnames';
import React from 'react';

import { ShortCommitDetails } from '../../../ipc/git/log';
import { CommitDetailsDialog } from '../commit-details-dialog';

interface Props {
  repoRootPath: string;

  commit: ShortCommitDetails;
}
export const HistoryItem: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <Box
      key={props.commit.longCommitHash}
      className={classNames('Box-row')}
      sx={{ paddingY: 2 }}
    >
      <Box>
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

      {controller.state.showCommitDetailsDialog && (
        <CommitDetailsDialog
          repoRootPath={props.repoRootPath}
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
}
function useController(props: Props): Controller {
  const [state, setState] = React.useState<State>({
    showCommitDetailsDialog: false,
  });

  return {
    state: state,

    setShowCommitDetailsDialog: (show): void => {
      setState((state) => ({ ...state, showCommitDetailsDialog: show }));
    },
  };
}
