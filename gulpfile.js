'use strict'

const gulp = require('gulp')
const multiaddr = require('multiaddr')
const Node = require('libp2p-ipfs-nodejs')
const PeerInfo = require('peer-info')
const PeerId = require('peer-id')
const pull = require('pull-stream')

const sigServer = require('libp2p-webrtc-star/src/sig-server')
let server

let node
const rawPeer = require('./test/peer.json')

gulp.task('libnode:start', (done) => {
  let count = 0
  const ready = () => ++count === 2 ? done() : null

  sigServer.start({
    port: 15555
  }, (err, _server) => {
    if (err) {
      throw err
    }
    server = _server
    ready()
  })

  PeerId.createFromJSON(rawPeer, gotId)

  function gotId (err, pid) {
    if (err) {
      return done(err)
    }
    const peer = new PeerInfo(pid)

    const ma = multiaddr('/ip4/127.0.0.1/tcp/9200/ws')
    peer.multiaddr.add(ma)

    node = new Node(peer)
    node.start(() => {
      node.handle('/echo/1.0.0', (protocol, conn) => {
        pull(conn, conn)
      })
      ready()
    })
  }
})

gulp.task('libnode:stop', (done) => {
  setTimeout(() => {
    node.stop((err) => {
      if (err) {
        throw err
      }
      server.stop(done)
    })
  }, 2000)
})

gulp.task('test:browser:before', ['libnode:start'])
gulp.task('test:node:before', ['libnode:start'])
gulp.task('test:browser:after', ['libnode:stop'])
gulp.task('test:node:after', ['libnode:stop'])

require('aegir/gulp')(gulp)
