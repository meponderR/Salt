#pragma once
#include <windows.h>
#include <ShlObj_core.h>
#include <regex>
#include <string>


// Returns an empty string if dialog is canceled
std::string getFolderString()
{
    std::string path;

    TCHAR szDir[MAX_PATH];
    BROWSEINFO bInfo;
    bInfo.pidlRoot = NULL;
    bInfo.pszDisplayName = szDir;                // Address of a buffer to receive the display name of the folder selected by the user
    bInfo.lpszTitle = "Please, select a folder"; // Title of the dialog
    bInfo.ulFlags = 0;
    bInfo.lpfn = NULL;
    bInfo.lParam = 0;
    bInfo.iImage = -1;

    LPITEMIDLIST lpItem = SHBrowseForFolder(&bInfo);
    if (lpItem != NULL)
    {
        path = SHGetPathFromIDList(lpItem, szDir);
        //......
    }

    return path;
}

std::string getGAPTSettingsPath()
{
    TCHAR szPath[MAX_PATH];

    SHGetFolderPath(NULL, CSIDL_APPDATA, NULL, 0, szPath);
    std::string gaptPath = szPath;
    std::replace(gaptPath.begin(), gaptPath.end(), '\\', '/');
    gaptPath = gaptPath + "/gapt/";

    return gaptPath;
}