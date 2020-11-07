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

            std::string repoString = downloadToString(repoURL);

            json repoData = json::parse(repoString.c_str());

            gameList.merge_patch(repoData);
        }

        json platformedGameList = gameList[platform];
        return platformedGameList;
    };

    int downloadFile(std::string type, std::string name)
    {
        json repo = getJsonFileList(type);
        string fileUrl = repo[name];

        return downloadToFile(fileUrl, name, type);
    };
}; // namespace gaptToolkit
