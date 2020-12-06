const fs = require("fs");
const decodeUriComponent = require('decode-uri-component');
const prompt = require('prompt-sync')();
const execSync = require('child_process').execSync;
const path = require('path');



//ask for url to scrape
var scrapeUrl = prompt('URL to scrape:       ');

//ask for platform
var platform = prompt('Platform:            ');

//ask for meta
var metaName = prompt('(Meta)Name:          ');
var metaDesc = prompt('(Meta)Description:   ');
var metaIcon = prompt('(Meta)Icon URL:      ');

//fetch directory listing
execSync('./fetch_list.sh "' + scrapeUrl + '"');


//create url array
var urlarray = fs.readFileSync('out/urls.txt').toString().split("\n");
let urlsJ = [...new Set(urlarray)];

//get base url
var baseURL = urlsJ[0];

//init output json
var outJSON = {};

//set meta
outJSON["meta"] = {};
outJSON["meta"]["name"] = metaName;
outJSON["meta"]["description"] = metaDesc;
outJSON["meta"]["icon"] = metaIcon;
outJSON["meta"]["type"] = "https";

//delete first url
urlsJ.shift();

outJSON["games"] = {};
outJSON["games"][platform] = {};

//add games to json
for (const url of urlsJ) {
    name = url.replace(baseURL, "");
    name = decodeUriComponent(name);
    path.parse(name).name;
    outJSON["games"][platform][name] = {};
    outJSON["games"][platform][name]["url"] = url;
};

//write output
fs.writeFileSync("./out/" + platform + ".json", JSON.stringify(outJSON));

//delete temp scrape
fs.unlinkSync("out/urls.txt");