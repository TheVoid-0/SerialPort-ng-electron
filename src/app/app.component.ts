import { ChangeDetectorRef, Component, NgZone, OnDestroy } from '@angular/core';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { IpcService } from './services/ipc.service';

// TODO: adicionar Scroll no log status
// TODO: Ajustar o switch do led para retornar ao estado que estava em caso de falha 
// TODO: ajustar grafico
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'usb-interface-ng-electron';
  page = 'serial-page'
  isElectronReady: boolean = false;
  autoReadStatus = true;
  ports: Array<{ path: string }> = [];
  portSelect: { path: string } = { path: '' };
  ledSwitches: Array<{ disabled: boolean, value: boolean }> = [{ disabled: false, value: false }, { disabled: false, value: true }, { disabled: false, value: false }];
  logs: Array<{ date: string, value: string }> = [];

  // graficos
  multi: [{ name: string, series: Array<{ name: string, value: number }> }] = [{ name: 'Temperatura', series: [{ name: new Date().toLocaleString(), value: 0 }] }];
  view: [number, number] = [700, 300];

  // options
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Horário';
  yAxisLabel: string = 'Temperatura';
  timeline: boolean = true;

  colorScheme: Color =
    {
      name: 'teste',
      domain: [
        '#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'
      ],
      group: ScaleType.Linear,
      selectable: true
    };

  constructor(private _ipcService: IpcService, private _changeDetectorRef: ChangeDetectorRef, private _ngZone: NgZone) {
    console.log('Window constructor');
    this._ipcService.initializePageListener(this.page).subscribe(() => {
      console.log('electron ready');
      this.isElectronReady = true;
      this.getPorts();
    });

    this.setupSerialListeners();

  }

  get getLogs() {
    let logs: string[] = [];
    this.logs.forEach(log => {
      logs.push(`${log.date} > ${log.value}`);
    });
    return logs;
  }

  private addLog(message: string) {
    this.logs.push({ date: new Date().toLocaleString(), value: message, });
  }

  getPorts() {
    console.log('buscando portas')
    this.addLog('Buscando portas...');

    this._ipcService.sendAndExpectResponse(`${this.page}-get-ports`).subscribe(({ body }) => {
      console.log('ports', body.ports);
      if (body.ports.length < 1) {
        this.addLog('Nenhuma porta COM disponível!');
      } else {
        this.ports = body.ports;
        this.addLog('Portas disponíveis carregadas');
      }
      this._changeDetectorRef.detectChanges();
    }, error => {
      console.log('erro', error);
      this.addLog('Não foi possível buscar as portas!');
      this._changeDetectorRef.detectChanges();
    });
  }

  openPort(port: { path: string }) {
    this.addLog('Abrindo porta ' + port.path);
    console.log('Abrindo porta', port);
    this._ipcService.sendAndExpectResponse(`${this.page}-post-open-port`, port).subscribe(({ body }) => {
      console.log('open port', body)
      this.addLog(port.path + 'aberta!');
    }, error => {
      this.addLog('Erro ao abrir porta ' + port.path);
    })
  }

  changeLedStatus(event: any, ledSwitchIndex: number) {
    this.ledSwitches[ledSwitchIndex].disabled = true;
    let ledLabel = ledSwitchIndex + 1;
    let message = `${ledLabel}${this.ledSwitches[ledSwitchIndex].value ? '0' : '1'}`;
    console.log('ledSwitch', this.ledSwitches[ledSwitchIndex], 'message', message);


    this.addLog('Alterando status do L' + ledLabel);
    let persistedEvent = { ...event };

    this._ipcService.sendAndExpectResponse(`${this.page}-post-led-status`, message).subscribe(({ body }) => {
      this.ledSwitches[ledSwitchIndex].disabled = false;
      this.ledSwitches[ledSwitchIndex].value = !this.ledSwitches[ledSwitchIndex].value;
      this.addLog(`Status do L${ledLabel} alterado`);
      this._changeDetectorRef.detectChanges();
    }, error => {
      this.ledSwitches[ledSwitchIndex].disabled = false;
      this.ledSwitches[ledSwitchIndex] = this.ledSwitches[ledSwitchIndex];
      persistedEvent.source.checked = this.ledSwitches[ledSwitchIndex].value;
      this.addLog(`Erro ao alterar status do L${ledLabel}`);
      this._changeDetectorRef.detectChanges();
    })
  }

  changeAutoReadStatus() {
    console.log('changeAutoReadStatus', this.autoReadStatus);
    this.addLog('Alterando autoread status...');
    this._ipcService.sendAndExpectResponse(`${this.page}-post-autoread`, this.autoReadStatus ? '1' : '0').subscribe(({ body }) => {
      console.log('autoReadStatus', body.message);
      this.addLog('autoread status alterado');
      this._changeDetectorRef.detectChanges();
    }, (error) => {
      console.log('autoReadStatus', error);
      this.addLog('não foi possível alterar o autoread status!');
    });
  }

  ngOnDestroy(): void {
    this._ipcService.removeAllFromPage(this.page);
  }

  sendInitialConfigs() {
    this.addLog('enviando configurações iniciais')
    this._ipcService.sendAndExpectResponse(`${this.page}-post-autoread`, this.autoReadStatus).subscribe(({ body }) => {

    });


    for (let i = 1; i >= this.ledSwitches.length; i++) {
      this._ipcService.sendAndExpectResponse(`${this.page}-post-led-status`, i.toString() + this.ledSwitches[i] ? '1' : '0');
    }
  }

  setupSerialListeners() {
    // LED SWITCH LISTENERS
    for (let i = 1; i >= this.ledSwitches.length; i++) {
      let label = 'l' + i;
      this._ipcService.on(this.page, label, (event, args) => {
        console.log(label, args);
        this.ledSwitches[i].value = args == '1' ? true : false;
      });
    }

    this._ipcService.on(this.page, 't', (event, args) => {
      console.log('t', args);
      if (this.multi[0].series.length < 1) {
        this.multi = [{ name: 'Temperatura', series: [{ name: new Date().toLocaleString(), value: args }] }];
      }
      this.multi[0].series.push({ name: new Date().toLocaleString(), value: args });
    });
  }
}
