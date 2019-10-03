## client-form-api

This is a simple client details form to collect client information and save it on database.

This project is built with Node Express and uses Mocha Nock and Proxyquire to test. Code coverage is provided with Istanbul (now called nyc).

## Test passing for master on TravisCI?

[![Build Status](https://travis-ci.com/ghaleroshan/client-form-api.svg?branch=master)](https://travis-ci.com/ghaleroshan/client-form-api)

## Dockerized and Cloud run :whale:

This app is `dockerized` and uses google cloud run as hosting platform. CloudBuild.yaml file will create a container image with every push and builds a docker container.

## Run on Google Cloud Run

[![Run on Google Cloud](https://storage.googleapis.com/cloudrun/button.svg)](https://console.cloud.google.com/cloudshell/editor?shellonly=true&cloudshell_image=gcr.io/cloudrun/button&cloudshell_git_repo=https://github.com/ghaleroshan/client-form-api.git)

Just click the above button if you have a GCP account with a project. Wait for it to execute and you have this app running
on Google Cloud Run.

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

## How it works

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
