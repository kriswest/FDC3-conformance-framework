import { ResolveError, Listener } from "@finos/fdc3";
import { assert, expect } from "chai";

export default () =>
  describe("fdc3.broadcast", () => {
    let listener: Listener;
    let listener2: Listener;

    let testAppContext = {
      type: "fdc3.testAppContext",
      reverseFunctionCallOrder: false,
      contextBroadcasts: {
        instrument: true,
        contact: false,
      },
    };

    afterEach(async () => {
      if (listener !== undefined) {
        await listener.unsubscribe();
        listener = undefined;
      }

      if (listener2 !== undefined) {
        await listener2.unsubscribe();
        listener2 = undefined;
      }

      await window.fdc3.leaveCurrentChannel();
      testAppContext.reverseFunctionCallOrder = false;
      testAppContext.contextBroadcasts.contact = false;
    });

    it("Method is callable", async () => {
      await window.fdc3.broadcast({
        type: "fdc3.instrument",
        id: { ticker: "AAPL" },
      });
    });

    it("App A adds context listener then joins channel 1 => App B joins channel 1 then broadcasts context => App A receives context from B", async () => {
      const asyncWrapper = () => {
        return new Promise(async (resolve) => {
          //Add context listener to app A
          listener = await window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) => {
              expect(context.type).to.be.equals("fdc3.instrument");
              resolve(true);
            }
          );

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");

          //App A joins channel 1
          await joinChannel(1);

          //Open MockApp app. MockApp joins channel 1, then broadcasts context
          window.fdc3.open("MockApp", testAppContext);
          throw new Error("test error");
        });
      };

      await asyncWrapper();
    });

    it("App A joins channel 1 then adds context listener => App B joins channel 1 then broadcasts context => App A receives context", async () => {
      const asyncWrapper = () => {
        return new Promise(async (resolve) => {
          const channels = await window.fdc3.getSystemChannels();

          //App A joins channel 1
          await joinChannel(1);

          //Add context listener to app A
          listener = await window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) => {
              expect(context.type).to.be.equals("fdc3.instrument");
              resolve(true);
            }
          );

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");

          //Open MockApp app. MockApp joins channel 1, then broadcasts context
          await window.fdc3.open("MockApp", testAppContext);
        });
      };

      await asyncWrapper();
    });

    it("App B joins channel 1 then broadcasts context => App A joins channel 1 => App A adds context listener then receives context from B", async () => {
      const asyncWrapper = () => {
        return new Promise(async (resolve) => {
          //Open MockApp app. MockApp joins channel 1, then broadcasts context
          await window.fdc3.open("MockApp", testAppContext);

          //App A joins channel 1
          await joinChannel(1);

          //Add context listener to app A
          listener = await window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) => {
              expect(context.type).to.be.equals("fdc3.instrument");
              resolve(true);
            }
          );

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");
        });
      };

      await asyncWrapper();
    });

    it("App B broadcasts context then joins channel 1 => App A joins channel 1 => App A adds context listener then receives context from B", async () => {
      const asyncWrapper = () => {
        testAppContext.reverseFunctionCallOrder = true;
        return new Promise(async (resolve) => {
          //Open MockApp app. MockApp broadcasts context, then joins channel 1
          await window.fdc3.open("MockApp", testAppContext);

          //App A joins channel 1
          await joinChannel(1);

          //Add context listener to app A
          listener = await window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) => {
              expect(context.type).to.be.equals("fdc3.instrument");
              resolve(true);
            }
          );

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");
        });
      };

      await asyncWrapper();
    });

    it("App A adds instrument context listener => App A and B join channel 1 => App B broadcasts two contexts => App A receives the instrument context from B", async () => {
      const asyncWrapper = async () => {
        testAppContext.contextBroadcasts.contact = true;
        return new Promise(async (resolve) => {
          //Add context listener to app A
          listener = await window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) => {
              expect(context.type).to.be.equals("fdc3.instrument");
              resolve(true);
            }
          );

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");

          //App A joins channel 1
          joinChannel(1);

          //Open MockApp app. MockApp joins channel 1, then broadcasts both contexts
          window.fdc3.open("MockApp", testAppContext);
        });
      };

      await asyncWrapper();
    });

    it("App A adds two context listeners => App A and B join channel 1 => App B broadcasts two contexts => App A receives both contexts from B", async () => {
      let contextsReceived = 0;
      const asyncWrapper = async () => {
        testAppContext.contextBroadcasts.contact = true;
        return new Promise(async (resolve) => {
          //Add context listener to app A
          listener = await window.fdc3.addContextListener(
            "fdc3.instrument",
            (context) => {
              expect(context.type).to.be.equals("fdc3.instrument");
              checkIfBothContextsReceived();
            }
          );

          assert.isObject(listener);
          expect(typeof listener.unsubscribe).to.be.equals("function");

          //Add second context listener to app A
          listener2 = await window.fdc3.addContextListener(
            "fdc3.contact",
            (context) => {
              expect(context.type).to.be.equals("fdc3.contact");
              checkIfBothContextsReceived();
            }
          );

          assert.isObject(listener2);
          expect(typeof listener2.unsubscribe).to.be.equals("function");

          //App A joins channel 1
          await joinChannel(1);

          //Open MockApp app. MockApp joins channel 1, then broadcasts both contexts
          await window.fdc3.open("MockApp", testAppContext);

          function checkIfBothContextsReceived() {
            contextsReceived++;
            if (contextsReceived > 1) {
              resolve(true);
            }
          }
        });
      };

      await asyncWrapper();
    });

    it("App A adds two context listeners => App A and B join different channels => App B broadcasts two contexts => App A doesn't receive any context", async () => {
      testAppContext.contextBroadcasts.contact = true;

      //Add two context listeners to app A
      listener = await addContextListener(listener, "fdc3.instrument");
      listener2 = await addContextListener(listener2, "fdc3.contact");
      //App A joins channel 2
      await joinChannel(2);
      //Open MockApp app. MockApp joins channel 1, then broadcasts both contexts
      await window.fdc3.open("MockApp", testAppContext);

      let wait = new Promise((resolve) => {
        setTimeout(async function () {
          resolve(true);
        }, 4000);
      });
      //Give listeners time to receive context
      await wait;
    });

    it("App A adds two context listeners => App A and B join the same channel => App A unsubscribes listeners => App B broadcasts two contexts => App A doesn't receive any context", async () => {
      testAppContext.contextBroadcasts.contact = true;
      //Add two context listeners
      listener = await addContextListener(listener, "fdc3.intrument");
      listener2 = await addContextListener(listener2, "fdc3.contact");

      //App A joins channel 1
      await joinChannel(1);

      //unsubscribe from listeners
      if (listener !== undefined) {
        await listener.unsubscribe();
        listener = undefined;
      } else {
        throw new Error("Listener undefined");
      }
      if (listener2 !== undefined) {
        await listener2.unsubscribe();
        listener2 = undefined;
      } else {
        throw new Error("Listener undefined");
      }

      //Open MockApp app. MockApp joins channel 1, then broadcasts both contexts
      window.fdc3.open("MockApp", testAppContext);
      let wait = new Promise((resolve) => {
        setTimeout(async function () {
          resolve(true);
        }, 4000);
      });
      //Give listeners time to receive context
      await wait;
    });

    //THIS FAILS!
    it("App A adds two context listeners => App A joins channel 1 then joins channel 2 => App B joins channel 1 then broadcasts two contexts => App A doesn't receive any context", async () => {
      testAppContext.contextBroadcasts.contact = true;

      //Add two context listeners to app A
      listener = await addContextListener(listener, "fdc3.instrument");
      listener2 = await addContextListener(listener2, "fdc3.contact");

      //App A joins a channel and then joins another
      await joinChannel(1);
      await joinChannel(2);

      //Open MockApp app. MockApp joins channel 1, then broadcasts both contexts
      await window.fdc3.open("MockApp", testAppContext);

      let wait = new Promise((resolve) => {
        setTimeout(async function () {
          resolve(true);
        }, 4000);
      });

      //Give listeners time to receive context
      await wait;
    });

    //TEST FAILS!
    it("App A adds two context listeners => App A joins and then leaves channel 1 => App B joins channel 1 and broadcasts two contexts => App A doesn't receive any context", async () => {
      testAppContext.contextBroadcasts.contact = true;

      //Add two context listeners to app A
      listener = await addContextListener(listener, "fdc3.instrument");
      listener2 = await addContextListener(listener2, "fdc3.contact");

      //App A joins channel 1
      await joinChannel(1);

      //App A leaves channel 1
      await window.fdc3.leaveCurrentChannel();

      //App B joins channel 1, then broadcasts both contexts
      await window.fdc3.open("MockApp", testAppContext);

      //Give listeners time to receive context
      let wait = new Promise((resolve) => {
        setTimeout(async function () {
          resolve(true);
        }, 4000);
      });

      //Give listeners time to receive context
      await wait;
    });

    // const fdc3Version = (<HTMLSelectElement>document.getElementById("version"))
    //   .value;
    // if (fdc3Version === "2.0") {
    //   it("When broadcasting without a type field, throws invalid object structure error and promise is rejected", async () => {
    //     try {
    //       const invalidContext = {
    //         test: "",
    //       };

    //       await window.fdc3.broadcast(invalidContext as any);
    //     } catch (ex) {
    //       throw new Error(ex.message ?? ex);
    //     }
    //   });
    // } else if (fdc3Version === "1.2") {
    //   it("When broadcasting without a type field, throws invalid object structure error", async () => {
    //     try {
    //       const invalidContext = {
    //         test: "",
    //       };

    //       await window.fdc3.broadcast(invalidContext as any);
    //     } catch (ex) {
    //       throw new Error(ex.message ?? ex);
    //     }
    //   });
    // }

    const joinChannel = async (channel: number) => {
      const channels = await window.fdc3.getSystemChannels();
      if (channels.length > 0) {
        await window.fdc3.joinChannel(channels[channel - 1].id);
      } else {
        throw new Error("No system channels available for app A");
      }
    };

    const addContextListener = async (
      listenerObject: Listener,
      contextType: string
    ) => {
      listenerObject = await window.fdc3.addContextListener(
        contextType === null ? null : contextType,
        (context) => {
          expect(context.type).to.not.equal(contextType);
        }
      );

      assert.isObject(listenerObject);
      expect(typeof listenerObject.unsubscribe).to.be.equals("function");

      return listenerObject;
    };
  });
