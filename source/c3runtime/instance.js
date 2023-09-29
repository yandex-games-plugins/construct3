/* eslint-disable no-case-declarations */
const C3 = self.C3;

const DOM_COMPONENT_ID = "yagames_sdk";

/** @class */
class YandexGamesSDKInstance extends C3.SDKInstanceBase {
  constructor(inst, properties) {
    super(inst, DOM_COMPONENT_ID);

    /** @type {Conditions} */
    this.conditions = C3.Plugins.yagames_sdk.Cnds;

    /** @type {Actions} */
    this.actions = C3.Plugins.yagames_sdk.Acts;

    //#region Localization

    /**
     * Storage for current game localizations.
     */

    /** @typedef {{[key: string]: string | StringKeysObject | undefined}} StringKeysObject */
    /** @type {StringKeysObject} */
    this.localizations = {};

    /** @type {string} */
    this.defaultLanguage = "en";

    /** @type {string} */
    this.currentLanguage = null;

    /** @type {Set<any>} */
    this.decoratedInstances = new Set();

    /** @type {Set<any>} */
    this.decoratedObjects = new Set();

    this._validLanguageCodes = new Set([
      "af",
      "am",
      "ar",
      "az",
      "be",
      "bg",
      "bn",
      "ca",
      "cs",
      "da",
      "de",
      "el",
      "en",
      "es",
      "et",
      "eu",
      "fa",
      "fi",
      "fr",
      "gl",
      "he",
      "hi",
      "hr",
      "hu",
      "hy",
      "id",
      "is",
      "it",
      "ja",
      "ka",
      "kk",
      "km",
      "kn",
      "ko",
      "ky",
      "lo",
      "lt",
      "lv",
      "mk",
      "ml",
      "mn",
      "mr",
      "ms",
      "my",
      "ne",
      "nl",
      "no",
      "pl",
      "pt",
      "ro",
      "ru",
      "si",
      "sk",
      "sl",
      "sr",
      "sv",
      "sw",
      "ta",
      "te",
      "tg",
      "th",
      "tk",
      "tl",
      "tr",
      "uk",
      "ur",
      "uz",
      "vi",
      "zh",
      "zu",
    ]);

    //#endregion

    //#region Fullscreen AD

    /**
     * @type {{
     *  [id: string]: {
     *  "onClose": {killSID:number, wasShown: boolean},
     *  "onOpen": {killSID:number},
     *  "onError": {killSID:number, error: string},
     *  "onOffline": {killSID:number},
     *  }
     * }}
     */
    this.fullscreenADCallbacks = {};

    this.AddDOMMessageHandler(
      "ysdk-fullscreen-ad-callback",
      /** @param {{type: "onClose" | "onOpen" | "onError" | "onOffline", id: string, wasShown?: boolean, error?: string}} data  */
      (data) => {
        if (!this.fullscreenADCallbacks[data.id]) {
          this.fullscreenADCallbacks[data.id] = {
            onClose: {},
            onOpen: {},
            onError: {},
            onOffline: {},
          };
        }

        if (data.type === "onClose") {
          this.fullscreenADCallbacks[data.id][data.type].wasShown =
            data.wasShown;
        } else if (data.type === "onError") {
          this.fullscreenADCallbacks[data.id][data.type].error = data.error;
        }

        this.fullscreenADCallbacks[data.id][data.type].killSID = 0;
      }
    );

    //#endregion

    //#region Rewarded AD

    /**
     * @type {{
     *  [id: string]: {
     *  "onOpen": {killSID:number},
     *  "onRewarded": {killSID:number},
     *  "onClose": {killSID:number},
     *  "onError": {killSID:number, error: string},
     *  }
     * }}
     */
    this.rewardedADCallbacks = {};

    this.AddDOMMessageHandler(
      "ysdk-rewarded-ad-callback",
      /** @param {{type: "onOpen" | "onRewarded" | "onClose" | "onError", id: string, error?: string}} data  */
      (data) => {
        if (!this.rewardedADCallbacks[data.id]) {
          this.rewardedADCallbacks[data.id] = {
            onOpen: {},
            onRewarded: {},
            onClose: {},
            onError: {},
          };
        }

        if (data.type === "onError") {
          this.rewardedADCallbacks[data.id][data.type].error = data.error;
        }

        this.rewardedADCallbacks[data.id][data.type].killSID = 0;
      }
    );

    //#endregion

    //#region Leaderboards

    /** @type {{entriesData: import("../types").LeaderboardEntriesData; currentIndex: number} | null} */
    this.forEachLeaderbordEntryLoopData = null;

    //#endregion

    //#region Player

    /**
     * @typedef {Object} PlayerAvatars
     * @property {string} small
     * @property {string} medium
     * @property {string} large
     */

    /**
     * @typedef {Object} ForPlayerInfo
     * @property {boolean} isAuthorized
     * @property {string} uniqueID
     * @property {string} publicName
     * @property {PlayerAvatars} avatars
     */

    /** @type {ForPlayerInfo | null} */
    this.forPlayerInfo = null;

    //#endregion

    //#region Misc

    /** @type {Map<any, number>} */
    this.throttleTimers = new Map();

    /** @type {Map<any, number>} */
    this.debounceTimers = new Map();

    //#endregion

    this.AddDOMMessageHandler("ysdk-init", (e) => this.initCallback(e));
    this.PostToDOM("ysdk-init");
  }

  /**
   * Callback for sdk initialization.
   * @param {{environment?: import("../types").Environment, deviceInfo?: import("../types").DeviceInfo}} data
   */
  initCallback(data) {
    console.log("YandexGamesSDKInstance.initCallback:", data);

    /** @type {import("../types").Environment} */
    this.environment = data.environment;

    /** @type {import("../types").DeviceInfo} */
    this.deviceInfo = data.deviceInfo;

    this.actions.SwitchLanguage.apply(this, [this.environment.i18n.lang]);
  }

  /**
   * @param {string} languageCode
   * @returns {boolean}
   */
  isValidLanguageCode(languageCode) {
    return this._validLanguageCodes.has(languageCode);
  }
}

C3.Plugins.yagames_sdk.Instance = YandexGamesSDKInstance;

// Script interface. Use a WeakMap to safely hide the internal implementation details from the
// caller using the script interface.
const map = new WeakMap();

class IYandexGamesSDKInstance extends self.IDOMInstance {
  constructor() {
    super();

    // Map by SDK instance
    map.set(this, self.IInstance._GetInitInst().GetSdkInstance());
  }
}

self.IYandexGamesSDKInstance = IYandexGamesSDKInstance;
