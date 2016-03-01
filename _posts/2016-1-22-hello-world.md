---
layout: post
title: 'Hello world!'
author: "Koba Khitalishvili"
categories: beginner
tags: "r python"
---

This is my professional blog where I will be writing about data science, programming, math and, in general, about technical sciences. Lets test things out. I wonder how [Jekyll]() or rather how the specified highlighter renders code. By default Jekyll 3.0+ uses [Rouge](http://rouge.jneen.net/).

<!--more-->

# Ruby 

([example](http://jekyllrb.com/docs/installation/) from Jekyll documentation)

```ruby
def show
	@widget = Widget(params[:id])
	respond_to do |format|
		format.html # show.html.erb
		format.json { render json: @widget }
	end
end
```


# R

```r
# Read in a default data set
data(cars)
head(cars)
```

```
  speed dist
1     4    2
2     4   10
3     7    4
4     7   22
5     8   16
6     9   10
```

```r
summary(cars)
```

```
     speed           dist       
 Min.   : 4.0   Min.   :  2.00  
 1st Qu.:12.0   1st Qu.: 26.00  
 Median :15.0   Median : 36.00  
 Mean   :15.4   Mean   : 42.98  
 3rd Qu.:19.0   3rd Qu.: 56.00  
 Max.   :25.0   Max.   :120.00 
```

```r
# Do a simple regression model with distance as a dependent variable. Include intercept because of non zero mean. 
model<-lm(dist ~ speed,cars)
summary(model)
```

```
Call:
lm(formula = dist ~ speed, data = cars)

Residuals:
    Min      1Q  Median      3Q     Max 
-29.069  -9.525  -2.272   9.215  43.201 

Coefficients:
            Estimate Std. Error t value Pr(>|t|)    
(Intercept) -17.5791     6.7584  -2.601   0.0123 *  
speed         3.9324     0.4155   9.464 1.49e-12 ***
---
Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1

Residual standard error: 15.38 on 48 degrees of freedom
Multiple R-squared:  0.6511,	Adjusted R-squared:  0.6438 
F-statistic: 89.57 on 1 and 48 DF,  p-value: 1.49e-12  
```
According to the regression model, the stopping distance strongly depends on the speed of the car (duh!).

# Python 

```python
# A simple primality test that I remember off the top of my head
def isprime(n):
  ans = 'is prime'

  if n == 1:
    ans = 'not prime'
  elif n == 2 or n == 3:
	return ans
  else:
	for i in range(2,int(n ** 0.5)+1):
	  if n % i is 0:
	    ans = 'not prime'
  return ans
```

The highlighter works as intended. To make sure I remember the primality test correctly let's run this code. I am using [trinket.io](https://trinket.io/) to embed a python interpreter in my website. A very neat thing. You can see it below:

<iframe src="https://trinket.io/embed/python/0066595bcc" width="100%" height="400" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

After running the code it seems like my primality test works correctly. 

Jekyll also allows to include gists. I will embed the code that produces the news list on my main page. Let's see what the gist looks like:
{% gist KobaKhit/e90978692fff51b149ce %}
Looks neat.

# Latex

Next, let me try to use $\LaTeX$:

- Here is an [inline latex](http://www.math.tamu.edu/~boas/courses/math696/LaTeX-in-line-equations.html) of the [Euler identity](http://en.wikipedia.org/wiki/Euler%27s_identity): $e^{i\pi} + 1 = 0$
- [Display latex](http://www.math.tamu.edu/~boas/courses/math696/LaTeX-displayed-equations.html) of one of my favourite primality tests, the [AKS test](http://en.wikipedia.org/wiki/AKS_primality_test):

> An integer $n$ is prime iff the congruence relation 

$$(x-a)^n \equiv (x^n-a)$$

> holds for all inetegers $a$ that are coprime to $n$.

<hr>

Thats pretty much it for the testing. I am working on a bunch of posts and one of them will be a step by step guide of how I built this website. Hopefully, it will be helpful to people who intend to use jekyll for their blogging needs. Until later.
