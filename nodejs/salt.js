/*   _____________________________________________________________________________________
	|........______________..........______...........__..............______________......|
	|......./  __________  \......../  __  \.........|  |............|              |.....|
	|....../  /         /__/......./  /  \  \........|  |............|_____    _____|.....|
	|...../  /             ......./  /    \  \.......|  |..................|  |...........|
	|.....\  \___________ ......./  /______\  \......|  |..................|  |...........|
	|......\___________  \....../  __________  \.....|  |..................|  |...........|
	|......__          \  \..../  /          \  \....|  |..................|  |...........|
	|...../  /_________/  /.../  /            \  \...|  |_________.........|  |...........|
	|.....\______________/.../__/              \__\..|____________|........|__|...........|
	|_____________________________________________________________________________________|

	Copyright (c) 2021 meponder

	Licensed under the MIT license:

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

const fs = require("fs-extra");
const path = require("path");
const got = require("got");
const sftpClient = require("sftp-promises");
const ftp = require("basic-ftp");
const jsonc = require("jsonc").jsonc;
const lunr = require("lunr");
const glob = require("glob");
const tar = require("tar");


//Repository Interactions
async function getRepoList() {
    if (await fs.pathExists(`${getSaltConfigDir()}Repositories.json`)) {
        return await jsonc.parse((await fs.promises.readFile(`${getSaltConfigDir()}Repositories.json`)).toString());
    } else {
        throw new Error("No repositories file found");
    }
}

//Get the list of items from all repositories
async function getListOfItems() {
    let RepositoryList = await getRepoList();
    if (RepositoryList == null) {
        throw new Error("No repositories found");
    }

    let RepositoryDataList = {};
    for (const RepositoryID in RepositoryList) {
        let Repository = RepositoryList[RepositoryID];
        let RepositoryURL = new URL(Repository["URL"]);
        let RepositoryData = jsonc.parse((await makeRequest(RepositoryURL)).toString());
        //console.log(RepositoryData)
        for (const FileId in RepositoryData.Files) {
            if (Object.hasOwnProperty.call(RepositoryData.Files, FileId)) {
                const file = RepositoryData.Files[FileId];
                file.id = FileId;
                RepositoryDataList[FileId] = file;
            }
        }
    }
    return RepositoryDataList;
}

//Get the list of items from a specified repository
async function getListOfItemsFromRepo(RepositoryID) {
    let RepositoryList = await getRepoList();
    //console.log(await getRepoList());
    let RepositoryDataList = {};
    let Repository = RepositoryList[RepositoryID];
    let RepositoryURL = new URL(Repository["URL"]);
    let RepositoryData = jsonc.parse((await makeRequest(RepositoryURL)).toString());
    //console.log(RepositoryData)
    for (const FileId in RepositoryData.Files) {
        if (Object.hasOwnProperty.call(RepositoryData.Files, FileId)) {
            const File = RepositoryData.Files[FileId];
            RepositoryDataList[FileId] = File;
        }
    }
    return RepositoryDataList;
}


//Search
//Create a Lunr index from the list of items
async function createLunrIndex(listOfItems) {

    if (listOfItems == null) {
        listOfItems = await getCachedListOfItems();
    }
    listOfItems = Object.values(listOfItems);

    let idx = lunr(function() {
        this.field("id");
        this.field("Name");
        this.field("ShortName");
        this.field("Series");
        this.field("Category");
        this.field("Developer");

        for (const item of listOfItems) {
            if (Array.isArray(item.Series)) {
                item.Series = item.Series.join(" ");
            }
            if (Array.isArray(item.Category)) {
                item.Category = item.Category.join(" ");
            }
            this.add(item);
        }
    });
    return idx;
}

//Search the Lunr index
async function search(term) {
    let idx = await getCachedLunrIndex();
    console.log(idx);
    return idx.search(term);
}

//Get a list of all identifiers from all repositories
async function getArrayOfItemIdentifiers() {
    return Object.keys(await getCachedListOfItems());
}


//Directories
//Get salt directory
function getSaltDir() {
    let saltDir = (process.env.APPDATA || (process.platform == "darwin" ? process.env.HOME + "/Library" : process.browser ? process.env.HOME + "" : process.env.HOME + "/.local/share")) + "/Salt/";
    try {
        fs.lstatSync(saltDir);
    } catch (error) {
        fs.mkdirSync(saltDir);
    }
    return saltDir;
}

//Fet the config directory
function getSaltConfigDir() {
    let saltConfigDir = getSaltDir() + "Config/";

    try {
        fs.lstatSync(saltConfigDir);
    } catch (error) {
        fs.mkdirSync(saltConfigDir);
    }
    return saltConfigDir;
}

//Get the caching directory
function getSaltCacheDir() {
    let saltCacheDir = getSaltDir() + "Cache/";

    try {
        fs.lstatSync(saltCacheDir);
    } catch (error) {
        fs.mkdirSync(saltCacheDir);
    }
    return saltCacheDir;
}

//Get the extension directory
function getSaltExtensionDir() {
    let saltExtensionDir = getSaltDir() + "Extensions/";

    try {
        fs.lstatSync(saltExtensionDir);
    } catch (error) {
        fs.mkdirSync(saltExtensionDir);
    }
    return saltExtensionDir;
}


//Config
//Get the Output Directory
function getOutputDir() {
    let saltConfigFile = `${getSaltConfigDir()}Settings.json`;

    if (!fs.pathExistsSync(`${getSaltConfigDir()}Settings.json`)) {
        console.error("Settings file not found");
    }
    let saltConfigFileData = jsonc.parse(fs.readFileSync(saltConfigFile).toString());
    return saltConfigFileData.output;
}

//Set the Output Directory
function setOutputDir(newOutputDir) {
    let saltConfigFile = `${getSaltConfigDir()}Settings.json`;
    let saltConfigFileData = {};
    if (fs.pathExistsSync(saltConfigFile)) {
        saltConfigFileData = jsonc.parse(fs.readFileSync(saltConfigFile).toString());
    }
    saltConfigFileData.output = newOutputDir.replace(/\\/g, "/");

    return fs.writeFileSync(saltConfigFile, JSON.stringify(saltConfigFileData, null, 4));
}

//Check if unsecured protocols are allowed
function getUnsecuredOpt() {
    let saltConfigFile = `${getSaltConfigDir()}Settings.json`;

    if (!fs.pathExistsSync(`${getSaltConfigDir()}Settings.json`)) {
        console.error("Settings file not found");
    }
    let saltConfigFileData = jsonc.parse(fs.readFileSync(saltConfigFile).toString());
    return saltConfigFileData.allowUnsecuredConnections;
}

//Set unsecured protocols option
function setUnsecuredOpt(newUnsecuredOpt) {
    let saltConfigFile = `${getSaltConfigDir()}Settings.json`;
    let saltConfigFileData = {};
    if (fs.pathExistsSync(saltConfigFile)) {
        saltConfigFileData = jsonc.parse(fs.readFileSync(saltConfigFile).toString());
    }
    saltConfigFileData.allowUnsecuredConnections = newUnsecuredOpt;

    return fs.writeFileSync(saltConfigFile, JSON.stringify(saltConfigFileData, null, 4));
}


//Repo Management
//Add repository to the list
async function addRepository(RepoURL) {
    let repositoryList = {};
    const repositoryURL = new URL(RepoURL);

    //Check if the repositories file exists
    if (await fs.promises.access(`${getSaltConfigDir()}Repositories.json`, fs.constants.F_OK).then(() => true).catch(() => false)) {
        //If it does, set the repo list to it
        repositoryList = jsonc.parse((await fs.promises.readFile(`${getSaltConfigDir()}Repositories.json`)).toString());
    }
    //Get repo from URL
    let repositoryData = jsonc.parse((await makeRequest(repositoryURL)).toString());

    //Add URL to the repo metadata
    repositoryData.Meta.URL = RepoURL;

    let repositoryMetadata = repositoryData.Meta;
    //add repo to the repo list
    repositoryList[repositoryData.Meta.id] = repositoryMetadata;

    //write repo list to the file
    await fs.promises.writeFile(
        `${getSaltConfigDir()}Repositories.json`,
        JSON.stringify(repositoryList, null, 4)
    );
    await cacheRepos();
    return repositoryList;
}

//Remove repository from the list
async function removeRepository(id) {
    if (await fs.promises.access(`${getSaltConfigDir()}Repositories.json`, fs.constants.F_OK).then(() => true).catch(() => false)) {
        //Get the list of repositories
        let repositoryList = jsonc.parse((await fs.promises.readFile(`${getSaltConfigDir()}Repositories.json`)).toString());
        //Remove the repository from the list
        delete repositoryList[id];
        //Write the new list to the file
        await fs.promises.writeFile(`${getSaltConfigDir()}Repositories.json`, JSON.stringify(repositoryList, null, 4));
    } else {
        //If the file doesn't exist, throw an error
        console.log("error");
    }
    await cacheRepos();
}


//Download
//Make a request to a source and return the body
async function makeRequest(repoURL, file = null) {

    //console.log(`Making a request with ${RepoURL} using protocol ${RepoURL.protocol}`);

    if (repoURL.protocol == "http:" || repoURL.protocol == "https:") {
        try {
            if (getUnsecuredOpt() && repoURL.protocol == "http:") {
                repoURL.protocol = "https:";
            }

            const response = await got(repoURL);
            //console.log(response.body);
            if (file != null) {
                await fs.promises.writeFile(file, response.body);
            } else {
                return response.body;
            }

        } catch (error) {
            console.log(error.response);
            //console.log(error.response.body);
        }
    } else if (repoURL.protocol == "ftp:" || repoURL.protocol == "ftps:") {
        let port = 21;
        if (repoURL.port != "") {
            port = repoURL.port;
        }

        const client = new ftp.Client();
        //client.ftp.verbose = true;
        let downloaded;
        try {
            await client.access({
                host: repoURL.hostname,
                port,
                user: repoURL.username,
                password: repoURL.password,
                secure: (repoURL.protocol == "ftps:" || !getUnsecuredOpt())
            });
            if (file != null) {
                await client.downloadTo(file, repoURL.pathname.substring(1));
                client.close();
            } else {
                await fs.promises.mkdir(`${getSaltDir()}/Temp/`);
                downloaded = await client.downloadToDir(`${getSaltDir()}/Temp/temp`, repoURL.pathname.substring(1));
                await fs.remove(`${getSaltDir()}/Temp/temp`);
                client.close();
            }
        } catch (err) {
            console.log(err);
        }
        return downloaded;
    } else if (repoURL.protocol == "sftp:") {
        let port = 22;
        if (repoURL.port != "") {
            port = repoURL.port;
        }

        let sftp = new sftpClient({
            host: repoURL.hostname,
            port,
            username: repoURL.username,
            password: repoURL.password,
        });
        if (file != null) {
            await sftp.get(repoURL.pathname.substring(1), file);
        } else {
            return await sftp.getBuffer(repoURL.pathname.substring(1));
        }
    } else if (repoURL.protocol == "file:") {
        if (file == null) {
            return await fs.promises.readFile(decodeURI(repoURL.pathname).substring(1));
        } else {
            await fs.promises.copyFile(decodeURI(repoURL.pathname).substring(1), path.basename(decodeURI(repoURL.pathname).substring(1)));
        }
    } else {
        //console.log(`URL: ${repoURL}`);
        //console.log(`URL Protocol: ${repoURL.protocol}`);
        //console.log(`Extension Handler: ${await lookupExtensionHandler(repoURL.protocol)}`);
        //console.log(repoURL.protocol);
        return await require(await lookupProtocol(repoURL.protocol)).handleUrl(repoURL, file);
    }
}

//Download a file from a repository
async function download(id, options = {
    noExtensions: false
}) {
    //Get the list of files
    let fileList = await getCachedListOfItems();
    //Get the file from the list
    let fileInfo = fileList[id];
    //Get the file from the url using makeRequest
    await makeRequest(new URL(fileInfo.URL), `${getOutputDir()}/${fileInfo["Filename"]}`);
    if (options.noExtensions) {
        //console.log("File Download Done!");
        return;
    }
    outputExtension(`${getOutputDir()}/${fileInfo["Filename"]}`, getOutputDir());
    //console.log("File Download Done!");
}

//Download a file from a repository
async function downloadURL(url, filename, options = {
    noExtensions: false
}) {
    //Get the file from the url using makeRequest
    await makeRequest(new URL(url), `${getOutputDir()}/${filename}`);
    if (options.noExtensions) {
        //console.log("File Download Done!");
        return;
    }
    outputExtension(`${getOutputDir()}/${filename}`);
    //console.log("File Download Done!");
}


//Extensions
//Get the list of extensions
async function getExtensions() {
    //Get the list of extensions
    let extensions = await fs.promises.readdir(`${getSaltExtensionDir()}`);

    let extensionList = {};

    //Loop through the extensions
    for (const Extension of extensions) {
        //If the extension is a directory, check if the protocol is supported
        if ((await fs.promises.lstat(`${getSaltExtensionDir()}${Extension}`)).isDirectory()) {
            //Get the metadata file
            let extensionMetadata = jsonc.parse((await fs.promises.readFile(`${getSaltExtensionDir()}${Extension}/meta.json`)).toString());

            extensionList[Extension] = extensionMetadata;
        }
    }

    return extensionList;
}

//Lookup the extension handler for a given protocol
async function lookupProtocol(protocol) {
    //Get the list of extensions
    let Extensions = await getExtensions();

    //Loop through the extensions to find the one that handles the protocol
    for (const Extension in Extensions) {
        if (Object.hasOwnProperty.call(Extensions, Extension)) {
            const ExtensionMetadata = Extensions[Extension];
            for (const downloadProtocol of ExtensionMetadata.downloadProtocols) {
                if (downloadProtocol == protocol) {
                    return `${getSaltExtensionDir()}${Extension}/${ExtensionMetadata["handler"]}`;
                }
            }

        }
    }
}

//Lookup the extension handler for a given file extension
async function lookupFileExtension(fileExtension) {
    if (fileExtension.startsWith(".")) {
        fileExtension = fileExtension.slice(1);
    }

    //Get the list of extensions
    const Extensions = await getExtensions();

    //Loop through the extensions to find the one that handles the protocol
    for (const Extension in Extensions) {
        if (Object.hasOwnProperty.call(Extensions, Extension)) {
            const ExtensionMetadata = Extensions[Extension];
            if (ExtensionMetadata["fileExtensions"] != undefined) {
                if (ExtensionMetadata["fileExtensions"].includes(fileExtension)) {
                    return `${getSaltExtensionDir()}${Extension}/${ExtensionMetadata["handler"]}`;
                }
            }
        }
    }
    return undefined;
}

//Lookup the extension handler for a given path to a folder
async function lookupFolderHandler(folderPath) {
    let supportingExtension = null;

    //Get the list of extensions
    const Extensions = await getExtensions();

    //Loop through the extensions to find the one that handles the protocol
    for (const Extension in Extensions) {
        if (Object.hasOwnProperty.call(Extensions, Extension)) {
            const ExtensionMetadata = Extensions[Extension];
            if (typeof ExtensionMetadata.folderFiles == "object") {
                for (const requiredFileGroup of ExtensionMetadata.folderFiles) {
                    try {
                        for (const requiredFile of requiredFileGroup) {
                            let globPromise = new Promise((resolve) => {
                                glob(`${folderPath}/${requiredFile}`, (er, files) => {
                                    resolve(files);
                                });
                            });
                            let files = await globPromise;

                            if (files == []) {
                                throw "No files";
                            }

                        }
                        supportingExtension = `${getSaltExtensionDir()}${Extension}/${ExtensionMetadata["handler"]}`;
                    } catch (err) {
                        //Blank
                    }

                }
            }
        }
    }

    return supportingExtension;
}

//Get the extension handler for a given file or folder
async function outputExtension(input, output) {

    let fileStats = await fs.promises.lstat(input);

    if (fileStats.isFile()) {
        let extensionHandler = await lookupFileExtension(path.parse(input).ext);
        if (extensionHandler != null) {
            let outputs = await require(extensionHandler).handleFile(input, getOutputDir());
            for (const outputFile of outputs) {
                outputExtension(outputFile, output);
            }
        }
    } else if (fileStats.isDirectory()) {
        let extensionHandler = await lookupFolderHandler(input);
        if (extensionHandler != null) {
            let outputs = await require(extensionHandler).handleFolder(input, getOutputDir());
            for (const outputFile of outputs) {
                outputExtension(outputFile, output);
            }
        }
    }
}

//Install an extension from .saltextension using tar
async function installExtension(compressedExtensionPath) {
    tar.x({
        C: getSaltExtensionDir(),
        f: compressedExtensionPath
    });
}

//Caching
//Cache the list of files to file
async function cacheRepos() {
    const items = await getListOfItems();
    await fs.promises.writeFile(`${getSaltCacheDir()}Cached File List.json`, JSON.stringify(items, null, 4));
    await fs.promises.writeFile(`${getSaltCacheDir()}Last File List Cache.txt`, (Math.floor(+new Date() / 1000).toString()));
    await cacheLunrIndex(items);
    return items;
}

//Fetch cached files
async function getCachedListOfItems() {
    if (await fs.pathExists(`${getSaltCacheDir()}Cached File List.json`)) {
        return await cacheRepos();
    }

    if (Math.floor(+new Date() / 1000) > (parseInt(await fs.promises.readFile(`${getSaltCacheDir()}Last File List Cache.txt`)) + ((60 * 60) * 12))) { //Check if it has been 12 or more hours since last refresh
        return await cacheRepos();

    } else {
        return jsonc.parse((await fs.promises.readFile(`${getSaltCacheDir()}Cached File List.json`)).toString());
    }
}

//Cache the lunr index
async function cacheLunrIndex(items) {
    const idx = await createLunrIndex(items);

    let jsSpecific = `${getSaltCacheDir()}JS/`;

    try {
        fs.lstatSync(jsSpecific);
    } catch (error) {
        fs.mkdirSync(jsSpecific);
    }
    await fs.promises.writeFile(`${jsSpecific}Cached Lunr Index.json`, JSON.stringify(idx, null, 4));

    await fs.promises.writeFile(`${jsSpecific}Last Lunr Cache.txt`, (Math.floor(+new Date() / 1000).toString()));
    return idx;

}

//Fetch cached lunr index
async function getCachedLunrIndex() {
    let jsSpecific = `${getSaltCacheDir()}JS/`;
    try {
        fs.lstatSync(jsSpecific);
    } catch (error) {
        fs.mkdirSync(jsSpecific);
    }
    try {
        fs.lstatSync(`${jsSpecific}Cached Lunr Index.json`);
    } catch (error) {
        await cacheLunrIndex();
    }

    if (Math.floor(+new Date() / 1000) > (parseInt(await fs.promises.readFile(`${jsSpecific}/Last Lunr Cache.txt`)) + ((60 * 60) * 12))) { //Check if it has been 12 or more hours since last refresh

        return await cacheLunrIndex();

    } else {
        return lunr.Index.load(jsonc.parse((await fs.promises.readFile(`${jsSpecific}Cached Lunr Index.json`)).toString()));
    }
}

//Export Functions
module.exports = {
    //Basic Functions
    makeRequest,
    download,
    downloadURL,

    //Repository Management
    addRepository,
    removeRepository,

    //Salt Dirs
    getSaltDir,
    getSaltConfigDir,
    getSaltCacheDir,
    getSaltExtensionDir,

    //Salt Config
    getOutputDir,
    setOutputDir,
    getUnsecuredOpt,
    setUnsecuredOpt,

    //Salt Repository Grabbers
    getRepoList,
    getListOfItems,
    getCachedListOfItems,
    cacheRepos,
    getListOfItemsFromRepo,
    getArrayOfItemIdentifiers,

    //Salt Extensions
    getExtensions,
    lookupProtocol,
    lookupFileExtension,
    lookupFolderHandler,
    outputExtension,
    installExtension,

    //Lunr
    search,
    cacheLunrIndex,
    getCachedLunrIndex,
};