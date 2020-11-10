const fs = require("fs");
const decodeUriComponent = require('decode-uri-component');

var urlarray = fs.readFileSync('out/urls.txt').toString().split("\n");

let urlsJ = [...new Set(urlarray)];


var baseURL = urlsJ[0];


var myArgs = process.argv.slice(2);

const system = myArgs[0];

var newJSON = {};
newJSON[system] = {};

urlsJ.shift();

for (const url of urlsJ) {
    name = url.replace(baseURL, "");
    name = decodeUriComponent(name);
    name = name.replace("." + myArgs[1], "");
    name = name.replace(/.zip|.7z|.rar/g, "");
    newJSON[system][name] = url;
};

fs.writeFileSync("./" + system + ".json", JSON.stringify(newJSON));