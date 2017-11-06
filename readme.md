# EpicSkills start kit [![devDependencies Status](https://david-dm.org/epixx/start-kit/dev-status.svg)](https://david-dm.org/epixx/start-kit?type=dev) [![dependencies Status](https://david-dm.org/epixx/start-kit/status.svg)](https://david-dm.org/epixx/start-kit)

Стартовый репозиторий.

**ВНИМАНИЕ!** Не клонировать! Форкните себе этот репозиторий и клонируйте свой форк!

Установка: `npm i`.

Запуск: `npm start`.

Запуск конкретной задачи: `npm start имя_задачи` (список задач смотри в `gulpfile.js`)

Остановка: <kbd>Ctrl + C</kbd>

Добавление нового блока: `node createBlock.js имя-блока`. Будут созданы папка блока, `.scss` и `.pug` файлы, добавлены импорт стилей и импорт примеси блока.



## К прочтению / ознакомлению

- [Как работать с CSS-препроцессорами и БЭМ](http://nicothin.github.io/idiomatic-pre-CSS/)
- [Шпаргалка по bash](https://github.com/nicothin/web-development/tree/master/bash)
- [Шпаргалка по консольным командам Git](https://github.com/nicothin/web-development/tree/master/git)
- [Шпаргалка ниндзя Sublime Text 3](http://nicothin.github.io/sublime-text/sublime-text-3-hotkeys.html)
- [Sublime Text 3 для работы с фронтэндом](https://github.com/nicothin/sublime-text)



## Как стянуть из этого (мастер) репозитория какие-то дополнения в свой форк-репозиторий

[Синхронизация репозитория-форка с мастер-репозиторием](https://github.com/nicothin/web-development/tree/master/git#Синхронизация-репозитория-форка-с-мастер-репозиторием) — исходник.

Есть [этот мастер-репозиторий](https://github.com/epixx/start-kit), вы сделали его форк, но потом в мастер-репозиторий были внесены изменения. Задача: стянуть с мастер-репозитория изменения в свой форк.

``` bash
# указана последовательность действий:
git remote -v # убедитесь, что origin — это ВАШ репозиторий
git remote add upstream git@github.com:epixx/start-kit.git # добавьте удаленный репозиторий с сокр. именем upstream
git fetch upstream # стяните все ветки мастер-репозитория (пока без слияния со своими)
git checkout master # переключитесь на ветку master своего репозитория (если были в другой ветке)
git merge upstream/master # влейте ветку master удалённого репозитория upstream в свою ветку master
npm i # доустановите зависимости проекта (могли измениться)
```



## Комментирование разметки для разработчиков

Для html-файлов можно использовать комментарии вида `<!--DEV Комментарий -->` — такие комментарии не попадут в собранный html.
