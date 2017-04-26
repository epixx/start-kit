'use strict';

// Константа с папками
const dirs = {
  source: 'src',  // папка с исходниками (путь от корня проекта)
  build: 'build', // папка с результатом работы (путь от корня проекта)
};

// Определим необходимые инструменты
const gulp = require('gulp');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const replace = require('gulp-replace');
const fileinclude = require('gulp-file-include');
const del = require('del');
const browserSync = require('browser-sync').create();
const ghPages = require('gulp-gh-pages');
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const cheerio = require('gulp-cheerio');
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const base64 = require('gulp-base64');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const cleanCSS = require('gulp-cleancss');
const pug = require('gulp-pug');
const spritesmith = require('gulp.spritesmith');
const buffer = require('vinyl-buffer');
const merge = require('merge-stream');

// ЗАДАЧА: Компиляция и обработка стилей
gulp.task('style', function(){
  return gulp.src(dirs.source + '/scss/style.scss')         // какой файл компилировать
    .pipe(plumber({ errorHandler: onError }))               // при ошибках не останавливаем автоматику сборки
    .pipe(sourcemaps.init())                                // инициируем карту кода
    .pipe(sass())                                           // компилируем
    .pipe(postcss([                                         // делаем постпроцессинг, а именно:
        autoprefixer({ browsers: ['last 2 version'] }),     //   - автопрефиксирование
        mqpacker({ sort: true }),                           //   - объединение медиавыражений
    ]))
    .pipe(sourcemaps.write('/'))                            // записываем карту кода как отдельный файл
    .pipe(gulp.dest(dirs.build + '/css/'))                  // записываем CSS-файл (указано куда)
    .pipe(browserSync.stream())                             // автообновим в браузере
    .pipe(rename('style.min.css'))                          // переименовываем (сейчас запишем рядом то же самое, но минимизированное)
    .pipe(cleanCSS())                                       // сжимаем и оптимизирует
    .pipe(gulp.dest(dirs.build + '/css/'));                 // записываем сжатый CSS-файл (указано куда)
});

// ЗАДАЧА: Сборка HTML
gulp.task('html', function() {
  return gulp.src(dirs.source + '/*.html')                  // какие файлы обрабатывать
    .pipe(plumber({ errorHandler: onError }))               // при ошибках не останавливаем автоматику сборки
    .pipe(fileinclude({                                     // обрабатываем файлы пакетом gulp-file-include
      prefix: '@@',
      basepath: '@file',
      indent: true,
    }))
    .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))         // убираем комментарии <!--DEV ... -->
    .pipe(gulp.dest(dirs.build));                           // записываем файлы
});

// ЗАДАЧА: Сборка pug (использовать не обязательно)
gulp.task('pug', function() {
  return gulp.src(dirs.source + '/**/*.pug')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(pug())
    .pipe(gulp.dest(dirs.build));
});

// ЗАДАЧА: Копирование изображений
gulp.task('img', function () {
  return gulp.src([
        dirs.source + '/img/*.{gif,png,jpg,jpeg,svg}',      // какие файлы обрабатывать
      ],
      {since: gulp.lastRun('img')}                          // оставим в потоке обработки только изменившиеся от последнего запуска задачи (в этой сессии) файлы
    )
    .pipe(plumber({ errorHandler: onError }))
    .pipe(newer(dirs.build + '/img'))                       // оставить в потоке только новые файлы (сравниваем с содержимым соотв. подпапки билда)
    .pipe(gulp.dest(dirs.build + '/img'));                  // записываем файлы
});

// ЗАДАЧА: Копирование шрифтов
gulp.task('fonts', function () {
  return gulp.src([
        dirs.source + '/fonts/*.{ttf,woff,woff2,eot,svg}',
      ],
      {since: gulp.lastRun('fonts')}
    )
    .pipe(plumber({ errorHandler: onError }))
    .pipe(newer(dirs.build + '/fonts'))
    .pipe(gulp.dest(dirs.build + '/fonts'));
});

