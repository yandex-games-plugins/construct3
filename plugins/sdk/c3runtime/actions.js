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
    this.localization.SwitchLanguage(languageCode);
  },

  //#endregion

  //#region Fullscreen AD

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  ShowFullscreenAD(id) {
    this.PostToDOM('ysdk-show-fullscreen-ad', { id });
  },

  //#endregion

  //#region Rewarded AD

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  ShowRewardedAD(id) {
    this.PostToDOM('ysdk-show-rewarded-ad', { id });
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

  //#region Player

  /** @this {YandexGamesSDKInstance} */
  async PlayerGetData(jsonObject, keysString) {
    const jsonSDKInstance = jsonObject._instances[0]._sdkInst;
    const keys = keysString ? keysString.split(',').map((key) => key.trim()) : undefined;
    const data = await this.PostToDOMAsync('ysdk-get-player-data', keys);
    jsonSDKInstance._SetData(data);
  },

  /** @this {YandexGamesSDKInstance} */
  async PlayerGetStats(jsonObject) {
    const jsonSDKInstance = jsonObject._instances[0]._sdkInst;
    const stats = await this.PostToDOMAsync('ysdk-get-player-stats');
    jsonSDKInstance._SetData(stats);
  },

  /** @this {YandexGamesSDKInstance} */
  async PlayerSetData(jsonObject, flush) {
    const jsonSDKInstance = jsonObject._instances[0]._sdkInst;
    await this.PostToDOMAsync('ysdk-set-player-data', { data: jsonSDKInstance._GetData(), flush });
  },

  /** @this {YandexGamesSDKInstance} */
  async PlayerSetStats(jsonObject) {
    const jsonSDKInstance = jsonObject._instances[0]._sdkInst;
    await this.PostToDOMAsync('ysdk-set-player-stats', jsonSDKInstance._GetData());
  },

  /** @this {YandexGamesSDKInstance} */
  async PlayerIncrementStats(jsonObject) {
    const jsonSDKInstance = jsonObject._instances[0]._sdkInst;
    await this.PostToDOMAsync('ysdk-increment-player-stats', jsonSDKInstance._GetData());
  },

  //#endregion

  //#region Leaderboards

  /** @this {YandexGamesSDKInstance} */
  SetLeaderboardScore(leaderboardName, score, extraData) {
    this.PostToDOM('ysdk-set-leaderboard-score', {
      leaderboardName,
      score,
      extraData,
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
    this.PostToDOM('ysdk-dispatch-event', { name });
  },

  //#endregion

  //#region Shortcut

  /** @this {YandexGamesSDKInstance} */
  ShortcutShowPrompt() {
    return this.PostToDOM('ysdk-shortcuts-show-prompt');
  },

  //#endregion

  //#region Misc

  LoadingAPIReady() {
    this.PostToDOM('ysdk-loading-api-ready');
  },

  //#endregion

  //#region Remote Config

  /** @this {YandexGamesSDKInstance} */
  RemoteConfigFetch(defaultConfig, clientFeatures) {
    this.PostToDOMAsync('ysdk-remove-config-fetch', { defaultConfig, clientFeatures }).then((_flags) => {
      this.flags = JSON.parse(_flags);
      this.Trigger(this.conditions.OnRemoteConfigReady);
    });
  },

  //#endregion
};

C3.Plugins.yagames_sdk.Acts = Actions;
