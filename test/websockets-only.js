/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const multiaddr = require('multiaddr')
const PeerInfo = require('peer-info')
const PeerId = require('peer-id')
const pull = require('pull-stream')
const goodbye = require('pull-goodbye')
const serializer = require('pull-serializer')

const libp2p = require('../src')
const rawPeer = require('./peer.json')
const id = PeerId.createFromPrivKey(rawPeer.privKey)

describe('libp2p-ipfs-browser (websockets only)', function () {
  let peerB
  let nodeA

  before((done) => {
    const mh = multiaddr('/ip4/127.0.0.1/tcp/9200/ws/ipfs/' + rawPeer.id)
    peerB = new PeerInfo(id)
    peerB.multiaddr.add(mh)
    done()
  })

  after((done) => {
    nodeA.stop(done)
  })

  it('create libp2pNode', () => {
    nodeA = new libp2p.Node()
  })

  it('start libp2pNode', (done) => {
    nodeA.start(done)
  })

  // General connectivity tests

  it('libp2p.dialByMultiaddr nodeA to nodeB', (done) => {
    nodeA.dialByMultiaddr(peerB.multiaddrs[0], (err) => {
      expect(err).to.not.exist
      // Some time for Identify to finish
      setTimeout(check, 500)

      function check () {
        const peers = nodeA.peerBook.getAll()
        expect(err).to.not.exist
        expect(Object.keys(peers)).to.have.length(1)
        done()
      }
      // TODO confirm that we got the pubkey through identify
    })
  })

  it('libp2p.dialByMultiaddr on Protocol nodeA to nodeB', (done) => {
    nodeA.dialByMultiaddr(peerB.multiaddrs[0], '/echo/1.0.0', (err, conn) => {
      expect(err).to.not.exist
      const peers = nodeA.peerBook.getAll()
      expect(err).to.not.exist
      expect(Object.keys(peers)).to.have.length(1)

      pull(
        pull.values([Buffer('hey')]),
        conn,
        pull.collect((err, data) => {
          expect(err).to.not.exist
          expect(data).to.be.eql([Buffer('hey')])
          done()
        })
      )
    })
  })

  it('libp2p.hangupByMultiaddr nodeA to nodeB', (done) => {
    nodeA.hangUpByMultiaddr(peerB.multiaddrs[0], (err) => {
      expect(err).to.not.exist
      setTimeout(check, 500)

      function check () {
        const peers = nodeA.peerBook.getAll()
        expect(err).to.not.exist
        expect(Object.keys(peers)).to.have.length(0)
        expect(Object.keys(nodeA.swarm.muxedConns)).to.have.length(0)
        done()
      }
    })
  })

  it('libp2p.dialByPeerInfo nodeA to nodeB', (done) => {
    nodeA.dialByPeerInfo(peerB, (err) => {
      expect(err).to.not.exist
      // Some time for Identify to finish
      setTimeout(check, 500)

      function check () {
        const peers = nodeA.peerBook.getAll()
        expect(err).to.not.exist
        expect(Object.keys(peers)).to.have.length(1)
        done()
      }
      // TODO confirm that we got the pubkey through identify
    })
  })

  it('libp2p.dialByPeerInfo on Protocol nodeA to nodeB', (done) => {
    nodeA.dialByPeerInfo(peerB, '/echo/1.0.0', (err, conn) => {
      expect(err).to.not.exist
      const peers = nodeA.peerBook.getAll()
      expect(err).to.not.exist
      expect(Object.keys(peers)).to.have.length(1)

      pull(
        pull.values([Buffer('hey')]),
        conn,
        pull.collect((err, data) => {
          expect(err).to.not.exist
          expect(data).to.be.eql([Buffer('hey')])
          done()
        })
      )
    })
  })

  it('libp2p.hangupByPeerInfo nodeA to nodeB', (done) => {
    nodeA.hangUpByPeerInfo(peerB, (err) => {
      expect(err).to.not.exist
      setTimeout(check, 500)

      function check () {
        const peers = nodeA.peerBook.getAll()
        expect(err).to.not.exist
        expect(Object.keys(peers)).to.have.length(0)
        expect(Object.keys(nodeA.swarm.muxedConns)).to.have.length(0)
        done()
      }
    })
  })

  // NOTE, these dialById only works if a previous dial was made
  // until we have PeerRouting
  it.skip('libp2p.dialById nodeA to nodeB', (done) => {})
  it.skip('libp2p.dialById on Protocol nodeA to nodeB', (done) => {})
  it.skip('libp2p.hangupById nodeA to nodeB', (done) => {})

  describe('stress', () => {
    it('one big write', (done) => {
      nodeA.dialByPeerInfo(peerB, '/echo/1.0.0', (err, conn) => {
        expect(err).to.not.exist
        const rawMessage = new Buffer(1000000).fill('a')

        const s = serializer(goodbye({
          source: pull.values([rawMessage]),
          sink: pull.collect((err, results) => {
            expect(err).to.not.exist
            expect(results).to.have.length(1)
            expect(Buffer(results[0])).to.have.length(rawMessage.length)
            done()
          })
        }))
        pull(s, conn, s)
      })
    })

    it('many writes', (done) => {
      nodeA.dialByPeerInfo(peerB, '/echo/1.0.0', (err, conn) => {
        expect(err).to.not.exist

        const s = serializer(goodbye({
          source: pull(
            pull.infinite(),
            pull.take(1000),
            pull.map((val) => Buffer(val.toString()))
          ),
          sink: pull.collect((err, result) => {
            expect(err).to.not.exist
            expect(result).to.have.length(1000)
            done()
          })
        }))

        pull(s, conn, s)
      })
    })
  })
})
