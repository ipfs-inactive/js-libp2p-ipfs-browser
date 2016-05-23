const w = require('webrtcsupport')

require('./websockets-only')

if (w.support) {
  require('./webrtc-star-only')
  require('./webrtc-star-and-websockets')
}
