
function MediaSprite( $media, segments, events ) {
  //console.log(segments);
  var $D = document,
      $B = $D.body,
      $  = $D.querySelector.bind( $D ),
      $$ = $D.querySelectorAll.bind( $D ),
      each = function( fn ){
        if ( !fn || !this.length ) return this;
        for ( var i = 0; i < this.length; i++ )
          fn.call( this[i], i, this[i] );
        return this;
      },
      $each = HTMLElement.prototype.each = function(fn){
        fn.call(this, 0, this);
        return this;
      },
      $each = NodeList.prototype.each = Array.prototype.each = each;
  
  // Private attributes
  // ------------------
  
  var scope = this,
      Events = {
        events: parseEvents( events || {} ),
        onSegmentEnded: function( seg ){
          Events.trigger( 'segmentEnded', seg );
        },
        onSegmentLooped: function( seg ){
          Events.trigger( 'segmentLooped', seg );
        },
        onSegmentProgress: function( seg, data ){
          Events.trigger( 'segmentProgress', seg, data );
        },
        onPlay: function( seg ){
          Events.trigger( 'play', seg );
        },
        onPause: function( seg ){
          Events.trigger( 'pause', seg );
        },
        trigger: function( type, seg, data ){
          var event = { type: type, segment: seg };
          if ( data ) for( var k in data ) event[ k ] = data[ k ];
          Events.events.each( function( i, e ){
            if ( e.type == type ) e.fn.call( scope, event );
          } );
        }
      };
  
  // Public attributes
  // -----------------
  
  this.ID = {};
  this.media = parseMedia( $media );
  this.segments = parseSegments( segments || {} );
  this.segment = {};
  this.playing = !this.media.paused;
  
  // Public methods
  // --------------
  
  this.connect = function() {
    
    this.media.addEventListener( 'timeupdate', onTimeUpdate );
    this.media.addEventListener( 'play', onPlay );
    this.media.addEventListener( 'pause', onPause );
    
  }
  
  this.disconnect = function() {
    
    this.media.removeEventListener( 'timeupdate', onTimeUpdate );
    this.media.removeEventListener( 'play', onPlay );
    this.media.removeEventListener( 'pause', onPause );
    
  }
  
  this.addSegment = function( id, fromTime, toTime, loops ) {
    
    this.ID[ id ] = id;
    
    if ( typeof this.segments[ id ] === 'undefined' ) this.segments[ id ] = [];
    
    this.segments[ id ].push({
      fromTime: fromTime === 'undefined' ? 0 : fromTime,
      toTime: toTime === 'undefined' ? -1 : toTime,
      loops: loops === 'undefined' ? 0 : loops,
      id: id
    });
    
  }
  
  this.play = function( id, overflow ) {
    
    id = ( typeof id === 'object' && typeof id.length === 'number' )
        ? id[ Math.floor( Math.random() * id.length ) ]
        : id;
    overflow = typeof overflow === 'number' ? overflow + 1 : 1
    
    if ( typeof this.segments[ id ] === 'object' ) {
      
      this.segment = getSegment( this.segments[ id ] );
      
    } else {
      
      console.error( 'MediaSprite: "' + id + '" not found.' )
      
      return this;
      
    }
    
    if ( typeof this.segment._loops === 'number' ) delete this.segment._loops;
    
    this.media.currentTime = this.segment.fromTime;
    this.media.play();
    
    if ( this.media.currentTime != this.segment.fromTime && overflow < 32 ) {
      
      console.log( 'MediaSprite.play( "' + id + '" ) failed, attempt number ' + overflow )
      
      return this.play( id, overflow )
      
    }
    
    return this;
    
  }
  
  this.pause = function( id ) {
    
    this.media.pause();
    
    if ( id ) {
      
      if ( typeof this.segments[ id ] === 'object' ) this.segment = this.segments[ id ];
      
      this.media.currentTime = this.segment.fromTime;
    
    }
    
  }
  
  this.addEventListener = function( type, fn ){
    
    Events.events.push( {
      type: type,
      fn: fn
    } );
    
  }
  
  this.removeEventListener = function( type, fn ){
    
    Events.events.reverse().each( function( i, e ){
      if ( e.type == type && e.fn == fn ) Events.events.splice( i, 1 );
    } );
    
  }
  
  // Private methods
  // ---------------
  
  function getSegment( arr ) {
    
    if ( arr.length == 1 ) return arr[0];
    
    return arr[ Math.floor( Math.random() * arr.length ) ]
    
  }
  
  function onTimeUpdate() {
    
    var currentTime = scope.media.currentTime,
        segment = scope.segment;
    
    if ( scope.playing && segment && currentTime < segment.toTime ) {
      
      Events.onSegmentProgress.call( scope, segment,
        { progress: ( currentTime - segment.fromTime ) / ( segment.toTime - segment.fromTime ) }
      );
      
    }
    
    if ( scope.playing && segment && currentTime >= segment.toTime ) {
      
      Events.onSegmentProgress.call( scope, segment, { progress: 1 } );
      
      if ( segment.loops == Infinity ) {
        
        scope.media.currentTime = segment.fromTime;
        Events.onSegmentLooped.call( scope, segment );
      
      } else if ( segment.loops != Infinity && segment.loops && 
        ( typeof segment._loops === 'undefined' ||
          ( typeof segment._loops === 'number' && segment._loops )
        )
      ) {
        
        if ( typeof segment._loops === 'undefined' ) segment._loops = segment.loops;
        segment._loops--;
        scope.media.currentTime = segment.fromTime;
        Events.onSegmentLooped.call( scope, segment );
      
      } else if ( scope.playing ) {
        
        if ( typeof segment.onEnded === 'undefined' ) scope.pause();
        
        if ( typeof segment.ended === 'undefined') {
          
          Events.onSegmentEnded.call( scope, segment );
          segment.ended = true;
          
          if ( typeof segment.onEnded === 'string' ) scope.play( segment.onEnded );
        
        } else {
          
          delete segment.ended;
          
        }
      
      }
    
    }
    
  }
  
  function onPlay() {
    
    scope.playing = true;
    
    Events.onPlay.call( scope, scope.segment );
    
  }
  
  function onPause() {
    
    scope.playing = false;
    
    Events.onPause.call( scope, scope.segment );
    
  }
  
  function parseMedia( media ) {
    
    if ( typeof media === 'string' ) {
      
      return $( media );
      
    } else if ( typeof media === 'object' && typeof media.currentTime === 'number' ) {
      
      return media;
      
    }
    
  }
  
  function parseSegments( segments ) {
    
    for( var id in segments ) {
      scope.ID[ id ] = id;
      for ( var s in segments[ id ] ) segments[ id ][s].id = id;
    }
    
    return segments;
    
  }
  
  function parseEvents( evts ) {
    var eventArray = [];
    for( var type in evts ) eventArray.push( {
      type: type,
      fn: evts[ type ]
    } );
    return eventArray;
  }
  
  // Init
  // ----
  
  if ( this.media ) this.connect();
  
} // MediaSprite()

export default MediaSprite