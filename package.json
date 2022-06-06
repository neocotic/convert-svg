{
  "name": "convert-svg",
  "license": "MIT",
  "devDependencies": {
    "del-cli": "^4.0.1",
    "eslint": "^8.14.0",
    "eslint-config-notninja": "^0.4.0",
    "lerna": "^4.0.0",
    "mocha": "^9.2.2"
  },
  "scripts": {
    "bootstrap": "lerna bootstrap",
    "clean": "del-cli node_modules package-lock.json \"packages/*/node_modules\" \"packages/*/package-lock.json\"",
    "flint": "eslint . --fix",
    "install:all": "npm install && npm run bootstrap",
    "install:clean": "npm run clean && npm run install:all",
    "lint": "eslint .",
    "outdated:packages": "lerna exec --stream --no-bail \"npm outdated\"",
    "publish:packages": "lerna publish from-package",
    "test": "mocha -O maxDiffSize=32 -R list \"packages/*/test/**/*.spec.js\"",
    "test:jpeg": "npm test -- --grep convert-svg-to-jpeg",
    "test:png": "npm test -- --grep convert-svg-to-png",
    "test:webp": "npm test -- --grep convert-svg-to-webp",
    "verify": "npm run bootstrap && npm run lint && npm test",
    "version:packages": "lerna version --no-git-tag-version --no-push"
  },
  "engines": {
    "node": "^12.20.0 || >=14"
  },
  "private": true
}
