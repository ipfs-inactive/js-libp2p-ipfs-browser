/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const multiaddr = require('multiaddr')
const PeerInfo = require('peer-info')
const PeerId = require('peer-id')
const pull = require('pull-stream')
const goodbye = require('pull-goodbye')

const libp2p = require('../src')
const rawPeer = require('./peer.json')
const id = PeerId.createFromPrivKey(rawPeer.privKey)

describe('libp2p-ipfs-browser (websockets only)', function () {
  this.timeout(20 * 1000)

  let peerB
  let nodeA

  before((done) => {
    const mh = multiaddr('/ip4/127.0.0.1/tcp/9200/ws/ipfs/' + rawPeer.id)
    peerB = new PeerInfo(id)
    peerB.multiaddr.add(mh)
    done()
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

  it('stress test: one big write', (done) => {
    const message = new Buffer(1000000).fill('a')

    nodeA.dialByPeerInfo(peerB, '/echo/1.0.0', (err, conn) => {
      expect(err).to.not.exist

      const s = goodbye({
        soruce: pull.values([message]),
        sink: pull.collect((err, data) => {
          expect(err).to.not.exist
          expect(data).to.be.eql([message])
          done()
        })
      })

      pull(s, conn, s)
    })
  })

  it('stress test: many writes in 2 batches', (done) => {
    let expected = ''
    let counter = 0

    nodeA.dialByPeerInfo(peerB, '/echo/1.0.0', (err, conn) => {
      expect(err).to.not.exist

      const values = []
      while (++counter < 10000) {
        values.push(Buffer(`${counter} `))
        expected += `${counter} `
      }

      while (++counter < 20000) {
        values.push(Buffer(`${counter} `))
        expected += `${counter} `
      }

      const s = goodbye({
        soruce: pull.values(values),
        sink: pull.collect((err, data) => {
          expect(err).to.not.exist
          expect(
            Buffer.concat(data).toString()
          ).to.be.eql(
            expected
          )

          done()
        })
      })

      pull(s, conn, s)
    })
  })

  it('stop the libp2pnode', (done) => {
    nodeA.stop(done)
  })
})
