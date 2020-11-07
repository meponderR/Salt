#include <iostream>
#include <string>
#include <filesystem>
#include <fstream>

#if defined(windows)
#include <windows_OSSpec.hpp>
#elif defined(linux)
#endif

#include <nlohmann/json.hpp>
#include <defaultCurl.hpp>
#include <settingsToolkit.hpp>
#include <gaptToolkit.hpp>

using namespace std;
using json = nlohmann::json;

int main(int argc, char *argv[])
{
	//list files
	if (string(argv[1]) == "list")
	{
		json repo = gaptToolkit::getJsonFileList(argv[2]);
		for (auto &fileData : repo.items())
		{
			auto name = fileData.key();
			cout << name << endl;
		}
	}

	//download file
	else if (string(argv[1]) == "get")
	{
		gaptToolkit::downloadFile(argv[2], argv[3]);
	}

	//repo managment
	else if (string(argv[1]) == "repo")
	{
		if (string(argv[2]) == "add")
		{
			cout << "pong";
			addGaptRepo(argv[3], argv[4], "");
		}
		else if (string(argv[2]) == "remove")
		{
			removeGaptRepo(argv[3]);
		}
	}

	//config managment
	else if (string(argv[1]) == "mkconfig")
	{
		if (string(argv[2]) == "outputDir")
		{
			setBaseDir(argv[3]);
		}
	}

	return 0;
}
