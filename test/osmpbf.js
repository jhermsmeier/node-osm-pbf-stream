var fs = require( 'fs' )
var path = require( 'path' )
var util = require( 'util' )
var assert = require( 'assert' )
var OSM = require( '..' )

var log = console.log.bind( console )

function inspect( value ) {
  return util.inspect( value, {
    depth: null,
    colors: true,
  })
}

var DATAPATH = path.join( __dirname, 'data/berlin-latest.osm.pbf' )

suite( 'BlobParser', function() {

  test( '1MB chunk size', function( done ) {

    var headerCount = 0
    var blobCount = 0

    var readStream = fs.createReadStream( DATAPATH, {
      highWaterMark: 1024 * 1024
    })

    readStream.pipe( new OSM.BlobParser() )
      .on( 'header', function( data ) {
        headerCount++
        // log( 'header', inspect( data ) )
      })
      .on( 'blob', function( data ) {
        blobCount++
        // log( 'blob', inspect( data ) )
      })
      .once( 'error', function( error ) {
        done( error )
      })
      .once( 'finish', function() {
        assert.strictEqual( blobCount, headerCount )
        done()
      })
      .resume()

  })

  test( 'Default (16KB) chunk size', function( done ) {

    var headerCount = 0
    var blobCount = 0

    var readStream = fs.createReadStream( DATAPATH )

    readStream.pipe( new OSM.BlobParser() )
      .on( 'header', function( data ) {
        headerCount++
        // log( 'header', inspect( data ) )
      })
      .on( 'blob', function( data ) {
        blobCount++
        // log( 'blob', inspect( data ) )
      })
      .once( 'error', function( error ) {
        done( error )
      })
      .once( 'finish', function() {
        assert.strictEqual( blobCount, headerCount )
        done()
      })
      .resume()

  })

})
