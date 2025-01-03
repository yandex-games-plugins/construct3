/* eslint-disable no-case-declarations */
const C3 = self.C3;

//#region Localization

class Localization {
  /** @param {YandexGamesSDKInstance} instance */
  constructor(instance) {
    this.pluginInstance = instance;
    this.runtime = instance.GetRuntime();
    this.assetManager = this.runtime.GetAssetManager();
    this.textPluginsNames = new Set(['Text', 'SpriteFont', 'AdaptiveText']);

    /** @typedef {{[key: string]: string | StringKeysObject | undefined}} StringKeysObject */

    /**
     * Storage for current game translation map.
     * @type {StringKeysObject | undefined}
     */
    this.valueMap = undefined;

    /** @type {string} */
    this.defaultLanguage = 'en';

    /** @type {string | undefined} */
    this.currentLanguage = undefined;

    /** @type {Set<any>} */
    this.decoratedSDKInstances = new Set();

    /** @type {Set<any>} */
    this.decoratedObjects = new Set();

    // prettier-ignore
    this.validLanguageCodes = new Set(['af', 'am', 'ar', 'az', 'be', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'eu', 'fa', 'fi', 'fr', 'gl', 'he', 'hi', 'hr', 'hu', 'hy', 'id', 'is', 'it', 'ja', 'ka', 'kk', 'km', 'kn', 'ko', 'ky', 'lo', 'lt', 'lv', 'mk', 'ml', 'mn', 'mr', 'ms', 'my', 'ne', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'si', 'sk', 'sl', 'sr', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'tk', 'tl', 'tr', 'uk', 'ur', 'uz', 'vi', 'zh', 'zu']);
  }

  /**
   * @param {string} languageCode
   * @returns {boolean}
   */
  IsValidLanguageCode(languageCode) {
    return this.validLanguageCodes.has(languageCode);
  }

  /**
   * Finds property descriptor by finding in object's prototypes
   * Mainly used to redefine class methods or properties getters/setters
   *
   * @template O
   * @param {O} obj
   * @param {keyof O} key
   * @returns {PropertyDescriptor | undefined}
   */
  DeepFindPropertyDescriptor(obj, key) {
    let desc;
    do {
      desc = Object.getOwnPropertyDescriptor(obj, key);
    } while (!desc && (obj = Object.getPrototypeOf(obj)));
    return desc;
  }

  /** @type {(string:string) => string} */
  TranslateString(string) {
    let translatedString = string;

    const nonWrappedPaths = /\{[\w\d.]*\}/;

    let matches;
    while ((matches = translatedString.match(nonWrappedPaths) || matches?.lenght > 0)) {
      const match = matches[0];
      try {
        const path = match.slice(1, -1);
        const translation = this.GetValue(path);

        if (translation === undefined) {
          throw new Error(`Translation for ${path} is undefined.`);
        }

        translatedString = translatedString.replace(match, translation);
      } catch (e) {
        console.error(e);
        this.pluginInstance.DeveloperAlert(
          `Can't apply translation for ${match} in ${this.currentLanguage}. More info in console.`,
        );
        break;
      }
    }

    return translatedString;
  }

  /**
   * @param {string} path
   * @returns {string}
   */
  GetValue(path) {
    return this.valueMap ? this.valueMap[path] : '';
  }

