/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const multiaddr = require('multiaddr')
const PeerInfo = require('peer-info')
const peerId = require('peer-id')
const parallel = require('run-parallel')
const bl = require('bl')

const libp2p = require('../src')

describe('libp2p-ipfs-browser (webrtc only)', function () {
  this.timeout(60 * 1000)

  let peer1
  let peer2
  let node1
  let node2

  it('create two peerInfo with webrtc-star addrs', (done) => {
    const id1 = peerId.create()
    peer1 = new PeerInfo(id1)
    const mh1 = multiaddr('/libp2p-webrtc-star/ip4/127.0.0.1/tcp/15555/ws/ipfs/' + id1.toB58String())
    peer1.multiaddr.add(mh1)

    const id2 = peerId.create()
    peer2 = new PeerInfo(id2)
    const mh2 = multiaddr('/libp2p-webrtc-star/ip4/127.0.0.1/tcp/15555/ws/ipfs/' + id2.toB58String())
    peer2.multiaddr.add(mh2)

    done()
  })

  it('create two libp2p nodes with those peers', (done) => {
    node1 = new libp2p.Node(peer1)
    node2 = new libp2p.Node(peer2)
    done()
  })

  it('listen on the two libp2p nodes', (done) => {
    parallel([
      node1.start,
      node2.start
    ], done)
  })

  it('handle a protocol on the first node', (done) => {
    node2.swarm.handle('/echo/1.0.0', (conn) => {
      conn.pipe(conn)
    })
    done()
  })

  it('dial from the second node to the first node', (done) => {
    node1.swarm.dial(peer2, '/echo/1.0.0', (err, conn) => {
      const text = 'hello'
      expect(err).to.not.exist
      conn.pipe(bl((err, data) => {
        expect(err).to.not.exist
        expect(data.toString()).to.equal(text)
        done()
      }))
      conn.write(text)
      conn.end()
    })
  })

  it('create a third node and check that discovery works', (done) => {
    const id3 = peerId.create()
    const peer3 = new PeerInfo(id3)
    const mh3 = multiaddr('/libp2p-webrtc-star/ip4/127.0.0.1/tcp/15555/ws/ipfs/' + id3.toB58String())
    peer3.multiaddr.add(mh3)

    const node3 = new libp2p.Node(peer3)
    node3.start(() => {
      setTimeout(() => {
        expect(Object.keys(node1.swarm.muxedConns).length).to.equal(2)
        expect(Object.keys(node2.swarm.muxedConns).length).to.equal(2)
        done()
      }, 1000)
    })
  })
})
