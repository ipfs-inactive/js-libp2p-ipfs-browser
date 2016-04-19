'use strict'

const gulp = require('gulp')
const multiaddr = require('multiaddr')
const Node = require('libp2p-ipfs').Node
const Peer = require('peer-info')
const Id = require('peer-id')

let node
const rawPeer = require('./test/peer.json')
const id = new Id(rawPeer.id, rawPeer.privKey, rawPeer.pubKey)

gulp.task('libnode:start', (done) => {
  const mh = multiaddr('/ip4/127.0.0.1/tcp/9090/websockets')
  const peer = new Peer(id)
  peer.multiaddr.add(mh)

  node = new Node(peer)
  node.start(() => {
    node.swarm.handle('/echo/1.0.0', (conn) => {
      conn.pipe(conn)
    })
    done()
  })
})

gulp.task('libnode:stop', (done) => {
  node.swarm.close(done)
})

gulp.task('test:browser:before', ['libnode:start'])
gulp.task('test:node:before', ['libnode:start'])
gulp.task('test:browser:after', ['libnode:stop'])
gulp.task('test:node:after', ['libnode:stop'])

require('aegir/gulp')(gulp)