  DecorateTextPlugins() {
    this.runtime
      .GetAllObjectClasses()
      .filter((objectClass) => {
        const prototype = objectClass._instSdkCtor.prototype;
        return prototype && prototype.GetText && prototype._SetText;
      })
      .forEach((objectClass) => {
        const translateInstance = (instance) => {
          const sdkInstance = instance.GetSdkInstance();

          if (sdkInstance.__realText) {
            sdkInstance.__OriginalSetText(this.TranslateString(sdkInstance.__realText));
          } else {
            sdkInstance.__realText = sdkInstance.GetText();
            sdkInstance._SetText(this.TranslateString(sdkInstance.__realText));
          }

          const setTextMethodName = sdkInstance._SetText.name;

          // Decorate _SetText method of sdkInstance for auto-localization feature
          if (!this.decoratedSDKInstances.has(sdkInstance)) {
            const setTextDescriptor = this.DeepFindPropertyDescriptor(sdkInstance, setTextMethodName);

            if (setTextDescriptor) {
              const originalSetText = setTextDescriptor.value;
              sdkInstance.__OriginalSetText = originalSetText;
              Object.defineProperty(sdkInstance, setTextMethodName, {
                configurable: setTextDescriptor.configurable,
                enumerable: setTextDescriptor.enumerable,
                value: (text) => {
                  sdkInstance.__realText = text;
                  originalSetText.call(sdkInstance, this.TranslateString(text));
                },
              });
            } else {
              console.error(`Can't find property descriptor ${setTextMethodName} (_SetText) of`, sdkInstance);
            }

            this.decoratedSDKInstances.add(sdkInstance);
          }
        };

        objectClass.GetInstances().forEach((instance) => {
          translateInstance(instance);
        });

        /**
         * Decorate _AddInstance method of objectClass to auto-translate new instances
         */
        if (!this.decoratedObjects.has(objectClass)) {
          const addInstanceMethodName = objectClass._AddInstance.name;

          const addInstanceDescriptior = this.DeepFindPropertyDescriptor(objectClass, addInstanceMethodName);

          if (addInstanceDescriptior) {
            const originalAddInstance = addInstanceDescriptior.value;

            Object.defineProperty(objectClass, addInstanceMethodName, {
              configurable: addInstanceDescriptior.configurable,
              enumerable: addInstanceDescriptior.enumerable,
              value: (instance) => {
                originalAddInstance.call(objectClass, instance);
                translateInstance(instance);
              },
            });

            this.decoratedObjects.add(objectClass);
          } else {
            console.error(
              `Can't find property descriptor ${addInstanceMethodName} (_AddInstance) of`,
              objectClass,
            );
          }
        }
      });
  }

  DecorateSpritePlugins() {
    this.runtime
      .GetAllObjectClasses()
      .filter((objectClass) => {
        return (
          // Check that all animations names are valid language codes
          objectClass._animations &&
          objectClass._animations.every((animationInfo) => this.IsValidLanguageCode(animationInfo._name))
        );
      })
      .forEach((objectClass) => {
        // Set animation of all instances to current language
        objectClass.GetInstances().forEach((instance) => {
          this.TranslateSprite(instance);
        });

        /**
         * Decorate _AddInstance method of objectClass to auto-translate new instances
         */
        if (!this.decoratedObjects.has(objectClass)) {
          const addInstanceMethodName = objectClass._AddInstance.name;

          const addInstanceDescriptior = this.DeepFindPropertyDescriptor(objectClass, addInstanceMethodName);

          if (addInstanceDescriptior) {
            const originalAddInstance = addInstanceDescriptior.value;

            Object.defineProperty(objectClass, addInstanceMethodName, {
              configurable: addInstanceDescriptior.configurable,
              enumerable: addInstanceDescriptior.enumerable,
              value: (instance) => {
                originalAddInstance.apply(objectClass, [instance]);
                this.TranslateSprite(instance);
              },
            });

            this.decoratedObjects.add(objectClass);
          } else {
            console.error(
              `Can't find property descriptor ${addInstanceMethodName} (_AddInstance) of`,
              objectClass,
            );
          }
        }
      });
  }

  TranslateSprite(instance) {
    const sdkInstance = instance.GetSdkInstance();

    // Get animations map
    const animationsByName = sdkInstance._objectClass?._animationsByName;
    if (!animationsByName) return;

    const currentFrame = sdkInstance._currentFrameIndex;
    const fromAnimation = sdkInstance._currentAnimation._name;

    // Apply current language animation if exists, otherwise apply default language animation if exists.
    // Make sure that we preserve current frame index.
    if (animationsByName.has(this.currentLanguage)) {
      sdkInstance._SetAnim(this.currentLanguage, fromAnimation);
    } else if (animationsByName.has(this.defaultLanguage)) {
      // TODO: Add DeveloperAlert here!
      console.warn('Animation for current language not found, fallback to default', sdkInstance);
      sdkInstance._SetAnim(this.defaultLanguage, fromAnimation);
    }

    sdkInstance._SetAnimFrame(currentFrame);
  }

