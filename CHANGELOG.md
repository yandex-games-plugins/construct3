# Changelog

All notable changes to this project will be documented in this file.

## YandexGamesSDK - [2.10.1] - 2024.6.25

### Fixed

- Fix crash when using `Product price currency code` expression

## YandexGamesSDK - [2.10.0] - 2024.5.27

### Added

- Added review API ACEs

## YandexGamesSDK - [2.9.2] - 2024.5.12

### Fixed

- Fix `this.ysdk.openAuthDialog is not a function` error in `Using player info`
  when not logged in

## YandexGamesSDK - [2.9.1] - 2024.4.12

### Fixed

- Incorrect behavior of `Specific purchase success` trigger
- Incorrect behavior of `Specific purchase failure` trigger

## AdaptiveText - [1.1.3] - 2024.3.15

### Fixes

- Crash when leaving `AdaptiveText` with empty text in runtime

## AdaptiveText - [1.1.2] - 2024.3.15

### Fixes

- Crash when leaving `AdaptiveText` with empty text

## YandexGamesSDK - [2.9.0] - 2024.4.12

### Added

- YSDK object reference for minified scripts

## YandexGamesSDK - [2.8.1] - 2024.4.12

### Fixed

- Redundant logs removed
- Fixed broken localization for renamed plugins
- Errors inside sdk loops in preview mode
- Fix minification issues for SDK request parameters

## YandexGamesSDK - [2.8.0] - 2024.4.11

### Added

- Missing key parameter for `Localization value` expression
- Rename parameter `ID`to `Tag` for Reward AD ACEs
- Experimental support for Construct 3 "Advanced" minification

### Fixed

- Incorrect behavior of `Any rewarded AD opened` trigger
- Incorrect behavior of `Any rewarded AD closed` trigger
- Incorrect behavior of `Any rewarded AD failed` trigger

## YandexGamesSDK - [2.7.3] - 2024.4.9

### Fixes

- Crashing Construct 3 build when using minification
- Fixed `ShortcutShowPrompt` action
- Fixed `OnSpecificPurchaseSuccess` and `OnSpecificPurchaseError` condition
- Fixed `Throttle` condition

## YandexGamesSDK - [2.7.2] - 2024.4.7

### Fixes

- Localization detection for unsupported languages

## YandexGamesSDK - [2.7.1] - 2024.3.22

### Fixes

- Heisenbug for async loops
- Incorrect ysdk initialization

## YandexGamesSDK - [2.7.0] - 2024.3.22

### Added

- Option to manually initialize Yandex.Games SDK

## YandexGamesSDK - [2.6.0] - 2024.3.22

### Added

- Support for `loopindex` in `For each purchase` loop
- Support for `loopindex` in `For each product in catalog` loop
- Support for `loopindex` in `For each player in leaderboard` loop

## YandexGamesSDK - [2.5.0] - 2024.3.21

### Added

- New `Specific product purchase success` trigger
- New `Specific product purchase failure` trigger
- New `Localization value` expression
- New shorthand `Small player avatar` expression
- New shorthand `Medium player avatar` expression
- New shorthand `Large player avatar` expression
- Multiple changes to ACEs titles/descriptions/display names

### 

## AdaptiveText - [1.1.1] - 2024.3.14

### Fixes

- Adaptive text now emits render on change

## YandexGamesSDK - [2.4.1] - 2024.3.13

### Added

- More logs for developers mistakes cases

## YandexGamesSDK - [2.4.0] - 2024.3.13

### Added

- New `Any rewarded AD opened` trigger
- New `Any rewarded AD closed` trigger
- New `Any rewarded AD failed` trigger
- Adaptive text now supports rotation ACEs
- Adaptive text now supports hierarchy ACEs
- Lots of logs for developers mistakes cases
- Plugin version logging to console

### Removed

- No more IDs for Fullscreen AD ACEs

