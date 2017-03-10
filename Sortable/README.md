## Example App

Normally, after a code change to react-native-sortable-listview `src` files,
you must remove the node_modules/react-native-sortable-listview directory
and `npm install`.  The react-native packager wont follow symlinks.
To assist development, instead of `npm run start`, use:

```
npm run refresh
```

This will remove the node_modules/react-native-sortable-listview directory,
copy the react-native-sortable-listview `src` files from `..` and start the
packager. Since the packager won't notice changes in `node_modules`,
each time you make a change in the `src` files, you will need to
manually kill the packager with `^C`, then just rerun `npm run refresh`
