import { Injectable } from '@angular/core';

interface State {
  repoFolderPath: string | undefined;
}

@Injectable({
  providedIn: 'root',
})
export class MainStateService {
  state: State = {
    repoFolderPath: undefined,
  };

  setState(newState: State): void {
    this.state = newState;
  }
}
