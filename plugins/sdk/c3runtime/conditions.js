/** @class */
const Conditions = {
  //#region DeviceInfo

  /** @this {YandexGamesSDKInstance} */
  IsMobile() {
    if (this.emulatedDevice) return this.emulatedDevice === 'mobile';
    return this.deviceType === 'mobile';
  },

  /** @this {YandexGamesSDKInstance} */
  IsDesktop() {
    if (this.emulatedDevice) return this.emulatedDevice === 'desktop';
    return this.deviceType === 'desktop';
  },

  /** @this {YandexGamesSDKInstance} */
  IsTablet() {
    if (this.emulatedDevice) return this.emulatedDevice === 'tablet';
    return this.deviceType === 'tablet';
  },

  /** @this {YandexGamesSDKInstance} */
  IsTV() {
    if (this.emulatedDevice) return this.emulatedDevice === 'tv';
    return this.deviceType === 'tv';
  },

  //#endregion

  //#region Fullscreen AD

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  OnFullscreenADClose(id) {
    const havekillSID = this.fullscreenADCloseKillSID.has(id);

    if (!havekillSID) return false;

    const killSID = this.fullscreenADCloseKillSID.get(id);
    const wasShown = this.fullscreenADCloseWasShown.get(id);

    const runtime = this.GetRuntime();
    const currentEvent = runtime.GetCurrentEvent();

    const SID = currentEvent.GetSID();

    if (killSID === SID) {
      this.fullscreenADCloseKillSID.delete(id);
      this.fullscreenADCloseWasShown.delete(id);
      return false;
    }

    if (killSID === Number.MAX_SAFE_INTEGER) {
      this.fullscreenADCloseKillSID.set(id, SID);
    }

    const condition = currentEvent
      .GetConditions()
      .find((cond) => cond._func === this.conditions.OnFullscreenADClose);

    condition.$wasShown = wasShown;

    return true;
  },

  /** @this {YandexGamesSDKInstance} */
  FullscreenADWasShown() {
    const runtime = this.GetRuntime();

    // Find event with OnFullscreenADClose condition
    let event = runtime.GetCurrentEvent();
    while (
      event &&
      !event.GetConditions().some((cond) => cond._func === this.conditions.OnFullscreenADClose)
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
    const havekillSID = this.fullscreenADOpenKillSID.has(id);

    if (!havekillSID) return false;

    const killSID = this.fullscreenADOpenKillSID.get(id);

    const SID = this.GetRuntime().GetCurrentEvent().GetSID();

    if (killSID === SID) {
      this.fullscreenADOpenKillSID.delete(id);
      return false;
    }

    if (killSID === Number.MAX_SAFE_INTEGER) {
      this.fullscreenADOpenKillSID.set(id, SID);
    }

    return true;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  OnFullscreenADError(id) {
    const havekillSID = this.fullscreenADErrorKillSID.has(id);

    if (!havekillSID) return false;

    const killSID = this.fullscreenADErrorKillSID.get(id);
    const error = this.fullscreenADErrorError.get(id);

    const runtime = this.GetRuntime();
    const currentEvent = runtime.GetCurrentEvent();

    const SID = currentEvent.GetSID();

    if (killSID === SID) {
      this.fullscreenADErrorKillSID.delete(id);
      this.fullscreenADErrorError.delete(id);
      return false;
    }

    if (killSID === Number.MAX_SAFE_INTEGER) {
      this.fullscreenADErrorKillSID.set(id, SID);
    }

    const condition = currentEvent
      .GetConditions()
      .find((cond) => cond._func === this.conditions.OnFullscreenADError);

    condition.$error = error;

    return true;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  OnFullscreenADOffline(id) {
    const havekillSID = this.fullscreenADOfflineKillSID.has(id);

    if (!havekillSID) return false;

    const killSID = this.fullscreenADOfflineKillSID.get(id);

    const SID = this.GetRuntime().GetCurrentEvent().GetSID();

    if (killSID === SID) {
      this.fullscreenADOfflineKillSID.delete(id);
      return false;
    }

    if (killSID === Number.MAX_SAFE_INTEGER) {
      this.fullscreenADOfflineKillSID.set(id, SID);
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
    const havekillSID = this.rewardedADOpenKillSID.has(id);

    if (!havekillSID) return false;

    const killSID = this.rewardedADOpenKillSID.get(id);

    const SID = this.GetRuntime().GetCurrentEvent().GetSID();

    if (killSID === SID) {
      this.rewardedADOpenKillSID.delete(id);
      return false;
    }

    if (killSID === Number.MAX_SAFE_INTEGER) {
      this.rewardedADOpenKillSID.set(id, SID);
    }

    return true;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  OnRewardedADRewarded(id) {
    const havekillSID = this.rewardedADRewardedKillSID.has(id);

    if (!havekillSID) return false;

    const killSID = this.rewardedADRewardedKillSID.get(id);

    const SID = this.GetRuntime().GetCurrentEvent().GetSID();

    if (killSID === SID) {
      this.rewardedADRewardedKillSID.delete(id);
      return false;
    }

    if (killSID === Number.MAX_SAFE_INTEGER) {
      this.rewardedADRewardedKillSID.set(id, SID);
    }

    return true;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  OnRewardedADClose(id) {
    const havekillSID = this.rewardedADCloseKillSID.has(id);

    if (!havekillSID) return false;

    const killSID = this.rewardedADCloseKillSID.get(id);

    const SID = this.GetRuntime().GetCurrentEvent().GetSID();

    if (killSID === SID) {
      this.rewardedADCloseKillSID.delete(id);
      return false;
    }

    if (killSID === Number.MAX_SAFE_INTEGER) {
      this.rewardedADCloseKillSID.set(id, SID);
    }

    return true;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  OnRewardedADError(id) {
    const havekillSID = this.rewardedADErrorKillSID.has(id);

    if (!havekillSID) return false;

    const killSID = this.rewardedADErrorKillSID.get(id);
    const error = this.rewardedADErrorError.get(id);

    const runtime = this.GetRuntime();
    const currentEvent = runtime.GetCurrentEvent();

    const SID = currentEvent.GetSID();

    if (killSID === SID) {
      this.rewardedADErrorKillSID.delete(id);
      this.rewardedADErrorError.delete(id);
      return false;
    }

    if (killSID === Number.MAX_SAFE_INTEGER) {
      this.rewardedADErrorKillSID.set(id, SID);
    }

    const condition = currentEvent
      .GetConditions()
      .find((cond) => cond._func === this.conditions.OnRewardedADError);

    condition.$error = error;

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
  ForEachLeaderboardEntry(leaderboardName, quantityTop, includeUser, quantityAround) {
    const runtime = this.GetRuntime();
    const eventSheetManager = runtime.GetEventSheetManager();
    const currentEvent = runtime.GetCurrentEvent();
    const solModifiers = currentEvent.GetSolModifiers();
    const eventStack = runtime.GetEventStack();

    this.PostToDOMAsync('ysdk-get-leaderboard-entries', {
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
    if (!this.forEachLeaderbordEntryLoopData) return '';
    const leaderboard = this.forEachLeaderbordEntryLoopData.entriesData.leaderboard;
    return leaderboard.description.invert_sort_order ? 'true' : 'false';
  },

  //#endregion

  //#region Payments

  /** @this {YandexGamesSDKInstance} */
  ForEachPurchase() {
    const runtime = this.GetRuntime();
    const eventSheetManager = runtime.GetEventSheetManager();
    const currentEvent = runtime.GetCurrentEvent();
    const solModifiers = currentEvent.GetSolModifiers();
    const eventStack = runtime.GetEventStack();

    this.PostToDOMAsync('ysdk-get-purchases').then(
      (/** @type {typeof this.forEachPurchaseLoopData.purchases} */ purchases) => {
        this.forEachPurchaseLoopData = {};
        this.forEachPurchaseLoopData.purchases = purchases;

        const oldFrame = eventStack.GetCurrentStackFrame();
        const newFrame = eventStack.Push(currentEvent);

        for (let i = 0; i < purchases.length; i++) {
          eventSheetManager.PushCopySol(solModifiers);

          this.forEachPurchaseLoopData.currentIndex = i;
          currentEvent.Retrigger(oldFrame, newFrame);

          eventSheetManager.PopSol(solModifiers);
        }

        eventStack.Pop();

        this.forEachPurchaseLoopData = null;
      },
    );

    return false;
  },

  /** @this {YandexGamesSDKInstance} */
  ForEachInCatalog() {
    const runtime = this.GetRuntime();
    const eventSheetManager = runtime.GetEventSheetManager();
    const currentEvent = runtime.GetCurrentEvent();
    const solModifiers = currentEvent.GetSolModifiers();
    const eventStack = runtime.GetEventStack();

    this.PostToDOMAsync('ysdk-get-catalog').then(
      (/** @type {typeof this.forEachInCatalogLoopData.catalog} */ catalog) => {
        this.forEachInCatalogLoopData = {};
        this.forEachInCatalogLoopData.catalog = catalog;

        const oldFrame = eventStack.GetCurrentStackFrame();
        const newFrame = eventStack.Push(currentEvent);

        for (let i = 0; i < catalog.length; i++) {
          eventSheetManager.PushCopySol(solModifiers);

          this.forEachInCatalogLoopData.currentIndex = i;
          currentEvent.Retrigger(oldFrame, newFrame);

          eventSheetManager.PopSol(solModifiers);
        }

        eventStack.Pop();

        this.forEachInCatalogLoopData = null;
      },
    );

    return false;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} productID
   */
  OnPurchaseSuccess(productID) {
    const havekillSID = this.purchaseSuccessTriggerPool.has(productID);

    if (!havekillSID) return false;

    const triggerData = this.purchaseSuccessTriggerPool.get(productID);
    const killSID = triggerData.killSID;

    const runtime = this.GetRuntime();
    const currentEvent = runtime.GetCurrentEvent();

    const SID = currentEvent.GetSID();

    if (killSID === SID) {
      this.purchaseSuccessTriggerPool.delete(productID);
      this.purchaseSuccessTriggerEmitted = undefined;
      return false;
    }

    if (killSID === Number.MAX_SAFE_INTEGER) {
      triggerData.killSID = SID;
    }

    this.purchaseSuccessTriggerEmitted = triggerData;

    return true;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} productID
   */
  OnPurchaseFailure(productID) {
    const havekillSID = this.purchaseFailureTriggerPool.has(productID);

    if (!havekillSID) return false;

    const triggerData = this.purchaseFailureTriggerPool.get(productID);
    const killSID = triggerData.killSID;

    const runtime = this.GetRuntime();
    const currentEvent = runtime.GetCurrentEvent();

    const SID = currentEvent.GetSID();

    if (killSID === SID) {
      this.purchaseFailureTriggerPool.delete(productID);
      this.purchaseFailureTriggerEmitted = undefined;
      return false;
    }

    if (killSID === Number.MAX_SAFE_INTEGER) {
      triggerData.killSID = SID;
    }

    this.purchaseFailureTriggerEmitted = triggerData;

    return true;
  },

  //#endregion

  //#region Player

  /**
   * @this {YandexGamesSDKInstance}
   * @param {boolean} requestAuthorization
   */
  ForPlayerInfo(requestAuthorization) {
    const runtime = this.GetRuntime();
    const eventSheetManager = runtime.GetEventSheetManager();
    const currentEvent = runtime.GetCurrentEvent();
    const solModifiers = currentEvent.GetSolModifiers();
    const eventStack = runtime.GetEventStack();

    this.PostToDOMAsync('ysdk-get-player', {
      requestAuthorization,
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

  /** @this {YandexGamesSDKInstance} */
  CurrentPlayerInfoAccessGranted() {
    if (this.forPlayerInfo) {
      return !!this.forPlayerInfo.isAccessGranted;
    } else {
      return false;
    }
  },

  //#endregion

  //#region Events

  /** @this {YandexGamesSDKInstance} */
  OnHistoryBackEvent() {
    return true;
  },

  //#endregion

  //#region Shortcut

  /** @this {YandexGamesSDKInstance} */
  ShortcutCanShowPrompt() {
    return this.canShowShortcutPrompt;
  },

  /** @this {YandexGamesSDKInstance} */
  OnShortcutAdded() {
    return true;
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
      }, seconds * 1000),
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
      }, seconds * 1000),
    );

    return false;
  },

  //#endregion

  //#region Remote Config

  /** @this {YandexGamesSDKInstance} */
  OnRemoteConfigReady() {
    return true;
  },

  //#endregion

  //#region TV

  /**
   * @this {YandexGamesSDKInstance}
   * @param {"up"|"down"|"left"|"right"|"ok"} type
   */
  IsTVRemoteButtonPressed(type) {
    return this._tvButtons[type];
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {"up"|"down"|"left"|"right"|"ok"} type
   */
  OnTVRemoteButtonPress(type) {
    return true;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {"up"|"down"|"left"|"right"|"ok"} type
   */
  OnTVRemoteButtonRelease(type) {
    return true;
  },

  //#endregion
};

self.C3.Plugins.yagames_sdk.Cnds = Conditions;
