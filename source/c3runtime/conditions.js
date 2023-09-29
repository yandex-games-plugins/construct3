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

    const runtime = this.GetRuntime();
    const currentEvent = runtime.GetCurrentEvent();

    const SID = currentEvent.GetSID();

    if (callback.killSID === SID) {
      this.fullscreenADCallbacks[id]["onClose"] = undefined;
      return false;
    } else if (callback.killSID === 0) {
      callback.killSID = SID;
    }

    const condition = currentEvent
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

    const runtime = this.GetRuntime();
    const currentEvent = runtime.GetCurrentEvent();

    const SID = currentEvent.GetSID();

    if (callback.killSID === SID) {
      this.fullscreenADCallbacks[id]["onError"] = undefined;
      return false;
    } else if (callback.killSID === 0) {
      callback.killSID = SID;
    }

    const condition = currentEvent
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

    const runtime = this.GetRuntime();
    const currentEvent = runtime.GetCurrentEvent();

    const SID = currentEvent.GetSID();

    if (callback.killSID === SID) {
      this.rewardedADCallbacks[id]["onError"] = undefined;
      return false;
    } else if (callback.killSID === 0) {
      callback.killSID = SID;
    }

    const condition = currentEvent
      .GetConditions()
      .find((cond) => cond._func === this.conditions.OnRewardedADError);

    condition.$error = callback.error;

    return true;
  },

  //#endregion

  //#region Leaderboards

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} leaderboardName
   * @param {number} quantityTop
   * @param {boolean} includeUser
   * @param {number} quantityAround
   */
  ForEachLeaderboardEntry(
    leaderboardName,
    quantityTop,
    includeUser,
    quantityAround
  ) {
    const runtime = this.GetRuntime();
    const eventSheetManager = runtime.GetEventSheetManager();
    const currentEvent = runtime.GetCurrentEvent();
    const solModifiers = currentEvent.GetSolModifiers();
    const eventStack = runtime.GetEventStack();

    this.PostToDOMAsync("ysdk-request-leaderboard-entries", {
      leaderboardName,
      options: {
        quantityTop,
        includeUser,
        quantityAround,
      },
    }).then((entriesDataJSON) => {
      /** @type {import("../types").LeaderboardEntriesData} */
      const entriesData = JSON.parse(entriesDataJSON);

      this.forEachLeaderbordEntryLoopData = {};
      this.forEachLeaderbordEntryLoopData.entriesData = entriesData;

      const oldFrame = eventStack.GetCurrentStackFrame();
      const newFrame = eventStack.Push(currentEvent);

      for (let i = 0; i < entriesData.entries.length; i++) {
        eventSheetManager.PushCopySol(solModifiers);

        this.forEachLeaderbordEntryLoopData.currentIndex = i;

        currentEvent.Retrigger(oldFrame, newFrame);

        eventSheetManager.PopSol(solModifiers);
      }

      eventStack.Pop();

      this.forEachLeaderbordEntryLoopData = null;
    });

    return false;
  },

  /** @this {YandexGamesSDKInstance} */
  CurrentLeaderboardDescriptionInvertOrder() {
    if (!this.forEachLeaderbordEntryLoopData) return "";
    const leaderboard =
      this.forEachLeaderbordEntryLoopData.entriesData.leaderboard;
    return leaderboard.description.invert_sort_order ? "true" : "false";
  },

  //#endregion

  //#region Player

  /**
   * @this {YandexGamesSDKInstance}
   * @param {boolean} signed
   */
  ForPlayerInfo(signed) {
    const runtime = this.GetRuntime();
    const eventSheetManager = runtime.GetEventSheetManager();
    const currentEvent = runtime.GetCurrentEvent();
    const solModifiers = currentEvent.GetSolModifiers();
    const eventStack = runtime.GetEventStack();

    this.PostToDOMAsync("ysdk-request-player-data", {
      signed,
    }).then((playerDataJSON) => {
      this.forPlayerInfo = JSON.parse(playerDataJSON);

      const oldFrame = eventStack.GetCurrentStackFrame();
      const newFrame = eventStack.Push(currentEvent);
      eventSheetManager.PushCopySol(solModifiers);
      currentEvent.Retrigger(oldFrame, newFrame);
      eventSheetManager.PopSol(solModifiers);
      eventStack.Pop();

      this.forPlayerInfo = null;
    });

    return false;
  },

  /** @this {YandexGamesSDKInstance} */
  CurrentPlayerIsAuthorized() {
    if (this.forPlayerInfo) {
      return !!this.forPlayerInfo.isAuthorized;
    } else {
      return false;
    }
  },

  //#endregion

  //#region Misc

  /**
   * @this {YandexGamesSDKInstance}
   * @param {number} seconds
   */
  Throttle(seconds) {
    const runtime = this.GetRuntime();
    const eventSheetManager = runtime.GetEventSheetManager();
    const currentEvent = runtime.GetCurrentEvent();
    const solModifiers = currentEvent.GetSolModifiers();
    const eventStack = runtime.GetEventStack();

    if (this.throttleTimers.has(currentEvent)) {
      return false;
    }

    const oldFrame = eventStack.GetCurrentStackFrame();
    const newFrame = eventStack.Push(currentEvent);
    eventSheetManager.PushCopySol(solModifiers);
    currentEvent.Retrigger(oldFrame, newFrame);
    eventSheetManager.PopSol(solModifiers);
    eventStack.Pop();

    this.throttleTimers.set(
      currentEvent,
      setTimeout(() => {
        clearTimeout(this.throttleTimers.get(currentEvent));
        this.throttleTimers.delete(currentEvent);
      }, seconds * 1000)
    );

    return false;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {number} seconds
   */
  Debounce(seconds) {
    const runtime = this.GetRuntime();
    const eventSheetManager = runtime.GetEventSheetManager();
    const currentEvent = runtime.GetCurrentEvent();
    const solModifiers = currentEvent.GetSolModifiers();
    const eventStack = runtime.GetEventStack();

    if (this.debounceTimers.has(currentEvent)) {
      clearTimeout(this.debounceTimers.get(currentEvent));
      this.debounceTimers.delete(currentEvent);
    }

    this.debounceTimers.set(
      currentEvent,
      setTimeout(() => {
        const oldFrame = eventStack.GetCurrentStackFrame();
        const newFrame = eventStack.Push(currentEvent);
        eventSheetManager.PushCopySol(solModifiers);
        currentEvent.Retrigger(oldFrame, newFrame);
        eventSheetManager.PopSol(solModifiers);
        eventStack.Pop();
      }, seconds * 1000)
    );

    return false;
  },

  //#endregion
};

self.C3.Plugins.yagames_sdk.Cnds = Conditions;
