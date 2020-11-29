#pragma once
#include <string>
#include <filesystem>

std::string getGAPTSettingsPath()
{
    std::string settingsPath = std::string(getenv("HOME")) + std::string("/Library/gapt/");

    if (!(std::filesystem::exists(settingsPath)))
    {
        std::filesystem::create_directories(settingsPath);
    }
    
    return settingsPath;
}