  FlattenTranslations(object) {
    const parsedTranslations = {};

    for (const key in object) {
      const value = object[key];

      switch (typeof value) {
        case 'object': {
          const nestedTranslations = this.FlattenTranslations(value);

          for (const nestedKey in nestedTranslations) {
            parsedTranslations[`${key}.${nestedKey}`] = nestedTranslations[nestedKey];
          }
          break;
        }

        case 'string':
          parsedTranslations[key] = value;
          break;

        default:
          parsedTranslations[key] = value.toString();
          break;
      }
    }

    return parsedTranslations;
  }

  /** @type {(lang: string) => Promise<string | undefined>} */
  FetchLanguage(lang) {
    let path;

    if (this.assetManager.GetFileStructure() === 'flat') {
      path = `${lang}.json`;
    } else {
      path = `i18n/${lang}.json`;
    }

    return this.assetManager
      .FetchJson(path)
      .then((json) => this.FlattenTranslations(json))
      .catch(() => undefined);
  }

  async SwitchLanguage(languageCode) {
    this.pluginInstance.Info(`Switching localization language (${languageCode})`);

    this.valueMap = await this.FetchLanguage(languageCode);

    if (this.valueMap !== undefined) {
      this.currentLanguage = languageCode;
      this.DecorateTextPlugins();
      this.DecorateSpritePlugins();
      return;
    }

    this.pluginInstance.Warn(
      `Can't find translation map for ${languageCode}. Switching to default language "${this.defaultLanguage}".`,
    );

    this.valueMap = await this.FetchLanguage(this.defaultLanguage);

    if (this.valueMap !== undefined) {
      this.currentLanguage = languageCode;
      this.DecorateTextPlugins();
      this.DecorateSpritePlugins();
      return;
    }

    this.currentLanguage = undefined;
    this.valueMap = undefined;
    this.pluginInstance.Warn(
      `Can't find translation map for default language "${this.defaultLanguage}", make sure that you have translation map in "i18n" folder.`,
    );
  }
}

//#endregion

//#region Instance

const DOM_COMPONENT_ID = 'yagames_sdk';

