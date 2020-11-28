#pragma once
#include <windows.h>
#include <ShlObj_core.h>
#include <regex>
#include <string>

std::string getGAPTSettingsPath()
{
    TCHAR szPath[MAX_PATH];

    SHGetFolderPath(NULL, CSIDL_APPDATA, NULL, 0, szPath);
    std::string gaptPath = szPath;
    std::replace(gaptPath.begin(), gaptPath.end(), '\\', '/');
    gaptPath = gaptPath + "/gapt/";

    return gaptPath;
}