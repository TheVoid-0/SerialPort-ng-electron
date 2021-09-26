import { Component } from '@angular/core';
import { IpcService } from './services/ipc.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'usb-interface-ng-electron';
  autoReadStatus = true;
  conexao = '';
  switchL1 = false;
  switchL2 = true;
  switchL3 = false;

  constructor(private _ipcService: IpcService) {
    this._ipcService.on('serial-page', 'l1', (event, args) => {
      console.log('recebido: ', args);
    });
  }

  sendMessage() {
    this._ipcService.sendAndExpectResponse('serial-page', { data: 'teste' }).subscribe((data) => {
      console.log(data);
    }, err => console.log(err));
  }
}
