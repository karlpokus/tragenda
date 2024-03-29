# Tragenda
View cards across boards based on label with tragenda - a simple agenda for Trello teams.

# Usage
- Pick a common label like `#meeting`
- Each team member adds the label to cards that are to be discussed at the coming weekly meeting
- At the meeting search by label
- Move cards around and prioritize as necessary
- Viola! - we have an agenda.

# Features
- Click a card to open it in Trello
- Cross off cards in tragenda that are done (This does not alter any data in Trello)
- A progressbar shows how many cards are left on the agenda
- Move cards around to prioritize
- Works on mobile devices
- Uses simple auhentication client side with [client.js](https://developers.trello.com/get-started/start-building) from Trello

# local dev
- add the local server address to https://trello.com/app-key
- make changes to public/*
- build server `npm install`
- run the server `node server.js`
- run tests
- commit changes
- deploy them
- remove local server address
- profit!

# Bugs
- [x] broken avatars - fixed 2020-09
- [x] Wildcard allowed origins no longer supported - fixed 2021-11
- [ ] TRELLO-141569

# License
MIT
