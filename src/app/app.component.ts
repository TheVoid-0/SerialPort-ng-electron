import { Component } from '@angular/core';
import { Color, ScaleType } from '@swimlane/ngx-charts';
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

  // graficos
  multi: any[] = [
    {
      "name": "Temperatura",
      "series": [
        {
          "name": "1990",
          "value": 62000000
        },
        {
          "name": "2010",
          "value": 73000000
        },
        {
          "name": "2011",
          "value": 89400000
        }
      ]
    }
  ];
  view: [number, number] = [700, 300];

  // options
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Year';
  yAxisLabel: string = 'Population';
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
