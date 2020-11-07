# gAPT CLI

This provides a simple way to download libre games, along with launchers of paid games. Please do not use for illegal purposes.

## Paths

The settings path is different depending on the os

### Windows

The settings path should be in

```file
%APPDATA%/gapt
```

### Linux

The settings path should be in

```file
~/.gapt-settings
```

### MacOS

The settings path should be in

```file
~/Library/gapt
```

## Syntax

### File Managment

#### List Games in Repos

```cmd
gapt list platform
```

NOTE: Replace platform with the platform of the game.

#### Get Game From Repo

```cmd
gapt get platform name
```

NOTE: Replace platform with the platform of the game, name with the name of the game from your repos in quotes

### Repo Managment

#### Add Repo

```cmd
gapt repo add name url type
```

NOTE: Replace name with the name of the repo in quotes, url with the url of the repo, type with the type of the repo(type is currently not supported)

#### Remove Repo

```cmd
gapt repo remove name
```

NOTE: Replace name with the name of the existing repo

### Config Managment

#### Set Output Directory

```cmd
gapt mkconfig outputDir path
```

NOTE: Replace path with the path where you want to download games to. On comand prompt and maybe in other terminals you can drag the folder into the terminal and it will put the path in the terminal.
