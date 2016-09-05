'use strict'

const gulp = require('gulp')
const multiaddr = require('multiaddr')
const Node = require('libp2p-ipfs').Node
const Peer = require('peer-info')
const Id = require('peer-id')
const pull = require('pull-stream')

const sigServer = require('libp2p-webrtc-star/src/signalling-server')
let sigS

let node
const rawPeer = require('./test/peer.json')
const id = Id.createFromPrivKey(rawPeer.privKey)

gulp.task('libnode:start', (done) => {
  const mh = multiaddr('/ip4/127.0.0.1/tcp/9200/ws')
  const peer = new Peer(id)
  peer.multiaddr.add(mh)

  node = new Node(peer)
  node.start(() => {
    node.handle('/echo/1.0.0', (conn) => {
      pull(conn, conn)
    })
    ready()
  })

  let count = 0
  const ready = () => ++count === 2 ? done() : null

  sigS = sigServer.start(15555, ready)
})

gulp.task('libnode:stop', (done) => {
  setTimeout(() => {
    node.stop((err) => {
      if (err) {
        throw err
      }
      sigS.stop(done)
    })
  }, 2000)
})

gulp.task('test:browser:before', ['libnode:start'])
gulp.task('test:node:before', ['libnode:start'])
gulp.task('test:browser:after', ['libnode:stop'])
gulp.task('test:node:after', ['libnode:stop'])

require('aegir/gulp')(gulp)
