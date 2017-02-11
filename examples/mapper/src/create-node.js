'use strict'

const PeerInfo = require('peer-info')
const Node = require('../../../src')
const multiaddr = require('multiaddr')

function createNode (callback) {
  PeerInfo.create((err, peerInfo) => {
    if (err) {
      return callback(err)
    }

    const peerIdStr = peerInfo.id.toB58String()
    const ma = `/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss/ipfs/${peerIdStr}`

    peerInfo.multiaddr.add(multiaddr(ma))

    const node = new Node(peerInfo, undefined, { webRTCStar: true })

    node.idStr = peerIdStr
    callback(null, node)

    /*
    node.discovery.on('peer', (peerInfo) => {
      console.log('Discovered peer', peerInfo.id.toB58String())
    })

    node.start((err) => {
      if (err) {
        return console.log('WebRTC not supported')
      }

      console.log('Node is listening')

      // node.stop((err) => {})
    })
    */
  })
}

module.exports = createNode
