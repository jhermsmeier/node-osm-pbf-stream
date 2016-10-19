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
- [TODO](#todo)
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
fs.createReadStream( 'berlin-latest.osm.pbf' )
  .pipe( new OsmPbf.BlobParser() )
  .on( 'header', ... )
  .on( 'blob', ... )
  .once( 'finish', ... )
```

## TODO

- [x] Extract headers, blobs from `.osm.pbf`
- [ ] Decompress blob chunks
- [ ] Stream blobs
- [ ] Stream-parse Protocol Buffer messages

## Speed

With the ~49 MB test file, it processes between 200-270 MB/s on a MacBook Pro.
Expect this to drop significantly, as decompression and message parsing hasn't been implemented, yet.

```
BlobParser
    ✓ 1MB chunk size (179ms)
    ✓ Default (16KB) chunk size (236ms)
```
