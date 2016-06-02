var user = {
  onAuthorizeError: function() {
    console.error('Authorization failed');
  },
  login: function() {
    // authorize
    Trello.authorize({  
      interactive:true,
      type: 'redirect', // 'popup'
      success:user.display,
      error: user.onAuthorizeError,
      name:"Tragenda",
      expiration:"1day"
    });
  },
  logout: function() {
    // empty results
    $('.cards').empty();
    // progressbar
    progressBar.reboot().render();
    // remove profile-imng
    $('.profile-img').fadeOut(400, function(){
      // hide ui-div
      $('.ui-div').slideToggle(400, function(){
        // update login
        $('.login-out-btn').text('Login');
      });
    });  
    // logout
    Trello.deauthorize();
  },
  display: function() {
    //
    Trello.members.get("me", function(member){
      // el
      var $header = $('.header'),
          $img = $('<img/>')
          .attr('src', 'https://trello-avatars.s3.amazonaws.com/' + member.avatarHash + '/170.png')
          .addClass('profile-img');
      // dom
      $img.hide().appendTo($header).fadeIn(400, function(){
        // show search
        $('.ui-div').slideToggle(400, function(){
          // update login
          $('.login-out-btn').text('Logout');
        });        
      });
    });
  }
};

var cards = {
  el: '.cards',
  search: function(tag) {
    var queryString = 'is:open label:' + tag;
    var params = {
      query: queryString,
      //idOrganizations:
      //modelTypes: 'all', 
      cards_limit: 100,
      boards_limit: 100,
      card_board: true,
      card_list: true,
      card_members: true,
      card_fields: 'name,url,due',
      board_fields: 'name',
      member_fields: 'avatarHash'
    };
    // get cards and include board name
    Trello.get('search', params, function(cardsAndBoards){
  	  cards.render(cardsAndBoards.cards, tag);
    });
  },
  dayDiff: function(f, s) {
    var f = new Date(f),
        s = new Date(s),
        oneDay = 24*60*60*1000;
    return Math.round((f.getTime() - s.getTime())/(oneDay));
  },
  render: function(cardsAndBoards, tag) {
    // vars
    var $cards = $(this.el);
    // check result and set label
    if (cardsAndBoards.length === 0) {
      // set label
      loader.stop('No cards found by #' + tag);
      // progressbar
      progressBar.reboot().render();
      // ignore the rest
      return;
    }
    // results > 0 set label
    loader.stop(cardsAndBoards.length + ' cards found by #' + tag);
    // empty results
    $cards.empty();
    // loop
    cardsAndBoards.forEach(function(card){
      // el
      $li = $('<li/>');
      $a = $('<a/>')
        .attr({href: card.url, target: "_blank"})
        .text(card.name),
      $span = $('<span/>');
      // due
      if (card.due) {
        var diff = this.dayDiff(new Date(card.due), new Date());
        if (diff <= 0) {
          $span.html(" &middot; " + card.board.name + " &middot; Past due!");
        } else {
          $span.html(" &middot; " + card.board.name + " &middot; Due in " + diff + " days");
        }        
      } else {
        $span.html(" &middot; " + card.board.name);
      }
      // members
      if (card.members.length > 0) {
        $p = $('<p/>');
        card.members.forEach(function(member){
          // el
          var $img = $('<img/>').attr('src', 'https://trello-avatars.s3.amazonaws.com/' + member.avatarHash + '/170.png');
          // dom
          $img.appendTo($p);
        });
        $a.append($span, $p);        
      } else {        
        $a.append($span);
      }
      // mix and append
      $a.appendTo($li);
      $li.appendTo($cards);
    }, this);
    // progressbar
    progressBar.calc().render();
    // set all jQuery UI stuff
    $(".cards").sortable({
      placeholder: "card-placeholder",
      start: function(e, ui) {
        $(ui.item).addClass('card-dragging');
      },
      stop: function(e, ui) {
        $(ui.item).removeClass('card-dragging');
      }
    });
  }
};

var loader = {
  el: '.cards-label',
  timer: "",
  loaderStrings: ['Loading.', 'Loading..', 'Loading...'],
  start: function() {
    var that = this,
        i = 0;
    // set timer
    this.timer = setInterval(function(){
      // reset if past array
      if (i > 2) {
        // reset
        i = 0; 
      }
      // dom
      $(that.el).html(that.loaderStrings[i]);
      // inc
      i++;
    }, 500);    
  },
  stop: function(str) {
    // kill timer
    clearInterval(this.timer);
    // set label
    $(this.el).text(str);
  }
};

var progressBar = {
  el: '.cards li',
  rows: 0,
  stricken: 0,
  progress: 0,
  calc: function() {
    // count rows
    this.rows = $(this.el).length;
    // check
    if (this.rows > 0) {
      // reset
      this.stricken = 0;
      // count isStricken
      $(this.el).each(function(i){
        if ($(this).hasClass('stricken')) {
          progressBar.stricken++;
        }
      });
      // calc progress
      this.progress = Math.ceil(this.stricken / this.rows *100);
    }
    // for chaining
    return this;
  },
  render: function() {
    $('.progress-bar-inner').css('width', progressBar.progress + "%");
  },
  reboot: function() {
    // reset
    this.progress = 0;
    // for chaining
    return this;
  }
};

// EVENTS

// toggle stricken on cards
$('.cards').on('click', 'li a', function(e){
  // check class
  var isStricken = $(this).parent().hasClass('stricken');
  // toggle class
  if (isStricken) {
    // stop link
    e.preventDefault();
  }
  // toggle class eitherway
  $(this).parent().toggleClass('stricken');
  // progressbar
  progressBar.calc().render();
});

// Search
$('#search-form').on('submit', function(e){
  // set loader
  loader.start();
  // clear
  $('.cards').empty();
  // get user input
  var tag = $('.search-box').val().toLowerCase().trim();
  // remove focus
  $('.search-box').blur();
  // search
  cards.search(tag);
  // fix
  return false;
});

// login/logout
$('.login-out-btn').on('click', function(){
  // set flag
  var isLoggedIn = Trello.authorized();
  // check
  if (isLoggedIn) {
    user.logout();
  } else {
    user.login();
  }  
});

// prop interactive -> If false, don’t redirect or popup, only use the stored token
Trello.authorize({
    interactive:false,
    success: user.display
});
