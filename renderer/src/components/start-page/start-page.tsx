import { PlusCircleIcon } from '@primer/octicons-react';
import { Box, Button, Flash } from '@primer/react';
import React from 'react';

import { getRepoRootPath } from '../../ipc/git/repo';
import { showOpenDialog } from '../../ipc/ipc-bridge';

import { REPOSITORY_LIST_LOCALSTORAGE_KEY, RepositoryEntry } from './models';
import { RepositoryList } from './repository-list';

interface Props {
  setNewRepoRootPath: (newRepoRootPath: string) => void;
}
export const StartPage: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <Box sx={{ width: '600px', marginX: 'auto', marginTop: 8 }}>
      {controller.state.selectedFolderPathIsNotRepo && (
        <Flash variant="danger">
          The selected folder is not a Git repository.
        </Flash>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <h1 style={{ color: 'var(--color-scale-gray-9)' }}>Repositories</h1>
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          <Button
            variant="primary"
            leadingIcon={PlusCircleIcon}
            sx={{
              background: 'var(--color-scale-blue-5)',
              borderRadius: '10000px',
              ':hover': {
                background: 'var(--color-scale-blue-6) !important',
              },
            }}
            onClick={(): void => void controller.openFolderPicker()}
          >
            Add repository
          </Button>
        </Box>
      </Box>

      <Box sx={{ marginY: 8 }}>
        {controller.state.repositoryList.length < 1 && (
          <Box
            sx={{
              padding: 4,
              borderRadius: '20px',
              border: '3px dashed var(--color-scale-gray-2)',
              background: 'var(--color-scale-gray-0)',
              color: 'var(--color-scale-gray-4)',
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: '162%',
            }}
          >
            <Box>It seems like you have not added a repository yet.</Box>
            <Box>Once you have added a repository, it will be shown here.</Box>
          </Box>
        )}

        {controller.state.repositoryList.length > 0 && (
          <RepositoryList
            repositoryList={controller.state.repositoryList}
            setNewRepositoryList={(newRepositoryList): void =>
              controller.setRepositoryList(newRepositoryList)
            }
            openRepository={(repository): void =>
              void controller.openRepository(repository)
            }
          />
        )}
      </Box>
    </Box>
  );
};

interface State {
  selectedFolderPathIsNotRepo: boolean;

  repositoryList: RepositoryEntry[];
}
interface Controller {
  state: State;

  setRepositoryList: (repositoryList: RepositoryEntry[]) => void;

  openFolderPicker: () => Promise<void>;
  openRepository: (repository: RepositoryEntry) => Promise<void>;
}
function useController(props: Props): Controller {
  const [state, setState] = React.useState<State>(() => {
    const repositoryListRaw = window.localStorage.getItem(
      REPOSITORY_LIST_LOCALSTORAGE_KEY,
    );
    let repositoryList: RepositoryEntry[];
    try {
      repositoryList = JSON.parse(repositoryListRaw ?? '') as RepositoryEntry[];
    } catch {
      repositoryList = [];
    }

    return {
      selectedFolderPathIsNotRepo: false,
      repositoryList: repositoryList,
    };
  });

  function updateLocalStorage(newRepositoryList: RepositoryEntry[]): void {
    window.localStorage.setItem(
      REPOSITORY_LIST_LOCALSTORAGE_KEY,
      JSON.stringify(newRepositoryList),
    );
  }

  // Whenever the list changes, remember this in LocalStorage.
  React.useEffect(() => {
    updateLocalStorage(state.repositoryList);
  }, [state.repositoryList]);

  return {
    state: state,

    setRepositoryList: (repositoryList): void => {
      setState((state) => ({ ...state, repositoryList: repositoryList }));
    },

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
        setState((state) => ({ ...state, selectedFolderPathIsNotRepo: true }));
        return;
      }

      if (
        !state.repositoryList.some(
          (item) => item.fileSystemPath === repoRootPathFetchResult.data,
        )
      ) {
        const newListEntry: RepositoryEntry = {
          fileSystemPath: repoRootPathFetchResult.data,
        };

        // No need to call setState here, because we navigate away from this component immediately.

        updateLocalStorage([newListEntry, ...state.repositoryList]);
      }

      props.setNewRepoRootPath(repoRootPathFetchResult.data);
    },

    openRepository: async (repository): Promise<void> => {
      const repoRootPathFetchResult = await getRepoRootPath(
        repository.fileSystemPath,
      );
      if (!repoRootPathFetchResult.success) {
        setState((state) => ({ ...state, selectedFolderPathIsNotRepo: true }));
        return;
      }

      props.setNewRepoRootPath(repository.fileSystemPath);
    },
  };
}
