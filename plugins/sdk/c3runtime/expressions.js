/** @class */
const Expressions = {
  //#region Localization

  /** @this {YandexGamesSDKInstance} */
  CurrentLanguage() {
    return this.currentLanguage ?? '';
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
    if (!this.forEachLeaderbordEntryLoopData) return -1;
    const loopData = this.forEachLeaderbordEntryLoopData;
    const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
    return currentEntry.rank;
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardEntryScore() {
    if (!this.forEachLeaderbordEntryLoopData) return -1;
    const loopData = this.forEachLeaderbordEntryLoopData;
    const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
    return currentEntry.score;
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardEntryExtraData() {
    if (!this.forEachLeaderbordEntryLoopData) return '';
    const loopData = this.forEachLeaderbordEntryLoopData;
    const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
    return currentEntry.extraData || '';
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardEntryRangeIndex() {
    if (!this.forEachLeaderbordEntryLoopData) return 0;
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
    if (!this.forEachLeaderbordEntryLoopData) return '';
    const leaderboard = this.forEachLeaderbordEntryLoopData.entriesData.leaderboard;
    return leaderboard.name || '';
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardDescriptionType() {
    if (!this.forEachLeaderbordEntryLoopData) return '';
    const loopData = this.forEachLeaderbordEntryLoopData;
    const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
    return currentEntry.extraData || '';
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardDescriptionTitle() {
    if (!this.forEachLeaderbordEntryLoopData) return '';
    const loopData = this.forEachLeaderbordEntryLoopData;
    const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
    return currentEntry.extraData || '';
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentLeaderboardDescriptionDecimalOffset() {
    if (!this.forEachLeaderbordEntryLoopData) return '';
    const loopData = this.forEachLeaderbordEntryLoopData;
    const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
    return currentEntry.extraData || '';
  },

  //#endregion

  //#region Player

  /** @this {YandexGamesSDKInstance} */
  GetCurrentPlayerUniqueID() {
    if (this.forEachLeaderbordEntryLoopData) {
      const loopData = this.forEachLeaderbordEntryLoopData;
      const currentEntry = loopData.entriesData.entries[loopData.currentIndex];
      return currentEntry.player.uniqueID;
    } else if (this.forPlayerInfo) {
      return this.forPlayerInfo.uniqueID;
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
    } else if (this.forPlayerInfo) {
      return this.forPlayerInfo.publicName;
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
      return currentEntry.player.avatarSrc[size];
    } else if (this.forPlayerInfo) {
      return this.forPlayerInfo.avatarSrc[size];
    } else {
      return '';
    }
  },

  /** @this {YandexGamesSDKInstance} */
  GetCurrentPlayerSignature() {
    if (this.forPlayerInfo) {
      return this.forPlayerInfo.signature || '';
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
