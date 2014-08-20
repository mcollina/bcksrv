'use strict';

var split       = require('split2')
  , through     = require('through2')
  , duplexer    = require('reduplexer')
  , PassThrough = require('readable-stream').PassThrough

function bcksrv() {

  var commands  = {}
    , srv       = {
          stream: stream
        , register: register
      }

  return srv

  function stream() {
    var inStream  = split()
      , outStream = new PassThrough()
      , result    = duplexer(inStream, outStream)
      , filter    = through.obj(forward)

    inStream.pipe(filter)
    filter.outStream = outStream
    filter.result = result

    return result
  }

  function register(command, func) {
    var chunks = command.split(' ')
      , holder

    holder = chunks.slice(0, chunks.length -1).reduce(function (acc, command) {
      if (acc[command])
        return acc[command]

      var current = {}
      acc[command] = current;

      return current
    }, commands)

    holder[chunks[chunks.length -1 ]] = func

    return srv
  }

  function forward(line, enc, done) {
    /*jshint validthis:true */
    var chunks  = line.toString().split(' ')
      , command = []
      , func
      , rest
      , outStream = this.outStream
      , result = this.result

    func = chunks.reduce(function(acc, chunk) {
      if (!acc)
        return null

      if (typeof acc === 'function')
        return acc

      command.push(chunk)

      return acc[chunk]
    }, commands)

    rest = chunks.slice(command.length)

    if (func) {
      func(rest, outStream, function(err) {
        if (err) {
          result.emit('commandError', command.join(' '), rest, err)
          outStream.write(err.toString() + '\n')
        }
        done()
      })
    } else {
      outStream.write('no such command\n', done)
    }
  }
}

module.exports = bcksrv
