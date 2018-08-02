$(function(){
	// add line-number to <pre> and wrapt in <table>
	// http://mrloh.se/2015/05/bending-markdown-for-jekyll-and-github-pages/#fnref1
	var table = '<table class="highlighttable"><tbody><tr></tr></tbody></table>';
	$('article pre.highlight').wrap(table).before(function() {
		if($(this).parents(".gist").length === 0){
			// do not add line numbers to jekyll gists
		    var out = '<td class="linenos"><div class="linenodiv"><pre><code>';
		    var lines = $(this).text().split(/\n/).length;
		    for ( var i=1; i<lines; i++ ) {
		        out += i+'\n';
		    }
		    return out + '</code></pre></div></td>';
		}
	}).wrap('<td class="code"></td>');

	// white background for output code chunks
	$("code.language-out").parent().wrap( "<div class='outtable'></div>")
	console.log('print')

	// Materialize
	$('.button-collapse').sideNav(); // sidenav
	$('.collapsible').collapsible({
      accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
	$('.slider').slider({full_width: false, height: 250}); // pic slider
	$('.slider').slider('pause');
	$(".dropdown-button").dropdown(); // dropdown button in navbar
    $('ul.tabs').tabs(); // posts view

    // posts view on main page
    $( "#view1" ).click(function() {
	  var ls = $(this).data("view");
	  $("#" + ls).css("display","block");
	  $("#collapsible-list").css("display","none");
	  $("#cards-list").css("display","none");
	});

	$( "#view2" ).click(function() {
	  var ls = $(this).data("view");
	  $("#" + ls).css("display","block");
	  $("#single-list").css("display","none");
	  $("#cards-list").css("display","none");
	});

	$( "#view3" ).click(function() {
	  var ls = $(this).data("view");
	  $("#" + ls).css("display","block");
	  $("#single-list").css("display","none");
	  $("#collapsible-list").css("display","none");
	});


}) // end of document ready