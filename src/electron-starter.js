const { app, BrowserWindow, dialog } = require("electron");
const contextMenu = require("electron-context-menu");

const path = require("path");
const url = require("url");
const WebSocket = require("ws");

global.mainWindow = {};
let ws;
var launchUrl;

const menu = require("./menu");

contextMenu();

const startUrl = url.format({
  pathname: path.join(__dirname, "/simple.html"), // "/build/index.html"
  protocol: "file:",
  slashes: true,
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  var url = startUrl;
  if (launchUrl) {
    url = url + "?roomUrl=" + launchUrl;
  }
  mainWindow.loadURL(url);
  mainWindow.webContents.on("new-window", function (e, url) {
    e.preventDefault();
    require("electron").shell.openExternal(url);
  });
  // mainWindow.webContents.openDevTools()
  // set up a websocket connection for stream deck
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  mainWindow = null;
  ws = null;
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// for opening from Choosy, etc
app.on("open-url", function (event, url) {
  if (typeof mainWindow.loadURL === "function") {
    mainWindow.loadURL(startUrl + "?roomUrl=" + url);
  }
  // we're starting up; set launchurl
  launchUrl = url;
});
