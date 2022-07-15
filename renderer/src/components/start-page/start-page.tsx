import React from 'react';

import { getRepoRootPath } from '../../ipc/git/repo';
import { showOpenDialog } from '../../ipc/ipc-bridge';

interface Props {
  setNewRepoRootPath: (newRepoRootPath: string) => void;
}
export const StartPage: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <div>
      Start Page
      <button
        type="button"
        onClick={(): void => void controller.openFolderPicker()}
      >
        Open Folder Picker
      </button>
    </div>
  );
};

interface Controller {
  openFolderPicker: () => Promise<void>;
}
function useController(props: Props): Controller {
  return {
    openFolderPicker: async (): Promise<void> => {
      const result = await showOpenDialog({
        properties: ['openDirectory'],
      });

      if (result.canceled) {
        return;
      }

      const theFolderPath = result.filePaths[0];
      if (theFolderPath === undefined) {
        return;
      }

      const repoRootPathFetchResult = await getRepoRootPath(theFolderPath);
      if (!repoRootPathFetchResult.success) {
        return;
      }

      props.setNewRepoRootPath(repoRootPathFetchResult.data);
    },
  };
}
