var zlib = require( 'zlib' )
var inherit = require( 'bloodline' )
var Stream = require( 'stream' )
var Pbf = require( 'pbf' )

/**
 * BlobParser
 * @constructor
 * @return {BlobParser}
 */
function BlobParser() {

  if( !(this instanceof BlobParser) ) {
    return new BlobParser()
  }

  Stream.Transform.call( this, {
    objectMode: false,
  })

  this._writableState.highWaterMark = 0

  this._header = null
  this._blob = null

  this.state = BlobParser.SIZE
  this.buffer = null
  this.neededBytes = 4
  this.offset = 0
  this.headerBytes = 0

}

BlobParser.SIZE = 0
BlobParser.HEADER = 1
BlobParser.BLOB = 2

BlobParser.readHeader = function( tag, data, pbf ) {
  switch( tag ) {
    case 1: data.type = pbf.readString(); break
    case 2: data.indexData = pbf.readBytes(); break
    case 3: data.dataSize = pbf.readVarint(); break
  }
}

BlobParser.readBlob = function( tag, data, pbf ) {

  if( tag === 2 ) {
    data.size = pbf.readVarint()
  } else if( tag > 0 && tag < 6 ) {
    data.buffer = new Buffer( pbf.readBytes() )
  }

  switch( tag ) {
    case 1: data.compression = 'raw'; break
    case 3: data.compression = 'zlib'; break
    case 4: data.compression = 'lzma'; break
    case 5: data.compression = 'bzip2'; break
  }

}

/**
 * BlobParser prototype
 * @type {Object}
 */
BlobParser.prototype = {

  constructor: BlobParser,

  _onSize: function( buffer ) {

    var byteLength = buffer.readUInt32BE( this.offset )

    this.offset += 4
    this.headerBytes = byteLength
    this.neededBytes = byteLength
    this.state = BlobParser.HEADER

  },

  _onHeader: function( buffer ) {

    var data = buffer.slice( this.offset, this.offset + this.headerBytes )
    var header = new Pbf( data ).readFields( BlobParser.readHeader, {} )
    var byteLength = header.dataSize

    if( byteLength == null )
      throw new Error( 'Missing header data size' )

    this._header = header
    this.offset += this.headerBytes
    this.headerBytes = 0
    this.neededBytes = byteLength
    this.emit( 'header', header )
    this.state = BlobParser.BLOB

  },

  _onBlob: function( buffer ) {

    var data = buffer.slice( this.offset, this.offset + this.neededBytes )
    var blob = new Pbf( data ).readFields( BlobParser.readBlob, {
      header: this._header,
    })

    this._blob = blob

    if( blob.compression !== 'raw' ) {
      blob.buffer = zlib.unzipSync( blob.buffer )
    }

    if( blob.buffer.length !== blob.size ) {
      throw new Error( 'Blob length mismatch: ' + blob.buffer.length + ' != ' + blob.size )
    }

    this.offset += this.neededBytes
    this.neededBytes = 4
    this.emit( 'blob', blob )
    this.push( blob.buffer )
    this.state = BlobParser.SIZE

  },

  _parse: function( buffer ) {

    var byteLength = 0
    var data = null

    switch( this.state ) {
      case BlobParser.SIZE: this._onSize( buffer); break
      case BlobParser.HEADER: this._onHeader( buffer ); break
      case BlobParser.BLOB: this._onBlob( buffer ); break
      default:
        throw new Error( 'Unknown state "' + this.state + '"' )
        break
    }

  },

  _transform: function( buffer, _, next ) {

    if( this.buffer && this.buffer.length ) {
      buffer = Buffer.concat([ this.buffer, buffer ])
      this.buffer = null
    }

    while( buffer.length - this.offset >= this.neededBytes ) {
      try { this._parse( buffer ) }
      catch( error ) { return next( error ) }
    }

    this.buffer = buffer.slice( this.offset )
    this.offset = 0

    next()

  },

}

inherit( BlobParser, Stream.Transform )
// Exports
module.exports = BlobParser
