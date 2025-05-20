import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { format } from 'url';

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true, //  Consider security implications
            contextIsolation: false, //  Consider security implications
        },
    });

    // Load the production build of your React app
    const startUrl = process.env.VITE_DEV_SERVER_URL
        ? process.env.VITE_DEV_SERVER_URL
        : format({
            pathname: join(app.getAppPath(), 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        });
    mainWindow.loadURL(startUrl);

    // Open the DevTools (optional)
    // mainWindow.webContents.openDevTools();

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