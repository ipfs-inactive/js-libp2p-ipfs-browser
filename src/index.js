'use strict'

const Swarm = require('libp2p-swarm')
const PeerInfo = require('peer-info')
const WS = require('libp2p-websockets')
const WebRTCStar = require('libp2p-webrtc-star')
const spdy = require('libp2p-spdy')

exports = module.exports

exports.Node = function Node (peerInfo) {
  if (!(this instanceof Node)) {
    return new Node(peerInfo)
  }
  if (!peerInfo) {
    peerInfo = new PeerInfo()
  }

  this.peerInfo = peerInfo

  // Swarm
  this.swarm = new Swarm(peerInfo)
  this.swarm.connection.addStreamMuxer(spdy)
  this.swarm.connection.reuse()

  this.start = (callback) => {
    // if we have `webrtc-star` addrs, then add
    // the WebRTCStar transport
    const wstar = new WebRTCStar()
    if (wstar.filter(peerInfo.multiaddrs).length > 0) {
      this.swarm.transport.add('wstar', wstar)
      wstar.discovery.on('peer', (peerInfo) => {
        this.swarm.dial(peerInfo) // warm up a conn
      })
      this.swarm.listen((err) => {
        if (err) {
          return callback(err)
        }
        // WebSockets needs to be added after because
        // it can't have a listener on the browser
        this.swarm.transport.add('ws', new WS())
        callback()
      })
    } else {
      // if just WebSockets, no thing to listen
      this.swarm.transport.add('ws', new WS())
      callback()
    }
  }

  this.routing = null
  this.records = null

  this.dial = () => {
    throw new Error('THIS WILL BE EQUIVALENT TO THE ROUTED HOST FEATURE, IT WILL FIGURE OUT EVERYTHING :D')
  }
}
