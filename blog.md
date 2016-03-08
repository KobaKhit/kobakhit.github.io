---
layout: page
title: Blog
---
<div class = "row">
	<div class = "col s12 m12 l12" >
		<div class="">
			<p class = "flow-text">
			Posts on this blog are usually a result of my graduate school assignments and work. When I have time I do projects for recreation and report here. Sometimes I take online courses from Coursera and share my work on this blog when sharing is appropriate.
			</p>
			<p class = "flow-text">
			Some posts have links to <code>.ipynb</code>, <code>.Rmd</code> files. I am a huge proponent of reproducible research and provide code where applicable. Every post can be saved as a <code>.pdf</code>. If you have questions/comments/suggestions feel free to contact me.
			</p>
		</div>
		<hr>
</div>

<div class = "row">
	<div class = "col s12 m4 l2" style = "padding:0px;">
		<h1>Posts<h1>
	</div>
	<div class = "col s12 m4 l10 hide-on-small-only">
	  <div class = "post-view-tabs-wrapper right">
	    <ul class="tabs">
	      <li class="tab "><a id="view1" class = "waves-effect waves-red btn-flat" href="#" data-view="single-list">List</a></li>
	      <li class="tab "><a id="view2" class = "waves-effect waves-red btn-flat active" href="#" data-view="collapsible-list">Collapsible List</a></li>
	      <li class="tab "><a id="view3" class = "waves-effect waves-red btn-flat" href="#" data-view="cards-list">Cards</a></li>
	    </ul>
	  </div>
	</div>
</div>



<div id = "collapsible-list"> 
{% include list-collapsible.html %}
</div>

<div id = "single-list" style = "display:none"> 
{% include list.html %}
</div>

<div id = "cards-list" class = "row" style = "display:none"> 
{% for post in site.posts %}
    <div class="col s12 m6 l6">   
        <div class="card-panel post-panel">
          <a href="{{ post.url }}"><h2>{{ post.title }}</h2></a>
          by {{post.author}}<br>
            <i class="fa fa-calendar"></i> {{post.date|date:"%b %d, %Y"}} |
            <!-- category -->
            <i class="fa fa-tag"></i>
            {% for cat in post.categories %}
               <a href="{{baseurl}}/categories/{{ cat | urlize }}/"><span class = "chip-cat">{{ cat }}</span></a>
            {% endfor %}

            <p>{{post.excerpt}}<br><a href = "{{post.url}}">...Read more</a></p>

            <!-- tags -->
            <div class = "tags">
               
            {% for tag in post.tags %}
               <a href="{{baseurl}}/tags/{{ tag | urlize }}/" ><span class = "chip">#{{ tag }}</span></a>
            {% endfor %}
            </div>
        </div>
    </div>
    {% endfor %}
</div>