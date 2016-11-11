# js-libp2p-ipfs-browser

![](https://github.com/libp2p/js-libp2p/raw/1e3e9db84d1e5fdd5682cc5e0fdaabfcd07ad55a/img/js-libp2p-ipfs-browser.png?raw=true)

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-libp2p-ipfs-browser/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-libp2p-ipfs-browser?branch=master)
[![Travis CI](https://travis-ci.org/ipfs/js-libp2p-ipfs-browser.svg?branch=master)](https://travis-ci.org/ipfs/js-libp2p-ipfs-browser)
[![Circle CI](https://circleci.com/gh/ipfs/js-libp2p-ipfs-browser.svg?style=svg)](https://circleci.com/gh/ipfs/js-libp2p-ipfs-browser)
[![Dependency Status](https://david-dm.org/ipfs/js-libp2p-ipfs-browser.svg?style=flat-square)](https://david-dm.org/ipfs/js-libp2p-ipfs-browser) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D4.0.0-orange.svg?style=flat-square)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/libp2p-ipfs-browser.svg)](https://saucelabs.com/u/libp2p-ipfs-browser)

> libp2p build (module) used in js-ipfs when running it on the browser.

This libp2p build has support for:

- WebSockets and WebRTC
- SPDY stream multiplexing
- secio encrypted channels
- Identify STUN protocol

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
  - [start](#start)
  - [stop](#stop)
  - [dialById](#dialbyid)
  - [dialByMultiaddr](#dialbymultiaddr)
  - [dialByPeerInfo](#dialbypeerinfo)
  - [hangUpById](#hangupbyid)
  - [hangUpByMultiaddr](#hangupbymultiaddr)
  - [hangUpByPeerInfo](#hangupbypeerinfo)
  - [handle](#handle)
  - [unhandle](#unhandle)
  - [discovery](#discovery)
- [Contribute](#contribute)
- [License](#license)

## Install

```sh
npm install --save libp2p-ipfs-browser
```

## Usage

```js
const libp2p-ipfs-browser = require('libp2p-ipfs-browser')

libp2p-ipfs-browser.start()
```

## API

### start
### stop
### dialById
### dialByMultiaddr
### dialByPeerInfo
### hangUpById
### hangUpByMultiaddr
### hangUpByPeerInfo
### handle
### unhandle
### discovery

This will create a new instance of an `events` `EventEmitter`.

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-libp2p-ipfs-browser/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)
