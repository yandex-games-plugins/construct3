# Использование API

## &#x20;Введение

Большая часть взаимодействия с плагином ведётся через встраивание в Construct 3 объекта [`ysdk`](https://yandex.ru/dev/games/doc/ru/sdk/sdk-about).

Вам не нужно устанавливать и инициализировать SDK самим, за вас эту работу проделает плагин, вы же можете свободно взаимодействовать с методами SDK c помощью [Construct 3 JavaScript API](https://www.construct.net/en/make-games/manuals/construct-3/scripting/overview).&#x20;

Выберите место, где хотите использовать SDK Яндекс.Игр, нажмите на "_Добавить -> Добавить скрипт_".

<figure><img src="../assets/image (67).png" alt=""><figcaption></figcaption></figure>

Теперь в появившемся окошке вы можете писать любой JavaScript код, используя объект `ysdk` чтобы получить доступ к методам SDK Яндекс.Игр.

<figure><img src="../assets/image (44).png" alt=""><figcaption></figcaption></figure>

## Async/await

Обратите внимание, что в скриптах вам доступно асинхронное программирование, что значительно упрощает понимание кода.

<figure><img src="../assets/image (75).png" alt=""><figcaption></figcaption></figure>

## Примеры
- [Player_Data_Example.c3p](../assets/Player_Data_Example.c3p)
- [Advertisements_Example.c3p](../assets/Advertisements_Example.c3p)

