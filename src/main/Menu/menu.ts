import {
  App,
  BrowserWindow,
  MenuItemConstructorOptions,
  MenuItem,
} from 'electron';

const isMac = process.platform === 'darwin';

const template = (
  app: App,
  win: BrowserWindow,
): Array<MenuItemConstructorOptions | MenuItem> => {
  return [
    // { role: 'appMenu' }
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideothers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    // { role: 'fileMenu' }

    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [
              { type: 'separator' },
              { role: 'front' },
              { role: 'reload' },
              { type: 'separator' },
              { role: 'window' },
            ]
          : [{ role: 'close' },  { role: 'reload' },]),
      ],
    },
    {
      label: 'developer',
      submenu: [
        {
          label: 'toggle devtools',
          accelerator: 'F12',
          click() {
            win.webContents.toggleDevTools();
          },
        },
      ],
    },
  ] as Array<MenuItemConstructorOptions | MenuItem>;
};

export default template;
