# UsbInterfaceNgElectron


## COMANDOS - ENVIO

Lista de comandos que são enviados ao MC 

-c[led][bool]\n - [bool]= 0 ou 1, controla o [led = 1,2,3]. Ex: 'c11\n'

-ca[bool]\n - [bool]= 0 ou 1, controla se o MC deve enviar dados automaticamente ou não. Ex: 'ca1\n'

OBS: A quebra de linha '\n' é o delimitador dos comandos

## COMANDOS - RECEBIMENTO

-a[led][bool] - [bool]= 0 ou 1, controla o [led = 1,2,3] enviando uma resposta ao programa de como o led está. Ex: 'a10\n'

-at[n] - [n = qualquer número em string] informa ao programa a temperatura;

-i[led][bool] - [bool]= 0 ou 1, controla o [led = 1,2,3] informa o estado do led. Ex: 'i31\n'

-it[n] - [n = qualquer número em string] informa ao programa a temperatura; Ex: 'i20.30'

A ou I? O 'a' seria para diferenciar um  comando que foi enviado ao programa em decorrência de uma requisição prévia, ou seja, o programa solicitou aquela informação, já o 'i' seria para identificar que essa informação está sendo enviada por decisão do MC sem o programa ter necessariamente solicitado pela informação
