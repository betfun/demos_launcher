import { app, BrowserWindow, ipcMain, screen, Menu } from 'electron';
import { OsFactory } from './src/os/OsFactory';
import * as path from 'path';
import * as url from 'url';
import { OrgModel, ProfileModel } from './src/app/store/orgs/model';
import { SupportedBrowsers } from './src/app/store/config/model';
const { dialog } = require('electron');

let win: BrowserWindow | null = null;

const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');

const osBridge = OsFactory.create();
ipcMain.on('runChrome',
  (_event: any, org: OrgModel, browser: SupportedBrowsers, profile: ProfileModel, useHomepage: boolean) =>
    osBridge.runChrome(org, browser, profile, useHomepage));
ipcMain.on('kill', (_event, arg) => osBridge.kill(arg));
ipcMain.on('getHomeDir', (event) => event.returnValue = osBridge.getUserDir());
ipcMain.on('getUserInfo', (event) => event.returnValue = osBridge.getUserName());
ipcMain.on('db:read', (event, ...arg) => event.returnValue = osBridge.readDb(arg[0], arg[1]));
ipcMain.on('db:write', (event, ...arg) => event.returnValue = osBridge.writeDb(arg[0], arg[1], arg[2]));
ipcMain.on('removeDir', (event, arg) => event.returnValue = osBridge.deleteOrg(arg));

// ipcMain.on('launch', (event, arg) => event.returnValue = osBridge.launchRaw(arg));

function createWindow(): BrowserWindow {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    titleBarStyle: 'hidden',
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    title: 'demos launcher',
    webPreferences: {
      sandbox: false,
      nodeIntegration: false,
      preload: `${__dirname}/preload.js`,
      allowRunningInsecureContent: (serve) ? true : false,
      contextIsolation: true  // false if you want to run 2e2 test with Spectron,
    },
  });

  if (serve) {
    win.webContents.openDevTools();

    // win.loadURL('https://demos-launcher-web.azurewebsites.net/');
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {

  const dockMenu = Menu.buildFromTemplate([
    {
      label: 'Close all',
      click() { osBridge.killall(); }
    }
  ]);

  const isMac = process.platform === 'darwin';

  const scUrl = 'https://solutionscentral.io/posts/5de95f70-72e7-11ec-9e6d-f1bf609be4ef/managing-personas-for-demos/';
  const relasesUrl = 'https://github.com/davideappiano/demos_launcher/releases';

  const template: Electron.MenuItemConstructorOptions[] = [
    { role: 'appMenu' },
    { role: 'fileMenu' },
    // {
    //   label: 'File',
    //   submenu: [
    //     {
    //       label: 'Import from file...',
    //       click: () => {
    //         dialog.showOpenDialog({ properties: ['openFile'] }).then(response => {
    //           if (!response.canceled) {
    //             // handle fully qualified file name
    //             const orgs = osBridge.readDb(response.filePaths[0], 'orgs', true);
    //             console.log(orgs);
    //           } else {
    //             console.log('no file selected');
    //           }
    //         });
    //       }
    //     },
    //     { type: 'separator' },
    //     isMac ? { role: 'close' } : { role: 'quit' }
    //   ]
    // },
    { role: 'editMenu' },
    ...(serve ?
      [{ role: 'viewMenu' }] as Electron.MenuItemConstructorOptions[] :
      []),
    // {
    //   label: 'View',
    //   submenu: [
    //     { role: 'reload' },
    //     { role: 'forceReload' },
    //     { role: 'toggleDevTools' },
    //     { type: 'separator' },
    //     { role: 'resetZoom' },
    //     { role: 'zoomIn' },
    //     { role: 'zoomOut' },
    //     { type: 'separator' },
    //     { role: 'togglefullscreen' }
    //   ]
    // },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [
        {
          label: 'Releases',
          click: () => osBridge.openExternal(relasesUrl)
        },
        { type: 'separator' },
        {
          label: 'Learn More',
          click: () => osBridge.openExternal(scUrl)
        },
      ]
    }
  ];

  // Menu.setApplicationMenu(menu);
  // app.dock.setMenu(dockMenu);
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window.
  // More detais at https://github.com/electron/electron/issues/15947
  app.whenReady()
    .then(() => app.dock.setMenu(dockMenu))
    .then(() => {
      const menu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menu);
    })
    .then(() => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
