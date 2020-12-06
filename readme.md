# gAPT

gAPT is a standard for downloading games. It's main intent is to download libre games, along with launchers of paid & free games. Please do not use for illegal purposes.

## Examples/Apps

- [C++ Command Line Tool](C++/)
- [WinUI C++ (In progress)](WinUI/)
- [Electron UI in Node.JS (In progress)](nodejs/)

## Paths

### Settings

The settings path might be different depending on the app and os. The paths settings should be in the following locations.

#### Windows

The settings path should be in

```path
%APPDATA%/gapt
```

#### Linux

The settings path should be in

```path
~/.config/gapt
```

#### MacOS

The settings path should be in

```path
~/Library/gapt
```

## Repo Format

```json
{
    "meta": {
        "name": "Example Repo",
        "description": "An example repo to show repo formatting.",
        "icon": "https://example.com/example_icon.png"
    },
    "games": {
        "jar": {
            "game1": {
                "url": "https://example.com/game1.jar",
                "description": "Example game"
            },
            "game2": {
                "url": "https://example.com/game2/game2.jar",
                "description": "Another Example game"
            }
        }
    }
}
```

## Asset Attribution

Icons are from Material Icons(NodeJS and Temporary Main Icon), Segoe MDL2 icons(WinUI).
