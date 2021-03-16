//require('./logger');
const tracer = require('dd-trace').init();
require('newrelic');
const os = require('os');
const fs = require('fs');
const cluster = require('cluster');
const argv = require('minimist')(process.argv.slice(2));
const app = require('./lib');

let workers = os.cpus().length;

if (argv.w) {
    workers = argv.w;
}

let port, socket;
if (argv.p) {
    port = argv.p;
} else {
    socket = argv.s || '/var/run/node/bids.sock';
}

if (cluster.isMaster) {
    if (socket) {
        fs.access(socket, fs.constants.F_OK, (err) => {
            if (!err) {
                fs.unlinkSync(socket);
            }
        });
    }

    while ((workers -= 1)) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.error(`Worker died: ${ worker.id }, Code: ${ code }, Signal: ${ signal }`);
        cluster.fork();
    });
} else {
    if (port) {
        app.listen(port, () => {
            console.log(`Listening on port ${ port }.`);
        });
    } else {
        app.listen(socket, () => {
            console.log(`Listening on socket ${ socket }.`);
            fs.access(socket, fs.constants.F_OK, (err) => {
                if (err) {
                    process.exit(1);
                } else {
                    fs.chmodSync(socket, '0777');
                }
            });
        });
    }
}
