import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { App } from './src/app';
import { SerialService } from './src/services/serial.service';

// verifica se foi passado o argumento para dar auto-reload
const args: string[] = process.argv.slice(1);
let watch: boolean = args.some(val => val === '--watch');

function createWindow() {

    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: '#fff',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
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
    usbNgElectronApp.onReady.then(async (mainApp) => {
        console.log('app ready');

        // TODO: Adicionar rotas para chamar os 'controllers'
        // TODO: testar se o export new cria uma nova instância a cada import
        // TODO: Adicionar a escolha de qual porta abrir

        let serialService = new SerialService(mainWindow);

        // Rota do controller externo
        mainApp.getIpcMain().on('serial-page', (event, args) => {
            console.log('enviando', args.data);
            serialService.sendData(args.data);

            // Rota do controller interno que será adicionado após a entrada na página
            mainApp.getIpcMain().on('serial-page-get-ports', (event) => {
                console.log('buscando portas...');

                serialService.findPorts().then((ports) => {
                    event.sender.send('serial-page-get-ports-ready', { data: ports });
                })
            });

            mainApp.getIpcMain().on('serial-page-post-autoread', (event, args) => {
                serialService.sendData(args, (error: Error | null) => {
                    if (error) {
                        console.log(error);
                    }
                    event.sender.send('serial-page-post-autoread-ready', { error: error, message: error ? 'success' : 'error' });
                });
            })
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