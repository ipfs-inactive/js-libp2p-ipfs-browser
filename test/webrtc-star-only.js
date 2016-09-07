/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const multiaddr = require('multiaddr')
const PeerInfo = require('peer-info')
const peerId = require('peer-id')
const parallel = require('run-parallel')
const pull = require('pull-stream')

const libp2p = require('../src')

describe('libp2p-ipfs-browser (webrtc only)', function () {
  this.timeout(15 * 1000)

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
    node2.handle('/echo/1.0.0', (conn) => {
      pull(conn, conn)
    })
    done()
  })

  it('dial from the second node to the first node', (done) => {
    node1.dialByPeerInfo(peer2, '/echo/1.0.0', (err, conn) => {
      expect(err).to.not.exist
      setTimeout(check, 500)

      function check () {
        const text = 'hello'
        const peers1 = node1.peerBook.getAll()
        expect(err).to.not.exist
        expect(Object.keys(peers1)).to.have.length(1)
        const peers2 = node2.peerBook.getAll()
        expect(err).to.not.exist
        expect(Object.keys(peers2)).to.have.length(1)

        pull(
          pull.values([Buffer(text)]),
          conn,
          pull.collect((err, data) => {
            expect(err).to.not.exist
            expect(data[0].toString()).to.equal(text)
            done()
          })
        )
      }
    })
  })

  it('node1 hangUp node2', (done) => {
    node1.hangUpByPeerInfo(peer2, (err) => {
      expect(err).to.not.exist
      setTimeout(check, 500)

      function check () {
        const peers = node1.peerBook.getAll()
        expect(err).to.not.exist
        expect(Object.keys(peers)).to.have.length(0)
        expect(Object.keys(node1.swarm.muxedConns)).to.have.length(0)
        done()
      }
    })
  })

  it('create a third node and check that discovery works', (done) => {
    const id3 = peerId.create()
    const peer3 = new PeerInfo(id3)
    const mh3 = multiaddr('/libp2p-webrtc-star/ip4/127.0.0.1/tcp/15555/ws/ipfs/' + id3.toB58String())
    peer3.multiaddr.add(mh3)

    node1.discovery.on('peer', (peerInfo) => {
      node1.dialByPeerInfo(peerInfo, () => {})
    })
    node2.discovery.on('peer', (peerInfo) => {
      node2.dialByPeerInfo(peerInfo, () => {})
    })

    const node3 = new libp2p.Node(peer3)
    node3.start(() => {
      setTimeout(() => {
        expect(Object.keys(node1.swarm.muxedConns).length).to.equal(1)
        expect(Object.keys(node2.swarm.muxedConns).length).to.equal(1)
        done()
      }, 2000)
    })
  })
})
