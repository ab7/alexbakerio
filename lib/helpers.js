import fs from 'fs';
import path from 'path';
import junk from 'junk';


function toTitleCase(str) {
  // per http://stackoverflow.com/a/196991
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function sortPosts(posts) {
  // Turn your strings into dates, and then subtract them
  // to get a value that is either negative, positive, or zero.
  // https://stackoverflow.com/a/10124053
  return posts.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
}

function unJunkFiles(files) {
  // filter out system junk files such as .DS_Store
  return files.filter(junk.not);
}

function devPageFallback(req, res, fallbackFile) {
  // Fallback for HTML pages without extension.
  //
  // This is a workaround for building internal page links without
  // the .html extension. We take the path, check if the file exists
  // then add the extension.
  //
  // Note: this is only appliciable in dev mode.
  let buildDir = path.parse(fallbackFile).dir,
      file = buildDir + req.url + '.html',
      page = fs.existsSync(file) ? file : fallbackFile;
  fs.createReadStream(page).pipe(res)
}


export {toTitleCase, sortPosts, unJunkFiles, devPageFallback};