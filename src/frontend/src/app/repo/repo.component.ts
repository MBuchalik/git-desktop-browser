import { Component, OnDestroy, OnInit } from '@angular/core';
import { Immutable } from 'immer';
import * as lodash from 'lodash';
import { Subscription } from 'rxjs';

import { MainStateService } from '../services/main-state.service';
import { getAllBranches } from '../utils/git/branch';
import { TreeEntry, getTreeByPath } from '../utils/git/tree';

import {
  FilesViewState,
  RepoStateService,
  RepoView,
} from './services/repo-state.service';

interface State {
  lastKnownViewStateEntry: Immutable<FilesViewState>;

  treeEntries?: TreeEntry[] | undefined;
  treeEntriesError?: boolean;
  allBranches?: string[];
}

@Component({
  selector: 'app-repo',
  templateUrl: './repo.component.html',
  styleUrls: ['./repo.component.scss'],
  providers: [{ provide: RepoStateService }],
})
export class RepoComponent implements OnInit, OnDestroy {
  state: State = {
    lastKnownViewStateEntry:
      this.repoStateService.state.viewStates[RepoView.Files],
  };

  readonly subscriptions: Subscription[] = [];

  constructor(
    private mainStateService: MainStateService,
    private repoStateService: RepoStateService,
  ) {}

  ngOnInit(): void {
    void this.loadBranches();

    void this.loadTreeOrFolder();

    const subscription = this.repoStateService.onChangeState.subscribe(() => {
      const newViewStateEntry =
        this.repoStateService.state.viewStates[RepoView.Files];

      if (
        lodash.isEqual(this.state.lastKnownViewStateEntry, newViewStateEntry)
      ) {
        return;
      }

      this.state.lastKnownViewStateEntry = newViewStateEntry;
      void this.loadTreeOrFolder();
    });

    this.subscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  async loadBranches(): Promise<void> {
    if (this.mainStateService.state.repoFolderPath === undefined) {
      return;
    }

    const branchesFetchResult = await getAllBranches(
      this.mainStateService.state.repoFolderPath,
    );
    if (!branchesFetchResult.success) {
      return;
    }

    this.state.allBranches = branchesFetchResult.data;
  }

  selectBranch(branchName: string): void {
    this.repoStateService.draftNewState((draft) => {
      draft.viewStates[RepoView.Files].commitIsh = branchName;
    });
  }

  async loadTreeOrFolder(): Promise<void> {
    if (this.mainStateService.state.repoFolderPath === undefined) {
      return;
    }

    if (this.state.lastKnownViewStateEntry.commitIsh === undefined) {
      return;
    }

    this.state.treeEntries = undefined;
    this.state.treeEntriesError = false;

    const tree = await getTreeByPath(
      this.mainStateService.state.repoFolderPath,
      this.state.lastKnownViewStateEntry.commitIsh,
      this.state.lastKnownViewStateEntry.currentTreeOrBlobPath.path,
    );
    if (!tree.success) {
      this.state.treeEntriesError = true;
      return;
    }

    this.state.treeEntries = tree.data;
  }

  selectSubTree(name: string): void {
    this.repoStateService.draftNewState((draft) => {
      draft.viewStates[RepoView.Files].currentTreeOrBlobPath.path.push(name);
    });
  }

  goToTreeRoot(): void {
    this.repoStateService.draftNewState((draft) => {
      draft.viewStates[RepoView.Files].currentTreeOrBlobPath.path = [];
      draft.viewStates[RepoView.Files].currentTreeOrBlobPath.type = 'tree';
    });
  }

  goToTreeAtPathIndex(index: number): void {
    if (
      index >=
      this.state.lastKnownViewStateEntry.currentTreeOrBlobPath.path.length - 1
    ) {
      return;
    }

    this.repoStateService.draftNewState((draft) => {
      draft.viewStates[RepoView.Files].currentTreeOrBlobPath.path =
        draft.viewStates[RepoView.Files].currentTreeOrBlobPath.path.slice(
          0,
          index + 1,
        );
      draft.viewStates[RepoView.Files].currentTreeOrBlobPath.type = 'tree';
    });
  }

  leave(): void {
    this.mainStateService.state.repoFolderPath = undefined;
  }
}
