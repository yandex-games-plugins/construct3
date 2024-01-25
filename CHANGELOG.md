# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2024.1.25

### Added

- `With Player Info` renamed to more fitting `Using Player Info`
- ACEs for interacting with puchases APIs

### Fixed

- `player.getAvatarSrc is not a function` error when using player info

## [2.0.1] - 2024.1.21

### Fixed

- Wrong `display-text` properties for `player-get-data` and `player-set-data` language strings.

## [2.0.0] - 2024.1.13

### Added

- Complete coverage of Yandex.Games SDK with visual methods
- TV Controls conditions for better DX
- TV Remote Emulator
- New aditional plugin `adaptivetext`
- BBCode independent translations
- `set-default-localization-language` action deprecated in favor of addon `default-localization-language`
  parameter.

### Fixed

- Broken translations when BBCode is disabled.
- `ysdk is not defined` error in scripts.
- Inconsistent sdk initialization.

## [1.0.2.0] - 2023.09.30

### Added

- Visual methods for [Sticky Banners](https://yandex.ru/dev/games/doc/ru/sdk/sdk-adv#sticky-banner)
- Visual methods for [Leaderboards](https://yandex.ru/dev/games/doc/ru/sdk/sdk-leaderboard)
- Visual methods for [Player](https://yandex.ru/dev/games/doc/ru/sdk/sdk-player)
- Visual methods for [Game Ready](https://yandex.ru/dev/games/doc/ru/sdk/sdk-gameready)
- Debounce and throttle visual methods
- Debounce and throttle visual methods
- Developer alerts in preview
- Rename `analytics` category to `misc`

### Fixed

- Translation with multiple same paths in one string
- Disable SDK Initialization in debug mode
- Crashes with non-existed translation paths

## [1.0.1.0] - 2023.09.05

### Added

- Visual methods for [Fullscreen AD](https://yandex.ru/dev/games/doc/ru/sdk/sdk-adv#full-screen-block)
- Visual methods for [Rewarded AD](https://yandex.ru/dev/games/doc/ru/sdk/sdk-adv#rewarded-video)
