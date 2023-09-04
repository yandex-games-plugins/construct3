/** @type {YandexGamesSDKInstance} */
self.C3.Plugins.yagames_sdk.Exps = {
  //#region Translations

  CurrentLanguage() {
    return this.currentLanguage ?? "";
  },

  //#endregion

  //#region Fullscreen AD

  /** @this {YandexGamesSDKInstance} */
  FullscreenADError() {
    const runtime = this.GetRuntime();

    let event = runtime.GetCurrentEvent();
    while (
      event &&
      !event
        .GetConditions()
        .some((cond) => cond._func === this.conditions.OnFullscreenADError)
    ) {
      event = event.GetParent();
    }

    if (!event) return "";

    const condition = event
      .GetConditions()
      .find((cond) => cond._func === this.conditions.OnFullscreenADError);

    const error = condition.$error || "";

    return error;
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
