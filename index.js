var access_token;
var owner_id;
var post_id;
var textspam;
// items[items.length * Math.random() | 0]

function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function openInNewTab(url) {
  window.open(url);
};

function process(result){
  if (result){
    startSpam(access_token, owner_id, post_id, textspam);
  }
}

function outputtxt(text, variable = "") {
  var timestamp = new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds()
  document.getElementById('output').value += timestamp + " — " + text + " " + variable + "\n";
};

function getImg(imageURL){
  $.ajax({
  url: imageURL,
  method: "GET",
  headers: {

    }
  }).then(response => {
      console.log(response);
  }).catch(error => {
      console.log(error);
  })

}

async function startSpam(access_token, owner_id, post_id, textspam) {
  var i = 0;
  var stop = 0;
  while (stop == 0) {
    $.ajax({
      url: "https://api.vk.com/method/users.get?v=5.131&access_token=" + access_token,
      type: 'GET',
      dataType: 'jsonp',
      cors: true,
      contentType: 'application/json',
      crossDomain: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      success: function(data) {
        if (data['response']) {
          i++;
          outputtxt('Комментарий отправлен. Всего отправлено: ', i);
        } else if (data['error']['error_code'] == 5) {
          outputtxt(data['error_msg']);
          stop = 1;
        } else {
          outputtxt('Неизвестная ошибка, обратитесь к создателю!', data);
          console.log(data);
          stop = 1;
        }
      }
    });
    await sleep(2000);
  }
};

function checktoken(access_token) {
  $.ajax({
    url: "https://api.vk.com/method/users.get?v=5.131&access_token=" + access_token,
    type: 'GET',
    dataType: 'jsonp',
    cors: true,
    contentType: 'application/json',
    crossDomain: true,
    SameSite: 'None',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Set-Cookie': 'cross-site-cookie=name; SameSite=None; Secure',
    },
  }).done(function(e) {
    if (e['response']) {
      outputtxt('Токен валидный');
      process(true);
    } else if (e['error']['error_code'] == 5) {
      outputtxt("Токен невалидный!");
      process(false);
    } else {
      outputtxt('Неизвестная ошибка, обратитесь к создателю!', e);
      console.log(e);
      process(false);
    }
  });
}
  

function getValues() {
  var captcha = getImg('https://vk.com/captcha.php?sid=931832507592&s=1');
  globalThis.access_token = document.getElementById('access_token').value;
  globalThis.owner_id = document.getElementById('owner_id').value;
  globalThis.post_id = document.getElementById('post_id').value;
  globalThis.textspam = document.getElementById('text_id').value;
  outputtxt("Начало работы");
  outputtxt("Для остановки работы скрипта обновите страницу");
  

  if (textspam.search(",") != -1) {
    globalThis.textspam = textspam.split(',');
    outputtxt('Количество вариаций сообщений: ', textspam.length)
  } else {
    outputtxt('Будет отправляться одно сообщение')
  }
  checktoken(access_token);
};
