# gAPT CLI

gAPT CLI is a simple C++ program that can access gAPT repos.

## Syntax

### Game Retrieval

#### Search Games in Repos

```cmd
gapt search <platform> <search terms>
```

#### List Games in Repos

```cmd
gapt list <platform>
```

#### Get Game From Repos

```cmd
gapt get <platform> <name>
```

### Repo Managment

#### Update Cached Repos

```cmd
gapt update
```

NOTE: Adding and removing repos will also update the list.

#### Add Repo

```cmd
gapt repo add <name> <url> <type>
```

#### Remove Repo

```cmd
gapt repo remove <name>
```

### Config Managment

#### Set Output Directory

```cmd
gapt mkconfig outputDir <path>
```

Note: On command prompt and maybe in other terminals, you can drag a folder into the terminal and it will put the path in the terminal.

## Building

### Requirments

- cmake
- [conan](https://conan.io/downloads.html)(Optional. Required if using windows)
- libcurl(if not using conan)
- A cmake and C++17 compatible compiler(i.e. GCC, Clang, MSVC)

### Windows (conan)

```cmd
conan install -if build .
cmake -Bbuild
```
