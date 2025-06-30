function each(runtime, array = [], callback) {
    const loopCtx = runtime.sdk.createLoopingConditionContext();

    for (let i = 0; i < array.length; i++) {
        callback(i);
        loopCtx.retrigger();

        if (loopCtx.isStopped) {
            break;
        }
    }

    loopCtx.release();
}

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
        return globalThis.C3.equalsNoCase(this.currentRewardedID, id);
    },

    /**
     * @this {YandexGamesSDKInstance}
     * @param {string} id
     */
    OnRewardedADRewarded(id) {
        return globalThis.C3.equalsNoCase(this.currentRewardedID, id);
    },

    /**
     * @this {YandexGamesSDKInstance}
     * @param {string} id
     */
    OnRewardedADClose(id) {
        return globalThis.C3.equalsNoCase(this.currentRewardedID, id);
    },

    /**
     * @this {YandexGamesSDKInstance}
     * @param {string} id
     */
    OnRewardedADError(id) {
        return globalThis.C3.equalsNoCase(this.currentRewardedID, id);
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

    /** @this {YandexGamesSDKInstance} */
    OnLeaderboardFetchSuccess(leaderboardName, quantityTop, includeUser, quantityAround) {
        return (
            this.currentLeaderboardName === leaderboardName &&
            this.currentQuantityTop === quantityTop &&
            this.currentIncludeUser === includeUser &&
            this.currentQuantityAround === quantityAround
        );
    },

    /** @this {YandexGamesSDKInstance} */
    OnLeaderboardFetchError(leaderboardName, quantityTop, includeUser, quantityAround) {
        return (
            this.currentLeaderboardName === leaderboardName &&
            this.currentQuantityTop === quantityTop &&
            this.currentIncludeUser === includeUser &&
            this.currentQuantityAround === quantityAround
        );
    },

    /** @this {YandexGamesSDKInstance} */
    ForEachInLeaderboard() {
        const loopData = this.forEachLeaderboardEntryLoopData.entriesData.entries || [];

        each(this.runtime, loopData, i => (this.forEachLeaderboardEntryLoopData.currentIndex = i));

        return false;
    },

    /** @this {YandexGamesSDKInstance} */
    CurrentLeaderboardDescriptionInvertOrder() {
        if (!this.forEachLeaderboardEntryLoopData) {
            this.logDeveloperMistake(
                `You are trying to use "Invert order of leaderboard" condition outside of "For each player in leaderboard" loop!`
            );
            return '';
        }
        const leaderboard = this.forEachLeaderboardEntryLoopData.entriesData.leaderboard;
        return leaderboard.description.invert_sort_order;
    },

    //#endregion

    //#region Payments

    OnCatalogFetchSuccess() {
        return true;
    },

    OnCatalogFetchError() {
        return true;
    },

    /** @this {YandexGamesSDKInstance} */
    ForEachInCatalog() {
        const loopData = this.currentCatalogLoopData.catalog || [];

        each(this.runtime, loopData, i => (this.currentCatalogLoopData.currentIndex = i));

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

    OnPurchasesFetchSuccess() {
        return true;
    },

    OnPurchasesFetchError() {
        return true;
    },

    /** @this {YandexGamesSDKInstance} */
    ForEachPurchase() {
        const loopData = this.currentPurchasesLoopData.purchases || [];

        each(this.runtime, loopData, i => (this.currentPurchasesLoopData.currentIndex = i));

        return false;
    },

    /**
     * @this {YandexGamesSDKInstance}
     * @param {string} purchaseID
     */
    OnSpecificPurchaseSuccess(purchaseID) {
        return globalThis.C3.equalsNoCase(this.currentPurchaseData?.productID, purchaseID);
    },

    /**
     * @this {YandexGamesSDKInstance}
     * @param {string} purchaseID
     */
    OnSpecificPurchaseError(purchaseID) {
        return globalThis.C3.equalsNoCase(this.currentPurchaseData?.productID, purchaseID);
    },

    //#endregion

    //#region Player

    OnPlayerInfoFetchSuccess() {
        return true;
    },

    OnPlayerInfoFetchError() {
        return true;
    },

    /** @this {YandexGamesSDKInstance} */
    CurrentPlayerIsAuthorized() {
        if (this.playerInfo) {
            return !!this.playerInfo.isAuthorized;
        } else {
            this.logDeveloperMistake(
                `You are trying to use "Player is authorized" condition outside of "Using player info" condition!`
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
                `You are trying to use "Player info access granted" condition outside of "Using player info" condition!`
            );
            return false;
        }
    },

    /**
     * @this {YandexGamesSDKInstance}
     * @param {string} value
     */
    CurrentPlayerPayingStatusCheck(value) {
        if (this.playerInfo) {
            return this.playerInfo.payingStatus === value;
        } else {
            this.logDeveloperMistake(
                `You are trying to use "Player paying status is" condition outside of "Using player info" condition!`
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

    /**
     * @this {YandexGamesSDKInstance}
     */
    OnGameAPIPause() {
        return true;
    },

    /**
     * @this {YandexGamesSDKInstance}
     */
    OnGameAPIResume() {
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
    ThrottleNew(id, seconds) {
        const currentTime = Date.now();
        const lastCall = this.throttleTimers.get(id);

        if (lastCall === undefined || currentTime - lastCall > seconds * 1000) {
            this.throttleTimers.set(id, currentTime);
            return true;
        }

        return false;
    },

    /**
     * @this {YandexGamesSDKInstance}
     * @param {string} id
     */
    DebounceEnd(id) {
        return this.currentDebounce === id;
    },

    //#endregion

    //#region Remote Config

    /** @this {YandexGamesSDKInstance} */
    OnRemoteConfigFetchSuccess() {
        return true;
    },

    OnRemoteConfigFetchError() {
        return true;
    },

    //#endregion

    //#region GamesAPI

    OnAllGamesFetchSuccess() {
        return true;
    },

    OnAllGamesFetchError() {
        return true;
    },

    /** @this {YandexGamesSDKInstance} */
    ForEachGame() {
        const loopData = this.currentGamesLoopData.games || [];

        each(this.runtime, loopData, i => (this.currentGamesLoopData.currentIndex = i));

        return false;
    },

    OnGameByIDFetchSuccess(id) {
        return id === this.currentGameByID;
    },

    OnGameByIDFetchError(id) {
        return id === this.currentGameByID;
    },

    /** @this {YandexGamesSDKInstance} */
    IsCurrentGameAvailable() {
        return this.currentGameByID?.isAvailable ?? false;
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

    /** @deprecated */
    ForEachLeaderboardEntry(leaderboardName, quantityTop, includeUser, quantityAround) {
        return false;
    },

    /** @deprecated */
    WithPlayerInfo(requestPersonalInfo) {
        return false;
    },

    /** @deprecated */
    OnRemoteConfigReady() {
        return false;
    },

    /** @deprecated */
    GetAllGames() {
        return false;
    },

    /** @deprecated */
    GetGameByID(id) {
        return false;
    },

    /** @deprecated */
    AllGamesReady() {
        return false;
    },

    /** @deprecated */
    Throttle(seconds) {
        return false;
    },

    /** @deprecated */
    Debounce(seconds) {
        return false;
    },
};

globalThis.C3.Plugins.yagames_sdk.Cnds = Conditions;
