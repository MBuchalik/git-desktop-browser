export interface RepositoryEntry {
  /**
   * The "physical" path where the repository can be found.
   * The path is guaranteed to be unique, i.e. we make sure that no two Repository Entries are created with the same path.
   */
  fileSystemPath: string;

  displayName?: string;
}

export const REPOSITORY_LIST_LOCALSTORAGE_KEY = 'repository-list';
