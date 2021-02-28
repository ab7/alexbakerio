<!--//

title: Automatic Github Release Notes using GCP Cloud Functions
date: 2019-12-07
image: python-resources-hero.webp
live: false

//-->

# Automatic Github Release Notes using GCP Cloud Functions

![Automatic Github Release Notes using GCP Cloud Functions](assets/images/python-resources-hero.webp)

<!-- snippet -->Tired of manually adding release notes on Github after merging a PR into the master branch? Me too. I decided it was time to automate this process for personal projects and for the team at work. This feels like a good use case for a serverless implementation using GCP and Github webhooks. When a branch is merged into master (or whatever the default branch is) I want a Google Cloud Function endpoint to upsert a release draft appended with the merged PR title and link.

## Dependencies

* Google Cloud Functions
* Github
* Python 3
* PyGithub

## Steps

* Create Cloud Function.
* Create Github webhook (with secret).
* Setup signed request handling.
* Setup Github access key for PyGithub library.
* Setup code to update release notes
* Test!
