/*
Tipue Search 6.1
Copyright (c) 2017 Tipue
Tipue Search is released under the MIT License
http://www.tipue.com/search
*/


(function ($) {

  $.fn.tipuesearch = function (options) {

    var set = $.extend({

      'contentLocation': 'tipuesearch/tipuesearch_content.json',
      'contextBuffer': 60,
      'contextLength': 60,
      'contextStart': 90,
      'debug': false,
      'descriptiveWords': 25,
      'highlightTerms': true,
      'liveContent': '*',
      'liveDescription': '*',
      'minimumLength': 3,
      'mode': 'static',
      'newWindow': false,
      'show': 9,
      'showContext': true,
      'showRelated': true,
      'showTime': true,
      'showTitleCount': true,
      'showURL': true,
      'wholeWords': true

    }, options);

    return this.each(function () {

      var tipuesearch_in = {
	pages: []
      };
      $.ajaxSetup({
	async: false
      });
      var tipuesearch_t_c = 0;

      //$('#tipue_search_content').hide().html('<div class="tipue_search_spinner"><div class="tipue_search_rect1"></div><div class="tipue_search_rect2"></div><div class="rect3"></div></div>').show();

      if (set.mode == 'live') {
	for (var i = 0; i < tipuesearch_pages.length; i++) {
	  $.get(tipuesearch_pages[i]).done(function (html) {
	    var cont = $(set.liveContent, html).text();
	    cont = cont.replace(/\s+/g, ' ');
	    var desc = $(set.liveDescription, html).text();
	    desc = desc.replace(/\s+/g, ' ');

	    var t_1 = html.toLowerCase().indexOf('<title>');
	    var t_2 = html.toLowerCase().indexOf('</title>', t_1 + 7);
	    if (t_1 != -1 && t_2 != -1) {
	      var tit = html.slice(t_1 + 7, t_2);
	    }
	    else {
	      var tit = tipuesearch_string_1;
	    }

	    tipuesearch_in.pages.push(
	      {
		"title": tit,
		"text": desc,
		"tags": cont,
		"url": tipuesearch_pages[i]
	      });
	  });
	}
      }

      if (set.mode == 'json') {
	$.getJSON(set.contentLocation).done(function (json) {
	  tipuesearch_in = $.extend({}, json);
	});
      }

      if (set.mode == 'static') {
	tipuesearch_in = $.extend({}, tipuesearch);
      }

      var tipue_search_w = '';
      if (set.newWindow) {
	tipue_search_w = ' target="_blank"';
      }

      function getURLP(name) {
	var _locSearch = location.search;
	var _splitted = (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(_locSearch) || [, ""]);
	var searchString = _splitted[1].replace(/\+/g, '%20');
	try {
	  searchString = decodeURIComponent(searchString);
	}
	catch (e) {
	  searchString = unescape(searchString);
	}
	return searchString || null;
      }

      if (getURLP('q')) {
	$('#tipue_search_input').val(getURLP('q'));
	getTipueSearch(0, true);
      }

      $(this).keyup(function (event) {
	if (event.keyCode == '13') {
	  getTipueSearch(0, true);
	}
      });


      function getTipueSearch(start, replace) {
	var out = '';
	var show_replace = false;
	var show_stop = false;
	var standard = true;
	var c = 0;
	found = [];

	var d_o = $('#tipue_search_input').val();
	var d = d_o.toLowerCase();
	d = $.trim(d);

	if ((d.match("^\"") && d.match("\"$")) || (d.match("^'") && d.match("'$"))) {
	  standard = false;
	}

	var d_w = d.split(' ');

	if (standard) {
	  d = '';
	  for (var i = 0; i < d_w.length; i++) {
	    var a_w = true;
	    for (var f = 0; f < tipuesearch_stop_words.length; f++) {
	      if (d_w[i] == tipuesearch_stop_words[f]) {
		a_w = false;
		show_stop = true;
	      }
	    }
	    if (a_w) {
	      d = d + ' ' + d_w[i];
	    }
	  }
	  d = $.trim(d);
	  d_w = d.split(' ');
	}
	else {
	  d = d.substring(1, d.length - 1);
	}

	if (d.length >= set.minimumLength) {
	  if (standard) {
	    if (replace) {
	      var d_r = d;
	      for (var i = 0; i < d_w.length; i++) {
		for (var f = 0; f < tipuesearch_replace.words.length; f++) {
		  if (d_w[i] == tipuesearch_replace.words[f].word) {
		    d = d.replace(d_w[i], tipuesearch_replace.words[f].replace_with);
		    show_replace = true;
		  }
		}
	      }
	      d_w = d.split(' ');
	    }

	    var d_t = d;
	    for (var i = 0; i < d_w.length; i++) {
	      for (var f = 0; f < tipuesearch_stem.words.length; f++) {
		if (d_w[i] == tipuesearch_stem.words[f].word) {
		  d_t = d_t + ' ' + tipuesearch_stem.words[f].stem;
		}
	      }
	    }
	    d_w = d_t.split(' ');

	    for (var i = 0; i < tipuesearch_in.pages.length; i++) {
	      var score = 0;
	      var s_t = tipuesearch_in.pages[i].text;
	      for (var f = 0; f < d_w.length; f++) {
		if (set.wholeWords) {
		  var pat = new RegExp('\\b' + d_w[f] + '\\b', 'gi');
		}
		else {
		  var pat = new RegExp(d_w[f], 'gi');
		}
		if (tipuesearch_in.pages[i].title.search(pat) != -1) {
		  var m_c = tipuesearch_in.pages[i].title.match(pat).length;
		  score += (20 * m_c);
		}
		if (tipuesearch_in.pages[i].text.search(pat) != -1) {
		  var m_c = tipuesearch_in.pages[i].text.match(pat).length;
		  score += (20 * m_c);
		}

		if (tipuesearch_in.pages[i].tags.search(pat) != -1) {
		  var m_c = tipuesearch_in.pages[i].tags.match(pat).length;
		  score += (10 * m_c);
		}

		if (tipuesearch_in.pages[i].url.search(pat) != -1) {
		  score += 20;
		}

		if (score != 0) {
		  for (var e = 0; e < tipuesearch_weight.weight.length; e++) {
		    if (tipuesearch_in.pages[i].url == tipuesearch_weight.weight[e].url) {
		      score += tipuesearch_weight.weight[e].score;
		    }
		  }
		}

		if (d_w[f].match('^-')) {
		  pat = new RegExp(d_w[f].substring(1), 'i');
		  if (tipuesearch_in.pages[i].title.search(pat) != -1 || tipuesearch_in.pages[i].text.search(pat) != -1 || tipuesearch_in.pages[i].tags.search(pat) != -1) {
		    score = 0;
		  }
		}
	      }

	      if (score != 0) {
		found.push(
		  {
		    "score": score,
		    "title": tipuesearch_in.pages[i].title,
		    "desc": s_t,
		    "url": tipuesearch_in.pages[i].url
		  });
		c++;
	      }
	    }
	  }
	  else {
	    for (var i = 0; i < tipuesearch_in.pages.length; i++) {
	      var score = 0;
	      var s_t = tipuesearch_in.pages[i].text;
	      var pat = new RegExp(d, 'gi');
	      if (tipuesearch_in.pages[i].title.search(pat) != -1) {
		var m_c = tipuesearch_in.pages[i].title.match(pat).length;
		score += (20 * m_c);
	      }
	      if (tipuesearch_in.pages[i].text.search(pat) != -1) {
		var m_c = tipuesearch_in.pages[i].text.match(pat).length;
		score += (20 * m_c);
	      }

	      if (tipuesearch_in.pages[i].tags.search(pat) != -1) {
		var m_c = tipuesearch_in.pages[i].tags.match(pat).length;
		score += (10 * m_c);
	      }

	      if (tipuesearch_in.pages[i].url.search(pat) != -1) {
		score += 20;
	      }

	      if (score != 0) {
		for (var e = 0; e < tipuesearch_weight.weight.length; e++) {
		  if (tipuesearch_in.pages[i].url == tipuesearch_weight.weight[e].url) {
		    score += tipuesearch_weight.weight[e].score;
		  }
		}
	      }

	      if (score != 0) {
		found.push(
		  {
		    "score": score,
		    "title": tipuesearch_in.pages[i].title,
		    "desc": s_t,
		    "url": tipuesearch_in.pages[i].url
		  });
		c++;
	      }
	    }
	  }

	  if (c != 0) {
	    if (set.showTitleCount && tipuesearch_t_c == 0) {
	      var title = document.title;
	      document.title = '(' + c + ') ' + title;
	      tipuesearch_t_c++;
	    }

	    found.sort(function (a, b) {
	      return b.score - a.score
	    });

	    var l_o = 0;
	    for (var i = 0; i < found.length; i++) {
	      if (l_o >= start && l_o < set.show + start) {
		out += '<div class="col s12 m4"><div class="article-box"><div class="article-preview-container">';
		out += '<div class="article-preview"><a href="' + found[i].url + '"' + tipue_search_w + ' class="article-title" rel="bookmark">' + found[i].title + '</a></div>';

		if (set.debug) {
		  out += '<div class="tipue_search_content_debug">Score: ' + found[i].score + '</div></div>';
		}


		if (found[i].desc) {
		  var t = found[i].desc;

		  if (set.showContext) {
		    d_w = d.split(' ');
		    var s_1 = found[i].desc.toLowerCase().indexOf(d_w[0]);
		    if (s_1 > set.contextStart) {
		      var t_1 = t.substr(s_1 - set.contextBuffer);
		      var s_2 = t_1.indexOf(' ');
		      t_1 = t.substr(s_1 - set.contextBuffer + s_2);
		      t_1 = $.trim(t_1);

		      if (t_1.length > set.contextLength) {
			t = '... ' + t_1;
		      }
		    }
		  }

		  if (standard) {
		    d_w = d.split(' ');
		    for (var f = 0; f < d_w.length; f++) {
		      if (set.highlightTerms) {
			var patr = new RegExp('(' + d_w[f] + ')', 'gi');
			t = t.replace(patr, "<h0011>$1<h0012>");
		      }
		    }
		  }
		  else if (set.highlightTerms) {
		    var patr = new RegExp('(' + d + ')', 'gi');
		    t = t.replace(patr, "<span class=\"tipue_search_content_bold\">$1</span>");
		  }

		  var t_d = '';
		  var t_w = t.split(' ');
		  if (t_w.length < set.descriptiveWords) {
		    t_d = t;
		  }
		  else {
		    for (var f = 0; f < set.descriptiveWords; f++) {
		      t_d += t_w[f] + ' ';
		    }
		  }
		  t_d = $.trim(t_d);
		  if (t_d.charAt(t_d.length - 1) != '.') {
		    t_d += ' ...';
		  }

		  t_d = t_d.replace(/h0011/g, 'span class=\"tipue_search_content_bold\"');
		  t_d = t_d.replace(/h0012/g, '/span');

		  out += '<div class="entry-content">' + t_d + '</div>';
		}

		if (set.showURL) {
		  var s_u = found[i].url.toLowerCase();
		  if (s_u.indexOf('http://') == 0) {
		    s_u = s_u.slice(7);
		  }
		  out += '<div class="center"><a href="' + found[i].url + '"' + tipue_search_w + '>READ MORE</a></div>';
		}


		out += '</div></div></div>';

	      }
	      l_o++;
	    }

	    if (set.showRelated && standard) {
	      f = 0;
	      for (var i = 0; i < tipuesearch_related.searches.length; i++) {
		if (d == tipuesearch_related.searches[i].search) {
		  if (show_replace) {
		    d_o = d;
		  }
		  if (!f) {
		    out += '<div class="tipue_search_related_title">' + tipuesearch_string_15 + '</div>';
		  }

		  out += '<div class="tipue_search_related_text"><a class="tipue_search_related" id="' + tipuesearch_related.searches[i].related + '">';
		  if (tipuesearch_related.searches[i].before) {
		    out += '<span class="tipue_search_related_before">' + tipuesearch_related.searches[i].before + '</span> ';
		  }
		  out += tipuesearch_related.searches[i].related;
		  if (tipuesearch_related.searches[i].after) {
		    out += ' <span class="tipue_search_related_after">' + tipuesearch_related.searches[i].after + '</span>';
		  }
		  out += '</a></div>';
		  f++;

		}
	      }
	      if (f) {
		out += '</div>';
	      }
	    }

	    if (c > set.show) {
	      var pages = Math.ceil(c / set.show);
	      var page = (start / set.show);
	      out += '<div class="center"><div class="container"><ul id="tipue_search_foot_boxes">';

	      if (start > 0) {
		out += '<li role="waves-effect left orange"><a class="tipue_search_foot_box" accesskey="b" id="' + (start - set.show) + '_' + replace + '"> <i class="material-icons">chevron_left</i> </a></li>';
	      }

	      if (page <= 2) {
		var p_b = pages;
		if (pages > 3) {
		  p_b = 3;
		}

	      }
	      else {
		var p_b = page + 2;
		if (p_b > pages) {
		  p_b = pages;
		}
	      }

	      if (page + 1 != pages) {
		out += '<li role="waves-effect right orange"><a class="tipue_search_foot_box" accesskey="m" id="' + (start + set.show) + '_' + replace + '"> <i class="material-icons">chevron_right</i> </a></li>';
	      }

	      out += '</ul></div></div>';
	    }
	  }

	}


	$('#tipue_search_content').hide().html(out).slideDown(200);

	$('#tipue_search_replaced').click(function () {
	  getTipueSearch(0, false);
	});

	$('.tipue_search_related').click(function () {
	  $('#tipue_search_input').val($(this).attr('id'));
	  getTipueSearch(0, true);
	});

	$('.tipue_search_foot_box').click(function () {
	  var id_v = $(this).attr('id');
	  var id_a = id_v.split('_');

	  getTipueSearch(parseInt(id_a[0]), id_a[1]);
	});
      }

      $('.article-box').matchHeight();
    });
  };
})(jQuery);
