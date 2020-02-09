"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var isMac = process.platform === 'darwin';
var template = function (app, win) {
    return __spreadArrays((isMac
        ? [
            {
                label: app.name,
                submenu: [
                    { role: 'about' },
                    { type: 'separator' },
                    { role: 'services' },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'hideothers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' },
                ]
            },
        ]
        : []), [
        // { role: 'fileMenu' }
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: __spreadArrays([
                { role: 'minimize' },
                { role: 'zoom' }
            ], (isMac
                ? [
                    { type: 'separator' },
                    { role: 'front' },
                    { role: 'reload' },
                    { type: 'separator' },
                    { role: 'window' },
                ]
                : [{ role: 'close' }, { role: 'reload' },]))
        },
        {
            label: 'developer',
            submenu: [
                {
                    label: 'toggle devtools',
                    accelerator: 'F12',
                    click: function () {
                        win.webContents.toggleDevTools();
                    }
                },
            ]
        },
    ]);
};
exports["default"] = template;
