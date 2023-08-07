# Локализация текста

## Создаём первый перевод

Первым шагом в локализации вашей игры будет подготовка переводов.

Для начала, вам следует создать папку "_i18n_" в директории "Файлы". Далее вам стоит создать ваш первый [JSON](https://doka.guide/tools/json/) файл и назвать его "_en_" ([код английского языка](https://yandex.ru/dev/games/doc/ru/concepts/languages-and-domains)).

<figure><img src="../assets/image (48).png" alt=""><figcaption></figcaption></figure>

Для примера введём подобное содержимое.

```json
{
	"game": {
		"title": "First Fantasy 10"
	},
	"potions": {
		"health": "Health Potion",
		"mana": "Mana Potion"
	}
}
```

## Использование в игре

Далее, чтобы воспользоваться нашим переводом, давайте создадим объект текста в макете и придадим ему значение `{game.title}`.&#x20;

<figure><img src="../assets/image (93).png" alt=""><figcaption></figcaption></figure>

Теперь, если мы нажмём на кнопку играть (превью), то мы увидим чудо, наш текст автоматически поменялся на значение "_First Fantasy 10_".

<figure><img src="../assets/image (32).png" alt=""><figcaption></figcaption></figure>

Теперь, чтобы добавить новый язык перевода, вам достаточно создать новый файл [JSON](https://doka.guide/tools/json/) с теми же ключами, только на другом языке.

## Пример

Ознакомиться с примером использования локализации текста можно ниже.
- [Text Localization Example.c3p](../assets/Text_Localization_Example.c3p)