// ЗАДАЧА ЗАПУСКАЕТСЯ ТОЛЬКО ВРУЧНУЮ: Оптимизация изображений
gulp.task('img:opt', function () {
  return gulp.src([
      dirs.source + '/img/*.{gif,png,jpg,jpeg,svg}',        // какие файлы обрабатывать
      '!' + dirs.source + '/img/sprite-svg.svg',            // SVG-спрайт брать в обработку не будем
    ])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(imagemin({                                        // оптимизируем
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(dirs.source + '/img'));                  // записываем файлы В ИСХОДНУЮ ПАПКУ
});

// ЗАДАЧА: Сборка SVG-спрайта
gulp.task('svgstore', function (callback) {
  let spritePath = dirs.source + '/img/svg-sprite';          // константа с путем к исходникам SVG-спрайта
  if(fileExist(spritePath) !== false) {
    return gulp.src(spritePath + '/*.svg')                   // берем только SVG файлы из этой папки, подпапки игнорируем
      .pipe(svgmin(function (file) {                         // оптимизируем SVG, поступивший на вход
        return {
          plugins: [{
            cleanupIDs: {
              minify: true
            }
          }]
        }
      }))
      .pipe(svgstore({ inlineSvg: true }))                   // шьем спрайт
      .pipe(cheerio(function ($) {                           // дописываем получающемуся SVG-спрайту инлайновое сокрытие
        $('svg').attr('style',  'display:none');
      }))
      .pipe(rename('sprite-svg.svg'))                        // именуем результат
      .pipe(gulp.dest(dirs.source + '/img'));                // записываем результат В ПАПКУ ИСХОДНИКОВ (он оттуда будет скопирован в папку билда как и все прочие картинки)
  }
  else {
    console.log('Нет файлов для сборки SVG-спрайта');
    callback();
  }
});

// ЗАДАЧА: сшивка PNG-спрайта
gulp.task('png:sprite', function () {
  let fileName = 'sprite-' + Math.random().toString().replace(/[^0-9]/g, '') + '.png'; // формируем случайное и уникальное имя файла
  let spriteData = gulp.src('src/img/png-sprite/*.png')     // получаем список файлов для создания спрайта
    .pipe(plumber({ errorHandler: onError }))               // не останавливаем автоматику при ошибках
    .pipe(spritesmith({                                     // шьем спрайт:
      imgName: fileName,                                    //   - имя файла (сформировано чуть выше)
      cssName: 'sprite.scss',                               //   - имя генерируемого стилевого файла (там примеси для комфортного использования частей спрайта)
      padding: 4,                                           //   - отступ между составными частями спрайта
      imgPath: '../img/' + fileName                         //   - путь к файлу картинки спрайта (используеися в генерируемом стилевом файле спрайта)
    }));
  let imgStream = spriteData.img                            // оптимизируем и запишем картинку спрайта
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest('build/img'));
  let cssStream = spriteData.css                            // запишем генерируемый стилевой файл спрайта
    .pipe(gulp.dest(dirs.source + '/scss/'));
  return merge(imgStream, cssStream);
});

// ЗАДАЧА: Очистка папки сборки
gulp.task('clean', function () {
  return del([                                              // стираем
    dirs.build + '/**/*',                                   // все файлы из папки сборки (путь из константы)
    '!' + dirs.build + '/readme.md'                         // кроме readme.md (путь из константы)
  ]);
});

// ЗАДАЧА: Конкатенация и углификация Javascript
gulp.task('js', function () {
  return gulp.src([
      // список обрабатываемых файлов в указанной последовательности
      // добавьте сюда пути к JS-файлам, которые нужно взять в обработку
      dirs.source + '/js/jquery-3.1.0.min.js',
      dirs.source + '/js/jquery-migrate-1.4.1.min.js',
      dirs.source + '/js/script.js',
    ])
    .pipe(plumber({ errorHandler: onError }))             // не останавливаем автоматику при ошибках
    .pipe(concat('script.min.js'))                        // конкатенируем все файлы в один с указанным именем
    .pipe(uglify())                                       // сжимаем
    .pipe(gulp.dest(dirs.build + '/js'));                 // записываем
});

// ЗАДАЧА: Сборка всего (последовательность выполнения задач)
gulp.task('build', gulp.series(
  'clean',
  'svgstore',
  'png:sprite',
  gulp.parallel('style', 'img', 'js', 'fonts'),
  'pug',
  'html'
));

// ЗАДАЧА: Локальный сервер, слежение
gulp.task('serve', gulp.series('build', function() {

  browserSync.init({                                        // запускаем локальный сервер (показ, автообновление, синхронизацию)
    server: {
      baseDir: "./build/"
    },
    port: 3000,                                             // порт, на котором будет работать сервер
    startPath: '/index.html',                               // файл, который буде открываться в браузере при старте сервера
    // open: false                                          // возможно, каждый раз стартовать сервер не нужно...
  });

  gulp.watch(                                               // следим за HTML
    [
      dirs.source + '/*.html',                              // в папке с исходниками
      dirs.source + '/_include/*.html',                     // и в папке с мелкими вставляющимся файлами
    ],
    gulp.series('html', reloader)                           // при изменении файлов запускаем пересборку HTML и обновление в браузере
  );

  gulp.watch(
    dirs.source + '/pug/**/*.pug',
    gulp.series('pug', reloader)
  );

  gulp.watch(                                               // следим за LESS
    dirs.source + '/scss/**/*.scss',
    gulp.series('style')                                    // при изменении запускаем компиляцию (обновление браузера — в задаче компиляции)
  );

  gulp.watch(                                               // следим за SVG
    dirs.source + '/img/svg-sprite/*.svg',
    gulp.series('svgstore', 'html', 'pug', reloader)
  );

  gulp.watch(                                               // следим за PNG, которые для спрайтов
    dirs.source + '/img/png-sprite/*.png',
    gulp.series('png:sprite', 'style')
  );

  gulp.watch(                                               // следим за изображениями
    dirs.source + '/img/*.{gif,png,jpg,jpeg,svg}',
    gulp.series('img', reloader)                            // при изменении оптимизируем, копируем и обновляем в браузере
  );

  gulp.watch(                                               // следим за JS
    dirs.source + '/js/*.js',
    gulp.series('js', reloader)                            // при изменении пересобираем и обновляем в браузере
  );

}));

// ЗАДАЧА, ВЫПОЛНЯЕМАЯ ТОЛЬКО ВРУЧНУЮ: Отправка в GH pages (ветку gh-pages репозитория)
gulp.task('deploy', function() {
  return gulp.src('./build/**/*')
    .pipe(ghPages());
});

// ЗАДАЧА: Задача по умолчанию
gulp.task('default',
  gulp.series('serve')
);

// Дополнительная функция для перезагрузки в браузере
function reloader(done) {
  browserSync.reload();
  done();
}

// Проверка существования файла/папки
function fileExist(path) {
  const fs = require('fs');
  try {
    fs.statSync(path);
  } catch(err) {
    return !(err && err.code === 'ENOENT');
  }
}

var onError = function(err) {
    notify.onError({
      title: "Error in " + err.plugin,
    })(err);
    this.emit('end');
};
