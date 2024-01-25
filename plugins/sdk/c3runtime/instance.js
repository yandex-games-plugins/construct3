/* eslint-disable no-case-declarations */
const C3 = self.C3;

//#region Localization

class Localization {
  /** @param {YandexGamesSDKInstance} instance */
  constructor(instance) {
    this.pluginInstance = instance;
    this.runtime = instance.GetRuntime();
    this.assetManager = this.runtime.GetAssetManager();

    /** @typedef {{[key: string]: string | StringKeysObject | undefined}} StringKeysObject */

    /**
     * Storage for current game localizations.
     * @type {StringKeysObject}
     */
    this.localizations = {};

    /** @type {string} */
    this.defaultLanguage = 'en';

    /** @type {string} */
    this.currentLanguage = null;

    /** @type {Set<any>} */
    this.decoratedSDKInstances = new Set();

    /** @type {Set<any>} */
    this.decoratedObjects = new Set();

    // prettier-ignore
    this.validLanguageCodes = new Set(['af', 'am', 'ar', 'az', 'be', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'eu', 'fa', 'fi', 'fr', 'gl', 'he', 'hi', 'hr', 'hu', 'hy', 'id', 'is', 'it', 'ja', 'ka', 'kk', 'km', 'kn', 'ko', 'ky', 'lo', 'lt', 'lv', 'mk', 'ml', 'mn', 'mr', 'ms', 'my', 'ne', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'si', 'sk', 'sl', 'sr', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'tk', 'tl', 'tr', 'uk', 'ur', 'uz', 'vi', 'zh', 'zu']);
  }

