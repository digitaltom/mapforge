# µlogger API for Mapforge

App: https://f-droid.org/packages/net.fabiszewski.ulogger
Server: https://github.com/bfabiszewski/ulogger-server
Client: https://github.com/bfabiszewski/ulogger-android

![Mapforge µlogger track](https://github.com/digitaltom/mapforge/blob/main/engines/ulogger/docs/track.jpg?raw=true)

## API endpoints:
Auth
`curl -H 'Content-Type: application/x-www-form-urlencoded' -X POST http://localhost:3000/ulogger/client/index.php -d 'action=auth&pass=supers3cr3t&user=cwh'`

Sets a cookie with a token for the following requests.

New Track
`curl -H 'Content-Type: application/x-www-form-urlencoded' -X POST http://localhost:3000/ulogger/client/index.php -d 'action=addtrack&track=Auto_2024.06.09_20.59.57'`

Append New Trackpoint
`curl -H 'Content-Type: application/x-www-form-urlencoded' -X POST http://localhost:3000/ulogger/client/index.php -d 'action=addpos&altitude=374.299987792969&provider=network&trackid=18&accuracy=16.113000869751&lon=11.1158342&time=1717959606&lat=49.4442029'`
