import { Box } from '@primer/react';
import React, { useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  DroppableProps,
  OnDragEndResponder,
} from 'react-beautiful-dnd';

import { RepositoryEntry } from '../models';

import { RepositoryListItem } from './repository-list-item';

interface Props {
  repositoryList: RepositoryEntry[];

  openRepository: (repository: RepositoryEntry) => void;

  setNewRepositoryList: (repositoryList: RepositoryEntry[]) => void;
}
export const RepositoryList: React.FC<Props> = (props) => {
  const controller = useController(props);

  return (
    <DragDropContext onDragEnd={controller.onDragEnd}>
      <FixedDroppable droppableId={controller.droppableId}>
        {(provided): React.ReactElement => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {props.repositoryList.map((repository, index) => (
                <RepositoryListItem
                  key={repository.fileSystemPath}
                  repository={repository}
                  indexInList={index}
                  openRepository={(): void => props.openRepository(repository)}
                  updateRepositoryEntry={(repositoryEntry): void =>
                    controller.updateEntryAtIndex(index, repositoryEntry)
                  }
                  deleteRepositoryEntry={(): void =>
                    controller.deleteEntryAtIndex(index)
                  }
                />
              ))}

              {provided.placeholder}
            </Box>
          </div>
        )}
      </FixedDroppable>
    </DragDropContext>
  );
};

interface Controller {
  droppableId: string;

  onDragEnd: OnDragEndResponder;

  updateEntryAtIndex: (index: number, newEntry: RepositoryEntry) => void;
  deleteEntryAtIndex: (index: number) => void;
}
function useController(props: Props): Controller {
  const droppableId = React.useId();

  return {
    droppableId: droppableId,

    onDragEnd: (result): void => {
      if (!result.destination) {
        return;
      }

      // The location has not changed? Then we don't need to do anything.
      if (result.destination.index === result.source.index) {
        return;
      }

      const newRepositoryList = [...props.repositoryList];

      const movedElement = newRepositoryList[result.source.index];
      if (!movedElement) {
        return;
      }

      // Remove the source item.
      newRepositoryList.splice(result.source.index, 1);

      newRepositoryList.splice(result.destination.index, 0, movedElement);

      props.setNewRepositoryList(newRepositoryList);
    },

    updateEntryAtIndex: (index, newEntry): void => {
      const copiedList = [...props.repositoryList];
      copiedList[index] = newEntry;
      props.setNewRepositoryList(copiedList);
    },
    deleteEntryAtIndex: (index): void => {
      const copiedList = [...props.repositoryList];
      copiedList.splice(index, 1);
      props.setNewRepositoryList(copiedList);
    },
  };
}

// See https://github.com/atlassian/react-beautiful-dnd/issues/2399#issuecomment-1175638194
const FixedDroppable: React.FC<DroppableProps> = (props) => {
  const [isVeryFirstRun, setIsVeryFirstRun] = useState(true);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setIsVeryFirstRun(false));

    return () => {
      cancelAnimationFrame(animation);
    };
  }, []);

  // eslint-disable-next-line react/destructuring-assignment, @typescript-eslint/unbound-method
  const { children, ...restProps } = props;

  return (
    <React.Fragment>
      {!isVeryFirstRun && <Droppable {...restProps}>{children}</Droppable>}
    </React.Fragment>
  );
};
