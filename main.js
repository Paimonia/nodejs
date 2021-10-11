const fs = require('fs');
const path = require('path');
const program = require('commander');
const logs = require('./src/logs');

const fl = name => {
  return name.slice(0, 1).toUpperCase();
};

const readWrite = (sourceDir, destDir, file) => {
  destDir = path.join(destDir, fl(file));
  const sourceFile = path.join(sourceDir, file);
  const destFile = path.join(destDir, file);

  fs.readFile(sourceFile, (err, data) => {
    console.log('Копируем файла:', file);
    if (err) {
      console.error(err.message);
      return;
    }

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir);
    }

    fs.writeFile(destFile, data, err => {
      if (err) {
        console.log(err);
        return;
      }
    });
  });
};

const readDir = (source, dest) => {
  fs.readdir(source, (err, files) => {
    if (err) {
      console.error(err.message);
      return;
    }

    files.forEach(item => {
      var state = fs.statSync(path.join(source, item));
      if (state.isDirectory()) {
        var localBase = path.join(source, item);
        readDir(localBase, dest);
      } else {
        readWrite(source, dest, item);
      }
    });
  });
};

const deleteFolderRecursive = function (path) {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file) {
      var curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};
program
  .version('1.0.0')
  .option('-s, --source-dir <path>', 'Директория которую надо отсортировать')
  .option('-d, --destination-dir <path>', 'Директория результат работы парсинга', './output')
  .option('-r, --rm [status]', 'Удалить исходную директорию', false)
  .parse(process.argv);
var dir = process.cwd();



process.on('exit', code => {
  switch (code) {
  case 404:
    logs.error('Нет такого файла или директории:', path.resolve(program.sourceDir));
    break;
  default:
    if (program.rm) {
      deleteFolderRecursive(sourceDir);
      console.log('\nИсходная директория удалена');
    }
    break;
  }
});

if (program.sourceDir === '-d' || !program.sourceDir || !program.destinationDir) {
  console.info('Не был предан обязательный парамер: ');

  if (!program.sourceDir) {
    logs.error('Параметр -s, --source-dir:', 'пуст');
    program.help();
    process.exit(500);
  }
}

var sourceDir = path.resolve(dir, path.normalize(program.sourceDir));
var destDir = path.resolve(dir, path.normalize(program.destinationDir));

if (!fs.existsSync(sourceDir)) {
  process.exit(404);
}

if (!fs.existsSync(program.destinationDir)) {
  fs.mkdirSync(destDir);
}
readDir(sourceDir, destDir);