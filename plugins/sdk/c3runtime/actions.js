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
        this._postToDOM('ysdk-show-fullscreen-ad');
    },

    //#endregion

    //#region Rewarded AD

    /**
     * @this {YandexGamesSDKInstance}
     * @param {string} id
     */
    ShowRewardedAD(id) {
        this._postToDOM('ysdk-show-rewarded-ad', { id: id });
    },

    //#endregion

    //#region Sticky Banner

    ShowStickyBanner() {
        this._postToDOM('ysdk-show-sticky-banner');
    },

    HideStickyBanner() {
        this._postToDOM('ysdk-hide-sticky-banner');
    },

    //#endregion

    //#region Payments

    /** @this {YandexGamesSDKInstance} */
    PurchasesFetch() {
        return this._postToDOMAsync('ysdk-get-purchases')
            .then(purchases => {
                if (purchases) {
                    this.currentPurchasesLoopData = { purchases };

                    this._trigger(this.conditions.OnPurchasesFetchSuccess);
                    return;
                }
                this._trigger(this.conditions.OnPurchasesFetchError);
            })
            .catch(() => {
                this._trigger(this.conditions.OnPurchasesFetchError);
            });
    },

    /** @this {YandexGamesSDKInstance} */
    CatalogFetch() {
        return this._postToDOMAsync('ysdk-get-catalog')
            .then(catalog => {
                if (catalog) {
                    this.currentCatalogLoopData = { catalog };

                    this._trigger(this.conditions.OnCatalogFetchSuccess);
                    return;
                }
                this._trigger(this.conditions.OnCatalogFetchError);
            })
            .catch(() => {
                this._trigger(this.conditions.OnCatalogFetchError);
            });
    },

    /**
     * @this {YandexGamesSDKInstance}
     * @param {string} productID
     * @param {string} developerPayload
     */
    Purchase(productID, developerPayload) {
        this._postToDOM('ysdk-purchase', { productID: productID, developerPayload: developerPayload });
    },

    /**
     * @this {YandexGamesSDKInstance}
     * @param {string} purchaseToken
     */
    async ConsumePurchase(purchaseToken) {
        await this._postToDOMAsync('ysdk-consume-purchase', { purchaseToken: purchaseToken });
    },

    //#endregion

    //#region Player

    /**
     * @this {YandexGamesSDKInstance}
     * @param {boolean} requestPersonalInfo
     */
    PlayerInfoFetch(requestPersonalInfo) {
        return this._postToDOMAsync('ysdk-get-player', {
            requestPersonalInfo: requestPersonalInfo,
        })
            .then(playerInfo => {
                if (playerInfo) {
                    this.playerInfo = playerInfo;
                    this._trigger(this.conditions.OnPlayerInfoFetchSuccess);

                    return;
                }

                this._trigger(this.conditions.OnPlayerInfoFetchError);
            })
            .catch(() => {
                this._trigger(this.conditions.OnPlayerInfoFetchError);
            });
    },

    /** @this {YandexGamesSDKInstance} */
    async PlayerGetData(jsonObject, keysString) {
        const instance = jsonObject.getFirstInstance();
        const keys = keysString ? keysString.split(',').map(key => key.trim()) : undefined;
        const data = await this._postToDOMAsync('ysdk-get-player-data', keys);
        instance.setJsonDataCopy(data);
    },

    /** @this {YandexGamesSDKInstance} */
    async PlayerGetStats(jsonObject) {
        const instance = jsonObject.getFirstInstance();
        const stats = await this._postToDOMAsync('ysdk-get-player-stats');
        instance.setJsonDataCopy(stats);
    },

    /** @this {YandexGamesSDKInstance} */
    async PlayerSetData(jsonObject, flush) {
        const instance = jsonObject.getFirstInstance();
        await this._postToDOMAsync('ysdk-set-player-data', {
            data: instance.getJsonDataCopy(),
            flush: flush,
        });
    },

    /** @this {YandexGamesSDKInstance} */
    async PlayerSetStats(jsonObject) {
        const instance = jsonObject.getFirstInstance();
        await this._postToDOMAsync('ysdk-set-player-stats', instance.getJsonDataCopy());
    },

    /** @this {YandexGamesSDKInstance} */
    async PlayerIncrementStats(jsonObject) {
        const instance = jsonObject.getFirstInstance();
        await this._postToDOMAsync('ysdk-increment-player-stats', instance.getJsonDataCopy());
    },

    //#endregion

    //#region Leaderboards

    /** @this {YandexGamesSDKInstance} */
    SetLeaderboardScore(leaderboardName, score, extraData) {
        this._postToDOM('ysdk-set-leaderboard-score', {
            leaderboardName: leaderboardName,
            score: score,
            extraData: extraData,
        });
    },

    /**
     * @this {YandexGamesSDKInstance}
     * @param {string} leaderboardName
     * @param {number} quantityTop
     * @param {boolean} includeUser
     * @param {number} quantityAround
     */
    LeaderboardFetch(leaderboardName, quantityTop, includeUser, quantityAround) {
        return this._postToDOMAsync('ysdk-get-leaderboard-entries', {
            leaderboardName: leaderboardName,
            options: {
                quantityTop: quantityTop,
                includeUser: includeUser,
                quantityAround: quantityAround,
            },
        })
            .then(entriesData => {
                this.currentLeaderboardName = leaderboardName;
                this.currentQuantityTop = quantityTop;
                this.currentQuantityAround = quantityAround;
                this.currentIncludeUser = includeUser;

                if (entriesData) {
                    this.forEachLeaderboardEntryLoopData = { entriesData };
                    this._trigger(this.conditions.OnLeaderboardFetchSuccess);

                    return;
                }

                this._trigger(this.conditions.OnLeaderboardFetchError);
            })
            .catch(() => {
                this.currentLeaderboardName = leaderboardName;
                this.currentQuantityTop = quantityTop;
                this.currentQuantityAround = quantityAround;
                this.currentIncludeUser = includeUser;

                this._trigger(this.conditions.OnLeaderboardFetchError);
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
        this._postToDOM('ysdk-dispatch-event', { name: name });
    },

    //#endregion

    //#region Shortcut

    /** @this {YandexGamesSDKInstance} */
    ShortcutShowPrompt() {
        return this._postToDOM('ysdk-shortcuts-show-prompt');
    },

    //#endregion

    //#region Review

    /** @this {YandexGamesSDKInstance} */
    RequestReview() {
        this._postToDOMAsync('ysdk-request-review').then(props => {
            if (props.feedbackSent) {
                this._trigger(this.conditions.OnReviewSuccess);
            } else {
                this._trigger(this.conditions.OnReviewCancel);
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
        this._postToDOM('ysdk-loading-api-ready');
    },

    /** @this {YandexGamesSDKInstance} */
    GameplayAPIStart() {
        this._postToDOM('ysdk-gameplay-api-start');
    },

    /** @this {YandexGamesSDKInstance} */
    GameplayAPIStop() {
        this._postToDOM('ysdk-gameplay-api-stop');
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
        return this._postToDOMAsync('ysdk-remote-config-fetch', {
            defaultFlags: this.defaultFlags,
            clientFeatures: this.clientFeatures,
        })
            .then(flags => {
                this.flags = flags;
                this.defaultFlags = {};
                this.clientFeatures = [];

                this._trigger(this.conditions.OnRemoteConfigFetchSuccess);
            })
            .catch(() => {
                this._trigger(this.conditions.OnRemoteConfigFetchError);
            });
    },

    //#endregion

    //#region Debounce

    /** @this {YandexGamesSDKInstance} */
    Debounce(id, seconds) {
        if (this.debounceTimers.has(id)) {
            clearTimeout(this.debounceTimers.get(id));
            this.debounceTimers.delete(id);
        }

        this.debounceTimers.set(
            id,
            setTimeout(() => {
                this.currentDebounce = id;
                this._trigger(this.conditions.DebounceEnd);
                this.debounceTimers.delete(id);
            }, seconds * 1000)
        );
    },

    //#endregion

    //#region GamesAPI

    /** @this {YandexGamesSDKInstance} */
    AllGamesFetch() {
        return this._postToDOMAsync('ysdk-get-all-games')
            .then(games => {
                if (games) {
                    this.currentGamesLoopData = { games };
                    this._trigger(this.conditions.OnAllGamesFetchSuccess);

                    return;
                }

                this._trigger(this.conditions.OnAllGamesFetchError);
            })
            .catch(() => {
                this._trigger(this.conditions.OnAllGamesFetchError);
            });
    },

    /**
     * @this {YandexGamesSDKInstance}
     * @param {number} id
     */
    GameByIDFetch(id) {
        return this._postToDOMAsync('ysdk-get-game-by-id', { id: id })
            .then(gameData => {
                if (gameData) {
                    this.currentGameByID = gameData;
                    this._trigger(this.conditions.OnGameByIDFetchSuccess);
                    return;
                }

                this._trigger(this.conditions.OnGameByIDFetchError);
            })
            .catch(() => {
                this._trigger(this.conditions.OnGameByIDFetchError);
            });
    },

    //#endregion

    ReachGoal(target, goalData) {
        const instance = goalData?.getFirstInstance();
        const data = instance?.getJsonDataCopy() || {};
        this._postToDOM('ysdk-reach-goal', {
            target,
            goalData: data,
        });
    },
};

globalThis.C3.Plugins.yagames_sdk.Acts = Actions;
