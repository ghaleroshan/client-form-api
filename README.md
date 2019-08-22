[![Build Status](https://travis-ci.com/ghaleroshan/client_form.svg?branch=master)](https://travis-ci.com/ghaleroshan/client_form)
## client_form
This is a simple client details form to collect client information and save it on database.

This project is built with Node Express and uses Mocha Nock and Proxyquire to test. Code coverage is provided with Istanbul (now called nyc).

## Test passing for master on TravisCI?
[![Build Status](https://travis-ci.com/ghaleroshan/client_form.svg?branch=master)](https://travis-ci.com/ghaleroshan/client_form).

## Dockerized and Cloud run :whale:
This app is `dockerized` and uses google cloud run as hosting platform. 

## How to Run
To run, we assume that you can push and pull in GitHub and have nodemon installed globally with `npm install -g nodemon`. 

Then follow below steps:

- clone the repo with git clone `git@github.com:ghaleroshan/client_form.git`
- cd client_form
- Execute `npm install`
- To run the app `npm start` or `node index.js`
- check below

## Configs
Configs for db like username, password etc are in the `/src/config.js` file.

##How it works
The GET api works in the following way:

- Hit URL /api/clients.
- This will display the list of clients available in the db.

### Run tests

To run the tests inside the container run `docker-compose run web npm t`

To run tests locally just run `npm t` to watch test run `npm t -- -w`.

To watch specific test(s) run `npm t -- -w -g "clients get"` or even
`npm t -- -w -g "should return clients from the db when clients exists"`. -w is for watch and -g is for grep to run specific test(s).

### Code coverage

To get the code coverage with Istanbul/nyc execute : `npm run test-cov`. You should see the code coverage on the cli
For HTML coverage run `./node_modules/nyc/bin/nyc.js report --reporter=html`, then check `coverage/index.html`.


