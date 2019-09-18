## Prerequisites ##
## Ionic Framework
```sh
npm install
npm install -g ionic
```
### In order to translate web socket into raw socket, need to use websockify: ###
https://github.com/novnc/websockify

Usage:
```sh
cd websockify\other\js
node websockify.js 1880 localhost:1883
```
(here 1889 is the incoming port for websocket client from the browser, 1883 is the port to forward and receive converted tcp packets) 

Localhost:
```sh
ionic serve
```
## In order to be able to access the web page remotely (not from localhost):
```sh
ionic serve --address YOUR_IP_ADDRESS
```