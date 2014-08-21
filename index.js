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

  function register(command, opts, func) {
    if (typeof opts === 'function') {
      func = opts
      opts = {}
    }

    var chunks = command.split(' ')
      , holder

    if (opts.multiline)
      func.multiline = typeof opts.multiline === 'string' ? opts.multiline : 'END'

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

    if (this.multiline && line !== this.multilineEnd) {
      this.multiline.push(line)
      return done()
    } else if (this.multiline && line === this.multilineEnd) {
      this.multilineFunc(this.multiline.join('\n'), complete)
      this.multiline = null
      this.multilineFunc = null
      this.multilineEnd = null
      return
    }

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

    if (func && !func.multiline) {
      func(rest, outStream, complete)
    } else if (func && func.multiline) {
      this.multilineFunc = func.bind(null, rest, outStream)
      this.multiline = []
      this.multilineEnd = func.multiline
      done()
    } else {
      outStream.write('no such command\n', done)
    }

    function complete(err) {
      if (err) {
        result.emit('commandError', command.join(' '), rest, err)
        outStream.write(err.toString() + '\n')
      }
      done()
    }
  }
}

module.exports = bcksrv
