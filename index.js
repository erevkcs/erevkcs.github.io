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

async function getCSolve(img){
  const codemap = " 24578acdehkmnpqsuvxyz";
  const session = new onnx.InferenceSession({
      backendHint: "cpu"
  });
  const session2 = new onnx.InferenceSession({
      backendHint: "cpu"
  });
  await session.loadModel("models/captcha_model.onnx");
  await session2.loadModel("models/ctc_model.onnx");

  var oc = document.createElement("canvas"),
      octx = oc.getContext("2d");
  const width = 128;
  const height = 64;
  oc.width = width;
  oc.height = height;
  octx.drawImage(img, 0, 0, oc.width, oc.height);
  // step 2
  input = Float32Array.from(octx.getImageData(0, 0, width, height).data);
  // Run model with Tensor inputs and get the result.
  const inputTensor = new onnx.Tensor(input, "float32", [
      1,
      4 * width * height
  ]);
  const outputTensor = (await session.run([inputTensor])).get("argmax");
  outputTensor.type = "float32";
  outputTensor.internalTensor.type = "float32";
  const outputMap2 = await session2.run([outputTensor]);
  const outputData2 = outputMap2.values().next().value.data;
  const captcha = Array.from(outputTensor.data)
      .filter(function(e, i) {
          return Array.from(outputData2.values())[i] > 0;
      })
      .map((x, i) => codemap[x])
      .join("");
  return captcha;
}

function getImg(imageURL){
  $.ajax({
    url: 'https://wdc-cors-proxy.herokuapp.com/'+imageURL,
    type: "GET",
    contentType: 'image/png',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
    success: function(data){
      console.log(data);
      // var canvas = document.createElement('canvas'),
      //   ctx = canvas.getContext('2d');

      // canvas.height = img.naturalHeight;
      // canvas.width = img.naturalWidth;
      // ctx.drawImage(img, 0, 0);

      // var uri = canvas.toDataURL('image/png'),
      // b64 = uri.replace(/^data:image.+;base64,/, '');

      }
      // getCSolve(img);
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
