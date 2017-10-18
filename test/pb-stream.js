var path = require( 'path' )
var fs = require( 'fs' )
var pbs = require( 'pbs' )
var OSM = require( '..' )

var DATAPATH = path.join( __dirname, 'data/berlin-latest.osm.pbf' )
var SCHEMAPATH = path.join( __dirname, 'osmformat.proto' )

suite( 'ProtoBuf', function() {

  test( 'streaming decode', function( done ) {

    this.timeout( 60 * 1000 )

    var schema = fs.readFileSync( SCHEMAPATH, 'utf8' )
    var messages = pbs( schema )
    var decoder = messages.PrimitiveBlock.decode()

    decoder.primitivegroup( function( group, next ) {
      // console.log( 'PrimitiveGroup', group.dense || group.nodes )
      process.nextTick( next )
    })

    fs.createReadStream( DATAPATH )
      .on( 'error', done )
      .pipe( new OSM.BlobParser() )
      .on( 'error', done )
      .pipe( decoder )
      .on( 'error', done )
      .on( 'finish', done )
      // .resume()

  })

})
