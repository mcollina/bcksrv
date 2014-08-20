
'use strict';

var server = require('net').createServer()
  , srv    = require('./')()

srv.register('echo', function(rest, stream, cb) {
  stream.write(rest.join(' '))
  stream.write('\n')
  cb()
})

srv.register('err', function(rest, stream, cb) {
  cb(new Error('muahha'))
})

server.on('connection', function(conn) {
  conn.pipe(srv.stream()).pipe(conn)
})

server.listen(3000)
