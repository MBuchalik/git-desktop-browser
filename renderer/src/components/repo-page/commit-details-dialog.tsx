import { Box, Dialog } from '@primer/react';
import { Diff2HtmlUI } from 'diff2html/lib/ui/js/diff2html-ui-slim.js';
import React from 'react';

import { CommitDetailsWithBody, getCommitDetails } from '../../ipc/git/show';

import { useRepoServiceContext } from './services/repo-service';

interface Props {
  commitIsh: string;

  hide: () => void;
}
export const CommitDetailsDialog: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <Dialog
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '90vw',
        maxHeight: 'calc(0.9 * var(--usable-window-height))',
        marginY:
          'calc(env(titlebar-area-height) + 0.05 * var(--usable-window-height))',
      }}
      isOpen
      onDismiss={(): void => props.hide()}
    >
      <Dialog.Header>Commit Details</Dialog.Header>

      {/* We need position:relative because the diff renderer seems to use some sticky positioning that otherwise does not work properly. */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}>
        {controller.state.commitDetails && (
          <div
            ref={controller.diffContainerRef}
            style={{ padding: '1rem' }}
          ></div>
        )}
      </Box>
    </Dialog>
  );
};

interface State {
  commitDetails: CommitDetailsWithBody | undefined;
}
interface Controller {
  state: State;

  diffContainerRef: React.RefObject<HTMLDivElement>;
}
function useController(props: Props): Controller {
  const repoService = useRepoServiceContext();

  const [state, setState] = React.useState<State>({
    commitDetails: undefined,
  });

  const diffContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    void (async (): Promise<void> => {
      const commitFetchResult = await getCommitDetails({
        repoFolderPath: repoService.repoFolderPath,
        commitIsh: props.commitIsh,
      });

      if (!commitFetchResult.success) {
        return;
      }

      setState((state) => ({
        ...state,
        commitDetails: commitFetchResult.data,
      }));
    })();
  }, [props.commitIsh, repoService.repoFolderPath]);

  React.useEffect(() => {
    if (!diffContainerRef.current || !state.commitDetails) {
      return;
    }
    diffContainerRef.current.innerHTML = '';

    /*
      A good example on how to use diff2html can be found here:
      https://github.com/rtfpessoa/diff2html/issues/422
    */
    const diff2html = new Diff2HtmlUI(
      diffContainerRef.current,
      state.commitDetails.body,
      { outputFormat: 'side-by-side' },
    );
    diff2html.draw();
  }, [state.commitDetails]);

  return {
    state: state,

    diffContainerRef: diffContainerRef,
  };
}
