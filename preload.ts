(window as any).ipc = require('electron').ipcRenderer;
(window as any).fs = require('fs');
(window as any).jsForce = require('jsForce');

console.log('**** Preload ****');
