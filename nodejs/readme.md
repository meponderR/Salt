# Salt Node.js Library and CLI

This is both a CLI and library. It can be run with `npx salt-js <verb>`

## Verbs

### download &lt;id&gt;

Get specified game from your repos.

#### Aliases

- d &lt;id&gt;

### list 

List all files from repos.

#### Aliases

- l

### listr &lt;Repository id&gt;

List all files from a specified repository.

#### Aliases

- lr &lt;Repository id&gt;

### search &lt;platform&gt; &lt;search terms&gt;

Search games for platform from repos.

#### Aliases

- s &lt;platform&gt; &lt;search terms&gt;

### update

Update cache 

#### Aliases

- u

## repo list

List all repositories.

#### Aliases

- re l

### repo add &lt;name&gt; &lt;url&gt; &lt;type&gt;

Add repository from a url.

#### Aliases

- re a &lt;name&gt; &lt;url&gt; &lt;type&gt;

### repo remove &lt;Repository id&gt;

Remove the specified repository.

#### Aliases

- re r &lt;Repository id&gt;

### extension list

List all extensions.

#### Aliases

- e l

### extension install &lt;.saltextension path&gt;

Install extension from path.

#### Aliases

- e i &lt;.saltextension path&gt;

### config

Open settings configurator

#### Aliases

- c

<!--### config outputDir &lt;path&gt;

Set output directory

### config setUnsecuredOpt &lt;true or false&gt;

Disable or enable insecure connections i.e. torrents, http, ftp-->

## License

MIT License

Copyright (c) 2021 meponder

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.