# babel-plugin-native-esm-imports

Transforms webpack style imports into browser native ESM imports, where
you are using some dist UMD versions of other modules. For example, say you
have these modules already loaded into the browser:

- https://unpkg.com/react@latest/umd/react.development.js
- https://unpkg.com/@material-ui/core@latest/umd/material-ui.development.js

You want to take an existing probject that is using webpack and
compiling your modules from this format:

```javascript
import React, { useState } from 'react';
import * as ReactRedux from 'react-redux';
import Button from '@material-ui/core/button';
import {Something} from 'legacyApp/something/component';
import {myComponent} from './components/mycomponent.js';
```

...into :

```javascript
// the react import goes away since it's already defined (UMD loaded as script tag)
const { useState } = React;
const { Button } = MaterialUI;
import {something} from '/legacyApp/something/component';
import {myComponent} from './components/mycomponent.js';
```

*Note: this plugin is not restricted to the react or material-ui.  You
 may use it with any library.*

## Why?

If you want to use native browser ESM imports without any compilation
step or webpack mucking around with your sources, or with a minimal
compilation step such as just transforming JSX, e.g.

`babel src/jsx --out-dir compiled/nojsx --plugins=@babel/plugin-transform-react-jsx,@babel/plugin-syntax-class-properties --no-babelrc`


## Installation

```
npm install --save-dev babel-plugin-native-esm-imports
```

## Example Usage

*In .babelrc:*

```javascript
{
  "plugins": [
    "@babel/plugin-transform-react-jsx",
    "@babel/plugin-syntax-class-properties",
    ["esm-native-imports", {
      "rules": [
        {
          "match":"(legacyJs).*?",
          "replace": "/some/path/to/legacyJs"
        },
        {
          "match":"react-redux",
          "fromGlobal": "ReactRedux"
        },
        {
          "match":"redux-thunk",
          "fromGlobal": "ReduxThunk"
        },
        {
          "match":"redux",
          "fromGlobal": "Redux"
        },
        {
          "match":"react-dom",
          "fromGlobal": "ReactDOM"
        },
        {
          "match":"react",
          "fromGlobal": "React"
        },
        {
          "match":"@material-ui/.*",
          "fromGlobal":"MaterialUI",
          "propertyImport": true
        }
      ]
    }]
  ]
}
```

## Options

Each option looks like 

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `match` | `string` | no |  | String or regexp to match for the name of the import module. e.g. the `react` in `import React from 'react'` |
| `fromGlobal` | `string` | no |  | The global variable name exposed by your UMD module on window object e.g. because you imported the unpkg version of react, you have `window.ReactDOM` defined, so set fromGlobal to `ReactDOM` |
| `replace` | `string` | no |  | If you have a regexp group in the match part, it will be replaced with this string |
| `propertyImport` | `boolean` | no | `false` | When set to true, forces imports to be property imports e.g. const {foo} |

