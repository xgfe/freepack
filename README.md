# Freepack -- a file version free pack manager.
> `freepack` allow to pack free version submodule, package and file.


## Installation
In global mode:
`npm install -g freepack`

In local mode:
`npm install --save-dev freepack`


## Usage
```shell
cd $project_dir
freepack init # [Optional] Create freepack.config.js file
freepack
```

- `freepack` **Main**
- `freepack init` **Create `freepack.config.js` file**
- `freepack diff` **Show changes between previous version**
- `freepack test` **Test rules**
- `freepack help` **More**


## Example
**[Example Tree](./doc/example/tree.md)**
**[Example .freepack.config.js](./doc/example/freepack.config.js.md)**
**[Example rules](./doc/example/rules.md)**
**[Example result rules/tree](./doc/example/result.md)**


## Rule
The new file will be released when the rule matches and dos not exist `negation` or `false`, otherwise the old file will be released.


### Rule Types
#### [Object]Nesting Rule
```js
// rule
{
  // Path Rule
  "path": {
    "pathA": true,
    "pathB": false,
    "pathC": [],
    "path/D": [ "a", "b/c", "d.js$" ],
    "pathE.js$": { "a": true },
    "pathF.js$": true
  },
  "path/subpath": {},

  // Alias Rule
  "$basic": true,
  "$basic/a": true,
  "$basicA": "b",
  "$basicB": {},
  "$basicC": [],

  // Module Rule
  "@common": true,
  "@sameA": false,
  "@sameB": "a",
  "@sameB": {},
  "@sameC": [
    // it will match alias.sameB when the value is not boolean,
    "path"
  ],

  // RegExp Rule
  "~regexp": true,

  // Match Rule
  "-match": false
}

// `freepack.config.js`
{
  "alias": {
    "sameA": "/modules/same",
    "sameB": "/modules/same",
    "basic": "/modules/Basic"
  },
  "module": {
    "sameA": [ "a" ],
    "sameB": {
      "b": true
    },
    "common": [ "common", "libs" ]
  }
}
```

**result rules**: `+ release` `- unrelease`
`[+] /src/path/pathA/*`
`[-] /src/path/pathB/*`
~~`[ ] /src/path/pathC`~~
`[+] /src/path/path/D/a/*`
`[+] /src/path/path/D/b/c/*`
`[+] /src/path/path/D/d.js`
`[+] /src/path/pathE.js$/a/*`
`[+] /src/path/pathF.js$`
~~`[ ] /src/path/subpath`~~
`[+] /src/modules/Basic/*`
`[+] /src/modules/Basic/b/*`
`[+] /src/common/*`
`[+] /src/libs/*`
`[-] /src/a/*`
`[+] /src/modules/same/path/*`
`[+] /regexp/.test`
`[-] (match).test`


**Note.**
- Only support `Alias`, `Module`, `Match`, `RegExp` rule as `key` in first level.
- Does not support `Match`, `RegExp` rule as `key` when `value` is not `boolean`.
- Does not support `file` meta char in `Path` rule as `key` when `value` is not `boolean`.
- Does not support `relation` meta char in `Path` rule as `key`.



#### [String]Path Rule - the relative path
`pathA/pathB` same as `/pathA/pathB` => `/src/pathA/pathB/*`
Also, path rule can contain meta characters: `negation`, `separation`, `relation`, `file`.

#### [String]Alias Rule
`$basic` => `/modules/Basic/*`
`$basic/a/b` => `/modules/Basic/a/b/*`
`$basic:a,b` => `/modules/Basic/a/*`, `/modules/Basic/b/*`

`freepack.config.js`
```js
{
  "alias": {
    // value only support negation meta char
    "basic": "/modules/Basic" // path string
  }
}
```

#### [String]Module Rule - import predefined rules
`@common` => `/src/common/*`, `/src/libs/*`

`freepack.config.js`
```js
{
  "module": {
    "common": [ "common", "libs" ]
  }
}
```

#### [String]Match Rule
`-match` => minimatch('match')

#### [String]RegExp Rule
`~reg` => eval('/' + 'reg' + '/');


### Meta Characters
Modify the default symbol configuration by `option.symbol`

#### `!` Negation - The rule of unrelease file path
> The first letter of the path string

`!path`, `!$alias`, `!@module`, `!-match`, `!~regexp`
*Note that there is no multiple negation rule, which means that as long as it appears to represent negative*
`!path:a,b/c` -> `!path/a`,`!path/b/c`
`path:a,!b/c` -> `path/a`,`!path/b/c`

#### `,` Separation - Split the path
`pathA,pathB`
*Note that separation only one level.*

#### `:` Relation - The relationship of path
`path:a,b/c` -> `path/a`,`path/b/c`
*Note that only the first hit of each path takes effect.*

#### `$` File - Path string ending with `$`, otherwhise defaults to the folder.
`path/subpath/filename.dot$`

#### ` ` Type
> Differentiate rule types
> The first letter of the path string or after the Negation`!`
- `~` Regexp
- `-` Match
- `$` Alias
- `@` Module


## Option
```js
{
  "git": "/absolute/path",
  "diff": "auto", // auto tag:v0.0.1 branch:branch_name commit:notsupport path:notsupport
  "match": "none", // strict none normal


  "root": "./src", // string (relative path!, default 'src')
  // the home directory for freepack
  // the rules is resolved relative to this directory

  "release": [
    // a list of release rules
    // Note that the lastest matched will effect

    {}, // object
    "path", // string (path rule)
    "$alias", // string (alias rule)
    "@module", // string (module rule)
    "-match", // string (match rule)
    "~regexp", // string (regexp rule)
  ],

  "dot": false, // boolean (default false),
  // Include .dot files in normal matches and globstar matches.
  // Note that an explicit dot in a portion of the pattern will always match dot files.

  // "ignore": [],
  // a list of unrelease files, only support ignore file
  // eg. "/.DS_Store" => ["/.DS_Store"]
  // eg. ".DS_Store" => ["/.DS_Store", "/path/.DS_Store", ...]

  "alias": {
    // a list of path aliases

    "alias": "path/subpath", // string (relative path!)
  },

  "module": {
    // a list of module rules collection

    "module": [ /* rules */ ], // array
  },

  "symbol": {
    // Single Character
    // Do not allowed repeat and use /

    "negation": "!", // string
    "relation": ":", // string
    "separation": ",", // string
    "file": "$", // string

    "regexp": "~", // string
    "match": "-", // string

    "alias": "$", // string
    "module": "@", // string
  }
}
```


## Change Release
> [new file] current tag, branch, dir... file.
> [old file] previous tag or specified file.

**Update Change**
- release: use new
- unrelease: use old

**Create Change**
- release: create file
- unrelease: nothing change

**Delete Change**
- release: delete file
- unrelease: nothing change


## Requires
- node
- git
