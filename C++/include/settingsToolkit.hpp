#pragma once
#include <fstream>
#include <iostream>
#include <string>
#include <filesystem>

#include <nlohmann/json.hpp>

using json = nlohmann::json;

//repo
json getJsonRepoList(bool failIfNonExistent)
{
    if (!(std::filesystem::exists(getGAPTSettingsPath() + "repos.json")))
    {
        if (failIfNonExistent)
        {
            std::cout << "Repo file does not exist. Please add a repo with \"gapt repo add <name> <url> <type>\"." << std::endl;
            exit(0);
        }
        json blankOutput = {};
        return blankOutput;
    }
    else
    {
        std::ifstream repoJsonFile(getGAPTSettingsPath() + "repos.json");
        json repoJson = json::parse(repoJsonFile);
        repoJsonFile.close();
        return repoJson;
    }
}

int addGaptRepo(std::string repoName, std::string repoURL, std::string repoType)
{
    json repoInfo = {};
    repoInfo["url"] = repoURL;

    json repoList = getJsonRepoList(false);
    repoList[repoName] = repoInfo;

    std::cout << repoInfo.dump(4) << std::endl;

    std::ofstream repoJsonFile(getGAPTSettingsPath() + "repos.json");
    repoJsonFile << std::setw(4) << repoList << std::endl;
    repoJsonFile.close();

    return 0;
}

int removeGaptRepo(std::string repoName)
{
    json repoList = getJsonRepoList(false);
    repoList.erase(repoName);

    std::ofstream repoJsonFile(getGAPTSettingsPath() + "repos.json");
    repoJsonFile << std::setw(4) << repoList << std::endl;
    repoJsonFile.close();

    return 0;
}

//settings
json getJsonSettings(bool failIfNonExistent)
{
    if (!(std::filesystem::exists(getGAPTSettingsPath() + "settings.json")))
    {
        if (failIfNonExistent)
        {
            std::cout << "Settings file does not exist. Refer to the readme to create and configure this file." << std::endl;
            exit(0);
        }
        json blankOutput = {};
        return blankOutput;
    }
    else
    {
        std::ifstream repoJsonFile(getGAPTSettingsPath() + "settings.json");
        json repoJson = json::parse(repoJsonFile);
        repoJsonFile.close();
        return repoJson;
    }
}

std::string getBaseDir()
{
    json settingsJson = getJsonSettings(true);
    std::string stringOutput = settingsJson["baseDir"];
    return stringOutput;
}

int setBaseDir(std::string baseDirPath)
{
    json jsonSettings = getJsonSettings(false);
    jsonSettings["baseDir"] = baseDirPath;

    std::ofstream settingsJsonFile(getGAPTSettingsPath() + "settings.json");
    settingsJsonFile << std::setw(4) << jsonSettings << std::endl;
    settingsJsonFile.close();

    return 0;
}