  InitLocalization() {
    const TEXT_PLUGINS_NAMES = new Set(['TextPlugin', 'SpriteFontPlugin', 'AdaptiveTextPlugin']);

    this.textPluginsNames = this.runtime
      .GetAllObjectClasses()
      .filter((objectClass) => TEXT_PLUGINS_NAMES.has(objectClass.GetPlugin().constructor.name));

    this.DecorateTextPlugins();
    this.TranslateTextPlugins();

    this.spritePlugins = this.runtime.GetAllObjectClasses().filter((objectClass) => {
      const pluginName = objectClass.GetPlugin().constructor.name;
      return (
        pluginName === 'SpritePlugin' &&
        // Check that all animations names are valid language codes
        objectClass._animations &&
        objectClass._animations.every((animationInfo) => this.IsValidLanguageCode(animationInfo._name))
      );
    });

    this.DecorateSpritePlugins();
    this.DecorateTextPlugins();
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

  textPluginsNames = new Set(['TextPlugin', 'SpriteFontPlugin', 'AdaptiveTextPlugin']);
  DecorateTextPlugins() {
    this.runtime
      .GetAllObjectClasses()
      .filter((objectClass) => {
        const pluginName = objectClass.GetPlugin().constructor.name;
        return this.textPluginsNames.has(pluginName);
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

          const setTextMethodName = '_SetText';

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
              console.error(`Can't find property descriptor ${setTextMethodName} of`, sdkInstance);
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
          const addInstanceMethodName = '_AddInstance';

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
            console.error(`Can't find property descriptor ${addInstanceMethodName} of`, objectClass);
          }
        }
      });
  }

  /** @type {(string:string) => string} */
  TranslateString(string) {
    try {
      let _string = string;

      // Regex for finding {path.to.translation} in string that not wrapped in []
      const nonWrappedPaths = /(?<!\[)\{[\w\d.]*\}(?!\])/;

      /**
       * Replace all matches
       * "{path}" -> "[{path}]Value[{path}]"
       */
      let matches;
      while ((matches = _string.match(nonWrappedPaths) || matches?.lenght > 0)) {
        const match = matches[0];
        try {
          const path = match.slice(1, -1);
          const translation = path.split('.').reduce((obj, key) => obj[key], this.localizations);

          if (translation === undefined) {
            throw new Error(`Translation for ${path} is undefined.`);
          }

          _string = _string.replace(match, translation);
        } catch (e) {
          console.error(e);
          this.pluginInstance.DeveloperAlert(
            `Can't apply translation for ${match} in ${this.currentLanguage}. More info in console.`,
          );
          break;
        }
      }

      // Return translated string
      return _string;
    } catch (e) {
      console.error(e);
      this.pluginInstance.DeveloperAlert(
        `Wasn't able to translate string: ${string}. Make sure that key exists. More info in console.`,
      );
      return string;
    }
  }

  DecorateSpritePlugins() {
    this.runtime
      .GetAllObjectClasses()
      .filter((objectClass) => {
        const pluginName = objectClass.GetPlugin().constructor.name;
        return (
          pluginName === 'SpritePlugin' &&
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
          const addInstanceMethodName = '_AddInstance';

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
            console.error(`Can't find property descriptor ${addInstanceMethodName} of`, objectClass);
          }
        }
      });
  }

  TranslateSprite(instance) {
    const sdkInstance = instance.GetSdkInstance();

    // Get animations map
    const animationsByName = sdkInstance._objectClass?._animationsByName;
    if (!animationsByName) return;

    // Apply current language animation if exists, otherwise apply default language animation if exists.
    // Make sure that we preserve current frame index.
    if (animationsByName.has(this.currentLanguage)) {
      const currentFrame = sdkInstance._currentFrameIndex;
      const fromAnimation = sdkInstance._currentAnimation._name;
      sdkInstance._SetAnim(this.currentLanguage, fromAnimation);
      sdkInstance._SetAnimFrame(currentFrame);
    } else if (animationsByName.has(this.defaultLanguage)) {
      // TODO: Add DeveloperAlert here!
      console.warn('Animation for current language not found, fallback to default', sdkInstance);

      const currentFrame = sdkInstance._currentFrameIndex;
      const fromAnimation = sdkInstance._currentAnimation._name;
      sdkInstance._SetAnim(this.defaultLanguage, fromAnimation);
      sdkInstance._SetAnimFrame(currentFrame);
    }
  }

  /** @type {(lang:string) => Promise<string | undefined>} */
  async FindLanguageJSON(lang) {
    let url;
    try {
      if (this.runtime._exportType === 'preview') {
        const blobs = this.assetManager._localUrlBlobs;
        blobs.forEach((_, k) => {
          if (k.includes(`${lang}.json`)) {
            url = k;
          }
        });
        return await blobs.get(url).text();
      } else {
        url = this.runtime._runtimeBaseUrl;
        if (this.assetManager._fileStructure !== 'flat') {
          url += 'i18n/';
        }
        url += `${lang}.json`;
        return await (await fetch(url)).text();
      }
    } catch (e) {
      console.error(e, url);
      return undefined;
    }
  }

  async SwitchLanguage(languageCode) {
    console.debug('Switch Language', languageCode);

    this.currentLanguage = languageCode;

    let languageJSON = await this.FindLanguageJSON(languageCode);

    if (languageJSON === undefined && this.defaultLanguage != null) {
      this.pluginInstance.Warn(
        `Can't find localizations for ${languageCode}. Switching to default ${this.defaultLanguage}.`,
      );

      this.currentLanguage = this.defaultLanguage;
      languageJSON = await this.FindLanguageJSON(this.defaultLanguage);

      if (languageJSON === '') {
        this.currentLanguage = '';
        this.localizations = {};
        this.pluginInstance.Warn(`Can't find localizations for default language (${this.defaultLanguage}).`);
        this.pluginInstance.DeveloperAlert(
          'Can\'t find localizations, make sure that you have localizations in "i18n" folder. More info in devtools console.',
        );
        return;
      }
    }

    try {
      this.localizations = JSON.parse(languageJSON);
    } catch (e) {
      console.error(e);
      this.pluginInstance.DeveloperAlert(
        `Error while parsing localizations for ${this.currentLanguage}. More info in devtools console.`,
      );
      this.localizations = {};
      return;
    }

    this.DecorateTextPlugins();
    this.DecorateSpritePlugins();
  }
}

//#endregion

//#region Instance

const DOM_COMPONENT_ID = 'yagames_sdk';

