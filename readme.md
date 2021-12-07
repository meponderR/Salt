# Salt

Salt is a standard for downloading files. 

## Clients

- [C++ Command Line Tool](C++/) License: MIT _In Progress_
- [nodejs Command Line Tool](nodejs/) License: MIT
- [Electron UI in Node.JS](js-electron/) License: MIT _In Progress_

### Second-Party Clients

If you create a client using one of the libraries, post it in the [Second-Party Clients](https://github.com/meponderR/Salt/discussions/categories/second-party-clients) Github Discussion.

## Paths

### Settings

The settings path might be different depending on the app and os. The paths settings should be in the following locations.

#### Windows

The settings, extensions, and caches should be in:

```path
%APPDATA%/Salt
```

#### Linux

The settings, extensions, and caches should be in:

```path
~/.local/share/Salt
```

#### MacOS

The settings, extensions, and caches should be in:

```path
~/Library/Salt
```

## Repo Format

Repositories are stored in a jsonc file.

```json
{
    "meta": {
        "Name": "Example Repo",                                             // Full repo name
        "ShortName": "Ex Repo",                                             // Shortened repo name
        "Description": "An example repo to showcase repo formatting.",      // A short description to tell users about your repo.
        "Icon": "https://example.com/example_icon.png"                      // Icon for GUI gapt clients
    },
    "files": {
        "com.example.game1": {                                              // File id
            "Name": "Example Game 1",                                       // Full Name for file
            "ShortName": "EX Game 1",                                       // Short Name for some gapt clients
            "URL": "https://example.com/game1.jar",                         // URL to download app
            "Description": "Example game",                                  // A short description to tell users about your file.
            "Icon": "https://example.com/example_icon.png"                  // Icon for GUI gapt clients
        },
        "com.example.game2": {                                              // File id
            "Name": "Example Game 2",                                       // Full Name for file
            "ShortName": "EX Game 2",                                       // Short Name for some gapt clients
            "URL": "https://example.com/game2/game2.jar",                   // URL to download app
            "description": "Another example game",                          // A short description to tell users about your file.
            "Icon": "https://example.com/example_icon.png"                  // Icon for GUI gapt clients
        },
        "com.example.game3": {                                              // File id
            "Name": "Example Game 3",                                       // Full Name for file
            "ShortName": "EX Game 3",                                       // Short Name for some gapt clients
            "URL": "ftps://user:password@example.com/game3/game3.jar",      // URL to download app
            "description": "Example game using ftps with anonynomous credentials.", // A short description to tell users about your file.
            "Icon": "https://example.com/example_icon.png"                  // Icon for GUI gapt clients
        },
        "com.example.game4": {                                              // File id
            "Name": "Example Game 4",                                       // Full Name for file
            "ShortName": "EX Game 4",                                       // Short Name for some gapt clients
            "URL": "sftp://user:password@example.com/game4/game4.jar",      // URL to download app
            "Description": "Example game using sftp with credentials",      // A short description to tell users about your file.
            "Icon": "https://example.com/example_icon.png"                  // Icon for GUI gapt clients
        }
    }
}
```

## Asset Attribution

Icons are from Material Icons(NodeJS and Temporary Main Icon), Segoe MDL2 icons(WinUI).
