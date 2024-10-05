const C3 = self.C3;

/** @class */
const Actions = {
  //#region Localization

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} lang
   */
  SetDefaultLanguage(lang) {
    this.defaultLanguage = lang;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} languageCode
   */
  async SwitchLanguage(languageCode) {
    await this.localization.SwitchLanguage(languageCode);
  },

  //#endregion

  //#region Fullscreen AD

  /**  @this {YandexGamesSDKInstance} */
  ShowFullscreenAD() {
    this.PostToDOM('ysdk-show-fullscreen-ad');
  },

  //#endregion

  //#region Rewarded AD

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  ShowRewardedAD(id) {
    this.PostToDOM('ysdk-show-rewarded-ad', { ['id']: id });
  },

  //#endregion

  //#region Sticky Banner

  ShowStickyBanner() {
    this.PostToDOM('ysdk-show-sticky-banner');
  },

  HideStickyBanner() {
    this.PostToDOM('ysdk-hide-sticky-banner');
  },

  //#endregion

  //#region Payments

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} productID
   * @param {string} developerPayload
   */
  Purchase(productID, developerPayload) {
    this.PostToDOM('ysdk-purchase', { ['productID']: productID, ['developerPayload']: developerPayload });
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} purchaseToken
   */
  async ConsumePurchase(purchaseToken) {
    await this.PostToDOMAsync('ysdk-consume-purchase', { ['purchaseToken']: purchaseToken });
  },

  //#endregion

  //#region Player

  /** @this {YandexGamesSDKInstance} */
  async PlayerGetData(jsonObject, keysString) {
    const jsonSDKInstance = jsonObject.GetInstances()[0].GetSdkInstance();
    const keys = keysString ? keysString.split(',').map((key) => key.trim()) : undefined;
    const data = await this.PostToDOMAsync('ysdk-get-player-data', keys);
    jsonSDKInstance._SetData(data);
  },

  /** @this {YandexGamesSDKInstance} */
  async PlayerGetStats(jsonObject) {
    const jsonSDKInstance = jsonObject.GetInstances()[0].GetSdkInstance();
    const stats = await this.PostToDOMAsync('ysdk-get-player-stats');
    jsonSDKInstance._SetData(stats);
  },

  /** @this {YandexGamesSDKInstance} */
  async PlayerSetData(jsonObject, flush) {
    const jsonSDKInstance = jsonObject.GetInstances()[0].GetSdkInstance();
    await this.PostToDOMAsync('ysdk-set-player-data', {
      ['data']: jsonSDKInstance._GetData(),
      ['flush']: flush,
    });
  },

  /** @this {YandexGamesSDKInstance} */
  async PlayerSetStats(jsonObject) {
    const jsonSDKInstance = jsonObject.GetInstances()[0].GetSdkInstance();
    await this.PostToDOMAsync('ysdk-set-player-stats', jsonSDKInstance._GetData());
  },

  /** @this {YandexGamesSDKInstance} */
  async PlayerIncrementStats(jsonObject) {
    const jsonSDKInstance = jsonObject.GetInstances()[0].GetSdkInstance();
    await this.PostToDOMAsync('ysdk-increment-player-stats', jsonSDKInstance._GetData());
  },

  //#endregion

  //#region Leaderboards

  /** @this {YandexGamesSDKInstance} */
  SetLeaderboardScore(leaderboardName, score, extraData) {
    this.PostToDOM('ysdk-set-leaderboard-score', {
      ['leaderboardName']: leaderboardName,
      ['score']: score,
      ['extraData']: extraData,
    });
  },

  //#endregion

  //#region DeviceInfo

  /** @this {YandexGamesSDKInstance} */
  EmulateMobile() {
    if (!this.deviceInfo) {
      this.emulatedDevice = 'mobile';
      console.debug('Emulation mode: mobile');
    }
  },

  /** @this {YandexGamesSDKInstance} */
  EmulateTablet() {
    if (!this.deviceInfo) {
      this.emulatedDevice = 'tablet';
      console.debug('Emulation mode: tablet');
    }
  },

  /** @this {YandexGamesSDKInstance} */
  EmulateDesktop() {
    if (!this.deviceInfo) {
      this.emulatedDevice = 'desktop';
      console.debug('Emulation mode: desktop');
    }
  },

  /** @this {YandexGamesSDKInstance} */
  EmulateTV() {
    if (!this.deviceInfo) {
      this.emulatedDevice = 'tv';
      console.debug('Emulation mode: tv');
    }
  },

  //#endregion

  //#region Events

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} name
   */
  DispatchEvent(name) {
    this.PostToDOM('ysdk-dispatch-event', { ['name']: name });
  },

  //#endregion

  //#region Shortcut

  /** @this {YandexGamesSDKInstance} */
  ShortcutShowPrompt() {
    return this.PostToDOM('ysdk-shortcuts-show-prompt');
  },

  //#endregion

  //#region Review

  /** @this {YandexGamesSDKInstance} */
  RequestReview() {
    this.PostToDOMAsync('ysdk-request-review').then((props) => {
      if (props['feedbackSent']) {
        this.Trigger(this.conditions.OnReviewSuccess);
      } else {
        this.Trigger(this.conditions.OnReviewCancel);
      }
    });
  },

  //#endregion

  //#region Misc

  /** @this {YandexGamesSDKInstance} */
  async InitializeYSDK() {
    await this.InitializeYSDK();
  },

  /** @this {YandexGamesSDKInstance} */
  LoadingAPIReady() {
    this.PostToDOM('ysdk-loading-api-ready');
  },

  /** @this {YandexGamesSDKInstance} */
  GameplayAPIStart() {
    this.PostToDOM('ysdk-gameplay-api-start');
  },

  /** @this {YandexGamesSDKInstance} */
  GameplayAPIStop() {
    this.PostToDOM('ysdk-gameplay-api-stop');
  },

  //#endregion

  //#region Remote Config

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} key
   * @param {string} value
   */
  RemoteConfigSetDefault(key, value) {
    this.defaultFlags[key] = value;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} name
   * @param {string} value
   */
  RemoteConfigSetClientFeature(name, value) {
    this.clientFeatures.push({ name, value });
  },

  /** @this {YandexGamesSDKInstance} */
  RemoteConfigFetch() {
    this.PostToDOMAsync('ysdk-remote-config-fetch', {
      ['defaultFlags']: this.defaultFlags,
      ['clientFeatures']: this.clientFeatures,
    }).then((flags) => {
      this.flags = flags;
      this.defaultFlags = {};
      this.clientFeatures = [];

      this.Trigger(this.conditions.OnRemoteConfigReady);
    });
  },

  //#endregion
};

C3.Plugins.yagames_sdk.Acts = Actions;
