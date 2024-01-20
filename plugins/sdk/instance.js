const SDK = self.SDK;

SDK.Plugins.yagames_sdk.Instance = class YandexGamesSDKInstance extends SDK.IInstanceBase {
  constructor(sdkType, inst) {
    super(sdkType, inst);
  }

  Release() {}

  OnCreate() {}

  OnPropertyChanged(id, value) {}

  LoadC2Property(name, valueString) {
    return false; // not handled
  }
};
