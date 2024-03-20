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

  /** @this {YandexGamesSDKInstance} */
  OnFullscreenADClose() {
    return true;
  },

  /** @this {YandexGamesSDKInstance} */
  FullscreenADWasShown() {
    return this.fullscreenADWasShown;
  },

  /** @this {YandexGamesSDKInstance} */
  OnFullscreenADOpen() {
    return true;
  },

  /** @this {YandexGamesSDKInstance} */
  OnFullscreenADError() {
    return true;
  },

  /** @this {YandexGamesSDKInstance} */
  OnFullscreenADOffline() {
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

  /** @this {YandexGamesSDKInstance} */
  OnAnyRewardedADOpen() {
    return true;
  },

  /** @this {YandexGamesSDKInstance} */
  OnAnyRewardedADClose() {
    return true;
  },

  /** @this {YandexGamesSDKInstance} */
  OnAnyRewardedADError() {
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
    }).then((/** @type {typeof this.forEachLeaderbordEntryLoopData.entriesData} */ entriesData) => {
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

      this.forEachLeaderbordEntryLoopData = undefined;
    });

    return false;
  },

  /** @this {YandexGamesSDKInstance} */
  CurrentLeaderboardDescriptionInvertOrder() {
    if (!this.forEachLeaderbordEntryLoopData) {
      this.logDeveloperMistake(
        `You are trying to use "Invert order of leaderboard" expression outside of "For each player in leaderboard" loop!`,
      );
      return '';
    }
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

  /** @this {YandexGamesSDKInstance} */
  OnPurchaseSuccess() {
    return true;
  },

  /** @this {YandexGamesSDKInstance} */
  OnPurchaseError() {
    return true;
  },

  /** 
   * @this {YandexGamesSDKInstance}
   * @param {string} purchaseID 
   */
  OnSpecificPurchaseSuccess(purchaseID) {
    const havekillSID = this.purchaseSuccessKillSID.has(id);

    if (!havekillSID) return false;

    const killSID = this.purchaseSuccessKillSID.get(id);

    const SID = this.GetRuntime().GetCurrentEvent().GetSID();

    if (killSID === SID) {
      this.purchaseSuccessKillSID.delete(id);
      return false;
    }

    if (killSID === Number.MAX_SAFE_INTEGER) {
      this.purchaseSuccessKillSID.set(id, SID);
    }

    return true;
  },

  /** 
   * @this {YandexGamesSDKInstance}
   * @param {string} purchaseID 
   */
  OnSpecificPurchaseError(purchaseID) {
    const havekillSID = this.purchaseErrorKillSID.has(id);

    if (!havekillSID) return false;

    const killSID = this.purchaseErrorKillSID.get(id);

    const SID = this.GetRuntime().GetCurrentEvent().GetSID();

    if (killSID === SID) {
      this.purchaseErrorKillSID.delete(id);
      return false;
    }

    if (killSID === Number.MAX_SAFE_INTEGER) {
      this.purchaseErrorKillSID.set(id, SID);
    }

    return true;
  },

  //#endregion

  //#region Player

  /**
   * @this {YandexGamesSDKInstance}
   * @param {boolean} requestPersonalInfo
   */
  WithPlayerInfo(requestPersonalInfo) {
    const runtime = this.GetRuntime();
    const eventSheetManager = runtime.GetEventSheetManager();
    const currentEvent = runtime.GetCurrentEvent();
    const solModifiers = currentEvent.GetSolModifiers();
    const eventStack = runtime.GetEventStack();

    this.PostToDOMAsync('ysdk-get-player', {
      requestPersonalInfo,
    }).then((playerInfo) => {
      this.playerInfo = playerInfo;

      const oldFrame = eventStack.GetCurrentStackFrame();
      const newFrame = eventStack.Push(currentEvent);
      eventSheetManager.PushCopySol(solModifiers);
      currentEvent.Retrigger(oldFrame, newFrame);
      eventSheetManager.PopSol(solModifiers);
      eventStack.Pop();

      this.playerInfo = undefined;
    });

    return false;
  },

  /** @this {YandexGamesSDKInstance} */
  CurrentPlayerIsAuthorized() {
    if (this.playerInfo) {
      return !!this.playerInfo.isAuthorized;
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Player is authorized" expression outside of "Using player info" condition!`,
      );
      return false;
    }
  },

  /** @this {YandexGamesSDKInstance} */
  CurrentPlayerInfoAccessGranted() {
    if (this.playerInfo) {
      return !!this.playerInfo.isAccessGranted;
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Player info access granted" expression outside of "Using player info" condition!`,
      );
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
   * @param {0|1|2|3|4} type
   */
  OnTVRemoteButtonPress(type) {
    console.log(type);
    return this._triggerButton === type;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {0|1|2|3|4} type
   */
  OnTVRemoteButtonRelease(type) {
    return this._triggerButton === type;
  },

  //#endregion
};

self.C3.Plugins.yagames_sdk.Cnds = Conditions;
