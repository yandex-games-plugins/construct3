# Briefly About Construct 3

First, it is recommended that you familiarize yourself with the
[Construct 3 documentation](https://www.construct.net/en/make-games/manuals/construct-3) and the
[Addon SDK documentation](https://www.construct.net/en/make-games/manuals/addon-sdk).

The visual scripting language in Construct has three main elements:

- [Actions](https://www.construct.net/en/make-games/manuals/addon-sdk/guide/defining-aces#internalH1Link4).  
  These are analogous to function calls in traditional programming languages.

- [Conditions](https://www.construct.net/en/make-games/manuals/addon-sdk/guide/defining-aces#internalH1Link3).  
  These are analogous to loops and `if-else` constructs. They can also be used to mask asynchronous calls as
  loops. For example, you can review the implementation of the Leaderboards API in the `YandexGamesSDK` addon
  (more details below).

- [Expressions](https://www.construct.net/en/make-games/manuals/addon-sdk/guide/defining-aces#internalH1Link5).  
  These are used similarly to variables in Conditions and Actions.

# The Addon System in Construct 3

Scripting in Construct 3 revolves around addons. There are hundreds of addons provided by Construct 3 out of
the box (e.g., System, Keyboard, etc.).

Addons consist of sets of Actions, Conditions, and Expressions.

This repository is well-suited for developing multiple extensions simultaneously.  
[Enable developer mode](https://www.construct.net/en/make-games/manuals/addon-sdk/guide/enabling-developer-mode),
run `npm run dev`, and use the links from the console to add the necessary addons to `editor.construct.net`.

Due to the features of the Construct 3 engine, you will primarily focus on adding new functionality to the
visual language of Construct. This is not as difficult as it may seem, but there are a few caveats regarding
things like asynchronous operations.

# Adding New Functionality from the Yandex.Games SDK

If you want to provide users with access to new functionality from the Yandex.Games SDK, the addon in the
`plugins/sdk` directory, called `YandexGamesSDK`, is of interest to you.

The `YandexGamesSDK` plugin is a "static" addon, meaning it can only be added to a project once.

It is also very important to note that the engine, by default, executes user-written scripts (Actions,
Conditions, Expressions) in the context of a
[Web Worker](https://www.construct.net/en/make-games/manuals/construct-3/project-primitives/projects#internalH1Link5).  
This means you cannot simply call a Yandex.Games SDK method and call it a day.

You first need to create message handlers in the `c3runtime/domSide.js` file, and subsequently call the
required code from the files `c3runtime/actions.js`, `c3runtime/conditions.js`, `c3runtime/expressions.js`,
and `c3runtime/instance.js`.

From a programming complexity standpoint, adding new functionality should not take much time. However, I
strongly urge you to carefully design new API implementations. Construct addons **must** be backward
compatible. If you remove something from the `aces.json` file, it may crash the engine.

Study how the APIs were designed before you, and take inspiration!
