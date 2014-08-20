
var split       = require('split2')
  , through     = require('through2')
  , duplexer    = require('reduplexer')
  , PassThrough = require('readable-stream').PassThrough

function bcksrv() {

  var inStream  = split().pipe(through.obj(forward))
    , outStream = new PassThrough()
    , result    = duplexer(inStream, outStream)
    , commands  = {}

  result.register = register

  return result

  function forward(line, enc, done) {
    var chunks  = line.toString().split(' ')
      , command = []
      , func
      , rest

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
          return outStream.write(err.toString())
        }
        done();
      })
    } else {
      outStream.write('no such command\n', done)
    }
  }

  function register(command, func) {
    var chunks = command.split(' ')
      , holder

    holder = chunks.slice(0, chunks.length -1).reduce(function (acc, command) {
      if (commands[command])
        return commands[command]

      var current = {}
      commands[command] = current;

      return current
    }, commands)

    holder[chunks[chunks.length -1 ]] = func

    return result
  }
}

module.exports = bcksrv
