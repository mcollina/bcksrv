
'use strict';

var server = require('net').createServer()
  , bcksrv = require('./')


server.on('connection', function(conn) {
  var srv = bcksrv()

  srv.register('echo', function(rest, stream, cb) {
    stream.write(rest.join(' '))
    cb()
  })

  conn.pipe(srv).pipe(conn)
})

server.listen(3000)
