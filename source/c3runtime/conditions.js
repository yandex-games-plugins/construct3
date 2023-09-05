/** @class */
const Conditions = {
  //#region DeviceInfo

  IsMobile() {
    return this.deviceInfo?.isMobile || this.emulatedDevice === "mobile";
  },

  IsDesktop() {
    return this.deviceInfo?.IsDesktop || this.emulatedDevice === "desktop";
  },

  IsTablet() {
    return this.deviceInfo?.isTablet || this.emulatedDevice === "tablet";
  },

  IsTV() {
    return this.deviceInfo?.isTV || this.emulatedDevice === "tv";
  },

  //#endregion

  //#region Fullscreen AD

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  OnFullscreenADClose(id) {
    const _callbacks = this.fullscreenADCallbacks[id];

    if (!_callbacks) return false;

    const callback = _callbacks["onClose"];

    if (!callback) return false;

    const SID = this.GetRuntime().GetCurrentEvent().GetSID();

    if (callback.killSID === SID) {
      this.fullscreenADCallbacks[id]["onClose"] = undefined;
      return false;
    } else if (callback.killSID === 0) {
      callback.killSID = SID;
    }

    const condition = this.GetRuntime()
      .GetCurrentEvent()
      .GetConditions()
      .find((cond) => cond._func === this.conditions.OnFullscreenADClose);

    condition.$wasShown = callback.wasShown;

    return true;
  },

  /** @this {YandexGamesSDKInstance} */
  FullscreenADWasShown() {
    const runtime = this.GetRuntime();

    // Find event with OnFullscreenADClose condition
    let event = runtime.GetCurrentEvent();
    while (
      event &&
      !event
        .GetConditions()
        .some((cond) => cond._func === this.conditions.OnFullscreenADClose)
    ) {
      event = event.GetParent();
    }

    if (!event) return false;

    const condition = event
      .GetConditions()
      .find((cond) => cond._func === this.conditions.OnFullscreenADClose);

    const wasShown = condition.$wasShown || false;

    return wasShown;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  OnFullscreenADOpen(id) {
    const _callbacks = this.fullscreenADCallbacks[id];

    if (!_callbacks) return false;

    const callback = _callbacks["onOpen"];

    if (!callback) return false;

    const SID = this.GetRuntime().GetCurrentEvent().GetSID();

    if (callback.killSID === SID) {
      this.fullscreenADCallbacks[id]["onOpen"] = undefined;
      return false;
    } else if (callback.killSID === 0) {
      callback.killSID = SID;
    }

    return true;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  OnFullscreenADError(id) {
    const _callbacks = this.fullscreenADCallbacks[id];

    if (!_callbacks) return false;

    const callback = _callbacks["onError"];

    if (!callback) return false;

    const SID = this.GetRuntime().GetCurrentEvent().GetSID();

    if (callback.killSID === SID) {
      this.fullscreenADCallbacks[id]["onError"] = undefined;
      return false;
    } else if (callback.killSID === 0) {
      callback.killSID = SID;
    }

    const condition = this.GetRuntime()
      .GetCurrentEvent()
      .GetConditions()
      .find((cond) => cond._func === this.conditions.OnFullscreenADError);

    condition.$error = callback.error;

    return true;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  OnFullscreenADOffline(id) {
    const _callbacks = this.fullscreenADCallbacks[id];

    if (!_callbacks) return false;

    const callback = _callbacks["onOffline"];

    if (!callback) return false;

    const SID = this.GetRuntime().GetCurrentEvent().GetSID();

    if (callback.killSID === SID) {
      this.fullscreenADCallbacks[id]["onOffline"] = undefined;
      return false;
    } else if (callback.killSID === 0) {
      callback.killSID = SID;
    }

    return true;
  },

  //#endregion

  //#region Rewarded AD

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  OnRewardedADOpen(id) {
    const _callbacks = this.rewardedADCallbacks[id];

    if (!_callbacks) return false;

    const callback = _callbacks["onOpen"];

    if (!callback) return false;

    const SID = this.GetRuntime().GetCurrentEvent().GetSID();

    if (callback.killSID === SID) {
      this.rewardedADCallbacks[id]["onOpen"] = undefined;
      return false;
    } else if (callback.killSID === 0) {
      callback.killSID = SID;
    }

    return true;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  OnRewardedADRewarded(id) {
    const _callbacks = this.rewardedADCallbacks[id];

    if (!_callbacks) return false;

    const callback = _callbacks["onRewarded"];

    if (!callback) return false;

    const SID = this.GetRuntime().GetCurrentEvent().GetSID();

    if (callback.killSID === SID) {
      this.rewardedADCallbacks[id]["onRewarded"] = undefined;
      return false;
    } else if (callback.killSID === 0) {
      callback.killSID = SID;
    }

    return true;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  OnRewardedADClose(id) {
    const _callbacks = this.rewardedADCallbacks[id];

    if (!_callbacks) return false;

    const callback = _callbacks["onClose"];

    if (!callback) return false;

    const SID = this.GetRuntime().GetCurrentEvent().GetSID();

    if (callback.killSID === SID) {
      this.rewardedADCallbacks[id]["onClose"] = undefined;
      return false;
    } else if (callback.killSID === 0) {
      callback.killSID = SID;
    }

    return true;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  OnRewardedADError(id) {
    const _callbacks = this.rewardedADCallbacks[id];

    if (!_callbacks) return false;

    const callback = _callbacks["onError"];

    if (!callback) return false;

    const SID = this.GetRuntime().GetCurrentEvent().GetSID();

    if (callback.killSID === SID) {
      this.rewardedADCallbacks[id]["onError"] = undefined;
      return false;
    } else if (callback.killSID === 0) {
      callback.killSID = SID;
    }

    const condition = this.GetRuntime()
      .GetCurrentEvent()
      .GetConditions()
      .find((cond) => cond._func === this.conditions.OnRewardedADError);

    condition.$error = callback.error;

    return true;
  },

  //#endregion
};

self.C3.Plugins.yagames_sdk.Cnds = Conditions;
