# PurpleWave REST API for results-service

![Code Coverage](./coverage.png)

## About

CRD Support models
* GlobalEntries
* Bid

## Dependencies

**clone and install all dependencies before starting**

node modules via [npm](https://www.npmjs.org/) with *npm install*

[cliqutility](https://github.com/PurpleWave/cliqutility) *parent sibling dir relationship*

[common](https://github.com/PurpleWave/common) *sibling dir relationship*

dir structure
* /
* /config = cliqutility/*/config
* /api
* /api/common
* /api/results-service

## Startup

### Options

* -p port that service should listen to incoming requests on
* -s socket file that service should listen to incoming requests on *DEFAULT = /var/run/node/bids.sock*
* -w number of child workers to spawn *DEFAULT = # of cpus on machine*

*Note: if both port and socket are defined port will be used*

```
node /path/to/bids-api.js -p 9999 -w 2
```
Will start the server with 2 processes handling incoming requests on port 9999

```
node /path/to/bids-api.js -s bids.sock -w 6
```
Will start the server listening on unix file socket bids.sock in the
current working directory with 6 proceeses handling incoming requests
