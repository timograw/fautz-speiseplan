const AdmZip = require('adm-zip');
const fs = require('fs');

let manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));

console.log("Packing fautz-catering " + manifest.version + "...");

let zip = new AdmZip();

// main files
zip.addLocalFile('./LICENSE');
zip.addLocalFile('./manifest.json');
zip.addLocalFile('./popup.html');
zip.addLocalFile('./popup.js');
zip.addLocalFile('./README.md');

// all images
zip.addLocalFolder('./img', 'img');

// selected bootstrap dist files
zip.addLocalFile('./node_modules/bootstrap3/dist/css/bootstrap.min.css', 'node_modules/bootstrap3/dist/css/');
zip.addLocalFile('./node_modules/bootstrap3/dist/js/bootstrap.min.js', 'node_modules/bootstrap3/dist/js/');

// jQuery min
zip.addLocalFile('./node_modules/jquery/dist/jquery.min.js', 'node_modules/jquery/dist/');

// lit-html
zip.addLocalFile('./node_modules/lit-html/lit-html.js', 'node_modules/lit-html/')
zip.addLocalFolder('./node_modules/lit-html/lib', 'node_modules/lit-html/lib');
zip.addLocalFolder('./node_modules/lit-html/directives', 'node_modules/lit-html/directives');
zip.addLocalFolder('./node_modules/lit-html/polyfills', 'node_modules/lit-html/polyfills');

zip.writeZip('./dist/fautz-speiseplan-' + manifest.version + '.zip');