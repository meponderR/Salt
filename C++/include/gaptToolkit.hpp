#pragma once
#include <fstream>
#include <iostream>
#include <string>

#include <nlohmann/json.hpp>

using json = nlohmann::json;

namespace gaptToolkit
{
    json getJsonFileList(std::string platform)
    {
        json repoList = getJsonRepoList(true);
        json gameList = {};

        for (auto &repo : repoList.items())
        {
            json repoInfo = repo.value();

            //std::cout << repoInfo.dump(4);

            std::string repoURL = repoInfo["url"];
            //std::cout << repoURL;

            std::string repoString = downloadToString(repoURL, repo.key());

            json repoData = json::parse(repoString.c_str());

            gameList.merge_patch(repoData);
        }

        json platformedGameList = gameList[platform];
        return platformedGameList;
    };
    
    json getFullJsonFileList()
    {
        json repoList = getJsonRepoList(true);
        json gameList = {};

        for (auto &repo : repoList.items())
        {
            json repoInfo = repo.value();

            //std::cout << repoInfo.dump(4);

            std::string repoURL = repoInfo["url"];
            //std::cout << repoURL;

            std::string repoString = downloadToString(repoURL, repo.key());

            json repoData = json::parse(repoString.c_str());

            gameList.merge_patch(repoData);
        }

        return gameList;
    };

    int cacheFileList()
    {
        json cacheJson = getFullJsonFileList();
        std::ofstream cacheFile(getGAPTSettingsPath() + "cache.json");
        cacheFile << std::setw(4) << cacheJson << std::endl;
        cacheFile.close();

        return 0;
    }

    json getCachedFileList()
    {
        std::ifstream cacheFile(getGAPTSettingsPath() + "cache.json");
        json cacheJson = json::parse(cacheFile);
        cacheFile.close();

        return cacheJson;
    }

    int downloadFile(std::string platform, std::string name)
    {
        json repos = getCachedFileList();
        json repo = repos[platform];
        string fileUrl = repo[name];

        return downloadToFile(fileUrl, name, platform);
    };
}; // namespace gaptToolkit
