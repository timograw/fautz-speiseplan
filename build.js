const fs = require('fs');
const archiver = require('archiver');

let manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));

console.log("Packing fautz-catering " + manifest.version + "...");

let archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

let output = fs.createWriteStream('./dist/fautz-speiseplan-' + manifest.version + '.zip');

archive.pipe(output);

// main files
archive.file('LICENSE');
archive.file('manifest.json');
archive.file('popup.html');
archive.file('popup.js');
archive.file('README.md');

// all images
archive.directory('img/');

// selected bootstrap dist files
archive.file('node_modules/bootstrap3/dist/css/bootstrap.min.css');
archive.file('node_modules/bootstrap3/dist/js/bootstrap.min.js');

// jQuery min
archive.file('node_modules/jquery/dist/jquery.min.js');

// lit-html
archive.file('node_modules/lit-html/lit-html.js');
archive.directory('node_modules/lit-html/lib');
archive.directory('node_modules/lit-html/directives');
archive.directory('node_modules/lit-html/polyfills');

archive.finalize();