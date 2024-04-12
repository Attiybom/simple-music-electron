const { app, BrowserWindow, ipcMain, dialog } = require("electron");

console.log('app-path', app.getPath('userData'))

const DataStore = require("./renderer/MusicDataStore");

const musicDataStore = new DataStore({
  'name': 'Music Data',
})

const { $ } = require("./renderer/helper");

// const path = require('node:path')

class AppWindow extends BrowserWindow {
  constructor(config, fileLocation) {
    const baseConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    };

    const initialConfig = {
      ...baseConfig,
      ...config,
    };

    super(initialConfig);

    this.loadFile(fileLocation);
    this.once("ready-to-show", () => {
      this.show();
    });
  }
}

const createWindow = () => {
  const mainWindow = new AppWindow(
    {
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false, // 关闭上下文隔离
        enableRemoteModule: true, // 如果你需要使用remote模块，也需要开启此项（根据版本需要）
        // preload: path.join(__dirname, 'preload.js')
      },
    },
    "./renderer/index.html"
  );

  ipcMain.on("add-music-window", (event, arg) => {
    const addMusicWindow = new AppWindow(
      {
        width: 500,
        height: 400,
        parent: mainWindow,
      },
      "./renderer/add.html"
    );
  });

  ipcMain.on("add-tracks", (event, data) => {
    // event.sender.send("music-data", musicDataStore.get());
    const updatedTracks = musicDataStore.addTracks(data)?.getTracks()
    console.log('updatedTracks', updatedTracks)
  });



  ipcMain.on("open-music-file", (event, arg) => {
    console.log("open from renderer");

    // 添加注释
    dialog
      .showOpenDialog({
        properties: ["openFile", "multiSelections"],
        filters: [{ name: "Music", extensions: ["mp3", "wav", "flac", "mp4"] }, (files) => {
          console.log('files', files)
        }],
      })
      .then((result) => {
        if (result.canceled) return;
        console.log('result', result)
        if (result.filePaths.length === 0) return;

        // 发送给主进程
        event.sender.send("selected-files", result.filePaths);
      });
  });
};

app.whenReady().then(() => {
  createWindow();

  // Open the DevTools.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
