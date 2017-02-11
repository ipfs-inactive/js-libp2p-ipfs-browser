'use strict'

const PeerInfo = require('peer-info')
const Node = require('../../../src')
const multiaddr = require('multiaddr')

PeerInfo.create((err, peerInfo) => {
  if (err) {
    throw err
  }

  const peerIdStr = peerInfo.id.toB58String()
  const ma = `/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss/ipfs/${peerIdStr}`

  peerInfo.multiaddr.add(multiaddr(ma))

  const node = new Node(peerInfo, undefined, { webRTCStar: true })

  node.discovery.on('peer', (peerInfo) => {
    console.log('Discovered peer', peerInfo.id.toB58String())
  })

  node.start((err) => {
    if (err) {
      throw err
    }
    console.log('Node is listening')
  })
})
