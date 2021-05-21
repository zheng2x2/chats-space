// Icons made by Freepik from www.flaticon.com
const BOT_IMG = "https://image.flaticon.com/icons/svg/327/327779.svg";
const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";
const BOT_NAME = "BOT";
const PERSON_NAME = "Sajad";

var voiceChatManualStop = false;

$(function(){
  const msgerForm = $("#sendTextForm");//$(".msger-inputarea");
  const msgerInput = $(".msger-input");
  const msgerChat = $(".msger-chat");

  document.querySelector("#confirmStart").addEventListener('click', function(){
    document.querySelector(".modal").style.display = 'none';
    botResponse("홈");
    document.querySelector(".msger-chat").scrollTop = document.querySelector(".msger-chat").scrollHeight
  })

  msgerForm.on("submit", function(e) {
    e.preventDefault();
    reset();

    const msgText = msgerInput.val();
    if (!msgText) return;

    botResponse(msgText); //ajax
    msgerInput.val("");

    appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);
    // ttsMessage(msgText);
  });

  $('.mic-btn').click(function(e) {
    reset();
  // document.querySelector(".mic-btn").addEventListener("click", function(e){
    e.preventDefault();
    reset();
    voiceChatManualStop = false;
    //if (window.chatbot) {
    //  var result = window.chatbot.startVoiceRecognition();
    //} else {
      if (hasGetUserMedia()) {
        micStart();
      } else {
        alert("getUserMedia() is not supported by your browser");
        console.log("getUserMedia() is not supported by your browser");
      }
    //}
  });

  $('.voice-popup-close').click(function(e) {
    e.preventDefault();
    voiceChatManualStop = true;
    //if (window.chatbot) {
    //  var result = window.chatbot.stopVoiceRecognition();
    //} else
      micStop();
  });

  $('.voice-popup').click(function(e) {
    e.preventDefault();
    if (!window.chatbot)
      android_global_csr_audio_data(Math.floor(Math.random() * 200));
  });
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var o2oMediaStream = null;
  var o2oMediaContext = null;
  var o2oMediaSource = null;
  var o2oMediaProcessor = null;

  function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /* speech to text */
  function micStart() { console.log("mic started ...")
    $('.voice-popup').fadeIn();
    navigator.mediaDevices.getUserMedia(
        {audio:true}
    ).then((stream) => {
      $.ajax({
        url: '/stt/start',
        success: function(ret) {
          console.log(ret);
        },
        error: function(ret) {
          console.log(ret);
        }
      });

      console.log(1);
      o2oMediaStream = stream;
      // window.AudioContext = window.AudioContext || window.webkitAudioContext;
      o2oMediaContext = new AudioContext({sampleRate: 16000});

      console.log(2);
      o2oMediaSource = o2oMediaContext.createMediaStreamSource(stream);
      var bufferSize = 4096;
      var numberOfInputChannels = 1;
      var numberOfOutputChannels = 1;
      if (o2oMediaContext.createScriptProcessor) {
          o2oMediaProcessor = o2oMediaContext.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels);
      } else {
          o2oMediaProcessor = o2oMediaContext.createJavaScriptNode(bufferSize, numberOfInputChannels, numberOfOutputChannels);
      }

      o2oMediaSource.connect(o2oMediaProcessor);
      o2oMediaProcessor.connect(o2oMediaContext.destination);
      console.log(3);

      o2oMediaProcessor.onaudioprocess = function(e) {
        var floatbuffer = e.inputBuffer.getChannelData(0);
        var int16Buffer = new Int16Array(floatbuffer.length);

        let intSum = 0;
        for (let i = 0, len = floatbuffer.length; i < len; i++) {
            if (floatbuffer[i] < 0) {
                int16Buffer[i] = 0x8000 * floatbuffer[i];
            } else {
                int16Buffer[i] = 0x7FFF * floatbuffer[i];
            }
            intSum += Math.abs(int16Buffer[i]);
        }
        intSum /= floatbuffer.length;
        console.log(intSum);
        //var obj = {};
        //obj['pcm'] = Array.from(int16Buffer);
        $.ajax({
          type: 'POST',
          url: '/stt/data',
          contentType: 'application/json',
          data: JSON.stringify(Array.from(int16Buffer)),
          success: function(ret) {
            if (ret && !ret['running']) {
              console.log(ret);
              micStop();
              $('.msger-input').val(ret['finalResult']);
              if (!voiceChatManualStop)
                $(".msger-inputarea").submit();
            }
          },
          error: function(ret) {
            console.log(ret);
          }
        });
        android_global_csr_audio_data(Math.floor(intSum));
      }
    });
  }

  function micStop() {
    if (o2oMediaProcessor)
      o2oMediaProcessor.disconnect(o2oMediaContext.destination);

    if (o2oMediaSource)
      o2oMediaSource.disconnect(o2oMediaProcessor);

    if (o2oMediaStream) {
      o2oMediaStream.getTracks().forEach(function(track) {
        track.stop();
      });
    }

    $('.voice-popup').fadeOut();
    $('.voice-popup-text').html('');
  }

  /* Text to speech
  function ttsMessage(text) {
    $.ajax({
      type: 'POST',
      url: '/tts',
      contentType: 'application/json',
      data: JSON.stringify(text),
      success: function(ret) {
        fetch("data:audio/mp3;base64," + ret)
          .then(res => res.blob())
          .then(blob => {
            //console.log(blob);
            var url = window.URL.createObjectURL(blob);
            var audio = new Audio();
            audio.src = url;
            audio.play();
        });
      },
      error: function(ret) {
        console.log(ret);
      }
    });
  } */
  function botResponse(text) {
    console.log(JSON.stringify(text));
    $.ajax({
      type: 'POST',
      url: '/test',
      contentType: 'application/json',
      data: JSON.stringify(text),
      success: function(ret) {
        console.log(ret);
        getResponseText(ret.webhookPayload.o2o, ret.tts)
        // appendMessage(BOT_NAME, BOT_IMG, "left", ret['queryResult']['webhookPayload'].o2o.simpleResponse.textToSpeech);
      },
      error: function(ret) {
        appendMessage(BOT_NAME, BOT_IMG, "left", '내부오류!!!\n' + ret);
      }
    });
  }
  function appendMessage(name, img, side, res) {
    let msgHTML = `
      <div class="msg ${side}-msg">
        <div class="msg-img" style="background-image: url(${img})"></div>
        <div class="maxwidth-100">
          <div class="msg-info">
            <div class="msg-info-name">${name}</div>
            <div class="msg-info-time">${formatDate(new Date())}</div>
          </div>
          <div class="msg-bubble fill">
            `;
    if(typeof res === 'string') {
      msgHTML += `
            <div class="msg-text">${res}</div>`;
    }
    if (res.basicCard) {
      const obj = res.basicCard;
      msgHTML += `
            <div class="msg-text">
              <div>${obj.description}</div>
              <div class="img-size"><img src=${obj.image.url} alt="${obj.image.altImg}"/></div>
            </div>`;
    }
    if (res.cardList) {
      const obj = res.cardList;
      msgHTML += `
            <div class="msg-text">
              <div>${obj.listTitle}</div>
              <div>`;
      obj.items.forEach(function(item) {
        msgHTML += `
                <a class="list-item" href=${item.linkUrl}>
                  <div>
                    <div>${item.title}</div>
                    <div>${item.description}</div>
                  </div>
                  <img src=${item.image.url} alt="${item.image.altImg}"/>
                </a>`;
      });
      msgHTML += `
              </div>
            </div>`
    }
    if (res.carousel)
      msgHTML += carousel(res);

    msgHTML += `
          </div>
        </div>
      </div>`;

    msgerChat.append(msgHTML);
    msgerChat.scrollTop(msgerChat.scrollTop() + 500);
  }

  function carousel(data) {
    console.log(data);
    const items = data.carousel.items;
    let msg = `<div class="slide-list">`
    items.forEach(function(item, i) {
      msg += `<div class="slide-box">`;
      if(item.title)
        msg += `<h4> ${item.title}</h4>`

      if (item.subtitle)
        msg += `<div class="wrap-box"> ${item.subtitle}</div>`
      if (item.image)
        msg += `<img src="${item.image.url}" alt="${item.image.altImg}"/>`

      if (item.description)
        msg += `<p class="wrap-box"> ${item.description}</p>`

      if (item.linkButtons)
        item.linkButtons.forEach(function(btn){
          msg += `<br/><button>${btn}</button>`
        })
      msg += `</div>`
    })
    msg += `</div>`
    return msg;
  }

  function addSuggestions(chips){
    const chipsWrapper = document.querySelector(".chips-wrapper")
    chipsWrapper.innerHTML ='';
    chips.forEach( function(chip) {
      chipsWrapper.innerHTML += `
        <div class="rounded-chip">${chip}</div>
      `
    })

    document.querySelectorAll(".rounded-chip").forEach(function(chip){
      chip.addEventListener('click', function(){
        reset();
        appendMessage(PERSON_NAME, PERSON_IMG, "right", chip.innerHTML);
        msgerInput.value = "";

        botResponse(chip.innerHTML);
      })
    })
  }
  function getResponseText(o2o, tts) {

    if(tts) webAudioApi(tts);

    if(o2o.simpleResponse)
      appendMessage(BOT_NAME, BOT_IMG, "left", o2o.simpleResponse.displayText);

    if(o2o.basicCard || o2o.cardList || o2o.carousel)
      appendMessage(BOT_NAME, BOT_IMG, "left", o2o);

    if(o2o.suggestions) addSuggestions(o2o.suggestions);
  }

  function webAudioApi(byteArray) {
    o2oMediaContext = new AudioContext({sampleRate: 16000});
    // let frameCount = audioCtx.sampleRate * 2.0; // Create an empty two second stereo buffer at the sample rate of the AudioContext
    // let channels = 2; // Stereo
    // let myArrayBuffer = audioCtx.createBuffer(channels, frameCount, audioCtx.sampleRate);
    var buffer = new Uint8Array( byteArray.length );
    buffer.set( new Uint8Array(byteArray), 0 );
    const arrayBuffer = new ArrayBuffer(byteArray.length);
    const bufferView = new Uint8Array(arrayBuffer);
    for (let i=0; i<byteArray.length; i++) {
      bufferView[i] = byteArray[i];
    }

    o2oMediaContext.decodeAudioData(arrayBuffer)
      .then(function(myArrayBuffer){
          window.source = o2oMediaContext.createBufferSource(); // Get an AudioBufferSourceNode. This is the AudioNode to use when we want to play an AudioBuffer
          window.source.buffer = myArrayBuffer; // set the buffer in the AudioBufferSourceNode
          window.source.connect(o2oMediaContext.destination); // connect the AudioBufferSourceNode to the destination so we can hear the sound
          window.source.start(); // start the source playing
      }).catch(function(e){
        console.log("e >>> "+e)
      });
  }

  function reset() {
    if(window.source) {
      window.source.stop()
    }
    if(speechSynthesis.speaking) speechSynthesis.cancel()

    const chipsWrapper = document.querySelector(".chips-wrapper")
    chipsWrapper.innerHTML ='';
  }

  function formatDate(date) {
    const h = "0" + date.getHours();
    const m = "0" + date.getMinutes();

    return `${h.slice(-2)}:${m.slice(-2)}`;
  }
  // Utils
  function get(selector, root = document) {
    return root.querySelector(selector);
  }
  function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }
});

