const SDK = self.SDK;

const PLUGIN_CLASS = SDK.Plugins.yagames_sdk;

PLUGIN_CLASS.Type = class YandexGamesSDKType extends SDK.ITypeBase {
  constructor(sdkPlugin, iObjectType) {
    super(sdkPlugin, iObjectType);
  }
};
