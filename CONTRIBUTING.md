# Contributing

If you have any questions about this library, please feel free to
[raise an issue](https://github.com/neocotic/convert-svg/issues/new).

Please [search existing issues](https://github.com/neocotic/convert-svg/issues) for the same feature and/or issue before
raising a new issue. Commenting on an existing issue is usually preferred over raising duplicate issues.

Please ensure that all files conform to the coding standards, using the same coding style as the rest of the code base.
All unit tests should be updated and passing as well. All of this can easily be checked via command-line:

``` sh
npm install
npm run build
npm run lint
npm test
# OR to run all of the above (excl. install):
npm run verify
```

You must have at least [Node.js](https://nodejs.org) version v22 or newer installed.

You can run `lint:fix` and/or `verify:fix` run-scripts to automatically fix any linting and formatting issues that are
found.

Some test fixtures include Microsoft-based fonts, so if you're a Linux user, you will have to ensure that you have
Microsoft fonts installed. For example, Ubuntu users can do the following:

``` sh
sudo apt-get update
sudo apt-get install -y ttf-mscorefonts-installer
sudo fc-cache -fv
```

All pull requests should be made to the `main` branch.

Remember to add your details to the list of [AUTHORS.md](https://github.com/neocotic/convert-svg/blob/main/AUTHORS.md)
if you want your contribution to be recognized by others.

## Release

Releases are currently manually managed by one of the code owners, where they will update `CHANGES.md`, bump versions of
packages, and publish the packages. Some helpful run-scripts are available to aid them:

``` sh
npm run version:packages -- minor
npm run publish:packages
```

If you're making changes to GitHub Workflows, you can use [act](https://nektosact.com) to run jobs locally to test your
changes before opening a pull request.

## macOS

> ⚠️ **Heads up!**
> 
> If you develop using macOS it's important to note that, due to a noticeable reduction in the quality of output files
> when running on macOS, you will be expected to use some slightly different npm run-scripts. These use Docker
> under-the-hood primarily to ensure more consistent test outputs. Most notably, these run-scripts include:
>
> * `test:docker`
> * `verify:docker`
> * `verify:docker:fix`
