import { GitCommitIcon } from '@primer/octicons-react';
import { Box, StyledOcticon, Timeline } from '@primer/react';
import classNames from 'classnames';
import React from 'react';

import { ShortCommitDetails, getCommitHistory } from '../../../ipc/git/log';
import { useRepoServiceContext } from '../services/repo-service';

import { HistoryItem } from './history-item';

interface Props {
  itemPath: string[];

  leaveHistory: () => void;
}
export const History: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      {controller.state.commitHistory && (
        <Box>
          {Object.entries(controller.state.commitHistory).map(
            ([day, commits]) => (
              <Timeline.Item key={day}>
                <Timeline.Badge>
                  <StyledOcticon icon={GitCommitIcon} />
                </Timeline.Badge>

                <Timeline.Body>
                  <Box>{day}</Box>

                  <Box className={classNames('Box')} sx={{ marginTop: 4 }}>
                    {commits.map((singleCommit) => (
                      <HistoryItem
                        key={singleCommit.longCommitHash}
                        commit={singleCommit}
                        leaveHistory={(): void => props.leaveHistory()}
                      />
                    ))}
                  </Box>
                </Timeline.Body>
              </Timeline.Item>
            ),
          )}
        </Box>
      )}
    </React.Fragment>
  );
};

interface State {
  commitHistory: GroupedCommits | undefined;
}
interface Controller {
  state: State;
}
function useController(props: Props): Controller {
  const repoService = useRepoServiceContext();

  const [state, setState] = React.useState<State>({
    commitHistory: undefined,
  });

  React.useEffect(() => {
    void (async (): Promise<void> => {
      const commitHistoryFetchResult = await getCommitHistory({
        repoFolderPath: repoService.repoFolderPath,
        startCommitIsh: repoService.selectedCommitIsh,
        itemPath: props.itemPath,
      });

      if (!commitHistoryFetchResult.success) {
        return;
      }

      const groupedCommitHistory = groupCommitsByDay(
        commitHistoryFetchResult.data,
      );

      setState((state) => ({
        ...state,
        commitHistory: groupedCommitHistory,
      }));
    })();
  }, [
    props.itemPath,
    repoService.repoFolderPath,
    repoService.selectedCommitIsh,
  ]);

  return {
    state: state,
  };
}

/**
 * A map from human-readable day string to corresponding commits.
 */
type GroupedCommits = Record<string, ShortCommitDetails[]>;
function groupCommitsByDay(commits: ShortCommitDetails[]): GroupedCommits {
  const formatter = new Intl.DateTimeFormat('en', { dateStyle: 'long' });

  const result: GroupedCommits = {};

  for (const singleCommit of commits) {
    const dateString = formatter.format(
      new Date(singleCommit.authorDate * 1000),
    );

    let mapEntry = result[dateString];
    if (!mapEntry) {
      mapEntry = [];
      result[dateString] = mapEntry;
    }

    mapEntry.push(singleCommit);
  }

  return result;
}
