const {app, BrowserWindow, Menu, protocol, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const {version} = require('./package.json');
app.getVersion = () => version;
const PROTOCOL_PREFIX = 'simpleos';
const args = process.argv.slice(1);// local server
const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express')();
const PORT = 48777;
const http = require('http').Server(express);

let win, devtools, serve;
devtools = args.some(val => val === '--devtools');
serve = args.some(val => val === '--serve');

require('electron-context-menu')({
	showInspectElement: false
});

express.use(cors());

express.get('/ping', (req, res) => {
	res.end('OK');
});

express.get('/accounts', (req, res) => {
	win.webContents.send('request', 'accounts');
	ipcMain.once('accountsResponse', (event, data) => {
		console.log(data);
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(data));
	});
});

express.get('/getPublicKeys', (req, res) => {
	win.webContents.send('request', {
		message: 'publicKeys'
	});
	ipcMain.once('publicKeyResponse', (event, data) => {
		console.log(data);
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(data));
	});
});

express.post('/sign', bodyParser.json(), (req, res) => {
	win.webContents.send('request', {
		message: 'sign',
		content: req.body
	});
	ipcMain.once('signResponse', (event, data) => {
		console.log(data);
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(data));
	});
});

express.get('/connect', (req, res) => {
	console.log('CONNECT REQUEST');
	win.webContents.send('request', {
		message: 'connect',
		content: {
			dappName: req.query.dapp
		}
	});
	ipcMain.once('connectResponse', (event, data) => {
		console.log(data);
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(data));
	});
});

async function createWindow() {
	app.setAsDefaultProtocolClient(PROTOCOL_PREFIX);
	protocol.registerHttpProtocol(PROTOCOL_PREFIX, (req, callback) => {
		win.webContents.send('request', {
			message: 'launch',
			content: req.url
		});
		callback();
	});
	win = new BrowserWindow({
		title: 'simplEOS',
		webPreferences: {
			nodeIntegration: true,
			webSecurity: !serve
		},
		darkTheme: true,
		width: 1440,
		height: 920,
		minWidth: 800,
		minHeight: 600,
		backgroundColor: '#222222',
		frame: true,
		icon: path.join(__dirname, 'src/assets/icons/ico/simpleos.ico')
	});
	if (serve) {
		require('electron-reload')(__dirname, {
			electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
			hardResetMethod: 'exit'
		});
		await win.loadURL('http://localhost:7777');
	} else {
		await win.loadURL(url.format({
			pathname: path.join(__dirname, 'ng-dist/index.html'),
			protocol: 'file:',
			slashes: true
		}));
	}

	if (devtools) {
		win.webContents.openDevTools();
	}

	win.on('closed', () => {
		win = null;
	});

	const template = [{
		label: 'Application',
		submenu: [
			{type: 'separator'},
			{
				label: 'Quit',
				accelerator: 'Command+Q',
				click: function () {
					app.quit();
				}
			}
		]
	}, {
		label: 'Edit',
		submenu: [
			{label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:'},
			{label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:'},
			{type: 'separator'},
			{label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:'},
			{label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:'},
			{label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:'},
			{label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:'}
		]
	}];
	Menu['setApplicationMenu'](Menu['buildFromTemplate'](template));
	// win.removeMenu();
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	app.quit()
} else {
	http.listen(PORT, "127.0.0.1", () => {
		console.log('listening on lcoalhost:' + PORT);
	});
	app.on('second-instance', () => {
		if (win) {
			if (win.isMinimized()) {
				win.restore();
			}
			win.focus();
		}
	});

	app.on('ready', createWindow);

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});

	app.on('activate', async () => {
		if (win === null) {
			await createWindow();
		}
	});
}




