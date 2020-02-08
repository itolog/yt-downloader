import { app, BrowserWindow, Menu, ipcMain, IpcMainEvent } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import 'electron-reload';

import template from './Menu/menu';
import VideoService from './Video/video.service';

let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    darkTheme: true,
    width: 800,
    height: 600,
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
  Menu.setApplicationMenu(menu);

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
  const videoService = new VideoService(mainWindow);
  await videoService.download(url);
});