function android_global_csr_partial_result(string) {
    $('.voice-popup-text').html(string);
}

function android_global_csr_audio_data(level) {
    //$('.msger-input').val(level);
    var ratio = (level / 150) * 100;
    if (ratio > 100) {
      ratio = 100;
    }
    var scale = (ratio * 5 / 100);
    $('.outline').stop();
    //$('.voice-popup-text').html(level + ',' + (ratio * 5 / 100));
    $('.outline').css('transform', 'scale(' + ratio * 5 / 100 + ')');
    $('.outline').css('opacity', '1');
    $('.outline').css('border', '1px solid #7A89FF');

    $('.outline').animate({
      opacity: 0,
      borderWidth: '30px',
      borderColor: '#0B3082'
    },
    {
        duration: 1000,
        step: function(now, fx){
          if (now && fx.prop == 'opacity') {
            $('.outline').css('transform', 'scale(' + ((100-now) * scale / 100) + ')');
          }
        }
    });
}

function android_global_csr_show() {
    $('.voice-popup-text').html('Google Speech Recognition');
    $('.voice-popup').fadeIn();
}

function android_global_csr_hide() {
    $('.voice-popup').fadeOut();
    if (!voiceChatManualStop)
      $(".msger-inputarea").submit();
}

function android_global_csr_result(string) {
    $('.voice-popup-text').html(string);
    if (!voiceChatManualStop)
      $('.msger-input').val(string);
}
