# Symlink Manager

Symlink Manager easily manage to symbolic link processes of your dependency packages.

<img src="https://www.photobox.co.uk/my/photo/full?photo_id=501975930459" />

## Installation & Usage

```bash
yarn add symlink-manager --dev

# or if you are using npm

npm install symlink-manager --save-dev
```

Insert the following line in scripts of your package.json file.

```json
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

Symlink-manager supports Angular. (Only supoorts created with "ng generate lib" libraries)

```bash
yarn symlink --angular
```

If you are not using Angular, you must add symlink.config.json for your configuration.

symlink.config.json example:

```json
{
  "yarn": true,
  "packages": [
    {
      // required
      // your main dependency folder path. The folder must have package.json.
      "libraryFolderPath": "packages/core",
      // required
      // this folder for symbolic link. You may enter the same value as libraryFolderPath.
      "linkFolderPath": "dist/core",
      // optional
      // your build command.
      "buildCommand": "ng build core",
      // optional
      // output -> cd packages/core && ng build core
      "buildCommandRunPath": "packages/core"
    }
  ]
}
```

For more
<a href="">See the examples</a>
