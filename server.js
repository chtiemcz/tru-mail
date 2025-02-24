// Developer - Ivan 💲
// Github - https://github.com/chtiemcz
// Этот скрипт поможет более быстрее понять модуль imap от node.js, благодаря примеру и комментариям.
// Сделано с душой ❤️‍🩹


// Вызов модуля imap, util, dotenv
require('dotenv').config();
const Imap = require('imap');
const { inspect } = require('util');


// Данные для входа в IMAP 
const imap = new Imap ({
  user: process.env.EMAIL_USER,   // Почта (берется с файла .env)
  password: process.env.EMAIL_PASSWORD,   // Пароль (берется с файла .env)
  host: 'imap.firstmail.ltd',  // Хост подключения
  port: 993,   // Порт подключения
  tls: true,
  connTimeout: 5000,    // Устанавливаем тайм-аут подключения в 5 секунд
  authTimeout: 5000,   // Тайм-аут аутентификации
});

// Открытие бокса, куда приходят сообщения
function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

imap.once('ready', function() {
  openInbox(function(err, box) {
    if (err) throw err;
    var f = imap.seq.fetch('1:*', {
      bodies: ['TEXT', ('HEADER.FIELDS (FROM TO SUBJECT DATE)')],
      struct: true
    });
    f.on('message', function(msg, seqno) {
      console.log('Сообщение #%d', seqno);
      var prefix = '(#' + seqno + ') ';
      msg.on('body', function(stream, info) {
        var buffer = '';
        stream.on('data', function(chunk) {
          buffer += chunk.toString('utf8');
        });
        stream.once('end', function() {
          console.log(prefix + 'Парсинг заголовка: %s', inspect(Imap.parseHeader(buffer)));
        });
      });
      msg.once('attributes', function(attrs) {
        console.log(prefix + 'Атрибуты: %s', inspect(attrs, false, 8));
      });
      msg.once('end', function() {
        console.log(prefix + 'Готово');
      });
    });
    f.once('error', function(err) {
      console.log('Ошибки: ' + err);
    });
    f.once('end', function() {
      console.log('Проверены все письма!');
      imap.end();
    });
  });
});


imap.once('error', function(err) {
  console.log(err);
});

// конец подключения
imap.once('end', function() {
  console.log('Подключение закончено.');
});

imap.connect();




