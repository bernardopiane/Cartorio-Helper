const { contextBridge } = require('electron');

// Expose protected APIs to the renderer process
// Add specific APIs here as needed, e.g.:
// contextBridge.exposeInMainWorld('electronAPI', {
//   readFile: (path) => ipcRenderer.invoke('read-file', path),
// });

// Currently the app doesn't require any Node.js APIs from the renderer,
// so we keep this minimal. Add APIs here via contextBridge as needed.
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});