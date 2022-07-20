# PeerTube Calendar Plugin

Plugin for peertube that adds a page which lists videos by date and allows switching between simultaneously recorded videos and live streams.

See it in action at https://video.manicphase.me

It's currently in a stable MVP state which allows switching between videos synched by UTC timestamps parsed from filenames, as well as creating and handling links that navigate by timestamp and video ID.

## Roadmap of stuff that still needs doing

* Separate plugin that can parse dates from filenames on upload and add a 'recordedAt' field to video metadata. This will mean timestamps don't have to remain in titles.

* Feed management. Currently this only lists local videos. Needs options for feeds based on specific users and the ability to load userlists for gaming clans/events/unlisted archives etc

* Scheduling. Ability to book future events and possibly play with browser notifications

* Fix bugs and take recommendations