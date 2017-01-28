var user = {
  onAuthorizeError: function() {
    console.error('Authorization failed');
  },
  login: function() {
    Trello.authorize({
      interactive:true,
      type: 'redirect', // or 'popup'
      success:user.display,
      error: user.onAuthorizeError,
      name:"Tragenda",
      expiration:"1day"
    });
  },
  logout: function() {
    $('.cards').empty();
    progressBar.reboot().render();
    // update UI
    $('.profile-img').fadeOut(400, function(){
      $('.ui-div').slideToggle(400, function(){
        $('.login-out-btn').text('Login');
      });
    });
    Trello.deauthorize();
  },
  display: function() {
    Trello.members.get("me", function(member){
      var $header = $('.header'),
          $img = $('<img/>')
          .attr('src', 'https://trello-avatars.s3.amazonaws.com/' + member.avatarHash + '/170.png')
          .addClass('profile-img');
      // update UI
      $img.hide().appendTo($header).fadeIn(400, function(){
        $('.ui-div').slideToggle(400, function(){
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
    var $cards = $(this.el);
    if (cardsAndBoards.length === 0) {
      loader.stop('No cards found by #' + tag);
      progressBar.reboot().render();
      return;
    }
    // results > 0
    loader.stop(cardsAndBoards.length + ' cards found by #' + tag);
    $cards.empty();
    cardsAndBoards.forEach(function(card){
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
          var $img = $('<img/>').attr('src', 'https://trello-avatars.s3.amazonaws.com/' + member.avatarHash + '/170.png');
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
    this.timer = setInterval(function(){
      if (i > 2) {
        i = 0;
      }
      $(that.el).html(that.loaderStrings[i]);
      i++;
    }, 500);
  },
  stop: function(str) {
    clearInterval(this.timer);
    $(this.el).text(str);
  }
};

var progressBar = {
  el: '.cards li',
  rows: 0,
  stricken: 0,
  progress: 0,
  calc: function() {
    this.rows = $(this.el).length;
    if (this.rows > 0) {
      this.stricken = 0;
      $(this.el).each(function(i){
        if ($(this).hasClass('stricken')) {
          progressBar.stricken++;
        }
      });
      this.progress = Math.ceil(this.stricken / this.rows *100);
    }
    return this;
  },
  render: function() {
    $('.progress-bar-inner').css('width', progressBar.progress + "%");
  },
  reboot: function() {
    this.progress = 0;
    return this;
  }
};

// EVENTS

// click card
$('.cards').on('click', 'li a', function(e){
  var isStricken = $(this).parent().hasClass('stricken');
  if (isStricken) {
    e.preventDefault();
  }
  $(this).parent().toggleClass('stricken');
  progressBar.calc().render();
});

// do search
$('#search-form').on('submit', function(e){
  loader.start();
  $('.cards').empty();
  var tag = $('.search-box').val().toLowerCase().trim();
  $('.search-box').blur();
  cards.search(tag);
  return false;
});

// login/logout
$('.login-out-btn').on('click', function(){
  if (Trello.authorized()) {
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
