/** @class */
const Expressions = {
    //#region Localization

    /** @this {YandexGamesSDKInstance} */
    LocalizationLanguage() {
        return this.localization.currentLanguage ?? '';
    },

    /**
     * @deprecated
     * @this {YandexGamesSDKInstance}
     */
    CurrentLanguage() {
        return this.localization.currentLanguage ?? '';
    },

    /** @this {YandexGamesSDKInstance} */
    LocalizationValue(path) {
        return this.localization.GetValue(path) ?? '';
    },

    //#endregion

    //#region Fullscreen AD

    /** @this {YandexGamesSDKInstance} */
    FullscreenADError() {
        return this.fullscreenADError || '';
    },

    //#endregion

    //#region Rewarded AD

    /** @this {YandexGamesSDKInstance} */
    RewardedADError() {
        return this.currentRewardedError || '';
    },

    //#endregion

    //#region Leaderboards

    /** @this {YandexGamesSDKInstance} */
    GetCurrentLeaderboardEntryRank() {
        if (!this.forEachLeaderboardEntryLoopData) {
            this.logDeveloperMistake(
                `You are trying to use "Player position in leaderboard" expression outside of "For each player in leaderboard" loop!`
            );
            return -1;
        }
        const loopData = this.forEachLeaderboardEntryLoopData;
        const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
        return currentEntry.rank;
    },

    /** @this {YandexGamesSDKInstance} */
    GetCurrentLeaderboardEntryScore() {
        if (!this.forEachLeaderboardEntryLoopData) {
            this.logDeveloperMistake(
                `You are trying to use "Player score in leaderboard" expression outside of "For each player in leaderboard" loop!`
            );
            return -1;
        }
        const loopData = this.forEachLeaderboardEntryLoopData;
        const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
        return currentEntry.score;
    },

    /** @this {YandexGamesSDKInstance} */
    GetCurrentLeaderboardEntryExtraData() {
        if (!this.forEachLeaderboardEntryLoopData) {
            this.logDeveloperMistake(
                `You are trying to use "Player extra data in leaderboard" expression outside of "For each player in leaderboard" loop!`
            );
            return '';
        }
        const loopData = this.forEachLeaderboardEntryLoopData;
        const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
        return currentEntry.extraData || '';
    },

    /** @this {YandexGamesSDKInstance} */
    GetCurrentLeaderboardEntryRangeIndex() {
        if (!this.forEachLeaderboardEntryLoopData) {
            this.logDeveloperMistake(
                `You are trying to use "Range index of requested leaderboard" expression outside of "For each player in leaderboard" loop!`
            );
            return 0;
        }
        const loopData = this.forEachLeaderboardEntryLoopData;

        for (let entriesAmount = 0, i = 0; i < loopData.entriesData.ranges.length; i++) {
            entriesAmount += loopData.entriesData.ranges[i].size;
            if (loopData.currentIndex < entriesAmount) {
                return i;
            }
        }

        return 0;
    },

    /** @this {YandexGamesSDKInstance} */
    GetCurrentLeaderboardDescriptionName() {
        if (!this.forEachLeaderboardEntryLoopData) {
            this.logDeveloperMistake(
                `You are trying to use "Leaderboard name" expression outside of "For each player in leaderboard" loop!`
            );
            return '';
        }
        const leaderboard = this.forEachLeaderboardEntryLoopData.entriesData.leaderboard;
        return leaderboard.name || '';
    },

    /** @this {YandexGamesSDKInstance} */
    GetCurrentLeaderboardDescriptionType() {
        if (!this.forEachLeaderboardEntryLoopData) {
            this.logDeveloperMistake(
                `You are trying to use "Leaderboard type" expression outside of "For each player in leaderboard" loop!`
            );
            return '';
        }
        const loopData = this.forEachLeaderboardEntryLoopData;
        const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
        return currentEntry.extraData || '';
    },

    /** @this {YandexGamesSDKInstance} */
    GetCurrentLeaderboardDescriptionTitle() {
        if (!this.forEachLeaderboardEntryLoopData) {
            this.logDeveloperMistake(
                `You are trying to use "Leaderboard title" expression outside of "For each player in leaderboard" loop!`
            );
            return '';
        }
        const loopData = this.forEachLeaderboardEntryLoopData;
        const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
        return currentEntry.extraData || '';
    },

    /** @this {YandexGamesSDKInstance} */
    GetCurrentLeaderboardDescriptionDecimalOffset() {
        if (!this.forEachLeaderboardEntryLoopData) {
            this.logDeveloperMistake(
                `You are trying to use "Leaderboard decimal offset" expression outside of "For each player in leaderboard" loop!`
            );
            return '';
        }
        const loopData = this.forEachLeaderboardEntryLoopData;
        const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
        return currentEntry.extraData || '';
    },

    //#endregion

    //#region Payments

    /** @this {YandexGamesSDKInstance} */
    PurchaseToken() {
        if (this.currentPurchaseData) {
            return this.currentPurchaseData.purchaseToken;
        }

        this.logDeveloperMistake(
            'You are trying to use "Purchase Token" expression outside of "On purchase success" or "On specific purchase success" triggers'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    CurrentPurchaseToken() {
        if (this.currentPurchasesLoopData) {
            const loopData = this.currentPurchasesLoopData;
            const purchaseEntry = loopData.purchases[loopData.currentIndex];

            return purchaseEntry.purchaseToken;
        }

        this.logDeveloperMistake(
            'You are trying to use "Current Purchase Token" expression outside of "For each purchase" loop'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    PurchaseDeveloperPayload() {
        if (this.currentPurchaseData) {
            return this.currentPurchaseData.developerPayload;
        }

        this.logDeveloperMistake(
            'You are trying to use "Purchase developer payload" expression outside of "On purchase success" or "On specific purchase success" triggers'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    CurrentPurchaseDeveloperPayload() {
        if (this.currentPurchasesLoopData) {
            const loopData = this.currentPurchasesLoopData;
            const purchaseEntry = loopData.purchases[loopData.currentIndex];

            return purchaseEntry.developerPayload;
        }

        this.logDeveloperMistake(
            'You are trying to use "Current purchase developer payload" expression outside of "For each purchase" loop'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    PurchaseSignature() {
        if (this.currentPurchaseData) {
            return this.currentPurchaseData.signature;
        }

        this.logDeveloperMistake(
            'You are trying to use "Purchase signature" expression outside of "On purchase success" trigger'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    PurchasesSignature() {
        if (this.currentPurchasesLoopData) {
            return this.currentPurchasesLoopData.purchases.signature;
        }

        this.logDeveloperMistake(
            'You are trying to use "Purchases signature" expression outside of "On purchase success" trigger'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    PurchaseError() {
        if (this.currentPurchaseData) {
            return this.currentPurchaseData.error;
        }

        this.logDeveloperMistake(
            'You are trying to use "Purchase error" expression outside of "On purchase error" trigger'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    ProductID() {
        if (this.currentPurchaseData) {
            return this.currentPurchaseData.productID;
        }

        this.logDeveloperMistake(
            'You are trying to use "Product ID" expression outside of "On purchase success" or "On specific purchase success"'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    CurrentPurchasesProductID() {
        if (this.currentPurchasesLoopData) {
            const loopData = this.currentPurchasesLoopData;
            const purchaseEntry = loopData.purchases[loopData.currentIndex];

            return purchaseEntry.productID;
        }

        this.logDeveloperMistake(
            'You are trying to use "Current purchases product ID" expression outside of "For each purchase" loop'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    CurrentCatalogProductID() {
        if (this.currentCatalogLoopData) {
            const loopData = this.currentCatalogLoopData;
            const product = loopData.catalog[loopData.currentIndex];

            return product.id;
        }

        this.logDeveloperMistake(
            'You are trying to use "Current catalog product ID" expression outside of "For each in catalog" loop'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    ProductTitle() {
        if (this.currentCatalogLoopData) {
            const loopData = this.currentCatalogLoopData;
            const product = loopData.catalog[loopData.currentIndex];

            return product.title;
        }

        this.logDeveloperMistake(
            'You are trying to use "Current catalog product title" expression outside of "For each in catalog" loop'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    ProductDescription() {
        if (this.currentCatalogLoopData) {
            const loopData = this.currentCatalogLoopData;
            const product = loopData.catalog[loopData.currentIndex];

            return product.description;
        }

        this.logDeveloperMistake(
            'You are trying to use "Current catalog product description" expression outside of "For each in catalog" loop'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    ProductImageURI() {
        if (this.currentCatalogLoopData) {
            const loopData = this.currentCatalogLoopData;
            const product = loopData.catalog[loopData.currentIndex];

            return product.imageURI;
        }

        this.logDeveloperMistake(
            'You are trying to use "Current catalog product image URI" expression outside of "For each in catalog" loop'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    ProductPrice() {
        if (this.currentCatalogLoopData) {
            const loopData = this.currentCatalogLoopData;
            const product = loopData.catalog[loopData.currentIndex];

            return product.price;
        }

        this.logDeveloperMistake(
            'You are trying to use "Current catalog product price" expression outside of "For each in catalog" loop'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    ProductPriceValue() {
        if (this.currentCatalogLoopData) {
            const loopData = this.currentCatalogLoopData;
            const product = loopData.catalog[loopData.currentIndex];

            return product.priceValue;
        }

        this.logDeveloperMistake(
            'You are trying to use "Current catalog product price value" expression outside of "For each in catalog" loop'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    ProductPriceCurrencyCode() {
        if (this.currentCatalogLoopData) {
            const loopData = this.currentCatalogLoopData;
            const product = loopData.catalog[loopData.currentIndex];

            return product.priceCurrencyCode;
        }

        this.logDeveloperMistake(
            'You are trying to use "Current catalog product currency code" expression outside of "For each in catalog" loop'
        );

        return '';
    },

    /**
     * @this {YandexGamesSDKInstance}
     * @param {"small"|"medium"|"svg"} size
     */
    ProductPriceCurrencyImage(size) {
        if (this.currentCatalogLoopData) {
            const loopData = this.currentCatalogLoopData;
            const product = loopData.catalog[loopData.currentIndex];

            return product.priceCurrencyImage[size] || '';
        }

        this.logDeveloperMistake(
            'You are trying to use "Current catalog product currency image" expression outside of "For each in catalog" loop'
        );

        return '';
    },

    //#endregion

    //#region Player

    /** @this {YandexGamesSDKInstance} */
    GetCurrentPlayerUniqueID() {
        if (this.forEachLeaderboardEntryLoopData) {
            const loopData = this.forEachLeaderboardEntryLoopData;
            const currentEntry = loopData.entriesData.entries[loopData.currentIndex];

            return currentEntry.player.uniqueID;
        }

        this.logDeveloperMistake(
            'You are trying to use "Current player unique ID" expression outside of "For each player in leaderboard" loop'
        );

        return '';
    },

    GetPlayerUniqueID() {
        if (this.playerInfo) {
            return this.playerInfo.uniqueID;
        }

        this.logDeveloperMistake(
            'You are trying to use "Player unique ID" expression outside of "Player info success"'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    GetCurrentPlayerName() {
        if (this.forEachLeaderboardEntryLoopData) {
            const loopData = this.forEachLeaderboardEntryLoopData;
            const currentEntry = loopData.entriesData.entries[loopData.currentIndex];

            return currentEntry.player.publicName;
        }

        this.logDeveloperMistake(
            'You are trying to use "Current player name" expression outside of "For each player in leaderboard" loop'
        );

        return '';
    },

    GetPlayerName() {
        if (this.playerInfo) {
            return this.playerInfo.publicName;
        }

        this.logDeveloperMistake('You are trying to use "Player name" expression outside of "Player info success"');

        return '';
    },

    /**
     * @this {YandexGamesSDKInstance}
     * @param {"small"|"medium"|"large"} size
     */
    GetCurrentPlayerAvatar(size) {
        if (this.forEachLeaderboardEntryLoopData) {
            const loopData = this.forEachLeaderboardEntryLoopData;
            const currentEntry = loopData.entriesData.entries[loopData.currentIndex];

            return currentEntry.player.avatarSrc[size] || '';
        }

        this.logDeveloperMistake(
            'You are trying to use "Current player name" expression outside of "For each player in leaderboard" loop'
        );

        return '';
    },

    GetPlayerAvatar(size) {
        if (this.playerInfo) {
            return this.playerInfo.avatars[size] || '';
        }

        this.logDeveloperMistake('You are trying to use "Player avatar" expression outside of "Player info success"');

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    PlayerAvatarSmall() {
        if (this.playerInfo) {
            return this.playerInfo.avatars.small || '';
        }

        this.logDeveloperMistake(
            'You are trying to use "Player avatar small" expression outside of "Player info success"'
        );

        return '';
    },

    CurrentPlayerAvatarSmall() {
        if (this.forEachLeaderboardEntryLoopData) {
            const loopData = this.forEachLeaderboardEntryLoopData;
            const currentEntry = loopData.entriesData.entries[loopData.currentIndex];

            return currentEntry.player.avatarSrc.small || '';
        }

        this.logDeveloperMistake(
            'You are trying to use "Player avatar small" expression outside of "Player info success"'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    PlayerAvatarMedium() {
        if (this.playerInfo) {
            return this.playerInfo.avatars.medium || '';
        }

        this.logDeveloperMistake(
            'You are trying to use "Player avatar medium" expression outside of "Player info success"'
        );

        return '';
    },

    CurrentPlayerAvatarMedium() {
        if (this.forEachLeaderboardEntryLoopData) {
            const loopData = this.forEachLeaderboardEntryLoopData;
            const currentEntry = loopData.entriesData.entries[loopData.currentIndex];

            return currentEntry.player.avatarSrc.medium || '';
        }

        this.logDeveloperMistake(
            'You are trying to use "Current player avatar medium" expression outside of "For each player in leaderboard" loop'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    PlayerAvatarLarge() {
        if (this.playerInfo) {
            return this.playerInfo.avatars.large || '';
        }

        this.logDeveloperMistake(
            'You are trying to use "Player avatar medium" expression outside of "Player info success"'
        );

        return '';
    },

    CurrentPlayerAvatarLarge() {
        if (this.forEachLeaderboardEntryLoopData) {
            const loopData = this.forEachLeaderboardEntryLoopData;
            const currentEntry = loopData.entriesData.entries[loopData.currentIndex];

            return currentEntry.player.avatarSrc.large || '';
        }

        this.logDeveloperMistake(
            'You are trying to use "Current player avatar large" expression outside of "For each player in leaderboard" loop'
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    GetCurrentPlayerSignature() {
        if (this.playerInfo) {
            return this.playerInfo.signature || '';
        }

        this.logDeveloperMistake(
            `You are trying to use "Player signature" expression outside of "Using player info" condition!`
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    GetCurrentPlayerPayingStatus() {
        if (this.playerInfo) {
            return this.playerInfo.payingStatus || '';
        }

        this.logDeveloperMistake(
            `You are trying to use "Player paying status" expression outside of "Using player info" condition!`
        );

        return '';
    },

    //#endregion

    //#region Environment

    /**
     * @deprecated
     * @this {YandexGamesSDKInstance}
     */
    GetLanguage() {
        return this.environment?.i18n.lang ?? 'en';
    },

    /**
     * @deprecated
     * @this {YandexGamesSDKInstance}
     */
    GetDomain() {
        return this.environment?.i18n.tld ?? 'com';
    },

    /**
     * @deprecated
     * @this {YandexGamesSDKInstance}
     */
    GetPayload() {
        return this.environment?.payload ?? '';
    },

    /**
     * @deprecated
     * @this {YandexGamesSDKInstance}
     */
    GetAppID() {
        return this.environment?.app_id ?? '0';
    },

    /** @this {YandexGamesSDKInstance} */
    EnvironmentLanguage() {
        return this.environment?.i18n.lang ?? 'en';
    },

    /** @this {YandexGamesSDKInstance} */
    EnvironmentDomain() {
        return this.environment?.i18n.tld ?? 'com';
    },

    /** @this {YandexGamesSDKInstance} */
    EnvironmentPayload() {
        return this.environment?.payload ?? '';
    },

    /** @this {YandexGamesSDKInstance} */
    AppID() {
        return this.environment?.app_id ?? '0';
    },

    //#endregion

    //#region Remote Config

    /** @this {YandexGamesSDKInstance} */
    RemoteConfigGetFlag(key) {
        return this.flags[key] ?? '';
    },

    //#endregion

    //#region Game Linking

    /** @this {YandexGamesSDKInstance} */
    CurrentGameAppID() {
        if (this.currentGamesLoopData) {
            const loopData = this.currentGamesLoopData;
            const currentEntry = loopData.games[loopData.currentIndex];

            return currentEntry.game?.appID || '';
        }

        this.logDeveloperMistake(
            `You are trying to use "CurrentGameAppID" expression outside of "Get All Games" loop!`
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    CurrentGameTitle() {
        if (this.currentGamesLoopData) {
            const loopData = this.currentGamesLoopData;
            const currentEntry = loopData.games[loopData.currentIndex];

            return currentEntry.game?.title;
        }

        this.logDeveloperMistake(
            `You are trying to use "CurrentGameTitle" expression outside of "Get All Games" loop!`
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    CurrentGameURL() {
        if (this.currentGamesLoopData) {
            const loopData = this.currentGamesLoopData;
            const currentEntry = loopData.games[loopData.currentIndex];

            return currentEntry.game?.url;
        }

        this.logDeveloperMistake(
            `You are trying to use "CurrentGameTitle" expression outside of "Get All Games" loop!`
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    CurrentGameCoverURL() {
        if (this.currentGamesLoopData) {
            const loopData = this.currentGamesLoopData;
            const currentEntry = loopData.games[loopData.currentIndex];

            return currentEntry.game?.coverURL;
        }

        this.logDeveloperMistake(
            `You are trying to use "CurrentGameTitle" expression outside of "Get All Games" loop!`
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    CurrentGameIconURL() {
        if (this.currentGamesLoopData) {
            const loopData = this.currentGamesLoopData;
            const currentEntry = loopData.games[loopData.currentIndex];

            return currentEntry.game?.iconURL;
        }

        this.logDeveloperMistake(
            `You are trying to use "CurrentGameTitle" expression outside of "Get All Games" loop!`
        );

        return '';
    },

    GameAppID() {
        if (this.currentGameByID) {
            return this.currentGameByID.game?.appID || '';
        }

        this.logDeveloperMistake(
            `You are trying to use "CurrentGameAppID" expression outside of "Get All Games" loop!`
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    GameTitle() {
        if (this.currentGameByID) {
            return this.currentGameByID.game?.title || '';
        }

        this.logDeveloperMistake(
            `You are trying to use "CurrentGameTitle" expression outside of "Get All Games" loop!`
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    GameURL() {
        if (this.currentGameByID) {
            return this.currentGameByID.game?.url || '';
        }

        this.logDeveloperMistake(
            `You are trying to use "CurrentGameTitle" expression outside of "Get All Games" loop!`
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    GameCoverURL() {
        if (this.currentGameByID) {
            return this.currentGameByID.game?.coverURL || '';
        }

        this.logDeveloperMistake(
            `You are trying to use "CurrentGameTitle" expression outside of "Get All Games" loop!`
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    GameIconURL() {
        if (this.currentGameByID) {
            return this.currentGameByID.game?.iconURL || '';
        }

        this.logDeveloperMistake(
            `You are trying to use "CurrentGameTitle" expression outside of "Get All Games" loop!`
        );

        return '';
    },

    /** @this {YandexGamesSDKInstance} */
    DeveloperURL() {
        return this.developerURL;
    },

    //#endregion

    //#region Misc

    /** @this {YandexGamesSDKInstance} */
    ServerTime() {
        return this.serverTime ?? 0;
    },

    //#endregion
};

globalThis.C3.Plugins.yagames_sdk.Exps = Expressions;
