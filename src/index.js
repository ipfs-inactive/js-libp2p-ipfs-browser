'use strict'

const Swarm = require('libp2p-swarm')
const Peer = require('peer-info')
const WS = require('libp2p-websockets')
const spdy = require('libp2p-spdy')

exports = module.exports

exports.Node = function Node (peerInfo) {
  if (!(this instanceof Node)) {
    return new Node(peerInfo)
  }
  if (!peerInfo) {
    peerInfo = new Peer()
  }

  this.peerInfo = peerInfo

  // Swarm
  this.swarm = new Swarm(peerInfo)
  this.swarm.transport.add('ws', new WS())
  this.swarm.connection.addStreamMuxer(spdy)
  this.swarm.connection.reuse()

  this.start = (callback) => {
    // Yeah empty function, we can't actually do anything here, yet.
    callback()
  }

  this.routing = null
  this.records = null

  this.dial = () => {
    throw new Error('THIS WILL BE EQUIVALENT TO THE ROUTED HOST FEATURE, IT WILL FIGURE OUT EVERYTHING :D')
  }
}
