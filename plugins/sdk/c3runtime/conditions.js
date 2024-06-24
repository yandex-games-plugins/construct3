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
    return self.C3.equalsNoCase(this.currentRewardedID, id);
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  OnRewardedADRewarded(id) {
    return self.C3.equalsNoCase(this.currentRewardedID, id);
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  OnRewardedADClose(id) {
    return self.C3.equalsNoCase(this.currentRewardedID, id);
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  OnRewardedADError(id) {
    return self.C3.equalsNoCase(this.currentRewardedID, id);
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
    const oldFrame = eventStack.GetCurrentStackFrame();
    const isSolModifierAfterCnds = oldFrame.IsSolModifierAfterCnds();

    this.PostToDOMAsync('ysdk-get-leaderboard-entries', {
      ['leaderboardName']: leaderboardName,
      ['options']: {
        ['quantityTop']: quantityTop,
        ['includeUser']: includeUser,
        ['quantityAround']: quantityAround,
      },
    }).then((/** @type {typeof this.forEachLeaderbordEntryLoopData["entriesData"]} */ entriesData) => {
      if (!entriesData) return;
      this.forEachLeaderbordEntryLoopData = {};
      this.forEachLeaderbordEntryLoopData['entriesData'] = entriesData;

      const newFrame = eventStack.Push(currentEvent);
      const loopStack = eventSheetManager.GetLoopStack();
      const loop = loopStack.Push();
      loop.SetEnd(entriesData['entries'].length);

      if (isSolModifierAfterCnds) {
        for (let i = 0; i < entriesData['entries'].length; i++) {
          eventSheetManager.PushCopySol(solModifiers);
          loop.SetIndex(i);
          this.forEachLeaderbordEntryLoopData['currentIndex'] = i;
          currentEvent.Retrigger(oldFrame, newFrame);
          eventSheetManager.PopSol(solModifiers);
        }
      } else {
        for (let i = 0; i < entriesData['entries'].length; i++) {
          loop.SetIndex(i);
          this.forEachLeaderbordEntryLoopData['currentIndex'] = i;
          currentEvent.Retrigger(oldFrame, newFrame);
        }
      }

      eventStack.Pop();
      loopStack.Pop();

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
    const leaderboard = this.forEachLeaderbordEntryLoopData['entriesData']['leaderboard'];
    return leaderboard['description']['invert_sort_order'] ? 'true' : 'false';
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
    const oldFrame = eventStack.GetCurrentStackFrame();
    const isSolModifierAfterCnds = oldFrame.IsSolModifierAfterCnds();

    this.PostToDOMAsync('ysdk-get-purchases').then(
      (/** @type {typeof this.currentPurchasesLoopData["purchases"]} */ purchases) => {
        if (!purchases) return;
        this.currentPurchasesLoopData = {};
        this.currentPurchasesLoopData['purchases'] = purchases;

        const newFrame = eventStack.Push(currentEvent);
        const loopStack = eventSheetManager.GetLoopStack();
        const loop = loopStack.Push();
        loop.SetEnd(purchases.length);

        if (isSolModifierAfterCnds) {
          for (let i = 0; i < purchases.length; i++) {
            eventSheetManager.PushCopySol(solModifiers);
            this.currentPurchasesLoopData['currentIndex'] = i;
            loop.SetIndex(i);
            currentEvent.Retrigger(oldFrame, newFrame);
            eventSheetManager.PopSol(solModifiers);
          }
        } else {
          for (let i = 0; i < purchases.length; i++) {
            this.currentPurchasesLoopData['currentIndex'] = i;
            loop.SetIndex(i);
            currentEvent.Retrigger(oldFrame, newFrame);
          }
        }

        eventStack.Pop();
        loopStack.Pop();

        this.currentPurchasesLoopData = null;
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
    const oldFrame = eventStack.GetCurrentStackFrame();
    const isSolModifierAfterCnds = oldFrame.IsSolModifierAfterCnds();

    this.PostToDOMAsync('ysdk-get-catalog').then(
      (/** @type {typeof this.currentCatalogLoopData["catalog"]} */ catalog) => {
        if (!catalog) return;
        this.currentCatalogLoopData = {};
        this.currentCatalogLoopData['catalog'] = catalog;

        const newFrame = eventStack.Push(currentEvent);
        const loopStack = eventSheetManager.GetLoopStack();
        const loop = loopStack.Push();
        loop.SetEnd(catalog.length);

        if (isSolModifierAfterCnds) {
          for (let i = 0; i < catalog.length; i++) {
            eventSheetManager.PushCopySol(solModifiers);
            loop.SetIndex(i);
            this.currentCatalogLoopData['currentIndex'] = i;
            currentEvent.Retrigger(oldFrame, newFrame);
            eventSheetManager.PopSol(solModifiers);
          }
        } else {
          for (let i = 0; i < catalog.length; i++) {
            loop.SetIndex(i);
            this.currentCatalogLoopData['currentIndex'] = i;
            currentEvent.Retrigger(oldFrame, newFrame);
          }
        }

        eventStack.Pop();
        loopStack.Pop();

        this.currentCatalogLoopData = null;
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
    return self.C3.equalsNoCase(this.currentPurchaseData?.['productID'], purchaseID);
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} purchaseID
   */
  OnSpecificPurchaseError(purchaseID) {
    return self.C3.equalsNoCase(this.currentPurchaseData?.['productID'], purchaseID);
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
    const oldFrame = eventStack.GetCurrentStackFrame();
    const isSolModifierAfterCnds = oldFrame.IsSolModifierAfterCnds();

    this.PostToDOMAsync('ysdk-get-player', {
      ['requestPersonalInfo']: requestPersonalInfo,
    }).then((playerInfo) => {
      if (!playerInfo) return;
      this.playerInfo = playerInfo;

      const newFrame = eventStack.Push(currentEvent);
      if (isSolModifierAfterCnds) {
        eventSheetManager.PushCopySol(solModifiers);
        currentEvent.Retrigger(oldFrame, newFrame);
        eventSheetManager.PopSol(solModifiers);
      } else {
        currentEvent.Retrigger(oldFrame, newFrame);
      }
      eventStack.Pop();

      this.playerInfo = undefined;
    });

    return false;
  },

  /** @this {YandexGamesSDKInstance} */
  CurrentPlayerIsAuthorized() {
    if (this.playerInfo) {
      return !!this.playerInfo['isAuthorized'];
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
      return !!this.playerInfo['isAccessGranted'];
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

  //#region Review

  /** @this {YandexGamesSDKInstance} */
  CanReview() {
    return this.canReview;
  },

  /** @this {YandexGamesSDKInstance} */
  OnReviewSuccess() {
    return true;
  },

  /** @this {YandexGamesSDKInstance} */
  OnReviewCancel() {
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

    if (this.throttleTimers.has(currentEvent)) {
      return false;
    }

    const solModifiers = currentEvent.GetSolModifiers();
    const eventStack = runtime.GetEventStack();
    const oldFrame = eventStack.GetCurrentStackFrame();
    const isSolModifierAfterCnds = oldFrame.IsSolModifierAfterCnds();

    const newFrame = eventStack.Push(currentEvent);

    if (isSolModifierAfterCnds) {
      eventSheetManager.PushCopySol(solModifiers);
      currentEvent.Retrigger(oldFrame, newFrame);
      eventSheetManager.PopSol(solModifiers);
    } else {
      currentEvent.Retrigger(oldFrame, newFrame);
    }

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
