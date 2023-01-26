import { Box, Button, Dialog } from '@primer/react';
import React from 'react';

interface Props {
  close: () => void;
  delete: () => void;
}
export const DeletionDialog: React.FC<Props> = (props) => {
  return (
    <Dialog isOpen onDismiss={(): void => props.close()}>
      <Dialog.Header>Remove from list</Dialog.Header>

      <Box sx={{ padding: 4 }}>
        Do you really want to remove the repository from the list?
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            marginTop: 4,
          }}
        >
          <Button onClick={(): void => props.close()}>Cancel</Button>
          <Button variant="danger" onClick={(): void => props.delete()}>
            Delete
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
