/**
 * Created by sinamasnadi on 11/4/16.
 */

var spawn = require('child_process').spawn;

module.exports = exports = pdfInfo;

function pdfInfo() {
    return {
        "options": [],
        "_input": null,
        "lambdaExecPath": false,
        "option": function (option) {
            this.options.push(option);
            return this;
        },
        "input": function (file) {
            this._input = file;
            return this;
        },
        "lambda": function (path) {
            this.lambdaExecPath = path;
            return this;
        },
        "exec": function (callback) {
            var _this = this;
            if (!_this.input) {
                return callback.call(_this, 'Input not selected');
            }

            var process = spawn(_this.lambdaExecPath ? _this.lambdaExecPath : 'pdfinfo', _this.options.concat([_this._input]));
            process.stdin.on('error', callback);
            process.stdout.on('error', callback);

            var _data = [];
            var totalBytes = 0;
            process.stdout.on('data', function (data) {
                totalBytes += data.length;
                _data.push(data);
            });

            process.on('close', function () {
                var buffer = Buffer.concat(_data, totalBytes);
                var input = buffer.toString();
                if (input === '' || input.includes('Error')) {
                    return callback.call(_this, 'File is not PDF');
                }
                var lines = input.split('\n');
                var output = {};
                lines.forEach(function (line) {
                    var key = line.substr(0, line.indexOf(':'));
                    var value = line.substr(line.indexOf(':') + 1);
                    while (value.charAt(0) === ' ') {
                        value = value.substr(1);
                    }
                    output[key] = value;
                });
                return callback.call(_this, null, output);
            });

            process.on('exit', function () {
                process.kill();
            });
        }
    }
}
