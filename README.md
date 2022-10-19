[![FINOS - Incubating](https://cdn.jsdelivr.net/gh/finos/contrib-toolbox@master/images/badge-incubating.svg)](https://finosfoundation.atlassian.net/wiki/display/FINOS/Incubating)
[![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/6456/badge)](https://bestpractices.coreinfrastructure.org/projects/6456)

# FDC3 Conformance Framework

A framework for testing whether desktop containers implement the [FDC3 standard](https://fdc3.finos.org/).

This project currently targets FDC3 v1.2.

## Installation

This repository currently contains:

 - `tests` - the FDC3 conformance tests, implemented using Mocha / TypeScript, making use of the FDC3 type definitions, [@finos/fdc3](https://www.npmjs.com/package/@finos/fdc3).
 - `app` - A simple application that hosts the tests, allowing them to be executed from within a desktop container.
 - `mock` - Multiple mock applications that are used to verify conformance - [details](./mock/README.md)

In order to get started, install all the dependencies with:

```sh
yarn
```

Then build all the components with:

```sh
yarn build
```

The server(s) can be started as follows:

```sh
// Start the app which runs the tests
cd app
yarn start

// Start all the mock apps which the tests will make use of
cd mock
yarn start
```

The application will start and will open a webbrowser tab, this tab will have an error. The reason is that the app does not have a Window.FDC3 object and should be ran through the desktop agent.

## Mock Apps

Various mock apps used for testing are opened and closed by the desktop agent being tested during test execution. These apps can be found in the `mock` folder.
The following table shows all of the mock apps that are used by the FDC3 conformance framework tests.

| Mock App Name | Used By                                                     | Intents (Contexts)                                                               |
| ------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Channels      | fdc3.broadcast                                              |                                                                                  |
| General       | fdc3.open                                                   |                                                                                  |
| Intent-A      | fdc3.findIntent, fdc3.findIntentByContext, fdc3.raiseIntent | aTestingIntent (testContextX, testContextZ), sharedTestingIntent1 (testContextX) |
| Intent-B      | fdc3.findIntent, fdc3.findIntentByContext, fdc3.raiseIntent | bTestingIntent (testContextY), sharedTestingIntent1 (testContextX, testContextY) |
| Intent-C      | fdc3.findIntent, fdc3.findIntentByContext, fdc3.raiseIntent | cTestingIntent (testContextX)                                                    |

### Configuration

It is the responsibility of the FDC3 application owner (the application under test) to ensure that the conformance app and the mock apps are configured correctly before the tests run. An example of how to do this for Finsemble is given below:

Copy the JSON snippet from [snippet](./fdc3-app-config-examples/finsemble.app-d-snippet.txt) into `/public/configs/application/appd.json` under `appd`. This will add the conformance app and mock apps required for conformance testing into the target desktop container application. 

### Mock App Closability

Some mock apps will close themselves after completing tests by calling `window.close()`. The desktop container being tested must support this.

### Run Mock Apps Silently

It is advisable that the dekstop container that is being tested run the mock apps silently. As an example of how to do this, in Finsemble you can set the `autoShow` property to `false` in the `/public/configs/application/appd.json` file under `[ExampleMockAppName]/manifest/window/options/autoShow`.

## Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Read our [contribution guidelines](CONTRIBUTING.md) and [Community Code of Conduct](https://www.finos.org/code-of-conduct)
4. Commit your changes (`git commit -am 'Add some fooBar'`)
5. Push to the branch (`git push origin feature/fooBar`)
6. Create a new Pull Request

_NOTE:_ Commits and pull requests to FINOS repositories will only be accepted from those contributors with an active, executed Individual Contributor License Agreement (ICLA) with FINOS OR who are covered under an existing and active Corporate Contribution License Agreement (CCLA) executed with FINOS. Commits from individuals not covered under an ICLA or CCLA will be flagged and blocked by the FINOS Clabot tool (or [EasyCLA](https://github.com/finos/community/blob/master/governance/Software-Projects/EasyCLA.md)). Please note that some CCLAs require individuals/employees to be explicitly named on the CCLA.

*Need an ICLA? Unsure if you are covered under an existing CCLA? Email [help@finos.org](mailto:help@finos.org)*


## License

Copyright 2022 FINOS 

Distributed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

SPDX-License-Identifier: [Apache-2.0](https://spdx.org/licenses/Apache-2.0)
