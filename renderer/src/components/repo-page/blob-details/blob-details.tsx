import { Box, Button } from '@primer/react';
import React from 'react';

import { getBlob } from '../../../ipc/git/blob';
import { merge } from '../../../utils/merge';
import { CodeViewer } from '../code-viewer';
import { History } from '../history';
import { useRepoServiceContext } from '../services/repo-service';

interface Props {
  blobPath: string[];
}
export const BlobDetails: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', justifyContent: 'end', marginBottom: 2 }}>
        <Button onClick={(): void => controller.toggleShowHistory()}>
          {controller.state.showHistory ? 'Code' : 'History'}
        </Button>
      </Box>

      {controller.state.showHistory && (
        <History
          itemPath={props.blobPath}
          leaveHistory={(): void => controller.toggleShowHistory()}
        />
      )}

      {!controller.state.showHistory &&
        controller.state.blobContent !== undefined && (
          <React.Fragment>
            {controller.isProbablyBinaryFile ? (
              <span>This seems to be a binary file.</span>
            ) : (
              <CodeViewer
                code={controller.state.blobContent}
                fileExtension={controller.fileExtension}
              />
            )}
          </React.Fragment>
        )}
    </React.Fragment>
  );
};

interface State {
  blobContent: string | undefined;

  showHistory: boolean;
}
interface Controller {
  state: State;

  isProbablyBinaryFile: boolean;
  /**
   * The file extension including a dot.
   */
  fileExtension: string | undefined;

  toggleShowHistory: () => void;
}
function useController(props: Props): Controller {
  const repoService = useRepoServiceContext();

  const [state, setState] = React.useState<State>({
    blobContent: undefined,

    showHistory: false,
  });

  React.useEffect((): void => {
    void (async (): Promise<void> => {
      const blobFetchResult = await getBlob({
        repoFolderPath: repoService.repoFolderPath,
        commitIsh: repoService.selectedCommitIsh,
        blobPath: props.blobPath,
      });
      if (!blobFetchResult.success) {
        return;
      }
      setState((state) => merge(state, { blobContent: blobFetchResult.data }));
    })();
  }, [
    props.blobPath,
    repoService.repoFolderPath,
    repoService.selectedCommitIsh,
  ]);

  const isProbablyBinaryFile = React.useMemo((): boolean => {
    if (state.blobContent === undefined) {
      return false;
    }

    if (!state.blobContent.includes('\0')) {
      return false;
    }

    return true;
  }, [state.blobContent]);

  const fileExtension = ((): string | undefined => {
    const lastPathItem = props.blobPath.at(-1);
    if (lastPathItem === undefined) {
      return undefined;
    }

    const splitName = lastPathItem.split('.');
    // We expect at least two items, because we want either a file like "foo.bar", or at least ".bar".
    if (splitName.length < 2) {
      return undefined;
    }

    const lastEntry = splitName.at(-1);

    // This should never be the case.
    if (lastEntry === undefined) {
      return undefined;
    }

    return '.' + lastEntry;
  })();

  return {
    state: state,

    isProbablyBinaryFile: isProbablyBinaryFile,
    fileExtension: fileExtension,

    toggleShowHistory: (): void => {
      setState((state) => merge(state, { showHistory: !state.showHistory }));
    },
  };
}
