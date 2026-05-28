import React from "react"
const GOOGLE_API_KEY = 'AIzaSyD4Uw9le3tLoyEPwKSAYLUJ1Plv_hPDVUo'

function anchorfy(w) {
    w = w.replace(
        /(http|https|)(\:\/\/|)([^\.]{1,}\.[a-z]{2,})(\/|)([^ ]{1,}|)/ig,
        (str, proto, dir, domain, sep, path) => {
          //console.log(proto, dir, domain, sep, path)
          if (domain && domain != '') {
            if (!proto) proto = 'http'
            if (!dir) dir = '://'
            return `<a href="${proto}${dir}${domain}${sep}${path}">${domain}</a>`
          }
          return str
        }
    )
    return w
}

class Vuvv {
    static jsx( text, id, user ) {
        const words = text.trim().split(/[\n\r\t\s\ ]{1,}/ig).map((w,i)=>{
            const v = w.toLowerCase()
                .replace(/[^a-z]{1,}|[aeiou]/g, '')
                .replace(/(\w)\1+/g, (str, match) => { return match[0] } )
            const l = w.replace(/[^a-z0-9]{1,}/ig, '').length
            w = anchorfy(w)
            return (<React.Fragment key={id+i}><span data-vuvv={v} data-length={l} dangerouslySetInnerHTML={{ __html: `<br />${w}` }}></span> </React.Fragment>)
        })
        if ( words.length < 4 ) return words
        const lastWord = words.pop()
        const secondLastWord = words.pop()
        words.push((
            <span className="nowrap" key={'wrap'+id}>{secondLastWord}{lastWord}</span>
        ))
        return words
    }
    static ordinal(i) {
        var j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    }
    static htmlToSsml( html ) {
        let count = 1;
        html = html.replace(/vuvv/gi, 'vuhv')
        html = html.replace(/CO-PROSPERITY/gi, 'co prosperity')
        html = '<speak>' + 
            html.replace(/\<\/span\>|\<br\s*\/*\>|\<\/a\>/gi, '')
            .replace(/\<span class\=\"nowrap\"\>/gi, '')
            .replace(/\<a\s*[^\>]*\>/gi, '')
            .replace(/\<span\s*[^\>]*\>/gi, (m, i)=>{
                const markup = '<mark name="'+Vuvv.ordinal(count)+'"/>'
                count++
                return markup
            }) + '</speak>'
        return html
    }
    static speak( text, onProgress ) {
        let type = 'text'
        if ( text.indexOf('<speak>') > -1 ) type = 'ssml'
        onProgress = onProgress || function(){}
        const url = 'https://texttospeech.googleapis.com/v1beta1/text:synthesize?key='+GOOGLE_API_KEY
        const data = {
            input: {},
            voice: {
                languageCode: 'en-us',
                //name: 'en-US-News-K',
                name: 'en-US-Standard-E',
                ssmlGender: 'FEMALE'
            },
            audioConfig: {
                audioEncoding: 'MP3'
            }
        }
        if ( type == 'ssml' ) data.enableTimePointing = [
            'SSML_MARK'
        ]
        data.input[ type ] = text
        const otherParam = {
        headers: {
            "content-type":"application/json; charset=UTF-8"
        },
        body: JSON.stringify(data),
        method: "POST"
        };
        fetch( url, otherParam )
        .then(data => { return data.json() })
        .then(res => {
            const mp3 = 'data:audio/mp3;base64,'+res.audioContent
            const audio = document.getElementById('text-to-speech') //new Audio(mp3)
            audio.src = mp3
            audio.ontimeupdate = e => onProgress.call(Vuvv, e.target.currentTime, res.timepoints, e.target.duration )
            audio.play()
        })
        .catch(error => { console.log(error) })
    }
    static progress( timeSeconds, timepoints, $container ) {
        // console.log('timepoints', timepoints)
        const $els = $container.querySelectorAll('[data-vuvv]')
        $els.forEach(($el, index) => {
            const elTimeSeconds = timepoints[index].timeSeconds
            if ( timeSeconds >= elTimeSeconds && !$el.classList.contains('active') ) $el.classList.add('active')
            else if ( timeSeconds < elTimeSeconds && $el.classList.contains('active') ) $el.classList.remove('active')
        })
    }
}
export default Vuvv