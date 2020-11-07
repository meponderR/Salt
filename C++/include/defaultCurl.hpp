#pragma once

#include <curl/curl.h>
#include <iostream>
#include <string>
#include <filesystem>
#include <math.h>
#include <settingsToolkit.hpp>

using namespace std;

size_t curlWriteToStringFunction(void *ptr, size_t size, size_t nmemb, string *outputString)
{
    outputString->append(static_cast<char *>(ptr), size * nmemb);
    return size * nmemb;
}

static size_t curlWriteToFileFunction(void *ptr, size_t size, size_t nmemb, void *stream)
{
    size_t written = fwrite(ptr, size, nmemb, (FILE *)stream);
    return written;
}

int progress_func(void *ptr, double TotalToDownload, double NowDownloaded,
                  double TotalToUpload, double NowUploaded)
{
    // ensure that the file to be downloaded is not empty
    // because that would cause a division by zero error later on
    if (TotalToDownload <= 0.0)
    {
        return 0;
    }

    // how wide you want the progress meter to be
    int totaldotz = 40;
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

string downloadToString(string url)
{
    std::string outputString;

    CURL *curl = curl_easy_init();
    if (curl)
    {

        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, curlWriteToStringFunction);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &outputString);
        curl_easy_setopt(curl, CURLOPT_CAINFO, "./curl-ca-bundle.crt");
        curl_easy_setopt(curl, CURLOPT_CAPATH, "./curl-ca-bundle.crt");
        curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
        //curl_easy_setopt(curl, CURLOPT_VERBOSE, 1);
        curl_easy_setopt(curl, CURLOPT_NOPROGRESS, false);
        curl_easy_setopt(curl, CURLOPT_PROGRESSFUNCTION, progress_func);

        CURLcode res = curl_easy_perform(curl);

        if (res != CURLE_OK)
        {
            fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        }

        /* always cleanup */
        curl_easy_cleanup(curl);
    }

    return outputString;
}

int downloadToFile(string url, string name, string type)
{
    string filePathFolder = getBaseDir() + "/" + type;

    if (!(filesystem::exists(filePathFolder)))
    {
        filesystem::create_directories(filePathFolder);
    }

    string filePath = filePathFolder + "/" + name + url.substr(url.find_last_of("."));

    CURL *curl;
    static const char *pagefilename = filePath.c_str();
    FILE *pagefile;

    curl_global_init(CURL_GLOBAL_ALL);

    /* init the curl session */
    curl = curl_easy_init();

    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, curlWriteToFileFunction);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &pagefile);
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYSTATUS, 0);
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
    //curl_easy_setopt(curl, CURLOPT_VERBOSE, 1);
    curl_easy_setopt(curl, CURLOPT_NOPROGRESS, FALSE);
    //curl_easy_setopt(curl, CURLOPT_PROGRESSFUNCTION, progress_func);

    fopen_s(&pagefile, pagefilename, "wb");
    if (pagefile)
    {

        /* write the page body to this file handle */
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, pagefile);

        /* get it! */
        CURLcode res = curl_easy_perform(curl);

        if (res != CURLE_OK)
        {
            fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        }

        /* close the header file */
        fclose(pagefile);
    }

    /* cleanup curl stuff */
    curl_easy_cleanup(curl);

    curl_global_cleanup();

    return 0;
}