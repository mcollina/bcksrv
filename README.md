bcksrv
======


__bcksrv__ is a tiny module to build command servers easily,
securely and error-safe.

Example
-------

```js
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
```

Acknowledgements
----------------

This project was kindly sponsored by [nearForm](http://nearform.com).


License
-------

MIT
