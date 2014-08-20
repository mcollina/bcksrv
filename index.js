
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
    var chunks = line.toString().split(' ')
      , command = chunks[0]
      , rest = chunks.slice(1)

    if (commands[command]) {
      commands[command](rest, outStream, function(err) {
        if (err) {
          result.emit('commandError', command, rest, err)
          return outStream.write(err.toString())
        }
        done();
      })
    } else {
      outStream.write('no such command\n', done)
    }
  }

  function register(command, func) {
    commands[command] = func
  }

}

module.exports = bcksrv
