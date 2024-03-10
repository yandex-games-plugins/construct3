/**
 * Function to informate about developer mistakes
 * @param {string} message
 */
function logDeveloperMistake(message) {
  let lines = message.split('\n');
  const maxLength = lines.reduce((p, c) => (p < c.length ? c.length : p), 0);
  const whitespaces = ''.padEnd(maxLength + 2, ' ');
  const formattedMessage = lines.map((line) => line.padEnd(maxLength + 1, ' ')).join('\n');
  console.log(`%c${whitespaces}\n${formattedMessage}\n${whitespaces}`, 'background: #14151f; color: #fb3c3c');
}

/** @class */
const Expressions = {
  //#region Localization

  /** @this {YandexGamesSDKInstance} */
  CurrentLanguage() {
    console.log(this);
    return this.localization.currentLanguage ?? '';
  },

  //#endregion

  //#region Fullscreen AD

  /** @this {YandexGamesSDKInstance} */
  FullscreenADError() {
    const runtime = this.GetRuntime();

    let event = runtime.GetCurrentEvent();
    while (
      event &&
      !event.GetConditions().some((cond) => cond._func === this.conditions.OnFullscreenADError)
    ) {
      event = event.GetParent();
    }

    if (!event) return '';

    const condition = event
      .GetConditions()
      .find((cond) => cond._func === this.conditions.OnFullscreenADError);

    const error = condition.$error || '';

    return error;
  },

  //#endregion

  //#region Rewarded AD

  /** @this {YandexGamesSDKInstance} */
  RewardedADError() {
    const runtime = this.GetRuntime();

    let event = runtime.GetCurrentEvent();
    while (event && !event.GetConditions().some((cond) => cond._func === this.conditions.OnRewardedADError)) {
      event = event.GetParent();
    }

    if (!event) return '';

    const condition = event.GetConditions().find((cond) => cond._func === this.conditions.OnRewardedADError);

    const error = condition.$error || '';

    return error;
  },

  //#endregion

  //#region Leaderboards

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardEntryRank() {
    if (!this.forEachLeaderbordEntryLoopData) {
      logDeveloperMistake(
        `Warning!\nYou are trying to use "Player position in leaderboard" expression outside of "For each player in leaderboard" loop!\nPlease, check your events!`,
      );
      return -1;
    }
    const loopData = this.forEachLeaderbordEntryLoopData;
    const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
    return currentEntry.rank;
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardEntryScore() {
    if (!this.forEachLeaderbordEntryLoopData) {
      logDeveloperMistake(
        `Warning!\nYou are trying to use "Player score in leaderboard" expression outside of "For each player in leaderboard" loop!\nPlease, check your events!`,
      );
      return -1;
    }
    const loopData = this.forEachLeaderbordEntryLoopData;
    const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
    return currentEntry.score;
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardEntryExtraData() {
    if (!this.forEachLeaderbordEntryLoopData) {
      logDeveloperMistake(
        `Warning!\nYou are trying to use "Player extra data in leaderboard" expression outside of "For each player in leaderboard" loop!\nPlease, check your events!`,
      );
      return '';
    }
    const loopData = this.forEachLeaderbordEntryLoopData;
    const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
    return currentEntry.extraData || '';
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardEntryRangeIndex() {
    if (!this.forEachLeaderbordEntryLoopData) {
      logDeveloperMistake(
        `Warning!\nYou are trying to use "Range index of requested leaderboard" expression outside of "For each player in leaderboard" loop!\nPlease, check your events!`,
      );
      return 0;
    }
    const loopData = this.forEachLeaderbordEntryLoopData;

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
    if (!this.forEachLeaderbordEntryLoopData) {
      logDeveloperMistake(
        `Warning!\nYou are trying to use "Leaderboad name" expression outside of "For each player in leaderboard" loop!\nPlease, check your events!`,
      );
      return '';
    }
    const leaderboard = this.forEachLeaderbordEntryLoopData.entriesData.leaderboard;
    return leaderboard.name || '';
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardDescriptionType() {
    if (!this.forEachLeaderbordEntryLoopData) {
      logDeveloperMistake(
        `Warning!\nYou are trying to use "Leaderboad type" expression outside of "For each player in leaderboard" loop!\nPlease, check your events!`,
      );
      return '';
    }
    const loopData = this.forEachLeaderbordEntryLoopData;
    const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
    return currentEntry.extraData || '';
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardDescriptionTitle() {
    if (!this.forEachLeaderbordEntryLoopData) {
      logDeveloperMistake(
        `Warning!\nYou are trying to use "Leaderboad title" expression outside of "For each player in leaderboard" loop!\nPlease, check your events!`,
      );
      return '';
    }
    const loopData = this.forEachLeaderbordEntryLoopData;
    const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
    return currentEntry.extraData || '';
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardDescriptionDecimalOffset() {
    if (!this.forEachLeaderbordEntryLoopData) {
      logDeveloperMistake(
        `Warning!\nYou are trying to use "Leaderboad decimal offset" expression outside of "For each player in leaderboard" loop!\nPlease, check your events!`,
      );
      return '';
    }
    const loopData = this.forEachLeaderbordEntryLoopData;
    const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
    return currentEntry.extraData || '';
  },

  //#endregion

  //#region Payments

  /** @this {YandexGamesSDKInstance} */
  PurchaseToken() {
    if (this.purchaseSuccessTriggerData) {
      return this.purchaseSuccessTriggerData.purchaseToken;
    } else if (this.forEachPurchaseLoopData) {
      const loopData = this.forEachPurchaseLoopData;
      const purchaseEntry = loopData.purchases[loopData.currentIndex];
      return purchaseEntry.purchaseToken;
    } else {
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  PurchaseDeveloperPayload() {
    if (this.purchaseSuccessTriggerData) {
      return this.purchaseSuccessTriggerData.developerPayload;
    } else if (this.forEachPurchaseLoopData) {
      const loopData = this.forEachPurchaseLoopData;
      const purchaseEntry = loopData.purchases[loopData.currentIndex];
      return purchaseEntry.developerPayload;
    } else {
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  PurchaseSignature() {
    if (this.purchaseSuccessTriggerData) {
      return this.purchaseSuccessTriggerData.signature;
    } else {
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  PurchasesSignature() {
    if (this.forEachPurchaseLoopData) {
      return this.forEachPurchaseLoopData.purchases.signature;
    } else {
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  PurchaseError() {
    if (this.purchaseFailureTriggerData) {
      return this.purchaseFailureTriggerData.error;
    } else {
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  ProductID() {
    if (this.purchaseSuccessTriggerData) {
      return this.purchaseSuccessTriggerData.productID;
    } else if (this.forEachPurchaseLoopData) {
      const loopData = this.forEachPurchaseLoopData;
      const purchaseEntry = loopData.purchases[loopData.currentIndex];
      return purchaseEntry.productID;
    } else if (this.forEachInCatalogLoopData) {
      const loopData = this.forEachInCatalogLoopData;
      const product = loopData.catalog[loopData.currentIndex];
      return product.id;
    } else {
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  ProductTitle() {
    if (this.forEachInCatalogLoopData) {
      const loopData = this.forEachInCatalogLoopData;
      const product = loopData.catalog[loopData.currentIndex];
      return product.title;
    } else {
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  ProductDescription() {
    if (this.forEachInCatalogLoopData) {
      const loopData = this.forEachInCatalogLoopData;
      const product = loopData.catalog[loopData.currentIndex];
      return product.description;
    } else {
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  ProductImageURI() {
    if (this.forEachInCatalogLoopData) {
      const loopData = this.forEachInCatalogLoopData;
      const product = loopData.catalog[loopData.currentIndex];
      return product.imageURI;
    } else {
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  ProductPrice() {
    if (this.forEachInCatalogLoopData) {
      const loopData = this.forEachInCatalogLoopData;
      const product = loopData.catalog[loopData.currentIndex];
      return product.price;
    } else {
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  ProductPriceCurrencyСode() {
    if (this.forEachInCatalogLoopData) {
      const loopData = this.forEachInCatalogLoopData;
      const product = loopData.catalog[loopData.currentIndex];
      return product.priceCurrencyCode;
    } else {
      return '';
    }
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {"small"|"medium"|"svg"} size
   */
  ProductPriceCurrencyImage(size) {
    if (this.forEachInCatalogLoopData) {
      const loopData = this.forEachInCatalogLoopData;
      const product = loopData.catalog[loopData.currentIndex];
      return product.priceCurrencyImage[size] || '';
    } else {
      return '';
    }
  },

  //#endregion

  //#region Player

  /** @this {YandexGamesSDKInstance} */
  GetCurrentPlayerUniqueID() {
    if (this.forEachLeaderbordEntryLoopData) {
      const loopData = this.forEachLeaderbordEntryLoopData;
      const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
      return currentEntry.player.uniqueID;
    } else if (this.playerInfo) {
      return this.playerInfo.uniqueID;
    } else {
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentPlayerName() {
    if (this.forEachLeaderbordEntryLoopData) {
      const loopData = this.forEachLeaderbordEntryLoopData;
      const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
      return currentEntry.player.publicName;
    } else if (this.playerInfo) {
      return this.playerInfo.publicName;
    } else {
      return '';
    }
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {"small"|"medium"|"large"} size
   */
  GetCurrentPlayerAvatar(size) {
    if (this.forEachLeaderbordEntryLoopData) {
      const loopData = this.forEachLeaderbordEntryLoopData;
      const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
      return currentEntry.player.avatarSrc[size] || '';
    } else if (this.playerInfo) {
      return this.playerInfo.avatars[size] || '';
    } else {
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentPlayerSignature() {
    if (this.playerInfo) {
      return this.playerInfo.signature || '';
    } else {
      return '';
    }
  },

  //#endregion

  //#region Environment

  /** @this {YandexGamesSDKInstance} */
  GetLanguage() {
    return this.environment?.i18n.lang ?? 'en';
  },

  /** @this {YandexGamesSDKInstance} */
  GetDomain() {
    return this.environment?.i18n.tld ?? 'com';
  },

  /** @this {YandexGamesSDKInstance} */
  GetPayload() {
    return this.environment?.payload ?? '';
  },

  /** @this {YandexGamesSDKInstance} */
  GetAppID() {
    return this.environment?.app_id ?? '0';
  },

  //#endregion

  //#region Remote Config

  /** @this {YandexGamesSDKInstance} */
  RemoteConfigGetFlag(key) {
    return this.flags[key] ?? '';
  },

  //#endregion
};

self.C3.Plugins.yagames_sdk.Exps = Expressions;
