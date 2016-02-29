$(function(){
	// add line-number to <pre> and wrapt in <table>
	// http://mrloh.se/2015/05/bending-markdown-for-jekyll-and-github-pages/#fnref1
	var table = '<table class="highlighttable"><tbody><tr></tr></tbody></table>';
	$('article .highlight').wrap(table).before(function() {
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


	// Materialize
	$('.button-collapse').sideNav(); // sidenav
	$('.slider').slider({full_width: false, height: 250}); // pic slider
	$('.slider').slider('pause');
	$(".dropdown-button").dropdown(); // dropdown button in navbar

	// white background for output code chunks
	$("code.language-").parents(".highlighttable").addClass("outtable").removeClass("highlighttable")

	// particlejs config
    /* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
	particlesJS.load('particles-js', '/js/particles.json', function() {
	  console.log('callback - particles.js config loaded');
	});

	// footer
	particlesJS.load('particles-js-footer', '/js/particles-footer.json', function() {
	  console.log('callback - particles.js config loaded');
	});

}) // end of document ready