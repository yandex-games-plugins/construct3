"use strict";
{
  const DOM_COMPONENT_ID = "yagames_sdk";

  const HANDLER_CLASS = class YandexGamesSDKDOMHandler extends self.DOMHandler {
    constructor(iRuntime) {
      super(iRuntime, DOM_COMPONENT_ID);

      /**
       * @type {import("../types.d.ts").YSDK}
       */
      this.ysdk = {};

      this.AddRuntimeMessageHandler("ysdk-init", () => {
        const InitYSDK = (ysdk) => {
          this.PostToRuntime("ysdk-init", {
            environment: JSON.stringify({
              app: {
                id: ysdk.environment.app.id,
              },
              browser: {
                lang: ysdk.environment.browser.lang,
              },
              i18n: {
                lang: ysdk.environment.i18n.lang,
                tld: ysdk.environment.i18n.tld,
              },
              payload: ysdk.environment.payload,
            }),
            deviceInfo: JSON.stringify({
              type: ysdk.deviceInfo.type,
              isMobile: ysdk.deviceInfo.isMobile(),
              isTablet: ysdk.deviceInfo.isTablet(),
              isDesktop: ysdk.deviceInfo.isDesktop(),
              isTV: ysdk.deviceInfo.isTV(),
            }),
          });
        };

        // eslint-disable-next-line no-undef
        YaGames.init().then((ysdk) => {
          this.ysdk = ysdk;
          InitYSDK(ysdk);
        });
      });

      this.AddRuntimeMessageHandler("ysdk-show-fullscreen-ad", ({ id }) => {
        this.ysdk.adv.showFullscreenAdv({
          callbacks: {
            onClose: (wasShown) => {
              this.PostToRuntime("ysdk-fullscreen-ad-callback", {
                id,
                type: "onClose",
                wasShown,
              });
            },
            onOpen: () => {
              this.PostToRuntime("ysdk-fullscreen-ad-callback", {
                id,
                type: "onOpen",
              });
            },
            onError: (error) => {
              this.PostToRuntime("ysdk-fullscreen-ad-callback", {
                id,
                type: "onError",
                error: JSON.stringify(error),
              });
            },
            onOffline: () => {
              this.PostToRuntime("ysdk-fullscreen-ad-callback", {
                id,
                type: "onOffline",
              });
            },
          },
        });
      });

      this.AddRuntimeMessageHandler("ysdk-show-rewarded-ad", ({ id }) => {
        this.ysdk.adv.showFullscreenAdv({
          callbacks: {
            onOpen: () => {
              this.PostToRuntime("ysdk-rewarded-ad-callback", {
                id,
                type: "onOpen",
              });
            },
            onRewarded: () => {
              this.PostToRuntime("ysdk-rewarded-ad-callback", {
                id,
                type: "onRewarded",
              });
            },
            onClose: () => {
              this.PostToRuntime("ysdk-rewarded-ad-callback", {
                id,
                type: "onClose",
              });
            },
            onError: (error) => {
              this.PostToRuntime("ysdk-rewarded-ad-callback", {
                id,
                type: "onError",
                error: JSON.stringify(error),
              });
            },
          },
        });
      });
    }
  };

  self.RuntimeInterface.AddDOMHandlerClass(HANDLER_CLASS);
}
