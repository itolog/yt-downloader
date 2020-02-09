import { dialog, BrowserWindow } from 'electron';
import { writeFile } from 'fs';
import * as path from 'path';
import { config } from '../../../shared/config';

class FileSystemService {
  constructor(private readonly win: BrowserWindow) {
  }

  async openFolder() {
    const folder = await
      dialog.showOpenDialog(this.win, {
        properties: ['openDirectory'],
      });
    if (folder) {
      writeFile(path.join(process.cwd(), 'uploads', config.pathFileName), folder.filePaths[0], 'utf8', (err) => {
        if (err) throw err;
      });
      this.win.webContents.send('folder-path', folder.filePaths[0]);
    } else {
      this.win.webContents.send('folder-path', '');
    }
  }

}

export default FileSystemService;