## YandexGamesSDK - [2.3.5] - 2024.3.8

### Fixed

- Fix `Player is authorized` condition
- Fix `Player info access granted` condition

## YandexGamesSDK - [2.3.4] - 2024.3.5

### Fixed

- Fix minification by removing public class field usage

## YandexGamesSDK - [2.3.3] - 2024.2.10

### Fixed

- Fix `CurrentLanguage` expression

## YandexGamesSDK - [2.3.2] - 2024.2.6

### Fixed

- Implemented missing `ProductImageURI` expression

## YandexGamesSDK - [2.3.1] - 2024.2.3

### Removed

- Parameter `ProductID` from `on-purchase-success` trigger
- Parameter `ProductID` from `on-purchase-fail` trigger

### Fixed

- Incorrect script name in `for-each-purchase` condition

## YandexGamesSDK - [2.3.0] - 2024.2.3

### Added

- New `remote-config-set-default` action
- New `remote-config-set-client-feature` action

### Removed

- Parameters from `remote-config-fetch` action

### Fixed

- Incorrect remote config fetch logic

## YandexGamesSDK - [2.2.0] - 2024.1.31

### Added

- Having localization JSON files is now not necessary
- More informative description for `ID` param in ad ACEs

## YandexGamesSDK - [2.1.2] - 2024.1.27

### Fixed

- `On TV Remote button press` now behaves currectly.

## YandexGamesSDK - [2.1.1] - 2024.1.27

### Added

- `Не чаще чем в какое-то время` renamed to `Не чаще чем в X секунд`
- `Отложить на какое-то время` renamed to `Отложить на X секунд`

### Fixed

- Rewarded AD ACEs now triggers rewarded ad as they should, instead of
  fullscreen ad

## YandexGamesSDK - [2.1.0] - 2024.1.25

### Added

- `With Player Info` renamed to more fitting `Using Player Info`
- ACEs for interacting with puchases APIs

### Fixed

- `player.getAvatarSrc is not a function` error when using player info

## YandexGamesSDK - [2.0.1] - 2024.1.21

### Fixed

- Wrong `display-text` properties for `player-get-data` and `player-set-data`
  language strings.

## YandexGamesSDK - [2.0.0] - 2024.1.13

### Added

- Complete coverage of Yandex.Games SDK with visual methods
- TV Controls conditions for better DX
- TV Remote Emulator
- New aditional plugin `adaptivetext`
- BBCode independent translations
- `set-default-localization-language` action deprecated in favor of addon
  `default-localization-language` parameter.

### Fixed

- Broken translations when BBCode is disabled.
- `ysdk is not defined` error in scripts.
- Inconsistent sdk initialization.

## YandexGamesSDK - [1.0.2.0] - 2023.09.30

### Added

- Visual methods for
  [Sticky Banners](https://yandex.ru/dev/games/doc/ru/sdk/sdk-adv#sticky-banner)
- Visual methods for
  [Leaderboards](https://yandex.ru/dev/games/doc/ru/sdk/sdk-leaderboard)
- Visual methods for [Player](https://yandex.ru/dev/games/doc/ru/sdk/sdk-player)
- Visual methods for
  [Game Ready](https://yandex.ru/dev/games/doc/ru/sdk/sdk-gameready)
- Debounce and throttle visual methods
- Debounce and throttle visual methods
- Developer alerts in preview
- Rename `analytics` category to `misc`

### Fixed

- Translation with multiple same paths in one string
- Disable SDK Initialization in debug mode
- Crashes with non-existed translation paths

## YandexGamesSDK - [1.0.1.0] - 2023.09.05

### Added

- Visual methods for
  [Fullscreen AD](https://yandex.ru/dev/games/doc/ru/sdk/sdk-adv#full-screen-block)
- Visual methods for
  [Rewarded AD](https://yandex.ru/dev/games/doc/ru/sdk/sdk-adv#rewarded-video)
