<h1> Symlink React Example </h1>

<h2> How to create this example application?</h2>

1. `npx create-react-app symlink-react-example`

2. Go to symlink-react-example and create packages folder.

3. Go to packages and run `npx create-react-library` then answer the questions. Our package name is symlink-react-core.

4. `yarn add symlink-manager --dev`

5. Add to following line to your scripts in package.json

```json
"scripts": {
  // ...
  "symlink": "symlink"
}
```

6. Open the package.json then add following line to dependencies manually. If you are published your package, you can install with npm.

```bash
`"symlink-react-core": "1.0.0"`
```

7. Run following command `yarn symlink` then choose Link. After choose no, then choose yes.

8. Symlink Manager create a `symlink.config.json` file. Open this file and paste the following code block.

```json
{
  "yarn": true,
  "packages": [
    {
      "libraryFolderPath": "packages/symlink-react-core",
      "linkFolderPath": "packages/symlink-react-core/dist",
      "buildCommand": "yarn build",
      "buildCommandRunPath": "packages/symlink-react-core",
      "exclude": ["node_modules", "dist"]
    }
  ]
}
```

9. Copy `packages/symlink-react-core/package.json` to `packages/symlink-react-core/dist/`. Because package.json should be required for the symbolic link.

10. Run `yarn symlink` then choose Link. After choose the symlink-react-core package.

11. Copy the following code block to App.js

```js
import React from 'react';
import './App.css';
import ExampleComponent from 'symlink-react-core';

function App() {
  return (
    <div className="App">
      <ExampleComponent text={'Hey! Our symbolic link is working.'} />
    </div>
  );
}

export default App;
```

Thats it! symlink-manager is very simple to use. But the React configuration a bit more.

Symlink-manager can create symbolic link a lot of packages in one terminal window
