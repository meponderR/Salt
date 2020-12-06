#pragma once

#include <curl/curl.h>
#include <iostream>
#include <string>
#include <filesystem>
#include <math.h>
#include <settingsToolkit.hpp>

#ifdef __unix
#define fopen_s(pFile,filename,mode) ((*(pFile))=fopen((filename),  (mode)))==NULL
#endif

//using namespace std;

//write to string function
size_t curlWriteToStringFunction(void *ptr, size_t size, size_t nmemb, std::string *outputString)
{
    outputString->append(static_cast<char *>(ptr), size * nmemb);
    return size * nmemb;
}

//write to file function
static size_t curlWriteToFileFunction(void *ptr, size_t size, size_t nmemb, void *stream)
{
    size_t written = fwrite(ptr, size, nmemb, (FILE *)stream);
    return written;
}

//simple progress function
int progress_func(void *ptr, double TotalToDownload, double NowDownloaded, double TotalToUpload, double NowUploaded)
{
    // ensure that the file to be downloaded is not empty
    // because that would cause a division by zero error later on
    if (TotalToDownload <= 0.0)
    {
        return 0;
    }

    // how wide you want the progress meter to be
    int totaldotz = 50;
    double fractiondownloaded = NowDownloaded / TotalToDownload;
    // part of the progressmeter that's already "full"
    int dotz = (int)round(fractiondownloaded * totaldotz);

    // create the "meter"
    int ii = 0;
    printf("%3.0f%% [", fractiondownloaded * 100);
    // part  that's full already
    for (; ii < dotz; ii++)
    {
        printf("=");
    }
    // remaining part (spaces)
    for (; ii < totaldotz; ii++)
    {
        printf(" ");
    }
    // and back to line begin - do not forget the fflush to avoid output buffering problems!
    printf("]\r");
    fflush(stdout);
    // if you don't return 0, the transfer will be aborted - see the documentation
    return 0;
}

std::string downloadToString(std::string url, std::string name)
{
    std::string outputString;

    CURL *curl = curl_easy_init();
    if (curl)
    {
        //set url
        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());

        //redirect
        curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);

        //write to string
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, curlWriteToStringFunction);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &outputString);

        //progress
        curl_easy_setopt(curl, CURLOPT_NOPROGRESS, false);
        curl_easy_setopt(curl, CURLOPT_PROGRESSFUNCTION, progress_func);

//temporarily disable tls
#if defined(windows)
        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
#endif

//verbose
#if defined(verbose)
        curl_easy_setopt(curl, CURLOPT_VERBOSE, 1);
#endif

        CURLcode res = curl_easy_perform(curl);

        if (res != CURLE_OK)
        {
            fprintf(stderr, std::string("Downloading repo, \"" + name + "\" failed: %s\n").c_str(), curl_easy_strerror(res));
        }

        curl_easy_cleanup(curl);
    }

    std::cout << std::endl;

    return outputString;
}

int downloadToFile(std::string url, std::string name, std::string type)
{
    std::string filePathFolder = getBaseDir() + "/" + type;

    if (!(std::filesystem::exists(filePathFolder)))
    {
        std::filesystem::create_directories(filePathFolder);
    }

    std::string filePath = filePathFolder + "/" + name + url.substr(url.find_last_of("."));

    CURL *curl;
    static const char *pagefilename = filePath.c_str();
    FILE *pagefile;

    //global init
    curl_global_init(CURL_GLOBAL_ALL);

    /* init the curl session */
    curl = curl_easy_init();

    //set url
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());

    //redirect
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);

    //write to file
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, curlWriteToFileFunction);

    //progress
    curl_easy_setopt(curl, CURLOPT_NOPROGRESS, false);
    //curl_easy_setopt(curl, CURLOPT_PROGRESSFUNCTION, progress_func);

//temporarily disable tls
#if defined(windows)
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
#endif

//verbose
#if defined(verbose)
    curl_easy_setopt(curl, CURLOPT_VERBOSE, 1);
#endif

    fopen_s(&pagefile, pagefilename, "wb");
    if (pagefile)
    {

        //pass file to function
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, pagefile);

        //reqest
        CURLcode res = curl_easy_perform(curl);

        if (res != CURLE_OK)
        {
            fprintf(stderr, std::string("Downloading file, \"" + name + "\" failed: %s\n").c_str(), curl_easy_strerror(res));
        }

        //close file
        fclose(pagefile);
    }

    //cleanup
    curl_easy_cleanup(curl);

    //global cleanup
    curl_global_cleanup();

    return 0;
}