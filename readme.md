# alexbaker.io

## Install

    yarn install

## Development

Run development server and watch files:

    gulp develop

Site will be available at `http://localhost:8000`.

Lint:

    yarn lint

## Production

Optimize files for production:

    gulp dist

## Deploy

Deploy to S3 bucket (requires AWS API key already set up):

    gulp dist-deploy