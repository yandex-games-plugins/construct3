'use strict';
{
  const DOM_COMPONENT_ID = 'yagames_sdk';

  const HANDLER_CLASS = class extends self.DOMHandler {
    constructor(iRuntime) {
      super(iRuntime, DOM_COMPONENT_ID);

      /** @type {YandexGamesSDKHandler} */
      this.ysdkHandler = new YandexGamesSDKHandler(this);

      /** @type {TVRemoteEmulator} */
      this.tvRemoteEmulator = new TVRemoteEmulator(this);

      this.AddRuntimeMessageHandler('start-tv-remote-emulator', () => {
        this.tvRemoteEmulator.Start();
      });

      this.AddRuntimeMessageHandler('start-tv-remote-tracking', () => {
        this._StartTicking();
        this._gamepadsUpdates = true;

        window.addEventListener('keydown', (event) => {
          if (event['key'] === 'Enter') this.PostToRuntime('tv-remote-ok-click', true);
        });

        window.addEventListener('keyup', (event) => {
          if (event['key'] === 'Enter') this.PostToRuntime('tv-remote-ok-click', false);
        });
      });

      this.data = {
        upPressed: false,
        downPressed: false,
        leftPressed: false,
        rightPressed: false,
      };
    }

    Tick() {
      if (this._gamepadsUpdates) {
        this.GamepadsUpdate();
      }
    }

    GamepadsUpdate() {
      const gamepads = navigator.getGamepads().filter((gamepad) => gamepad);
      if (!gamepads.length) return;

      for (const gamepad of gamepads) {
        if (!gamepad) continue;
        this.data['upPressed'] = this.data['upPressed'] || gamepad.buttons[12].pressed;
        this.data['downPressed'] = this.data['downPressed'] || gamepad.buttons[13].pressed;
        this.data['leftPressed'] = this.data['leftPressed'] || gamepad.buttons[14].pressed;
        this.data['rightPressed'] = this.data['rightPressed'] || gamepad.buttons[15].pressed;
      }

      this.PostToRuntime('gamepads-update', this.data);
    }
  };

  class YandexGamesSDKHandler {
    constructor(domHandler) {
      this.domHandler = domHandler;

      /** @type {types.YSDK | undefined} */
      this.ysdk = undefined;

      // Prevent 'ysdk is not defined' error
      window['ysdk'] = undefined;

      this.domHandler.AddRuntimeMessageHandler('ysdk-initialize', this.InitializeYSDK.bind(this));

      this.domHandler.AddRuntimeMessageHandler('ysdk-loading-api-ready', this.YSDKLoadingAPIReady.bind(this));

      this.domHandler.AddRuntimeMessageHandler(
        'ysdk-show-fullscreen-ad',
        this.YSDKShowFullscreenAD.bind(this),
      );

      this.domHandler.AddRuntimeMessageHandler('ysdk-show-rewarded-ad', this.YSDKShowRewardedAD.bind(this));

      this.domHandler.AddRuntimeMessageHandler(
        'ysdk-show-sticky-banner',
        this.YSDKShowStickyBanner.bind(this),
      );

      this.domHandler.AddRuntimeMessageHandler(
        'ysdk-hide-sticky-banner',
        this.YSDKHideStickyBanner.bind(this),
      );

      this.domHandler.AddRuntimeMessageHandler(
        'ysdk-get-leaderboard-entries',
        this.YSDKGetLeaderboardEntries.bind(this),
      );

      this.domHandler.AddRuntimeMessageHandler(
        'ysdk-set-leaderboard-score',
        this.YSDKSetLeaderboardScore.bind(this),
      );

      this.domHandler.AddRuntimeMessageHandler('ysdk-purchase', this.YSDKPurchase.bind(this));

      this.domHandler.AddRuntimeMessageHandler('ysdk-consume-purchase', this.YSDKConsumePurchase.bind(this));

      this.domHandler.AddRuntimeMessageHandler('ysdk-get-purchases', this.YSDKGetPurchases.bind(this));

      this.domHandler.AddRuntimeMessageHandler('ysdk-get-catalog', this.YSDKGetCatalog.bind(this));

      this.domHandler.AddRuntimeMessageHandler('ysdk-get-player', this.YSDKGetPlayer.bind(this));

      this.domHandler.AddRuntimeMessageHandler('ysdk-get-player-data', this.YSDKGetPlayerData.bind(this));

      this.domHandler.AddRuntimeMessageHandler('ysdk-get-player-stats', this.YSDKGetPlayerStats.bind(this));

      this.domHandler.AddRuntimeMessageHandler('ysdk-set-player-data', this.YSDKSetPlayerData.bind(this));

      this.domHandler.AddRuntimeMessageHandler('ysdk-set-player-stats', this.YSDKSetPlayerStats.bind(this));

      this.domHandler.AddRuntimeMessageHandler(
        'ysdk-increment-player-stats',
        this.YSDKIncrementPlayerStats.bind(this),
      );

      this.domHandler.AddRuntimeMessageHandler('ysdk-dispatch-event', this.YSDKDispatchEvent.bind(this));

      this.domHandler.AddRuntimeMessageHandler(
        'ysdk-shortcuts-show-prompt',
        this.YSDKShortcutsShowPrompt.bind(this),
      );

      this.domHandler.AddRuntimeMessageHandler(
        'ysdk-remote-config-fetch',
        this.YSDKRemoteConfigFetch.bind(this),
      );

      this.domHandler.AddRuntimeMessageHandler('ysdk-request-review', this.YSDKRequestReview.bind(this));
    }

    async LoadYSDKScript() {
      return new Promise((resolve) => {
        const head = document.getElementsByTagName('head')[0];
        const script = document.createElement('script');
        script.src = 'https://yandex.ru/games/sdk/v2';
        script.async = true;
        script.onload = async () => resolve();
        head.appendChild(script);
      });
    }

    async InitializeYSDK() {
      await this.LoadYSDKScript();
      this.ysdk = await window['YaGames']['init']();
      window['ysdk'] = this.ysdk;
      window.ysdk = this.ysdk;

      await this.OnYSDKLoaded(this.ysdk);

      this.ysdk['features']['PluginEngineDataReporterAPI']?.['report']({
        ['engineName']: 'Construct',
        ['engineVersion']: '3', // TODO: find a way to get version from runtime in "rXXX" format
        ['pluginName']: 'yagames_sdk by LisGames',
        ['pluginVersion']: '2.10.2',
      });

      console.log('%c YandexGamesSDK for Construct 3 v2.10.2 ', 'background: #14151f; color: #fb923c');

      return {
        ['environment']: {
          ['app']: {
            ['id']: this.ysdk['environment']['app']['id'],
          },
          ['browser']: {
            ['lang']: this.ysdk['environment']['browser']['lang'],
          },
          ['i18n']: {
            ['lang']: this.ysdk['environment']['i18n']['lang'],
            ['tld']: this.ysdk['environment']['i18n']['tld'],
          },
          ['payload']: this.ysdk['environment']['payload'],
        },
        ['deviceType']: this.ysdk['deviceInfo']['type'],
      };
    }

    async OnYSDKLoaded() {
      if (!this.ysdk) return;

      this.ysdk['onEvent'](this.ysdk['EVENTS']['HISTORY_BACK'], () => {
        this.domHandler.PostToRuntime('ysdk-handle-event', { ['type']: 'HISTORY_BACK' });
      });

      await this.YSDKUpdateCanShowShortcutPrompt();
      await this.YSDKUpdateCanReview();
    }

    YSDKLoadingAPIReady() {
      if (!this.ysdk) return;
      this.ysdk['features']['LoadingAPI']?.['ready']();
    }

    YSDKShowFullscreenAD() {
      if (!this.ysdk) return;
      this.ysdk['adv']['showFullscreenAdv']({
        ['callbacks']: {
          ['onClose']: (wasShown) => {
            this.domHandler.PostToRuntime('ysdk-fullscreen-ad-callback', {
              ['type']: 'onClose',
              ['wasShown']: wasShown,
            });
          },
          ['onOpen']: () => {
            this.domHandler.PostToRuntime('ysdk-fullscreen-ad-callback', {
              ['type']: 'onOpen',
            });
          },
          ['onError']: (error) => {
            this.domHandler.PostToRuntime('ysdk-fullscreen-ad-callback', {
              ['type']: 'onError',
              ['error']: JSON.stringify(error),
            });
          },
          ['onOffline']: () => {
            this.domHandler.PostToRuntime('ysdk-fullscreen-ad-callback', {
              ['type']: 'onOffline',
            });
          },
        },
      });
    }

    YSDKShowRewardedAD(params) {
      if (!this.ysdk) return;
      this.ysdk['adv']['showRewardedVideo']({
        ['callbacks']: {
          ['onOpen']: () => {
            this.domHandler.PostToRuntime('ysdk-rewarded-ad-callback', {
              ['id']: params['id'],
              ['type']: 'onOpen',
            });
          },
          ['onRewarded']: () => {
            this.domHandler.PostToRuntime('ysdk-rewarded-ad-callback', {
              ['id']: params['id'],
              ['type']: 'onRewarded',
            });
          },
          ['onClose']: () => {
            this.domHandler.PostToRuntime('ysdk-rewarded-ad-callback', {
              ['id']: params['id'],
              ['type']: 'onClose',
            });
          },
          ['onError']: (error) => {
            this.domHandler.PostToRuntime('ysdk-rewarded-ad-callback', {
              ['id']: params['id'],
              ['type']: 'onError',
              ['error']: JSON.stringify(error),
            });
          },
        },
      });
    }

    YSDKShowStickyBanner() {
      if (!this.ysdk) return;
      this.ysdk['adv']['showBannerAdv']();
    }

    YSDKHideStickyBanner() {
      if (!this.ysdk) return;
      this.ysdk['adv']['hideBannerAdv']();
    }

    async YSDKGetLeaderboardEntries(params) {
      if (!this.ysdk) return;

      const lb = await this.ysdk['getLeaderboards']();

      const entries = await lb['getLeaderboardEntries'](params['leaderboardName'], params['options']);

      return {
        ['leaderboard']: entries['leaderboard'],
        ['ranges']: entries['ranges'],
        ['userRank']: entries['userRank'],
        ['entries']: entries['entries'].map((entry) => {
          return {
            ['score']: entry['score'],
            ['extraData']: entry['extraData'],
            ['rank']: entry['rank'],
            ['player']: {
              ['avatarSrc']: {
                ['small']: entry['player']['getAvatarSrc']('small'),
                ['medium']: entry['player']['getAvatarSrc']('medium'),
                ['large']: entry['player']['getAvatarSrc']('large'),
              },
              ['avatarSrcSet']: {
                ['small']: entry['player']['getAvatarSrcSet']('small'),
                ['medium']: entry['player']['getAvatarSrcSet']('medium'),
                ['large']: entry['player']['getAvatarSrcSet']('large'),
              },
              ['lang']: entry['player']['lang'],
              ['publicName']: entry['player']['publicName'],
              ['scopePermissions']: entry['player']['scopePermissions'],
              ['uniqueID']: entry['player']['uniqueID'],
            },
            ['formattedScore']: entry['formattedScore'],
          };
        }),
      };
    }

    async YSDKSetLeaderboardScore(params) {
      if (!this.ysdk) return;

      const lb = await this.ysdk['getLeaderboards']();

      await lb['setLeaderboardScore'](
        params['leaderboardName'],
        params['score'],
        params['extraData'] || undefined,
      );
    }

    async YSDKPurchase(params) {
      if (!this.ysdk) return;

      try {
        const payments = await this.ysdk['getPayments']({ ['signed']: true });

        const purchase = await payments['purchase']({
          ['id']: params['productID'],
          ['developerPayload']: params['developerPayload'],
        });

        this.domHandler.PostToRuntime('ysdk-purchase-callback', {
          ['success']: true,
          ['productID']: purchase['productID'],
          ['purchaseToken']: purchase['purchaseToken'],
          ['developerPayload']: purchase['developerPayload'],
          ['signature']: purchase['signature'],
        });
      } catch (error) {
        console.error(error);

        this.domHandler.PostToRuntime('ysdk-purchase-callback', {
          ['error']: JSON.stringify(error),
        });
      }
    }

    async YSDKConsumePurchase(params) {
      if (!this.ysdk) return;

      const payments = await this.ysdk['getPayments']({ ['signed']: true });

      await payments['consumePurchase'](params['purchaseToken']);
    }

    async YSDKGetPurchases() {
      if (!this.ysdk) return;

      const payments = await this.ysdk['getPayments']({ ['signed']: true });

      const purchases = await payments['getPurchases']();

      const _purchases = [];

      for (let i = 0; i < purchases.length; i++) {
        const purchase = purchases[i];
        _purchases[i] = {
          ['productID']: purchase['productID'],
          ['purchaseToken']: purchase['purchaseToken'],
          ['developerPayload']: purchase['developerPayload'],
        };
      }

      _purchases['signature'] = purchases['signature'];

      return _purchases;
    }

    async YSDKGetCatalog() {
      if (!this.ysdk) return;

      const payments = await this.ysdk['getPayments']({ ['signed']: true });

      const catalog = await payments['getCatalog']();

      const _catalog = [];

      for (let i = 0; i < catalog.length; i++) {
        const product = catalog[i];
        _catalog[i] = {
          ['id']: product['id'],
          ['title']: product['title'],
          ['description']: product['description'],
          ['imageURI']: product['imageURI'],
          ['price']: product['price'],
          ['priceValue']: product['priceValue'],
          ['priceCurrencyCode']: product['priceCurrencyCode'],
          ['priceCurrencyImage']: {
            ['small']: product['getPriceCurrencyImage']('small'),
            ['medium']: product['getPriceCurrencyImage']('medium'),
            ['svg']: product['getPriceCurrencyImage']('svg'),
          },
        };
      }

      return _catalog;
    }

    async YSDKGetPlayerData(keys) {
      if (!this.ysdk) return;

      const player = await this.ysdk['getPlayer']();

      const data = await player['getData'](keys);

      return data;
    }

    async YSDKGetPlayerStats(keys) {
      if (!this.ysdk) return;

      const player = await this.ysdk['getPlayer']();

      const stats = await player['getStats'](keys);

      return stats;
    }

    async YSDKSetPlayerData(params) {
      if (!this.ysdk) return;

      const player = await this.ysdk['getPlayer']();

      await player['setData'](params['data'], params['flush']);
    }

    async YSDKSetPlayerStats(data) {
      if (!this.ysdk) return;

      const player = await this.ysdk['getPlayer']();

      await player['setStats'](data);
    }

    async YSDKIncrementPlayerStats(data) {
      if (!this.ysdk) return;

      const player = await this.ysdk['getPlayer']();

      await player['incrementStats'](data);
    }

    async YSDKGetPlayer(params) {
      if (!this.ysdk) return;

      /** @type {import("../../../global").Player} */
      let player;

      if (params['requestPersonalInfo'] && this.ysdk['openAuthDialog']) {
        player = await this.ysdk['getPlayer']({ ['signed']: true, ['scopes']: true });

        if (player['getMode']() === 'lite') {
          await this.ysdk['openAuthDialog']();
          player = await this.ysdk['getPlayer']({ ['signed']: true, ['scopes']: true });
        }

        // Double request. The first one can return empty name even if the user provided personal info.
        player = await this.ysdk['getPlayer']({ ['signed']: true, ['scopes']: true });
      } else {
        player = await this.ysdk['getPlayer']({ ['scopes']: false });
      }

      await this.YSDKUpdateCanReview();

      return {
        ['isAuthorized']: player['getMode']() !== 'lite',
        ['isAccessGranted']: player['getName']() !== '',
        ['uniqueID']: player['getUniqueID'](),
        ['publicName']: player['getName'](),
        ['avatars']: {
          ['small']: player['getPhoto']('small'),
          ['medium']: player['getPhoto']('medium'),
          ['large']: player['getPhoto']('large'),
        },
        ['signature']: player['signature'],
      };
    }

    YSDKDispatchEvent(params) {
      if (!this.ysdk) return;
      this.ysdk['dispatchEvent'](this.ysdk['EVENTS'][params['name']]);
    }

    async YSDKUpdateCanShowShortcutPrompt() {
      const prompt = await this.ysdk['shortcut']['canShowPrompt']();
      await this.domHandler.PostToRuntimeAsync('ysdk-update-can-show-shortcut-prompt', {
        ['canShow']: prompt['canShow'],
      });
    }

    async YSDKShortcutsShowPrompt() {
      if (!this.ysdk) return;

      const result = await this.ysdk['shortcut']['showPrompt']();

      await this.YSDKUpdateCanShowShortcutPrompt();

      this.domHandler.PostToRuntime('ysdk-shortcut-show-prompt-result', {
        ['accepted']: result['outcome'] === 'accepted',
      });
    }

    /**
     * @param {{
     *  defaultFlags: Record<string, boolean>,
     *  clientFeatures: string[],
     * }} params
     */
    async YSDKRemoteConfigFetch(params) {
      if (!this.ysdk) {
        return params.defaultFlags;
      }

      const config = await this.ysdk['getFlags'](params);

      return config;
    }

    async YSDKRequestReview() {
      if (!this.ysdk) return;

      const canReview = await this.ysdk['feedback']['canReview']();
      console.log(canReview['value'], canReview['reason']);

      if (canReview.value) {
        const result = await this.ysdk['feedback']['requestReview']();

        await this.YSDKUpdateCanReview();

        return {
          ['feedbackSent']: result['feedbackSent'],
        };
      } else {
        return {
          ['feedbackSent']: false,
        };
      }
    }

    async YSDKUpdateCanReview() {
      const canReview = await this.ysdk['feedback']['canReview']();
      console.log(canReview['value'], canReview['reason']);
      await this.domHandler.PostToRuntimeAsync('ysdk-update-can-review', {
        ['value']: canReview['value'],
      });
    }
  }

  class TVRemoteEmulator {
    constructor(domHandler) {
      this.domHandler = domHandler;
      this.enabled = false;
      this.ArrowMap = {
        ArrowUp: 12,
        ArrowDown: 13,
        ArrowLeft: 14,
        ArrowRight: 15,
      };
    }

    Start() {
      this.iframe = document.createElement('iframe');
      this.iframe.id = 'tv-emulator';
      this.iframe.src = '';
      this.iframe.style.position = 'absolute';
      this.iframe.style.display = 'none';
      this.iframe.style.width = '288px';
      this.iframe.style.height = '640px';
      this.iframe.style.border = 'none';
      this.iframe.style.zIndex = '999';
      this.iframe.style.transformOrigin = 'right bottom';
      document.body.appendChild(this.iframe);

      this.UpdatePosition(this.iframe);

      fetch('tv_emulator.html')
        .then((res) => res.text())
        .then((html) => {
          this.iframe.contentWindow.document.write(html);
          window.addEventListener('resize', this.UpdatePosition.bind(this));
          window.addEventListener('message', this.OnMessage.bind(this));
          window.addEventListener('keydown', this.OnKeyDown.bind(this));
        });

      this.fakeController = {
        id: 'TV Remote Emulator',
        index: 0,
        axes: [0, 0, 0, 0],
        connected: false,
        buttons: new Array(16).fill(0).map(() => ({
          pressed: false,
          touched: false,
          value: 0,
        })),
        timestamp: Math.floor(Date.now() / 1000),
      };
    }

    /** @param {KeyboardEvent} event */
    OnKeyDown(event) {
      if (event['key'] !== 'F6') return;
      if (this.iframe.style.display === 'none') {
        this.EnableGamepad();
      } else {
        this.DisableGamepad();
      }
    }

    EnableGamepad() {
      this.enabled = true;
      this.iframe.style.display = 'block';

      const event = new Event('gamepadconnected');
      this.fakeController.connected = true;
      event['gamepad'] = this.fakeController;
      this.fakeController.timestamp = Math.floor(Date.now() / 1000);
      window.dispatchEvent(event);

      this._originalGetGamepads = navigator.getGamepads;
      navigator.getGamepads = () => [this.fakeController];
    }

    DisableGamepad() {
      this.enabled = false;
      this.iframe.style.display = 'none';

      const event = new Event('gamepaddisconnected');
      this.fakeController.connected = false;
      event['gamepad'] = this.fakeController;
      this.fakeController.timestamp = Math.floor(Date.now() / 1000);
      window.dispatchEvent(event);

      navigator.getGamepads = this._originalGetGamepads;
    }

    /** @param {MessageEvent} event */
    OnMessage(event) {
      if (event['data']['event'] !== 'tv-emulator-event') return;

      switch (event['data']['name']) {
        case 'Enter':
          window.dispatchEvent(
            new KeyboardEvent(event['data']['pressed'] ? 'keydown' : 'keyup', {
              ['key']: 'Enter',
              ['code']: 'Enter',
              ['keyCode']: 13,
            }),
          );
          break;
        case 'Back':
          if (!event['data']['pressed']) {
            this.domHandler.PostToRuntime('ysdk-handle-event', { ['type']: 'HISTORY_BACK' });
          }
          break;
        default:
          const button = this.fakeController.buttons[this.ArrowMap[event['data']['name']]];
          button.pressed = event['data']['pressed'];
          button.value = event['data']['pressed'] ? 1 : 0;
          button.touched = event['data']['pressed'];
          this.fakeController.timestamp = Math.floor(Date.now() / 1000);
          break;
      }
    }

    UpdatePosition() {
      const scale = Math.min(window.innerWidth / 288, window.innerHeight / 640);
      this.iframe.style.transform = `scale(${scale})`;
      this.iframe.style.left = `${window.innerWidth - 288}px`;
      this.iframe.style.top = `${window.innerHeight - 640}px`;
    }
  }

  self.RuntimeInterface.AddDOMHandlerClass(HANDLER_CLASS);
}
