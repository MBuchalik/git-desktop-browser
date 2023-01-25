import { Box } from '@primer/react';
import React from 'react';

import { RepoPage } from './repo-page';
import { StartPage } from './start-page';

enum Page {
  Start,
  Repo,
}

export const MainView: React.FC = () => {
  const controller = useController();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          zIndex: 999999,
          background: '#24292f',
          // See https://www.electronjs.org/docs/latest/tutorial/window-customization and  https://github.com/WICG/window-controls-overlay/blob/0fe36fcfa1c93ba4089b6c21a8cd63ba4fd2713c/explainer.md#css-environment-variables
          height: 'env(titlebar-area-height)',
          // Allow the user to drag the window around when dragging this bar.
          ['-webkit-app-region' as string]: 'drag',
        }}
      />

      <Box
        ref={controller.scrollContainerRef}
        sx={{
          flexGrow: 1,
          // When browsing a repo or the like, it is pretty annoying if the page constantly jumps around when the content sometimes leads to a scroll bar and sometimes not.
          overflowY: 'scroll',
        }}
      >
        {controller.state.pageToShow === Page.Start && (
          <StartPage
            setNewRepoRootPath={(newRepoFolderPath: string): void => {
              controller.setRepoFolderPath(newRepoFolderPath);
              controller.setPageToShow(Page.Repo);
            }}
          />
        )}

        {controller.state.pageToShow === Page.Repo &&
          controller.state.repoFolderPath !== undefined && (
            <RepoPage
              repoFolderPath={controller.state.repoFolderPath}
              scrollMainAreaToTop={(): void => controller.scrollMainAreaToTop()}
              close={(): void => controller.setPageToShow(Page.Start)}
            />
          )}
      </Box>
    </Box>
  );
};

interface State {
  repoFolderPath: string | undefined;
  pageToShow: Page;
}
interface Controller {
  state: State;

  scrollContainerRef: React.RefObject<HTMLDivElement>;

  setRepoFolderPath: (newFolderPath: string) => void;
  setPageToShow: (page: Page) => void;

  scrollMainAreaToTop: () => void;
}
function useController(): Controller {
  const [state, setState] = React.useState<State>({
    repoFolderPath: undefined,
    pageToShow: Page.Start,
  });

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  return {
    state: state,

    scrollContainerRef: scrollContainerRef,

    setRepoFolderPath: (newRepoFolderPath): void => {
      setState((state) => ({ ...state, repoFolderPath: newRepoFolderPath }));
    },
    setPageToShow: (page): void => {
      setState((state) => ({ ...state, pageToShow: page }));
    },

    scrollMainAreaToTop: (): void => {
      if (!scrollContainerRef.current) {
        return;
      }

      scrollContainerRef.current.scrollTo(0, 0);
    },
  };
}
