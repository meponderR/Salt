#pragma once
#include <fstream>
#include <iostream>
#include <string>

#include <nlohmann/json.hpp>

using json = nlohmann::json;

namespace gaptToolkit
{
    json getFullGameList()
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

            json repoGames = repoData["games"];

            gameList.merge_patch(repoGames);
        }

        return gameList;
    };

    json getGameList(std::string platform)
    {
        json repoList = getJsonRepoList(true);
        json gameList = getFullGameList();

        json platformedGameList = gameList[platform];
        return platformedGameList;
    };


    //caching
    int cacheFileList()
    {
        json cacheJson = getFullGameList();
        std::ofstream cacheFile(getGAPTSettingsPath() + "cache.json");
        cacheFile << std::setw(4) << cacheJson << std::endl;
        cacheFile.close();

        return 0;
    }

    json getCachedGameList()
    {
        std::ifstream cacheFile(getGAPTSettingsPath() + "cache.json");
        json cacheJson = json::parse(cacheFile);
        cacheFile.close();

        return cacheJson;
    }

    json getCachedPlatformedGameList(std::string type)
    {
        return getCachedGameList()[type];
    }

    int downloadFile(std::string type, std::string name)
    {
        json games = getCachedPlatformedGameList(type);
        std::string fileUrl = games[name]["url"];
        return downloadToFile(fileUrl, name, type);
    };
}; // namespace gaptToolkit
