<h1> Symlink Manager</h1>

Symlink Manager easily manage to symbolic link processes of your dependency packages.

![symlink-introducing](https://www.imageupload.net/upload-image/2019/11/28/symlink-introducing.gif)

## Installation & Usage

```bash
yarn add symlink-manager --dev

# or if you are using npm

npm install symlink-manager --save-dev
```

Insert the following line in scripts of your package.json file.

```js
  // ...
  "scripts": {
    "symlink": "symlink",
    // ...
  },
```

Symlink-manager will help you for direction.

```bash
yarn symlink

# or if you are using npm

npm run symlink
```

| Command | Description                                                         |
| ------- | ------------------------------------------------------------------- |
| Link    | Creates symbolic link for selected packages                         |
| Unlink  | Removes symbolic link for linked packages                           |
| Copy    | Copies link folder into node_modules directly without symbolic link |

Symlink-manager supports Angular. (Only supoorts created with `ng generate lib` libraries).

```bash
yarn symlink --angular
```

Symlink-manager supports Yarn.

```bash
yarn symlink --yarn
```

Symlink-manager can take your packages on command.

```bash
yarn symlink --packages my-package-1,my-package-2 --no-watch
```

Symlink-manager supports the CI

```bash
yarn symlink copy --angular --all-packages --no-watch --sync --excluded-packages package1,package2
```

If building order matters, you can pass --sync

```bash
yarn symlink --sync
```

If you are not using Angular, you must add symlink.config.json for your configuration.

symlink.config.json example:

```js
{
  "yarn": true,
  "packages": [
    {
      // required
      // your main dependency folder path. The folder must have package.json.
      "libraryFolderPath": "packages/core",
      // required
      // this folder for symbolic link. You may enter the same value as libraryFolderPath.
      // linkFolderPath folder must have package.json.
      "linkFolderPath": "dist/core",
      // optional
      // your build command.
      "buildCommand": "ng build core",
      // optional
      // output -> cd packages/core && ng build core
      "buildCommandRunPath": "packages/core",
      // optional
      // symlink-manager doesn't watch these folders
      "exclude": ["node_modules", "dist"]
    }
  ]
}
```

For more:
<br>
<a href="https://github.com/mehmet-erim/symlink-manager/tree/master/examples/angular">See the Angular example project and document</a>
<br>
<a href="https://github.com/mehmet-erim/symlink-manager/tree/master/examples/react">See the React example project and document</a>

## Without symlink-manager for Angular

- After 5th step (<a href="https://github.com/mehmet-erim/symlink-manager/tree/master/examples/angular">Check the 5 steps in Angular Example</a>), run `ng build core --watch`
- Open new terminal window and go dist/core (`cd dist/core`)
- Run `npm link`
- Go back to main folder (`cd ../../`)
- Run `npm link @symlink/core`

Repeat it for every package.

Do not forget, symlink-manager do this automatically. Symlink-manager can create symbolic link a lot of packages in one terminal window