/** @class */
class YandexGamesSDKInstance extends C3.SDKInstanceBase {
  constructor(inst, properties) {
    super(inst, DOM_COMPONENT_ID);

    /** @type {types.YSDK["environment"]} */
    this.environment = undefined;

    /** @type {"desktop" | "mobile" | "tablet" | "tv"} */
    this.deviceType = undefined;

    /** @type {Conditions} */
    this.conditions = C3.Plugins.yagames_sdk.Cnds;

    /** @type {Actions} */
    this.actions = C3.Plugins.yagames_sdk.Acts;

    /** @type {Expressions} */
    this.expressions = C3.Plugins.yagames_sdk.Exps;

    this.localization = new Localization(this);
    this.localization.defaultLanguage = properties[0];

    //#region Fullscreen AD

    /** @type {Map<string, number>} */
    this.fullscreenADOpenKillSID = new Map();

    /** @type {Map<string, number>} */
    this.fullscreenADCloseKillSID = new Map();
    /** @type {Map<string, boolean>} */
    this.fullscreenADCloseWasShown = new Map();

    /** @type {Map<string, number>} */
    this.fullscreenADErrorKillSID = new Map();
    /** @type {Map<string, string>} */
    this.fullscreenADErrorError = new Map();

    /** @type {Map<string, number>} */
    this.fullscreenADOfflineKillSID = new Map();

    this.AddDOMMessageHandler(
      'ysdk-fullscreen-ad-callback',
      /** @param {{type: "onClose" | "onOpen" | "onError" | "onOffline", id: string, wasShown?: boolean, error?: string}} data  */
      (data) => {
        switch (data.type) {
          case 'onOpen':
            this.fullscreenADOpenKillSID.set(data.id, Number.MAX_SAFE_INTEGER);
            break;
          case 'onClose':
            this.fullscreenADCloseKillSID.set(data.id, Number.MAX_SAFE_INTEGER);
            this.fullscreenADCloseWasShown.set(data.id, data.wasShown);
            break;
          case 'onError':
            this.fullscreenADErrorKillSID.set(data.id, Number.MAX_SAFE_INTEGER);
            this.fullscreenADErrorError.set(data.id, data.error);
            break;
          case 'onOffline':
            this.fullscreenADOfflineKillSID.set(data.id, Number.MAX_SAFE_INTEGER);
            break;
        }
      },
    );

    //#endregion

    //#region Rewarded AD

    /** @type {Map<string, number>} */
    this.rewardedADOpenKillSID = new Map();

    /** @type {Map<string, number>} */
    this.rewardedADRewardedKillSID = new Map();

    /** @type {Map<string, number>} */
    this.rewardedADCloseKillSID = new Map();

    /** @type {Map<string, number>} */
    this.rewardedADErrorKillSID = new Map();
    /** @type {Map<string, string>} */
    this.rewardedADErrorError = new Map();

    this.AddDOMMessageHandler(
      'ysdk-rewarded-ad-callback',
      /** @param {{type: "onOpen" | "onRewarded" | "onClose" | "onError", id: string, error?: string}} data  */
      (data) => {
        switch (data.type) {
          case 'onOpen':
            this.rewardedADOpenKillSID.set(data.id, Number.MAX_SAFE_INTEGER);
            break;
          case 'onRewarded':
            this.rewardedADRewardedKillSID.set(data.id, Number.MAX_SAFE_INTEGER);
            break;
          case 'onClose':
            this.rewardedADCloseKillSID.set(data.id, Number.MAX_SAFE_INTEGER);
            break;
          case 'onError':
            this.rewardedADErrorKillSID.set(data.id, Number.MAX_SAFE_INTEGER);
            this.rewardedADErrorError.set(data.id, data.error);
            break;
        }
      },
    );

    //#endregion

    //#region Leaderboards

    //#endregion

    //#region Payments

    /** @type {{purchases: types.Signed<types.Purchase[]>, currentIndex: number} | undefined} */
    this.forEachPurchaseLoopData = undefined;

    /**
     * @typedef {{
     *   id: string;
     *   title: string;
     *   description: string;
     *   imageURI: string;
     *   price: string;
     *   priceValue: string;
     *   priceCurrencyCode: string;
     *   priceCurrencyImage: {
     *     small: string;
     *     medium: string;
     *     svg: string;
     *   };
     * }} RuntimeProduct
     */

    /** @type {{catalog: RuntimeProduct[], currentIndex: number} | undefined} */
    this.forEachInCatalogLoopData = undefined;

    /**
     * @typedef {Object} PurchaseSuccessTriggerData
     * @property {number} killSID
     * @property {string} productID
     * @property {string} purchaseToken
     * @property {string|undefined} developerPayload
     * @property {string|undefined} signature
     */

    /** @type {Map<string, PurchaseSuccessTriggerData>} */
    this.purchaseSuccessTriggerPool = new Map();

    /** @type {PurchaseSuccessTriggerData | undefined} */
    this.purchaseSuccessTriggerData = undefined;

    /**
     * @typedef {Object} PurchaseFailureTriggerData
     * @property {number} killSID
     * @property {string} error
     */

    /** @type {Map<string, PurchaseFailureTriggerData>} */
    this.purchaseFailureTriggerPool = new Map();

    /** @type {PurchaseFailureTriggerData | undefined} */
    this.purchaseFailureTriggerData = undefined;

    this.AddDOMMessageHandler(
      'ysdk-purchase-callback',
      /** @param {{error?: string, productID: string, purchaseToken: string, developerPayload?: string, signature?: string}} data  */
      (data) => {
        if (data.error) {
          this.purchaseFailureTriggerData.set(data.productID, {
            killSID: Number.MAX_SAFE_INTEGER,
            error: data.error,
          });
          return;
        }

        this.purchaseSuccessTriggerData.set(data.productID, {
          killSID: Number.MAX_SAFE_INTEGER,
          productID: data.productID,
          purchaseToken: data.purchaseToken,
          developerPayload: data.developerPayload,
          signature: data.signature,
        });
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
      }
    });

