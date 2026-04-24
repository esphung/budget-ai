rm -rf android/app/build android/build ios/build node_modules coverage package-lock.json
watchman watch-del-all
yarn install --immutable
