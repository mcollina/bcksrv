
var tape    = require('tape')
  , bcksrv  = require('./')

tape('serve a basic command', function(t) {
  t.plan(2)

  var server = bcksrv()

  server.register('hello', function(args, stream, cb) {
    t.deepEqual(args, ['matteo'])
    cb()
  })

  server.write('hello matteo', function() {
    t.pass('write callback called')
  })
})

tape('serve a basic sending back some data', function(t) {
  t.plan(1)

  var server = bcksrv()

  server.register('hello', function(args, stream, cb) {
    stream.write('whoaa')
    cb()
  })

  server.write('hello matteo')

  server.on('data', function(chunk) {
    t.equal(chunk.toString(), 'whoaa')
  })
})

tape('no such command', function(t) {
  t.plan(1)

  var server = bcksrv()

  server.write('hello matteo')

  server.on('data', function(chunk) {
    t.equal(chunk.toString(), 'no such command\n')
  })
})

tape('return the error', function(t) {
  t.plan(1)

  var server = bcksrv()

  server.register('hello', function(args, stream, cb) {
    cb(new Error('muahha'))
  })

  server.write('hello matteo')

  server.on('data', function(chunk) {
    t.equal(chunk.toString(), 'Error: muahha')
  })
})

tape('emit the command error', function(t) {
  t.plan(3)

  var server = bcksrv()

  server.register('hello', function(args, stream, cb) {
    cb(new Error('muahha'))
  })

  server.on('commandError', function(command, args, err) {
    t.equal(command, 'hello')
    t.deepEqual(args, ['matteo'])
    t.equal(err.toString(), 'Error: muahha')
  })

  server.write('hello matteo')
})
