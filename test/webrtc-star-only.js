/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const multiaddr = require('multiaddr')
const PeerInfo = require('peer-info')
const PeerId = require('peer-id')
const parallel = require('async/parallel')
const pull = require('pull-stream')

const Node = require('../src')

describe('libp2p-ipfs-browser (webrtc only)', () => {
  let peer1
  let peer2
  let node1
  let node2

  it('create two peerInfo with webrtc-star addrs', (done) => {
    parallel([
      (cb) => PeerId.create(cb),
      (cb) => PeerId.create(cb)
    ], (err, ids) => {
      expect(err).to.not.exist

      peer1 = new PeerInfo(ids[0])
      const mh1 = multiaddr('/libp2p-webrtc-star/ip4/127.0.0.1/tcp/15555/ws/ipfs/' + ids[0].toB58String())
      peer1.multiaddr.add(mh1)

      peer2 = new PeerInfo(ids[1])
      const mh2 = multiaddr('/libp2p-webrtc-star/ip4/127.0.0.1/tcp/15555/ws/ipfs/' + ids[1].toB58String())
      peer2.multiaddr.add(mh2)

      done()
    })
  })

  it('create two libp2p nodes with those peers', (done) => {
    node1 = new Node(peer1, null, { webRTCStar: true })
    node2 = new Node(peer2, null, { webRTCStar: true })
    done()
  })

  it('listen on the two libp2p nodes', (done) => {
    parallel([
      (cb) => {
        node1.start(cb)
      },
      (cb) => {
        node2.start(cb)
      }
    ], done)
  })

  it('handle a protocol on the first node', (done) => {
    node2.handle('/echo/1.0.0', (protocol, conn) => {
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
    let counter = 0

    function check () {
      if (++counter === 3) {
        expect(Object.keys(node1.swarm.muxedConns).length).to.equal(1)
        expect(Object.keys(node2.swarm.muxedConns).length).to.equal(1)
        done()
      }
    }

    PeerId.create((err, id3) => {
      expect(err).to.not.exist

      const peer3 = new PeerInfo(id3)
      const mh3 = multiaddr('/libp2p-webrtc-star/ip4/127.0.0.1/tcp/15555/ws/ipfs/' + id3.toB58String())
      peer3.multiaddr.add(mh3)

      node1.discovery.on('peer', (peerInfo) => node1.dialByPeerInfo(peerInfo, check))
      node2.discovery.on('peer', (peerInfo) => node2.dialByPeerInfo(peerInfo, check))

      const node3 = new Node(peer3, null, { webRTCStar: true })
      node3.start(check)
    })
  })
})
