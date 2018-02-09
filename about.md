---
layout: page
title: About
permalink: /about/
---

<div class="row">
	<div class="col s12 m4 l4">
	  <div class="card">
	    <div class="card-image">
	      <img src="/img/about.jpg">
	      <span class="card-title"> 
	      	<span class="strokeme">Koba Khitalishvili</span>
	      </span>
	    </div>
	    <div class="card-content">
			<ul class="unstyled list-inline">
			    <li>
			        <a href="https://www.facebook.com/cobra.khitalishvili" target="_blank"><i class="fa fa-facebook-square fa-2x"></i></a>
			    </li>
			    <li>
			        <a href="https://www.linkedin.com/in/kobakhit/" target="_blank"><i class="fa fa-linkedin-square fa-2x"></i></a>
			    </li>
			    <li>
			        <a href="https://plus.google.com/u/0/102338506491711479673/about" target="_blank"><i class="fa fa-google-plus-square fa-2x"></i></a>
			    </li>
			    <li>
			        <a href="https://github.com/KobaKhit"><i class="fa fa-github fa-2x" target="_blank"></i></a>
			    </li>
			    <li>
			        <a href="https://instagram.com/dostre"><i class="fa fa-instagram fa-2x" target="_blank"></i></a>
			    </li>
			    <!-- <li>
			        <a href="http://vk.com/id5413481"><i class="fa fa-vk fa-2x" target="_blank"></i></a>
			    </li> -->
			</ul>
	    </div>
	    <div class="card-action center">
	      <a href="mailto:{{ site.email }}">{{ site.email }}</a>
	    </div>
	  </div>
	</div>

	<!-- Bio -->
	<div class="col s12 m8 l8">
		<div class = "card-panel">
	        <p>Coming...</p>
	    </div>
	</div>
</div>

<hr>

</div comment = "container end. After this full width page">

<div class = "row">
	<h1 id = "projects" class = "center">Projects</h1>
	<h2 class = "center">Reproducible Research</h2>
	<div>
		<ul class = "list-inline unstyled center" style =" display:table; margin:0 auto;">
			{% for p in site.data.portfolio %}
			{% if p.cat == "repres" %}
			<li style = "margin-right:30px">
				<div class="card small" style = "max-width:300px; display:inline-block">
				    <div class="card-image waves-effect waves-block waves-light">
				      <img class="activator" src="{{ p.img }}">
				    </div>
				    <div class="card-content">
				      <span class="card-title activator grey-text text-darken-4">{{ p.title }}<i class="material-icons right">more_vert</i></span>
				      <br>
				      <br>
				      <p class = "card-title">
				      	{% if p.link %}<a href="{{ p.link }}" target = "_blank">Link</a>{% endif %}
				      	{% if p.ipynb %}<a href="{{ p.ipynb }}" target = "_blank">Ipynb</a>{% endif %}
				      	{% if p.rmd %}<a href="{{ p.rmd }}" target = "_blank">Rmd</a>{% endif %}
				      	{% if p.pdf %}<a href="{{ p.pdf }}" target = "_blank">Paper</a>{% endif %}
				      	{% if p.github %}<a href="{{ p.github}}" target = "_blank">Code</a>{% endif %}
				      	{% if p.kaggle %}<a href="{{ p.kaggle}}" target = "_blank">Kaggle</a>{% endif %}
				      </p>
				    </div>
				    <div class="card-reveal">
				      <span class="card-title grey-text text-darken-4">Description<i class="material-icons right">close</i></span>
				      <p>{{ p.description }}</p>
				    </div>
				</div>
			</li>
			{% endif %}
			{% endfor %}
		</ul>
	</div>
</div>

<br>

<div class = "row">
	<h2 class = "center">Webdev</h2>
	<div>
		<ul class = "list-inline unstyled center">
			{% for p in site.data.portfolio %}
			{% if p.cat == "webdev" %}
			<li style = "margin-right:30px">
				<div class="card small" style = "max-width:300px; display:inline-block">
				    <div class="card-image waves-effect waves-block waves-light">
				      <img class="activator" src="{{ p.img }}">
				    </div>
				    <div class="card-content">
				      <span class="card-title activator grey-text text-darken-4">{{ p.title }}<i class="material-icons right">more_vert</i></span>
				      <br>
				      <br>
				      <p class = "card-title">
				      	{% if p.link %}<a href="{{ p.link }}" target = "_blank">Link</a>{% endif %}
				      	{% if p.ipynb %}<a href="{{ p.ipynb }}" target = "_blank">Ipynb</a>{% endif %}
				      	{% if p.rmd %}<a href="{{ p.rmd }}" target = "_blank">Rmd</a>{% endif %}
				      	{% if p.pdf %}<a href="{{ p.pdf }}" target = "_blank">Paper</a>{% endif %}
				      	{% if p.github %}<a href="{{ p.github}}" target = "_blank">Code</a>{% endif %}
				      	{% if p.kaggle %}<a href="{{ p.kaggle}}" target = "_blank">Kaggle</a>{% endif %}
				      </p>
				    </div>
				    <div class="card-reveal">
				      <span class="card-title grey-text text-darken-4">Description<i class="material-icons right">close</i></span>
				      <p>{{ p.description }}</p>
				    </div>
				</div>
			</li>

			{% endif %}
			{% endfor %}
		</ul>
	</div>
</div>

<hr> 

<h1 class = "center">Instagram</h1>

<div  style='padding:10px'>
    <script src="//instansive.com/widget/js/instansive.js"></script><iframe src="//instansive.com/widgets/ae59f1d1ab970282e4227e6c3376cfe550bb12de.html" id="instansive_ae59f1d1ab" name="instansive_ae59f1d1ab"  scrolling="no" allowtransparency="true" class="instansive-widget" style="width: 100%; border: 0; overflow: hidden;"></iframe>
</div>