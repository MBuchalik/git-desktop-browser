import React from 'react';

interface RepoService {
  repoFolderPath: string;
  selectedCommitIsh: string;
}
function useRepoService(props: Props): RepoService {
  return {
    repoFolderPath: props.repoFolderPath,
    selectedCommitIsh: props.selectedCommitIsh,
  };
}

const RepoServiceContext = React.createContext<RepoService | undefined>(
  undefined,
);

interface Props {
  repoFolderPath: string;
  selectedCommitIsh: string;

  children?: React.ReactNode;
}
export const RepoServiceContextProvider: React.FC<Props> = (props) => {
  const repoService = useRepoService(props);

  return (
    <RepoServiceContext.Provider value={repoService}>
      {props.children}
    </RepoServiceContext.Provider>
  );
};

export const useRepoServiceContext = (): RepoService => {
  const context = React.useContext(RepoServiceContext);
  if (!context) {
    throw Error(
      'Your component does not seem to be part of the RepoServiceContext!',
    );
  }

  return context;
};
