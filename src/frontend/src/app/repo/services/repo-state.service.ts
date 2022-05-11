import { Injectable } from '@angular/core';
import { Immutable, produce } from 'immer';
import { Subject } from 'rxjs';

export enum RepoView {
  Files,
  Commits,
  Diff,
}

export interface FilesViewState {
  commitIsh?: string;
  currentTreeOrBlobPath: {
    type: 'tree' | 'blob';
    path: string[];
  };
}

interface State {
  currentView: RepoView;
  viewStates: {
    [RepoView.Files]: FilesViewState;
  };
}

@Injectable()
export class RepoStateService {
  readonly onChangeState = new Subject<void>();

  state: Immutable<State> = {
    currentView: RepoView.Files,
    viewStates: {
      [RepoView.Files]: {
        currentTreeOrBlobPath: {
          type: 'tree',
          path: [],
        },
      },
    },
  };

  draftNewState(fn: (draft: State) => void): void {
    this.state = produce(this.state, (draft) => {
      fn(draft);
    });

    this.onChangeState.next();
  }
}
