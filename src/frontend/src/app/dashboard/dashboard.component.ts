import { Component } from '@angular/core';

import { MainStateService } from '../services/main-state.service';
import { getRepoRootPath } from '../utils/git';
import { showOpenDialog } from '../utils/ipc-bridge';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  selectedFolderIsNotGitDirectory = false;

  constructor(private mainStateService: MainStateService) {}

  async openFolderPicker(): Promise<void> {
    this.selectedFolderIsNotGitDirectory = false;

    const result = await showOpenDialog({
      properties: ['openDirectory'],
    });

    const folderPathItem = result.filePaths[0];
    if (folderPathItem === undefined) {
      return;
    }

    const repoRootFetchResult = await getRepoRootPath(folderPathItem);
    if (!repoRootFetchResult.success) {
      this.selectedFolderIsNotGitDirectory = true;
      return;
    }

    const repoRootPath = repoRootFetchResult.data;

    this.mainStateService.setState({ repoFolderPath: repoRootPath });
  }
}
