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
    <React.Fragment>
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
            close={(): void => controller.setPageToShow(Page.Start)}
          />
        )}
    </React.Fragment>
  );
};

interface State {
  repoFolderPath: string | undefined;
  pageToShow: Page;
}
interface Controller {
  state: State;

  setRepoFolderPath: (newFolderPath: string) => void;
  setPageToShow: (page: Page) => void;
}
function useController(): Controller {
  const [state, setState] = React.useState<State>({
    repoFolderPath: undefined,
    pageToShow: Page.Start,
  });

  return {
    state: state,

    setRepoFolderPath: (newRepoFolderPath): void => {
      setState((state) => ({ ...state, repoFolderPath: newRepoFolderPath }));
    },
    setPageToShow: (page): void => {
      setState((state) => ({ ...state, pageToShow: page }));
    },
  };
}
