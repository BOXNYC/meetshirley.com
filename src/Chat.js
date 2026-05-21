import MediaSprite from './MediaSprite-v2.0.js'

export class PromptInput {
    static set enabled( bool ) {
      const $input = document.getElementById('prompt-input')
      $input.disabled = !bool
      if (bool) $input.removeAttribute('disabled')
      else $input.setAttribute('disabled', 'disabled')
    }
  }

  export class Article {
    static scrollDown() {
      const $article = document.querySelector('article')
      if (!$article) return
      let $bots = document.querySelectorAll('.bot')
      if ($bots && $bots.length > 1) {
        $article.scrollTo({ behavior: 'smooth', top: $bots[$bots.length-1].offsetTop })
        return
      }
      $article.scrollTo({ behavior: 'smooth', top: $article.scrollHeight })
    }
  }
  
  export class DB {
    static insert( data, onSuccess ) {
      if ( typeof data !== 'string' ) data = JSON.stringify(data)
      onSuccess = onSuccess || function(){}
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          convo: data,
          token: import.meta.env.VITE_DB_TOKEN
        })
      }
      fetch('https://lwih.box.biz/api/', requestOptions)
        .then(response => response.json())
        .then(data => onSuccess(data))
        .catch(err=>console.error(err))
    }
  }
  
  export class Video {
    static getVideo() {
      const $video = document.querySelector('video')
      if ( typeof $video.videoSprite === 'undefined' ) {
        let segments = {
          startSpeaking: [{ fromTime: 0, toTime: 6, onEnded: 'loop' }],
          startSpeaking1: [{ fromTime: 24, toTime: 25, onEnded: 'loop' }],
          loop: [{ fromTime: 10, toTime: 13, loops: Infinity }],
          loop2: [{ fromTime: 18, toTime: 22, loops: Infinity }],
          stopSpeaking: [{ fromTime: 6, toTime: 7 }],
          stopSpeaking1: [{ fromTime: 17, toTime: 18 }]
        }
        $video.videoSprite = new MediaSprite($video, segments)
      }
      return $video
    }
    static getAudio() {
        const $audio = document.querySelector('audio')
        $audio.volume = 1
        return $audio
    }
    static play() {
      const $video = Video.getVideo()
      if ($video) $video.play()
    }
    static pause() {
      const $video = Video.getVideo()
      if ($video) $video.pause()
    }
    static startSpeaking() {
      const {videoSprite} = Video.getVideo()
      if (videoSprite) videoSprite.play(['startSpeaking', 'startSpeaking1'])
      const $audio = Video.getAudio()
      $audio.play()
    }
    static stopSpeaking() {
      const {videoSprite} = Video.getVideo()
      if (videoSprite) videoSprite.play(['stopSpeaking', 'stopSpeaking1'])
      const $audio = Video.getAudio()
      $audio.pause()
    }
  }
  
export const addEnterBtn = (A, onInteraction) => {
  onInteraction = onInteraction || function(){}
  document.body.classList.add('needs-click')
  const $enter = document.createElement('div');
  $enter.id = 'enter'
  $enter.innerHTML = `
    <div class="container">
      <div class="row">
        <div class="mb-3 mb-md-0 col-lg-6 d-flex justify-center">
          <div id="shirley-avatar"></div>
        </div>
        <div class="col-lg-6">
          <h1 class="p-0" data-sprite="logo">Meet Shirley</h1>
          <p>Hello Human, my name is Shirley. I'm a Vuvv here to learn about your kind. Go ahead, ask me anything.</p>
        </div>
      </div>
      <div class="row">
        <div class="col text-center">
          <div class="btn btn-secondary my-3 w-100" id="close-needs-click">Make first contact with Shirley</div>
        </div>
      </div>
    </div>
  `
  $enter.onclick = e => {
    A.play()
    onInteraction.call($enter, e)
    $enter.parentNode.removeChild($enter)
    document.body.classList.remove('needs-click')
  }
  document.body.appendChild($enter)

  const $logo = document.getElementById('meet-shirley')
  if ($logo) {
    let clickTimeout,
        clickCount = 0
    $logo.onclick = e => {
      e.preventDefault()
      clickCount++
      if ( clickCount >= 5 ) {
        localStorage.setItem('conversation', '[]')
        window.location.href = window.location.href
      }
      clearTimeout(clickTimeout)
      clickTimeout = setTimeout(()=>{
        clickCount = 0
      }, 200)
    }
  }
}