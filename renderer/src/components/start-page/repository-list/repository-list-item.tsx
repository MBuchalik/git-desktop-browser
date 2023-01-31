import { GearIcon, TrashIcon } from '@primer/octicons-react';
import { Box, IconButton } from '@primer/react';
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

import { merge } from '../../../utils/merge';
import { RepositoryEntry } from '../models';

import { DeletionDialog } from './deletion-dialog';
import { SettingsDialog } from './settings-dialog';

interface Props {
  repository: RepositoryEntry;
  indexInList: number;

  openRepository: () => void;
  updateRepositoryEntry: (repositoryEntry: RepositoryEntry) => void;
  deleteRepositoryEntry: () => void;
}
export const RepositoryListItem: React.FC<Props> = (props) => {
  const controller = useController();

  return (
    <React.Fragment>
      <Draggable
        draggableId={props.repository.fileSystemPath}
        index={props.indexInList}
      >
        {(provided): React.ReactElement => (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            <Box sx={{ paddingBottom: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  background: 'var(--color-scale-gray-1)',
                  paddingY: 3,
                  paddingX: 4,
                  borderRadius: '20px',
                  cursor: 'pointer',
                }}
                onClick={(): void => props.openRepository()}
              >
                <Box sx={{ display: 'flex' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <h3
                      style={{
                        fontSize: '24px',
                        fontWeight: 500,
                        color: 'var(--color-scale-gray-9)',

                        lineHeight: '1em',
                      }}
                    >
                      {getRepositoryName(props.repository)}
                    </h3>
                  </Box>
                  <Box sx={{ flexShrink: 0 }}>
                    <IconButton
                      aria-label="Settings"
                      variant="invisible"
                      icon={GearIcon}
                      size="small"
                      sx={{
                        color: 'var(--color-scale-gray-5)',
                        ':hover': {
                          background: 'var(--color-scale-gray-2) !important',
                        },
                      }}
                      onClick={(e): void => {
                        e.stopPropagation();
                        controller.setShowSettingsDialog(true);
                      }}
                    />

                    <IconButton
                      aria-label="Delete"
                      variant="invisible"
                      icon={TrashIcon}
                      size="small"
                      sx={{
                        color: 'var(--color-scale-gray-5)',
                        ':hover': {
                          background: 'var(--color-scale-gray-2) !important',
                        },
                      }}
                      onClick={(e): void => {
                        e.stopPropagation();
                        controller.setShowDeletionDialog(true);
                      }}
                    />
                  </Box>
                </Box>

                <Box
                  sx={{ color: 'var(--color-scale-gray-5)', fontWeight: 500 }}
                >
                  {props.repository.fileSystemPath}
                </Box>
              </Box>
            </Box>
          </div>
        )}
      </Draggable>

      {controller.state.showSettingsDialog && (
        <SettingsDialog
          repository={props.repository}
          close={(): void => controller.setShowSettingsDialog(false)}
          save={(repositoryEntry): void => {
            props.updateRepositoryEntry(repositoryEntry);
            controller.setShowSettingsDialog(false);
          }}
        />
      )}

      {controller.state.showDeletionDialog && (
        <DeletionDialog
          close={(): void => controller.setShowDeletionDialog(false)}
          delete={(): void => {
            controller.setShowDeletionDialog(false);
            props.deleteRepositoryEntry();
          }}
        />
      )}
    </React.Fragment>
  );
};

interface State {
  showSettingsDialog: boolean;
  showDeletionDialog: boolean;
}
interface Controller {
  state: State;

  setShowSettingsDialog: (show: boolean) => void;
  setShowDeletionDialog: (show: boolean) => void;
}
function useController(): Controller {
  const [state, setState] = React.useState<State>({
    showSettingsDialog: false,
    showDeletionDialog: false,
  });

  return {
    state: state,

    setShowSettingsDialog: (show): void => {
      setState((state) => merge(state, { showSettingsDialog: show }));
    },
    setShowDeletionDialog: (show): void => {
      setState((state) => merge(state, { showDeletionDialog: show }));
    },
  };
}

function getRepositoryName(repository: RepositoryEntry): string {
  if (repository.displayName !== undefined) {
    return repository.displayName;
  }

  return repository.fileSystemPath.split(new RegExp('[/\\\\]')).at(-1) ?? '';
}
