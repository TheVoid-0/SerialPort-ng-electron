import { IpcMain } from 'electron';

type Usb = typeof import('usb');
type SerialPort = typeof import('serialport')

export class App {
    public onReady: Promise<AppReady>;
    private usb: Usb | undefined;
    private ipcMain: IpcMain;
    private serialPort: SerialPort | undefined;

    constructor(ipcMain: IpcMain) {
        this.ipcMain = ipcMain;
        this.onReady = new Promise<AppReady>(async (resolve, reject) => {
            this.usb = await import('usb');
            this.serialPort = await import('serialport');
            resolve(new AppReady(this.ipcMain, this.usb, this.serialPort));
        })
    }
}

class AppReady {
    private ipcMain: IpcMain
    private usb: Usb;
    private serialPort: SerialPort;

    constructor(ipcMain: IpcMain, usb: Usb, serialPort: SerialPort) {
        this.ipcMain = ipcMain
        this.usb = usb;
        this.serialPort = serialPort;
    }
    getUsb(): Usb {
        return this.usb;
    }
    getSerialPort(): SerialPort {
        return this.serialPort;
    }

    getIpcMain() {
        return this.ipcMain;
    }
}