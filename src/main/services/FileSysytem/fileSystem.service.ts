import { dialog, BrowserWindow, shell } from 'electron';
import { writeFile, existsSync } from 'fs';
import * as path from 'path';

class FileSystemService {
  constructor(private readonly win: BrowserWindow) {
  }

  async openFolder() {
    const folder = await
      dialog.showOpenDialog(this.win, {
        properties: ['openDirectory'],
      });
    if (folder && existsSync(path.join(process.cwd(), 'uploads'))) {
      writeFile(path.join(process.cwd(), 'uploads', 'path.txt'), folder.filePaths[0], 'utf8', (err) => {
        if (err) throw err;
      });
      this.win.webContents.send('folder-path', folder.filePaths[0]);
    } else {
      this.win.webContents.send('folder-path', '');
    }
  }

  async openSaveDirectory(fullPath: string) {
    await shell.openItem(fullPath);
  }

}

export default FileSystemService;
