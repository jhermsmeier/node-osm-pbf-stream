var https = require( 'https' )
var path = require( 'path' )
var fs = require( 'fs' )

var DATADIR = path.join( __dirname, '/data' )
var DATAFILE = path.join( __dirname, '/data/berlin-latest.osm.pbf' )
var DATASOURCE = 'https://download.geofabrik.de/europe/germany/berlin-latest.osm.pbf'

suiteSetup( 'Data directory', function() {
  try { fs.mkdirSync( DATADIR ) } catch( e ) {}
})

suiteSetup( 'Download Data', function( done ) {

  this.timeout( 60 * 1000 )

  try {
    var stats = fs.statSync( DATAFILE )
    if( stats != null && stats.isFile() ) {
      console.log( 'Found %s', path.basename( DATASOURCE ) )
      console.log( '' )
      return done()
    }
  } catch( e ) {}

  console.log( 'Downloading %s', path.basename( DATASOURCE ) )
  console.log( '' )

  var req = https.get( DATASOURCE, function( res ) {
    var ws = fs.createWriteStream( DATAFILE )
    res.pipe( ws )
    res.once( 'end', done )
    res.once( 'error', done )
  })

  req.once( 'error', done )

})
