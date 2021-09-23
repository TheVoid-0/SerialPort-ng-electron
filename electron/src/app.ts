import { IpcMain } from 'electron';

type Usb = typeof import('usb');
type SerialPort = typeof import('serialport')

export class App {
    public onReady: Promise<AppReady>;
    private usb: Usb | undefined;
    private ipcMain: IpcMain | undefined;
    private serialPort: SerialPort | undefined;

    constructor(ipcMain: IpcMain) {
        this.ipcMain = ipcMain;
        this.onReady = new Promise<AppReady>(async (resolve, reject) => {
            this.usb = await import('usb');
            this.serialPort = await import('serialport');
            resolve(new AppReady(this.usb, this.serialPort));
        })
    }
}

class AppReady {
    private usb: Usb;
    private serialPort: SerialPort;

    constructor(usb: Usb, serialPort: SerialPort) {
        this.usb = usb;
        this.serialPort = serialPort;
    }
    getUsb(): Usb {
        return this.usb;
    }
    getSerialPort(): SerialPort {
        return this.serialPort;
    }
}