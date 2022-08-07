import React from 'react';

import { getBlob } from '../../ipc/git/blob';

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
        <pre>{controller.state.blobContent}</pre>
      )}
    </React.Fragment>
  );
};

interface State {
  blobContent: string | undefined;
}
interface Controller {
  state: State;
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

  return {
    state: state,
  };
}