    //#endregion

    //#region Shortcut

    /** @type {boolean} */
    this.canShowShortcutPrompt = false;

    this.AddDOMMessageHandler('ysdk-update-can-show-shortcut-prompt', (data) => {
      this.canShowShortcutPrompt = data.canShow;
      return true;
    });

    this.AddDOMMessageHandler('ysdk-shortcut-show-prompt-result', (data) => {
      if (data.accepted) {
        this.Trigger(this.conditions.OnShortcutAdded);
      }
    });

    //#endregion

    //#region Misc

    /** @type {Map<any, number>} */
    this.throttleTimers = new Map();

    /** @type {Map<any, number>} */
    this.debounceTimers = new Map();

    //#endregion

    //#region Remote Config

    /** @type {Record<string, string>} */
    this.flags = {};

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
      if (this._tvButtons[TV_BUTTON.UP] !== data.upPressed) {
        this._triggerButton = TV_BUTTON.UP;

        if (data.upPressed) {
          this.Trigger(this.conditions.OnTVRemoteButtonPress);
        } else {
          this.Trigger(this.conditions.OnTVRemoteButtonRelease);
        }

        this._tvButtons[TV_BUTTON.UP] = data.upPressed;
      }

      if (this._tvButtons[TV_BUTTON.DOWN] !== data.downPressed) {
        this._triggerButton = TV_BUTTON.DOWN;

        if (data.downPressed) {
          this.Trigger(this.conditions.OnTVRemoteButtonwnPress);
        } else {
          this.Trigger(this.conditions.OnTVRemoteButtonwnRelease);
        }

        this._tvButtons[TV_BUTTON.DOWN] = data.downPressed;
      }

      if (this._tvButtons[TV_BUTTON.LEFT] !== data.leftPressed) {
        this._triggerButton = TV_BUTTON.LEFT;

        if (data.leftPressed) {
          this.Trigger(this.conditions.OnTVRemoteButtonftPress);
        } else {
          this.Trigger(this.conditions.OnTVRemoteButtonftRelease);
        }

        this._tvButtons[TV_BUTTON.LEFT] = data.leftPressed;
      }

      if (this._tvButtons[TV_BUTTON.RIGHT] !== data.rightPressed) {
        this._triggerButton = TV_BUTTON.RIGHT;

        if (data.rightPressed) {
          this.Trigger(this.conditions.OnTVRemoteButtonghtPress);
        } else {
          this.Trigger(this.conditions.OnTVRemoteButtonghtRelease);
        }

        this._tvButtons[TV_BUTTON.RIGHT] = data.rightPressed;
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

    if (this._runtime.IsPreview()) {
      this.PostToDOM('start-tv-remote-emulator');
      this.PostToDOM('start-tv-remote-tracking');
      this.SetPlaceholders();
      this.actions.SwitchLanguage.call(this, 'en');
    } else {
      this._runtime.AddLoadPromise(this.InitializeYSDK());
    }
  }

  SetPlaceholders() {
    const debugLanguage = navigator.language.slice(0, 2);

    this.environment = {
      app: { id: '0' },
      browser: { lang: debugLanguage },
      i18n: { lang: debugLanguage, tld: '.com' },
      payload: '',
    };

    this.deviceType = 'desktop';
  }

  InitializeYSDK() {
    return this.PostToDOMAsync('ysdk-initialize').then(this.InitCallback.bind(this));
  }

  /**
   * Callback for sdk initialization.
   * @param {{environment?: types.YSDK["environment"], deviceType?: types.YSDK["deviceInfo"]["type"]}} data
   */
  InitCallback(data) {
    this.environment = data.environment;
    this.deviceType = data.deviceType;

    const yandexLanguage = this.environment.i18n.lang;

    this.actions.SwitchLanguage.call(this, yandexLanguage);

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
    if (this._runtime._exportType === 'preview') {
      alert('[YandexGamesSDK] ' + message);
    }

    console.warn('[YandexGamesSDK] ' + message);
  }

  Warn(message) {
    console.warn('[YandexGamesSDK] ' + message);
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
