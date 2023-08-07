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

    //#region Translations

    /**
     * Storage for current game translations.
     */

    /** @typedef {{[key: string]: string | StringKeysObject | undefined}} StringKeysObject */
    /** @type {StringKeysObject} */
    this.translations = {};

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

    this.AddDOMMessageHandler("ysdk-init", (e) => this.initCallback(e));
    this.PostToDOM("ysdk-init");
  }

  /**
   * Callback for sdk initialization.
   * @param {{isPreview: boolean, environment?: Environment, deviceInfo?: DeviceInfo}} data - Does sdk exists?
   */
  initCallback(data) {
    console.log("YandexGamesSDKInstance.initCallback:", data);

    this.isPreview = data.isPreview;
    this.environment = JSON.parse(data.environment);
    this.deviceInfo = JSON.parse(data.deviceInfo);

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
