import { BrowserWindow } from 'electron';
import SerialPort = require('serialport');

// type SerialPort = typeof import('serialport')
const DEVICE_PID = 'EA60'
export class SerialService {

    private serialPort: typeof SerialPort
    private portOpened: SerialPort | undefined;
    constructor(window: BrowserWindow) {
        this.serialPort = SerialPort;
        this.setupListeners(window);
    }

    public async findPortByPID(pid: string): Promise<SerialPort.PortInfo | undefined> {
        let ports = await this.serialPort.list();
        return ports.find((port) => port.productId === pid);

    }
    public async findPorts() {
        return await this.serialPort.list();
    }

    public async open(path: string, options?: SerialPort.OpenOptions): Promise<SerialPort> {
        return new Promise<SerialPort>(async (resolve, reject) => {
            const port: SerialPort = new SerialPort(path, options ? options : { baudRate: 115200 }, (error) => {
                if (error) {
                    console.log('Failed to open port: ' + error);
                    reject(error);
                } else {
                    //Communicate with the device
                    console.log('Porta aberta');
                    resolve(port);
                }
            });
        });
    }

    public setReadLineParser(port: SerialPort): SerialPort.parsers.Readline {
        const parser = new SerialPort.parsers.Readline({ encoding: 'utf8', delimiter: '\n' });
        port.pipe(parser)
        return parser;
    }

    private readInfo(data: string, window: BrowserWindow) {
        switch (data[0]) {
            case '1':
                window.webContents.send('l1', data[1]);
                break;
            case '2':
                window.webContents.send('l2', data[1]);
                break;
            case '3':
                window.webContents.send('l3', data[1]);
                break;
            case 't':
                let temp = parseFloat(data.slice(1));
                window.webContents.send('t', temp);
                break;
            default:
                break;
        }
    }

    private readAnswer(data: string, window: BrowserWindow) {
        switch (data[0]) {
            case '1':
                window.webContents.send('l1', data[1]);
                break;
            case '2':
                window.webContents.send('l2', data[1]);
                break;
            case '3':
                window.webContents.send('l3', data[1]);
                break;
            case 't':
                let temp = parseFloat(data.slice(1));
                window.webContents.send('t', temp);
                break;
            default:
                break;
        }
    }

    public setupListeners(window: BrowserWindow) {
        this.findPortByPID(DEVICE_PID).then(portInfo => {
            if (portInfo) {
                this.open(portInfo.path).then(port => {
                    this.portOpened = port;
                    let parser = this.setReadLineParser(port);
                    parser.on('data', (data: string) => {
                        console.log('dados recebidos: ', data);
                        switch (data[0]) {
                            case 'a': // resposta a um envio prévio
                                this.readAnswer(data.slice(1), window);
                                break;
                            case 'i': // informação enviada sem uma requisição
                                this.readInfo(data.slice(1), window);
                                break;
                            default:
                                break;
                        }
                    })
                    console.log('Listener serial setado');
                })
            }
        })
    }

    public sendData(data: string, callback?: Function) {
        // TODO: Fazer o port Ready com uma promise

        if (!this.portOpened) {
            return
        }
        this.portOpened.setEncoding('utf-8');
        console.log('escrevendo na serial...');
        this.portOpened.write(data, callback ? callback.bind : (error) => { console.log('pronto...', error ? error : '') });

    }

    public closePort() {
        this.portOpened?.close();
    }
}