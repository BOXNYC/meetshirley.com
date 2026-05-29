import { useEffect, useState, useContext, useRef } from 'react'
import { Conversation } from './Conversation'
import { PromptForm } from './PromptForm'
import Vuvv from '../Vuuv'
import { PromptInput, Article, DB, Video, addEnterBtn } from  '../Chat'
import {InputFilter, InputFilterType} from '../InputFilter'
import settingsContext  from '../settingsContext'
import useMediaQuery from '../mediaQuery'


class Speak {
  static bubbleIndex( index, delayTranslationSeconds ) {
    let $bubble
    if ( index < 0 ) {
      $bubble = document.querySelector(`[data-bubble-index="${index}"]`)
    } else {
      const $bubbles = document.querySelectorAll('.bot, .user')
      $bubble = typeof $bubbles[index] === 'object' ? $bubbles[index] : null
    }
    $bubble.classList.add('shirley-last-response')
    $bubble.classList.add('in-vuvv')
    const onProgress = ( timeSeconds, timepoints, duration ) => {
      Vuvv.progress( timeSeconds, timepoints, $bubble )
      if ( timeSeconds == duration ) {
        $bubble.querySelectorAll('.active').forEach($el=>$el.classList.remove('active'))
        Video.stopSpeaking()
        $bubble.classList.remove('shirley-last-response')
      }
    }
    
    setTimeout(()=>{
      $bubble.classList.remove('in-vuvv')
      Vuvv.speak( Vuvv.htmlToSsml($bubble.innerHTML), onProgress )
    }, delayTranslationSeconds * 1000)
  }
}

window.onresize = e=> Article.scrollDown()
window.Video = Video

