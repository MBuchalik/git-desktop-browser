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
          setNewRepoRootPath={(newRepoRootPath: string): void => {
            controller.setRepoRootPath(newRepoRootPath);
            controller.setPageToShow(Page.Repo);
          }}
        />
      )}

      {controller.state.pageToShow === Page.Repo &&
        controller.state.repoRootPath !== undefined && (
          <RepoPage
            repoRootPath={controller.state.repoRootPath}
            close={(): void => controller.setPageToShow(Page.Start)}
          />
        )}
    </React.Fragment>
  );
};

interface State {
  repoRootPath: string | undefined;
  pageToShow: Page;
}
interface Controller {
  state: State;

  setRepoRootPath: (newRootPath: string) => void;
  setPageToShow: (page: Page) => void;
}
function useController(): Controller {
  const [state, setState] = React.useState<State>({
    repoRootPath: undefined,
    pageToShow: Page.Start,
  });

  return {
    state: state,

    setRepoRootPath: (newRepoRootPath): void => {
      setState((state) => ({ ...state, repoRootPath: newRepoRootPath }));
    },
    setPageToShow: (page): void => {
      setState((state) => ({ ...state, pageToShow: page }));
    },
  };
}
