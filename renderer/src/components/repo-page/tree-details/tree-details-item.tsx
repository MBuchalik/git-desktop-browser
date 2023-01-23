import { FileDirectoryFillIcon, FileIcon } from '@primer/octicons-react';
import { Box, Link, StyledOcticon } from '@primer/react';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import React from 'react';

import {
  ShortCommitDetails,
  getLastAffectingCommit,
} from '../../../ipc/git/log';
import { TreeEntry } from '../../../ipc/git/tree';

interface Props {
  repoRootPath: string;
  branch: string;

  treeItem: TreeEntry;
  treeItemPath: string[];

  onClick: () => void;
}
export const TreeDetailsItem: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
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
            >
              <span>{controller.state.commitDetails.subject}</span>
            </Link>
          </Box>

          <Box sx={{ flexGrow: 0, flexShrink: 0 }}>
            {formatTime(controller.state.commitDetails.authorDate)}
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
};

interface State {
  commitDetails: ShortCommitDetails | undefined;
}
interface Controller {
  state: State;
}
function useController(props: Props): Controller {
  const [state, setState] = React.useState<State>({
    commitDetails: undefined,
  });

  React.useEffect(() => {
    void (async (): Promise<void> => {
      const commitFetchResult = await getLastAffectingCommit({
        repoFolderPath: props.repoRootPath,
        itemPath: props.treeItemPath,
        startCommitIsh: props.branch,
      });

      if (!commitFetchResult.success) {
        return;
      }

      setState((state) => ({
        ...state,
        commitDetails: commitFetchResult.data,
      }));
    })();
  }, [props.branch, props.repoRootPath, props.treeItemPath]);

  return {
    state: state,
  };
}

function formatTime(timeStamp: number): string {
  const dateTime = DateTime.fromSeconds(timeStamp);

  return dateTime.toRelative({ locale: 'en' }) ?? '';
}
