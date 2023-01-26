import { Box, Button, Dialog, FormControl, TextInput } from '@primer/react';
import React from 'react';

import { RepositoryEntry } from '../models';

interface Props {
  repository: RepositoryEntry;

  close: () => void;
  save: (repositoryEntry: RepositoryEntry) => void;
}
export const SettingsDialog: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <Dialog isOpen onDismiss={(): void => props.close()}>
      <Dialog.Header>Repository Settings</Dialog.Header>

      <Box sx={{ padding: 4 }}>
        <form onSubmit={(): void => controller.save()}>
          <FormControl>
            <FormControl.Label>Display Name</FormControl.Label>
            <TextInput
              sx={{ width: '100%' }}
              value={controller.state.repositoryName}
              onChange={(e): void =>
                controller.setRepositoryName(e.target.value)
              }
            />
          </FormControl>
        </form>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            marginTop: 4,
          }}
        >
          <Button onClick={(): void => props.close()}>Cancel</Button>
          <Button
            variant="primary"
            disabled={controller.state.repositoryName.trim() === ''}
            onClick={(): void => controller.save()}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

interface State {
  repositoryName: string;
}
interface Controller {
  state: State;

  setRepositoryName: (name: string) => void;

  save: () => void;
}
function useController(props: Props): Controller {
  const [state, setState] = React.useState<State>({
    repositoryName: props.repository.displayName ?? '',
  });

  return {
    state: state,

    setRepositoryName: (name): void => {
      setState((state) => ({ ...state, repositoryName: name }));
    },

    save: (): void => {
      if (state.repositoryName.trim() === '') {
        return;
      }

      const entryClone = { ...props.repository };
      entryClone.displayName = state.repositoryName;

      props.save(entryClone);
    },
  };
}
