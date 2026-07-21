import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { format } from 'url';

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 960,
        minHeight: 640,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true,
        },
    });

    const startUrl = process.env.VITE_DEV_SERVER_URL
        ? process.env.VITE_DEV_SERVER_URL
        : format({
            pathname: join(app.getAppPath(), 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        });
    mainWindow.loadURL(startUrl);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

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
