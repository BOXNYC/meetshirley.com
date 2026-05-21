import { useEffect, useState, useContext, useRef } from 'react'
import { InputGroup, FormControl, Spinner } from 'react-bootstrap';
import shortid from 'shortid'
import Vuuv from '../Vuuv.jsx'
export function PromptForm({isLoading, question, onSubmit, setQuestion}) {
    
    const [muted, setMuted] = useState(false)
    const $muteBtn = useRef()
    function toggleMute(e) {
      $muteBtn.current.classList.toggle('muted')
      const muted = $muteBtn.current.classList.contains('muted')
      document.querySelectorAll('video, audio').forEach($media=>$media.volume = muted ? 0 : 1)
    }
    
    return (<>
        <form onSubmit={onSubmit} className='my-3 d-flex'>
            <span ref={$muteBtn} onClick={toggleMute} className='btn mute-toggle d-inline-block' data-sprite="mute"></span>
            <InputGroup>
              <FormControl type='text'
                id='prompt-input'
                value={question}
                autoComplete='off'
                onChange={e=>setQuestion(question=>e.target.value)} 
                placeholder="Ask me anything."
                required="required"
                className='p-3'
              />
              <button id='prompt-btn' className={'btn btn-outline-secondary'+(isLoading ? ' disabled':'')}>
                <Spinner size='sm' className={!isLoading&&'d-none'} /> {Vuuv.jsx('Ask', shortid.generate())}
              </button>
            </InputGroup>
        </form>
    </>)
}