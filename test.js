
var tape    = require('tape')
  , bcksrv  = require('./')

tape('serve a basic command', function(t) {
  t.plan(2)

  var server = bcksrv()
    , stream = server.stream()

  server.register('hello', function(args, stream, cb) {
    t.deepEqual(args, ['matteo'])
    cb()
  })

  stream.write('hello matteo\n', function() {
    t.pass('write callback called')
  })
})

tape('serve a basic sending back some data', function(t) {
  t.plan(1)

  var server = bcksrv()
    , stream = server.stream()

  server.register('hello', function(args, stream, cb) {
    stream.write('whoaa')
    cb()
  })

  stream.write('hello matteo\n')

  stream.on('data', function(chunk) {
    t.equal(chunk.toString(), 'whoaa')
  })
})

tape('no such command', function(t) {
  t.plan(1)

  var server = bcksrv()
    , stream = server.stream()

  stream.write('hello matteo\n')

  stream.on('data', function(chunk) {
    t.equal(chunk.toString(), 'no such command\n')
  })
})

tape('return the error', function(t) {
  t.plan(1)

  var server = bcksrv()
    , stream = server.stream()

  server.register('hello', function(args, stream, cb) {
    cb(new Error('muahha'))
  })

  stream.write('hello matteo\n')

  stream.on('data', function(chunk) {
    t.equal(chunk.toString(), 'Error: muahha\n')
  })
})

tape('emit the command error', function(t) {
  t.plan(3)

  var server = bcksrv()
    , stream = server.stream()

  server.register('hello', function(args, stream, cb) {
    cb(new Error('muahha'))
  })

  stream.on('commandError', function(command, args, err) {
    t.equal(command, 'hello')
    t.deepEqual(args, ['matteo'])
    t.equal(err.toString(), 'Error: muahha')
  })

  stream.end('hello matteo')
})

tape('serve a multi word command', function(t) {
  t.plan(1)

  var server = bcksrv()
    , stream = server.stream()

  server.register('hello world', function(args, stream, cb) {
    t.deepEqual(args, ['matteo'])
    cb()
  })

  stream.end('hello world matteo')
})

tape('command after error', function(t) {
  t.plan(2)

  var server = bcksrv()
    , stream = server.stream()

  server.register('hello', function(args, stream, cb) {
    t.deepEqual(args, ['matteo'])
    cb()
  })

  server.register('err', function(args, stream, cb) {
    cb(new Error('muahaha'))
  })

  stream.write('hello matteo\n', function() {
    t.pass('write callback called')
  })
})