/** @class */
class YandexGamesSDKInstance extends C3.SDKInstanceBase {
  constructor(inst, properties) {
    super(inst, DOM_COMPONENT_ID);

    const defaultLanguage = properties[0];
    const autoInitialization = properties[1];

    /** @type {types.YSDK["environment"]} */
    this.environment = {
      ['app']: { ['id']: '0' },
      ['browser']: { ['lang']: defaultLanguage },
      ['i18n']: { ['lang']: defaultLanguage, ['tld']: '.com' },
      ['payload']: '',
    };

    /** @type {"desktop" | "mobile" | "tablet" | "tv"} */
    this.deviceType = 'desktop';

    /** @type {Conditions} */
    this.conditions = C3.Plugins.yagames_sdk.Cnds;

    /** @type {Actions} */
    this.actions = C3.Plugins.yagames_sdk.Acts;

    /** @type {Expressions} */
    this.expressions = C3.Plugins.yagames_sdk.Exps;

    this.localization = new Localization(this);
    this.localization.defaultLanguage = defaultLanguage;

    //#region Fullscreen AD

    /** @type {boolean} */
    this.fullscreenADWasShown = false;

    /** @type {string | undefined} */
    this.fullscreenADError = undefined;

    this.AddDOMMessageHandler(
      'ysdk-fullscreen-ad-callback',
      /** @param {{type: "onClose" | "onOpen" | "onError" | "onOffline", wasShown?: boolean, error?: string}} data  */
      (data) => {
        switch (data['type']) {
          case 'onOpen':
            this.Trigger(this.conditions.OnFullscreenADOpen);
            break;
          case 'onClose':
            this.fullscreenADWasShown = data['wasShown'];
            this.Trigger(this.conditions.OnFullscreenADClose);
            break;
          case 'onError':
            this.fullscreenADError = data['error'];
            this.Trigger(this.conditions.OnFullscreenADError);
            break;
          case 'onOffline':
            this.Trigger(this.conditions.OnFullscreenADOffline);
            break;
        }
      },
    );

    //#endregion

    //#region Rewarded AD

    /** @type {string | undefined} */
    this.currentRewardedID = undefined;

    /** @type {string | undefined} */
    this.currentRewardedError = undefined;

    this.AddDOMMessageHandler(
      'ysdk-rewarded-ad-callback',
      /** @param {{type: "onOpen" | "onRewarded" | "onClose" | "onError", id: string, error?: string}} data  */
      async (data) => {
        this.currentRewardedID = data['id'];
        switch (data['type']) {
          case 'onOpen':
            await this.TriggerAsync(this.conditions.OnRewardedADOpen);
            await this.TriggerAsync(this.conditions.OnAnyRewardedADOpen);
            break;
          case 'onRewarded':
            await this.TriggerAsync(this.conditions.OnRewardedADRewarded);
            break;
          case 'onClose':
            await this.TriggerAsync(this.conditions.OnRewardedADClose);
            await this.TriggerAsync(this.conditions.OnAnyRewardedADClose);
            break;
          case 'onError':
            this.currentRewardedError = data['error'];
            await this.TriggerAsync(this.conditions.OnRewardedADError);
            await this.TriggerAsync(this.conditions.OnAnyRewardedADError);
            this.currentRewardedError = undefined;
            break;
        }
        this.currentRewardedID = undefined;
      },
    );

    //#endregion

    //#region Leaderboards

    /**
     * @typedef {{
     *   leaderboard: types.LeaderboardDescription;
     *   ranges: { start: number; size: number }[];
     *   entries: {
     *    score: number;
     *    extraData: string | undefined;
     *    rank: number;
     *    player: {
     *      avatarSrc: {
     *        small: string;
     *        medium: string;
     *        large: string;
     *      };
     *      avatarSrcSet: {
     *        small: string;
     *        medium: string;
     *        large: string;
     *      };
     *      lang: string;
     *      publicName: string;
     *      scopePermissions: {
     *        avatar: string;
     *        public_name: string;
     *      };
     *      uniqueID: string;
     *    };
     *    formattedScore: string;
     *   }[];
     * }} RuntimeEntries
     */

    /** @type {{entriesData: RuntimeEntries;["currentIndex"]: number} | undefined} */
    this.forEachLeaderbordEntryLoopData = undefined;

    //#endregion

    //#region Payments
    /**
     * @typedef {Object} PurchaseTriggerData
     * @property {string} productID
     * @property {string} purchaseToken
     * @property {string|undefined} developerPayload
     * @property {string|undefined} signature
     * @property {string|undefined} error
     */

    /** @type {PurchaseTriggerData | undefined} */
    this.currentPurchaseData = undefined;

    /** @type {{purchases: types.Signed<types.Purchase[]>,["currentIndex"]: number} | undefined} */
    this.currentPurchasesLoopData = undefined;

    /**
     * @typedef {Object} RuntimeProduct
     * @property {string} id
     * @property {string} title
     * @property {string} description
     * @property {string} imageURI
     * @property {string} price
     * @property {string} priceValue
     * @property {string} priceCurrencyCode
     * @property {{small: string; medium: string; svg: string;}} priceCurrencyImage
     */

    /** @type {{catalog: RuntimeProduct[],["currentIndex"]: number} | undefined} */
    this.currentCatalogLoopData = undefined;

    this.AddDOMMessageHandler(
      'ysdk-purchase-callback',
      /** @param {{error?: string, productID: string, purchaseToken: string, developerPayload?: string, signature?: string}} data  */
      async (data) => {
        this.currentPurchaseData = {
          ['productID']: data['productID'],
          ['purchaseToken']: data['purchaseToken'],
          ['developerPayload']: data['developerPayload'],
          ['signature']: data['signature'],
          ['error']: data['error'],
        };

        if (data['error']) {
          await this.TriggerAsync(this.conditions.OnSpecificPurchaseError);
          await this.TriggerAsync(this.conditions.OnPurchaseError);
          console.error('Purchase error', data);
          this.currentPurchaseData = undefined;
          return;
        }

        await this.TriggerAsync(this.conditions.OnSpecificPurchaseSuccess);
        await this.TriggerAsync(this.conditions.OnPurchaseSuccess);
        console.log('Purchase success', data);
        this.currentPurchaseData = undefined;
      },
    );

    //#endregion

    //#region Player

    /**
     * @typedef {Object} PlayerAvatars
     * @property {string} small
     * @property {string} medium
     * @property {string} large
     */

    /**
     * @typedef {Object} PlayerInfo
     * @property {boolean} isAuthorized
     * @property {boolean} isAccessGranted
     * @property {string} uniqueID
     * @property {string} publicName
     * @property {PlayerAvatars} avatars
     * @property {string} payingStatus
     * @property {string | undefined} signature
     */

    /** @type {PlayerInfo | undefined} */
    this.playerInfo = undefined;

    //#endregion

    //#region Events

    this.AddDOMMessageHandler('ysdk-handle-event', (e) => {
      switch (e.type) {
        case 'HISTORY_BACK':
          this.Trigger(this.conditions.OnHistoryBackEvent);
          break;
        case 'game_api_pause':
          this.Trigger(this.conditions.OnGameAPIPause);
          break;
        case 'game_api_resume':
          this.Trigger(this.conditions.OnGameAPIResume);
          break;
      }
    });

    //#endregion

    //#region Shortcut

    /** @type {boolean} */
    this.canShowShortcutPrompt = false;

    this.AddDOMMessageHandler('ysdk-update-can-show-shortcut-prompt', (data) => {
      this.canShowShortcutPrompt = data['canShow'];
      return true;
    });

    this.AddDOMMessageHandler('ysdk-shortcut-show-prompt-result', (data) => {
      if (data['accepted']) {
        this.Trigger(this.conditions.OnShortcutAdded);
      }
    });

    //#endregion

    //#region Review

    /** @type {boolean} */
    this.canReview = false;

    this.AddDOMMessageHandler('ysdk-update-can-review', (data) => {
      this.canReview = data['value'];
      return true;
    });

    //#endregion

    //#region Misc

    /** @type {Map<any, number>} */
    this.throttleTimers = new Map();

    /** @type {Map<any, number>} */
    this.debounceTimers = new Map();

    /** @type {number} */
    this.serverTime = 0;

    this.AddDOMMessageHandler('ysdk-server-time-update', (value) => {
      this.serverTime = value;
    });

    //#endregion

    //#region Remote Config

    /** @type {Record<string, string>} */
    this.flags = {};

    /** @type {Record<string, string>} */
    this.defaultFlags = {};

    /** @type {{name: string, value: string}[]} */
    this.clientFeatures = [];

    //#endregion

    //#region Game Linking

    /** @type {string} */
    this.developerURL = '';

    /** @type {{game: {appID: string, title: string, url: string, coverURL: string, iconURL: string}, isAvaliable: boolean} | undefined} */
    this.currentGameData = undefined;

    //#endregion

    //#region TV

    const TV_BUTTON = {
      UP: 0,
      DOWN: 1,
      LEFT: 2,
      RIGHT: 3,
      OK: 4,
    };

    //                 up,    down,  left,  right, ok
    this._tvButtons = [false, false, false, false, false];

    this._triggerButton = undefined;

    this.AddDOMMessageHandler('gamepads-update', (data) => {
      if (this._tvButtons[TV_BUTTON.UP] !== data['upPressed']) {
        this._triggerButton = TV_BUTTON.UP;

        if (data['upPressed']) {
          this.Trigger(this.conditions.OnTVRemoteButtonPress);
        } else {
          this.Trigger(this.conditions.OnTVRemoteButtonRelease);
        }

        this._tvButtons[TV_BUTTON.UP] = data['upPressed'];
      }

      if (this._tvButtons[TV_BUTTON.DOWN] !== data['downPressed']) {
        this._triggerButton = TV_BUTTON.DOWN;

        if (data['downPressed']) {
          this.Trigger(this.conditions.OnTVRemoteButtonPress);
        } else {
          this.Trigger(this.conditions.OnTVRemoteButtonRelease);
        }

        this._tvButtons[TV_BUTTON.DOWN] = data['downPressed'];
      }

      if (this._tvButtons[TV_BUTTON.LEFT] !== data['leftPressed']) {
        this._triggerButton = TV_BUTTON.LEFT;

        if (data['leftPressed']) {
          this.Trigger(this.conditions.OnTVRemoteButtonPress);
        } else {
          this.Trigger(this.conditions.OnTVRemoteButtonRelease);
        }

        this._tvButtons[TV_BUTTON.LEFT] = data['leftPressed'];
      }

      if (this._tvButtons[TV_BUTTON.RIGHT] !== data['rightPressed']) {
        this._triggerButton = TV_BUTTON.RIGHT;

        if (data['rightPressed']) {
          this.Trigger(this.conditions.OnTVRemoteButtonPress);
        } else {
          this.Trigger(this.conditions.OnTVRemoteButtonRelease);
        }

        this._tvButtons[TV_BUTTON.RIGHT] = data['rightPressed'];
      }
    });

    this.AddDOMMessageHandler('tv-remote-ok-click', (pressed) => {
      if (this._tvButtons[TV_BUTTON.OK] !== pressed) {
        this._triggerButton = TV_BUTTON.OK;

        if (pressed) {
          this.Trigger(this.conditions.OnTVRemoteButtonPress);
        } else {
          this.Trigger(this.conditions.OnTVRemoteButtonRelease);
        }

        this._tvButtons[TV_BUTTON.OK] = pressed;
      }
    });

    //#endregion

    if (this.GetRuntime().IsPreview()) {
      this.PostToDOM('start-tv-remote-emulator');
      this.PostToDOM('start-tv-remote-tracking');
      this.localization.SwitchLanguage(this.localization.defaultLanguage);
    } else if (autoInitialization) {
      this.GetRuntime().AddLoadPromise(this.InitializeYSDK());
    }
  }

