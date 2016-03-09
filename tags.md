---
layout: page
title: "Tags"
---
<div class="row">
	<p>Total posts: {{site.posts|size}}</p>
	
	{% assign tagsize = site.tags|size %}
	{% assign catsize = site.categories|size %}
	<p>Total tags: {{ tagsize|plus: catsize }} </p>
	<div class = "col s6 m6 l6">
		<ul class="unstyled">
		{% for tag in site.tags %}
		  {% assign t = tag | first %}
		  {% assign posts = tag | last %}
		  <li><a href="#{{t}}"><span class = "chip">#{{t | downcase | replace:" ","-" }}</span></a> has {{ posts | size }} posts</li>
		{% endfor %}
		</ul>
	</div>
	<div class = "col s6 m6 l6">
		<ul class="unstyled">
		{% for tag in site.categories %}
		  {% assign t = tag | first %}
		  {% assign posts = tag | last %}
		  <li><a href="#{{t}}"><span class = "chip-cat">{{t | downcase | replace:" ","-" }}</span></a> has {{ posts | size }} posts</li>
		{% endfor %}
		</ul>
	</div>
</div>

<!-- Category post list -->
{% for tag in site.categories %}
  {% assign t = tag | first %}
  {% assign posts = tag | last %}

<h1 id ="{{t}}">{{ t }}</h1>
<ul>
{% for post in posts %}
  {% if post.categories contains t %}
  <li>
    <a href="{{ post.url }}">{{ post.title }}</a>
    <span class="date">{{ post.date | date: "%B %-d, %Y"  }}</span>
  </li>
  {% endif %}
{% endfor %}
</ul>
{% endfor %}

<!-- Tag post list -->
{% for tag in site.tags %}
  {% assign t = tag | first %}
  {% assign posts = tag | last %}

<h1 id ="{{t}}">{{ t }}</h1>
<ul>
{% for post in posts %}
  {% if post.tags contains t %}
  <li>
    <a href="{{ post.url }}">{{ post.title }}</a>
    <span class="date">{{ post.date | date: "%B %-d, %Y"  }}</span>
  </li>
  {% endif %}
{% endfor %}
</ul>
{% endfor %}