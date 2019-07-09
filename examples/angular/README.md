<h1> Symlink Angular Example </h1>

<h2> How to create this example application?</h2>

### 1. ng new symlink-example

### 2. ng generate lib core

### 3. Go to projects/core/package.json then rename projectName to @symlink/core

### 4. Go to projects/core/ng-package.json then add the following line

```js
{
  // bottom of file
  "deleteDestPath": false
}
```

### 5. Open the package.json then add following line to dependencies manually. If you are published your package, you can install with npm.

```bash
`"@symlink/core": "0.0.1"`
```

### 6. Rename paths in the tsconfig.json

Paths after renaming:

```json
"paths": {
  "@symlink/core": ["dist/core"],
  "@symlink/core/*": ["dist/core/*"]
}
```

Now, the project ready for symbolic link. If you are do not want to use symlink-manager, look at the <a href="#Without-symlink-manager">here</a>

### 7. npm install symlink-manager --save-dev

### 8. Add to following line to your scripts in package.json

```json
"scripts": {
  // ...
  "symlink": "symlink --angular"
}
```

### 9. Run following command `npm run symlink` then choose Link. After choose the @symlink/core package.

Thats it! symlink-manager is very simple to use. But the Angular configuration a bit more.

If you see an error while building with AOT Compiler (prod build), try to add following line to your tsconfig.app.json file.

```js
"compilerOptions": {
  // ...
  "paths": {}
}
```

## Without symlink-manager

- After 6th step, run `ng build core --watch`
- Open new terminal window and go dist/core (`cd dist/core`)
- Run `npm link`
- Go back to main folder (`cd ../../`)
- Run `npm link @symlink/core`

Repeat it for every package.

Do not forget, symlink-manager do this automatically. Symlink-manager can create symbolic link a lot of packages in one terminal window

<br>
<span>Angular CLI version: 8.0.3 </span>
