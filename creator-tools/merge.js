const fs = require("fs");
const prompt = require("prompt-sync")();
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

var outLoco = prompt("Output Location Without Extension:    ");

var argv = process.argv.slice(2);

var newJSON = JSON.parse(fs.readFileSync(argv[0]));

for (var file of getAllFiles("./in/")) {
    var oldJSON = require(file);

    console.log(file + " added to file")
    newJSON.games = {...newJSON.games, ...oldJSON.games };
}

fs.writeFileSync(outLoco + ".json", JSON.stringify(newJSON));