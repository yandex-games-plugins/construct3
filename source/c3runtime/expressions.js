/** @type {YandexGamesSDKInstance} */
self.C3.Plugins.yagames_sdk.Exps = {
  //#region Translations

  CurrentLanguage() {
    return this.currentLanguage ?? "";
  },

  //#endregion

  //#region Environment

  GetLanguage() {
    return this.environment?.i18n.lang ?? "en";
  },

  GetDomain() {
    return this.environment?.i18n.tld ?? "com";
  },

  GetPayload() {
    return this.environment?.payload ?? "";
  },

  GetAppID() {
    return this.environment?.app_id ?? "0";
  },

  //#endregion
};
