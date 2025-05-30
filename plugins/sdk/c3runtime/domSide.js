'use strict';
{
    const DOM_COMPONENT_ID = 'yagames_sdk';

    const HANDLER_CLASS = class extends globalThis.DOMHandler {
        constructor(iRuntime) {
            super(iRuntime, DOM_COMPONENT_ID);

            /** @type {YandexGamesSDKHandler} */
            this.ysdkHandler = new YandexGamesSDKHandler(this);

            /** @type {TVRemoteEmulator} */
            this.tvRemoteEmulator = new TVRemoteEmulator(this);

            this.AddRuntimeMessageHandler('start-tv-remote-emulator', () => {
                this.tvRemoteEmulator.Start();
            });

            this.AddRuntimeMessageHandler('start-tv-remote-tracking', () => {
                this._gamepadsUpdates = true;

                window.addEventListener('keydown', event => {
                    if (event.key === 'Enter') this.PostToRuntime('tv-remote-ok-click', true);
                });

                window.addEventListener('keyup', event => {
                    if (event.key === 'Enter') this.PostToRuntime('tv-remote-ok-click', false);
                });
            });

            this.data = {
                upPressed: false,
                downPressed: false,
                leftPressed: false,
                rightPressed: false,
            };

            this._StartTicking();
        }

        Tick() {
            if (this._gamepadsUpdates) {
                this.GamepadsUpdate();
            }

            this.ysdkHandler.YSDKServerTimeUpdate();
        }

        GamepadsUpdate() {
            const gamepads = navigator.getGamepads();

            this.data.upPressed = false;
            this.data.downPressed = false;
            this.data.leftPressed = false;
            this.data.rightPressed = false;

            let shouldUpdate = false;

            for (const gamepad of gamepads) {
                if (!gamepad) continue;
                shouldUpdate = true;
                this.data.upPressed = this.data.upPressed || gamepad.buttons[12].pressed;
                this.data.downPressed = this.data.downPressed || gamepad.buttons[13].pressed;
                this.data.leftPressed = this.data.leftPressed || gamepad.buttons[14].pressed;
                this.data.rightPressed = this.data.rightPressed || gamepad.buttons[15].pressed;
            }

            if (!shouldUpdate) return;

            this.PostToRuntime('gamepads-update', this.data);
        }
    };

    class YandexGamesSDKHandler {
        constructor(domHandler) {
            this.domHandler = domHandler;

            /** @type {types.YSDK | undefined} */
            this.ysdk = undefined;

            // Prevent 'ysdk is not defined' error
            window.ysdk = undefined;

            this.domHandler.AddRuntimeMessageHandler('ysdk-initialize', this.InitializeYSDK.bind(this));

            this.domHandler.AddRuntimeMessageHandler('ysdk-loading-api-ready', this.YSDKLoadingAPIReady.bind(this));

            this.domHandler.AddRuntimeMessageHandler('ysdk-gameplay-api-start', this.YSDKGameplayAPIStart.bind(this));

            this.domHandler.AddRuntimeMessageHandler('ysdk-gameplay-api-stop', this.YSDKGameplayAPIStop.bind(this));

            this.domHandler.AddRuntimeMessageHandler('ysdk-show-fullscreen-ad', this.YSDKShowFullscreenAD.bind(this));

            this.domHandler.AddRuntimeMessageHandler('ysdk-show-rewarded-ad', this.YSDKShowRewardedAD.bind(this));

            this.domHandler.AddRuntimeMessageHandler('ysdk-show-sticky-banner', this.YSDKShowStickyBanner.bind(this));

            this.domHandler.AddRuntimeMessageHandler('ysdk-hide-sticky-banner', this.YSDKHideStickyBanner.bind(this));

            this.domHandler.AddRuntimeMessageHandler(
                'ysdk-get-leaderboard-entries',
                this.YSDKGetLeaderboardEntries.bind(this)
            );

            this.domHandler.AddRuntimeMessageHandler(
                'ysdk-set-leaderboard-score',
                this.YSDKSetLeaderboardScore.bind(this)
            );

            this.domHandler.AddRuntimeMessageHandler('ysdk-purchase', this.YSDKPurchase.bind(this));

            this.domHandler.AddRuntimeMessageHandler('ysdk-consume-purchase', this.YSDKConsumePurchase.bind(this));

            this.domHandler.AddRuntimeMessageHandler('ysdk-get-purchases', this.YSDKGetPurchases.bind(this));

            this.domHandler.AddRuntimeMessageHandler('ysdk-get-catalog', this.YSDKGetCatalog.bind(this));

            this.domHandler.AddRuntimeMessageHandler('ysdk-get-player', this.YSDKGetPlayer.bind(this));

            this.domHandler.AddRuntimeMessageHandler('ysdk-get-player-data', this.YSDKGetPlayerData.bind(this));

            this.domHandler.AddRuntimeMessageHandler('ysdk-get-player-stats', this.YSDKGetPlayerStats.bind(this));

            this.domHandler.AddRuntimeMessageHandler('ysdk-set-player-data', this.YSDKSetPlayerData.bind(this));

            this.domHandler.AddRuntimeMessageHandler('ysdk-set-player-stats', this.YSDKSetPlayerStats.bind(this));

            this.domHandler.AddRuntimeMessageHandler(
                'ysdk-increment-player-stats',
                this.YSDKIncrementPlayerStats.bind(this)
            );

            this.domHandler.AddRuntimeMessageHandler('ysdk-dispatch-event', this.YSDKDispatchEvent.bind(this));

            this.domHandler.AddRuntimeMessageHandler(
                'ysdk-shortcuts-show-prompt',
                this.YSDKShortcutsShowPrompt.bind(this)
            );

            this.domHandler.AddRuntimeMessageHandler('ysdk-remote-config-fetch', this.YSDKRemoteConfigFetch.bind(this));

            this.domHandler.AddRuntimeMessageHandler('ysdk-request-review', this.YSDKRequestReview.bind(this));

            this.domHandler.AddRuntimeMessageHandler(
                'ysdk-update-can-show-shortcut-prompt',
                this.YSDKUpdateCanShowShortcutPrompt.bind(this)
            );

            this.domHandler.AddRuntimeMessageHandler('ysdk-get-all-games', this.YSDKGetAllGames.bind(this));

            this.domHandler.AddRuntimeMessageHandler('ysdk-get-game-by-id', this.YSDKGetGameByID.bind(this));
        }

        async LoadYSDKScript() {
            return new Promise(resolve => {
                const head = document.getElementsByTagName('head')[0];
                const script = document.createElement('script');
                script.src = '/sdk.js';
                script.async = true;
                script.onload = async () => resolve();
                head.appendChild(script);
            });
        }

        async InitializeYSDK() {
            await this.LoadYSDKScript();

            if (!window.YaGames) {
                return;
            }

            this.ysdk = await window.YaGames.init();
            window.ysdk = this.ysdk;
            window.ysdk = this.ysdk;

            const results = await Promise.all([
                this.OnYSDKLoaded(this.ysdk),
                this.ysdk.features.GamesAPI.getAllGames(),
            ]);

            const developerURL = results[1].developerURL;

            this.ysdk.features.PluginEngineDataReporterAPI.report({
                engineName: 'Construct',
                engineVersion: '3', // TODO: find a way to get version from runtime in "rXXX" format
                pluginName: 'yagames_sdk by LisGames',
                pluginVersion: '3.0.0',
            });

            console.log('%c YandexGamesSDK for Construct 3 v2.16.0 ', 'background: #14151f; color: #fb923c');

            return {
                environment: {
                    app: {
                        id: this.ysdk.environment.app.id,
                    },
                    browser: {
                        lang: this.ysdk.environment.browser.lang,
                    },
                    i18n: {
                        lang: this.ysdk.environment.i18n.lang,
                        tld: this.ysdk.environment.i18n.tld,
                    },
                    payload: this.ysdk.environment.payload,
                },
                deviceType: this.ysdk.deviceInfo.type,
                developerURL: developerURL,
            };
        }

        async OnYSDKLoaded() {
            if (!this.ysdk) return;

            this.ysdk.onEvent(this.ysdk.EVENTS.HISTORY_BACK, () => {
                this.domHandler.PostToRuntime('ysdk-handle-event', { type: 'HISTORY_BACK' });
            });

            this.ysdk.on('game_api_pause', () => {
                this.domHandler.PostToRuntime('ysdk-handle-event', { type: 'game_api_pause' });
            });

            this.ysdk.on('game_api_resume', () => {
                this.domHandler.PostToRuntime('ysdk-handle-event', { type: 'game_api_resume' });
            });

            await Promise.all([this.YSDKUpdateCanShowShortcutPrompt(), this.YSDKUpdateCanReview()]);
        }

        YSDKLoadingAPIReady() {
            if (!this.ysdk) return;

            this.ysdk.features.LoadingAPI?.ready();
        }

        YSDKGameplayAPIStart() {
            if (!this.ysdk) return;

            this.ysdk.features.GameplayAPI?.start();
        }

        YSDKGameplayAPIStop() {
            if (!this.ysdk) return;

            this.ysdk.features.GameplayAPI?.stop();
        }

        YSDKShowFullscreenAD() {
            if (!this.ysdk) return;

            this.ysdk.adv.showFullscreenAdv({
                callbacks: {
                    onClose: wasShown => {
                        this.domHandler.PostToRuntime('ysdk-fullscreen-ad-callback', {
                            type: 'onClose',
                            wasShown: wasShown,
                        });
                    },
                    onOpen: () => {
                        this.domHandler.PostToRuntime('ysdk-fullscreen-ad-callback', {
                            type: 'onOpen',
                        });
                    },
                    onError: error => {
                        this.domHandler.PostToRuntime('ysdk-fullscreen-ad-callback', {
                            type: 'onError',
                            error: JSON.stringify(error),
                        });
                    },
                    onOffline: () => {
                        this.domHandler.PostToRuntime('ysdk-fullscreen-ad-callback', {
                            type: 'onOffline',
                        });
                    },
                },
            });
        }

        YSDKShowRewardedAD(params) {
            if (!this.ysdk) return;

            this.ysdk.adv.showRewardedVideo({
                callbacks: {
                    onOpen: () => {
                        this.domHandler.PostToRuntime('ysdk-rewarded-ad-callback', {
                            id: params.id,
                            type: 'onOpen',
                        });
                    },
                    onRewarded: () => {
                        this.domHandler.PostToRuntime('ysdk-rewarded-ad-callback', {
                            id: params.id,
                            type: 'onRewarded',
                        });
                    },
                    onClose: () => {
                        this.domHandler.PostToRuntime('ysdk-rewarded-ad-callback', {
                            id: params.id,
                            type: 'onClose',
                        });
                    },
                    onError: error => {
                        this.domHandler.PostToRuntime('ysdk-rewarded-ad-callback', {
                            id: params.id,
                            type: 'onError',
                            error: JSON.stringify(error),
                        });
                    },
                },
            });
        }

        YSDKShowStickyBanner() {
            if (!this.ysdk) return;

            this.ysdk.adv.showBannerAdv();
        }

        YSDKHideStickyBanner() {
            if (!this.ysdk) return;

            this.ysdk.adv.hideBannerAdv();
        }

        async YSDKGetLeaderboardEntries(params) {
            if (!this.ysdk) return;

            const lb = await this.ysdk.getLeaderboards();

            // A bit of context:
            // Yandex.Games Leaderboards API is a bit too low level for Construct 3
            // so we hide some complexity from our developers.

            // Step 1: prevent error, when developer request user's entry without authorization

            if (params.options.includeUser) {
                const loggedIn = await this.ysdk.isAvailableMethod('leaderboards.setLeaderboardScore');

                if (!loggedIn) {
                    params.options.includeUser = false;
                }
            }

            // Step 2: Make sure developers get all the entries they expect.
            //
            // The problem is that developers usually expect to get some entries from top and some
            // around user's entry, but there might be the case when user's entry is too high or too low
            // and there are not enough entries to show on the screen.
            //
            // It brings the hustle to the developer to handle edge cases, so we do it for them.

            const quantityTop = params.options.quantityTop ?? 5;
            const quantityBottom = (params.options.quantityAround ?? 5) * 2;

            if (params.options.includeUser) {
                params.options.quantityAround = quantityTop + quantityBottom;
            } else {
                params.options.quantityTop = quantityTop + quantityBottom + 1;
            }

            const data = await lb.getLeaderboardEntries(params.leaderboardName, params.options);

            const ranges = [];
            const entries = [];

            for (let i = 0; i < quantityTop; i++) {
                if (data.entries[i]) {
                    entries.push(data.entries[i]);
                }
            }
            ranges.push({ start: 0, length: entries.length });

            const bottomStart = Math.max(
                quantityTop,
                Math.min(
                    data.entries.findIndex(entry => entry.rank === data.userRank),
                    data.entries.length - quantityBottom - 1
                )
            );

            for (let i = 0; i < quantityBottom + 1; i++) {
                const entry = data.entries[bottomStart + i];
                if (entry) {
                    entries.push(entry);
                }
            }
            ranges.push({ start: ranges[0].length - 1, length: entries.length - ranges[0].length });

            return {
                leaderboard: data.leaderboard,
                ranges: ranges,
                entries: entries.map(entry => {
                    return {
                        score: entry.score,
                        extraData: entry.extraData,
                        rank: entry.rank,
                        player: {
                            avatarSrc: {
                                small: entry.player.getAvatarSrc('small'),
                                medium: entry.player.getAvatarSrc('medium'),
                                large: entry.player.getAvatarSrc('large'),
                            },
                            avatarSrcSet: {
                                small: entry.player.getAvatarSrcSet('small'),
                                medium: entry.player.getAvatarSrcSet('medium'),
                                large: entry.player.getAvatarSrcSet('large'),
                            },
                            lang: entry.player.lang,
                            publicName: entry.player.publicName,
                            scopePermissions: entry.player.scopePermissions,
                            uniqueID: entry.player.uniqueID,
                        },
                        formattedScore: entry.formattedScore,
                    };
                }),
            };
        }

        async YSDKSetLeaderboardScore(params) {
            if (!this.ysdk) return;

            const lb = await this.ysdk.getLeaderboards();

            await lb.setLeaderboardScore(params.leaderboardName, params.score, params.extraData || undefined);
        }

        async YSDKPurchase(params) {
            if (!this.ysdk) return;

            try {
                const payments = await this.ysdk.getPayments({ signed: true });

                const purchase = await payments.purchase({
                    id: params.productID,
                    developerPayload: params.developerPayload,
                });

                this.domHandler.PostToRuntime('ysdk-purchase-callback', {
                    success: true,
                    productID: purchase.productID,
                    purchaseToken: purchase.purchaseToken,
                    developerPayload: purchase.developerPayload,
                    signature: purchase.signature,
                });
            } catch (error) {
                console.error(error);

                this.domHandler.PostToRuntime('ysdk-purchase-callback', {
                    productID: params.productID,
                    error: JSON.stringify(error),
                });
            }
        }

        async YSDKConsumePurchase(params) {
            if (!this.ysdk) return;

            const payments = await this.ysdk.getPayments({ signed: true });

            await payments.consumePurchase(params.purchaseToken);
        }

        async YSDKGetPurchases() {
            if (!this.ysdk) return;

            const payments = await this.ysdk.getPayments({ signed: true });

            const purchases = await payments.getPurchases();

            const _purchases = [];

            for (let i = 0; i < purchases.length; i++) {
                const purchase = purchases[i];
                _purchases[i] = {
                    productID: purchase.productID,
                    purchaseToken: purchase.purchaseToken,
                    developerPayload: purchase.developerPayload,
                };
            }

            _purchases.signature = purchases.signature;

            return _purchases;
        }

        async YSDKGetCatalog() {
            if (!this.ysdk) return;

            const payments = await this.ysdk.getPayments({ signed: true });

            const catalog = await payments.getCatalog();

            const _catalog = [];

            for (let i = 0; i < catalog.length; i++) {
                const product = catalog[i];
                _catalog[i] = {
                    id: product.id,
                    title: product.title,
                    description: product.description,
                    imageURI: product.imageURI,
                    price: product.price,
                    priceValue: product.priceValue,
                    priceCurrencyCode: product.priceCurrencyCode,
                    priceCurrencyImage: {
                        small: product.getPriceCurrencyImage('small'),
                        medium: product.getPriceCurrencyImage('medium'),
                        svg: product.getPriceCurrencyImage('svg'),
                    },
                };
            }

            return _catalog;
        }

        async YSDKGetPlayerData(keys) {
            if (!this.ysdk) return;

            const player = await this.ysdk.getPlayer();

            const data = await player.getData(keys);

            return data;
        }

        async YSDKGetPlayerStats(keys) {
            if (!this.ysdk) return;

            const player = await this.ysdk.getPlayer();

            const stats = await player.getStats(keys);

            return stats;
        }

        async YSDKSetPlayerData(params) {
            if (!this.ysdk) return;

            const player = await this.ysdk.getPlayer();

            await player.setData(params.data, params.flush);
        }

        async YSDKSetPlayerStats(data) {
            if (!this.ysdk) return;

            const player = await this.ysdk.getPlayer();

            await player.setStats(data);
        }

        async YSDKIncrementPlayerStats(data) {
            if (!this.ysdk) return;

            const player = await this.ysdk.getPlayer();

            await player.incrementStats(data);
        }

        async YSDKGetPlayer(params) {
            if (!this.ysdk) return;

            /** @type {import("../../../global").Player} */
            let player;

            if (params.requestPersonalInfo && this.ysdk.openAuthDialog) {
                player = await this.ysdk.getPlayer({ signed: true, scopes: true });

                if (player.getMode() === 'lite') {
                    await this.ysdk.openAuthDialog();
                    player = await this.ysdk.getPlayer({ signed: true, scopes: true });
                }

                // Double request. The first one can return empty name even if the user provided personal info.
                player = await this.ysdk.getPlayer({ signed: true, scopes: true });
            } else {
                player = await this.ysdk.getPlayer({ scopes: false });
            }

            await this.YSDKUpdateCanReview();

            return {
                isAuthorized: player.getMode() !== 'lite',
                isAccessGranted: player.getName() !== '',
                uniqueID: player.getUniqueID(),
                publicName: player.getName(),
                avatars: {
                    small: player.getPhoto('small'),
                    medium: player.getPhoto('medium'),
                    large: player.getPhoto('large'),
                },
                signature: player.signature,
                payingStatus: player.getPayingStatus(),
            };
        }

        YSDKDispatchEvent(params) {
            if (!this.ysdk) return;

            this.ysdk.dispatchEvent(this.ysdk.EVENTS[params.name]);
        }

        async YSDKUpdateCanShowShortcutPrompt() {
            if (!this.ysdk) return;

            const prompt = await this.ysdk.shortcut.canShowPrompt();

            await this.domHandler.PostToRuntimeAsync('ysdk-update-can-show-shortcut-prompt', {
                canShow: prompt.canShow,
            });
        }

        async YSDKGetGameByID(params) {
            if (!this.ysdk) return;

            const result = await this.ysdk.features.GamesAPI.getGameByID(params.id);

            if (result.game === undefined) {
                console.log(`No game found with the provided ID (${params.id}). Please check the ID and try again.`);
            }

            return {
                game: result.game,
                isAvailable: result.isAvailable,
            };
        }

        async YSDKGetAllGames() {
            if (!this.ysdk) return;

            const result = await this.ysdk.features.GamesAPI.getAllGames();

            const games = result.games;

            return games.map(game => ({
                game: game,
                isAvailable: true,
            }));
        }

        async YSDKShortcutsShowPrompt() {
            if (!this.ysdk) return;

            const result = await this.ysdk.shortcut.showPrompt();

            await this.YSDKUpdateCanShowShortcutPrompt();

            this.domHandler.PostToRuntime('ysdk-shortcut-show-prompt-result', {
                accepted: result.outcome === 'accepted',
            });
        }

        /**
         * @param {{
         *  defaultFlags: Record<string, boolean>,
         *  clientFeatures: string[],
         * }} params
         */
        async YSDKRemoteConfigFetch(params) {
            if (!this.ysdk) {
                return params.defaultFlags;
            }

            const config = await this.ysdk.getFlags(params);

            return config;
        }

        async YSDKRequestReview() {
            if (!this.ysdk) return;

            const canReview = await this.ysdk.feedback.canReview();

            if (canReview.value) {
                const result = await this.ysdk.feedback.requestReview();

                await this.YSDKUpdateCanReview();

                return {
                    feedbackSent: result.feedbackSent,
                };
            } else {
                return {
                    feedbackSent: false,
                };
            }
        }

        async YSDKUpdateCanReview() {
            if (!this.ysdk) return;

            const canReview = await this.ysdk.feedback.canReview();

            await this.domHandler.PostToRuntimeAsync('ysdk-update-can-review', {
                value: canReview.value,
            });
        }

        YSDKServerTimeUpdate() {
            if (!this.ysdk) return;

            this.domHandler.PostToRuntime('ysdk-server-time-update', this.ysdk.serverTime());
        }
    }

    class TVRemoteEmulator {
        constructor(domHandler) {
            this.domHandler = domHandler;
            this.enabled = false;
            this.ArrowMap = {
                ArrowUp: 12,
                ArrowDown: 13,
                ArrowLeft: 14,
                ArrowRight: 15,
            };
        }

        Start() {
            this.iframe = document.createElement('iframe');
            this.iframe.id = 'tv-emulator';
            this.iframe.src = '';
            this.iframe.style.position = 'absolute';
            this.iframe.style.display = 'none';
            this.iframe.style.width = '288px';
            this.iframe.style.height = '640px';
            this.iframe.style.border = 'none';
            this.iframe.style.zIndex = '999';
            this.iframe.style.transformOrigin = 'right bottom';
            document.body.appendChild(this.iframe);

            this.UpdatePosition(this.iframe);

            fetch('tv_emulator.html')
                .then(res => res.text())
                .then(html => {
                    this.iframe.contentWindow.document.write(html);
                    window.addEventListener('resize', this.UpdatePosition.bind(this));
                    window.addEventListener('message', this.OnMessage.bind(this));
                    window.addEventListener('keydown', this.OnKeyDown.bind(this));
                });

            this.fakeController = {
                id: 'TV Remote Emulator',
                index: 0,
                axes: [0, 0, 0, 0],
                connected: false,
                buttons: new Array(16).fill(0).map(() => ({
                    pressed: false,
                    touched: false,
                    value: 0,
                })),
                timestamp: Math.floor(Date.now() / 1000),
            };
        }

        /** @param {KeyboardEvent} event */
        OnKeyDown(event) {
            if (event.key !== 'F6') return;
            if (this.iframe.style.display === 'none') {
                this.EnableGamepad();
            } else {
                this.DisableGamepad();
            }
        }

        EnableGamepad() {
            this.enabled = true;
            this.iframe.style.display = 'block';

            const event = new Event('gamepadconnected');
            this.fakeController.connected = true;
            event.gamepad = this.fakeController;
            this.fakeController.timestamp = Math.floor(Date.now() / 1000);
            window.dispatchEvent(event);

            this._originalGetGamepads = navigator.getGamepads;
            navigator.getGamepads = () => [this.fakeController];
        }

        DisableGamepad() {
            this.enabled = false;
            this.iframe.style.display = 'none';

            const event = new Event('gamepaddisconnected');
            this.fakeController.connected = false;
            event.gamepad = this.fakeController;
            this.fakeController.timestamp = Math.floor(Date.now() / 1000);
            window.dispatchEvent(event);

            navigator.getGamepads = this._originalGetGamepads;
        }

        /** @param {MessageEvent} event */
        OnMessage(event) {
            if (event.data.event !== 'tv-emulator-event') return;

            switch (event.data.name) {
                case 'Enter':
                    window.dispatchEvent(
                        new KeyboardEvent(event.data.pressed ? 'keydown' : 'keyup', {
                            key: 'Enter',
                            code: 'Enter',
                            keyCode: 13,
                        })
                    );
                    break;
                case 'Back':
                    if (!event.data.pressed) {
                        this.domHandler.PostToRuntime('ysdk-handle-event', { type: 'HISTORY_BACK' });
                    }
                    break;
                default:
                    const button = this.fakeController.buttons[this.ArrowMap[event.data.name]];
                    button.pressed = event.data.pressed;
                    button.value = event.data.pressed ? 1 : 0;
                    button.touched = event.data.pressed;
                    this.fakeController.timestamp = Math.floor(Date.now() / 1000);
                    break;
            }
        }

        UpdatePosition() {
            const scale = Math.min(window.innerWidth / 288, window.innerHeight / 640);
            this.iframe.style.transform = `scale(${scale})`;
            this.iframe.style.left = `${window.innerWidth - 288}px`;
            this.iframe.style.top = `${window.innerHeight - 640}px`;
        }
    }

    globalThis.RuntimeInterface.AddDOMHandlerClass(HANDLER_CLASS);
}
