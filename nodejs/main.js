#! /usr/bin/env node

const path = require("path");

const salt = require("./salt");
var argv = require("minimist")(process.argv.slice(2));
const project = require("./package.json");
const readlineSync = require("readline-sync");

var execName;

if (path.parse(process.argv[0]).name == "node") {
    execName = "node main";
} else {
    execName = path.parse(process.argv[0]).name;
}

const commands = `
Usage: ${execName} [options] command

Commands:  
  download <id> - Get specified game from your repos.
  list - List all files from repos.
  listr <Repository id> - List all files from a specified repository.
  search <platform> <search terms> - Search games for platform from repos.
  update - Update cache 
  repo list - List all repositories.
  repo add <name> <url> <type> - Add repository from a url.
  repo remove <Repository id> - Remove the specified repository.
  extension list - List all extensions.
  extension install <.saltextension path> - Install extension from path.
  config - Open settings configurator
  config outputDir <path> - Set output directory
  config setUnsecuredOpt <true or false> - Disable or enable insecure connections i.e. torrents, http, ftp`;

const help = `
Copyright (c) 2021 meponder
Licensed under MIT
Usage: ${execName} command

Salt provides a simple way to access Salt repos.

${commands}
`;

if (require.main === module) {
    console.log(`salt v${project.version}`);
    switch (argv._[0]) {
        case "download":
        case "d":
            argv._.shift();
            salt.download(argv._[0], {
                noExtensions: argv.noextensions,
            });
            break;
        case "urldownload":
        case "ud":
            argv._.shift();
            salt.downloadURL(argv._[1], argv._[0], {
                noExtensions: argv.noextensions,
            });
            break;
        case "list":
        case "l":
            try {
                salt.getCachedListOfItems().then((items) => {
                    for (const item in items) {
                        if (Object.hasOwnProperty.call(items, item)) {
                            const itemData = items[item];
                            console.log(`${itemData.Name}:`);
                            console.log(`  \x1b[34m id: ${item}\x1b[0m`);
                            console.log(`  \x1b[32m url: ${itemData["URL"]}\x1b[0m`);
                        }
                    }
                });
            } catch (error) {
                console.log("Listing items failed with error:" + error);
            }

            break;
        case "listr":
        case "lr":
            argv._.shift();
            salt.getListOfItemsFromRepo(argv._[0]).then((items) => {
                for (const item in items) {
                    if (Object.hasOwnProperty.call(items, item)) {
                        const itemData = items[item];
                        console.log(`${itemData.Name}:`);
                        console.log(`  \x1b[34m id: ${item}\x1b[0m`);
                        console.log(`  \x1b[32m url: ${itemData["URL"]}\x1b[0m`);
                    }
                }
            });
            break;
        case "search":
        case "s":
            argv._.shift();
            salt.getCachedListOfItems().then((Repo) => {
                salt.search(argv._.slice(1).join(" ")).then((idx) => {
                    idx.reverse();
                    for (const result of idx) {
                        let file = (Repo[result.ref]);

                        console.log(`${file.Name}:`);
                        console.log(`  \x1b[34m id: ${file.id}\x1b[0m`);
                        console.log(`  \x1b[32m url: ${file["URL"]}\x1b[0m`);
                    }
                });
            });

            break;
        case "update":
        case "u":
            salt.cacheRepos();
            break;
        case "repo":
        case "re":
            argv._.shift();
            switch (argv._[0]) {
                case "add":
                case "a":
                    salt.addRepository(argv._[1]);
                    break;
                case "remove":
                case "r":
                    salt.removeRepository(argv._[1]);
                    break;
                default:
                    salt.getRepoList().then((repos) => {
                        const repoNumber = Object.keys(repos).length;
                        let repoWord;
                        if (repoNumber == 1) {
                            repoWord = "repository";
                        } else {
                            repoWord = "repositories";
                        }
                        console.log(`You have ${repoNumber} ${repoWord}.`);
                        for (const repo in repos) {
                            if (Object.hasOwnProperty.call(repos, repo)) {
                                const repoData = repos[repo];
                                console.log(`${repoData.Name}:`);
                                console.log(`   \x1b[34mid: ${repo}\x1b[0m`);
                                console.log(`   \x1b[32murl: ${repoData["URL"]}\x1b[0m`);
                            }
                        }
                    });
                    /*for (const repo of object) {
                        
                    }*/
            }
            break;
        case "extension":
        case "extensions":
        case "e":
            argv._.shift();
            switch (argv._[0]) {
                case "list":
                case "l":
                    salt.getExtensions().then((extensions) => {
                        for (const extension in extensions) {
                            if (Object.hasOwnProperty.call(extensions, extension)) {
                                const extensionData = extensions[extension];
                                console.log(`${extension}:`);
                                if (extensionData.downloadProtocols != null) {
                                    console.log("   \x1b[34mDownload Protocols:\x1b[0m");
                                    for (const downloadProtocol of extensionData.downloadProtocols) {
                                        console.log(`       \x1b[34m${downloadProtocol}\x1b[0m`);
                                    }
                                }
                                if (extensionData.fileExtensions != null) {
                                    console.log("   \x1b[32mCompatible File Extensions:\x1b[0m");
                                    for (const fileExtension of extensionData.fileExtensions) {
                                        console.log(`       \x1b[32m${fileExtension}\x1b[0m`);
                                    }
                                }
                                if (extensionData.folderFiles != null) {
                                    console.log("   \x1b[36mRequired RegExs:\x1b[0m");
                                    for (const folderFile of extensionData.folderFiles) {
                                        console.log(`       \x1b[36m${folderFile}\x1b[0m`);
                                    }
                                }
                            }
                        }
                    });
                    break;
                case "install":
                case "import":
                case "i":
                    argv._.shift();
                    salt.installExtension(argv._.join(" "));
                    break;

                default:
                    break;
            }
            break;
        case "config":
        case "c":
            argv._.shift();
            switch (argv._[0]) {
                case "list":
                case "l":
                    console.log(`Output Directory ${salt.getOutputDir()}`);
                    break;

                default:
                    var outputFolder = readlineSync.question("Path to output folder (No quotes!): ");
                    var unsecureOpt = (readlineSync.question("Allow unsecure downloads? (y/N): ") == "y");
                    console.log(outputFolder);
                    salt.setOutputDir(outputFolder);
                    salt.setUnsecuredOpt(unsecureOpt);
                    break;
            }
            break;
        case undefined:
        case "help":
        case "?":
        case "h":
            console.log(help);
            break;
        default:
            console.log(`Error: Option "${process.argv[2]} does not exist"`);
            console.log(commands);
    }

} else {
    module.exports = salt;
}