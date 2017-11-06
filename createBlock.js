'use strict';

// Требует node.js и пакета mkdirp

const fs = require('fs');                // будем работать с файловой системой
const mkdirp = require('mkdirp');        // зависимость, должна быть установлена (см. описание выше)

let blockName = process.argv[2];          // получим имя блока
let defaultExtensions = ['scss', 'pug', 'img']; // расширения по умолчанию
let extensions = uniqueArray(defaultExtensions.concat(process.argv.slice(3)));  // добавим введенные при вызове расширения (если есть)
let styleManagerPath = './src/scss/style.scss';
let pugMixinsPath = './src/mixins.pug';

// Если есть имя блока
if(blockName) {

  let dirPath = './src/blocks/' + blockName + '/'; // полный путь к создаваемой папке блока
  mkdirp(dirPath, function(err){                 // создаем

    // Если какая-то ошибка — покажем
    if(err) {
      console.error('Отмена операции: ' + err);
    }

    // Нет ошибки, поехали!
    else {
      console.log('Создание папки ' + dirPath + ' (создана, если ещё не существует)');

      // Обходим массив расширений и создаем файлы, если они еще не созданы
      extensions.forEach(function(extention){

        let filePath = dirPath + blockName + '.' + extention; // полный путь к создаваемому файлу
        let fileContent = '';                                 // будущий контент файла
        let fileCreateMsg = '';                               // будущее сообщение в консоли при создании файла

        // Если это scss
        if (extention === 'scss') {
          fileContent = `// В этом файле должны быть стили для БЭМ-блока ${blockName}, его элементов, \n// модификаторов, псевдоселекторов, псевдоэлементов, @media-условий...\n// Очередность: http://nicothin.github.io/idiomatic-pre-CSS/#priority\n\n.${blockName} {\n\n  $block-name:                &; // #{$block-name}__element\n\n}\n`;
          let styleFileImport = '@import \'' + dirPath + blockName + '.scss\';';

          // Читаем файл диспетчера подключений
          let connectManager = fs.readFileSync(styleManagerPath, 'utf8');

          // Делаем из строк массив, фильтруем массив, оставляя только строки с незакомментированными импортами
          let fileSystem = connectManager.split('\n').filter(function(item) {
            if(/^(\s*)@import/.test(item)) return true;
            else return false;
          });

          // Создаем регулярку с импортом
          let reg = new RegExp(styleFileImport, '');

          // Создадим флаг отсутствия блока среди импортов
          let impotrtExist = false;

          // Обойдём массив и проверим наличие импорта
          for (var i = 0, j=fileSystem.length; i < j; i++) {
            if(reg.test(fileSystem[i])) {
              impotrtExist = true;
              break;
            }
          }

          // Если флаг наличия импорта по-прежнему опущен, допишем импорт
          if(!impotrtExist) {
            // Открываем файл
            fs.open(styleManagerPath, 'a', function(err, fileHandle) {
              // Если ошибок открытия нет...
              if (!err) {
                // Запишем в конец файла
                fs.write(fileHandle, styleFileImport + '\n', null, 'utf8', function(err, written) {
                  if (!err) {
                    console.log(`В ${styleManagerPath} записано: ${styleFileImport}`);
                  } else {
                    console.log(`ОШИБКА записи в ${styleManagerPath}: ${err}`);
                  }
                });
              } else {
                console.log(`ОШИБКА открытия ${styleManagerPath}: ${err}`);
              }
            });
          }
          else {
            console.log(`Импорт стилевого файла НЕ прописан в ${styleManagerPath} (он там уже есть)`);
          }
        }

        // Если это JS
        else if(extention == 'js') {
          fileContent = `// (function(){\n// код\n// }());\n`;
        }

        // Если это Pug
        else if(extention == 'pug') {
          fileContent = `mixin ${blockName}()\n  div ${blockName}\n`;

          let includeMixin = 'include blocks/' + blockName + '/' + blockName + '.pug';

          // Читаем файл диспетчера подключений
          let connectManager = fs.readFileSync(pugMixinsPath, 'utf8');

          // Делаем из строк массив, фильтруем массив, оставляя только строки с незакомментированными импортами
          let fileSystem = connectManager.split('\n').filter(function(item) {
            if(/^(\s*)include/.test(item)) return true;
            else return false;
          });

          // Создаем регулярку с импортом
          let reg = new RegExp(includeMixin, '');

          // Создадим флаг отсутствия блока среди импортов
          let impotrtExist = false;

          // Обойдём массив и проверим наличие импорта
          for (var i = 0, j=fileSystem.length; i < j; i++) {
            if(reg.test(fileSystem[i])) {
              impotrtExist = true;
              break;
            }
          }

          // Если флаг наличия импорта по-прежнему опущен, допишем импорт
          if(!impotrtExist) {
            // Открываем файл
            fs.open(pugMixinsPath, 'a', function(err, fileHandle) {
              // Если ошибок открытия нет...
              if (!err) {
                // Запишем в конец файла
                fs.write(fileHandle, includeMixin + '\n', null, 'utf8', function(err, written) {
                  if (!err) {
                    console.log(`В ${pugMixinsPath} записано: ${includeMixin}`);
                  } else {
                    console.log(`ОШИБКА записи в ${pugMixinsPath}: ${err}`);
                  }
                });
              } else {
                console.log(`ОШИБКА открытия ${pugMixinsPath}: ${err}`);
              }
            });
          }
          else {
            console.log(`Инклуд примеси НЕ прописан в ${pugMixinsPath} (он там уже есть)`);
          }
        }

        // Если нужна подпапка для картинок
        else if (extention === 'img') {
          const imgFolder = `${dirPath}img/`;
          if (fileExist(imgFolder) === false) {
            mkdirp(imgFolder, (err) => {
              if (err) console.error(err);
              else console.log(`Создание папки: ${imgFolder} (если отсутствует)`);
            });
          } else {
            console.log(`Папка ${imgFolder} НЕ создана (уже существует) `);
          }
        }

        // Создаем файл, если он еще не существует
        if(fileExist(filePath) === false && extention !== 'img') {
          fs.writeFile(filePath, fileContent, function(err) {
            if(err) {
              return console.log('Файл НЕ создан: ' + err);
            }
            console.log('Файл создан: ' + filePath);
            if(fileCreateMsg) {
              console.warn(fileCreateMsg);
            }
          });
        }
      });
    }
  });
}
else {
  console.log('Отмена операции: не указан блок');
}

// Оставить в массиве только уникальные значения (убрать повторы)
function uniqueArray(arr) {
  var objectTemp = {};
  for (var i = 0; i < arr.length; i++) {
    var str = arr[i];
    objectTemp[str] = true; // запомнить строку в виде свойства объекта
  }
  return Object.keys(objectTemp);
}

// Проверка существования файла
function fileExist(path) {
  const fs = require('fs');
  try {
    fs.statSync(path);
  } catch(err) {
    return !(err && err.code === 'ENOENT');
  }
}