function Chat() {
  
  const { orientation, ratio } = useMediaQuery()

  const settings = useContext(settingsContext)

  const [question, setQuestion] = useState("")
  const [conversation, setConversation] = useState(() => {
    const localValue = localStorage.getItem('conversation')
    if (localValue == null) return []
    return JSON.parse(localValue)
  })
  const [isLoading, setIsLoading] = useState(false)
  const [trainedModelResponded, setTrainedModelResponded] = useState(false)
  const [showLoremVuvv, setShowLoremVuvv] = useState(false)
  useEffect(() => {
    localStorage.setItem('conversation', JSON.stringify(conversation))
    Article.scrollDown()
    document.getElementById('prompt-input').focus()
    setConversation(con=>{
      let conversationChanged = false
      const newCon = con.map((item, index)=>{
        if (typeof item.speak === 'boolean') {
          Speak.bubbleIndex(index, settings.UX.delayTranslationSeconds)
          Video.startSpeaking()
          delete item.speak
          conversationChanged = true
        }
        return item
      })
      if (conversationChanged) {
        return newCon
      }
      return con
    })
  }, [conversation])

  const [firstRender, setFirstRender] = useState(false)
  useEffect(() => {
    if (firstRender) return;
    setFirstRender(val=>{
      if (val) return true
      //
      Article.scrollDown()
      
      const A = document.getElementById('text-to-speech')//new Audio()
      const $list = document.querySelector('.length-0.list-group')
      const intro = ()=> {
        if (!$list) return
        $list.classList.add('user-interaction')
        setTimeout(()=>{
          Speak.bubbleIndex(-2, settings.UX.delayTranslationSeconds)
          Video.startSpeaking()
          document.querySelector('[data-bubble-index="-2"]').classList.add('speaking')
        }, 1000)
        setTimeout(()=>{
          Speak.bubbleIndex(-1, settings.UX.delayTranslationSeconds)
          Video.startSpeaking()
          document.querySelector('[data-bubble-index="-1"]').classList.add('speaking')
        }, 4000)
      }
      A.play().then(()=>{
        intro()
      }).catch(error=>{
        addEnterBtn(A, ()=>{
          intro()
        })
      })
      //
      return true
    })
  })
  
  Article.scrollDown()

  const random6 = useRef([])
  const updateRandom6 = ()=> {
    let r = Math.round(Math.random()*5)
    if( random6.current.length >= 6 ) {
      random6.current = [r]
      //console.log(random6.current)
      return
    }
    while(random6.current.indexOf(r)>-1) {
      r = Math.round(Math.random()*5)
    }
    random6.current.push(r)
    //console.log(random6.current)
  }

  function onSubmit(e) {
    let q = false
    switch( typeof e ) {
      case 'object' :
        e.preventDefault()
        break
      case 'string' :
        q = e
        break
    }
    q = q || question

    updateRandom6()
    
    const inputFiltered = InputFilter.check(q)
    if ( inputFiltered ) {
      let title, message
      switch(inputFiltered.type) {
        case InputFilterType.BAD_WORDS:
          title = 'Bad words'
          message = 'Please don\'t use foul language when speaking to Shirley, she doesn\'t appreciate it.'
          break
        case InputFilterType.INAPPROPRIATE:
          title = 'Inappropriate'
          message = 'Please don\'t use inappropriate language when speaking to Shirley, she doesn\'t appreciate it.'
          break
      }
      InputFilter.alert( title, message )
      setQuestion(()=>{ return "" })
      return;
    }

    setConversation(messages=>{
      return [...messages, {content: q, user: 'user'}]
    })
    
    async function run(question) {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trained', question }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'API error')
      return [data.outputText]
    }

    console.log('Trained prompt (altered)', q)

    run(q).then(([answer])=>{
      
      // Load helper
      setTrainedModelResponded(v=>{return true})
      setShowLoremVuvv(v=>{return true})
      Video.startSpeaking()
      Article.scrollDown()

      console.log('Trained response', answer)
      answer = answer.replace(/Shirley/ig, 'I')
      answer = answer.replace(`\"${q}\"`, '')
      answer = answer.replace(`I would likely respond with confusion, as it has`, `I'm confused, I have`)
      answer = answer.replace(`It would likely ask for more information about the topic, such as`, `Maybe tell me `)
      answer = answer.replace(/\"Vuvv\-Vuvv\"/gi, "'Vuvv-Vuvv'")
      answer = answer.replace(/Landscape\s*[\w]{1,}/g, m=>{
        return m !== 'Landscape with'
          ? m.replace('Landscape', 'Landscape with Invisible Hand')
          :m
      })
      answer = answer.replace('name is I', 'name is Shirley')
      answer = answer.replace(/(Shirley|I)\s*(would|would likely)\s*(reply|respond)\s*(with|)\s*/ig, '')
      answer = answer.replace(/BY\s*(EXPLAINING|RESPONDING)\s*(THAT|)\s*(IT IS|IT\'S)/gi, 'It is')
      answer = answer.replace(/\n/g, '')

      const quoteSep = answer.split('"')
      if ( quoteSep.length >= 3 ) {
        answer = quoteSep[1]
        if ( quoteSep.length==3 && answer.trim().match(/\?$/ig) && quoteSep[2].trim().length > 0 )
          answer = quoteSep[2]
      }

      let adjectives = ['short'],
          prefix = 'In a',
          suffix = 'way',
          action = 'say',
          temperature = 0.0,
          randAdj = 0
      
      const hash = (window.location.hash || '')
      if ( hash && hash != '' && hash != '#' ){
        const params = new URLSearchParams(hash.replace('#', ''))
        let _temp = params.get('temp')
        if ( _temp ) {
          _temp = parseFloat(_temp)
          if ( typeof _temp === 'number' && !isNaN(_temp) ) temperature = _temp
        }
        let _adj = params.get('adj')
        if ( _adj ) {
          if ( typeof _adj === 'string' ) {
            if (_adj == 'none') {
              action = 'Rephrase this'
              adjectives = []
            } else {
              adjectives = _adj.trim().split(/\,\s*/g)
            }
          }
        }
        let _randAdj = params.get('rand')
        if( _randAdj ) {
          _randAdj = parseInt(_randAdj)
          if ( typeof _randAdj === 'number' && !isNaN(_randAdj) )
            randAdj = _randAdj
        }
      }
      
      if (randAdj) {
        const _ra = []
        adjectives.forEach(a=>{
          if ( a == 'short' ) return _ra.push(a)
          if ( !Math.round(Math.random()*(randAdj-1)) )  _ra.push(a)
        })
        if ( adjectives.length != _ra.length ) adjectives = _ra
      }

      console.log('temperature:', temperature, 'adjectives:', adjectives)

      if ( !adjectives.length ) {
        prefix = ''
        suffix = ''
      } else if (adjectives.length > 1) {
        adjectives[ adjectives.length -  1] = 'and ' + adjectives[ adjectives.length -  1]
      }
      
      console.log('Trained response (altered)', answer)
      const untrainedPrompt = `${prefix} ${adjectives.join(' ')} ${suffix} ${action}: "${answer}"`.trim()
      console.log('Untrained prompt', untrainedPrompt)

      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rephrase', prompt: untrainedPrompt, temperature }),
      }).then(r => r.json()).then(res=>{

        // Load helper
        setTrainedModelResponded(v=>{return false})
        setShowLoremVuvv(v=>{return false})
        Article.scrollDown()

        let funnyAnswer = res.content
        funnyAnswer = funnyAnswer.replace(/vuvvish|vuvv\-ish|vuvv\-ese|vuvv\-nese|vuvvese/ig, 'Vuvv')
        funnyAnswer = funnyAnswer.replace(/for us humans/gi, 'for you humans')
        console.log('Untrained response', funnyAnswer)
        setIsLoading(()=>{ return false })
        setConversation(messages=>{
          return [...messages, {
            content: funnyAnswer,
            user: 'bot',
            speak: true,
          }]
        })
        PromptInput.enabled = true
        // Save
        /* const today = new Date(),
              date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
        DB.insert({
          q, funnyAnswer, date
        }); */
      })
      
    })
    setQuestion(()=>{ return "" })
    setIsLoading(()=>{ return true })
    PromptInput.enabled = false
  }

  function deleteMessage( index ) {
    setConversation(messages=>{
      return messages.filter((message, i)=>{
        return i != index
      })
    })
  }

  function askAgain( index ) {
    const q = conversation[index]?.content || null
    if ( !q ) return
    onSubmit(q)
    Article.scrollDown()
  }
  
  const rand6 = random6.current[random6.current.length-1]
  const rand = ' is-loading-'+rand6

  return (<>
    <main className={'d-flex flex-1 p-relative'+(isLoading?' is-loading'+rand: '')+(trainedModelResponded?' trained-model-responded':'')}>
      {/*<video src='/Shirley-1--4-clips.mp4' poster='/Shirley-1--4-clips.jpg' muted playsInline></video>*/}
      <video muted playsInline data-poster='/Shirley-1--4-clips.jpg'>
        { orientation.portrait && (<source src="/shirley-sprite-square-muted.mp4" type="video/mp4"></source>)}
        { orientation.landscape && (<source src="/shirley-sprite-landscape-muted.mp4" type="video/mp4"></source>)}
        { ratio == 1/1 && (<source src="/shirley-sprite-square-muted.mp4" type="video/mp4"></source>)}
      </video>
      <audio src='/scratching-plus-10db.mp3' loop></audio>
      <audio id='text-to-speech' src='/1-second-of-silence.mp3'></audio>
      <article className='px-4 pt-4 w-100'>
        <Conversation conversation={conversation} deleteMessage={deleteMessage} askAgain={askAgain} showLoremVuvv={showLoremVuvv} />
      </article>
    </main>
    <footer>
      <PromptForm isLoading={isLoading} question={question} onSubmit={onSubmit} setQuestion={setQuestion} />
    </footer>
  </>)

}

export default Chat
