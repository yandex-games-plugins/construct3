"use strict";
{
  const DOM_COMPONENT_ID = "yagames_sdk";

  const HANDLER_CLASS = class YandexGamesSDKDOMHandler extends self.DOMHandler {
    constructor(iRuntime) {
      super(iRuntime, DOM_COMPONENT_ID);

      /**
       * @type {import("../types.d.ts").YSDK | null}
       */
      this.ysdk = {};

      this.AddRuntimeMessageHandler("ysdk-init", () => {
        // For some rason, Construct 3 debug mode breaks Yandex Games SDK.
        // I dunno how to fix it so we just don't initialize it in debug mode. :(
        if (
          window.location.href ===
          "https://preview.construct.net/local.html?debug="
        ) {
          const debugLanguage = window.navigator.language.slice(0, 2);

          this.PostToRuntime("ysdk-init", {
            environment: {
              app: {
                id: "0",
              },
              browser: {
                lang: debugLanguage,
              },
              i18n: {
                lang: debugLanguage,
                tld: ".com",
              },
              payload: "",
            },
            deviceInfo: {
              type: "desktop",
              isMobile: false,
              isTablet: false,
              isDesktop: true,
              isTV: false,
            },
          });

          return;
        }

        YaGames.init().then((ysdk) => {
          this.ysdk = ysdk;
          this.PostToRuntime("ysdk-init", {
            environment: {
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
            },
            deviceInfo: {
              type: ysdk.deviceInfo.type,
              isMobile: ysdk.deviceInfo.isMobile(),
              isTablet: ysdk.deviceInfo.isTablet(),
              isDesktop: ysdk.deviceInfo.isDesktop(),
              isTV: ysdk.deviceInfo.isTV(),
            },
          });
        });
      });

      this.AddRuntimeMessageHandler("ysdk-loading-api-ready", () => {
        if (!this.ysdk) return;

        this.ysdk.features.LoadingAPI?.ready();
      });

      this.AddRuntimeMessageHandler("ysdk-show-fullscreen-ad", ({ id }) => {
        if (!this.ysdk) return;

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
        if (!this.ysdk) return;

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

      this.AddRuntimeMessageHandler("ysdk-show-sticky-banner", () => {
        if (!this.ysdk) return;

        this.ysdk.adv.showBannerAdv();
      });

      this.AddRuntimeMessageHandler("ysdk-hide-sticky-banner", () => {
        if (!this.ysdk) return;

        this.ysdk.adv.hideBannerAdv();
      });

      this.AddRuntimeMessageHandler(
        "ysdk-request-leaderboard-entries",
        async ({ leaderboardName, options }) => {
          if (!this.ysdk) return;

          const lb = await this.ysdk.getLeaderboards();

          const entries = await lb.getLeaderboardEntries(
            leaderboardName,
            options
          );

          return JSON.stringify(entries);
        }
      );

      this.AddRuntimeMessageHandler(
        "ysdk-set-leaderboard-score",
        async ({ leaderboardName, score, extraData }) => {
          if (!this.ysdk) return;

          const lb = await this.ysdk.getLeaderboards();

          await lb.setLeaderboardScore(
            leaderboardName,
            score,
            extraData || undefined
          );
        }
      );

      this.AddRuntimeMessageHandler(
        "ysdk-request-player-data",
        async ({ signed }) => {
          if (!this.ysdk) return;

          const player = await this.ysdk.getPlayer({ signed });
          return JSON.stringify({
            isAuthorized: player.getMode() !== "lite",
            uniqueID: player.getUniqueID(),
            publicName: player.getName(),
            avatars: {
              small: player.getAvatarSrc("small"),
              medium: player.getAvatarSrc("medium"),
              large: player.getAvatarSrc("large"),
            },
          });
        }
      );
    }
  };

  self.RuntimeInterface.AddDOMHandlerClass(HANDLER_CLASS);
}
