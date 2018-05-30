{
    "context": "src", // not support project self
    "src": "src", // not support project self
    "diff": "tag", // auto tag:v0.0.1 branch:branch_name commit:notsupport path:notsupport
    "output": "tag", // auto tag:v0.0.1 branch:branch_name commit:notsupport path:notsupport
    "match": "normal", // strict none
    "ignore": [
        "path"
    ],
    "alias": {
        "alias": "path",
    },
    "module": {
        "module": "rules",
    },
    "symbol": {
        // not allowed !/
        "alias": "$",
        "module": "@",
        "minimatch": "-",
        "regexp": "~",
    },
    "dot": false,
    "release": [
        // object path : (boolean|object)
        {
            "$alias": {
                "a": true,
                "b": false,
                "c": {
                    "a": "b", // true
                    "b": "c,d,e/f", // true
                    "c.js$": true
                },
                "!d": []
            },
            "!$alias": {},
            "$alias": ["only-path", "!only-path"],
            "!$alias": [],

            "@module": true,
            "!@module": true,
        },

        // path
        "a/b/c",
        "/a/b/c",
        "a/b/c.js$",
        "common:a,b,c.js$",

        // path alias
        "$common",
        "$common/a",
        "$common:a/b/c",
        "$common:a,b,c",
        // false
        "!common",
        "!common/c",
        "!$common",
        "!$common:abc",
        "!$common:a,!b,c",

        // module
        "@module", // true
        "!@module", // false

        // minimatch
        "-minimatch", // true
        "!-minimatch", // false

        // RegExp
        "~reg", // true
        "!~reg", // false
    ],
}
