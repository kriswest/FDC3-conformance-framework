# Mock Apps

The following are all mock apps used within the FDC3 conformance framework tests.

| Mock App Name | Used By                                                     | Intents (Contexts)                                                               |
| ------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Channels      | fdc3.broadcast                                              |                                                                                  |
| General       | fdc3.open                                                   |                                                                                  |
| Intent-A      | fdc3.findIntent, fdc3.findIntentByContext, fdc3.raiseIntent | aTestingIntent (testContextX, testContextZ), sharedTestingIntent1 (testContextX) |
| Intent-B      | fdc3.findIntent, fdc3.findIntentByContext, fdc3.raiseIntent | bTestingIntent (testContextY), sharedTestingIntent1 (testContextX, testContextY) |
| Intent-C      | fdc3.findIntent, fdc3.findIntentByContext, fdc3.raiseIntent | cTestingIntent (testContextX)                                                    |

The apps can be started in parallel via:

```sh
yarn start
```

## Mock App Configuration

It is the responsibility of the FDC3 application owner (the application under test) to ensure that these mock apps are configured correctly before the tests run. Examples of how to do this for some known FDC3 applications are below:

### Finsemble

After the installation, copy the json snippet from [snippet](./fdc3-app-config-examples/finsemble.app-d-snippet.txt) into `/public/configs/application/appd.json` under `appd`. This will add the test app and mock apps into the desktop container application under test, required for conformance testing.

## Mock App Closability

Some mock apps will close themselves after completing tests by calling `window.close()`. The desktop container under test must support this.  
