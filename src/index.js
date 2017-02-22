'use strict'

const WS = require('libp2p-websockets')
const WebRTCStar = require('libp2p-webrtc-star')
const spdy = require('libp2p-spdy')
const multiplex = require('libp2p-multiplex')
const secio = require('libp2p-secio')
const Railing = require('libp2p-railing')
const libp2p = require('libp2p')

class Node extends libp2p {
  constructor (peerInfo, peerBook, options) {
    options = options || {}
    const webRTCStar = new WebRTCStar()

    const modules = {
      transport: [
        new WS(),
        webRTCStar
      ],
      connection: {
        muxer: options.muxer || [spdy, multiplex],
        crypto: [
          secio
        ]
      },
      discovery: []
    }

    if (options.webRTCStar) {
      modules.discovery.push(webRTCStar.discovery)
    }

    if (options.bootstrap && process.env.IPFS_BOOTSTRAP) {
      const r = new Railing(options.bootstrap)
      modules.discovery.push(r)
    }

    super(modules, peerInfo, peerBook, options)
  }
}

module.exports = Node
