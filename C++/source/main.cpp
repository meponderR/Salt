#include <iostream>
#include <string>
#include <filesystem>
#include <fstream>

#if defined(_WIN32)
#include <windows_OSSpec.hpp>
#define windows
#elif defined(linux)
#include <linux_OSSpec.hpp>
#elif defined(apple)
#include <apple_OSSpec.hpp>
#endif

#include <nlohmann/json.hpp>
#include <defaultCurl.hpp>
#include <settingsToolkit.hpp>
#include <gaptToolkit.hpp>

using namespace std;
using json = nlohmann::json;

int main(int argc, char *argv[])
{
	//help
	if (argc == 1 || string(argv[1]) == "help" || string(argv[1]) == "h")
	{
		cout << "gAPT CLI " << GAPT_VERSION << endl
			 //Usage
			 << "Usage: gapt command" << endl
			 << endl
			 //Description
			 << "gAPT provides a simple way to access gAPT repos." << endl
			 << endl

			 << "Most used commands:" << endl

			 //commands
			 //list
			 << "  list <platform> - "
			 << "List games for platform from repos" << endl

			 //search
			 << "  search <platform> <search terms> - "
			 << "Search games for platform from repos" << endl

			 //cache
			 << "  update - "
			 << "Update cache" << endl

			 //get
			 << "  get <platform> <name>  - "
			 << "Get specfied game from repo" << endl

			 //repo add
			 << "  repo add <name> <url> <type> - "
			 << "Add repo" << endl

			 //repo remove
			 << "  repo remove <name> - "
			 << "Remove repo" << endl

			 //repo remove
			 << "  mkconfig outputDir <path> - "
			 << "Set output directory" << endl;
		exit(0);
	}

	//list files
	if (string(argv[1]) == "list")
	{
		string platform = argv[2];
		json games = gaptToolkit::getCachedPlatformedGameList(platform);
		for (auto &fileData : games.items())
		{
			auto name = fileData.key();
			cout << name << endl;
		}
	}

	//search files
	else if (string(argv[1]) == "search")
	{
		string platform = argv[2];
		transform(platform.begin(), platform.end(), platform.begin(), ::toupper);

		string searchTerm;
		for (int i = 3; i < argc; ++i)
		{
			if (i == (argc - 1))
			{
				searchTerm = searchTerm + argv[i];
			}
			else
			{
				searchTerm = searchTerm + argv[i] + " ";
			}
		}
		transform(searchTerm.begin(), searchTerm.end(), searchTerm.begin(), ::toupper);

		json games = gaptToolkit::getCachedPlatformedGameList(platform);

		for (auto &fileData : games.items())
		{
			string name = fileData.key();
			string upperName = name;
			transform(upperName.begin(), upperName.end(), upperName.begin(), ::toupper);

			auto searchRes = std::search(upperName.begin(), upperName.end(), std::boyer_moore_searcher(searchTerm.begin(), searchTerm.end()));
			if (searchRes != upperName.end())
			{
				cout << name << endl;
			}
		}
	}

	//Update cache
	else if (string(argv[1]) == "update")
	{
		gaptToolkit::cacheFileList();
	}

	//download file
	else if (string(argv[1]) == "get")
	{
		gaptToolkit::downloadFile(argv[2], argv[3]);
	}

	//repo managment
	else if (string(argv[1]) == "repo")
	{
		if (string(argv[2]) == "info")
		{
		}
		else if (string(argv[2]) == "add")
		{
			addGaptRepo(argv[3], argv[4], "");
			gaptToolkit::cacheFileList();
		}
		else if (string(argv[2]) == "remove")
		{
			removeGaptRepo(argv[3]);
			gaptToolkit::cacheFileList();
		}
		else if (string(argv[2]) == "list")
		{
			json repoList = getJsonRepoList(true);
			for (auto &repo : repoList.items())
			{
				auto name = repo.key();
				cout << name << endl;
			}
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
