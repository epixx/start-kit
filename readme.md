# EpicSkills start kit

Стартовый репозиторий.

**ВНИМАНИЕ!** Не клонировать! Форкните себе этот репозиторий и клонируйте свой форк!

Установка: `npm i`.

Запуск: `npm start`.

Запуск конкретной задачи: `npm start имя_задачи` (список задач смотри в `gulpfile.js`)

Остановка: <kbd>Ctrl + C</kbd>



## К прочтению / ознакомлению

- [Как работать с CSS-препроцессорами и БЭМ](http://nicothin.github.io/idiomatic-pre-CSS/)
- [Шпаргалка по bash](https://github.com/nicothin/web-development/tree/master/bash)
- [Шпаргалка по консольным командам Git](https://github.com/nicothin/web-development/tree/master/git)
- [Шпаргалка по Atom](https://nicothin.github.io/Atom/Atom-hotkeys.html)
- [Шпаргалка ниндзя Sublime Text 3](http://nicothin.github.io/sublime-text/sublime-text-3-hotkeys.html)
- [Sublime Text 3 для работы с фронтэндом](https://github.com/nicothin/sublime-text)
- [Gulp для самых маленьких](https://www.youtube.com/watch?v=vW51JUVT66w) (видео)
- [Скринкаст по Gulp](https://www.youtube.com/playlist?list=PLDyvV36pndZFLTE13V4qNWTZbeipNhCgQ) (серия видео)


## Как стянуть из этого (мастер) репозитория какие-то дополнения в свой форк-репозиторий

[Синхронизация репозитория-форка с мастер-репозиторием](https://github.com/nicothin/web-development/tree/master/git#Синхронизация-репозитория-форка-с-мастер-репозиторием) — исходник.

Есть [этот мастер-репозиторий](https://github.com/epixx/start-kit), вы сделали его форк, но потом в мастер-репозиторий были внесены изменения. Задача: стянуть с мастер-репозитория изменения в свой форк.

``` bash
# указана последовательность действий:
git remote add upstream git@github.com:epixx/start-kit.git # добавляем удаленный репозиторий: сокр. имя — upstream, URL этого репозитория
git fetch upstream # качаем все ветки мастер-репозитория, но пока не сливаем со своими
git checkout master # переключаемся на ветку master своего репозитория
git merge upstream/master # вливаем ветку master удалённого репозитория upstream в свою ветку master
npm i # доустанавливаем зависимости проекта, если они изменились
```


## Конвертирование шрифтов

``` bash
node_modules/.bin/ttf2woff src/fonts/opensans.ttf src/fonts/opensans.woff # конверсия TTF → WOFF, указаны адреса исходного TTF и результирующего WOFF
cat src/fonts/opensans.ttf | node_modules/.bin/ttf2woff2 >> src/fonts/opensans.woff2 # конверсия TTF → WOFF2, указаны адреса исходного TTF и результирующего WOFF2
```
