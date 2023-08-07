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
};

self.C3.Plugins.yagames_sdk.Cnds = Conditions;
