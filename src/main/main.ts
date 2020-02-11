import { app, BrowserWindow, Menu, ipcMain, IpcMainEvent } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import { mkdir, existsSync } from 'fs';
import 'electron-reload';

import template from './Menu/menu';
import VideoService from './Video/video.service';
import FileSystemService from './services/FileSysytem/fileSystem.service';

let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    darkTheme: true,
    width: 800,
    height: 600,
    title: 'ytb-downloader',
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`,
  );

  //  MENU
  const menu = Menu.buildFromTemplate(template(app, mainWindow));
  if (isDev) {
    Menu.setApplicationMenu(menu);
  } else {
    Menu.setApplicationMenu(null);
  }
  // Create Uploads folder
  const pathUploadsDir = path.join(process.cwd(), 'uploads');
  if (!existsSync(pathUploadsDir))  {
    mkdir(pathUploadsDir,   (err) => {
      if (err) throw err;
    });
  };

  //
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.allowRendererProcessReuse = true;

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});


ipcMain.on('send-ytb-url', async (event: IpcMainEvent, url: string) => {
  if (mainWindow) {
    const videoService = new VideoService(mainWindow);
    await videoService.download(url);
  }
});

ipcMain.on('open-folder-dialog', async (event: IpcMainEvent) => {
  if (mainWindow) {
    const fileSystemService = new FileSystemService(mainWindow);
    await fileSystemService.openFolder();
  }
});

ipcMain.on('open-saver-folder', async (event: IpcMainEvent, url: string) => {
  if (mainWindow) {
    const fileSystemService = new FileSystemService(mainWindow);
    await fileSystemService.openSaveDirectory(url);
  }
});

