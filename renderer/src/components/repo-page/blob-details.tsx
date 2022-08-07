import React from 'react';

import { getBlob } from '../../ipc/git/blob';

import { CodeViewer } from './code-viewer';

interface Props {
  repoRootPath: string;
  branch: string;
  blobPath: string[];
}
export const BlobDetails: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <React.Fragment>
      {controller.state.blobContent !== undefined && (
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
}
interface Controller {
  state: State;

  isProbablyBinaryFile: boolean;
  /**
   * The file extension including a dot.
   */
  fileExtension: string | undefined;
}
function useController(props: Props): Controller {
  const [state, setState] = React.useState<State>({
    blobContent: undefined,
  });

  React.useEffect((): void => {
    void (async (): Promise<void> => {
      const blobFetchResult = await getBlob({
        repoFolderPath: props.repoRootPath,
        commitIsh: props.branch,
        blobPath: props.blobPath,
      });
      if (!blobFetchResult.success) {
        return;
      }
      setState((state) => ({
        ...state,
        blobContent: blobFetchResult.data,
      }));
    })();
  }, [props.blobPath, props.branch, props.repoRootPath]);

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
  };
}
