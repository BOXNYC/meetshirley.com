import { ListGroup, ListGroupItem } from 'react-bootstrap'
//import shortid from 'shortid'
import Vuuv from '../Vuuv.jsx'
import LoremVuvv from './LoremVuvv.jsx'
import '../Vuuv.css'

const itemClasses = 'mb-4 pt-4 text-uppercase'
export function Conversation({ conversation, deleteMessage, askAgain, showLoremVuvv }) {
    return (
        <ListGroup key={-3} className={'length-'+conversation.length}>
            <ListGroupItem key={-2} data-bubble-index="-2" className={itemClasses + ' ' + 'change'}>
                {Vuuv.jsx('Hello and welcome to MeetShirley.com', `-2-2`)}
            </ListGroupItem>
            <ListGroupItem key={-1} data-bubble-index="-1" className={itemClasses + ' ' + 'consec'}>
            {Vuuv.jsx('Ask me anything', `-1-1`)}
            </ListGroupItem>
            {conversation.map((message, i)=>{
                const consec = ( conversation[i-1] ? (conversation[i-1].user == message.user ? 'consec' : 'change') : 'change' )
                return (
                    <ListGroupItem key={i} className={itemClasses + ' ' + message.user + ' ' + consec}>
                        {Vuuv.jsx(message.content, `${i}${i}`)}
                        {
                            message.user=='bot' && 
                            message.content.match(/landscape/gi) && 
                            (<div className="bubble-link"><a href="https://www.mgm.com/titles/landscape-with-invisible-hand/" target="_blank">LandscapeMovie.com</a></div>)
                        }
                        <small className={'options text-xs visibility-hidden position-absolute bottom-0 px-3 '+(message.user=='user'?'end-0':'start-0')+(message.content.length < 10 ? ' xs' : '')}>
                            <a
                                className='delete-btn text-danger'
                                onClick={ e=>deleteMessage(i) }
                            >delete</a> {message.user=='user' && <a
                                className='again-btn text-info'
                                onClick={ e=>askAgain(i) }
                            >ask again</a>}
                        </small>
                    </ListGroupItem>
                )
            })}
            {showLoremVuvv && (<LoremVuvv />)}
        </ListGroup>
    )
}