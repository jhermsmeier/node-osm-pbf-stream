var path = require( 'path' )
var fs = require( 'fs' )
var util = require( 'util' )
var pbs = require( 'pbs' )
var OSM = require( '..' )

var DATAPATH = path.join( __dirname, '..', 'test', 'data/berlin-latest.osm.pbf' )
var SCHEMAPATH = path.join( __dirname, '..', 'test', 'osmformat.proto' )

function inspect( value ) {
  return util.inspect( value, inspect.options )
}

inspect.options = {
  depth: 3,
  colors: process.stdout.isTTY,
}

var schema = fs.readFileSync( SCHEMAPATH, 'utf8' )
var messages = pbs( schema )
var decoder = messages.PrimitiveBlock.decode()
var stringTable = []

function materializeNodes( group ) {
  // NOTE: The Berlin data only contains dense nodes atm
  // so I skipped this for brevity
}

function materializeDenseNodes( group ) {

  var nodes = []
  var nodeCount = group.dense.id.length

  var nodeId = 0
  var nodeVersion = 0
  var nodeTimestamp = 0
  var nodeChangeset = 0
  var nodeUserId = 0
  var nodeUserStringId = 0
  var nodeLat = 0
  var nodeLon = 0

  var kvOffset = 0
  var tags = null
  var tagKey = null
  var tagValue = null

  for( var i = 0; i < nodeCount; i++ ) {

    // These are all delta-coded
    nodeId += group.dense.id[i]
    nodeVersion += group.dense.denseinfo.version[i]
    nodeTimestamp += group.dense.denseinfo.timestamp[i]
    nodeChangeset += group.dense.denseinfo.changeset[i]
    nodeUserId += group.dense.denseinfo.uid[i]
    nodeUserStringId += group.dense.denseinfo.user_sid[i]
    nodeLat += group.dense.lat[i]
    nodeLon += group.dense.lon[i]

    // Key/Value pairs are encoded as ( (<keyid> <valid>)* '0' )*
    // where `0` is the separator between nodes
    tags = {}

    // NOTE: I have not figured out yet how to decode the stringtable;
    // If you find documentation on that in the osm pbf docs, ping me.
    // So for now, this only records the string table IDs
    while( tagKey = group.dense.keys_vals[ kvOffset ] ) {
      tags[ tagKey ] = group.dense.keys_vals[ kvOffset + 1 ]
      kvOffset += 2
    }

    // And
    nodes.push({
      id: nodeId,
      version: nodeVersion,
      timestamp: new Date( nodeTimestamp * 1000 ),
      changeset: nodeChangeset,
      userId: nodeUserId,
      userStringId: nodeUserStringId,
      // (lat,lon) are stored as int64 in nanodegrees,
      // hence the division here to make that degrees
      lat: nodeLat / 10000000,
      lon: nodeLon / 10000000,
      tags: tags,
      // This doesn't seem to be in the data (?)
      // visible: group.dense.denseinfo.visible[i],
    })
  }

  return nodes

}

decoder.stringtable( function( value, next ) {

  console.log( 'StringTable', inspect( value.s ) )

  var buffer = value.s[0]
  var offset = 0
  var index = -1

  // NOTE: ???!?!?!?!?!!?!?!?!
  // Any documentation on osm pbf string tables I could
  // find didn't yield any results – still no idea how they work.

  next()

})

decoder.primitivegroup( function( value, next ) {
  var nodes = value.dense ?
    materializeDenseNodes( value ) :
    materializeNodes( value )
  // console.log( 'PrimitiveGroup', inspect( value ) )
  console.log( 'PrimitiveGroup', inspect( nodes ) )
  next()
})

// Start the endevour
fs.createReadStream( DATAPATH )
  .pipe( new OSM.BlobParser() )
  .pipe( decoder )
