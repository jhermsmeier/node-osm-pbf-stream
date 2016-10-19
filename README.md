# osm-pbf-stream
[![npm](https://img.shields.io/npm/v/osm-pbf-stream.svg?style=flat-square)](https://npmjs.com/package/osm-pbf-stream)
[![npm license](https://img.shields.io/npm/l/osm-pbf-stream.svg?style=flat-square)](https://npmjs.com/package/osm-pbf-stream)
[![npm downloads](https://img.shields.io/npm/dm/osm-pbf-stream.svg?style=flat-square)](https://npmjs.com/package/osm-pbf-stream)
[![build status](https://img.shields.io/travis/jhermsmeier/node-osm-pbf-stream.svg?style=flat-square)](https://travis-ci.org/jhermsmeier/node-osm-pbf-stream)

OpenStreetMap Protocol Buffer Stream

## Install via [npm](https://npmjs.com)

```sh
$ npm install --save osm-pbf-stream
```

## Index
<!-- MarkdownTOC -->

- [What](#what)
- [Usage](#usage)
- [Speed](#speed)

<!-- /MarkdownTOC -->

## What

As OpenStreetMap's `.osm.pbf` files aren't pure Protocol Buffer messages, but are in a chunked, size delimited (and optionally, compressed) [custom crafted format](http://wiki.openstreetmap.org/wiki/PBF_Format) – this parses out the Protobuf message chunks.

So, `osm.pbf` goes in, `pbf` comes out.

## Usage

```js
var OsmPbf = require( 'osm-pbf-stream' )
```

```js
var pbfStream = fs.createReadStream( 'berlin-latest.osm.pbf' )
  .pipe( new OsmPbf.BlobParser() )
  .on( 'header', ... )
  .on( 'blob', ... )
```

```js
// Now you can process the Protocol Buffer stream
// with a streaming Protobuf parser, like `pbs`
var pbs = require( 'pbs' )
var osmSchema = fs.readFileSync( 'osmformat.proto', 'utf8' )
var messages = pbs( osmSchema )

var decoder = messages.PrimitiveBlock.decode()

decoder.primitivegroup( function( group, next ) {
  console.log( 'PrimitiveGroup.nodes', group.dense || group.nodes )
  next()
})

decoder.once( 'finish', function() {
  console.log( 'EOD' )
})

// Pipe the PBF stream to the decoder
pbfStream.pipe( decoder )
```

## Speed

With the ~49 MB test file, it processes about 50 MB/s on a MacBook Pro.

```
BlobParser
  ✓ 1MB chunk size (986ms)
  ✓ Default (16KB) chunk size (1009ms)
```
