// Deploy HTML files and set content-type since files have no extenstion
const deployHtml = "aws s3 sync dist/ s3://alexbaker.io " +
    "--exclude '*.*' " +
    "--include '' " +
    "--content-type 'text/html' " +
    "--delete";

// Deploy all non-HTML files that do not require cache headers
const deployNonHtml = "aws s3 sync dist/ s3://alexbaker.io " +
    "--exclude '*' " +
    "--exclude 'assets/main*' " +
    "--exclude 'assets/images/*' " +
    "--include '*.*' " +
    "--delete";

// Deploy all resources that require cache headers
const deployCached = "aws s3 sync dist/ s3://alexbaker.io " +
    "--exclude '*' " +
    "--include 'assets/main*' " +
    "--include 'assets/images/*' " +
    "--cache-control 'max-age=31536000,public' " +
    "--delete";


function deployCommands() {
  return [deployHtml, deployNonHtml, deployCached];
}


export {deployCommands};