  InitializeYSDK() {
    return this.PostToDOMAsync('ysdk-initialize').then(this.InitCallback.bind(this));
  }

  /**
   * Callback for sdk initialization.
   * @param {{environment?: types.YSDK["environment"], deviceType?: types.YSDK["deviceInfo"]["type"], developerURL?: string}} data
   */
  async InitCallback(data) {
    if (!data) {
      await this.localization.SwitchLanguage(this.localization.defaultLanguage);
      return;
    }

    this.environment = data['environment'];
    this.deviceType = data['deviceType'];
    this.developerURL = data['developerURL'] ?? '';

    const yandexLanguage = this.environment['i18n']['lang'];

    await this.localization.SwitchLanguage(yandexLanguage);

    this.PostToDOM('ysdk-init-finish');

    if (this.conditions.IsTV.call(this)) {
      this.PostToDOM('start-tv-remote-tracking');
    }
  }

  /**
   * Debug method for displaying errors in preview mode and console.error in runtime mode.
   * Ment to notify developers about their wrong plugin usage.
   */
  DeveloperAlert(message) {
    if (this.GetRuntime()._exportType === 'preview') {
      alert('[YandexGamesSDK] ' + message);
    }

    console.warn('[YandexGamesSDK] ' + message);
  }

  Info(message) {
    console.log('[YandexGamesSDK] ' + message);
  }

  Warn(message) {
    console.warn('[YandexGamesSDK] ' + message);
  }

  /**
   * Function to informate about developer mistakes
   * @param {string} message
   */
  logDeveloperMistake(message) {
    let lines = message.split('\n');
    const maxLength = lines.reduce((p, c) => (p < c.length ? c.length : p), 0);
    const whitespaces = ''.padEnd(maxLength + 2, ' ');
    const formattedMessage = lines.map((line) => line.padEnd(maxLength + 1, ' ')).join('\n');
    console.log(
      `${whitespaces}\n%cWarning\n%c${formattedMessage}\n\nPlease, check your events!\n${whitespaces}`,
      'color:#fb3c3c;font-size:2rem;font-weight:bold',
      'color:#fb3c3c',
    );
  }
}

C3.Plugins.yagames_sdk.Instance = YandexGamesSDKInstance;

//#endregion

//#region Script Interface

const map = new WeakMap();

class IYandexGamesSDKInstance extends self.IDOMInstance {
  constructor() {
    super();

    // Map by SDK instance
    map.set(this, self.IInstance._GetInitInst().GetSdkInstance());
  }
}

self.IYandexGamesSDKInstance = IYandexGamesSDKInstance;

//#endregion
