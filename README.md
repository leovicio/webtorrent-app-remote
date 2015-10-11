# Webtorrent Remote Managment

[webtorrent](https://github.com/feross/webtorrent) is a great tool for share files using torrent, and what makes it special and phenomenal, it his hability to share in browser, using only javascript, with no dependencies!
But, the only "problem" is: When download files on browser, we can only ask for pieces to peers using wrtc protocol.
Since most of torrent clients around there uses udp protocol, we have a lack of peers seeding over wrtc.

The main goal of this project, is: Download files on a good server/seedbox from peers on udp and share to wrtc peers!
In this way you can share files to users from your server to your client on browser.

This app gives you the hability to downloads files on the remote server by passing a .torrent file or magnet uris.


TODO:
-------------
* Create seed/torrent
* Configure Tracker's when creating torrent
* Torrent info: Include each tracker total peers.
* Torrent info: Show peers client
* Torrent info: Configure per torrent speed limit
* Torrent info: Configure per torrent peer limit
* Display each torrent upload/download speed
* Make it a npm package js with command line options. (options: user/password, server, port, maxpeers, etcs)
* API using express and API using websocket (with auth)
* Check if browser suports webrtc (for create torrents and also allow socket.io communicaton)
* Update readme with screenshots, better description, documentation
* Pause / Resume Torrent (needs webtorrent implementation)
* Pause All Torrents / Resume All Torrents (needs webtorrent implementation)
* Create a DEBUG system (to console.log())
* Create a desktop version with nw.js
* Create a browser version (maybe a chrome extension?)

Known Bugs
-------------

Layout was based on [openseedbox](https://github.com/erindru/openseedbox/) by [erindru](https://github.com/erindru)

Thanks to [feross](https://github.com/feross) for [webtorrent](https://github.com/feross/webtorrent) project!