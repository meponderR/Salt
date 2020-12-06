const fs = require("fs");
const path = require("path");

function getAllFiles(dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            if (!dirPath.includes(".git")) {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
            }
        } else {
            arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

for (var file of getAllFiles("./in/")) {
    var oldJSON = require(file);

    var newJSON = {};
    newJSON.games = {};

    for (const platform in oldJSON) {
        for (const name in oldJSON[platform]) {
            newJSON["games"][name] = {};
            newJSON["games"][name]["url"] = oldJSON[platform][name];
        }
    }

    fs.writeFileSync(file.replace("in", "out"), JSON.stringify(newJSON));
}