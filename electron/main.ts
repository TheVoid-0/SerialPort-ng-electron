import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { InEndpoint, OutEndpoint } from 'usb';
import { App } from './src/app';

// verifica se foi passado o argumento para dar auto-reload
const args: string[] = process.argv.slice(1);
let watch: boolean = args.some(val => val === '--watch');

function createWindow() {

    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: '#fff',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    })

    if (watch) {

        // Habilita o auto-reload do angular na janela da aplicação electron
        require('electron-reload')
        mainWindow.loadURL('http://localhost:4200');

    } else {
        mainWindow.loadFile(path.join(__dirname, '..', 'usb-interface-ng-electron/index.html'));
    }

    var usbNgElectronApp = new App(ipcMain);
    usbNgElectronApp.onReady.then((mainApp) => {
        console.log('app ready');
        const SerialPort = mainApp.getSerialPort();
        const port = new SerialPort('com3', { baudRate: 9600 }, (error) => {
            if (error) {
                console.log('Failed to open port: ' + error);
            } else {
                //Communicate with the device
                port.write("teste\n", (err, results) => {
                    if (error) {
                        console.log('Failed to write to port: ' + error);
                    }
                    console.log('enviei: teste')
                });
            }
        });
    })
    // Abre o inspecionador.
    mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        // No macOS o comportamento padrão dos apps é recriar a janela
        // ao clicar no ícone que fica na 'dock', caso não tenha nenhuma aberta.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})