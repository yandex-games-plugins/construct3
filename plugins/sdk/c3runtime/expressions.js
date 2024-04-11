/** @class */
const Expressions = {
  //#region Localization

  /** @this {YandexGamesSDKInstance} */
  CurrentLanguage() {
    return this.localization.currentLanguage ?? '';
  },

  /** @this {YandexGamesSDKInstance} */
  LocalizationValue(path) {
    return this.localization.GetTranlationValue(path) ?? '';
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
    const runtime = this.GetRuntime();

    let event = runtime.GetCurrentEvent();
    while (event && !event["GetConditions"]().some((cond) => cond._func === this.conditions.OnRewardedADError)) {
      event = event["GetParent"]();
    }

    if (!event) return '';

    const condition = event["GetConditions"]().find((cond) => cond._func === this.conditions.OnRewardedADError);

    const error = condition.$error || '';

    return error;
  },

  //#endregion

  //#region Leaderboards

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardEntryRank() {
    if (!this.forEachLeaderbordEntryLoopData) {
      this.logDeveloperMistake(
        `You are trying to use "Player position in leaderboard" expression outside of "For each player in leaderboard" loop!`,
      );
      return -1;
    }
    const loopData = this.forEachLeaderbordEntryLoopData;
    const currentEntry = loopData["entriesData"]["entries"][loopData["currentIndex"]];
    return currentEntry["rank"];
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardEntryScore() {
    if (!this.forEachLeaderbordEntryLoopData) {
      this.logDeveloperMistake(
        `You are trying to use "Player score in leaderboard" expression outside of "For each player in leaderboard" loop!`,
      );
      return -1;
    }
    const loopData = this.forEachLeaderbordEntryLoopData;
    const currentEntry = loopData["entriesData"]["entries"][loopData["currentIndex"]];
    return currentEntry["score"];
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardEntryExtraData() {
    if (!this.forEachLeaderbordEntryLoopData) {
      this.logDeveloperMistake(
        `You are trying to use "Player extra data in leaderboard" expression outside of "For each player in leaderboard" loop!`,
      );
      return '';
    }
    const loopData = this.forEachLeaderbordEntryLoopData;
    const currentEntry = loopData["entriesData"]["entries"][loopData["currentIndex"]];
    return currentEntry["extraData"] || '';
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardEntryRangeIndex() {
    if (!this.forEachLeaderbordEntryLoopData) {
      this.logDeveloperMistake(
        `You are trying to use "Range index of requested leaderboard" expression outside of "For each player in leaderboard" loop!`,
      );
      return 0;
    }
    const loopData = this.forEachLeaderbordEntryLoopData;

    for (let entriesAmount = 0, i = 0; i < loopData["entriesData"]["ranges"].length; i++) {
      entriesAmount += loopData["entriesData"]["ranges"][i]["size"];
      if (loopData["currentIndex"] < entriesAmount) {
        return i;
      }
    }

    return 0;
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardDescriptionName() {
    if (!this.forEachLeaderbordEntryLoopData) {
      this.logDeveloperMistake(
        `You are trying to use "Leaderboad name" expression outside of "For each player in leaderboard" loop!`,
      );
      return '';
    }
    const leaderboard = this.forEachLeaderbordEntryLoopData["entriesData"]["leaderboard"];
    return leaderboard["name"] || '';
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardDescriptionType() {
    if (!this.forEachLeaderbordEntryLoopData) {
      this.logDeveloperMistake(
        `You are trying to use "Leaderboad type" expression outside of "For each player in leaderboard" loop!`,
      );
      return '';
    }
    const loopData = this.forEachLeaderbordEntryLoopData;
    const currentEntry = loopData["entriesData"]["entries"][loopData["currentIndex"]];
    return currentEntry["extraData"] || '';
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardDescriptionTitle() {
    if (!this.forEachLeaderbordEntryLoopData) {
      this.logDeveloperMistake(
        `You are trying to use "Leaderboad title" expression outside of "For each player in leaderboard" loop!`,
      );
      return '';
    }
    const loopData = this.forEachLeaderbordEntryLoopData;
    const currentEntry = loopData["entriesData"]["entries"][loopData["currentIndex"]];
    return currentEntry["extraData"] || '';
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardDescriptionDecimalOffset() {
    if (!this.forEachLeaderbordEntryLoopData) {
      this.logDeveloperMistake(
        `You are trying to use "Leaderboad decimal offset" expression outside of "For each player in leaderboard" loop!`,
      );
      return '';
    }
    const loopData = this.forEachLeaderbordEntryLoopData;
    const currentEntry = loopData["entriesData"]["entries"][loopData["currentIndex"]];
    return currentEntry["extraData"] || '';
  },

  //#endregion

  //#region Payments

  /** @this {YandexGamesSDKInstance} */
  PurchaseToken() {
    if (this.purchaseSuccessTriggerData) {
      return this.purchaseSuccessTriggerData["purchaseToken"];
    } else if (this.forEachPurchaseLoopData) {
      const loopData = this.forEachPurchaseLoopData;
      const purchaseEntry = loopData["purchases"][loopData["currentIndex"]];
      return purchaseEntry["purchaseToken"];
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Purchase token" expression outside of "For each purchase" or "On purchase success"!`,
      );
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  PurchaseDeveloperPayload() {
    if (this.purchaseSuccessTriggerData) {
      return this.purchaseSuccessTriggerData["developerPayload"];
    } else if (this.forEachPurchaseLoopData) {
      const loopData = this.forEachPurchaseLoopData;
      const purchaseEntry = loopData["purchases"][loopData["currentIndex"]];
      return purchaseEntry["developerPayload"];
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Purchase developer payload" expression outside of "For each purchase" or "On purchase success"!`,
      );
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  PurchaseSignature() {
    if (this.purchaseSuccessTriggerData) {
      return this.purchaseSuccessTriggerData["signature"];
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Purchase signature" expression outside of "On purchase success" trigger!`,
      );
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  PurchasesSignature() {
    if (this.forEachPurchaseLoopData) {
      return this.forEachPurchaseLoopData["purchases"]["signature"];
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Purchases signature" expression outside of "On purchase success" trigger!`,
      );
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  PurchaseError() {
    if (this.purchaseFailureTriggerData) {
      return this.purchaseFailureTriggerData["error"];
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Purchase error" expression outside of "On purchase error" trigger!`,
      );
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  ProductID() {
    if (this.purchaseSuccessTriggerData) {
      return this.purchaseSuccessTriggerData["productID"];
    } else if (this.forEachPurchaseLoopData) {
      const loopData = this.forEachPurchaseLoopData;
      const purchaseEntry = loopData["purchases"][loopData["currentIndex"]];
      return purchaseEntry["productID"];
    } else if (this.forEachInCatalogLoopData) {
      const loopData = this.forEachInCatalogLoopData;
      const product = loopData["catalog"][loopData["currentIndex"]];
      return product["id"];
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Product ID" expression outside of "On purchase success", "For each product in catalog" or "For each purchase"!`,
      );
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  ProductTitle() {
    if (this.forEachInCatalogLoopData) {
      const loopData = this.forEachInCatalogLoopData;
      const product = loopData["catalog"][loopData["currentIndex"]];
      return product["title"];
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Product title" expression outside of "On purchase success", "For each product in catalog" or "For each purchase"!`,
      );
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  ProductDescription() {
    if (this.forEachInCatalogLoopData) {
      const loopData = this.forEachInCatalogLoopData;
      const product = loopData["catalog"][loopData["currentIndex"]];
      return product["description"];
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Product description" expression outside of "For each product in catalog" loop!`,
      );
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  ProductImageURI() {
    if (this.forEachInCatalogLoopData) {
      const loopData = this.forEachInCatalogLoopData;
      const product = loopData["catalog"][loopData["currentIndex"]];
      return product["imageURI"];
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Product image URI" expression outside of "For each product in catalog" loop!`,
      );
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  ProductPrice() {
    if (this.forEachInCatalogLoopData) {
      const loopData = this.forEachInCatalogLoopData;
      const product = loopData["catalog"][loopData["currentIndex"]];
      return product["price"];
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Product price" expression outside of "For each product in catalog" loop!`,
      );
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  ProductPriceValue() {
    if (this.forEachInCatalogLoopData) {
      const loopData = this.forEachInCatalogLoopData;
      const product = loopData["catalog"][loopData["currentIndex"]];
      return product["priceValue"];
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Product price value" expression outside of "For each product in catalog" loop!`,
      );
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  ProductPriceCurrencyСode() {
    if (this.forEachInCatalogLoopData) {
      const loopData = this.forEachInCatalogLoopData;
      const product = loopData["catalog"][loopData["currentIndex"]];
      return product["priceCurrencyCode"];
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Product price currency code" expression outside of "For each product in catalog" loop!`,
      );
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
      const product = loopData["catalog"][loopData["currentIndex"]];
      return product["priceCurrencyImage"][size] || '';
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Product price currency image" expression outside of "For each product in catalog" loop!`,
      );
      return '';
    }
  },

  //#endregion

  //#region Player

  /** @this {YandexGamesSDKInstance} */
  GetCurrentPlayerUniqueID() {
    if (this.forEachLeaderbordEntryLoopData) {
      const loopData = this.forEachLeaderbordEntryLoopData;
      const currentEntry = loopData["entriesData"]["entries"][loopData["currentIndex"]];
      return currentEntry["player"]["uniqueID"];
    } else if (this.playerInfo) {
      return this.playerInfo["uniqueID"];
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Player unique ID" expression outside of "For each product in catalog" or "Using player info"!`,
      );
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentPlayerName() {
    if (this.forEachLeaderbordEntryLoopData) {
      const loopData = this.forEachLeaderbordEntryLoopData;
      const currentEntry = loopData["entriesData"]["entries"][loopData["currentIndex"]];
      return currentEntry["player"]["publicName"];
    } else if (this.playerInfo) {
      return this.playerInfo["publicName"];
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Player name" expression outside of "For each product in catalog" or "Using player info"!`,
      );
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
      const currentEntry = loopData["entriesData"]["entries"][loopData["currentIndex"]];
      return currentEntry["player"]["avatarSrc"][size] || '';
    } else if (this.playerInfo) {
      return this.playerInfo["avatars"][size] || '';
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Player avatar" expression outside of "For each product in catalog" or "Using player info"!`,
      );
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  PlayerAvatarSmall() {
    if (this.forEachLeaderbordEntryLoopData) {
      const loopData = this.forEachLeaderbordEntryLoopData;
      const currentEntry = loopData["entriesData"]["entries"][loopData["currentIndex"]];
      return currentEntry["player"]["avatarSrc"]["small"] || '';
    } else if (this.playerInfo) {
      return this.playerInfo["avatars"]["small"] || '';
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Small player avatar" expression outside of "For each product in catalog" or "Using player info"!`,
      );
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  PlayerAvatarMedium() {
    if (this.forEachLeaderbordEntryLoopData) {
      const loopData = this.forEachLeaderbordEntryLoopData;
      const currentEntry = loopData["entriesData"]["entries"][loopData["currentIndex"]];
      return currentEntry["player"]["avatarSrc"]["medium"] || '';
    } else if (this.playerInfo) {
      return this.playerInfo["avatars"]["medium"] || '';
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Medium player avatar" expression outside of "For each product in catalog" or "Using player info"!`,
      );
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  PlayerAvatarLarge() {
    if (this.forEachLeaderbordEntryLoopData) {
      const loopData = this.forEachLeaderbordEntryLoopData;
      const currentEntry = loopData["entriesData"]["entries"][loopData["currentIndex"]];
      return currentEntry["player"]["avatarSrc"]["large"] || '';
    } else if (this.playerInfo) {
      return this.playerInfo["avatars"]["large"] || '';
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Large player avatar" expression outside of "For each product in catalog" or "Using player info"!`,
      );
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentPlayerSignature() {
    if (this.playerInfo) {
      return this.playerInfo["signature"] || '';
    } else {
      this.logDeveloperMistake(
        `You are trying to use "Player signature" expression outside of "Using player info" condition!`,
      );
      return '';
    }
  },

  //#endregion

  //#region Environment

  /** @this {YandexGamesSDKInstance} */
  GetLanguage() {
    return this.environment?.["i18n"]["lang"] ?? 'en';
  },

  /** @this {YandexGamesSDKInstance} */
  GetDomain() {
    return this.environment?.["i18n"]["tld"] ?? 'com';
  },

  /** @this {YandexGamesSDKInstance} */
  GetPayload() {
    return this.environment?.["payload"] ?? '';
  },

  /** @this {YandexGamesSDKInstance} */
  GetAppID() {
    return this.environment?.["app_id"] ?? '0';
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
