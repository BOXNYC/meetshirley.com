const regExpBadWords =
    /fuck|shit|faggot|nigger|cunt/gi
const regExpInappropriatePhrase =
    /(suck|lick|finger)\s*(on|a|)\s*(my|)\s*(ass|dick|pussy|tit|nipple|penis|cunt|vagina|vag|anal|nuts|balls|mouth)/gi
export const InputFilterType = {
    BAD_WORDS: 'bad-words',
    INAPPROPRIATE: 'inappropriate'
}
export class InputFilter {
    static check(q) {
      const badWordMatches = q.match(regExpBadWords)
      if ( badWordMatches )
        return {matches: badWordMatches, type: InputFilterType.BAD_WORDS}
      const inappropriateMatches = q.match(regExpInappropriatePhrase)
      if ( inappropriateMatches )
        return {matches: inappropriateMatches, type: InputFilterType.INAPPROPRIATE}
      return false
    }
    static alert(title, message) {
      const $alert = document.createElement('div');
      $alert.id = 'enter'
      $alert.innerHTML = `
        <div class="container">
          <div class="row">
            <div class="mb-3 mb-md-0 col-md-6 d-flex justify-center">
              <div id="shirley-avatar"></div>
            </div>
            <div class="col-md-6">
              <h1>${title}</h1>
              <p>${message}</p>
            </div>
          </div>
        </div>
      `
      setTimeout(() => {
        document.body.classList.remove('alerted')
        $alert.parentNode.removeChild($alert)
      }, 6000)
      document.body.classList.add('alerted')
      document.body.appendChild($alert)
    }
}