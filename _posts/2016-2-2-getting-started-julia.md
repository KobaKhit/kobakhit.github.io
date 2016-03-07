---
layout: post
title: 'Getting started with Julia programming language'
author: "<a href = 'http://www.kobakhit.com/about/'>Koba Khitalishvili</a>"
categories: beginner
tags: "julia gadfly collatz"
ipynb: "/ipynb/getting-started-julia.ipynb"
---

## Table of contents
- [Download](#Download)
- [Quick Start](#Quick-start)
- [Dataframes, plotting, and file Input/Output](#Data-frames,-plotting,-and-file-Input/Output)
    - [Data frames](#Data-frames)
    - [Plotting data](#Plotting-data)
- [Conclusion](#Conclusion)
- [Resources used](#Resources-used)

## Download 
Download Julia from [julialang.org](http://julialang.org/) and Julia IDEs from

- Juno from [junolab.org](http://junolab.org/)

- IJulia notebook from [github.com/JuliaLang/IJulia.jl](https://github.com/JuliaLang/IJulia.jl)
  - To use IJulia you will need the Ipython Notebook which now is called [Jupyter](http://jupyter.readthedocs.org/en/latest/install.html)

Juno is a good IDE for writing and evaluating julia code quickly. IJulia notebook is good for writing tutorials and reports with julia code results embeded in the document. 

Once you've installed everything I recommend opening up the Juno IDE and going through the tutorial.

## Quick start
I execute all Julia code below in IJulia. I suggest you create a folder on your desktop and make it your working directory where we will be able to write files. First, a couple of basic commands. To evaluate code in Juno you just need to press `Ctrl-D` (its in the Juno tutrial):


```julia
VERSION # print julia version number
pwd() # print working directory
homedir() # print the default home directory
cd("C:/Users/TimDz/Desktop/julia-lang") # set working directory to DirectoryPath "C:/Users/TimDz/Desktop/julia-lang"
```


```julia
3+5 # => 8
5*7 # => 35
3^17 # => 129140163
3^(1+3im) # im stands for imaginary number => -2.964383781426573 - 0.46089998526262876im
log(7) # natural log of 7 => 1.9459101490553132
```

Interesting that julia has imaginary number built in. Now, variables and functions:


```julia
a = cos(pi) + im*sin(pi) # assigning to a variable
```




    -1.0 + 1.2246467991473532e-16im




```julia
b = e^(im*pi)
```




    -1.0 + 1.2246467991473532e-16im




```julia
a == b # boolean expression. It is an euler identity.
```




    true



Lets see how to define functions. Here is a [chapter on functions](http://julia.readthedocs.org/en/latest/manual/functions/) in julia docs for more info.


```julia
plus2(x) = x + 2 # a compact way

function plustwo(x) # traditional function definition
    return x+2
end
```




    plustwo (generic function with 1 method)




```julia
plus2(11)
```




    13




```julia
plustwo(11)
```




    13



Here is a [julia cheatsheet](http://math.mit.edu/~stevenj/Julia-cheatsheet.pdf) with above and additional information in a concise form. Next, lets write a function that will generate some data which we will write to a csv file, plot, and save the plot. 

## Data frames, plotting, and file Input/Output
So I decided to write a function $f(x)$ that performs the process from the [Collatz conjecture](https://en.wikipedia.org/wiki/Collatz_conjecture). Basically, if x is even divide by $2$, if x is odd multiply by three and add $1$. Repeat the process until you reach one. The Collatz conjecture proposes that regardless of what number you start with you will always reach one. Here it is in explicit form 
$$
\
f(x) = \begin{cases} x/2, & \mbox{if } x\mbox{ is even} \\\\ 3x+1, & \mbox{if } x\mbox{ is odd} \end{cases}
$$
The function `collatz(x)` will count the number of iterations it took for the starting number to reach $1$.


```julia
function collatz(x)
    # Given a number x
    # - divide by 2 if x is even
    # - multiply by 3 and add 1 if x is odd
    # until x reaches 1
    count = 0
    while x != 1
        if x % 2 == 0
            x = x/2
            count += 1
        else
            x = 3*x + 1
            count += 1
        end
    end
    return count
end

collatz(2)
```




    1




```julia
collatz(3)
```




    7



### Data frames
Now, lets create a data frame with the number of steps needed to reach 1 for each number from 1 to 1000. We will use the [`DataFrames` package](https://github.com/JuliaStats/DataFrames.jl) because the base julia library does not have data frames.


```julia
# Pkg.add("DataFrames")
using DataFrames

# Before populating the dataframe with collatz data lets see how to create a dataframe
df = DataFrame(Col1 = 1:10, Col2 = ["a","b","c","d","e","f","a","b","c","d"])

# Lets use collatz data
df = DataFrame(Number = 1:1000, NumofSteps = map(collatz,1:1000))
head(df)
```




<table class="data-frame"><tr><th></th><th>Number</th><th>NumofSteps</th></tr><tr><th>1</th><td>1</td><td>0</td></tr><tr><th>2</th><td>2</td><td>1</td></tr><tr><th>3</th><td>3</td><td>7</td></tr><tr><th>4</th><td>4</td><td>2</td></tr><tr><th>5</th><td>5</td><td>5</td></tr><tr><th>6</th><td>6</td><td>8</td></tr></table>



`map()` applies `collatz()` function to every number in the `1:1000` array which is an array of numbers `[1,2,3,...,1000]`. In this instance `map()` returns an array of numbers that went went through `collatz()` function. 



```julia
# To get descriptive statistics 
describe(df)
```

    Number
    Min      1.0
    1st Qu.  250.75
    Median   500.5
    Mean     500.5
    3rd Qu.  750.25
    Max      1000.0
    NAs      0
    NA%      0.0%
    
    NumofSteps
    Min      0.0
    1st Qu.  26.0
    Median   43.0
    Mean     59.542
    3rd Qu.  99.0
    Max      178.0
    NAs      0
    NA%      0.0%
    


Before we save it lets categorize the points based on whether the original number is even or odd.


```julia
df = hcat(df, map(x -> if x % 2 == 0 "even" else "odd" end, 1:1000)) # create new evenodd column
rename!(df, :x1, :evenodd) #rename it to evenodd
head(df)
```




<table class="data-frame"><tr><th></th><th>Number</th><th>NumofSteps</th><th>evenodd</th></tr><tr><th>1</th><td>1</td><td>0</td><td>odd</td></tr><tr><th>2</th><td>2</td><td>1</td><td>even</td></tr><tr><th>3</th><td>3</td><td>7</td><td>odd</td></tr><tr><th>4</th><td>4</td><td>2</td><td>even</td></tr><tr><th>5</th><td>5</td><td>5</td><td>odd</td></tr><tr><th>6</th><td>6</td><td>8</td><td>even</td></tr></table>



`hcat(df, column(s))` horizontally concatenates data frames. I use the `map()` function with an anonymous function `x -> if x % 2 == 0 "even" else "odd" end` which checks for divisibility by two to create a column with "even" and "odd" as entries. Finally, I rename the new column "evenodd". Lets save it:


```julia
# To save the data frame in the working directory (make sure to set the wd as described in the beginning of the tutorial)
writetable("collatz.csv", df)
```

### Plotting data
To plot the data we will use the [`Gadfly`](https://github.com/dcjones/Gadfly.jl) package. `Cairo` is needed to be able to save plots as PDFs and PNG. First, I will do a simple plot.


```julia
# Pkg.add("Gadfly")
# Pkg.add("Cairo")
# Pkg.add("Compose")
# Pkg.update()
using Gadfly, Cairo

plot(df,x="Number", y="NumofSteps", Geom.point)
```

<div class="output_html rendered_html output_subarea output_execute_result">
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     xmlns:gadfly="http://www.gadflyjl.org/ns"
     version="1.2"
     width="141.42mm" height="100mm" viewBox="0 0 141.42 100"
     stroke="none"
     fill="#000000"
     stroke-width="0.3"
     font-size="3.88"

     id="img-24e2c5da">
<g class="plotroot xscalable yscalable" id="img-24e2c5da-1">
  <g font-size="3.88" font-family="'PT Sans','Helvetica Neue','Helvetica',sans-serif" fill="#564A55" stroke="#000000" stroke-opacity="0.000" id="img-24e2c5da-2">
    <text x="78.03" y="88.39" text-anchor="middle" dy="0.6em">Number</text>
  </g>
  <g class="guide xlabels" font-size="2.82" font-family="'PT Sans Caption','Helvetica Neue','Helvetica',sans-serif" fill="#6C606B" id="img-24e2c5da-3">
    <text x="-147.55" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">-1500</text>
    <text x="-91.16" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">-1000</text>
    <text x="-34.76" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">-500</text>
    <text x="21.63" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="visible">0</text>
    <text x="78.03" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="visible">500</text>
    <text x="134.42" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="visible">1000</text>
    <text x="190.82" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">1500</text>
    <text x="247.21" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">2000</text>
    <text x="303.61" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">2500</text>
    <text x="-91.16" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-1000</text>
    <text x="-85.52" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-950</text>
    <text x="-79.88" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-900</text>
    <text x="-74.24" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-850</text>
    <text x="-68.6" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-800</text>
    <text x="-62.96" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-750</text>
    <text x="-57.32" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-700</text>
    <text x="-51.68" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-650</text>
    <text x="-46.04" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-600</text>
    <text x="-40.4" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-550</text>
    <text x="-34.76" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-500</text>
    <text x="-29.12" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-450</text>
    <text x="-23.48" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-400</text>
    <text x="-17.84" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-350</text>
    <text x="-12.21" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-300</text>
    <text x="-6.57" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-250</text>
    <text x="-0.93" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-200</text>
    <text x="4.71" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-150</text>
    <text x="10.35" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-100</text>
    <text x="15.99" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-50</text>
    <text x="21.63" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">0</text>
    <text x="27.27" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">50</text>
    <text x="32.91" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">100</text>
    <text x="38.55" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">150</text>
    <text x="44.19" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">200</text>
    <text x="49.83" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">250</text>
    <text x="55.47" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">300</text>
    <text x="61.11" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">350</text>
    <text x="66.75" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">400</text>
    <text x="72.39" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">450</text>
    <text x="78.03" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">500</text>
    <text x="83.67" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">550</text>
    <text x="89.31" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">600</text>
    <text x="94.94" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">650</text>
    <text x="100.58" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">700</text>
    <text x="106.22" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">750</text>
    <text x="111.86" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">800</text>
    <text x="117.5" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">850</text>
    <text x="123.14" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">900</text>
    <text x="128.78" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">950</text>
    <text x="134.42" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1000</text>
    <text x="140.06" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1050</text>
    <text x="145.7" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1100</text>
    <text x="151.34" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1150</text>
    <text x="156.98" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1200</text>
    <text x="162.62" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1250</text>
    <text x="168.26" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1300</text>
    <text x="173.9" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1350</text>
    <text x="179.54" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1400</text>
    <text x="185.18" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1450</text>
    <text x="190.82" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1500</text>
    <text x="196.46" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1550</text>
    <text x="202.1" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1600</text>
    <text x="207.73" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1650</text>
    <text x="213.37" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1700</text>
    <text x="219.01" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1750</text>
    <text x="224.65" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1800</text>
    <text x="230.29" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1850</text>
    <text x="235.93" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1900</text>
    <text x="241.57" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1950</text>
    <text x="247.21" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">2000</text>
    <text x="-91.16" y="84.39" text-anchor="middle" gadfly:scale="0.5" visibility="hidden">-1000</text>
    <text x="21.63" y="84.39" text-anchor="middle" gadfly:scale="0.5" visibility="hidden">0</text>
    <text x="134.42" y="84.39" text-anchor="middle" gadfly:scale="0.5" visibility="hidden">1000</text>
    <text x="247.21" y="84.39" text-anchor="middle" gadfly:scale="0.5" visibility="hidden">2000</text>
    <text x="-91.16" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-1000</text>
    <text x="-79.88" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-900</text>
    <text x="-68.6" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-800</text>
    <text x="-57.32" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-700</text>
    <text x="-46.04" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-600</text>
    <text x="-34.76" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-500</text>
    <text x="-23.48" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-400</text>
    <text x="-12.21" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-300</text>
    <text x="-0.93" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-200</text>
    <text x="10.35" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-100</text>
    <text x="21.63" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">0</text>
    <text x="32.91" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">100</text>
    <text x="44.19" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">200</text>
    <text x="55.47" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">300</text>
    <text x="66.75" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">400</text>
    <text x="78.03" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">500</text>
    <text x="89.31" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">600</text>
    <text x="100.58" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">700</text>
    <text x="111.86" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">800</text>
    <text x="123.14" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">900</text>
    <text x="134.42" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1000</text>
    <text x="145.7" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1100</text>
    <text x="156.98" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1200</text>
    <text x="168.26" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1300</text>
    <text x="179.54" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1400</text>
    <text x="190.82" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1500</text>
    <text x="202.1" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1600</text>
    <text x="213.37" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1700</text>
    <text x="224.65" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1800</text>
    <text x="235.93" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1900</text>
    <text x="247.21" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">2000</text>
  </g>
<g clip-path="url(#img-24e2c5da-4)">
  <g id="img-24e2c5da-5">
    <g pointer-events="visible" opacity="1" fill="#000000" fill-opacity="0.000" stroke="#000000" stroke-opacity="0.000" class="guide background" id="img-24e2c5da-6">
      <rect x="19.63" y="5" width="116.79" height="75.72"/>
    </g>
    <g class="guide ygridlines xfixed" stroke-dasharray="0.5,0.5" stroke-width="0.2" stroke="#D0D0E0" id="img-24e2c5da-7">
      <path fill="none" d="M19.63,168.36 L 136.42 168.36" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,150.43 L 136.42 150.43" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,132.5 L 136.42 132.5" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,114.57 L 136.42 114.57" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,96.64 L 136.42 96.64" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,78.71 L 136.42 78.71" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,60.79 L 136.42 60.79" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,42.86 L 136.42 42.86" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,24.93 L 136.42 24.93" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,7 L 136.42 7" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,-10.93 L 136.42 -10.93" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-28.86 L 136.42 -28.86" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-46.79 L 136.42 -46.79" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-64.72 L 136.42 -64.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-82.64 L 136.42 -82.64" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,150.43 L 136.42 150.43" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,146.84 L 136.42 146.84" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,143.26 L 136.42 143.26" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,139.67 L 136.42 139.67" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,136.09 L 136.42 136.09" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,132.5 L 136.42 132.5" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,128.92 L 136.42 128.92" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,125.33 L 136.42 125.33" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,121.74 L 136.42 121.74" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,118.16 L 136.42 118.16" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,114.57 L 136.42 114.57" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,110.99 L 136.42 110.99" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,107.4 L 136.42 107.4" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,103.82 L 136.42 103.82" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,100.23 L 136.42 100.23" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,96.64 L 136.42 96.64" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,93.06 L 136.42 93.06" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,89.47 L 136.42 89.47" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,85.89 L 136.42 85.89" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,82.3 L 136.42 82.3" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,78.71 L 136.42 78.71" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,75.13 L 136.42 75.13" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,71.54 L 136.42 71.54" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,67.96 L 136.42 67.96" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,64.37 L 136.42 64.37" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,60.79 L 136.42 60.79" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,57.2 L 136.42 57.2" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,53.61 L 136.42 53.61" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,50.03 L 136.42 50.03" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,46.44 L 136.42 46.44" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,42.86 L 136.42 42.86" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,39.27 L 136.42 39.27" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,35.69 L 136.42 35.69" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,32.1 L 136.42 32.1" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,28.51 L 136.42 28.51" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,24.93 L 136.42 24.93" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,21.34 L 136.42 21.34" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,17.76 L 136.42 17.76" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,14.17 L 136.42 14.17" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,10.59 L 136.42 10.59" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,7 L 136.42 7" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,3.41 L 136.42 3.41" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-0.17 L 136.42 -0.17" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-3.76 L 136.42 -3.76" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-7.34 L 136.42 -7.34" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-10.93 L 136.42 -10.93" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-14.51 L 136.42 -14.51" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-18.1 L 136.42 -18.1" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-21.69 L 136.42 -21.69" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-25.27 L 136.42 -25.27" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-28.86 L 136.42 -28.86" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-32.44 L 136.42 -32.44" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-36.03 L 136.42 -36.03" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-39.61 L 136.42 -39.61" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-43.2 L 136.42 -43.2" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-46.79 L 136.42 -46.79" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-50.37 L 136.42 -50.37" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-53.96 L 136.42 -53.96" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-57.54 L 136.42 -57.54" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-61.13 L 136.42 -61.13" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-64.72 L 136.42 -64.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,150.43 L 136.42 150.43" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M19.63,78.71 L 136.42 78.71" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M19.63,7 L 136.42 7" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M19.63,-64.72 L 136.42 -64.72" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M19.63,150.43 L 136.42 150.43" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,143.26 L 136.42 143.26" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,136.09 L 136.42 136.09" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,128.92 L 136.42 128.92" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,121.74 L 136.42 121.74" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,114.57 L 136.42 114.57" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,107.4 L 136.42 107.4" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,100.23 L 136.42 100.23" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,93.06 L 136.42 93.06" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,85.89 L 136.42 85.89" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,78.71 L 136.42 78.71" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,71.54 L 136.42 71.54" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,64.37 L 136.42 64.37" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,57.2 L 136.42 57.2" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,50.03 L 136.42 50.03" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,42.86 L 136.42 42.86" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,35.69 L 136.42 35.69" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,28.51 L 136.42 28.51" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,21.34 L 136.42 21.34" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,14.17 L 136.42 14.17" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,7 L 136.42 7" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-0.17 L 136.42 -0.17" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-7.34 L 136.42 -7.34" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-14.51 L 136.42 -14.51" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-21.69 L 136.42 -21.69" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-28.86 L 136.42 -28.86" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-36.03 L 136.42 -36.03" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-43.2 L 136.42 -43.2" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-50.37 L 136.42 -50.37" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-57.54 L 136.42 -57.54" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-64.72 L 136.42 -64.72" gadfly:scale="5.0" visibility="hidden"/>
    </g>
    <g class="guide xgridlines yfixed" stroke-dasharray="0.5,0.5" stroke-width="0.2" stroke="#D0D0E0" id="img-24e2c5da-8">
      <path fill="none" d="M-147.55,5 L -147.55 80.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M-91.16,5 L -91.16 80.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M-34.76,5 L -34.76 80.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M21.63,5 L 21.63 80.72" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M78.03,5 L 78.03 80.72" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M134.42,5 L 134.42 80.72" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M190.82,5 L 190.82 80.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M247.21,5 L 247.21 80.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M303.61,5 L 303.61 80.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M-91.16,5 L -91.16 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-85.52,5 L -85.52 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-79.88,5 L -79.88 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-74.24,5 L -74.24 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-68.6,5 L -68.6 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-62.96,5 L -62.96 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-57.32,5 L -57.32 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-51.68,5 L -51.68 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-46.04,5 L -46.04 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-40.4,5 L -40.4 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-34.76,5 L -34.76 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-29.12,5 L -29.12 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-23.48,5 L -23.48 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-17.84,5 L -17.84 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-12.21,5 L -12.21 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-6.57,5 L -6.57 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-0.93,5 L -0.93 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M4.71,5 L 4.71 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M10.35,5 L 10.35 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M15.99,5 L 15.99 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M21.63,5 L 21.63 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M27.27,5 L 27.27 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M32.91,5 L 32.91 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M38.55,5 L 38.55 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M44.19,5 L 44.19 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M49.83,5 L 49.83 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M55.47,5 L 55.47 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M61.11,5 L 61.11 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M66.75,5 L 66.75 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M72.39,5 L 72.39 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M78.03,5 L 78.03 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M83.67,5 L 83.67 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M89.31,5 L 89.31 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M94.94,5 L 94.94 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M100.58,5 L 100.58 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M106.22,5 L 106.22 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M111.86,5 L 111.86 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M117.5,5 L 117.5 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M123.14,5 L 123.14 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M128.78,5 L 128.78 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M134.42,5 L 134.42 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M140.06,5 L 140.06 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M145.7,5 L 145.7 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M151.34,5 L 151.34 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M156.98,5 L 156.98 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M162.62,5 L 162.62 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M168.26,5 L 168.26 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M173.9,5 L 173.9 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M179.54,5 L 179.54 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M185.18,5 L 185.18 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M190.82,5 L 190.82 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M196.46,5 L 196.46 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M202.1,5 L 202.1 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M207.73,5 L 207.73 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M213.37,5 L 213.37 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M219.01,5 L 219.01 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M224.65,5 L 224.65 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M230.29,5 L 230.29 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M235.93,5 L 235.93 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M241.57,5 L 241.57 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M247.21,5 L 247.21 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-91.16,5 L -91.16 80.72" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M21.63,5 L 21.63 80.72" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M134.42,5 L 134.42 80.72" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M247.21,5 L 247.21 80.72" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M-91.16,5 L -91.16 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-79.88,5 L -79.88 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-68.6,5 L -68.6 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-57.32,5 L -57.32 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-46.04,5 L -46.04 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-34.76,5 L -34.76 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-23.48,5 L -23.48 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-12.21,5 L -12.21 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-0.93,5 L -0.93 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M10.35,5 L 10.35 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M21.63,5 L 21.63 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M32.91,5 L 32.91 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M44.19,5 L 44.19 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M55.47,5 L 55.47 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M66.75,5 L 66.75 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M78.03,5 L 78.03 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M89.31,5 L 89.31 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M100.58,5 L 100.58 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M111.86,5 L 111.86 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M123.14,5 L 123.14 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M134.42,5 L 134.42 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M145.7,5 L 145.7 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M156.98,5 L 156.98 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M168.26,5 L 168.26 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M179.54,5 L 179.54 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M190.82,5 L 190.82 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M202.1,5 L 202.1 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M213.37,5 L 213.37 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M224.65,5 L 224.65 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M235.93,5 L 235.93 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M247.21,5 L 247.21 80.72" gadfly:scale="5.0" visibility="hidden"/>
    </g>
    <g class="plotpanel" id="img-24e2c5da-9">
      <g class="geometry" id="img-24e2c5da-10">
        <g class="color_RGBA{Float32}(0.0f0,0.74736935f0,1.0f0,1.0f0)" stroke="#FFFFFF" stroke-width="0.3" fill="#00BFFF" id="img-24e2c5da-11">
          <use xlink:href="#img-24e2c5da-12" x="21.74" y="78.71"/>
          <use xlink:href="#img-24e2c5da-12" x="21.86" y="78.36"/>
          <use xlink:href="#img-24e2c5da-12" x="21.97" y="76.2"/>
          <use xlink:href="#img-24e2c5da-12" x="22.08" y="78"/>
          <use xlink:href="#img-24e2c5da-12" x="22.2" y="76.92"/>
          <use xlink:href="#img-24e2c5da-12" x="22.31" y="75.85"/>
          <use xlink:href="#img-24e2c5da-12" x="22.42" y="72.98"/>
          <use xlink:href="#img-24e2c5da-12" x="22.53" y="77.64"/>
          <use xlink:href="#img-24e2c5da-12" x="22.65" y="71.9"/>
          <use xlink:href="#img-24e2c5da-12" x="22.76" y="76.56"/>
          <use xlink:href="#img-24e2c5da-12" x="22.87" y="73.69"/>
          <use xlink:href="#img-24e2c5da-12" x="22.99" y="75.49"/>
          <use xlink:href="#img-24e2c5da-12" x="23.1" y="75.49"/>
          <use xlink:href="#img-24e2c5da-12" x="23.21" y="72.62"/>
          <use xlink:href="#img-24e2c5da-12" x="23.32" y="72.62"/>
          <use xlink:href="#img-24e2c5da-12" x="23.44" y="77.28"/>
          <use xlink:href="#img-24e2c5da-12" x="23.55" y="74.41"/>
          <use xlink:href="#img-24e2c5da-12" x="23.66" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="23.77" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="23.89" y="76.2"/>
          <use xlink:href="#img-24e2c5da-12" x="24" y="76.2"/>
          <use xlink:href="#img-24e2c5da-12" x="24.11" y="73.34"/>
          <use xlink:href="#img-24e2c5da-12" x="24.23" y="73.34"/>
          <use xlink:href="#img-24e2c5da-12" x="24.34" y="75.13"/>
          <use xlink:href="#img-24e2c5da-12" x="24.45" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="24.56" y="75.13"/>
          <use xlink:href="#img-24e2c5da-12" x="24.68" y="38.91"/>
          <use xlink:href="#img-24e2c5da-12" x="24.79" y="72.26"/>
          <use xlink:href="#img-24e2c5da-12" x="24.9" y="72.26"/>
          <use xlink:href="#img-24e2c5da-12" x="25.02" y="72.26"/>
          <use xlink:href="#img-24e2c5da-12" x="25.13" y="40.71"/>
          <use xlink:href="#img-24e2c5da-12" x="25.24" y="76.92"/>
          <use xlink:href="#img-24e2c5da-12" x="25.35" y="69.39"/>
          <use xlink:href="#img-24e2c5da-12" x="25.47" y="74.05"/>
          <use xlink:href="#img-24e2c5da-12" x="25.58" y="74.05"/>
          <use xlink:href="#img-24e2c5da-12" x="25.69" y="71.18"/>
          <use xlink:href="#img-24e2c5da-12" x="25.8" y="71.18"/>
          <use xlink:href="#img-24e2c5da-12" x="25.92" y="71.18"/>
          <use xlink:href="#img-24e2c5da-12" x="26.03" y="66.52"/>
          <use xlink:href="#img-24e2c5da-12" x="26.14" y="75.85"/>
          <use xlink:href="#img-24e2c5da-12" x="26.26" y="39.63"/>
          <use xlink:href="#img-24e2c5da-12" x="26.37" y="75.85"/>
          <use xlink:href="#img-24e2c5da-12" x="26.48" y="68.32"/>
          <use xlink:href="#img-24e2c5da-12" x="26.59" y="72.98"/>
          <use xlink:href="#img-24e2c5da-12" x="26.71" y="72.98"/>
          <use xlink:href="#img-24e2c5da-12" x="26.82" y="72.98"/>
          <use xlink:href="#img-24e2c5da-12" x="26.93" y="41.42"/>
          <use xlink:href="#img-24e2c5da-12" x="27.05" y="74.77"/>
          <use xlink:href="#img-24e2c5da-12" x="27.16" y="70.11"/>
          <use xlink:href="#img-24e2c5da-12" x="27.27" y="70.11"/>
          <use xlink:href="#img-24e2c5da-12" x="27.38" y="70.11"/>
          <use xlink:href="#img-24e2c5da-12" x="27.5" y="74.77"/>
          <use xlink:href="#img-24e2c5da-12" x="27.61" y="74.77"/>
          <use xlink:href="#img-24e2c5da-12" x="27.72" y="38.55"/>
          <use xlink:href="#img-24e2c5da-12" x="27.84" y="38.55"/>
          <use xlink:href="#img-24e2c5da-12" x="27.95" y="71.9"/>
          <use xlink:href="#img-24e2c5da-12" x="28.06" y="67.24"/>
          <use xlink:href="#img-24e2c5da-12" x="28.17" y="71.9"/>
          <use xlink:href="#img-24e2c5da-12" x="28.29" y="67.24"/>
          <use xlink:href="#img-24e2c5da-12" x="28.4" y="71.9"/>
          <use xlink:href="#img-24e2c5da-12" x="28.51" y="71.9"/>
          <use xlink:href="#img-24e2c5da-12" x="28.62" y="40.35"/>
          <use xlink:href="#img-24e2c5da-12" x="28.74" y="40.35"/>
          <use xlink:href="#img-24e2c5da-12" x="28.85" y="76.56"/>
          <use xlink:href="#img-24e2c5da-12" x="28.96" y="69.03"/>
          <use xlink:href="#img-24e2c5da-12" x="29.08" y="69.03"/>
          <use xlink:href="#img-24e2c5da-12" x="29.19" y="69.03"/>
          <use xlink:href="#img-24e2c5da-12" x="29.3" y="73.69"/>
          <use xlink:href="#img-24e2c5da-12" x="29.41" y="73.69"/>
          <use xlink:href="#img-24e2c5da-12" x="29.53" y="73.69"/>
          <use xlink:href="#img-24e2c5da-12" x="29.64" y="42.14"/>
          <use xlink:href="#img-24e2c5da-12" x="29.75" y="70.83"/>
          <use xlink:href="#img-24e2c5da-12" x="29.87" y="37.48"/>
          <use xlink:href="#img-24e2c5da-12" x="29.98" y="70.83"/>
          <use xlink:href="#img-24e2c5da-12" x="30.09" y="73.69"/>
          <use xlink:href="#img-24e2c5da-12" x="30.2" y="70.83"/>
          <use xlink:href="#img-24e2c5da-12" x="30.32" y="70.83"/>
          <use xlink:href="#img-24e2c5da-12" x="30.43" y="66.16"/>
          <use xlink:href="#img-24e2c5da-12" x="30.54" y="66.16"/>
          <use xlink:href="#img-24e2c5da-12" x="30.65" y="75.49"/>
          <use xlink:href="#img-24e2c5da-12" x="30.77" y="70.83"/>
          <use xlink:href="#img-24e2c5da-12" x="30.88" y="39.27"/>
          <use xlink:href="#img-24e2c5da-12" x="30.99" y="39.27"/>
          <use xlink:href="#img-24e2c5da-12" x="31.11" y="75.49"/>
          <use xlink:href="#img-24e2c5da-12" x="31.22" y="75.49"/>
          <use xlink:href="#img-24e2c5da-12" x="31.33" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="31.44" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="31.56" y="72.62"/>
          <use xlink:href="#img-24e2c5da-12" x="31.67" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="31.78" y="72.62"/>
          <use xlink:href="#img-24e2c5da-12" x="31.9" y="45.73"/>
          <use xlink:href="#img-24e2c5da-12" x="32.01" y="72.62"/>
          <use xlink:href="#img-24e2c5da-12" x="32.12" y="72.62"/>
          <use xlink:href="#img-24e2c5da-12" x="32.23" y="41.06"/>
          <use xlink:href="#img-24e2c5da-12" x="32.35" y="41.06"/>
          <use xlink:href="#img-24e2c5da-12" x="32.46" y="74.41"/>
          <use xlink:href="#img-24e2c5da-12" x="32.57" y="36.4"/>
          <use xlink:href="#img-24e2c5da-12" x="32.69" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="32.8" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="32.91" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="33.02" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="33.14" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="33.25" y="47.52"/>
          <use xlink:href="#img-24e2c5da-12" x="33.36" y="74.41"/>
          <use xlink:href="#img-24e2c5da-12" x="33.47" y="65.09"/>
          <use xlink:href="#img-24e2c5da-12" x="33.59" y="74.41"/>
          <use xlink:href="#img-24e2c5da-12" x="33.7" y="42.86"/>
          <use xlink:href="#img-24e2c5da-12" x="33.81" y="38.2"/>
          <use xlink:href="#img-24e2c5da-12" x="33.93" y="38.2"/>
          <use xlink:href="#img-24e2c5da-12" x="34.04" y="38.2"/>
          <use xlink:href="#img-24e2c5da-12" x="34.15" y="53.97"/>
          <use xlink:href="#img-24e2c5da-12" x="34.26" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="34.38" y="74.41"/>
          <use xlink:href="#img-24e2c5da-12" x="34.49" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="34.6" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="34.72" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="34.83" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="34.94" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="35.05" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="35.17" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="35.28" y="44.65"/>
          <use xlink:href="#img-24e2c5da-12" x="35.39" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="35.5" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="35.62" y="39.99"/>
          <use xlink:href="#img-24e2c5da-12" x="35.73" y="39.99"/>
          <use xlink:href="#img-24e2c5da-12" x="35.84" y="39.99"/>
          <use xlink:href="#img-24e2c5da-12" x="35.96" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="36.07" y="76.2"/>
          <use xlink:href="#img-24e2c5da-12" x="36.18" y="35.33"/>
          <use xlink:href="#img-24e2c5da-12" x="36.29" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="36.41" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="36.52" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="36.63" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="36.75" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="36.86" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="36.97" y="73.34"/>
          <use xlink:href="#img-24e2c5da-12" x="37.08" y="46.44"/>
          <use xlink:href="#img-24e2c5da-12" x="37.2" y="73.34"/>
          <use xlink:href="#img-24e2c5da-12" x="37.31" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="37.42" y="73.34"/>
          <use xlink:href="#img-24e2c5da-12" x="37.54" y="73.34"/>
          <use xlink:href="#img-24e2c5da-12" x="37.65" y="41.78"/>
          <use xlink:href="#img-24e2c5da-12" x="37.76" y="41.78"/>
          <use xlink:href="#img-24e2c5da-12" x="37.87" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="37.99" y="37.12"/>
          <use xlink:href="#img-24e2c5da-12" x="38.1" y="37.12"/>
          <use xlink:href="#img-24e2c5da-12" x="38.21" y="37.12"/>
          <use xlink:href="#img-24e2c5da-12" x="38.32" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="38.44" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="38.55" y="73.34"/>
          <use xlink:href="#img-24e2c5da-12" x="38.66" y="73.34"/>
          <use xlink:href="#img-24e2c5da-12" x="38.78" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="38.89" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="39" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="39.11" y="48.24"/>
          <use xlink:href="#img-24e2c5da-12" x="39.23" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="39.34" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="39.45" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="39.57" y="59.35"/>
          <use xlink:href="#img-24e2c5da-12" x="39.68" y="75.13"/>
          <use xlink:href="#img-24e2c5da-12" x="39.79" y="43.57"/>
          <use xlink:href="#img-24e2c5da-12" x="39.9" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="40.02" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="40.13" y="38.91"/>
          <use xlink:href="#img-24e2c5da-12" x="40.24" y="38.91"/>
          <use xlink:href="#img-24e2c5da-12" x="40.35" y="38.91"/>
          <use xlink:href="#img-24e2c5da-12" x="40.47" y="54.69"/>
          <use xlink:href="#img-24e2c5da-12" x="40.58" y="75.13"/>
          <use xlink:href="#img-24e2c5da-12" x="40.69" y="61.14"/>
          <use xlink:href="#img-24e2c5da-12" x="40.81" y="75.13"/>
          <use xlink:href="#img-24e2c5da-12" x="40.92" y="34.25"/>
          <use xlink:href="#img-24e2c5da-12" x="41.03" y="67.6"/>
          <use xlink:href="#img-24e2c5da-12" x="41.14" y="67.6"/>
          <use xlink:href="#img-24e2c5da-12" x="41.26" y="67.6"/>
          <use xlink:href="#img-24e2c5da-12" x="41.37" y="50.03"/>
          <use xlink:href="#img-24e2c5da-12" x="41.48" y="72.26"/>
          <use xlink:href="#img-24e2c5da-12" x="41.6" y="67.6"/>
          <use xlink:href="#img-24e2c5da-12" x="41.71" y="67.6"/>
          <use xlink:href="#img-24e2c5da-12" x="41.82" y="67.6"/>
          <use xlink:href="#img-24e2c5da-12" x="41.93" y="72.26"/>
          <use xlink:href="#img-24e2c5da-12" x="42.05" y="72.26"/>
          <use xlink:href="#img-24e2c5da-12" x="42.16" y="45.37"/>
          <use xlink:href="#img-24e2c5da-12" x="42.27" y="45.37"/>
          <use xlink:href="#img-24e2c5da-12" x="42.38" y="72.26"/>
          <use xlink:href="#img-24e2c5da-12" x="42.5" y="62.94"/>
          <use xlink:href="#img-24e2c5da-12" x="42.61" y="72.26"/>
          <use xlink:href="#img-24e2c5da-12" x="42.72" y="62.94"/>
          <use xlink:href="#img-24e2c5da-12" x="42.84" y="40.71"/>
          <use xlink:href="#img-24e2c5da-12" x="42.95" y="40.71"/>
          <use xlink:href="#img-24e2c5da-12" x="43.06" y="40.71"/>
          <use xlink:href="#img-24e2c5da-12" x="43.17" y="62.94"/>
          <use xlink:href="#img-24e2c5da-12" x="43.29" y="74.05"/>
          <use xlink:href="#img-24e2c5da-12" x="43.4" y="36.04"/>
          <use xlink:href="#img-24e2c5da-12" x="43.51" y="36.04"/>
          <use xlink:href="#img-24e2c5da-12" x="43.63" y="36.04"/>
          <use xlink:href="#img-24e2c5da-12" x="43.74" y="69.39"/>
          <use xlink:href="#img-24e2c5da-12" x="43.85" y="69.39"/>
          <use xlink:href="#img-24e2c5da-12" x="43.96" y="69.39"/>
          <use xlink:href="#img-24e2c5da-12" x="44.08" y="36.04"/>
          <use xlink:href="#img-24e2c5da-12" x="44.19" y="69.39"/>
          <use xlink:href="#img-24e2c5da-12" x="44.3" y="72.26"/>
          <use xlink:href="#img-24e2c5da-12" x="44.42" y="69.39"/>
          <use xlink:href="#img-24e2c5da-12" x="44.53" y="64.73"/>
          <use xlink:href="#img-24e2c5da-12" x="44.64" y="69.39"/>
          <use xlink:href="#img-24e2c5da-12" x="44.75" y="69.39"/>
          <use xlink:href="#img-24e2c5da-12" x="44.87" y="47.16"/>
          <use xlink:href="#img-24e2c5da-12" x="44.98" y="47.16"/>
          <use xlink:href="#img-24e2c5da-12" x="45.09" y="74.05"/>
          <use xlink:href="#img-24e2c5da-12" x="45.2" y="64.73"/>
          <use xlink:href="#img-24e2c5da-12" x="45.32" y="64.73"/>
          <use xlink:href="#img-24e2c5da-12" x="45.43" y="64.73"/>
          <use xlink:href="#img-24e2c5da-12" x="45.54" y="74.05"/>
          <use xlink:href="#img-24e2c5da-12" x="45.66" y="74.05"/>
          <use xlink:href="#img-24e2c5da-12" x="45.77" y="42.5"/>
          <use xlink:href="#img-24e2c5da-12" x="45.88" y="42.5"/>
          <use xlink:href="#img-24e2c5da-12" x="45.99" y="37.84"/>
          <use xlink:href="#img-24e2c5da-12" x="46.11" y="69.39"/>
          <use xlink:href="#img-24e2c5da-12" x="46.22" y="37.84"/>
          <use xlink:href="#img-24e2c5da-12" x="46.33" y="60.07"/>
          <use xlink:href="#img-24e2c5da-12" x="46.45" y="37.84"/>
          <use xlink:href="#img-24e2c5da-12" x="46.56" y="37.84"/>
          <use xlink:href="#img-24e2c5da-12" x="46.67" y="53.61"/>
          <use xlink:href="#img-24e2c5da-12" x="46.78" y="53.61"/>
          <use xlink:href="#img-24e2c5da-12" x="46.9" y="71.18"/>
          <use xlink:href="#img-24e2c5da-12" x="47.01" y="60.07"/>
          <use xlink:href="#img-24e2c5da-12" x="47.12" y="74.05"/>
          <use xlink:href="#img-24e2c5da-12" x="47.23" y="74.05"/>
          <use xlink:href="#img-24e2c5da-12" x="47.35" y="66.52"/>
          <use xlink:href="#img-24e2c5da-12" x="47.46" y="66.52"/>
          <use xlink:href="#img-24e2c5da-12" x="47.57" y="66.52"/>
          <use xlink:href="#img-24e2c5da-12" x="47.69" y="33.18"/>
          <use xlink:href="#img-24e2c5da-12" x="47.8" y="71.18"/>
          <use xlink:href="#img-24e2c5da-12" x="47.91" y="48.95"/>
          <use xlink:href="#img-24e2c5da-12" x="48.02" y="71.18"/>
          <use xlink:href="#img-24e2c5da-12" x="48.14" y="33.18"/>
          <use xlink:href="#img-24e2c5da-12" x="48.25" y="66.52"/>
          <use xlink:href="#img-24e2c5da-12" x="48.36" y="66.52"/>
          <use xlink:href="#img-24e2c5da-12" x="48.48" y="66.52"/>
          <use xlink:href="#img-24e2c5da-12" x="48.59" y="60.07"/>
          <use xlink:href="#img-24e2c5da-12" x="48.7" y="71.18"/>
          <use xlink:href="#img-24e2c5da-12" x="48.81" y="71.18"/>
          <use xlink:href="#img-24e2c5da-12" x="48.93" y="44.29"/>
          <use xlink:href="#img-24e2c5da-12" x="49.04" y="44.29"/>
          <use xlink:href="#img-24e2c5da-12" x="49.15" y="71.18"/>
          <use xlink:href="#img-24e2c5da-12" x="49.27" y="71.18"/>
          <use xlink:href="#img-24e2c5da-12" x="49.38" y="61.86"/>
          <use xlink:href="#img-24e2c5da-12" x="49.49" y="61.86"/>
          <use xlink:href="#img-24e2c5da-12" x="49.6" y="39.63"/>
          <use xlink:href="#img-24e2c5da-12" x="49.72" y="61.86"/>
          <use xlink:href="#img-24e2c5da-12" x="49.83" y="39.63"/>
          <use xlink:href="#img-24e2c5da-12" x="49.94" y="55.41"/>
          <use xlink:href="#img-24e2c5da-12" x="50.05" y="39.63"/>
          <use xlink:href="#img-24e2c5da-12" x="50.17" y="39.63"/>
          <use xlink:href="#img-24e2c5da-12" x="50.28" y="61.86"/>
          <use xlink:href="#img-24e2c5da-12" x="50.39" y="61.86"/>
          <use xlink:href="#img-24e2c5da-12" x="50.51" y="75.85"/>
          <use xlink:href="#img-24e2c5da-12" x="50.62" y="34.97"/>
          <use xlink:href="#img-24e2c5da-12" x="50.73" y="34.97"/>
          <use xlink:href="#img-24e2c5da-12" x="50.84" y="34.97"/>
          <use xlink:href="#img-24e2c5da-12" x="50.96" y="68.32"/>
          <use xlink:href="#img-24e2c5da-12" x="51.07" y="68.32"/>
          <use xlink:href="#img-24e2c5da-12" x="51.18" y="68.32"/>
          <use xlink:href="#img-24e2c5da-12" x="51.3" y="50.75"/>
          <use xlink:href="#img-24e2c5da-12" x="51.41" y="68.32"/>
          <use xlink:href="#img-24e2c5da-12" x="51.52" y="34.97"/>
          <use xlink:href="#img-24e2c5da-12" x="51.63" y="68.32"/>
          <use xlink:href="#img-24e2c5da-12" x="51.75" y="71.18"/>
          <use xlink:href="#img-24e2c5da-12" x="51.86" y="68.32"/>
          <use xlink:href="#img-24e2c5da-12" x="51.97" y="68.32"/>
          <use xlink:href="#img-24e2c5da-12" x="52.08" y="63.65"/>
          <use xlink:href="#img-24e2c5da-12" x="52.2" y="63.65"/>
          <use xlink:href="#img-24e2c5da-12" x="52.31" y="72.98"/>
          <use xlink:href="#img-24e2c5da-12" x="52.42" y="68.32"/>
          <use xlink:href="#img-24e2c5da-12" x="52.54" y="46.08"/>
          <use xlink:href="#img-24e2c5da-12" x="52.65" y="46.08"/>
          <use xlink:href="#img-24e2c5da-12" x="52.76" y="72.98"/>
          <use xlink:href="#img-24e2c5da-12" x="52.87" y="72.98"/>
          <use xlink:href="#img-24e2c5da-12" x="52.99" y="63.65"/>
          <use xlink:href="#img-24e2c5da-12" x="53.1" y="63.65"/>
          <use xlink:href="#img-24e2c5da-12" x="53.21" y="72.98"/>
          <use xlink:href="#img-24e2c5da-12" x="53.33" y="63.65"/>
          <use xlink:href="#img-24e2c5da-12" x="53.44" y="72.98"/>
          <use xlink:href="#img-24e2c5da-12" x="53.55" y="57.2"/>
          <use xlink:href="#img-24e2c5da-12" x="53.66" y="41.42"/>
          <use xlink:href="#img-24e2c5da-12" x="53.78" y="41.42"/>
          <use xlink:href="#img-24e2c5da-12" x="53.89" y="41.42"/>
          <use xlink:href="#img-24e2c5da-12" x="54" y="63.65"/>
          <use xlink:href="#img-24e2c5da-12" x="54.12" y="70.11"/>
          <use xlink:href="#img-24e2c5da-12" x="54.23" y="68.32"/>
          <use xlink:href="#img-24e2c5da-12" x="54.34" y="36.76"/>
          <use xlink:href="#img-24e2c5da-12" x="54.45" y="36.76"/>
          <use xlink:href="#img-24e2c5da-12" x="54.57" y="36.76"/>
          <use xlink:href="#img-24e2c5da-12" x="54.68" y="36.76"/>
          <use xlink:href="#img-24e2c5da-12" x="54.79" y="36.76"/>
          <use xlink:href="#img-24e2c5da-12" x="54.9" y="58.99"/>
          <use xlink:href="#img-24e2c5da-12" x="55.02" y="70.11"/>
          <use xlink:href="#img-24e2c5da-12" x="55.13" y="52.54"/>
          <use xlink:href="#img-24e2c5da-12" x="55.24" y="70.11"/>
          <use xlink:href="#img-24e2c5da-12" x="55.36" y="36.76"/>
          <use xlink:href="#img-24e2c5da-12" x="55.47" y="72.98"/>
          <use xlink:href="#img-24e2c5da-12" x="55.58" y="72.98"/>
          <use xlink:href="#img-24e2c5da-12" x="55.69" y="72.98"/>
          <use xlink:href="#img-24e2c5da-12" x="55.81" y="63.65"/>
          <use xlink:href="#img-24e2c5da-12" x="55.92" y="70.11"/>
          <use xlink:href="#img-24e2c5da-12" x="56.03" y="65.45"/>
          <use xlink:href="#img-24e2c5da-12" x="56.15" y="65.45"/>
          <use xlink:href="#img-24e2c5da-12" x="56.26" y="65.45"/>
          <use xlink:href="#img-24e2c5da-12" x="56.37" y="70.11"/>
          <use xlink:href="#img-24e2c5da-12" x="56.48" y="70.11"/>
          <use xlink:href="#img-24e2c5da-12" x="56.6" y="47.88"/>
          <use xlink:href="#img-24e2c5da-12" x="56.71" y="47.88"/>
          <use xlink:href="#img-24e2c5da-12" x="56.82" y="65.45"/>
          <use xlink:href="#img-24e2c5da-12" x="56.93" y="32.1"/>
          <use xlink:href="#img-24e2c5da-12" x="57.05" y="65.45"/>
          <use xlink:href="#img-24e2c5da-12" x="57.16" y="65.45"/>
          <use xlink:href="#img-24e2c5da-12" x="57.27" y="65.45"/>
          <use xlink:href="#img-24e2c5da-12" x="57.39" y="65.45"/>
          <use xlink:href="#img-24e2c5da-12" x="57.5" y="58.99"/>
          <use xlink:href="#img-24e2c5da-12" x="57.61" y="58.99"/>
          <use xlink:href="#img-24e2c5da-12" x="57.72" y="74.77"/>
          <use xlink:href="#img-24e2c5da-12" x="57.84" y="70.11"/>
          <use xlink:href="#img-24e2c5da-12" x="57.95" y="43.22"/>
          <use xlink:href="#img-24e2c5da-12" x="58.06" y="43.22"/>
          <use xlink:href="#img-24e2c5da-12" x="58.18" y="70.11"/>
          <use xlink:href="#img-24e2c5da-12" x="58.29" y="70.11"/>
          <use xlink:href="#img-24e2c5da-12" x="58.4" y="70.11"/>
          <use xlink:href="#img-24e2c5da-12" x="58.51" y="27.44"/>
          <use xlink:href="#img-24e2c5da-12" x="58.63" y="38.55"/>
          <use xlink:href="#img-24e2c5da-12" x="58.74" y="60.79"/>
          <use xlink:href="#img-24e2c5da-12" x="58.85" y="38.55"/>
          <use xlink:href="#img-24e2c5da-12" x="58.97" y="70.11"/>
          <use xlink:href="#img-24e2c5da-12" x="59.08" y="38.55"/>
          <use xlink:href="#img-24e2c5da-12" x="59.19" y="38.55"/>
          <use xlink:href="#img-24e2c5da-12" x="59.3" y="54.33"/>
          <use xlink:href="#img-24e2c5da-12" x="59.42" y="54.33"/>
          <use xlink:href="#img-24e2c5da-12" x="59.53" y="74.77"/>
          <use xlink:href="#img-24e2c5da-12" x="59.64" y="38.55"/>
          <use xlink:href="#img-24e2c5da-12" x="59.75" y="60.79"/>
          <use xlink:href="#img-24e2c5da-12" x="59.87" y="60.79"/>
          <use xlink:href="#img-24e2c5da-12" x="59.98" y="74.77"/>
          <use xlink:href="#img-24e2c5da-12" x="60.09" y="74.77"/>
          <use xlink:href="#img-24e2c5da-12" x="60.21" y="33.89"/>
          <use xlink:href="#img-24e2c5da-12" x="60.32" y="33.89"/>
          <use xlink:href="#img-24e2c5da-12" x="60.43" y="67.24"/>
          <use xlink:href="#img-24e2c5da-12" x="60.54" y="33.89"/>
          <use xlink:href="#img-24e2c5da-12" x="60.66" y="67.24"/>
          <use xlink:href="#img-24e2c5da-12" x="60.77" y="33.89"/>
          <use xlink:href="#img-24e2c5da-12" x="60.88" y="67.24"/>
          <use xlink:href="#img-24e2c5da-12" x="61" y="67.24"/>
          <use xlink:href="#img-24e2c5da-12" x="61.11" y="49.67"/>
          <use xlink:href="#img-24e2c5da-12" x="61.22" y="49.67"/>
          <use xlink:href="#img-24e2c5da-12" x="61.33" y="71.9"/>
          <use xlink:href="#img-24e2c5da-12" x="61.45" y="33.89"/>
          <use xlink:href="#img-24e2c5da-12" x="61.56" y="67.24"/>
          <use xlink:href="#img-24e2c5da-12" x="61.67" y="67.24"/>
          <use xlink:href="#img-24e2c5da-12" x="61.78" y="67.24"/>
          <use xlink:href="#img-24e2c5da-12" x="61.9" y="67.24"/>
          <use xlink:href="#img-24e2c5da-12" x="62.01" y="67.24"/>
          <use xlink:href="#img-24e2c5da-12" x="62.12" y="60.79"/>
          <use xlink:href="#img-24e2c5da-12" x="62.24" y="71.9"/>
          <use xlink:href="#img-24e2c5da-12" x="62.35" y="62.58"/>
          <use xlink:href="#img-24e2c5da-12" x="62.46" y="71.9"/>
          <use xlink:href="#img-24e2c5da-12" x="62.57" y="62.58"/>
          <use xlink:href="#img-24e2c5da-12" x="62.69" y="45.01"/>
          <use xlink:href="#img-24e2c5da-12" x="62.8" y="45.01"/>
          <use xlink:href="#img-24e2c5da-12" x="62.91" y="45.01"/>
          <use xlink:href="#img-24e2c5da-12" x="63.03" y="62.58"/>
          <use xlink:href="#img-24e2c5da-12" x="63.14" y="71.9"/>
          <use xlink:href="#img-24e2c5da-12" x="63.25" y="71.9"/>
          <use xlink:href="#img-24e2c5da-12" x="63.36" y="62.58"/>
          <use xlink:href="#img-24e2c5da-12" x="63.48" y="62.58"/>
          <use xlink:href="#img-24e2c5da-12" x="63.59" y="71.9"/>
          <use xlink:href="#img-24e2c5da-12" x="63.7" y="71.9"/>
          <use xlink:href="#img-24e2c5da-12" x="63.82" y="62.58"/>
          <use xlink:href="#img-24e2c5da-12" x="63.93" y="62.58"/>
          <use xlink:href="#img-24e2c5da-12" x="64.04" y="40.35"/>
          <use xlink:href="#img-24e2c5da-12" x="64.15" y="56.12"/>
          <use xlink:href="#img-24e2c5da-12" x="64.27" y="40.35"/>
          <use xlink:href="#img-24e2c5da-12" x="64.38" y="57.92"/>
          <use xlink:href="#img-24e2c5da-12" x="64.49" y="40.35"/>
          <use xlink:href="#img-24e2c5da-12" x="64.6" y="40.35"/>
          <use xlink:href="#img-24e2c5da-12" x="64.72" y="62.58"/>
          <use xlink:href="#img-24e2c5da-12" x="64.83" y="62.58"/>
          <use xlink:href="#img-24e2c5da-12" x="64.94" y="73.69"/>
          <use xlink:href="#img-24e2c5da-12" x="65.06" y="67.24"/>
          <use xlink:href="#img-24e2c5da-12" x="65.17" y="35.69"/>
          <use xlink:href="#img-24e2c5da-12" x="65.28" y="35.69"/>
          <use xlink:href="#img-24e2c5da-12" x="65.39" y="35.69"/>
          <use xlink:href="#img-24e2c5da-12" x="65.51" y="35.69"/>
          <use xlink:href="#img-24e2c5da-12" x="65.62" y="35.69"/>
          <use xlink:href="#img-24e2c5da-12" x="65.73" y="35.69"/>
          <use xlink:href="#img-24e2c5da-12" x="65.85" y="69.03"/>
          <use xlink:href="#img-24e2c5da-12" x="65.96" y="57.92"/>
          <use xlink:href="#img-24e2c5da-12" x="66.07" y="69.03"/>
          <use xlink:href="#img-24e2c5da-12" x="66.18" y="51.46"/>
          <use xlink:href="#img-24e2c5da-12" x="66.3" y="69.03"/>
          <use xlink:href="#img-24e2c5da-12" x="66.41" y="69.03"/>
          <use xlink:href="#img-24e2c5da-12" x="66.52" y="35.69"/>
          <use xlink:href="#img-24e2c5da-12" x="66.63" y="35.69"/>
          <use xlink:href="#img-24e2c5da-12" x="66.75" y="69.03"/>
          <use xlink:href="#img-24e2c5da-12" x="66.86" y="71.9"/>
          <use xlink:href="#img-24e2c5da-12" x="66.97" y="71.9"/>
          <use xlink:href="#img-24e2c5da-12" x="67.09" y="71.9"/>
          <use xlink:href="#img-24e2c5da-12" x="67.2" y="69.03"/>
          <use xlink:href="#img-24e2c5da-12" x="67.31" y="69.03"/>
          <use xlink:href="#img-24e2c5da-12" x="67.42" y="64.37"/>
          <use xlink:href="#img-24e2c5da-12" x="67.54" y="64.37"/>
          <use xlink:href="#img-24e2c5da-12" x="67.65" y="69.03"/>
          <use xlink:href="#img-24e2c5da-12" x="67.76" y="64.37"/>
          <use xlink:href="#img-24e2c5da-12" x="67.88" y="69.03"/>
          <use xlink:href="#img-24e2c5da-12" x="67.99" y="31.02"/>
          <use xlink:href="#img-24e2c5da-12" x="68.1" y="46.8"/>
          <use xlink:href="#img-24e2c5da-12" x="68.21" y="46.8"/>
          <use xlink:href="#img-24e2c5da-12" x="68.33" y="46.8"/>
          <use xlink:href="#img-24e2c5da-12" x="68.44" y="31.02"/>
          <use xlink:href="#img-24e2c5da-12" x="68.55" y="73.69"/>
          <use xlink:href="#img-24e2c5da-12" x="68.66" y="31.02"/>
          <use xlink:href="#img-24e2c5da-12" x="68.78" y="64.37"/>
          <use xlink:href="#img-24e2c5da-12" x="68.89" y="64.37"/>
          <use xlink:href="#img-24e2c5da-12" x="69" y="64.37"/>
          <use xlink:href="#img-24e2c5da-12" x="69.12" y="64.37"/>
          <use xlink:href="#img-24e2c5da-12" x="69.23" y="64.37"/>
          <use xlink:href="#img-24e2c5da-12" x="69.34" y="67.24"/>
          <use xlink:href="#img-24e2c5da-12" x="69.45" y="73.69"/>
          <use xlink:href="#img-24e2c5da-12" x="69.57" y="57.92"/>
          <use xlink:href="#img-24e2c5da-12" x="69.68" y="73.69"/>
          <use xlink:href="#img-24e2c5da-12" x="69.79" y="59.71"/>
          <use xlink:href="#img-24e2c5da-12" x="69.91" y="42.14"/>
          <use xlink:href="#img-24e2c5da-12" x="70.02" y="42.14"/>
          <use xlink:href="#img-24e2c5da-12" x="70.13" y="42.14"/>
          <use xlink:href="#img-24e2c5da-12" x="70.24" y="64.37"/>
          <use xlink:href="#img-24e2c5da-12" x="70.36" y="37.48"/>
          <use xlink:href="#img-24e2c5da-12" x="70.47" y="69.03"/>
          <use xlink:href="#img-24e2c5da-12" x="70.58" y="69.03"/>
          <use xlink:href="#img-24e2c5da-12" x="70.7" y="69.03"/>
          <use xlink:href="#img-24e2c5da-12" x="70.81" y="37.48"/>
          <use xlink:href="#img-24e2c5da-12" x="70.92" y="37.48"/>
          <use xlink:href="#img-24e2c5da-12" x="71.03" y="59.71"/>
          <use xlink:href="#img-24e2c5da-12" x="71.15" y="59.71"/>
          <use xlink:href="#img-24e2c5da-12" x="71.26" y="37.48"/>
          <use xlink:href="#img-24e2c5da-12" x="71.37" y="69.03"/>
          <use xlink:href="#img-24e2c5da-12" x="71.48" y="37.48"/>
          <use xlink:href="#img-24e2c5da-12" x="71.6" y="59.71"/>
          <use xlink:href="#img-24e2c5da-12" x="71.71" y="53.26"/>
          <use xlink:href="#img-24e2c5da-12" x="71.82" y="53.26"/>
          <use xlink:href="#img-24e2c5da-12" x="71.94" y="53.26"/>
          <use xlink:href="#img-24e2c5da-12" x="72.05" y="43.93"/>
          <use xlink:href="#img-24e2c5da-12" x="72.16" y="70.83"/>
          <use xlink:href="#img-24e2c5da-12" x="72.27" y="37.48"/>
          <use xlink:href="#img-24e2c5da-12" x="72.39" y="59.71"/>
          <use xlink:href="#img-24e2c5da-12" x="72.5" y="59.71"/>
          <use xlink:href="#img-24e2c5da-12" x="72.61" y="73.69"/>
          <use xlink:href="#img-24e2c5da-12" x="72.73" y="73.69"/>
          <use xlink:href="#img-24e2c5da-12" x="72.84" y="73.69"/>
          <use xlink:href="#img-24e2c5da-12" x="72.95" y="64.37"/>
          <use xlink:href="#img-24e2c5da-12" x="73.06" y="66.16"/>
          <use xlink:href="#img-24e2c5da-12" x="73.18" y="32.82"/>
          <use xlink:href="#img-24e2c5da-12" x="73.29" y="66.16"/>
          <use xlink:href="#img-24e2c5da-12" x="73.4" y="32.82"/>
          <use xlink:href="#img-24e2c5da-12" x="73.51" y="66.16"/>
          <use xlink:href="#img-24e2c5da-12" x="73.63" y="66.16"/>
          <use xlink:href="#img-24e2c5da-12" x="73.74" y="32.82"/>
          <use xlink:href="#img-24e2c5da-12" x="73.85" y="32.82"/>
          <use xlink:href="#img-24e2c5da-12" x="73.97" y="70.83"/>
          <use xlink:href="#img-24e2c5da-12" x="74.08" y="66.16"/>
          <use xlink:href="#img-24e2c5da-12" x="74.19" y="48.59"/>
          <use xlink:href="#img-24e2c5da-12" x="74.3" y="48.59"/>
          <use xlink:href="#img-24e2c5da-12" x="74.42" y="70.83"/>
          <use xlink:href="#img-24e2c5da-12" x="74.53" y="70.83"/>
          <use xlink:href="#img-24e2c5da-12" x="74.64" y="32.82"/>
          <use xlink:href="#img-24e2c5da-12" x="74.76" y="32.82"/>
          <use xlink:href="#img-24e2c5da-12" x="74.87" y="66.16"/>
          <use xlink:href="#img-24e2c5da-12" x="74.98" y="66.16"/>
          <use xlink:href="#img-24e2c5da-12" x="75.09" y="66.16"/>
          <use xlink:href="#img-24e2c5da-12" x="75.21" y="69.03"/>
          <use xlink:href="#img-24e2c5da-12" x="75.32" y="66.16"/>
          <use xlink:href="#img-24e2c5da-12" x="75.43" y="66.16"/>
          <use xlink:href="#img-24e2c5da-12" x="75.55" y="59.71"/>
          <use xlink:href="#img-24e2c5da-12" x="75.66" y="59.71"/>
          <use xlink:href="#img-24e2c5da-12" x="75.77" y="70.83"/>
          <use xlink:href="#img-24e2c5da-12" x="75.88" y="61.5"/>
          <use xlink:href="#img-24e2c5da-12" x="76" y="70.83"/>
          <use xlink:href="#img-24e2c5da-12" x="76.11" y="70.83"/>
          <use xlink:href="#img-24e2c5da-12" x="76.22" y="43.93"/>
          <use xlink:href="#img-24e2c5da-12" x="76.33" y="43.93"/>
          <use xlink:href="#img-24e2c5da-12" x="76.45" y="43.93"/>
          <use xlink:href="#img-24e2c5da-12" x="76.56" y="28.16"/>
          <use xlink:href="#img-24e2c5da-12" x="76.67" y="70.83"/>
          <use xlink:href="#img-24e2c5da-12" x="76.79" y="61.5"/>
          <use xlink:href="#img-24e2c5da-12" x="76.9" y="70.83"/>
          <use xlink:href="#img-24e2c5da-12" x="77.01" y="28.16"/>
          <use xlink:href="#img-24e2c5da-12" x="77.12" y="61.5"/>
          <use xlink:href="#img-24e2c5da-12" x="77.24" y="61.5"/>
          <use xlink:href="#img-24e2c5da-12" x="77.35" y="61.5"/>
          <use xlink:href="#img-24e2c5da-12" x="77.46" y="43.93"/>
          <use xlink:href="#img-24e2c5da-12" x="77.58" y="39.27"/>
          <use xlink:href="#img-24e2c5da-12" x="77.69" y="70.83"/>
          <use xlink:href="#img-24e2c5da-12" x="77.8" y="61.5"/>
          <use xlink:href="#img-24e2c5da-12" x="77.91" y="61.5"/>
          <use xlink:href="#img-24e2c5da-12" x="78.03" y="39.27"/>
          <use xlink:href="#img-24e2c5da-12" x="78.14" y="39.27"/>
          <use xlink:href="#img-24e2c5da-12" x="78.25" y="55.05"/>
          <use xlink:href="#img-24e2c5da-12" x="78.36" y="55.05"/>
          <use xlink:href="#img-24e2c5da-12" x="78.48" y="39.27"/>
          <use xlink:href="#img-24e2c5da-12" x="78.59" y="56.84"/>
          <use xlink:href="#img-24e2c5da-12" x="78.7" y="39.27"/>
          <use xlink:href="#img-24e2c5da-12" x="78.82" y="66.16"/>
          <use xlink:href="#img-24e2c5da-12" x="78.93" y="61.5"/>
          <use xlink:href="#img-24e2c5da-12" x="79.04" y="61.5"/>
          <use xlink:href="#img-24e2c5da-12" x="79.15" y="61.5"/>
          <use xlink:href="#img-24e2c5da-12" x="79.27" y="56.84"/>
          <use xlink:href="#img-24e2c5da-12" x="79.38" y="75.49"/>
          <use xlink:href="#img-24e2c5da-12" x="79.49" y="66.16"/>
          <use xlink:href="#img-24e2c5da-12" x="79.61" y="34.61"/>
          <use xlink:href="#img-24e2c5da-12" x="79.72" y="34.61"/>
          <use xlink:href="#img-24e2c5da-12" x="79.83" y="34.61"/>
          <use xlink:href="#img-24e2c5da-12" x="79.94" y="34.61"/>
          <use xlink:href="#img-24e2c5da-12" x="80.06" y="34.61"/>
          <use xlink:href="#img-24e2c5da-12" x="80.17" y="56.84"/>
          <use xlink:href="#img-24e2c5da-12" x="80.28" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="80.4" y="34.61"/>
          <use xlink:href="#img-24e2c5da-12" x="80.51" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="80.62" y="34.61"/>
          <use xlink:href="#img-24e2c5da-12" x="80.73" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="80.85" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="80.96" y="50.39"/>
          <use xlink:href="#img-24e2c5da-12" x="81.07" y="50.39"/>
          <use xlink:href="#img-24e2c5da-12" x="81.18" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="81.3" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="81.41" y="34.61"/>
          <use xlink:href="#img-24e2c5da-12" x="81.52" y="34.61"/>
          <use xlink:href="#img-24e2c5da-12" x="81.64" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="81.75" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="81.86" y="70.83"/>
          <use xlink:href="#img-24e2c5da-12" x="81.97" y="70.83"/>
          <use xlink:href="#img-24e2c5da-12" x="82.09" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="82.2" y="70.83"/>
          <use xlink:href="#img-24e2c5da-12" x="82.31" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="82.43" y="61.5"/>
          <use xlink:href="#img-24e2c5da-12" x="82.54" y="63.3"/>
          <use xlink:href="#img-24e2c5da-12" x="82.65" y="63.3"/>
          <use xlink:href="#img-24e2c5da-12" x="82.76" y="63.3"/>
          <use xlink:href="#img-24e2c5da-12" x="82.88" y="29.95"/>
          <use xlink:href="#img-24e2c5da-12" x="82.99" y="72.62"/>
          <use xlink:href="#img-24e2c5da-12" x="83.1" y="63.3"/>
          <use xlink:href="#img-24e2c5da-12" x="83.21" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="83.33" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="83.44" y="45.73"/>
          <use xlink:href="#img-24e2c5da-12" x="83.55" y="45.73"/>
          <use xlink:href="#img-24e2c5da-12" x="83.67" y="45.73"/>
          <use xlink:href="#img-24e2c5da-12" x="83.78" y="63.3"/>
          <use xlink:href="#img-24e2c5da-12" x="83.89" y="72.62"/>
          <use xlink:href="#img-24e2c5da-12" x="84" y="29.95"/>
          <use xlink:href="#img-24e2c5da-12" x="84.12" y="72.62"/>
          <use xlink:href="#img-24e2c5da-12" x="84.23" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="84.34" y="63.3"/>
          <use xlink:href="#img-24e2c5da-12" x="84.46" y="63.3"/>
          <use xlink:href="#img-24e2c5da-12" x="84.57" y="63.3"/>
          <use xlink:href="#img-24e2c5da-12" x="84.68" y="47.52"/>
          <use xlink:href="#img-24e2c5da-12" x="84.79" y="72.62"/>
          <use xlink:href="#img-24e2c5da-12" x="84.91" y="63.3"/>
          <use xlink:href="#img-24e2c5da-12" x="85.02" y="63.3"/>
          <use xlink:href="#img-24e2c5da-12" x="85.13" y="63.3"/>
          <use xlink:href="#img-24e2c5da-12" x="85.25" y="72.62"/>
          <use xlink:href="#img-24e2c5da-12" x="85.36" y="72.62"/>
          <use xlink:href="#img-24e2c5da-12" x="85.47" y="56.84"/>
          <use xlink:href="#img-24e2c5da-12" x="85.58" y="56.84"/>
          <use xlink:href="#img-24e2c5da-12" x="85.7" y="41.06"/>
          <use xlink:href="#img-24e2c5da-12" x="85.81" y="58.63"/>
          <use xlink:href="#img-24e2c5da-12" x="85.92" y="41.06"/>
          <use xlink:href="#img-24e2c5da-12" x="86.03" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="86.15" y="41.06"/>
          <use xlink:href="#img-24e2c5da-12" x="86.26" y="41.06"/>
          <use xlink:href="#img-24e2c5da-12" x="86.37" y="63.3"/>
          <use xlink:href="#img-24e2c5da-12" x="86.49" y="63.3"/>
          <use xlink:href="#img-24e2c5da-12" x="86.6" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="86.71" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="86.82" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="86.94" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="87.05" y="36.4"/>
          <use xlink:href="#img-24e2c5da-12" x="87.16" y="36.4"/>
          <use xlink:href="#img-24e2c5da-12" x="87.28" y="36.4"/>
          <use xlink:href="#img-24e2c5da-12" x="87.39" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="87.5" y="36.4"/>
          <use xlink:href="#img-24e2c5da-12" x="87.61" y="58.63"/>
          <use xlink:href="#img-24e2c5da-12" x="87.73" y="36.4"/>
          <use xlink:href="#img-24e2c5da-12" x="87.84" y="36.4"/>
          <use xlink:href="#img-24e2c5da-12" x="87.95" y="36.4"/>
          <use xlink:href="#img-24e2c5da-12" x="88.06" y="36.4"/>
          <use xlink:href="#img-24e2c5da-12" x="88.18" y="58.63"/>
          <use xlink:href="#img-24e2c5da-12" x="88.29" y="58.63"/>
          <use xlink:href="#img-24e2c5da-12" x="88.4" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="88.52" y="52.18"/>
          <use xlink:href="#img-24e2c5da-12" x="88.63" y="52.18"/>
          <use xlink:href="#img-24e2c5da-12" x="88.74" y="52.18"/>
          <use xlink:href="#img-24e2c5da-12" x="88.85" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="88.97" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="89.08" y="36.4"/>
          <use xlink:href="#img-24e2c5da-12" x="89.19" y="36.4"/>
          <use xlink:href="#img-24e2c5da-12" x="89.31" y="72.62"/>
          <use xlink:href="#img-24e2c5da-12" x="89.42" y="58.63"/>
          <use xlink:href="#img-24e2c5da-12" x="89.53" y="72.62"/>
          <use xlink:href="#img-24e2c5da-12" x="89.64" y="53.97"/>
          <use xlink:href="#img-24e2c5da-12" x="89.76" y="72.62"/>
          <use xlink:href="#img-24e2c5da-12" x="89.87" y="72.62"/>
          <use xlink:href="#img-24e2c5da-12" x="89.98" y="63.3"/>
          <use xlink:href="#img-24e2c5da-12" x="90.1" y="63.3"/>
          <use xlink:href="#img-24e2c5da-12" x="90.21" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="90.32" y="31.74"/>
          <use xlink:href="#img-24e2c5da-12" x="90.43" y="65.09"/>
          <use xlink:href="#img-24e2c5da-12" x="90.55" y="65.09"/>
          <use xlink:href="#img-24e2c5da-12" x="90.66" y="65.09"/>
          <use xlink:href="#img-24e2c5da-12" x="90.77" y="65.09"/>
          <use xlink:href="#img-24e2c5da-12" x="90.88" y="65.09"/>
          <use xlink:href="#img-24e2c5da-12" x="91" y="53.97"/>
          <use xlink:href="#img-24e2c5da-12" x="91.11" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="91.22" y="31.74"/>
          <use xlink:href="#img-24e2c5da-12" x="91.34" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="91.45" y="31.74"/>
          <use xlink:href="#img-24e2c5da-12" x="91.56" y="47.52"/>
          <use xlink:href="#img-24e2c5da-12" x="91.67" y="47.52"/>
          <use xlink:href="#img-24e2c5da-12" x="91.79" y="47.52"/>
          <use xlink:href="#img-24e2c5da-12" x="91.9" y="31.74"/>
          <use xlink:href="#img-24e2c5da-12" x="92.01" y="65.09"/>
          <use xlink:href="#img-24e2c5da-12" x="92.13" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="92.24" y="31.74"/>
          <use xlink:href="#img-24e2c5da-12" x="92.35" y="31.74"/>
          <use xlink:href="#img-24e2c5da-12" x="92.46" y="65.09"/>
          <use xlink:href="#img-24e2c5da-12" x="92.58" y="65.09"/>
          <use xlink:href="#img-24e2c5da-12" x="92.69" y="65.09"/>
          <use xlink:href="#img-24e2c5da-12" x="92.8" y="65.09"/>
          <use xlink:href="#img-24e2c5da-12" x="92.91" y="65.09"/>
          <use xlink:href="#img-24e2c5da-12" x="93.03" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="93.14" y="65.09"/>
          <use xlink:href="#img-24e2c5da-12" x="93.25" y="67.96"/>
          <use xlink:href="#img-24e2c5da-12" x="93.37" y="58.63"/>
          <use xlink:href="#img-24e2c5da-12" x="93.48" y="58.63"/>
          <use xlink:href="#img-24e2c5da-12" x="93.59" y="58.63"/>
          <use xlink:href="#img-24e2c5da-12" x="93.7" y="31.74"/>
          <use xlink:href="#img-24e2c5da-12" x="93.82" y="74.41"/>
          <use xlink:href="#img-24e2c5da-12" x="93.93" y="60.43"/>
          <use xlink:href="#img-24e2c5da-12" x="94.04" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="94.16" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="94.27" y="42.86"/>
          <use xlink:href="#img-24e2c5da-12" x="94.38" y="42.86"/>
          <use xlink:href="#img-24e2c5da-12" x="94.49" y="42.86"/>
          <use xlink:href="#img-24e2c5da-12" x="94.61" y="65.09"/>
          <use xlink:href="#img-24e2c5da-12" x="94.72" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="94.83" y="27.08"/>
          <use xlink:href="#img-24e2c5da-12" x="94.94" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="95.06" y="42.86"/>
          <use xlink:href="#img-24e2c5da-12" x="95.17" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="95.28" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="95.4" y="27.08"/>
          <use xlink:href="#img-24e2c5da-12" x="95.51" y="27.08"/>
          <use xlink:href="#img-24e2c5da-12" x="95.62" y="38.2"/>
          <use xlink:href="#img-24e2c5da-12" x="95.73" y="60.43"/>
          <use xlink:href="#img-24e2c5da-12" x="95.85" y="60.43"/>
          <use xlink:href="#img-24e2c5da-12" x="95.96" y="60.43"/>
          <use xlink:href="#img-24e2c5da-12" x="96.07" y="38.2"/>
          <use xlink:href="#img-24e2c5da-12" x="96.19" y="38.2"/>
          <use xlink:href="#img-24e2c5da-12" x="96.3" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="96.41" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="96.52" y="38.2"/>
          <use xlink:href="#img-24e2c5da-12" x="96.64" y="60.43"/>
          <use xlink:href="#img-24e2c5da-12" x="96.75" y="38.2"/>
          <use xlink:href="#img-24e2c5da-12" x="96.86" y="27.08"/>
          <use xlink:href="#img-24e2c5da-12" x="96.98" y="53.97"/>
          <use xlink:href="#img-24e2c5da-12" x="97.09" y="53.97"/>
          <use xlink:href="#img-24e2c5da-12" x="97.2" y="53.97"/>
          <use xlink:href="#img-24e2c5da-12" x="97.31" y="44.65"/>
          <use xlink:href="#img-24e2c5da-12" x="97.43" y="74.41"/>
          <use xlink:href="#img-24e2c5da-12" x="97.54" y="55.77"/>
          <use xlink:href="#img-24e2c5da-12" x="97.65" y="38.2"/>
          <use xlink:href="#img-24e2c5da-12" x="97.76" y="38.2"/>
          <use xlink:href="#img-24e2c5da-12" x="97.88" y="60.43"/>
          <use xlink:href="#img-24e2c5da-12" x="97.99" y="60.43"/>
          <use xlink:href="#img-24e2c5da-12" x="98.1" y="60.43"/>
          <use xlink:href="#img-24e2c5da-12" x="98.22" y="55.77"/>
          <use xlink:href="#img-24e2c5da-12" x="98.33" y="74.41"/>
          <use xlink:href="#img-24e2c5da-12" x="98.44" y="55.77"/>
          <use xlink:href="#img-24e2c5da-12" x="98.55" y="74.41"/>
          <use xlink:href="#img-24e2c5da-12" x="98.67" y="65.09"/>
          <use xlink:href="#img-24e2c5da-12" x="98.78" y="33.53"/>
          <use xlink:href="#img-24e2c5da-12" x="98.89" y="33.53"/>
          <use xlink:href="#img-24e2c5da-12" x="99.01" y="33.53"/>
          <use xlink:href="#img-24e2c5da-12" x="99.12" y="65.09"/>
          <use xlink:href="#img-24e2c5da-12" x="99.23" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="99.34" y="33.53"/>
          <use xlink:href="#img-24e2c5da-12" x="99.46" y="33.53"/>
          <use xlink:href="#img-24e2c5da-12" x="99.57" y="33.53"/>
          <use xlink:href="#img-24e2c5da-12" x="99.68" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="99.79" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="99.91" y="33.53"/>
          <use xlink:href="#img-24e2c5da-12" x="100.02" y="33.53"/>
          <use xlink:href="#img-24e2c5da-12" x="100.13" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="100.25" y="33.53"/>
          <use xlink:href="#img-24e2c5da-12" x="100.36" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="100.47" y="55.77"/>
          <use xlink:href="#img-24e2c5da-12" x="100.58" y="49.31"/>
          <use xlink:href="#img-24e2c5da-12" x="100.7" y="49.31"/>
          <use xlink:href="#img-24e2c5da-12" x="100.81" y="49.31"/>
          <use xlink:href="#img-24e2c5da-12" x="100.92" y="17.76"/>
          <use xlink:href="#img-24e2c5da-12" x="101.04" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="101.15" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="101.26" y="33.53"/>
          <use xlink:href="#img-24e2c5da-12" x="101.37" y="33.53"/>
          <use xlink:href="#img-24e2c5da-12" x="101.49" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="101.6" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="101.71" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="101.83" y="55.77"/>
          <use xlink:href="#img-24e2c5da-12" x="101.94" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="102.05" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="102.16" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="102.28" y="69.75"/>
          <use xlink:href="#img-24e2c5da-12" x="102.39" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="102.5" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="102.61" y="60.43"/>
          <use xlink:href="#img-24e2c5da-12" x="102.73" y="60.43"/>
          <use xlink:href="#img-24e2c5da-12" x="102.84" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="102.95" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="103.07" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="103.18" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="103.29" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="103.4" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="103.52" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="103.63" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="103.74" y="44.65"/>
          <use xlink:href="#img-24e2c5da-12" x="103.86" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="103.97" y="44.65"/>
          <use xlink:href="#img-24e2c5da-12" x="104.08" y="28.87"/>
          <use xlink:href="#img-24e2c5da-12" x="104.19" y="44.65"/>
          <use xlink:href="#img-24e2c5da-12" x="104.31" y="44.65"/>
          <use xlink:href="#img-24e2c5da-12" x="104.42" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="104.53" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="104.64" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="104.76" y="28.87"/>
          <use xlink:href="#img-24e2c5da-12" x="104.87" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="104.98" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="105.1" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="105.21" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="105.32" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="105.43" y="44.65"/>
          <use xlink:href="#img-24e2c5da-12" x="105.55" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="105.66" y="46.44"/>
          <use xlink:href="#img-24e2c5da-12" x="105.77" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="105.89" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="106" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="106.11" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="106.22" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="106.34" y="28.87"/>
          <use xlink:href="#img-24e2c5da-12" x="106.45" y="39.99"/>
          <use xlink:href="#img-24e2c5da-12" x="106.56" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="106.68" y="55.77"/>
          <use xlink:href="#img-24e2c5da-12" x="106.79" y="55.77"/>
          <use xlink:href="#img-24e2c5da-12" x="106.9" y="39.99"/>
          <use xlink:href="#img-24e2c5da-12" x="107.01" y="39.99"/>
          <use xlink:href="#img-24e2c5da-12" x="107.13" y="57.56"/>
          <use xlink:href="#img-24e2c5da-12" x="107.24" y="57.56"/>
          <use xlink:href="#img-24e2c5da-12" x="107.35" y="39.99"/>
          <use xlink:href="#img-24e2c5da-12" x="107.46" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="107.58" y="39.99"/>
          <use xlink:href="#img-24e2c5da-12" x="107.69" y="24.21"/>
          <use xlink:href="#img-24e2c5da-12" x="107.8" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="107.92" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="108.03" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="108.14" y="57.56"/>
          <use xlink:href="#img-24e2c5da-12" x="108.25" y="73.34"/>
          <use xlink:href="#img-24e2c5da-12" x="108.37" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="108.48" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="108.59" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="108.71" y="35.33"/>
          <use xlink:href="#img-24e2c5da-12" x="108.82" y="35.33"/>
          <use xlink:href="#img-24e2c5da-12" x="108.93" y="35.33"/>
          <use xlink:href="#img-24e2c5da-12" x="109.04" y="24.21"/>
          <use xlink:href="#img-24e2c5da-12" x="109.16" y="35.33"/>
          <use xlink:href="#img-24e2c5da-12" x="109.27" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="109.38" y="35.33"/>
          <use xlink:href="#img-24e2c5da-12" x="109.49" y="57.56"/>
          <use xlink:href="#img-24e2c5da-12" x="109.61" y="35.33"/>
          <use xlink:href="#img-24e2c5da-12" x="109.72" y="35.33"/>
          <use xlink:href="#img-24e2c5da-12" x="109.83" y="35.33"/>
          <use xlink:href="#img-24e2c5da-12" x="109.95" y="35.33"/>
          <use xlink:href="#img-24e2c5da-12" x="110.06" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="110.17" y="35.33"/>
          <use xlink:href="#img-24e2c5da-12" x="110.28" y="57.56"/>
          <use xlink:href="#img-24e2c5da-12" x="110.4" y="57.56"/>
          <use xlink:href="#img-24e2c5da-12" x="110.51" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="110.62" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="110.74" y="51.1"/>
          <use xlink:href="#img-24e2c5da-12" x="110.85" y="51.1"/>
          <use xlink:href="#img-24e2c5da-12" x="110.96" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="111.07" y="51.1"/>
          <use xlink:href="#img-24e2c5da-12" x="111.19" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="111.3" y="41.78"/>
          <use xlink:href="#img-24e2c5da-12" x="111.41" y="35.33"/>
          <use xlink:href="#img-24e2c5da-12" x="111.53" y="35.33"/>
          <use xlink:href="#img-24e2c5da-12" x="111.64" y="35.33"/>
          <use xlink:href="#img-24e2c5da-12" x="111.75" y="52.9"/>
          <use xlink:href="#img-24e2c5da-12" x="111.86" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="111.98" y="57.56"/>
          <use xlink:href="#img-24e2c5da-12" x="112.09" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="112.2" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="112.31" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="112.43" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="112.54" y="71.54"/>
          <use xlink:href="#img-24e2c5da-12" x="112.65" y="52.9"/>
          <use xlink:href="#img-24e2c5da-12" x="112.77" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="112.88" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="112.99" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="113.1" y="30.67"/>
          <use xlink:href="#img-24e2c5da-12" x="113.22" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="113.33" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="113.44" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="113.56" y="30.67"/>
          <use xlink:href="#img-24e2c5da-12" x="113.67" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="113.78" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="113.89" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="114.01" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="114.12" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="114.23" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="114.34" y="30.67"/>
          <use xlink:href="#img-24e2c5da-12" x="114.46" y="30.67"/>
          <use xlink:href="#img-24e2c5da-12" x="114.57" y="46.44"/>
          <use xlink:href="#img-24e2c5da-12" x="114.68" y="30.67"/>
          <use xlink:href="#img-24e2c5da-12" x="114.8" y="46.44"/>
          <use xlink:href="#img-24e2c5da-12" x="114.91" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="115.02" y="46.44"/>
          <use xlink:href="#img-24e2c5da-12" x="115.13" y="46.44"/>
          <use xlink:href="#img-24e2c5da-12" x="115.25" y="30.67"/>
          <use xlink:href="#img-24e2c5da-12" x="115.36" y="30.67"/>
          <use xlink:href="#img-24e2c5da-12" x="115.47" y="73.34"/>
          <use xlink:href="#img-24e2c5da-12" x="115.59" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="115.7" y="30.67"/>
          <use xlink:href="#img-24e2c5da-12" x="115.81" y="30.67"/>
          <use xlink:href="#img-24e2c5da-12" x="115.92" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="116.04" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="116.15" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="116.26" y="48.24"/>
          <use xlink:href="#img-24e2c5da-12" x="116.38" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="116.49" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="116.6" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="116.71" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="116.83" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="116.94" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="117.05" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="117.16" y="66.88"/>
          <use xlink:href="#img-24e2c5da-12" x="117.28" y="73.34"/>
          <use xlink:href="#img-24e2c5da-12" x="117.39" y="57.56"/>
          <use xlink:href="#img-24e2c5da-12" x="117.5" y="57.56"/>
          <use xlink:href="#img-24e2c5da-12" x="117.62" y="57.56"/>
          <use xlink:href="#img-24e2c5da-12" x="117.73" y="73.34"/>
          <use xlink:href="#img-24e2c5da-12" x="117.84" y="73.34"/>
          <use xlink:href="#img-24e2c5da-12" x="117.95" y="59.35"/>
          <use xlink:href="#img-24e2c5da-12" x="118.07" y="59.35"/>
          <use xlink:href="#img-24e2c5da-12" x="118.18" y="41.78"/>
          <use xlink:href="#img-24e2c5da-12" x="118.29" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="118.41" y="41.78"/>
          <use xlink:href="#img-24e2c5da-12" x="118.52" y="26"/>
          <use xlink:href="#img-24e2c5da-12" x="118.63" y="41.78"/>
          <use xlink:href="#img-24e2c5da-12" x="118.74" y="41.78"/>
          <use xlink:href="#img-24e2c5da-12" x="118.86" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="118.97" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="119.08" y="37.12"/>
          <use xlink:href="#img-24e2c5da-12" x="119.19" y="26"/>
          <use xlink:href="#img-24e2c5da-12" x="119.31" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="119.42" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="119.53" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="119.65" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="119.76" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="119.87" y="14.89"/>
          <use xlink:href="#img-24e2c5da-12" x="119.98" y="37.12"/>
          <use xlink:href="#img-24e2c5da-12" x="120.1" y="26"/>
          <use xlink:href="#img-24e2c5da-12" x="120.21" y="37.12"/>
          <use xlink:href="#img-24e2c5da-12" x="120.32" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="120.44" y="59.35"/>
          <use xlink:href="#img-24e2c5da-12" x="120.55" y="59.35"/>
          <use xlink:href="#img-24e2c5da-12" x="120.66" y="59.35"/>
          <use xlink:href="#img-24e2c5da-12" x="120.77" y="26"/>
          <use xlink:href="#img-24e2c5da-12" x="120.89" y="37.12"/>
          <use xlink:href="#img-24e2c5da-12" x="121" y="37.12"/>
          <use xlink:href="#img-24e2c5da-12" x="121.11" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="121.22" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="121.34" y="37.12"/>
          <use xlink:href="#img-24e2c5da-12" x="121.45" y="37.12"/>
          <use xlink:href="#img-24e2c5da-12" x="121.56" y="59.35"/>
          <use xlink:href="#img-24e2c5da-12" x="121.68" y="59.35"/>
          <use xlink:href="#img-24e2c5da-12" x="121.79" y="52.9"/>
          <use xlink:href="#img-24e2c5da-12" x="121.9" y="26"/>
          <use xlink:href="#img-24e2c5da-12" x="122.01" y="52.9"/>
          <use xlink:href="#img-24e2c5da-12" x="122.13" y="62.22"/>
          <use xlink:href="#img-24e2c5da-12" x="122.24" y="52.9"/>
          <use xlink:href="#img-24e2c5da-12" x="122.35" y="52.9"/>
          <use xlink:href="#img-24e2c5da-12" x="122.47" y="43.57"/>
          <use xlink:href="#img-24e2c5da-12" x="122.58" y="43.57"/>
          <use xlink:href="#img-24e2c5da-12" x="122.69" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="122.8" y="54.69"/>
          <use xlink:href="#img-24e2c5da-12" x="122.92" y="37.12"/>
          <use xlink:href="#img-24e2c5da-12" x="123.03" y="37.12"/>
          <use xlink:href="#img-24e2c5da-12" x="123.14" y="59.35"/>
          <use xlink:href="#img-24e2c5da-12" x="123.26" y="59.35"/>
          <use xlink:href="#img-24e2c5da-12" x="123.37" y="59.35"/>
          <use xlink:href="#img-24e2c5da-12" x="123.48" y="37.12"/>
          <use xlink:href="#img-24e2c5da-12" x="123.59" y="73.34"/>
          <use xlink:href="#img-24e2c5da-12" x="123.71" y="54.69"/>
          <use xlink:href="#img-24e2c5da-12" x="123.82" y="73.34"/>
          <use xlink:href="#img-24e2c5da-12" x="123.93" y="59.35"/>
          <use xlink:href="#img-24e2c5da-12" x="124.04" y="73.34"/>
          <use xlink:href="#img-24e2c5da-12" x="124.16" y="73.34"/>
          <use xlink:href="#img-24e2c5da-12" x="124.27" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="124.38" y="64.01"/>
          <use xlink:href="#img-24e2c5da-12" x="124.5" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="124.61" y="32.46"/>
          <use xlink:href="#img-24e2c5da-12" x="124.72" y="32.46"/>
          <use xlink:href="#img-24e2c5da-12" x="124.83" y="32.46"/>
          <use xlink:href="#img-24e2c5da-12" x="124.95" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="125.06" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="125.17" y="32.46"/>
          <use xlink:href="#img-24e2c5da-12" x="125.29" y="32.46"/>
          <use xlink:href="#img-24e2c5da-12" x="125.4" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="125.51" y="32.46"/>
          <use xlink:href="#img-24e2c5da-12" x="125.62" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="125.74" y="54.69"/>
          <use xlink:href="#img-24e2c5da-12" x="125.85" y="32.46"/>
          <use xlink:href="#img-24e2c5da-12" x="125.96" y="32.46"/>
          <use xlink:href="#img-24e2c5da-12" x="126.07" y="32.46"/>
          <use xlink:href="#img-24e2c5da-12" x="126.19" y="37.12"/>
          <use xlink:href="#img-24e2c5da-12" x="126.3" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="126.41" y="32.46"/>
          <use xlink:href="#img-24e2c5da-12" x="126.53" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="126.64" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="126.75" y="48.24"/>
          <use xlink:href="#img-24e2c5da-12" x="126.86" y="48.24"/>
          <use xlink:href="#img-24e2c5da-12" x="126.98" y="48.24"/>
          <use xlink:href="#img-24e2c5da-12" x="127.09" y="32.46"/>
          <use xlink:href="#img-24e2c5da-12" x="127.2" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="127.32" y="16.68"/>
          <use xlink:href="#img-24e2c5da-12" x="127.43" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="127.54" y="48.24"/>
          <use xlink:href="#img-24e2c5da-12" x="127.65" y="32.46"/>
          <use xlink:href="#img-24e2c5da-12" x="127.77" y="32.46"/>
          <use xlink:href="#img-24e2c5da-12" x="127.88" y="32.46"/>
          <use xlink:href="#img-24e2c5da-12" x="127.99" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="128.11" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="128.22" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="128.33" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="128.44" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="128.56" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="128.67" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="128.78" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="128.89" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="129.01" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="129.12" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="129.23" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="129.35" y="68.67"/>
          <use xlink:href="#img-24e2c5da-12" x="129.46" y="59.35"/>
          <use xlink:href="#img-24e2c5da-12" x="129.57" y="59.35"/>
          <use xlink:href="#img-24e2c5da-12" x="129.68" y="59.35"/>
          <use xlink:href="#img-24e2c5da-12" x="129.8" y="32.46"/>
          <use xlink:href="#img-24e2c5da-12" x="129.91" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="130.02" y="61.14"/>
          <use xlink:href="#img-24e2c5da-12" x="130.14" y="61.14"/>
          <use xlink:href="#img-24e2c5da-12" x="130.25" y="61.14"/>
          <use xlink:href="#img-24e2c5da-12" x="130.36" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="130.47" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="130.59" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="130.7" y="27.8"/>
          <use xlink:href="#img-24e2c5da-12" x="130.81" y="43.57"/>
          <use xlink:href="#img-24e2c5da-12" x="130.92" y="61.14"/>
          <use xlink:href="#img-24e2c5da-12" x="131.04" y="43.57"/>
          <use xlink:href="#img-24e2c5da-12" x="131.15" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="131.26" y="43.57"/>
          <use xlink:href="#img-24e2c5da-12" x="131.38" y="43.57"/>
          <use xlink:href="#img-24e2c5da-12" x="131.49" y="27.8"/>
          <use xlink:href="#img-24e2c5da-12" x="131.6" y="27.8"/>
          <use xlink:href="#img-24e2c5da-12" x="131.71" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="131.83" y="43.57"/>
          <use xlink:href="#img-24e2c5da-12" x="131.94" y="61.14"/>
          <use xlink:href="#img-24e2c5da-12" x="132.05" y="61.14"/>
          <use xlink:href="#img-24e2c5da-12" x="132.17" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="132.28" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="132.39" y="27.8"/>
          <use xlink:href="#img-24e2c5da-12" x="132.5" y="27.8"/>
          <use xlink:href="#img-24e2c5da-12" x="132.62" y="61.14"/>
          <use xlink:href="#img-24e2c5da-12" x="132.73" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="132.84" y="61.14"/>
          <use xlink:href="#img-24e2c5da-12" x="132.96" y="65.81"/>
          <use xlink:href="#img-24e2c5da-12" x="133.07" y="61.14"/>
          <use xlink:href="#img-24e2c5da-12" x="133.18" y="61.14"/>
          <use xlink:href="#img-24e2c5da-12" x="133.29" y="43.57"/>
          <use xlink:href="#img-24e2c5da-12" x="133.41" y="43.57"/>
          <use xlink:href="#img-24e2c5da-12" x="133.52" y="38.91"/>
          <use xlink:href="#img-24e2c5da-12" x="133.63" y="45.37"/>
          <use xlink:href="#img-24e2c5da-12" x="133.74" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="133.86" y="70.47"/>
          <use xlink:href="#img-24e2c5da-12" x="133.97" y="61.14"/>
          <use xlink:href="#img-24e2c5da-12" x="134.08" y="61.14"/>
          <use xlink:href="#img-24e2c5da-12" x="134.2" y="61.14"/>
          <use xlink:href="#img-24e2c5da-12" x="134.31" y="61.14"/>
          <use xlink:href="#img-24e2c5da-12" x="134.42" y="38.91"/>
        </g>
      </g>
    </g>
    <g opacity="0" class="guide zoomslider" stroke="#000000" stroke-opacity="0.000" id="img-24e2c5da-13">
      <g fill="#EAEAEA" stroke-width="0.3" stroke-opacity="0" stroke="#6A6A6A" id="img-24e2c5da-14">
        <rect x="129.42" y="8" width="4" height="4"/>
        <g class="button_logo" fill="#6A6A6A" id="img-24e2c5da-15">
          <path d="M130.22,9.6 L 131.02 9.6 131.02 8.8 131.82 8.8 131.82 9.6 132.62 9.6 132.62 10.4 131.82 10.4 131.82 11.2 131.02 11.2 131.02 10.4 130.22 10.4 z"/>
        </g>
      </g>
      <g fill="#EAEAEA" id="img-24e2c5da-16">
        <rect x="109.92" y="8" width="19" height="4"/>
      </g>
      <g class="zoomslider_thumb" fill="#6A6A6A" id="img-24e2c5da-17">
        <rect x="118.42" y="8" width="2" height="4"/>
      </g>
      <g fill="#EAEAEA" stroke-width="0.3" stroke-opacity="0" stroke="#6A6A6A" id="img-24e2c5da-18">
        <rect x="105.42" y="8" width="4" height="4"/>
        <g class="button_logo" fill="#6A6A6A" id="img-24e2c5da-19">
          <path d="M106.22,9.6 L 108.62 9.6 108.62 10.4 106.22 10.4 z"/>
        </g>
      </g>
    </g>
  </g>
</g>
  <g class="guide ylabels" font-size="2.82" font-family="'PT Sans Caption','Helvetica Neue','Helvetica',sans-serif" fill="#6C606B" id="img-24e2c5da-20">
    <text x="18.63" y="168.36" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">-250</text>
    <text x="18.63" y="150.43" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">-200</text>
    <text x="18.63" y="132.5" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">-150</text>
    <text x="18.63" y="114.57" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">-100</text>
    <text x="18.63" y="96.64" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">-50</text>
    <text x="18.63" y="78.71" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="visible">0</text>
    <text x="18.63" y="60.79" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="visible">50</text>
    <text x="18.63" y="42.86" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="visible">100</text>
    <text x="18.63" y="24.93" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="visible">150</text>
    <text x="18.63" y="7" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="visible">200</text>
    <text x="18.63" y="-10.93" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">250</text>
    <text x="18.63" y="-28.86" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">300</text>
    <text x="18.63" y="-46.79" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">350</text>
    <text x="18.63" y="-64.72" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">400</text>
    <text x="18.63" y="-82.64" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">450</text>
    <text x="18.63" y="150.43" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-200</text>
    <text x="18.63" y="146.84" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-190</text>
    <text x="18.63" y="143.26" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-180</text>
    <text x="18.63" y="139.67" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-170</text>
    <text x="18.63" y="136.09" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-160</text>
    <text x="18.63" y="132.5" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-150</text>
    <text x="18.63" y="128.92" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-140</text>
    <text x="18.63" y="125.33" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-130</text>
    <text x="18.63" y="121.74" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-120</text>
    <text x="18.63" y="118.16" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-110</text>
    <text x="18.63" y="114.57" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-100</text>
    <text x="18.63" y="110.99" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-90</text>
    <text x="18.63" y="107.4" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-80</text>
    <text x="18.63" y="103.82" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-70</text>
    <text x="18.63" y="100.23" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-60</text>
    <text x="18.63" y="96.64" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-50</text>
    <text x="18.63" y="93.06" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-40</text>
    <text x="18.63" y="89.47" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-30</text>
    <text x="18.63" y="85.89" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-20</text>
    <text x="18.63" y="82.3" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-10</text>
    <text x="18.63" y="78.71" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">0</text>
    <text x="18.63" y="75.13" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">10</text>
    <text x="18.63" y="71.54" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">20</text>
    <text x="18.63" y="67.96" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">30</text>
    <text x="18.63" y="64.37" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">40</text>
    <text x="18.63" y="60.79" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">50</text>
    <text x="18.63" y="57.2" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">60</text>
    <text x="18.63" y="53.61" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">70</text>
    <text x="18.63" y="50.03" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">80</text>
    <text x="18.63" y="46.44" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">90</text>
    <text x="18.63" y="42.86" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">100</text>
    <text x="18.63" y="39.27" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">110</text>
    <text x="18.63" y="35.69" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">120</text>
    <text x="18.63" y="32.1" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">130</text>
    <text x="18.63" y="28.51" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">140</text>
    <text x="18.63" y="24.93" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">150</text>
    <text x="18.63" y="21.34" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">160</text>
    <text x="18.63" y="17.76" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">170</text>
    <text x="18.63" y="14.17" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">180</text>
    <text x="18.63" y="10.59" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">190</text>
    <text x="18.63" y="7" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">200</text>
    <text x="18.63" y="3.41" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">210</text>
    <text x="18.63" y="-0.17" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">220</text>
    <text x="18.63" y="-3.76" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">230</text>
    <text x="18.63" y="-7.34" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">240</text>
    <text x="18.63" y="-10.93" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">250</text>
    <text x="18.63" y="-14.51" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">260</text>
    <text x="18.63" y="-18.1" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">270</text>
    <text x="18.63" y="-21.69" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">280</text>
    <text x="18.63" y="-25.27" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">290</text>
    <text x="18.63" y="-28.86" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">300</text>
    <text x="18.63" y="-32.44" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">310</text>
    <text x="18.63" y="-36.03" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">320</text>
    <text x="18.63" y="-39.61" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">330</text>
    <text x="18.63" y="-43.2" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">340</text>
    <text x="18.63" y="-46.79" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">350</text>
    <text x="18.63" y="-50.37" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">360</text>
    <text x="18.63" y="-53.96" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">370</text>
    <text x="18.63" y="-57.54" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">380</text>
    <text x="18.63" y="-61.13" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">390</text>
    <text x="18.63" y="-64.72" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">400</text>
    <text x="18.63" y="150.43" text-anchor="end" dy="0.35em" gadfly:scale="0.5" visibility="hidden">-200</text>
    <text x="18.63" y="78.71" text-anchor="end" dy="0.35em" gadfly:scale="0.5" visibility="hidden">0</text>
    <text x="18.63" y="7" text-anchor="end" dy="0.35em" gadfly:scale="0.5" visibility="hidden">200</text>
    <text x="18.63" y="-64.72" text-anchor="end" dy="0.35em" gadfly:scale="0.5" visibility="hidden">400</text>
    <text x="18.63" y="150.43" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-200</text>
    <text x="18.63" y="143.26" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-180</text>
    <text x="18.63" y="136.09" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-160</text>
    <text x="18.63" y="128.92" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-140</text>
    <text x="18.63" y="121.74" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-120</text>
    <text x="18.63" y="114.57" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-100</text>
    <text x="18.63" y="107.4" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-80</text>
    <text x="18.63" y="100.23" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-60</text>
    <text x="18.63" y="93.06" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-40</text>
    <text x="18.63" y="85.89" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-20</text>
    <text x="18.63" y="78.71" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">0</text>
    <text x="18.63" y="71.54" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">20</text>
    <text x="18.63" y="64.37" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">40</text>
    <text x="18.63" y="57.2" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">60</text>
    <text x="18.63" y="50.03" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">80</text>
    <text x="18.63" y="42.86" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">100</text>
    <text x="18.63" y="35.69" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">120</text>
    <text x="18.63" y="28.51" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">140</text>
    <text x="18.63" y="21.34" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">160</text>
    <text x="18.63" y="14.17" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">180</text>
    <text x="18.63" y="7" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">200</text>
    <text x="18.63" y="-0.17" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">220</text>
    <text x="18.63" y="-7.34" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">240</text>
    <text x="18.63" y="-14.51" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">260</text>
    <text x="18.63" y="-21.69" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">280</text>
    <text x="18.63" y="-28.86" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">300</text>
    <text x="18.63" y="-36.03" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">320</text>
    <text x="18.63" y="-43.2" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">340</text>
    <text x="18.63" y="-50.37" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">360</text>
    <text x="18.63" y="-57.54" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">380</text>
    <text x="18.63" y="-64.72" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">400</text>
  </g>
  <g font-size="3.88" font-family="'PT Sans','Helvetica Neue','Helvetica',sans-serif" fill="#564A55" stroke="#000000" stroke-opacity="0.000" id="img-24e2c5da-21">
    <text x="8.81" y="40.86" text-anchor="middle" dy="0.35em" transform="rotate(-90, 8.81, 42.86)">NumofSteps</text>
  </g>
</g>
<defs>
  <clipPath id="img-24e2c5da-4">
  <path d="M19.63,5 L 136.42 5 136.42 80.72 19.63 80.72" />
</clipPath>
  <g id="img-24e2c5da-12">
    <circle cx="0" cy="0" r="0.9"/>
  </g>
</defs>
<script> <![CDATA[
(function(N){var k=/[\.\/]/,L=/\s*,\s*/,C=function(a,d){return a-d},a,v,y={n:{}},M=function(){for(var a=0,d=this.length;a<d;a++)if("undefined"!=typeof this[a])return this[a]},A=function(){for(var a=this.length;--a;)if("undefined"!=typeof this[a])return this[a]},w=function(k,d){k=String(k);var f=v,n=Array.prototype.slice.call(arguments,2),u=w.listeners(k),p=0,b,q=[],e={},l=[],r=a;l.firstDefined=M;l.lastDefined=A;a=k;for(var s=v=0,x=u.length;s<x;s++)"zIndex"in u[s]&&(q.push(u[s].zIndex),0>u[s].zIndex&&
(e[u[s].zIndex]=u[s]));for(q.sort(C);0>q[p];)if(b=e[q[p++] ],l.push(b.apply(d,n)),v)return v=f,l;for(s=0;s<x;s++)if(b=u[s],"zIndex"in b)if(b.zIndex==q[p]){l.push(b.apply(d,n));if(v)break;do if(p++,(b=e[q[p] ])&&l.push(b.apply(d,n)),v)break;while(b)}else e[b.zIndex]=b;else if(l.push(b.apply(d,n)),v)break;v=f;a=r;return l};w._events=y;w.listeners=function(a){a=a.split(k);var d=y,f,n,u,p,b,q,e,l=[d],r=[];u=0;for(p=a.length;u<p;u++){e=[];b=0;for(q=l.length;b<q;b++)for(d=l[b].n,f=[d[a[u] ],d["*"] ],n=2;n--;)if(d=
f[n])e.push(d),r=r.concat(d.f||[]);l=e}return r};w.on=function(a,d){a=String(a);if("function"!=typeof d)return function(){};for(var f=a.split(L),n=0,u=f.length;n<u;n++)(function(a){a=a.split(k);for(var b=y,f,e=0,l=a.length;e<l;e++)b=b.n,b=b.hasOwnProperty(a[e])&&b[a[e] ]||(b[a[e] ]={n:{}});b.f=b.f||[];e=0;for(l=b.f.length;e<l;e++)if(b.f[e]==d){f=!0;break}!f&&b.f.push(d)})(f[n]);return function(a){+a==+a&&(d.zIndex=+a)}};w.f=function(a){var d=[].slice.call(arguments,1);return function(){w.apply(null,
[a,null].concat(d).concat([].slice.call(arguments,0)))}};w.stop=function(){v=1};w.nt=function(k){return k?(new RegExp("(?:\\.|\\/|^)"+k+"(?:\\.|\\/|$)")).test(a):a};w.nts=function(){return a.split(k)};w.off=w.unbind=function(a,d){if(a){var f=a.split(L);if(1<f.length)for(var n=0,u=f.length;n<u;n++)w.off(f[n],d);else{for(var f=a.split(k),p,b,q,e,l=[y],n=0,u=f.length;n<u;n++)for(e=0;e<l.length;e+=q.length-2){q=[e,1];p=l[e].n;if("*"!=f[n])p[f[n] ]&&q.push(p[f[n] ]);else for(b in p)p.hasOwnProperty(b)&&
q.push(p[b]);l.splice.apply(l,q)}n=0;for(u=l.length;n<u;n++)for(p=l[n];p.n;){if(d){if(p.f){e=0;for(f=p.f.length;e<f;e++)if(p.f[e]==d){p.f.splice(e,1);break}!p.f.length&&delete p.f}for(b in p.n)if(p.n.hasOwnProperty(b)&&p.n[b].f){q=p.n[b].f;e=0;for(f=q.length;e<f;e++)if(q[e]==d){q.splice(e,1);break}!q.length&&delete p.n[b].f}}else for(b in delete p.f,p.n)p.n.hasOwnProperty(b)&&p.n[b].f&&delete p.n[b].f;p=p.n}}}else w._events=y={n:{}}};w.once=function(a,d){var f=function(){w.unbind(a,f);return d.apply(this,
arguments)};return w.on(a,f)};w.version="0.4.2";w.toString=function(){return"You are running Eve 0.4.2"};"undefined"!=typeof module&&module.exports?module.exports=w:"function"===typeof define&&define.amd?define("eve",[],function(){return w}):N.eve=w})(this);
(function(N,k){"function"===typeof define&&define.amd?define("Snap.svg",["eve"],function(L){return k(N,L)}):k(N,N.eve)})(this,function(N,k){var L=function(a){var k={},y=N.requestAnimationFrame||N.webkitRequestAnimationFrame||N.mozRequestAnimationFrame||N.oRequestAnimationFrame||N.msRequestAnimationFrame||function(a){setTimeout(a,16)},M=Array.isArray||function(a){return a instanceof Array||"[object Array]"==Object.prototype.toString.call(a)},A=0,w="M"+(+new Date).toString(36),z=function(a){if(null==
a)return this.s;var b=this.s-a;this.b+=this.dur*b;this.B+=this.dur*b;this.s=a},d=function(a){if(null==a)return this.spd;this.spd=a},f=function(a){if(null==a)return this.dur;this.s=this.s*a/this.dur;this.dur=a},n=function(){delete k[this.id];this.update();a("mina.stop."+this.id,this)},u=function(){this.pdif||(delete k[this.id],this.update(),this.pdif=this.get()-this.b)},p=function(){this.pdif&&(this.b=this.get()-this.pdif,delete this.pdif,k[this.id]=this)},b=function(){var a;if(M(this.start)){a=[];
for(var b=0,e=this.start.length;b<e;b++)a[b]=+this.start[b]+(this.end[b]-this.start[b])*this.easing(this.s)}else a=+this.start+(this.end-this.start)*this.easing(this.s);this.set(a)},q=function(){var l=0,b;for(b in k)if(k.hasOwnProperty(b)){var e=k[b],f=e.get();l++;e.s=(f-e.b)/(e.dur/e.spd);1<=e.s&&(delete k[b],e.s=1,l--,function(b){setTimeout(function(){a("mina.finish."+b.id,b)})}(e));e.update()}l&&y(q)},e=function(a,r,s,x,G,h,J){a={id:w+(A++).toString(36),start:a,end:r,b:s,s:0,dur:x-s,spd:1,get:G,
set:h,easing:J||e.linear,status:z,speed:d,duration:f,stop:n,pause:u,resume:p,update:b};k[a.id]=a;r=0;for(var K in k)if(k.hasOwnProperty(K)&&(r++,2==r))break;1==r&&y(q);return a};e.time=Date.now||function(){return+new Date};e.getById=function(a){return k[a]||null};e.linear=function(a){return a};e.easeout=function(a){return Math.pow(a,1.7)};e.easein=function(a){return Math.pow(a,0.48)};e.easeinout=function(a){if(1==a)return 1;if(0==a)return 0;var b=0.48-a/1.04,e=Math.sqrt(0.1734+b*b);a=e-b;a=Math.pow(Math.abs(a),
1/3)*(0>a?-1:1);b=-e-b;b=Math.pow(Math.abs(b),1/3)*(0>b?-1:1);a=a+b+0.5;return 3*(1-a)*a*a+a*a*a};e.backin=function(a){return 1==a?1:a*a*(2.70158*a-1.70158)};e.backout=function(a){if(0==a)return 0;a-=1;return a*a*(2.70158*a+1.70158)+1};e.elastic=function(a){return a==!!a?a:Math.pow(2,-10*a)*Math.sin(2*(a-0.075)*Math.PI/0.3)+1};e.bounce=function(a){a<1/2.75?a*=7.5625*a:a<2/2.75?(a-=1.5/2.75,a=7.5625*a*a+0.75):a<2.5/2.75?(a-=2.25/2.75,a=7.5625*a*a+0.9375):(a-=2.625/2.75,a=7.5625*a*a+0.984375);return a};
return N.mina=e}("undefined"==typeof k?function(){}:k),C=function(){function a(c,t){if(c){if(c.tagName)return x(c);if(y(c,"array")&&a.set)return a.set.apply(a,c);if(c instanceof e)return c;if(null==t)return c=G.doc.querySelector(c),x(c)}return new s(null==c?"100%":c,null==t?"100%":t)}function v(c,a){if(a){"#text"==c&&(c=G.doc.createTextNode(a.text||""));"string"==typeof c&&(c=v(c));if("string"==typeof a)return"xlink:"==a.substring(0,6)?c.getAttributeNS(m,a.substring(6)):"xml:"==a.substring(0,4)?c.getAttributeNS(la,
a.substring(4)):c.getAttribute(a);for(var da in a)if(a[h](da)){var b=J(a[da]);b?"xlink:"==da.substring(0,6)?c.setAttributeNS(m,da.substring(6),b):"xml:"==da.substring(0,4)?c.setAttributeNS(la,da.substring(4),b):c.setAttribute(da,b):c.removeAttribute(da)}}else c=G.doc.createElementNS(la,c);return c}function y(c,a){a=J.prototype.toLowerCase.call(a);return"finite"==a?isFinite(c):"array"==a&&(c instanceof Array||Array.isArray&&Array.isArray(c))?!0:"null"==a&&null===c||a==typeof c&&null!==c||"object"==
a&&c===Object(c)||$.call(c).slice(8,-1).toLowerCase()==a}function M(c){if("function"==typeof c||Object(c)!==c)return c;var a=new c.constructor,b;for(b in c)c[h](b)&&(a[b]=M(c[b]));return a}function A(c,a,b){function m(){var e=Array.prototype.slice.call(arguments,0),f=e.join("\u2400"),d=m.cache=m.cache||{},l=m.count=m.count||[];if(d[h](f)){a:for(var e=l,l=f,B=0,H=e.length;B<H;B++)if(e[B]===l){e.push(e.splice(B,1)[0]);break a}return b?b(d[f]):d[f]}1E3<=l.length&&delete d[l.shift()];l.push(f);d[f]=c.apply(a,
e);return b?b(d[f]):d[f]}return m}function w(c,a,b,m,e,f){return null==e?(c-=b,a-=m,c||a?(180*I.atan2(-a,-c)/C+540)%360:0):w(c,a,e,f)-w(b,m,e,f)}function z(c){return c%360*C/180}function d(c){var a=[];c=c.replace(/(?:^|\s)(\w+)\(([^)]+)\)/g,function(c,b,m){m=m.split(/\s*,\s*|\s+/);"rotate"==b&&1==m.length&&m.push(0,0);"scale"==b&&(2<m.length?m=m.slice(0,2):2==m.length&&m.push(0,0),1==m.length&&m.push(m[0],0,0));"skewX"==b?a.push(["m",1,0,I.tan(z(m[0])),1,0,0]):"skewY"==b?a.push(["m",1,I.tan(z(m[0])),
0,1,0,0]):a.push([b.charAt(0)].concat(m));return c});return a}function f(c,t){var b=O(c),m=new a.Matrix;if(b)for(var e=0,f=b.length;e<f;e++){var h=b[e],d=h.length,B=J(h[0]).toLowerCase(),H=h[0]!=B,l=H?m.invert():0,E;"t"==B&&2==d?m.translate(h[1],0):"t"==B&&3==d?H?(d=l.x(0,0),B=l.y(0,0),H=l.x(h[1],h[2]),l=l.y(h[1],h[2]),m.translate(H-d,l-B)):m.translate(h[1],h[2]):"r"==B?2==d?(E=E||t,m.rotate(h[1],E.x+E.width/2,E.y+E.height/2)):4==d&&(H?(H=l.x(h[2],h[3]),l=l.y(h[2],h[3]),m.rotate(h[1],H,l)):m.rotate(h[1],
h[2],h[3])):"s"==B?2==d||3==d?(E=E||t,m.scale(h[1],h[d-1],E.x+E.width/2,E.y+E.height/2)):4==d?H?(H=l.x(h[2],h[3]),l=l.y(h[2],h[3]),m.scale(h[1],h[1],H,l)):m.scale(h[1],h[1],h[2],h[3]):5==d&&(H?(H=l.x(h[3],h[4]),l=l.y(h[3],h[4]),m.scale(h[1],h[2],H,l)):m.scale(h[1],h[2],h[3],h[4])):"m"==B&&7==d&&m.add(h[1],h[2],h[3],h[4],h[5],h[6])}return m}function n(c,t){if(null==t){var m=!0;t="linearGradient"==c.type||"radialGradient"==c.type?c.node.getAttribute("gradientTransform"):"pattern"==c.type?c.node.getAttribute("patternTransform"):
c.node.getAttribute("transform");if(!t)return new a.Matrix;t=d(t)}else t=a._.rgTransform.test(t)?J(t).replace(/\.{3}|\u2026/g,c._.transform||aa):d(t),y(t,"array")&&(t=a.path?a.path.toString.call(t):J(t)),c._.transform=t;var b=f(t,c.getBBox(1));if(m)return b;c.matrix=b}function u(c){c=c.node.ownerSVGElement&&x(c.node.ownerSVGElement)||c.node.parentNode&&x(c.node.parentNode)||a.select("svg")||a(0,0);var t=c.select("defs"),t=null==t?!1:t.node;t||(t=r("defs",c.node).node);return t}function p(c){return c.node.ownerSVGElement&&
x(c.node.ownerSVGElement)||a.select("svg")}function b(c,a,m){function b(c){if(null==c)return aa;if(c==+c)return c;v(B,{width:c});try{return B.getBBox().width}catch(a){return 0}}function h(c){if(null==c)return aa;if(c==+c)return c;v(B,{height:c});try{return B.getBBox().height}catch(a){return 0}}function e(b,B){null==a?d[b]=B(c.attr(b)||0):b==a&&(d=B(null==m?c.attr(b)||0:m))}var f=p(c).node,d={},B=f.querySelector(".svg---mgr");B||(B=v("rect"),v(B,{x:-9E9,y:-9E9,width:10,height:10,"class":"svg---mgr",
fill:"none"}),f.appendChild(B));switch(c.type){case "rect":e("rx",b),e("ry",h);case "image":e("width",b),e("height",h);case "text":e("x",b);e("y",h);break;case "circle":e("cx",b);e("cy",h);e("r",b);break;case "ellipse":e("cx",b);e("cy",h);e("rx",b);e("ry",h);break;case "line":e("x1",b);e("x2",b);e("y1",h);e("y2",h);break;case "marker":e("refX",b);e("markerWidth",b);e("refY",h);e("markerHeight",h);break;case "radialGradient":e("fx",b);e("fy",h);break;case "tspan":e("dx",b);e("dy",h);break;default:e(a,
b)}f.removeChild(B);return d}function q(c){y(c,"array")||(c=Array.prototype.slice.call(arguments,0));for(var a=0,b=0,m=this.node;this[a];)delete this[a++];for(a=0;a<c.length;a++)"set"==c[a].type?c[a].forEach(function(c){m.appendChild(c.node)}):m.appendChild(c[a].node);for(var h=m.childNodes,a=0;a<h.length;a++)this[b++]=x(h[a]);return this}function e(c){if(c.snap in E)return E[c.snap];var a=this.id=V(),b;try{b=c.ownerSVGElement}catch(m){}this.node=c;b&&(this.paper=new s(b));this.type=c.tagName;this.anims=
{};this._={transform:[]};c.snap=a;E[a]=this;"g"==this.type&&(this.add=q);if(this.type in{g:1,mask:1,pattern:1})for(var e in s.prototype)s.prototype[h](e)&&(this[e]=s.prototype[e])}function l(c){this.node=c}function r(c,a){var b=v(c);a.appendChild(b);return x(b)}function s(c,a){var b,m,f,d=s.prototype;if(c&&"svg"==c.tagName){if(c.snap in E)return E[c.snap];var l=c.ownerDocument;b=new e(c);m=c.getElementsByTagName("desc")[0];f=c.getElementsByTagName("defs")[0];m||(m=v("desc"),m.appendChild(l.createTextNode("Created with Snap")),
b.node.appendChild(m));f||(f=v("defs"),b.node.appendChild(f));b.defs=f;for(var ca in d)d[h](ca)&&(b[ca]=d[ca]);b.paper=b.root=b}else b=r("svg",G.doc.body),v(b.node,{height:a,version:1.1,width:c,xmlns:la});return b}function x(c){return!c||c instanceof e||c instanceof l?c:c.tagName&&"svg"==c.tagName.toLowerCase()?new s(c):c.tagName&&"object"==c.tagName.toLowerCase()&&"image/svg+xml"==c.type?new s(c.contentDocument.getElementsByTagName("svg")[0]):new e(c)}a.version="0.3.0";a.toString=function(){return"Snap v"+
this.version};a._={};var G={win:N,doc:N.document};a._.glob=G;var h="hasOwnProperty",J=String,K=parseFloat,U=parseInt,I=Math,P=I.max,Q=I.min,Y=I.abs,C=I.PI,aa="",$=Object.prototype.toString,F=/^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?%?)\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?%?)\s*\))\s*$/i;a._.separator=
RegExp("[,\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]+");var S=RegExp("[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*"),X={hs:1,rg:1},W=RegExp("([a-z])[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)",
"ig"),ma=RegExp("([rstm])[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)","ig"),Z=RegExp("(-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?)[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*",
"ig"),na=0,ba="S"+(+new Date).toString(36),V=function(){return ba+(na++).toString(36)},m="http://www.w3.org/1999/xlink",la="http://www.w3.org/2000/svg",E={},ca=a.url=function(c){return"url('#"+c+"')"};a._.$=v;a._.id=V;a.format=function(){var c=/\{([^\}]+)\}/g,a=/(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g,b=function(c,b,m){var h=m;b.replace(a,function(c,a,b,m,t){a=a||m;h&&(a in h&&(h=h[a]),"function"==typeof h&&t&&(h=h()))});return h=(null==h||h==m?c:h)+""};return function(a,m){return J(a).replace(c,
function(c,a){return b(c,a,m)})}}();a._.clone=M;a._.cacher=A;a.rad=z;a.deg=function(c){return 180*c/C%360};a.angle=w;a.is=y;a.snapTo=function(c,a,b){b=y(b,"finite")?b:10;if(y(c,"array"))for(var m=c.length;m--;){if(Y(c[m]-a)<=b)return c[m]}else{c=+c;m=a%c;if(m<b)return a-m;if(m>c-b)return a-m+c}return a};a.getRGB=A(function(c){if(!c||(c=J(c)).indexOf("-")+1)return{r:-1,g:-1,b:-1,hex:"none",error:1,toString:ka};if("none"==c)return{r:-1,g:-1,b:-1,hex:"none",toString:ka};!X[h](c.toLowerCase().substring(0,
2))&&"#"!=c.charAt()&&(c=T(c));if(!c)return{r:-1,g:-1,b:-1,hex:"none",error:1,toString:ka};var b,m,e,f,d;if(c=c.match(F)){c[2]&&(e=U(c[2].substring(5),16),m=U(c[2].substring(3,5),16),b=U(c[2].substring(1,3),16));c[3]&&(e=U((d=c[3].charAt(3))+d,16),m=U((d=c[3].charAt(2))+d,16),b=U((d=c[3].charAt(1))+d,16));c[4]&&(d=c[4].split(S),b=K(d[0]),"%"==d[0].slice(-1)&&(b*=2.55),m=K(d[1]),"%"==d[1].slice(-1)&&(m*=2.55),e=K(d[2]),"%"==d[2].slice(-1)&&(e*=2.55),"rgba"==c[1].toLowerCase().slice(0,4)&&(f=K(d[3])),
d[3]&&"%"==d[3].slice(-1)&&(f/=100));if(c[5])return d=c[5].split(S),b=K(d[0]),"%"==d[0].slice(-1)&&(b/=100),m=K(d[1]),"%"==d[1].slice(-1)&&(m/=100),e=K(d[2]),"%"==d[2].slice(-1)&&(e/=100),"deg"!=d[0].slice(-3)&&"\u00b0"!=d[0].slice(-1)||(b/=360),"hsba"==c[1].toLowerCase().slice(0,4)&&(f=K(d[3])),d[3]&&"%"==d[3].slice(-1)&&(f/=100),a.hsb2rgb(b,m,e,f);if(c[6])return d=c[6].split(S),b=K(d[0]),"%"==d[0].slice(-1)&&(b/=100),m=K(d[1]),"%"==d[1].slice(-1)&&(m/=100),e=K(d[2]),"%"==d[2].slice(-1)&&(e/=100),
"deg"!=d[0].slice(-3)&&"\u00b0"!=d[0].slice(-1)||(b/=360),"hsla"==c[1].toLowerCase().slice(0,4)&&(f=K(d[3])),d[3]&&"%"==d[3].slice(-1)&&(f/=100),a.hsl2rgb(b,m,e,f);b=Q(I.round(b),255);m=Q(I.round(m),255);e=Q(I.round(e),255);f=Q(P(f,0),1);c={r:b,g:m,b:e,toString:ka};c.hex="#"+(16777216|e|m<<8|b<<16).toString(16).slice(1);c.opacity=y(f,"finite")?f:1;return c}return{r:-1,g:-1,b:-1,hex:"none",error:1,toString:ka}},a);a.hsb=A(function(c,b,m){return a.hsb2rgb(c,b,m).hex});a.hsl=A(function(c,b,m){return a.hsl2rgb(c,
b,m).hex});a.rgb=A(function(c,a,b,m){if(y(m,"finite")){var e=I.round;return"rgba("+[e(c),e(a),e(b),+m.toFixed(2)]+")"}return"#"+(16777216|b|a<<8|c<<16).toString(16).slice(1)});var T=function(c){var a=G.doc.getElementsByTagName("head")[0]||G.doc.getElementsByTagName("svg")[0];T=A(function(c){if("red"==c.toLowerCase())return"rgb(255, 0, 0)";a.style.color="rgb(255, 0, 0)";a.style.color=c;c=G.doc.defaultView.getComputedStyle(a,aa).getPropertyValue("color");return"rgb(255, 0, 0)"==c?null:c});return T(c)},
qa=function(){return"hsb("+[this.h,this.s,this.b]+")"},ra=function(){return"hsl("+[this.h,this.s,this.l]+")"},ka=function(){return 1==this.opacity||null==this.opacity?this.hex:"rgba("+[this.r,this.g,this.b,this.opacity]+")"},D=function(c,b,m){null==b&&y(c,"object")&&"r"in c&&"g"in c&&"b"in c&&(m=c.b,b=c.g,c=c.r);null==b&&y(c,string)&&(m=a.getRGB(c),c=m.r,b=m.g,m=m.b);if(1<c||1<b||1<m)c/=255,b/=255,m/=255;return[c,b,m]},oa=function(c,b,m,e){c=I.round(255*c);b=I.round(255*b);m=I.round(255*m);c={r:c,
g:b,b:m,opacity:y(e,"finite")?e:1,hex:a.rgb(c,b,m),toString:ka};y(e,"finite")&&(c.opacity=e);return c};a.color=function(c){var b;y(c,"object")&&"h"in c&&"s"in c&&"b"in c?(b=a.hsb2rgb(c),c.r=b.r,c.g=b.g,c.b=b.b,c.opacity=1,c.hex=b.hex):y(c,"object")&&"h"in c&&"s"in c&&"l"in c?(b=a.hsl2rgb(c),c.r=b.r,c.g=b.g,c.b=b.b,c.opacity=1,c.hex=b.hex):(y(c,"string")&&(c=a.getRGB(c)),y(c,"object")&&"r"in c&&"g"in c&&"b"in c&&!("error"in c)?(b=a.rgb2hsl(c),c.h=b.h,c.s=b.s,c.l=b.l,b=a.rgb2hsb(c),c.v=b.b):(c={hex:"none"},
c.r=c.g=c.b=c.h=c.s=c.v=c.l=-1,c.error=1));c.toString=ka;return c};a.hsb2rgb=function(c,a,b,m){y(c,"object")&&"h"in c&&"s"in c&&"b"in c&&(b=c.b,a=c.s,c=c.h,m=c.o);var e,h,d;c=360*c%360/60;d=b*a;a=d*(1-Y(c%2-1));b=e=h=b-d;c=~~c;b+=[d,a,0,0,a,d][c];e+=[a,d,d,a,0,0][c];h+=[0,0,a,d,d,a][c];return oa(b,e,h,m)};a.hsl2rgb=function(c,a,b,m){y(c,"object")&&"h"in c&&"s"in c&&"l"in c&&(b=c.l,a=c.s,c=c.h);if(1<c||1<a||1<b)c/=360,a/=100,b/=100;var e,h,d;c=360*c%360/60;d=2*a*(0.5>b?b:1-b);a=d*(1-Y(c%2-1));b=e=
h=b-d/2;c=~~c;b+=[d,a,0,0,a,d][c];e+=[a,d,d,a,0,0][c];h+=[0,0,a,d,d,a][c];return oa(b,e,h,m)};a.rgb2hsb=function(c,a,b){b=D(c,a,b);c=b[0];a=b[1];b=b[2];var m,e;m=P(c,a,b);e=m-Q(c,a,b);c=((0==e?0:m==c?(a-b)/e:m==a?(b-c)/e+2:(c-a)/e+4)+360)%6*60/360;return{h:c,s:0==e?0:e/m,b:m,toString:qa}};a.rgb2hsl=function(c,a,b){b=D(c,a,b);c=b[0];a=b[1];b=b[2];var m,e,h;m=P(c,a,b);e=Q(c,a,b);h=m-e;c=((0==h?0:m==c?(a-b)/h:m==a?(b-c)/h+2:(c-a)/h+4)+360)%6*60/360;m=(m+e)/2;return{h:c,s:0==h?0:0.5>m?h/(2*m):h/(2-2*
m),l:m,toString:ra}};a.parsePathString=function(c){if(!c)return null;var b=a.path(c);if(b.arr)return a.path.clone(b.arr);var m={a:7,c:6,o:2,h:1,l:2,m:2,r:4,q:4,s:4,t:2,v:1,u:3,z:0},e=[];y(c,"array")&&y(c[0],"array")&&(e=a.path.clone(c));e.length||J(c).replace(W,function(c,a,b){var h=[];c=a.toLowerCase();b.replace(Z,function(c,a){a&&h.push(+a)});"m"==c&&2<h.length&&(e.push([a].concat(h.splice(0,2))),c="l",a="m"==a?"l":"L");"o"==c&&1==h.length&&e.push([a,h[0] ]);if("r"==c)e.push([a].concat(h));else for(;h.length>=
m[c]&&(e.push([a].concat(h.splice(0,m[c]))),m[c]););});e.toString=a.path.toString;b.arr=a.path.clone(e);return e};var O=a.parseTransformString=function(c){if(!c)return null;var b=[];y(c,"array")&&y(c[0],"array")&&(b=a.path.clone(c));b.length||J(c).replace(ma,function(c,a,m){var e=[];a.toLowerCase();m.replace(Z,function(c,a){a&&e.push(+a)});b.push([a].concat(e))});b.toString=a.path.toString;return b};a._.svgTransform2string=d;a._.rgTransform=RegExp("^[a-z][\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*-?\\.?\\d",
"i");a._.transform2matrix=f;a._unit2px=b;a._.getSomeDefs=u;a._.getSomeSVG=p;a.select=function(c){return x(G.doc.querySelector(c))};a.selectAll=function(c){c=G.doc.querySelectorAll(c);for(var b=(a.set||Array)(),m=0;m<c.length;m++)b.push(x(c[m]));return b};setInterval(function(){for(var c in E)if(E[h](c)){var a=E[c],b=a.node;("svg"!=a.type&&!b.ownerSVGElement||"svg"==a.type&&(!b.parentNode||"ownerSVGElement"in b.parentNode&&!b.ownerSVGElement))&&delete E[c]}},1E4);(function(c){function m(c){function a(c,
b){var m=v(c.node,b);(m=(m=m&&m.match(d))&&m[2])&&"#"==m.charAt()&&(m=m.substring(1))&&(f[m]=(f[m]||[]).concat(function(a){var m={};m[b]=ca(a);v(c.node,m)}))}function b(c){var a=v(c.node,"xlink:href");a&&"#"==a.charAt()&&(a=a.substring(1))&&(f[a]=(f[a]||[]).concat(function(a){c.attr("xlink:href","#"+a)}))}var e=c.selectAll("*"),h,d=/^\s*url\(("|'|)(.*)\1\)\s*$/;c=[];for(var f={},l=0,E=e.length;l<E;l++){h=e[l];a(h,"fill");a(h,"stroke");a(h,"filter");a(h,"mask");a(h,"clip-path");b(h);var t=v(h.node,
"id");t&&(v(h.node,{id:h.id}),c.push({old:t,id:h.id}))}l=0;for(E=c.length;l<E;l++)if(e=f[c[l].old])for(h=0,t=e.length;h<t;h++)e[h](c[l].id)}function e(c,a,b){return function(m){m=m.slice(c,a);1==m.length&&(m=m[0]);return b?b(m):m}}function d(c){return function(){var a=c?"<"+this.type:"",b=this.node.attributes,m=this.node.childNodes;if(c)for(var e=0,h=b.length;e<h;e++)a+=" "+b[e].name+'="'+b[e].value.replace(/"/g,'\\"')+'"';if(m.length){c&&(a+=">");e=0;for(h=m.length;e<h;e++)3==m[e].nodeType?a+=m[e].nodeValue:
1==m[e].nodeType&&(a+=x(m[e]).toString());c&&(a+="</"+this.type+">")}else c&&(a+="/>");return a}}c.attr=function(c,a){if(!c)return this;if(y(c,"string"))if(1<arguments.length){var b={};b[c]=a;c=b}else return k("snap.util.getattr."+c,this).firstDefined();for(var m in c)c[h](m)&&k("snap.util.attr."+m,this,c[m]);return this};c.getBBox=function(c){if(!a.Matrix||!a.path)return this.node.getBBox();var b=this,m=new a.Matrix;if(b.removed)return a._.box();for(;"use"==b.type;)if(c||(m=m.add(b.transform().localMatrix.translate(b.attr("x")||
0,b.attr("y")||0))),b.original)b=b.original;else var e=b.attr("xlink:href"),b=b.original=b.node.ownerDocument.getElementById(e.substring(e.indexOf("#")+1));var e=b._,h=a.path.get[b.type]||a.path.get.deflt;try{if(c)return e.bboxwt=h?a.path.getBBox(b.realPath=h(b)):a._.box(b.node.getBBox()),a._.box(e.bboxwt);b.realPath=h(b);b.matrix=b.transform().localMatrix;e.bbox=a.path.getBBox(a.path.map(b.realPath,m.add(b.matrix)));return a._.box(e.bbox)}catch(d){return a._.box()}};var f=function(){return this.string};
c.transform=function(c){var b=this._;if(null==c){var m=this;c=new a.Matrix(this.node.getCTM());for(var e=n(this),h=[e],d=new a.Matrix,l=e.toTransformString(),b=J(e)==J(this.matrix)?J(b.transform):l;"svg"!=m.type&&(m=m.parent());)h.push(n(m));for(m=h.length;m--;)d.add(h[m]);return{string:b,globalMatrix:c,totalMatrix:d,localMatrix:e,diffMatrix:c.clone().add(e.invert()),global:c.toTransformString(),total:d.toTransformString(),local:l,toString:f}}c instanceof a.Matrix?this.matrix=c:n(this,c);this.node&&
("linearGradient"==this.type||"radialGradient"==this.type?v(this.node,{gradientTransform:this.matrix}):"pattern"==this.type?v(this.node,{patternTransform:this.matrix}):v(this.node,{transform:this.matrix}));return this};c.parent=function(){return x(this.node.parentNode)};c.append=c.add=function(c){if(c){if("set"==c.type){var a=this;c.forEach(function(c){a.add(c)});return this}c=x(c);this.node.appendChild(c.node);c.paper=this.paper}return this};c.appendTo=function(c){c&&(c=x(c),c.append(this));return this};
c.prepend=function(c){if(c){if("set"==c.type){var a=this,b;c.forEach(function(c){b?b.after(c):a.prepend(c);b=c});return this}c=x(c);var m=c.parent();this.node.insertBefore(c.node,this.node.firstChild);this.add&&this.add();c.paper=this.paper;this.parent()&&this.parent().add();m&&m.add()}return this};c.prependTo=function(c){c=x(c);c.prepend(this);return this};c.before=function(c){if("set"==c.type){var a=this;c.forEach(function(c){var b=c.parent();a.node.parentNode.insertBefore(c.node,a.node);b&&b.add()});
this.parent().add();return this}c=x(c);var b=c.parent();this.node.parentNode.insertBefore(c.node,this.node);this.parent()&&this.parent().add();b&&b.add();c.paper=this.paper;return this};c.after=function(c){c=x(c);var a=c.parent();this.node.nextSibling?this.node.parentNode.insertBefore(c.node,this.node.nextSibling):this.node.parentNode.appendChild(c.node);this.parent()&&this.parent().add();a&&a.add();c.paper=this.paper;return this};c.insertBefore=function(c){c=x(c);var a=this.parent();c.node.parentNode.insertBefore(this.node,
c.node);this.paper=c.paper;a&&a.add();c.parent()&&c.parent().add();return this};c.insertAfter=function(c){c=x(c);var a=this.parent();c.node.parentNode.insertBefore(this.node,c.node.nextSibling);this.paper=c.paper;a&&a.add();c.parent()&&c.parent().add();return this};c.remove=function(){var c=this.parent();this.node.parentNode&&this.node.parentNode.removeChild(this.node);delete this.paper;this.removed=!0;c&&c.add();return this};c.select=function(c){return x(this.node.querySelector(c))};c.selectAll=
function(c){c=this.node.querySelectorAll(c);for(var b=(a.set||Array)(),m=0;m<c.length;m++)b.push(x(c[m]));return b};c.asPX=function(c,a){null==a&&(a=this.attr(c));return+b(this,c,a)};c.use=function(){var c,a=this.node.id;a||(a=this.id,v(this.node,{id:a}));c="linearGradient"==this.type||"radialGradient"==this.type||"pattern"==this.type?r(this.type,this.node.parentNode):r("use",this.node.parentNode);v(c.node,{"xlink:href":"#"+a});c.original=this;return c};var l=/\S+/g;c.addClass=function(c){var a=(c||
"").match(l)||[];c=this.node;var b=c.className.baseVal,m=b.match(l)||[],e,h,d;if(a.length){for(e=0;d=a[e++];)h=m.indexOf(d),~h||m.push(d);a=m.join(" ");b!=a&&(c.className.baseVal=a)}return this};c.removeClass=function(c){var a=(c||"").match(l)||[];c=this.node;var b=c.className.baseVal,m=b.match(l)||[],e,h;if(m.length){for(e=0;h=a[e++];)h=m.indexOf(h),~h&&m.splice(h,1);a=m.join(" ");b!=a&&(c.className.baseVal=a)}return this};c.hasClass=function(c){return!!~(this.node.className.baseVal.match(l)||[]).indexOf(c)};
c.toggleClass=function(c,a){if(null!=a)return a?this.addClass(c):this.removeClass(c);var b=(c||"").match(l)||[],m=this.node,e=m.className.baseVal,h=e.match(l)||[],d,f,E;for(d=0;E=b[d++];)f=h.indexOf(E),~f?h.splice(f,1):h.push(E);b=h.join(" ");e!=b&&(m.className.baseVal=b);return this};c.clone=function(){var c=x(this.node.cloneNode(!0));v(c.node,"id")&&v(c.node,{id:c.id});m(c);c.insertAfter(this);return c};c.toDefs=function(){u(this).appendChild(this.node);return this};c.pattern=c.toPattern=function(c,
a,b,m){var e=r("pattern",u(this));null==c&&(c=this.getBBox());y(c,"object")&&"x"in c&&(a=c.y,b=c.width,m=c.height,c=c.x);v(e.node,{x:c,y:a,width:b,height:m,patternUnits:"userSpaceOnUse",id:e.id,viewBox:[c,a,b,m].join(" ")});e.node.appendChild(this.node);return e};c.marker=function(c,a,b,m,e,h){var d=r("marker",u(this));null==c&&(c=this.getBBox());y(c,"object")&&"x"in c&&(a=c.y,b=c.width,m=c.height,e=c.refX||c.cx,h=c.refY||c.cy,c=c.x);v(d.node,{viewBox:[c,a,b,m].join(" "),markerWidth:b,markerHeight:m,
orient:"auto",refX:e||0,refY:h||0,id:d.id});d.node.appendChild(this.node);return d};var E=function(c,a,b,m){"function"!=typeof b||b.length||(m=b,b=L.linear);this.attr=c;this.dur=a;b&&(this.easing=b);m&&(this.callback=m)};a._.Animation=E;a.animation=function(c,a,b,m){return new E(c,a,b,m)};c.inAnim=function(){var c=[],a;for(a in this.anims)this.anims[h](a)&&function(a){c.push({anim:new E(a._attrs,a.dur,a.easing,a._callback),mina:a,curStatus:a.status(),status:function(c){return a.status(c)},stop:function(){a.stop()}})}(this.anims[a]);
return c};a.animate=function(c,a,b,m,e,h){"function"!=typeof e||e.length||(h=e,e=L.linear);var d=L.time();c=L(c,a,d,d+m,L.time,b,e);h&&k.once("mina.finish."+c.id,h);return c};c.stop=function(){for(var c=this.inAnim(),a=0,b=c.length;a<b;a++)c[a].stop();return this};c.animate=function(c,a,b,m){"function"!=typeof b||b.length||(m=b,b=L.linear);c instanceof E&&(m=c.callback,b=c.easing,a=b.dur,c=c.attr);var d=[],f=[],l={},t,ca,n,T=this,q;for(q in c)if(c[h](q)){T.equal?(n=T.equal(q,J(c[q])),t=n.from,ca=
n.to,n=n.f):(t=+T.attr(q),ca=+c[q]);var la=y(t,"array")?t.length:1;l[q]=e(d.length,d.length+la,n);d=d.concat(t);f=f.concat(ca)}t=L.time();var p=L(d,f,t,t+a,L.time,function(c){var a={},b;for(b in l)l[h](b)&&(a[b]=l[b](c));T.attr(a)},b);T.anims[p.id]=p;p._attrs=c;p._callback=m;k("snap.animcreated."+T.id,p);k.once("mina.finish."+p.id,function(){delete T.anims[p.id];m&&m.call(T)});k.once("mina.stop."+p.id,function(){delete T.anims[p.id]});return T};var T={};c.data=function(c,b){var m=T[this.id]=T[this.id]||
{};if(0==arguments.length)return k("snap.data.get."+this.id,this,m,null),m;if(1==arguments.length){if(a.is(c,"object")){for(var e in c)c[h](e)&&this.data(e,c[e]);return this}k("snap.data.get."+this.id,this,m[c],c);return m[c]}m[c]=b;k("snap.data.set."+this.id,this,b,c);return this};c.removeData=function(c){null==c?T[this.id]={}:T[this.id]&&delete T[this.id][c];return this};c.outerSVG=c.toString=d(1);c.innerSVG=d()})(e.prototype);a.parse=function(c){var a=G.doc.createDocumentFragment(),b=!0,m=G.doc.createElement("div");
c=J(c);c.match(/^\s*<\s*svg(?:\s|>)/)||(c="<svg>"+c+"</svg>",b=!1);m.innerHTML=c;if(c=m.getElementsByTagName("svg")[0])if(b)a=c;else for(;c.firstChild;)a.appendChild(c.firstChild);m.innerHTML=aa;return new l(a)};l.prototype.select=e.prototype.select;l.prototype.selectAll=e.prototype.selectAll;a.fragment=function(){for(var c=Array.prototype.slice.call(arguments,0),b=G.doc.createDocumentFragment(),m=0,e=c.length;m<e;m++){var h=c[m];h.node&&h.node.nodeType&&b.appendChild(h.node);h.nodeType&&b.appendChild(h);
"string"==typeof h&&b.appendChild(a.parse(h).node)}return new l(b)};a._.make=r;a._.wrap=x;s.prototype.el=function(c,a){var b=r(c,this.node);a&&b.attr(a);return b};k.on("snap.util.getattr",function(){var c=k.nt(),c=c.substring(c.lastIndexOf(".")+1),a=c.replace(/[A-Z]/g,function(c){return"-"+c.toLowerCase()});return pa[h](a)?this.node.ownerDocument.defaultView.getComputedStyle(this.node,null).getPropertyValue(a):v(this.node,c)});var pa={"alignment-baseline":0,"baseline-shift":0,clip:0,"clip-path":0,
"clip-rule":0,color:0,"color-interpolation":0,"color-interpolation-filters":0,"color-profile":0,"color-rendering":0,cursor:0,direction:0,display:0,"dominant-baseline":0,"enable-background":0,fill:0,"fill-opacity":0,"fill-rule":0,filter:0,"flood-color":0,"flood-opacity":0,font:0,"font-family":0,"font-size":0,"font-size-adjust":0,"font-stretch":0,"font-style":0,"font-variant":0,"font-weight":0,"glyph-orientation-horizontal":0,"glyph-orientation-vertical":0,"image-rendering":0,kerning:0,"letter-spacing":0,
"lighting-color":0,marker:0,"marker-end":0,"marker-mid":0,"marker-start":0,mask:0,opacity:0,overflow:0,"pointer-events":0,"shape-rendering":0,"stop-color":0,"stop-opacity":0,stroke:0,"stroke-dasharray":0,"stroke-dashoffset":0,"stroke-linecap":0,"stroke-linejoin":0,"stroke-miterlimit":0,"stroke-opacity":0,"stroke-width":0,"text-anchor":0,"text-decoration":0,"text-rendering":0,"unicode-bidi":0,visibility:0,"word-spacing":0,"writing-mode":0};k.on("snap.util.attr",function(c){var a=k.nt(),b={},a=a.substring(a.lastIndexOf(".")+
1);b[a]=c;var m=a.replace(/-(\w)/gi,function(c,a){return a.toUpperCase()}),a=a.replace(/[A-Z]/g,function(c){return"-"+c.toLowerCase()});pa[h](a)?this.node.style[m]=null==c?aa:c:v(this.node,b)});a.ajax=function(c,a,b,m){var e=new XMLHttpRequest,h=V();if(e){if(y(a,"function"))m=b,b=a,a=null;else if(y(a,"object")){var d=[],f;for(f in a)a.hasOwnProperty(f)&&d.push(encodeURIComponent(f)+"="+encodeURIComponent(a[f]));a=d.join("&")}e.open(a?"POST":"GET",c,!0);a&&(e.setRequestHeader("X-Requested-With","XMLHttpRequest"),
e.setRequestHeader("Content-type","application/x-www-form-urlencoded"));b&&(k.once("snap.ajax."+h+".0",b),k.once("snap.ajax."+h+".200",b),k.once("snap.ajax."+h+".304",b));e.onreadystatechange=function(){4==e.readyState&&k("snap.ajax."+h+"."+e.status,m,e)};if(4==e.readyState)return e;e.send(a);return e}};a.load=function(c,b,m){a.ajax(c,function(c){c=a.parse(c.responseText);m?b.call(m,c):b(c)})};a.getElementByPoint=function(c,a){var b,m,e=G.doc.elementFromPoint(c,a);if(G.win.opera&&"svg"==e.tagName){b=
e;m=b.getBoundingClientRect();b=b.ownerDocument;var h=b.body,d=b.documentElement;b=m.top+(g.win.pageYOffset||d.scrollTop||h.scrollTop)-(d.clientTop||h.clientTop||0);m=m.left+(g.win.pageXOffset||d.scrollLeft||h.scrollLeft)-(d.clientLeft||h.clientLeft||0);h=e.createSVGRect();h.x=c-m;h.y=a-b;h.width=h.height=1;b=e.getIntersectionList(h,null);b.length&&(e=b[b.length-1])}return e?x(e):null};a.plugin=function(c){c(a,e,s,G,l)};return G.win.Snap=a}();C.plugin(function(a,k,y,M,A){function w(a,d,f,b,q,e){null==
d&&"[object SVGMatrix]"==z.call(a)?(this.a=a.a,this.b=a.b,this.c=a.c,this.d=a.d,this.e=a.e,this.f=a.f):null!=a?(this.a=+a,this.b=+d,this.c=+f,this.d=+b,this.e=+q,this.f=+e):(this.a=1,this.c=this.b=0,this.d=1,this.f=this.e=0)}var z=Object.prototype.toString,d=String,f=Math;(function(n){function k(a){return a[0]*a[0]+a[1]*a[1]}function p(a){var d=f.sqrt(k(a));a[0]&&(a[0]/=d);a[1]&&(a[1]/=d)}n.add=function(a,d,e,f,n,p){var k=[[],[],[] ],u=[[this.a,this.c,this.e],[this.b,this.d,this.f],[0,0,1] ];d=[[a,
e,n],[d,f,p],[0,0,1] ];a&&a instanceof w&&(d=[[a.a,a.c,a.e],[a.b,a.d,a.f],[0,0,1] ]);for(a=0;3>a;a++)for(e=0;3>e;e++){for(f=n=0;3>f;f++)n+=u[a][f]*d[f][e];k[a][e]=n}this.a=k[0][0];this.b=k[1][0];this.c=k[0][1];this.d=k[1][1];this.e=k[0][2];this.f=k[1][2];return this};n.invert=function(){var a=this.a*this.d-this.b*this.c;return new w(this.d/a,-this.b/a,-this.c/a,this.a/a,(this.c*this.f-this.d*this.e)/a,(this.b*this.e-this.a*this.f)/a)};n.clone=function(){return new w(this.a,this.b,this.c,this.d,this.e,
this.f)};n.translate=function(a,d){return this.add(1,0,0,1,a,d)};n.scale=function(a,d,e,f){null==d&&(d=a);(e||f)&&this.add(1,0,0,1,e,f);this.add(a,0,0,d,0,0);(e||f)&&this.add(1,0,0,1,-e,-f);return this};n.rotate=function(b,d,e){b=a.rad(b);d=d||0;e=e||0;var l=+f.cos(b).toFixed(9);b=+f.sin(b).toFixed(9);this.add(l,b,-b,l,d,e);return this.add(1,0,0,1,-d,-e)};n.x=function(a,d){return a*this.a+d*this.c+this.e};n.y=function(a,d){return a*this.b+d*this.d+this.f};n.get=function(a){return+this[d.fromCharCode(97+
a)].toFixed(4)};n.toString=function(){return"matrix("+[this.get(0),this.get(1),this.get(2),this.get(3),this.get(4),this.get(5)].join()+")"};n.offset=function(){return[this.e.toFixed(4),this.f.toFixed(4)]};n.determinant=function(){return this.a*this.d-this.b*this.c};n.split=function(){var b={};b.dx=this.e;b.dy=this.f;var d=[[this.a,this.c],[this.b,this.d] ];b.scalex=f.sqrt(k(d[0]));p(d[0]);b.shear=d[0][0]*d[1][0]+d[0][1]*d[1][1];d[1]=[d[1][0]-d[0][0]*b.shear,d[1][1]-d[0][1]*b.shear];b.scaley=f.sqrt(k(d[1]));
p(d[1]);b.shear/=b.scaley;0>this.determinant()&&(b.scalex=-b.scalex);var e=-d[0][1],d=d[1][1];0>d?(b.rotate=a.deg(f.acos(d)),0>e&&(b.rotate=360-b.rotate)):b.rotate=a.deg(f.asin(e));b.isSimple=!+b.shear.toFixed(9)&&(b.scalex.toFixed(9)==b.scaley.toFixed(9)||!b.rotate);b.isSuperSimple=!+b.shear.toFixed(9)&&b.scalex.toFixed(9)==b.scaley.toFixed(9)&&!b.rotate;b.noRotation=!+b.shear.toFixed(9)&&!b.rotate;return b};n.toTransformString=function(a){a=a||this.split();if(+a.shear.toFixed(9))return"m"+[this.get(0),
this.get(1),this.get(2),this.get(3),this.get(4),this.get(5)];a.scalex=+a.scalex.toFixed(4);a.scaley=+a.scaley.toFixed(4);a.rotate=+a.rotate.toFixed(4);return(a.dx||a.dy?"t"+[+a.dx.toFixed(4),+a.dy.toFixed(4)]:"")+(1!=a.scalex||1!=a.scaley?"s"+[a.scalex,a.scaley,0,0]:"")+(a.rotate?"r"+[+a.rotate.toFixed(4),0,0]:"")}})(w.prototype);a.Matrix=w;a.matrix=function(a,d,f,b,k,e){return new w(a,d,f,b,k,e)}});C.plugin(function(a,v,y,M,A){function w(h){return function(d){k.stop();d instanceof A&&1==d.node.childNodes.length&&
("radialGradient"==d.node.firstChild.tagName||"linearGradient"==d.node.firstChild.tagName||"pattern"==d.node.firstChild.tagName)&&(d=d.node.firstChild,b(this).appendChild(d),d=u(d));if(d instanceof v)if("radialGradient"==d.type||"linearGradient"==d.type||"pattern"==d.type){d.node.id||e(d.node,{id:d.id});var f=l(d.node.id)}else f=d.attr(h);else f=a.color(d),f.error?(f=a(b(this).ownerSVGElement).gradient(d))?(f.node.id||e(f.node,{id:f.id}),f=l(f.node.id)):f=d:f=r(f);d={};d[h]=f;e(this.node,d);this.node.style[h]=
x}}function z(a){k.stop();a==+a&&(a+="px");this.node.style.fontSize=a}function d(a){var b=[];a=a.childNodes;for(var e=0,f=a.length;e<f;e++){var l=a[e];3==l.nodeType&&b.push(l.nodeValue);"tspan"==l.tagName&&(1==l.childNodes.length&&3==l.firstChild.nodeType?b.push(l.firstChild.nodeValue):b.push(d(l)))}return b}function f(){k.stop();return this.node.style.fontSize}var n=a._.make,u=a._.wrap,p=a.is,b=a._.getSomeDefs,q=/^url\(#?([^)]+)\)$/,e=a._.$,l=a.url,r=String,s=a._.separator,x="";k.on("snap.util.attr.mask",
function(a){if(a instanceof v||a instanceof A){k.stop();a instanceof A&&1==a.node.childNodes.length&&(a=a.node.firstChild,b(this).appendChild(a),a=u(a));if("mask"==a.type)var d=a;else d=n("mask",b(this)),d.node.appendChild(a.node);!d.node.id&&e(d.node,{id:d.id});e(this.node,{mask:l(d.id)})}});(function(a){k.on("snap.util.attr.clip",a);k.on("snap.util.attr.clip-path",a);k.on("snap.util.attr.clipPath",a)})(function(a){if(a instanceof v||a instanceof A){k.stop();if("clipPath"==a.type)var d=a;else d=
n("clipPath",b(this)),d.node.appendChild(a.node),!d.node.id&&e(d.node,{id:d.id});e(this.node,{"clip-path":l(d.id)})}});k.on("snap.util.attr.fill",w("fill"));k.on("snap.util.attr.stroke",w("stroke"));var G=/^([lr])(?:\(([^)]*)\))?(.*)$/i;k.on("snap.util.grad.parse",function(a){a=r(a);var b=a.match(G);if(!b)return null;a=b[1];var e=b[2],b=b[3],e=e.split(/\s*,\s*/).map(function(a){return+a==a?+a:a});1==e.length&&0==e[0]&&(e=[]);b=b.split("-");b=b.map(function(a){a=a.split(":");var b={color:a[0]};a[1]&&
(b.offset=parseFloat(a[1]));return b});return{type:a,params:e,stops:b}});k.on("snap.util.attr.d",function(b){k.stop();p(b,"array")&&p(b[0],"array")&&(b=a.path.toString.call(b));b=r(b);b.match(/[ruo]/i)&&(b=a.path.toAbsolute(b));e(this.node,{d:b})})(-1);k.on("snap.util.attr.#text",function(a){k.stop();a=r(a);for(a=M.doc.createTextNode(a);this.node.firstChild;)this.node.removeChild(this.node.firstChild);this.node.appendChild(a)})(-1);k.on("snap.util.attr.path",function(a){k.stop();this.attr({d:a})})(-1);
k.on("snap.util.attr.class",function(a){k.stop();this.node.className.baseVal=a})(-1);k.on("snap.util.attr.viewBox",function(a){a=p(a,"object")&&"x"in a?[a.x,a.y,a.width,a.height].join(" "):p(a,"array")?a.join(" "):a;e(this.node,{viewBox:a});k.stop()})(-1);k.on("snap.util.attr.transform",function(a){this.transform(a);k.stop()})(-1);k.on("snap.util.attr.r",function(a){"rect"==this.type&&(k.stop(),e(this.node,{rx:a,ry:a}))})(-1);k.on("snap.util.attr.textpath",function(a){k.stop();if("text"==this.type){var d,
f;if(!a&&this.textPath){for(a=this.textPath;a.node.firstChild;)this.node.appendChild(a.node.firstChild);a.remove();delete this.textPath}else if(p(a,"string")?(d=b(this),a=u(d.parentNode).path(a),d.appendChild(a.node),d=a.id,a.attr({id:d})):(a=u(a),a instanceof v&&(d=a.attr("id"),d||(d=a.id,a.attr({id:d})))),d)if(a=this.textPath,f=this.node,a)a.attr({"xlink:href":"#"+d});else{for(a=e("textPath",{"xlink:href":"#"+d});f.firstChild;)a.appendChild(f.firstChild);f.appendChild(a);this.textPath=u(a)}}})(-1);
k.on("snap.util.attr.text",function(a){if("text"==this.type){for(var b=this.node,d=function(a){var b=e("tspan");if(p(a,"array"))for(var f=0;f<a.length;f++)b.appendChild(d(a[f]));else b.appendChild(M.doc.createTextNode(a));b.normalize&&b.normalize();return b};b.firstChild;)b.removeChild(b.firstChild);for(a=d(a);a.firstChild;)b.appendChild(a.firstChild)}k.stop()})(-1);k.on("snap.util.attr.fontSize",z)(-1);k.on("snap.util.attr.font-size",z)(-1);k.on("snap.util.getattr.transform",function(){k.stop();
return this.transform()})(-1);k.on("snap.util.getattr.textpath",function(){k.stop();return this.textPath})(-1);(function(){function b(d){return function(){k.stop();var b=M.doc.defaultView.getComputedStyle(this.node,null).getPropertyValue("marker-"+d);return"none"==b?b:a(M.doc.getElementById(b.match(q)[1]))}}function d(a){return function(b){k.stop();var d="marker"+a.charAt(0).toUpperCase()+a.substring(1);if(""==b||!b)this.node.style[d]="none";else if("marker"==b.type){var f=b.node.id;f||e(b.node,{id:b.id});
this.node.style[d]=l(f)}}}k.on("snap.util.getattr.marker-end",b("end"))(-1);k.on("snap.util.getattr.markerEnd",b("end"))(-1);k.on("snap.util.getattr.marker-start",b("start"))(-1);k.on("snap.util.getattr.markerStart",b("start"))(-1);k.on("snap.util.getattr.marker-mid",b("mid"))(-1);k.on("snap.util.getattr.markerMid",b("mid"))(-1);k.on("snap.util.attr.marker-end",d("end"))(-1);k.on("snap.util.attr.markerEnd",d("end"))(-1);k.on("snap.util.attr.marker-start",d("start"))(-1);k.on("snap.util.attr.markerStart",
d("start"))(-1);k.on("snap.util.attr.marker-mid",d("mid"))(-1);k.on("snap.util.attr.markerMid",d("mid"))(-1)})();k.on("snap.util.getattr.r",function(){if("rect"==this.type&&e(this.node,"rx")==e(this.node,"ry"))return k.stop(),e(this.node,"rx")})(-1);k.on("snap.util.getattr.text",function(){if("text"==this.type||"tspan"==this.type){k.stop();var a=d(this.node);return 1==a.length?a[0]:a}})(-1);k.on("snap.util.getattr.#text",function(){return this.node.textContent})(-1);k.on("snap.util.getattr.viewBox",
function(){k.stop();var b=e(this.node,"viewBox");if(b)return b=b.split(s),a._.box(+b[0],+b[1],+b[2],+b[3])})(-1);k.on("snap.util.getattr.points",function(){var a=e(this.node,"points");k.stop();if(a)return a.split(s)})(-1);k.on("snap.util.getattr.path",function(){var a=e(this.node,"d");k.stop();return a})(-1);k.on("snap.util.getattr.class",function(){return this.node.className.baseVal})(-1);k.on("snap.util.getattr.fontSize",f)(-1);k.on("snap.util.getattr.font-size",f)(-1)});C.plugin(function(a,v,y,
M,A){function w(a){return a}function z(a){return function(b){return+b.toFixed(3)+a}}var d={"+":function(a,b){return a+b},"-":function(a,b){return a-b},"/":function(a,b){return a/b},"*":function(a,b){return a*b}},f=String,n=/[a-z]+$/i,u=/^\s*([+\-\/*])\s*=\s*([\d.eE+\-]+)\s*([^\d\s]+)?\s*$/;k.on("snap.util.attr",function(a){if(a=f(a).match(u)){var b=k.nt(),b=b.substring(b.lastIndexOf(".")+1),q=this.attr(b),e={};k.stop();var l=a[3]||"",r=q.match(n),s=d[a[1] ];r&&r==l?a=s(parseFloat(q),+a[2]):(q=this.asPX(b),
a=s(this.asPX(b),this.asPX(b,a[2]+l)));isNaN(q)||isNaN(a)||(e[b]=a,this.attr(e))}})(-10);k.on("snap.util.equal",function(a,b){var q=f(this.attr(a)||""),e=f(b).match(u);if(e){k.stop();var l=e[3]||"",r=q.match(n),s=d[e[1] ];if(r&&r==l)return{from:parseFloat(q),to:s(parseFloat(q),+e[2]),f:z(r)};q=this.asPX(a);return{from:q,to:s(q,this.asPX(a,e[2]+l)),f:w}}})(-10)});C.plugin(function(a,v,y,M,A){var w=y.prototype,z=a.is;w.rect=function(a,d,k,p,b,q){var e;null==q&&(q=b);z(a,"object")&&"[object Object]"==
a?e=a:null!=a&&(e={x:a,y:d,width:k,height:p},null!=b&&(e.rx=b,e.ry=q));return this.el("rect",e)};w.circle=function(a,d,k){var p;z(a,"object")&&"[object Object]"==a?p=a:null!=a&&(p={cx:a,cy:d,r:k});return this.el("circle",p)};var d=function(){function a(){this.parentNode.removeChild(this)}return function(d,k){var p=M.doc.createElement("img"),b=M.doc.body;p.style.cssText="position:absolute;left:-9999em;top:-9999em";p.onload=function(){k.call(p);p.onload=p.onerror=null;b.removeChild(p)};p.onerror=a;
b.appendChild(p);p.src=d}}();w.image=function(f,n,k,p,b){var q=this.el("image");if(z(f,"object")&&"src"in f)q.attr(f);else if(null!=f){var e={"xlink:href":f,preserveAspectRatio:"none"};null!=n&&null!=k&&(e.x=n,e.y=k);null!=p&&null!=b?(e.width=p,e.height=b):d(f,function(){a._.$(q.node,{width:this.offsetWidth,height:this.offsetHeight})});a._.$(q.node,e)}return q};w.ellipse=function(a,d,k,p){var b;z(a,"object")&&"[object Object]"==a?b=a:null!=a&&(b={cx:a,cy:d,rx:k,ry:p});return this.el("ellipse",b)};
w.path=function(a){var d;z(a,"object")&&!z(a,"array")?d=a:a&&(d={d:a});return this.el("path",d)};w.group=w.g=function(a){var d=this.el("g");1==arguments.length&&a&&!a.type?d.attr(a):arguments.length&&d.add(Array.prototype.slice.call(arguments,0));return d};w.svg=function(a,d,k,p,b,q,e,l){var r={};z(a,"object")&&null==d?r=a:(null!=a&&(r.x=a),null!=d&&(r.y=d),null!=k&&(r.width=k),null!=p&&(r.height=p),null!=b&&null!=q&&null!=e&&null!=l&&(r.viewBox=[b,q,e,l]));return this.el("svg",r)};w.mask=function(a){var d=
this.el("mask");1==arguments.length&&a&&!a.type?d.attr(a):arguments.length&&d.add(Array.prototype.slice.call(arguments,0));return d};w.ptrn=function(a,d,k,p,b,q,e,l){if(z(a,"object"))var r=a;else arguments.length?(r={},null!=a&&(r.x=a),null!=d&&(r.y=d),null!=k&&(r.width=k),null!=p&&(r.height=p),null!=b&&null!=q&&null!=e&&null!=l&&(r.viewBox=[b,q,e,l])):r={patternUnits:"userSpaceOnUse"};return this.el("pattern",r)};w.use=function(a){return null!=a?(make("use",this.node),a instanceof v&&(a.attr("id")||
a.attr({id:ID()}),a=a.attr("id")),this.el("use",{"xlink:href":a})):v.prototype.use.call(this)};w.text=function(a,d,k){var p={};z(a,"object")?p=a:null!=a&&(p={x:a,y:d,text:k||""});return this.el("text",p)};w.line=function(a,d,k,p){var b={};z(a,"object")?b=a:null!=a&&(b={x1:a,x2:k,y1:d,y2:p});return this.el("line",b)};w.polyline=function(a){1<arguments.length&&(a=Array.prototype.slice.call(arguments,0));var d={};z(a,"object")&&!z(a,"array")?d=a:null!=a&&(d={points:a});return this.el("polyline",d)};
w.polygon=function(a){1<arguments.length&&(a=Array.prototype.slice.call(arguments,0));var d={};z(a,"object")&&!z(a,"array")?d=a:null!=a&&(d={points:a});return this.el("polygon",d)};(function(){function d(){return this.selectAll("stop")}function n(b,d){var f=e("stop"),k={offset:+d+"%"};b=a.color(b);k["stop-color"]=b.hex;1>b.opacity&&(k["stop-opacity"]=b.opacity);e(f,k);this.node.appendChild(f);return this}function u(){if("linearGradient"==this.type){var b=e(this.node,"x1")||0,d=e(this.node,"x2")||
1,f=e(this.node,"y1")||0,k=e(this.node,"y2")||0;return a._.box(b,f,math.abs(d-b),math.abs(k-f))}b=this.node.r||0;return a._.box((this.node.cx||0.5)-b,(this.node.cy||0.5)-b,2*b,2*b)}function p(a,d){function f(a,b){for(var d=(b-u)/(a-w),e=w;e<a;e++)h[e].offset=+(+u+d*(e-w)).toFixed(2);w=a;u=b}var n=k("snap.util.grad.parse",null,d).firstDefined(),p;if(!n)return null;n.params.unshift(a);p="l"==n.type.toLowerCase()?b.apply(0,n.params):q.apply(0,n.params);n.type!=n.type.toLowerCase()&&e(p.node,{gradientUnits:"userSpaceOnUse"});
var h=n.stops,n=h.length,u=0,w=0;n--;for(var v=0;v<n;v++)"offset"in h[v]&&f(v,h[v].offset);h[n].offset=h[n].offset||100;f(n,h[n].offset);for(v=0;v<=n;v++){var y=h[v];p.addStop(y.color,y.offset)}return p}function b(b,k,p,q,w){b=a._.make("linearGradient",b);b.stops=d;b.addStop=n;b.getBBox=u;null!=k&&e(b.node,{x1:k,y1:p,x2:q,y2:w});return b}function q(b,k,p,q,w,h){b=a._.make("radialGradient",b);b.stops=d;b.addStop=n;b.getBBox=u;null!=k&&e(b.node,{cx:k,cy:p,r:q});null!=w&&null!=h&&e(b.node,{fx:w,fy:h});
return b}var e=a._.$;w.gradient=function(a){return p(this.defs,a)};w.gradientLinear=function(a,d,e,f){return b(this.defs,a,d,e,f)};w.gradientRadial=function(a,b,d,e,f){return q(this.defs,a,b,d,e,f)};w.toString=function(){var b=this.node.ownerDocument,d=b.createDocumentFragment(),b=b.createElement("div"),e=this.node.cloneNode(!0);d.appendChild(b);b.appendChild(e);a._.$(e,{xmlns:"http://www.w3.org/2000/svg"});b=b.innerHTML;d.removeChild(d.firstChild);return b};w.clear=function(){for(var a=this.node.firstChild,
b;a;)b=a.nextSibling,"defs"!=a.tagName?a.parentNode.removeChild(a):w.clear.call({node:a}),a=b}})()});C.plugin(function(a,k,y,M){function A(a){var b=A.ps=A.ps||{};b[a]?b[a].sleep=100:b[a]={sleep:100};setTimeout(function(){for(var d in b)b[L](d)&&d!=a&&(b[d].sleep--,!b[d].sleep&&delete b[d])});return b[a]}function w(a,b,d,e){null==a&&(a=b=d=e=0);null==b&&(b=a.y,d=a.width,e=a.height,a=a.x);return{x:a,y:b,width:d,w:d,height:e,h:e,x2:a+d,y2:b+e,cx:a+d/2,cy:b+e/2,r1:F.min(d,e)/2,r2:F.max(d,e)/2,r0:F.sqrt(d*
d+e*e)/2,path:s(a,b,d,e),vb:[a,b,d,e].join(" ")}}function z(){return this.join(",").replace(N,"$1")}function d(a){a=C(a);a.toString=z;return a}function f(a,b,d,h,f,k,l,n,p){if(null==p)return e(a,b,d,h,f,k,l,n);if(0>p||e(a,b,d,h,f,k,l,n)<p)p=void 0;else{var q=0.5,O=1-q,s;for(s=e(a,b,d,h,f,k,l,n,O);0.01<Z(s-p);)q/=2,O+=(s<p?1:-1)*q,s=e(a,b,d,h,f,k,l,n,O);p=O}return u(a,b,d,h,f,k,l,n,p)}function n(b,d){function e(a){return+(+a).toFixed(3)}return a._.cacher(function(a,h,l){a instanceof k&&(a=a.attr("d"));
a=I(a);for(var n,p,D,q,O="",s={},c=0,t=0,r=a.length;t<r;t++){D=a[t];if("M"==D[0])n=+D[1],p=+D[2];else{q=f(n,p,D[1],D[2],D[3],D[4],D[5],D[6]);if(c+q>h){if(d&&!s.start){n=f(n,p,D[1],D[2],D[3],D[4],D[5],D[6],h-c);O+=["C"+e(n.start.x),e(n.start.y),e(n.m.x),e(n.m.y),e(n.x),e(n.y)];if(l)return O;s.start=O;O=["M"+e(n.x),e(n.y)+"C"+e(n.n.x),e(n.n.y),e(n.end.x),e(n.end.y),e(D[5]),e(D[6])].join();c+=q;n=+D[5];p=+D[6];continue}if(!b&&!d)return n=f(n,p,D[1],D[2],D[3],D[4],D[5],D[6],h-c)}c+=q;n=+D[5];p=+D[6]}O+=
D.shift()+D}s.end=O;return n=b?c:d?s:u(n,p,D[0],D[1],D[2],D[3],D[4],D[5],1)},null,a._.clone)}function u(a,b,d,e,h,f,k,l,n){var p=1-n,q=ma(p,3),s=ma(p,2),c=n*n,t=c*n,r=q*a+3*s*n*d+3*p*n*n*h+t*k,q=q*b+3*s*n*e+3*p*n*n*f+t*l,s=a+2*n*(d-a)+c*(h-2*d+a),t=b+2*n*(e-b)+c*(f-2*e+b),x=d+2*n*(h-d)+c*(k-2*h+d),c=e+2*n*(f-e)+c*(l-2*f+e);a=p*a+n*d;b=p*b+n*e;h=p*h+n*k;f=p*f+n*l;l=90-180*F.atan2(s-x,t-c)/S;return{x:r,y:q,m:{x:s,y:t},n:{x:x,y:c},start:{x:a,y:b},end:{x:h,y:f},alpha:l}}function p(b,d,e,h,f,n,k,l){a.is(b,
"array")||(b=[b,d,e,h,f,n,k,l]);b=U.apply(null,b);return w(b.min.x,b.min.y,b.max.x-b.min.x,b.max.y-b.min.y)}function b(a,b,d){return b>=a.x&&b<=a.x+a.width&&d>=a.y&&d<=a.y+a.height}function q(a,d){a=w(a);d=w(d);return b(d,a.x,a.y)||b(d,a.x2,a.y)||b(d,a.x,a.y2)||b(d,a.x2,a.y2)||b(a,d.x,d.y)||b(a,d.x2,d.y)||b(a,d.x,d.y2)||b(a,d.x2,d.y2)||(a.x<d.x2&&a.x>d.x||d.x<a.x2&&d.x>a.x)&&(a.y<d.y2&&a.y>d.y||d.y<a.y2&&d.y>a.y)}function e(a,b,d,e,h,f,n,k,l){null==l&&(l=1);l=(1<l?1:0>l?0:l)/2;for(var p=[-0.1252,
0.1252,-0.3678,0.3678,-0.5873,0.5873,-0.7699,0.7699,-0.9041,0.9041,-0.9816,0.9816],q=[0.2491,0.2491,0.2335,0.2335,0.2032,0.2032,0.1601,0.1601,0.1069,0.1069,0.0472,0.0472],s=0,c=0;12>c;c++)var t=l*p[c]+l,r=t*(t*(-3*a+9*d-9*h+3*n)+6*a-12*d+6*h)-3*a+3*d,t=t*(t*(-3*b+9*e-9*f+3*k)+6*b-12*e+6*f)-3*b+3*e,s=s+q[c]*F.sqrt(r*r+t*t);return l*s}function l(a,b,d){a=I(a);b=I(b);for(var h,f,l,n,k,s,r,O,x,c,t=d?0:[],w=0,v=a.length;w<v;w++)if(x=a[w],"M"==x[0])h=k=x[1],f=s=x[2];else{"C"==x[0]?(x=[h,f].concat(x.slice(1)),
h=x[6],f=x[7]):(x=[h,f,h,f,k,s,k,s],h=k,f=s);for(var G=0,y=b.length;G<y;G++)if(c=b[G],"M"==c[0])l=r=c[1],n=O=c[2];else{"C"==c[0]?(c=[l,n].concat(c.slice(1)),l=c[6],n=c[7]):(c=[l,n,l,n,r,O,r,O],l=r,n=O);var z;var K=x,B=c;z=d;var H=p(K),J=p(B);if(q(H,J)){for(var H=e.apply(0,K),J=e.apply(0,B),H=~~(H/8),J=~~(J/8),U=[],A=[],F={},M=z?0:[],P=0;P<H+1;P++){var C=u.apply(0,K.concat(P/H));U.push({x:C.x,y:C.y,t:P/H})}for(P=0;P<J+1;P++)C=u.apply(0,B.concat(P/J)),A.push({x:C.x,y:C.y,t:P/J});for(P=0;P<H;P++)for(K=
0;K<J;K++){var Q=U[P],L=U[P+1],B=A[K],C=A[K+1],N=0.001>Z(L.x-Q.x)?"y":"x",S=0.001>Z(C.x-B.x)?"y":"x",R;R=Q.x;var Y=Q.y,V=L.x,ea=L.y,fa=B.x,ga=B.y,ha=C.x,ia=C.y;if(W(R,V)<X(fa,ha)||X(R,V)>W(fa,ha)||W(Y,ea)<X(ga,ia)||X(Y,ea)>W(ga,ia))R=void 0;else{var $=(R*ea-Y*V)*(fa-ha)-(R-V)*(fa*ia-ga*ha),aa=(R*ea-Y*V)*(ga-ia)-(Y-ea)*(fa*ia-ga*ha),ja=(R-V)*(ga-ia)-(Y-ea)*(fa-ha);if(ja){var $=$/ja,aa=aa/ja,ja=+$.toFixed(2),ba=+aa.toFixed(2);R=ja<+X(R,V).toFixed(2)||ja>+W(R,V).toFixed(2)||ja<+X(fa,ha).toFixed(2)||
ja>+W(fa,ha).toFixed(2)||ba<+X(Y,ea).toFixed(2)||ba>+W(Y,ea).toFixed(2)||ba<+X(ga,ia).toFixed(2)||ba>+W(ga,ia).toFixed(2)?void 0:{x:$,y:aa}}else R=void 0}R&&F[R.x.toFixed(4)]!=R.y.toFixed(4)&&(F[R.x.toFixed(4)]=R.y.toFixed(4),Q=Q.t+Z((R[N]-Q[N])/(L[N]-Q[N]))*(L.t-Q.t),B=B.t+Z((R[S]-B[S])/(C[S]-B[S]))*(C.t-B.t),0<=Q&&1>=Q&&0<=B&&1>=B&&(z?M++:M.push({x:R.x,y:R.y,t1:Q,t2:B})))}z=M}else z=z?0:[];if(d)t+=z;else{H=0;for(J=z.length;H<J;H++)z[H].segment1=w,z[H].segment2=G,z[H].bez1=x,z[H].bez2=c;t=t.concat(z)}}}return t}
function r(a){var b=A(a);if(b.bbox)return C(b.bbox);if(!a)return w();a=I(a);for(var d=0,e=0,h=[],f=[],l,n=0,k=a.length;n<k;n++)l=a[n],"M"==l[0]?(d=l[1],e=l[2],h.push(d),f.push(e)):(d=U(d,e,l[1],l[2],l[3],l[4],l[5],l[6]),h=h.concat(d.min.x,d.max.x),f=f.concat(d.min.y,d.max.y),d=l[5],e=l[6]);a=X.apply(0,h);l=X.apply(0,f);h=W.apply(0,h);f=W.apply(0,f);f=w(a,l,h-a,f-l);b.bbox=C(f);return f}function s(a,b,d,e,h){if(h)return[["M",+a+ +h,b],["l",d-2*h,0],["a",h,h,0,0,1,h,h],["l",0,e-2*h],["a",h,h,0,0,1,
-h,h],["l",2*h-d,0],["a",h,h,0,0,1,-h,-h],["l",0,2*h-e],["a",h,h,0,0,1,h,-h],["z"] ];a=[["M",a,b],["l",d,0],["l",0,e],["l",-d,0],["z"] ];a.toString=z;return a}function x(a,b,d,e,h){null==h&&null==e&&(e=d);a=+a;b=+b;d=+d;e=+e;if(null!=h){var f=Math.PI/180,l=a+d*Math.cos(-e*f);a+=d*Math.cos(-h*f);var n=b+d*Math.sin(-e*f);b+=d*Math.sin(-h*f);d=[["M",l,n],["A",d,d,0,+(180<h-e),0,a,b] ]}else d=[["M",a,b],["m",0,-e],["a",d,e,0,1,1,0,2*e],["a",d,e,0,1,1,0,-2*e],["z"] ];d.toString=z;return d}function G(b){var e=
A(b);if(e.abs)return d(e.abs);Q(b,"array")&&Q(b&&b[0],"array")||(b=a.parsePathString(b));if(!b||!b.length)return[["M",0,0] ];var h=[],f=0,l=0,n=0,k=0,p=0;"M"==b[0][0]&&(f=+b[0][1],l=+b[0][2],n=f,k=l,p++,h[0]=["M",f,l]);for(var q=3==b.length&&"M"==b[0][0]&&"R"==b[1][0].toUpperCase()&&"Z"==b[2][0].toUpperCase(),s,r,w=p,c=b.length;w<c;w++){h.push(s=[]);r=b[w];p=r[0];if(p!=p.toUpperCase())switch(s[0]=p.toUpperCase(),s[0]){case "A":s[1]=r[1];s[2]=r[2];s[3]=r[3];s[4]=r[4];s[5]=r[5];s[6]=+r[6]+f;s[7]=+r[7]+
l;break;case "V":s[1]=+r[1]+l;break;case "H":s[1]=+r[1]+f;break;case "R":for(var t=[f,l].concat(r.slice(1)),u=2,v=t.length;u<v;u++)t[u]=+t[u]+f,t[++u]=+t[u]+l;h.pop();h=h.concat(P(t,q));break;case "O":h.pop();t=x(f,l,r[1],r[2]);t.push(t[0]);h=h.concat(t);break;case "U":h.pop();h=h.concat(x(f,l,r[1],r[2],r[3]));s=["U"].concat(h[h.length-1].slice(-2));break;case "M":n=+r[1]+f,k=+r[2]+l;default:for(u=1,v=r.length;u<v;u++)s[u]=+r[u]+(u%2?f:l)}else if("R"==p)t=[f,l].concat(r.slice(1)),h.pop(),h=h.concat(P(t,
q)),s=["R"].concat(r.slice(-2));else if("O"==p)h.pop(),t=x(f,l,r[1],r[2]),t.push(t[0]),h=h.concat(t);else if("U"==p)h.pop(),h=h.concat(x(f,l,r[1],r[2],r[3])),s=["U"].concat(h[h.length-1].slice(-2));else for(t=0,u=r.length;t<u;t++)s[t]=r[t];p=p.toUpperCase();if("O"!=p)switch(s[0]){case "Z":f=+n;l=+k;break;case "H":f=s[1];break;case "V":l=s[1];break;case "M":n=s[s.length-2],k=s[s.length-1];default:f=s[s.length-2],l=s[s.length-1]}}h.toString=z;e.abs=d(h);return h}function h(a,b,d,e){return[a,b,d,e,d,
e]}function J(a,b,d,e,h,f){var l=1/3,n=2/3;return[l*a+n*d,l*b+n*e,l*h+n*d,l*f+n*e,h,f]}function K(b,d,e,h,f,l,n,k,p,s){var r=120*S/180,q=S/180*(+f||0),c=[],t,x=a._.cacher(function(a,b,c){var d=a*F.cos(c)-b*F.sin(c);a=a*F.sin(c)+b*F.cos(c);return{x:d,y:a}});if(s)v=s[0],t=s[1],l=s[2],u=s[3];else{t=x(b,d,-q);b=t.x;d=t.y;t=x(k,p,-q);k=t.x;p=t.y;F.cos(S/180*f);F.sin(S/180*f);t=(b-k)/2;v=(d-p)/2;u=t*t/(e*e)+v*v/(h*h);1<u&&(u=F.sqrt(u),e*=u,h*=u);var u=e*e,w=h*h,u=(l==n?-1:1)*F.sqrt(Z((u*w-u*v*v-w*t*t)/
(u*v*v+w*t*t)));l=u*e*v/h+(b+k)/2;var u=u*-h*t/e+(d+p)/2,v=F.asin(((d-u)/h).toFixed(9));t=F.asin(((p-u)/h).toFixed(9));v=b<l?S-v:v;t=k<l?S-t:t;0>v&&(v=2*S+v);0>t&&(t=2*S+t);n&&v>t&&(v-=2*S);!n&&t>v&&(t-=2*S)}if(Z(t-v)>r){var c=t,w=k,G=p;t=v+r*(n&&t>v?1:-1);k=l+e*F.cos(t);p=u+h*F.sin(t);c=K(k,p,e,h,f,0,n,w,G,[t,c,l,u])}l=t-v;f=F.cos(v);r=F.sin(v);n=F.cos(t);t=F.sin(t);l=F.tan(l/4);e=4/3*e*l;l*=4/3*h;h=[b,d];b=[b+e*r,d-l*f];d=[k+e*t,p-l*n];k=[k,p];b[0]=2*h[0]-b[0];b[1]=2*h[1]-b[1];if(s)return[b,d,k].concat(c);
c=[b,d,k].concat(c).join().split(",");s=[];k=0;for(p=c.length;k<p;k++)s[k]=k%2?x(c[k-1],c[k],q).y:x(c[k],c[k+1],q).x;return s}function U(a,b,d,e,h,f,l,k){for(var n=[],p=[[],[] ],s,r,c,t,q=0;2>q;++q)0==q?(r=6*a-12*d+6*h,s=-3*a+9*d-9*h+3*l,c=3*d-3*a):(r=6*b-12*e+6*f,s=-3*b+9*e-9*f+3*k,c=3*e-3*b),1E-12>Z(s)?1E-12>Z(r)||(s=-c/r,0<s&&1>s&&n.push(s)):(t=r*r-4*c*s,c=F.sqrt(t),0>t||(t=(-r+c)/(2*s),0<t&&1>t&&n.push(t),s=(-r-c)/(2*s),0<s&&1>s&&n.push(s)));for(r=q=n.length;q--;)s=n[q],c=1-s,p[0][q]=c*c*c*a+3*
c*c*s*d+3*c*s*s*h+s*s*s*l,p[1][q]=c*c*c*b+3*c*c*s*e+3*c*s*s*f+s*s*s*k;p[0][r]=a;p[1][r]=b;p[0][r+1]=l;p[1][r+1]=k;p[0].length=p[1].length=r+2;return{min:{x:X.apply(0,p[0]),y:X.apply(0,p[1])},max:{x:W.apply(0,p[0]),y:W.apply(0,p[1])}}}function I(a,b){var e=!b&&A(a);if(!b&&e.curve)return d(e.curve);var f=G(a),l=b&&G(b),n={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},k={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},p=function(a,b,c){if(!a)return["C",b.x,b.y,b.x,b.y,b.x,b.y];a[0]in{T:1,Q:1}||(b.qx=b.qy=null);
switch(a[0]){case "M":b.X=a[1];b.Y=a[2];break;case "A":a=["C"].concat(K.apply(0,[b.x,b.y].concat(a.slice(1))));break;case "S":"C"==c||"S"==c?(c=2*b.x-b.bx,b=2*b.y-b.by):(c=b.x,b=b.y);a=["C",c,b].concat(a.slice(1));break;case "T":"Q"==c||"T"==c?(b.qx=2*b.x-b.qx,b.qy=2*b.y-b.qy):(b.qx=b.x,b.qy=b.y);a=["C"].concat(J(b.x,b.y,b.qx,b.qy,a[1],a[2]));break;case "Q":b.qx=a[1];b.qy=a[2];a=["C"].concat(J(b.x,b.y,a[1],a[2],a[3],a[4]));break;case "L":a=["C"].concat(h(b.x,b.y,a[1],a[2]));break;case "H":a=["C"].concat(h(b.x,
b.y,a[1],b.y));break;case "V":a=["C"].concat(h(b.x,b.y,b.x,a[1]));break;case "Z":a=["C"].concat(h(b.x,b.y,b.X,b.Y))}return a},s=function(a,b){if(7<a[b].length){a[b].shift();for(var c=a[b];c.length;)q[b]="A",l&&(u[b]="A"),a.splice(b++,0,["C"].concat(c.splice(0,6)));a.splice(b,1);v=W(f.length,l&&l.length||0)}},r=function(a,b,c,d,e){a&&b&&"M"==a[e][0]&&"M"!=b[e][0]&&(b.splice(e,0,["M",d.x,d.y]),c.bx=0,c.by=0,c.x=a[e][1],c.y=a[e][2],v=W(f.length,l&&l.length||0))},q=[],u=[],c="",t="",x=0,v=W(f.length,
l&&l.length||0);for(;x<v;x++){f[x]&&(c=f[x][0]);"C"!=c&&(q[x]=c,x&&(t=q[x-1]));f[x]=p(f[x],n,t);"A"!=q[x]&&"C"==c&&(q[x]="C");s(f,x);l&&(l[x]&&(c=l[x][0]),"C"!=c&&(u[x]=c,x&&(t=u[x-1])),l[x]=p(l[x],k,t),"A"!=u[x]&&"C"==c&&(u[x]="C"),s(l,x));r(f,l,n,k,x);r(l,f,k,n,x);var w=f[x],z=l&&l[x],y=w.length,U=l&&z.length;n.x=w[y-2];n.y=w[y-1];n.bx=$(w[y-4])||n.x;n.by=$(w[y-3])||n.y;k.bx=l&&($(z[U-4])||k.x);k.by=l&&($(z[U-3])||k.y);k.x=l&&z[U-2];k.y=l&&z[U-1]}l||(e.curve=d(f));return l?[f,l]:f}function P(a,
b){for(var d=[],e=0,h=a.length;h-2*!b>e;e+=2){var f=[{x:+a[e-2],y:+a[e-1]},{x:+a[e],y:+a[e+1]},{x:+a[e+2],y:+a[e+3]},{x:+a[e+4],y:+a[e+5]}];b?e?h-4==e?f[3]={x:+a[0],y:+a[1]}:h-2==e&&(f[2]={x:+a[0],y:+a[1]},f[3]={x:+a[2],y:+a[3]}):f[0]={x:+a[h-2],y:+a[h-1]}:h-4==e?f[3]=f[2]:e||(f[0]={x:+a[e],y:+a[e+1]});d.push(["C",(-f[0].x+6*f[1].x+f[2].x)/6,(-f[0].y+6*f[1].y+f[2].y)/6,(f[1].x+6*f[2].x-f[3].x)/6,(f[1].y+6*f[2].y-f[3].y)/6,f[2].x,f[2].y])}return d}y=k.prototype;var Q=a.is,C=a._.clone,L="hasOwnProperty",
N=/,?([a-z]),?/gi,$=parseFloat,F=Math,S=F.PI,X=F.min,W=F.max,ma=F.pow,Z=F.abs;M=n(1);var na=n(),ba=n(0,1),V=a._unit2px;a.path=A;a.path.getTotalLength=M;a.path.getPointAtLength=na;a.path.getSubpath=function(a,b,d){if(1E-6>this.getTotalLength(a)-d)return ba(a,b).end;a=ba(a,d,1);return b?ba(a,b).end:a};y.getTotalLength=function(){if(this.node.getTotalLength)return this.node.getTotalLength()};y.getPointAtLength=function(a){return na(this.attr("d"),a)};y.getSubpath=function(b,d){return a.path.getSubpath(this.attr("d"),
b,d)};a._.box=w;a.path.findDotsAtSegment=u;a.path.bezierBBox=p;a.path.isPointInsideBBox=b;a.path.isBBoxIntersect=q;a.path.intersection=function(a,b){return l(a,b)};a.path.intersectionNumber=function(a,b){return l(a,b,1)};a.path.isPointInside=function(a,d,e){var h=r(a);return b(h,d,e)&&1==l(a,[["M",d,e],["H",h.x2+10] ],1)%2};a.path.getBBox=r;a.path.get={path:function(a){return a.attr("path")},circle:function(a){a=V(a);return x(a.cx,a.cy,a.r)},ellipse:function(a){a=V(a);return x(a.cx||0,a.cy||0,a.rx,
a.ry)},rect:function(a){a=V(a);return s(a.x||0,a.y||0,a.width,a.height,a.rx,a.ry)},image:function(a){a=V(a);return s(a.x||0,a.y||0,a.width,a.height)},line:function(a){return"M"+[a.attr("x1")||0,a.attr("y1")||0,a.attr("x2"),a.attr("y2")]},polyline:function(a){return"M"+a.attr("points")},polygon:function(a){return"M"+a.attr("points")+"z"},deflt:function(a){a=a.node.getBBox();return s(a.x,a.y,a.width,a.height)}};a.path.toRelative=function(b){var e=A(b),h=String.prototype.toLowerCase;if(e.rel)return d(e.rel);
a.is(b,"array")&&a.is(b&&b[0],"array")||(b=a.parsePathString(b));var f=[],l=0,n=0,k=0,p=0,s=0;"M"==b[0][0]&&(l=b[0][1],n=b[0][2],k=l,p=n,s++,f.push(["M",l,n]));for(var r=b.length;s<r;s++){var q=f[s]=[],x=b[s];if(x[0]!=h.call(x[0]))switch(q[0]=h.call(x[0]),q[0]){case "a":q[1]=x[1];q[2]=x[2];q[3]=x[3];q[4]=x[4];q[5]=x[5];q[6]=+(x[6]-l).toFixed(3);q[7]=+(x[7]-n).toFixed(3);break;case "v":q[1]=+(x[1]-n).toFixed(3);break;case "m":k=x[1],p=x[2];default:for(var c=1,t=x.length;c<t;c++)q[c]=+(x[c]-(c%2?l:
n)).toFixed(3)}else for(f[s]=[],"m"==x[0]&&(k=x[1]+l,p=x[2]+n),q=0,c=x.length;q<c;q++)f[s][q]=x[q];x=f[s].length;switch(f[s][0]){case "z":l=k;n=p;break;case "h":l+=+f[s][x-1];break;case "v":n+=+f[s][x-1];break;default:l+=+f[s][x-2],n+=+f[s][x-1]}}f.toString=z;e.rel=d(f);return f};a.path.toAbsolute=G;a.path.toCubic=I;a.path.map=function(a,b){if(!b)return a;var d,e,h,f,l,n,k;a=I(a);h=0;for(l=a.length;h<l;h++)for(k=a[h],f=1,n=k.length;f<n;f+=2)d=b.x(k[f],k[f+1]),e=b.y(k[f],k[f+1]),k[f]=d,k[f+1]=e;return a};
a.path.toString=z;a.path.clone=d});C.plugin(function(a,v,y,C){var A=Math.max,w=Math.min,z=function(a){this.items=[];this.bindings={};this.length=0;this.type="set";if(a)for(var f=0,n=a.length;f<n;f++)a[f]&&(this[this.items.length]=this.items[this.items.length]=a[f],this.length++)};v=z.prototype;v.push=function(){for(var a,f,n=0,k=arguments.length;n<k;n++)if(a=arguments[n])f=this.items.length,this[f]=this.items[f]=a,this.length++;return this};v.pop=function(){this.length&&delete this[this.length--];
return this.items.pop()};v.forEach=function(a,f){for(var n=0,k=this.items.length;n<k&&!1!==a.call(f,this.items[n],n);n++);return this};v.animate=function(d,f,n,u){"function"!=typeof n||n.length||(u=n,n=L.linear);d instanceof a._.Animation&&(u=d.callback,n=d.easing,f=n.dur,d=d.attr);var p=arguments;if(a.is(d,"array")&&a.is(p[p.length-1],"array"))var b=!0;var q,e=function(){q?this.b=q:q=this.b},l=0,r=u&&function(){l++==this.length&&u.call(this)};return this.forEach(function(a,l){k.once("snap.animcreated."+
a.id,e);b?p[l]&&a.animate.apply(a,p[l]):a.animate(d,f,n,r)})};v.remove=function(){for(;this.length;)this.pop().remove();return this};v.bind=function(a,f,k){var u={};if("function"==typeof f)this.bindings[a]=f;else{var p=k||a;this.bindings[a]=function(a){u[p]=a;f.attr(u)}}return this};v.attr=function(a){var f={},k;for(k in a)if(this.bindings[k])this.bindings[k](a[k]);else f[k]=a[k];a=0;for(k=this.items.length;a<k;a++)this.items[a].attr(f);return this};v.clear=function(){for(;this.length;)this.pop()};
v.splice=function(a,f,k){a=0>a?A(this.length+a,0):a;f=A(0,w(this.length-a,f));var u=[],p=[],b=[],q;for(q=2;q<arguments.length;q++)b.push(arguments[q]);for(q=0;q<f;q++)p.push(this[a+q]);for(;q<this.length-a;q++)u.push(this[a+q]);var e=b.length;for(q=0;q<e+u.length;q++)this.items[a+q]=this[a+q]=q<e?b[q]:u[q-e];for(q=this.items.length=this.length-=f-e;this[q];)delete this[q++];return new z(p)};v.exclude=function(a){for(var f=0,k=this.length;f<k;f++)if(this[f]==a)return this.splice(f,1),!0;return!1};
v.insertAfter=function(a){for(var f=this.items.length;f--;)this.items[f].insertAfter(a);return this};v.getBBox=function(){for(var a=[],f=[],k=[],u=[],p=this.items.length;p--;)if(!this.items[p].removed){var b=this.items[p].getBBox();a.push(b.x);f.push(b.y);k.push(b.x+b.width);u.push(b.y+b.height)}a=w.apply(0,a);f=w.apply(0,f);k=A.apply(0,k);u=A.apply(0,u);return{x:a,y:f,x2:k,y2:u,width:k-a,height:u-f,cx:a+(k-a)/2,cy:f+(u-f)/2}};v.clone=function(a){a=new z;for(var f=0,k=this.items.length;f<k;f++)a.push(this.items[f].clone());
return a};v.toString=function(){return"Snap\u2018s set"};v.type="set";a.set=function(){var a=new z;arguments.length&&a.push.apply(a,Array.prototype.slice.call(arguments,0));return a}});C.plugin(function(a,v,y,C){function A(a){var b=a[0];switch(b.toLowerCase()){case "t":return[b,0,0];case "m":return[b,1,0,0,1,0,0];case "r":return 4==a.length?[b,0,a[2],a[3] ]:[b,0];case "s":return 5==a.length?[b,1,1,a[3],a[4] ]:3==a.length?[b,1,1]:[b,1]}}function w(b,d,f){d=q(d).replace(/\.{3}|\u2026/g,b);b=a.parseTransformString(b)||
[];d=a.parseTransformString(d)||[];for(var k=Math.max(b.length,d.length),p=[],v=[],h=0,w,z,y,I;h<k;h++){y=b[h]||A(d[h]);I=d[h]||A(y);if(y[0]!=I[0]||"r"==y[0].toLowerCase()&&(y[2]!=I[2]||y[3]!=I[3])||"s"==y[0].toLowerCase()&&(y[3]!=I[3]||y[4]!=I[4])){b=a._.transform2matrix(b,f());d=a._.transform2matrix(d,f());p=[["m",b.a,b.b,b.c,b.d,b.e,b.f] ];v=[["m",d.a,d.b,d.c,d.d,d.e,d.f] ];break}p[h]=[];v[h]=[];w=0;for(z=Math.max(y.length,I.length);w<z;w++)w in y&&(p[h][w]=y[w]),w in I&&(v[h][w]=I[w])}return{from:u(p),
to:u(v),f:n(p)}}function z(a){return a}function d(a){return function(b){return+b.toFixed(3)+a}}function f(b){return a.rgb(b[0],b[1],b[2])}function n(a){var b=0,d,f,k,n,h,p,q=[];d=0;for(f=a.length;d<f;d++){h="[";p=['"'+a[d][0]+'"'];k=1;for(n=a[d].length;k<n;k++)p[k]="val["+b++ +"]";h+=p+"]";q[d]=h}return Function("val","return Snap.path.toString.call(["+q+"])")}function u(a){for(var b=[],d=0,f=a.length;d<f;d++)for(var k=1,n=a[d].length;k<n;k++)b.push(a[d][k]);return b}var p={},b=/[a-z]+$/i,q=String;
p.stroke=p.fill="colour";v.prototype.equal=function(a,b){return k("snap.util.equal",this,a,b).firstDefined()};k.on("snap.util.equal",function(e,k){var r,s;r=q(this.attr(e)||"");var x=this;if(r==+r&&k==+k)return{from:+r,to:+k,f:z};if("colour"==p[e])return r=a.color(r),s=a.color(k),{from:[r.r,r.g,r.b,r.opacity],to:[s.r,s.g,s.b,s.opacity],f:f};if("transform"==e||"gradientTransform"==e||"patternTransform"==e)return k instanceof a.Matrix&&(k=k.toTransformString()),a._.rgTransform.test(k)||(k=a._.svgTransform2string(k)),
w(r,k,function(){return x.getBBox(1)});if("d"==e||"path"==e)return r=a.path.toCubic(r,k),{from:u(r[0]),to:u(r[1]),f:n(r[0])};if("points"==e)return r=q(r).split(a._.separator),s=q(k).split(a._.separator),{from:r,to:s,f:function(a){return a}};aUnit=r.match(b);s=q(k).match(b);return aUnit&&aUnit==s?{from:parseFloat(r),to:parseFloat(k),f:d(aUnit)}:{from:this.asPX(e),to:this.asPX(e,k),f:z}})});C.plugin(function(a,v,y,C){var A=v.prototype,w="createTouch"in C.doc;v="click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend touchcancel".split(" ");
var z={mousedown:"touchstart",mousemove:"touchmove",mouseup:"touchend"},d=function(a,b){var d="y"==a?"scrollTop":"scrollLeft",e=b&&b.node?b.node.ownerDocument:C.doc;return e[d in e.documentElement?"documentElement":"body"][d]},f=function(){this.returnValue=!1},n=function(){return this.originalEvent.preventDefault()},u=function(){this.cancelBubble=!0},p=function(){return this.originalEvent.stopPropagation()},b=function(){if(C.doc.addEventListener)return function(a,b,e,f){var k=w&&z[b]?z[b]:b,l=function(k){var l=
d("y",f),q=d("x",f);if(w&&z.hasOwnProperty(b))for(var r=0,u=k.targetTouches&&k.targetTouches.length;r<u;r++)if(k.targetTouches[r].target==a||a.contains(k.targetTouches[r].target)){u=k;k=k.targetTouches[r];k.originalEvent=u;k.preventDefault=n;k.stopPropagation=p;break}return e.call(f,k,k.clientX+q,k.clientY+l)};b!==k&&a.addEventListener(b,l,!1);a.addEventListener(k,l,!1);return function(){b!==k&&a.removeEventListener(b,l,!1);a.removeEventListener(k,l,!1);return!0}};if(C.doc.attachEvent)return function(a,
b,e,h){var k=function(a){a=a||h.node.ownerDocument.window.event;var b=d("y",h),k=d("x",h),k=a.clientX+k,b=a.clientY+b;a.preventDefault=a.preventDefault||f;a.stopPropagation=a.stopPropagation||u;return e.call(h,a,k,b)};a.attachEvent("on"+b,k);return function(){a.detachEvent("on"+b,k);return!0}}}(),q=[],e=function(a){for(var b=a.clientX,e=a.clientY,f=d("y"),l=d("x"),n,p=q.length;p--;){n=q[p];if(w)for(var r=a.touches&&a.touches.length,u;r--;){if(u=a.touches[r],u.identifier==n.el._drag.id||n.el.node.contains(u.target)){b=
u.clientX;e=u.clientY;(a.originalEvent?a.originalEvent:a).preventDefault();break}}else a.preventDefault();b+=l;e+=f;k("snap.drag.move."+n.el.id,n.move_scope||n.el,b-n.el._drag.x,e-n.el._drag.y,b,e,a)}},l=function(b){a.unmousemove(e).unmouseup(l);for(var d=q.length,f;d--;)f=q[d],f.el._drag={},k("snap.drag.end."+f.el.id,f.end_scope||f.start_scope||f.move_scope||f.el,b);q=[]};for(y=v.length;y--;)(function(d){a[d]=A[d]=function(e,f){a.is(e,"function")&&(this.events=this.events||[],this.events.push({name:d,
f:e,unbind:b(this.node||document,d,e,f||this)}));return this};a["un"+d]=A["un"+d]=function(a){for(var b=this.events||[],e=b.length;e--;)if(b[e].name==d&&(b[e].f==a||!a)){b[e].unbind();b.splice(e,1);!b.length&&delete this.events;break}return this}})(v[y]);A.hover=function(a,b,d,e){return this.mouseover(a,d).mouseout(b,e||d)};A.unhover=function(a,b){return this.unmouseover(a).unmouseout(b)};var r=[];A.drag=function(b,d,f,h,n,p){function u(r,v,w){(r.originalEvent||r).preventDefault();this._drag.x=v;
this._drag.y=w;this._drag.id=r.identifier;!q.length&&a.mousemove(e).mouseup(l);q.push({el:this,move_scope:h,start_scope:n,end_scope:p});d&&k.on("snap.drag.start."+this.id,d);b&&k.on("snap.drag.move."+this.id,b);f&&k.on("snap.drag.end."+this.id,f);k("snap.drag.start."+this.id,n||h||this,v,w,r)}if(!arguments.length){var v;return this.drag(function(a,b){this.attr({transform:v+(v?"T":"t")+[a,b]})},function(){v=this.transform().local})}this._drag={};r.push({el:this,start:u});this.mousedown(u);return this};
A.undrag=function(){for(var b=r.length;b--;)r[b].el==this&&(this.unmousedown(r[b].start),r.splice(b,1),k.unbind("snap.drag.*."+this.id));!r.length&&a.unmousemove(e).unmouseup(l);return this}});C.plugin(function(a,v,y,C){y=y.prototype;var A=/^\s*url\((.+)\)/,w=String,z=a._.$;a.filter={};y.filter=function(d){var f=this;"svg"!=f.type&&(f=f.paper);d=a.parse(w(d));var k=a._.id(),u=z("filter");z(u,{id:k,filterUnits:"userSpaceOnUse"});u.appendChild(d.node);f.defs.appendChild(u);return new v(u)};k.on("snap.util.getattr.filter",
function(){k.stop();var d=z(this.node,"filter");if(d)return(d=w(d).match(A))&&a.select(d[1])});k.on("snap.util.attr.filter",function(d){if(d instanceof v&&"filter"==d.type){k.stop();var f=d.node.id;f||(z(d.node,{id:d.id}),f=d.id);z(this.node,{filter:a.url(f)})}d&&"none"!=d||(k.stop(),this.node.removeAttribute("filter"))});a.filter.blur=function(d,f){null==d&&(d=2);return a.format('<feGaussianBlur stdDeviation="{def}"/>',{def:null==f?d:[d,f]})};a.filter.blur.toString=function(){return this()};a.filter.shadow=
function(d,f,k,u,p){"string"==typeof k&&(p=u=k,k=4);"string"!=typeof u&&(p=u,u="#000");null==k&&(k=4);null==p&&(p=1);null==d&&(d=0,f=2);null==f&&(f=d);u=a.color(u||"#000");return a.format('<feGaussianBlur in="SourceAlpha" stdDeviation="{blur}"/><feOffset dx="{dx}" dy="{dy}" result="offsetblur"/><feFlood flood-color="{color}"/><feComposite in2="offsetblur" operator="in"/><feComponentTransfer><feFuncA type="linear" slope="{opacity}"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>',
{color:u,dx:d,dy:f,blur:k,opacity:p})};a.filter.shadow.toString=function(){return this()};a.filter.grayscale=function(d){null==d&&(d=1);return a.format('<feColorMatrix type="matrix" values="{a} {b} {c} 0 0 {d} {e} {f} 0 0 {g} {b} {h} 0 0 0 0 0 1 0"/>',{a:0.2126+0.7874*(1-d),b:0.7152-0.7152*(1-d),c:0.0722-0.0722*(1-d),d:0.2126-0.2126*(1-d),e:0.7152+0.2848*(1-d),f:0.0722-0.0722*(1-d),g:0.2126-0.2126*(1-d),h:0.0722+0.9278*(1-d)})};a.filter.grayscale.toString=function(){return this()};a.filter.sepia=
function(d){null==d&&(d=1);return a.format('<feColorMatrix type="matrix" values="{a} {b} {c} 0 0 {d} {e} {f} 0 0 {g} {h} {i} 0 0 0 0 0 1 0"/>',{a:0.393+0.607*(1-d),b:0.769-0.769*(1-d),c:0.189-0.189*(1-d),d:0.349-0.349*(1-d),e:0.686+0.314*(1-d),f:0.168-0.168*(1-d),g:0.272-0.272*(1-d),h:0.534-0.534*(1-d),i:0.131+0.869*(1-d)})};a.filter.sepia.toString=function(){return this()};a.filter.saturate=function(d){null==d&&(d=1);return a.format('<feColorMatrix type="saturate" values="{amount}"/>',{amount:1-
d})};a.filter.saturate.toString=function(){return this()};a.filter.hueRotate=function(d){return a.format('<feColorMatrix type="hueRotate" values="{angle}"/>',{angle:d||0})};a.filter.hueRotate.toString=function(){return this()};a.filter.invert=function(d){null==d&&(d=1);return a.format('<feComponentTransfer><feFuncR type="table" tableValues="{amount} {amount2}"/><feFuncG type="table" tableValues="{amount} {amount2}"/><feFuncB type="table" tableValues="{amount} {amount2}"/></feComponentTransfer>',{amount:d,
amount2:1-d})};a.filter.invert.toString=function(){return this()};a.filter.brightness=function(d){null==d&&(d=1);return a.format('<feComponentTransfer><feFuncR type="linear" slope="{amount}"/><feFuncG type="linear" slope="{amount}"/><feFuncB type="linear" slope="{amount}"/></feComponentTransfer>',{amount:d})};a.filter.brightness.toString=function(){return this()};a.filter.contrast=function(d){null==d&&(d=1);return a.format('<feComponentTransfer><feFuncR type="linear" slope="{amount}" intercept="{amount2}"/><feFuncG type="linear" slope="{amount}" intercept="{amount2}"/><feFuncB type="linear" slope="{amount}" intercept="{amount2}"/></feComponentTransfer>',
{amount:d,amount2:0.5-d/2})};a.filter.contrast.toString=function(){return this()}});return C});

]]> </script>
<script> <![CDATA[

(function (glob, factory) {
    // AMD support
    if (typeof define === "function" && define.amd) {
        // Define as an anonymous module
        define("Gadfly", ["Snap.svg"], function (Snap) {
            return factory(Snap);
        });
    } else {
        // Browser globals (glob is window)
        // Snap adds itself to window
        glob.Gadfly = factory(glob.Snap);
    }
}(this, function (Snap) {

var Gadfly = {};

// Get an x/y coordinate value in pixels
var xPX = function(fig, x) {
    var client_box = fig.node.getBoundingClientRect();
    return x * fig.node.viewBox.baseVal.width / client_box.width;
};

var yPX = function(fig, y) {
    var client_box = fig.node.getBoundingClientRect();
    return y * fig.node.viewBox.baseVal.height / client_box.height;
};


Snap.plugin(function (Snap, Element, Paper, global) {
    // Traverse upwards from a snap element to find and return the first
    // note with the "plotroot" class.
    Element.prototype.plotroot = function () {
        var element = this;
        while (!element.hasClass("plotroot") && element.parent() != null) {
            element = element.parent();
        }
        return element;
    };

    Element.prototype.svgroot = function () {
        var element = this;
        while (element.node.nodeName != "svg" && element.parent() != null) {
            element = element.parent();
        }
        return element;
    };

    Element.prototype.plotbounds = function () {
        var root = this.plotroot()
        var bbox = root.select(".guide.background").node.getBBox();
        return {
            x0: bbox.x,
            x1: bbox.x + bbox.width,
            y0: bbox.y,
            y1: bbox.y + bbox.height
        };
    };

    Element.prototype.plotcenter = function () {
        var root = this.plotroot()
        var bbox = root.select(".guide.background").node.getBBox();
        return {
            x: bbox.x + bbox.width / 2,
            y: bbox.y + bbox.height / 2
        };
    };

    // Emulate IE style mouseenter/mouseleave events, since Microsoft always
    // does everything right.
    // See: http://www.dynamic-tools.net/toolbox/isMouseLeaveOrEnter/
    var events = ["mouseenter", "mouseleave"];

    for (i in events) {
        (function (event_name) {
            var event_name = events[i];
            Element.prototype[event_name] = function (fn, scope) {
                if (Snap.is(fn, "function")) {
                    var fn2 = function (event) {
                        if (event.type != "mouseover" && event.type != "mouseout") {
                            return;
                        }

                        var reltg = event.relatedTarget ? event.relatedTarget :
                            event.type == "mouseout" ? event.toElement : event.fromElement;
                        while (reltg && reltg != this.node) reltg = reltg.parentNode;

                        if (reltg != this.node) {
                            return fn.apply(this, event);
                        }
                    };

                    if (event_name == "mouseenter") {
                        this.mouseover(fn2, scope);
                    } else {
                        this.mouseout(fn2, scope);
                    }
                }
                return this;
            };
        })(events[i]);
    }


    Element.prototype.mousewheel = function (fn, scope) {
        if (Snap.is(fn, "function")) {
            var el = this;
            var fn2 = function (event) {
                fn.apply(el, [event]);
            };
        }

        this.node.addEventListener(
            /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel",
            fn2);

        return this;
    };


    // Snap's attr function can be too slow for things like panning/zooming.
    // This is a function to directly update element attributes without going
    // through eve.
    Element.prototype.attribute = function(key, val) {
        if (val === undefined) {
            return this.node.getAttribute(key);
        } else {
            this.node.setAttribute(key, val);
            return this;
        }
    };

    Element.prototype.init_gadfly = function() {
        this.mouseenter(Gadfly.plot_mouseover)
            .mouseleave(Gadfly.plot_mouseout)
            .dblclick(Gadfly.plot_dblclick)
            .mousewheel(Gadfly.guide_background_scroll)
            .drag(Gadfly.guide_background_drag_onmove,
                  Gadfly.guide_background_drag_onstart,
                  Gadfly.guide_background_drag_onend);
        this.mouseenter(function (event) {
            init_pan_zoom(this.plotroot());
        });
        return this;
    };
});


// When the plot is moused over, emphasize the grid lines.
Gadfly.plot_mouseover = function(event) {
    var root = this.plotroot();

    var keyboard_zoom = function(event) {
        if (event.which == 187) { // plus
            increase_zoom_by_position(root, 0.1, true);
        } else if (event.which == 189) { // minus
            increase_zoom_by_position(root, -0.1, true);
        }
    };
    root.data("keyboard_zoom", keyboard_zoom);
    window.addEventListener("keyup", keyboard_zoom);

    var xgridlines = root.select(".xgridlines"),
        ygridlines = root.select(".ygridlines");

    xgridlines.data("unfocused_strokedash",
                    xgridlines.attribute("stroke-dasharray").replace(/(\d)(,|$)/g, "$1mm$2"));
    ygridlines.data("unfocused_strokedash",
                    ygridlines.attribute("stroke-dasharray").replace(/(\d)(,|$)/g, "$1mm$2"));

    // emphasize grid lines
    var destcolor = root.data("focused_xgrid_color");
    xgridlines.attribute("stroke-dasharray", "none")
              .selectAll("path")
              .animate({stroke: destcolor}, 250);

    destcolor = root.data("focused_ygrid_color");
    ygridlines.attribute("stroke-dasharray", "none")
              .selectAll("path")
              .animate({stroke: destcolor}, 250);

    // reveal zoom slider
    root.select(".zoomslider")
        .animate({opacity: 1.0}, 250);
};

// Reset pan and zoom on double click
Gadfly.plot_dblclick = function(event) {
  set_plot_pan_zoom(this.plotroot(), 0.0, 0.0, 1.0);
};

// Unemphasize grid lines on mouse out.
Gadfly.plot_mouseout = function(event) {
    var root = this.plotroot();

    window.removeEventListener("keyup", root.data("keyboard_zoom"));
    root.data("keyboard_zoom", undefined);

    var xgridlines = root.select(".xgridlines"),
        ygridlines = root.select(".ygridlines");

    var destcolor = root.data("unfocused_xgrid_color");

    xgridlines.attribute("stroke-dasharray", xgridlines.data("unfocused_strokedash"))
              .selectAll("path")
              .animate({stroke: destcolor}, 250);

    destcolor = root.data("unfocused_ygrid_color");
    ygridlines.attribute("stroke-dasharray", ygridlines.data("unfocused_strokedash"))
              .selectAll("path")
              .animate({stroke: destcolor}, 250);

    // hide zoom slider
    root.select(".zoomslider")
        .animate({opacity: 0.0}, 250);
};


var set_geometry_transform = function(root, tx, ty, scale) {
    var xscalable = root.hasClass("xscalable"),
        yscalable = root.hasClass("yscalable");

    var old_scale = root.data("scale");

    var xscale = xscalable ? scale : 1.0,
        yscale = yscalable ? scale : 1.0;

    tx = xscalable ? tx : 0.0;
    ty = yscalable ? ty : 0.0;

    var t = new Snap.Matrix().translate(tx, ty).scale(xscale, yscale);

    root.selectAll(".geometry, image")
        .forEach(function (element, i) {
            element.transform(t);
        });

    bounds = root.plotbounds();

    if (yscalable) {
        var xfixed_t = new Snap.Matrix().translate(0, ty).scale(1.0, yscale);
        root.selectAll(".xfixed")
            .forEach(function (element, i) {
                element.transform(xfixed_t);
            });

        root.select(".ylabels")
            .transform(xfixed_t)
            .selectAll("text")
            .forEach(function (element, i) {
                if (element.attribute("gadfly:inscale") == "true") {
                    var cx = element.asPX("x"),
                        cy = element.asPX("y");
                    var st = element.data("static_transform");
                    unscale_t = new Snap.Matrix();
                    unscale_t.scale(1, 1/scale, cx, cy).add(st);
                    element.transform(unscale_t);

                    var y = cy * scale + ty;
                    element.attr("visibility",
                        bounds.y0 <= y && y <= bounds.y1 ? "visible" : "hidden");
                }
            });
    }

    if (xscalable) {
        var yfixed_t = new Snap.Matrix().translate(tx, 0).scale(xscale, 1.0);
        var xtrans = new Snap.Matrix().translate(tx, 0);
        root.selectAll(".yfixed")
            .forEach(function (element, i) {
                element.transform(yfixed_t);
            });

        root.select(".xlabels")
            .transform(yfixed_t)
            .selectAll("text")
            .forEach(function (element, i) {
                if (element.attribute("gadfly:inscale") == "true") {
                    var cx = element.asPX("x"),
                        cy = element.asPX("y");
                    var st = element.data("static_transform");
                    unscale_t = new Snap.Matrix();
                    unscale_t.scale(1/scale, 1, cx, cy).add(st);

                    element.transform(unscale_t);

                    var x = cx * scale + tx;
                    element.attr("visibility",
                        bounds.x0 <= x && x <= bounds.x1 ? "visible" : "hidden");
                    }
            });
    }

    // we must unscale anything that is scale invariance: widths, raiduses, etc.
    var size_attribs = ["font-size"];
    var unscaled_selection = ".geometry, .geometry *";
    if (xscalable) {
        size_attribs.push("rx");
        unscaled_selection += ", .xgridlines";
    }
    if (yscalable) {
        size_attribs.push("ry");
        unscaled_selection += ", .ygridlines";
    }

    root.selectAll(unscaled_selection)
        .forEach(function (element, i) {
            // circle need special help
            if (element.node.nodeName == "circle") {
                var cx = element.attribute("cx"),
                    cy = element.attribute("cy");
                unscale_t = new Snap.Matrix().scale(1/xscale, 1/yscale,
                                                        cx, cy);
                element.transform(unscale_t);
                return;
            }

            for (i in size_attribs) {
                var key = size_attribs[i];
                var val = parseFloat(element.attribute(key));
                if (val !== undefined && val != 0 && !isNaN(val)) {
                    element.attribute(key, val * old_scale / scale);
                }
            }
        });
};


// Find the most appropriate tick scale and update label visibility.
var update_tickscale = function(root, scale, axis) {
    if (!root.hasClass(axis + "scalable")) return;

    var tickscales = root.data(axis + "tickscales");
    var best_tickscale = 1.0;
    var best_tickscale_dist = Infinity;
    for (tickscale in tickscales) {
        var dist = Math.abs(Math.log(tickscale) - Math.log(scale));
        if (dist < best_tickscale_dist) {
            best_tickscale_dist = dist;
            best_tickscale = tickscale;
        }
    }

    if (best_tickscale != root.data(axis + "tickscale")) {
        root.data(axis + "tickscale", best_tickscale);
        var mark_inscale_gridlines = function (element, i) {
            var inscale = element.attr("gadfly:scale") == best_tickscale;
            element.attribute("gadfly:inscale", inscale);
            element.attr("visibility", inscale ? "visible" : "hidden");
        };

        var mark_inscale_labels = function (element, i) {
            var inscale = element.attr("gadfly:scale") == best_tickscale;
            element.attribute("gadfly:inscale", inscale);
            element.attr("visibility", inscale ? "visible" : "hidden");
        };

        root.select("." + axis + "gridlines").selectAll("path").forEach(mark_inscale_gridlines);
        root.select("." + axis + "labels").selectAll("text").forEach(mark_inscale_labels);
    }
};


var set_plot_pan_zoom = function(root, tx, ty, scale) {
    var old_scale = root.data("scale");
    var bounds = root.plotbounds();

    var width = bounds.x1 - bounds.x0,
        height = bounds.y1 - bounds.y0;

    // compute the viewport derived from tx, ty, and scale
    var x_min = -width * scale - (scale * width - width),
        x_max = width * scale,
        y_min = -height * scale - (scale * height - height),
        y_max = height * scale;

    var x0 = bounds.x0 - scale * bounds.x0,
        y0 = bounds.y0 - scale * bounds.y0;

    var tx = Math.max(Math.min(tx - x0, x_max), x_min),
        ty = Math.max(Math.min(ty - y0, y_max), y_min);

    tx += x0;
    ty += y0;

    // when the scale change, we may need to alter which set of
    // ticks is being displayed
    if (scale != old_scale) {
        update_tickscale(root, scale, "x");
        update_tickscale(root, scale, "y");
    }

    set_geometry_transform(root, tx, ty, scale);

    root.data("scale", scale);
    root.data("tx", tx);
    root.data("ty", ty);
};


var scale_centered_translation = function(root, scale) {
    var bounds = root.plotbounds();

    var width = bounds.x1 - bounds.x0,
        height = bounds.y1 - bounds.y0;

    var tx0 = root.data("tx"),
        ty0 = root.data("ty");

    var scale0 = root.data("scale");

    // how off from center the current view is
    var xoff = tx0 - (bounds.x0 * (1 - scale0) + (width * (1 - scale0)) / 2),
        yoff = ty0 - (bounds.y0 * (1 - scale0) + (height * (1 - scale0)) / 2);

    // rescale offsets
    xoff = xoff * scale / scale0;
    yoff = yoff * scale / scale0;

    // adjust for the panel position being scaled
    var x_edge_adjust = bounds.x0 * (1 - scale),
        y_edge_adjust = bounds.y0 * (1 - scale);

    return {
        x: xoff + x_edge_adjust + (width - width * scale) / 2,
        y: yoff + y_edge_adjust + (height - height * scale) / 2
    };
};


// Initialize data for panning zooming if it isn't already.
var init_pan_zoom = function(root) {
    if (root.data("zoompan-ready")) {
        return;
    }

    // The non-scaling-stroke trick. Rather than try to correct for the
    // stroke-width when zooming, we force it to a fixed value.
    var px_per_mm = root.node.getCTM().a;

    // Drag events report deltas in pixels, which we'd like to convert to
    // millimeters.
    root.data("px_per_mm", px_per_mm);

    root.selectAll("path")
        .forEach(function (element, i) {
        sw = element.asPX("stroke-width") * px_per_mm;
        if (sw > 0) {
            element.attribute("stroke-width", sw);
            element.attribute("vector-effect", "non-scaling-stroke");
        }
    });

    // Store ticks labels original tranformation
    root.selectAll(".xlabels > text, .ylabels > text")
        .forEach(function (element, i) {
            var lm = element.transform().localMatrix;
            element.data("static_transform",
                new Snap.Matrix(lm.a, lm.b, lm.c, lm.d, lm.e, lm.f));
        });

    var xgridlines = root.select(".xgridlines");
    var ygridlines = root.select(".ygridlines");
    var xlabels = root.select(".xlabels");
    var ylabels = root.select(".ylabels");

    if (root.data("tx") === undefined) root.data("tx", 0);
    if (root.data("ty") === undefined) root.data("ty", 0);
    if (root.data("scale") === undefined) root.data("scale", 1.0);
    if (root.data("xtickscales") === undefined) {

        // index all the tick scales that are listed
        var xtickscales = {};
        var ytickscales = {};
        var add_x_tick_scales = function (element, i) {
            xtickscales[element.attribute("gadfly:scale")] = true;
        };
        var add_y_tick_scales = function (element, i) {
            ytickscales[element.attribute("gadfly:scale")] = true;
        };

        if (xgridlines) xgridlines.selectAll("path").forEach(add_x_tick_scales);
        if (ygridlines) ygridlines.selectAll("path").forEach(add_y_tick_scales);
        if (xlabels) xlabels.selectAll("text").forEach(add_x_tick_scales);
        if (ylabels) ylabels.selectAll("text").forEach(add_y_tick_scales);

        root.data("xtickscales", xtickscales);
        root.data("ytickscales", ytickscales);
        root.data("xtickscale", 1.0);
    }

    var min_scale = 1.0, max_scale = 1.0;
    for (scale in xtickscales) {
        min_scale = Math.min(min_scale, scale);
        max_scale = Math.max(max_scale, scale);
    }
    for (scale in ytickscales) {
        min_scale = Math.min(min_scale, scale);
        max_scale = Math.max(max_scale, scale);
    }
    root.data("min_scale", min_scale);
    root.data("max_scale", max_scale);

    // store the original positions of labels
    if (xlabels) {
        xlabels.selectAll("text")
               .forEach(function (element, i) {
                   element.data("x", element.asPX("x"));
               });
    }

    if (ylabels) {
        ylabels.selectAll("text")
               .forEach(function (element, i) {
                   element.data("y", element.asPX("y"));
               });
    }

    // mark grid lines and ticks as in or out of scale.
    var mark_inscale = function (element, i) {
        element.attribute("gadfly:inscale", element.attribute("gadfly:scale") == 1.0);
    };

    if (xgridlines) xgridlines.selectAll("path").forEach(mark_inscale);
    if (ygridlines) ygridlines.selectAll("path").forEach(mark_inscale);
    if (xlabels) xlabels.selectAll("text").forEach(mark_inscale);
    if (ylabels) ylabels.selectAll("text").forEach(mark_inscale);

    // figure out the upper ond lower bounds on panning using the maximum
    // and minum grid lines
    var bounds = root.plotbounds();
    var pan_bounds = {
        x0: 0.0,
        y0: 0.0,
        x1: 0.0,
        y1: 0.0
    };

    if (xgridlines) {
        xgridlines
            .selectAll("path")
            .forEach(function (element, i) {
                if (element.attribute("gadfly:inscale") == "true") {
                    var bbox = element.node.getBBox();
                    if (bounds.x1 - bbox.x < pan_bounds.x0) {
                        pan_bounds.x0 = bounds.x1 - bbox.x;
                    }
                    if (bounds.x0 - bbox.x > pan_bounds.x1) {
                        pan_bounds.x1 = bounds.x0 - bbox.x;
                    }
                    element.attr("visibility", "visible");
                }
            });
    }

    if (ygridlines) {
        ygridlines
            .selectAll("path")
            .forEach(function (element, i) {
                if (element.attribute("gadfly:inscale") == "true") {
                    var bbox = element.node.getBBox();
                    if (bounds.y1 - bbox.y < pan_bounds.y0) {
                        pan_bounds.y0 = bounds.y1 - bbox.y;
                    }
                    if (bounds.y0 - bbox.y > pan_bounds.y1) {
                        pan_bounds.y1 = bounds.y0 - bbox.y;
                    }
                    element.attr("visibility", "visible");
                }
            });
    }

    // nudge these values a little
    pan_bounds.x0 -= 5;
    pan_bounds.x1 += 5;
    pan_bounds.y0 -= 5;
    pan_bounds.y1 += 5;
    root.data("pan_bounds", pan_bounds);

    root.data("zoompan-ready", true)
};


// drag actions, i.e. zooming and panning
var pan_action = {
    start: function(root, x, y, event) {
        root.data("dx", 0);
        root.data("dy", 0);
        root.data("tx0", root.data("tx"));
        root.data("ty0", root.data("ty"));
    },
    update: function(root, dx, dy, x, y, event) {
        var px_per_mm = root.data("px_per_mm");
        dx /= px_per_mm;
        dy /= px_per_mm;

        var tx0 = root.data("tx"),
            ty0 = root.data("ty");

        var dx0 = root.data("dx"),
            dy0 = root.data("dy");

        root.data("dx", dx);
        root.data("dy", dy);

        dx = dx - dx0;
        dy = dy - dy0;

        var tx = tx0 + dx,
            ty = ty0 + dy;

        set_plot_pan_zoom(root, tx, ty, root.data("scale"));
    },
    end: function(root, event) {

    },
    cancel: function(root) {
        set_plot_pan_zoom(root, root.data("tx0"), root.data("ty0"), root.data("scale"));
    }
};

var zoom_box;
var zoom_action = {
    start: function(root, x, y, event) {
        var bounds = root.plotbounds();
        var width = bounds.x1 - bounds.x0,
            height = bounds.y1 - bounds.y0;
        var ratio = width / height;
        var xscalable = root.hasClass("xscalable"),
            yscalable = root.hasClass("yscalable");
        var px_per_mm = root.data("px_per_mm");
        x = xscalable ? x / px_per_mm : bounds.x0;
        y = yscalable ? y / px_per_mm : bounds.y0;
        var w = xscalable ? 0 : width;
        var h = yscalable ? 0 : height;
        zoom_box = root.rect(x, y, w, h).attr({
            "fill": "#000",
            "opacity": 0.25
        });
        zoom_box.data("ratio", ratio);
    },
    update: function(root, dx, dy, x, y, event) {
        var xscalable = root.hasClass("xscalable"),
            yscalable = root.hasClass("yscalable");
        var px_per_mm = root.data("px_per_mm");
        var bounds = root.plotbounds();
        if (yscalable) {
            y /= px_per_mm;
            y = Math.max(bounds.y0, y);
            y = Math.min(bounds.y1, y);
        } else {
            y = bounds.y1;
        }
        if (xscalable) {
            x /= px_per_mm;
            x = Math.max(bounds.x0, x);
            x = Math.min(bounds.x1, x);
        } else {
            x = bounds.x1;
        }

        dx = x - zoom_box.attr("x");
        dy = y - zoom_box.attr("y");
        if (xscalable && yscalable) {
            var ratio = zoom_box.data("ratio");
            var width = Math.min(Math.abs(dx), ratio * Math.abs(dy));
            var height = Math.min(Math.abs(dy), Math.abs(dx) / ratio);
            dx = width * dx / Math.abs(dx);
            dy = height * dy / Math.abs(dy);
        }
        var xoffset = 0,
            yoffset = 0;
        if (dx < 0) {
            xoffset = dx;
            dx = -1 * dx;
        }
        if (dy < 0) {
            yoffset = dy;
            dy = -1 * dy;
        }
        if (isNaN(dy)) {
            dy = 0.0;
        }
        if (isNaN(dx)) {
            dx = 0.0;
        }
        zoom_box.transform("T" + xoffset + "," + yoffset);
        zoom_box.attr("width", dx);
        zoom_box.attr("height", dy);
    },
    end: function(root, event) {
        var xscalable = root.hasClass("xscalable"),
            yscalable = root.hasClass("yscalable");
        var zoom_bounds = zoom_box.getBBox();
        if (zoom_bounds.width * zoom_bounds.height <= 0) {
            return;
        }
        var plot_bounds = root.plotbounds();
        var zoom_factor = 1.0;
        if (yscalable) {
            zoom_factor = (plot_bounds.y1 - plot_bounds.y0) / zoom_bounds.height;
        } else {
            zoom_factor = (plot_bounds.x1 - plot_bounds.x0) / zoom_bounds.width;
        }
        var tx = (root.data("tx") - zoom_bounds.x) * zoom_factor + plot_bounds.x0,
            ty = (root.data("ty") - zoom_bounds.y) * zoom_factor + plot_bounds.y0;
        set_plot_pan_zoom(root, tx, ty, root.data("scale") * zoom_factor);
        zoom_box.remove();
    },
    cancel: function(root) {
        zoom_box.remove();
    }
};


Gadfly.guide_background_drag_onstart = function(x, y, event) {
    var root = this.plotroot();
    var scalable = root.hasClass("xscalable") || root.hasClass("yscalable");
    var zoomable = !event.altKey && !event.ctrlKey && event.shiftKey && scalable;
    var panable = !event.altKey && !event.ctrlKey && !event.shiftKey && scalable;
    var drag_action = zoomable ? zoom_action :
                      panable  ? pan_action :
                                 undefined;
    root.data("drag_action", drag_action);
    if (drag_action) {
        var cancel_drag_action = function(event) {
            if (event.which == 27) { // esc key
                drag_action.cancel(root);
                root.data("drag_action", undefined);
            }
        };
        window.addEventListener("keyup", cancel_drag_action);
        root.data("cancel_drag_action", cancel_drag_action);
        drag_action.start(root, x, y, event);
    }
};


Gadfly.guide_background_drag_onmove = function(dx, dy, x, y, event) {
    var root = this.plotroot();
    var drag_action = root.data("drag_action");
    if (drag_action) {
        drag_action.update(root, dx, dy, x, y, event);
    }
};


Gadfly.guide_background_drag_onend = function(event) {
    var root = this.plotroot();
    window.removeEventListener("keyup", root.data("cancel_drag_action"));
    root.data("cancel_drag_action", undefined);
    var drag_action = root.data("drag_action");
    if (drag_action) {
        drag_action.end(root, event);
    }
    root.data("drag_action", undefined);
};


Gadfly.guide_background_scroll = function(event) {
    if (event.shiftKey) {
        increase_zoom_by_position(this.plotroot(), 0.001 * event.wheelDelta);
        event.preventDefault();
    }
};


Gadfly.zoomslider_button_mouseover = function(event) {
    this.select(".button_logo")
         .animate({fill: this.data("mouseover_color")}, 100);
};


Gadfly.zoomslider_button_mouseout = function(event) {
     this.select(".button_logo")
         .animate({fill: this.data("mouseout_color")}, 100);
};


Gadfly.zoomslider_zoomout_click = function(event) {
    increase_zoom_by_position(this.plotroot(), -0.1, true);
};


Gadfly.zoomslider_zoomin_click = function(event) {
    increase_zoom_by_position(this.plotroot(), 0.1, true);
};


Gadfly.zoomslider_track_click = function(event) {
    // TODO
};


// Map slider position x to scale y using the function y = a*exp(b*x)+c.
// The constants a, b, and c are solved using the constraint that the function
// should go through the points (0; min_scale), (0.5; 1), and (1; max_scale).
var scale_from_slider_position = function(position, min_scale, max_scale) {
    var a = (1 - 2 * min_scale + min_scale * min_scale) / (min_scale + max_scale - 2),
        b = 2 * Math.log((max_scale - 1) / (1 - min_scale)),
        c = (min_scale * max_scale - 1) / (min_scale + max_scale - 2);
    return a * Math.exp(b * position) + c;
}

// inverse of scale_from_slider_position
var slider_position_from_scale = function(scale, min_scale, max_scale) {
    var a = (1 - 2 * min_scale + min_scale * min_scale) / (min_scale + max_scale - 2),
        b = 2 * Math.log((max_scale - 1) / (1 - min_scale)),
        c = (min_scale * max_scale - 1) / (min_scale + max_scale - 2);
    return 1 / b * Math.log((scale - c) / a);
}

var increase_zoom_by_position = function(root, delta_position, animate) {
    var scale = root.data("scale"),
        min_scale = root.data("min_scale"),
        max_scale = root.data("max_scale");
    var position = slider_position_from_scale(scale, min_scale, max_scale);
    position += delta_position;
    scale = scale_from_slider_position(position, min_scale, max_scale);
    set_zoom(root, scale, animate);
}

var set_zoom = function(root, scale, animate) {
    var min_scale = root.data("min_scale"),
        max_scale = root.data("max_scale"),
        old_scale = root.data("scale");
    var new_scale = Math.max(min_scale, Math.min(scale, max_scale));
    if (animate) {
        Snap.animate(
            old_scale,
            new_scale,
            function (new_scale) {
                update_plot_scale(root, new_scale);
            },
            200);
    } else {
        update_plot_scale(root, new_scale);
    }
}


var update_plot_scale = function(root, new_scale) {
    var trans = scale_centered_translation(root, new_scale);
    set_plot_pan_zoom(root, trans.x, trans.y, new_scale);

    root.selectAll(".zoomslider_thumb")
        .forEach(function (element, i) {
            var min_pos = element.data("min_pos"),
                max_pos = element.data("max_pos"),
                min_scale = root.data("min_scale"),
                max_scale = root.data("max_scale");
            var xmid = (min_pos + max_pos) / 2;
            var xpos = slider_position_from_scale(new_scale, min_scale, max_scale);
            element.transform(new Snap.Matrix().translate(
                Math.max(min_pos, Math.min(
                         max_pos, min_pos + (max_pos - min_pos) * xpos)) - xmid, 0));
    });
};


Gadfly.zoomslider_thumb_dragmove = function(dx, dy, x, y, event) {
    var root = this.plotroot();
    var min_pos = this.data("min_pos"),
        max_pos = this.data("max_pos"),
        min_scale = root.data("min_scale"),
        max_scale = root.data("max_scale"),
        old_scale = root.data("old_scale");

    var px_per_mm = root.data("px_per_mm");
    dx /= px_per_mm;
    dy /= px_per_mm;

    var xmid = (min_pos + max_pos) / 2;
    var xpos = slider_position_from_scale(old_scale, min_scale, max_scale) +
                   dx / (max_pos - min_pos);

    // compute the new scale
    var new_scale = scale_from_slider_position(xpos, min_scale, max_scale);
    new_scale = Math.min(max_scale, Math.max(min_scale, new_scale));

    update_plot_scale(root, new_scale);
    event.stopPropagation();
};


Gadfly.zoomslider_thumb_dragstart = function(x, y, event) {
    this.animate({fill: this.data("mouseover_color")}, 100);
    var root = this.plotroot();

    // keep track of what the scale was when we started dragging
    root.data("old_scale", root.data("scale"));
    event.stopPropagation();
};


Gadfly.zoomslider_thumb_dragend = function(event) {
    this.animate({fill: this.data("mouseout_color")}, 100);
    event.stopPropagation();
};


var toggle_color_class = function(root, color_class, ison) {
    var guides = root.selectAll(".guide." + color_class + ",.guide ." + color_class);
    var geoms = root.selectAll(".geometry." + color_class + ",.geometry ." + color_class);
    if (ison) {
        guides.animate({opacity: 0.5}, 250);
        geoms.animate({opacity: 0.0}, 250);
    } else {
        guides.animate({opacity: 1.0}, 250);
        geoms.animate({opacity: 1.0}, 250);
    }
};


Gadfly.colorkey_swatch_click = function(event) {
    var root = this.plotroot();
    var color_class = this.data("color_class");

    if (event.shiftKey) {
        root.selectAll(".colorkey text")
            .forEach(function (element) {
                var other_color_class = element.data("color_class");
                if (other_color_class != color_class) {
                    toggle_color_class(root, other_color_class,
                                       element.attr("opacity") == 1.0);
                }
            });
    } else {
        toggle_color_class(root, color_class, this.attr("opacity") == 1.0);
    }
};


return Gadfly;

}));


//@ sourceURL=gadfly.js

(function (glob, factory) {
    // AMD support
      if (typeof require === "function" && typeof define === "function" && define.amd) {
        require(["Snap.svg", "Gadfly"], function (Snap, Gadfly) {
            factory(Snap, Gadfly);
        });
      } else {
          factory(glob.Snap, glob.Gadfly);
      }
})(window, function (Snap, Gadfly) {
    var fig = Snap("#img-24e2c5da");
fig.select("#img-24e2c5da-5")
   .init_gadfly();
fig.select("#img-24e2c5da-7")
   .plotroot().data("unfocused_ygrid_color", "#D0D0E0")
;
fig.select("#img-24e2c5da-7")
   .plotroot().data("focused_ygrid_color", "#A0A0A0")
;
fig.select("#img-24e2c5da-8")
   .plotroot().data("unfocused_xgrid_color", "#D0D0E0")
;
fig.select("#img-24e2c5da-8")
   .plotroot().data("focused_xgrid_color", "#A0A0A0")
;
fig.select("#img-24e2c5da-14")
   .data("mouseover_color", "#CD5C5C")
;
fig.select("#img-24e2c5da-14")
   .data("mouseout_color", "#6A6A6A")
;
fig.select("#img-24e2c5da-14")
   .click(Gadfly.zoomslider_zoomin_click)
.mouseenter(Gadfly.zoomslider_button_mouseover)
.mouseleave(Gadfly.zoomslider_button_mouseout)
;
fig.select("#img-24e2c5da-16")
   .data("max_pos", 120.42)
;
fig.select("#img-24e2c5da-16")
   .data("min_pos", 103.42)
;
fig.select("#img-24e2c5da-16")
   .click(Gadfly.zoomslider_track_click);
fig.select("#img-24e2c5da-17")
   .data("max_pos", 120.42)
;
fig.select("#img-24e2c5da-17")
   .data("min_pos", 103.42)
;
fig.select("#img-24e2c5da-17")
   .data("mouseover_color", "#CD5C5C")
;
fig.select("#img-24e2c5da-17")
   .data("mouseout_color", "#6A6A6A")
;
fig.select("#img-24e2c5da-17")
   .drag(Gadfly.zoomslider_thumb_dragmove,
     Gadfly.zoomslider_thumb_dragstart,
     Gadfly.zoomslider_thumb_dragend)
;
fig.select("#img-24e2c5da-18")
   .data("mouseover_color", "#CD5C5C")
;
fig.select("#img-24e2c5da-18")
   .data("mouseout_color", "#6A6A6A")
;
fig.select("#img-24e2c5da-18")
   .click(Gadfly.zoomslider_zoomout_click)
.mouseenter(Gadfly.zoomslider_button_mouseover)
.mouseleave(Gadfly.zoomslider_button_mouseout)
;
    });
]]> </script>
</svg>
</div>


Looks pretty. You should be able to zoom in/out. Lets color the points based on whether the original number is even or odd. I will assign the plot to a variable and save it.


```julia
a = plot(df,x="Number", y="NumofSteps", color = "evenodd", Geom.point) # assign plot to variable
```
<div class="output_html rendered_html output_subarea output_execute_result">
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     xmlns:gadfly="http://www.gadflyjl.org/ns"
     version="1.2"
     width="141.42mm" height="100mm" viewBox="0 0 141.42 100"
     stroke="none"
     fill="#000000"
     stroke-width="0.3"
     font-size="3.88"

     id="img-e572ec8a">
<g class="plotroot xscalable yscalable" id="img-e572ec8a-1">
  <g font-size="3.88" font-family="'PT Sans','Helvetica Neue','Helvetica',sans-serif" fill="#564A55" stroke="#000000" stroke-opacity="0.000" id="img-e572ec8a-2">
    <text x="70.93" y="88.39" text-anchor="middle" dy="0.6em">Number</text>
  </g>
  <g class="guide xlabels" font-size="2.82" font-family="'PT Sans Caption','Helvetica Neue','Helvetica',sans-serif" fill="#6C606B" id="img-e572ec8a-3">
    <text x="-126.27" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">-1500</text>
    <text x="-76.97" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">-1000</text>
    <text x="-27.67" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">-500</text>
    <text x="21.63" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="visible">0</text>
    <text x="70.93" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="visible">500</text>
    <text x="120.23" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="visible">1000</text>
    <text x="169.53" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">1500</text>
    <text x="218.83" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">2000</text>
    <text x="268.13" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">2500</text>
    <text x="-76.97" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-1000</text>
    <text x="-72.04" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-950</text>
    <text x="-67.11" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-900</text>
    <text x="-62.18" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-850</text>
    <text x="-57.25" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-800</text>
    <text x="-52.32" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-750</text>
    <text x="-47.39" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-700</text>
    <text x="-42.46" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-650</text>
    <text x="-37.53" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-600</text>
    <text x="-32.6" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-550</text>
    <text x="-27.67" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-500</text>
    <text x="-22.74" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-450</text>
    <text x="-17.81" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-400</text>
    <text x="-12.88" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-350</text>
    <text x="-7.95" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-300</text>
    <text x="-3.02" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-250</text>
    <text x="1.91" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-200</text>
    <text x="6.84" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-150</text>
    <text x="11.77" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-100</text>
    <text x="16.7" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-50</text>
    <text x="21.63" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">0</text>
    <text x="26.56" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">50</text>
    <text x="31.49" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">100</text>
    <text x="36.42" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">150</text>
    <text x="41.35" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">200</text>
    <text x="46.28" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">250</text>
    <text x="51.21" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">300</text>
    <text x="56.14" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">350</text>
    <text x="61.07" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">400</text>
    <text x="66" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">450</text>
    <text x="70.93" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">500</text>
    <text x="75.86" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">550</text>
    <text x="80.79" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">600</text>
    <text x="85.72" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">650</text>
    <text x="90.65" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">700</text>
    <text x="95.58" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">750</text>
    <text x="100.51" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">800</text>
    <text x="105.44" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">850</text>
    <text x="110.37" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">900</text>
    <text x="115.3" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">950</text>
    <text x="120.23" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1000</text>
    <text x="125.16" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1050</text>
    <text x="130.09" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1100</text>
    <text x="135.02" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1150</text>
    <text x="139.95" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1200</text>
    <text x="144.88" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1250</text>
    <text x="149.81" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1300</text>
    <text x="154.74" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1350</text>
    <text x="159.67" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1400</text>
    <text x="164.6" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1450</text>
    <text x="169.53" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1500</text>
    <text x="174.46" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1550</text>
    <text x="179.39" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1600</text>
    <text x="184.32" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1650</text>
    <text x="189.25" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1700</text>
    <text x="194.18" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1750</text>
    <text x="199.11" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1800</text>
    <text x="204.04" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1850</text>
    <text x="208.97" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1900</text>
    <text x="213.9" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1950</text>
    <text x="218.83" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">2000</text>
    <text x="-76.97" y="84.39" text-anchor="middle" gadfly:scale="0.5" visibility="hidden">-1000</text>
    <text x="21.63" y="84.39" text-anchor="middle" gadfly:scale="0.5" visibility="hidden">0</text>
    <text x="120.23" y="84.39" text-anchor="middle" gadfly:scale="0.5" visibility="hidden">1000</text>
    <text x="218.83" y="84.39" text-anchor="middle" gadfly:scale="0.5" visibility="hidden">2000</text>
    <text x="-76.97" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-1000</text>
    <text x="-67.11" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-900</text>
    <text x="-57.25" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-800</text>
    <text x="-47.39" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-700</text>
    <text x="-37.53" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-600</text>
    <text x="-27.67" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-500</text>
    <text x="-17.81" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-400</text>
    <text x="-7.95" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-300</text>
    <text x="1.91" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-200</text>
    <text x="11.77" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-100</text>
    <text x="21.63" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">0</text>
    <text x="31.49" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">100</text>
    <text x="41.35" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">200</text>
    <text x="51.21" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">300</text>
    <text x="61.07" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">400</text>
    <text x="70.93" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">500</text>
    <text x="80.79" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">600</text>
    <text x="90.65" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">700</text>
    <text x="100.51" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">800</text>
    <text x="110.37" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">900</text>
    <text x="120.23" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1000</text>
    <text x="130.09" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1100</text>
    <text x="139.95" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1200</text>
    <text x="149.81" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1300</text>
    <text x="159.67" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1400</text>
    <text x="169.53" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1500</text>
    <text x="179.39" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1600</text>
    <text x="189.25" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1700</text>
    <text x="199.11" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1800</text>
    <text x="208.97" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1900</text>
    <text x="218.83" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">2000</text>
  </g>
  <g class="guide colorkey" id="img-e572ec8a-4">
    <g fill="#4C404B" font-size="2.82" font-family="'PT Sans','Helvetica Neue','Helvetica',sans-serif" id="img-e572ec8a-5">
      <text x="126.04" y="42.86" dy="0.35em" id="img-e572ec8a-6" class="color_odd">odd</text>
      <text x="126.04" y="46.48" dy="0.35em" id="img-e572ec8a-7" class="color_even">even</text>
    </g>
    <g stroke="#000000" stroke-opacity="0.000" id="img-e572ec8a-8">
      <rect x="123.23" y="41.95" width="1.81" height="1.81" id="img-e572ec8a-9" class="color_odd" fill="#00BFFF"/>
      <rect x="123.23" y="45.58" width="1.81" height="1.81" id="img-e572ec8a-10" class="color_even" fill="#D4CA3A"/>
    </g>
    <g fill="#362A35" font-size="3.88" font-family="'PT Sans','Helvetica Neue','Helvetica',sans-serif" stroke="#000000" stroke-opacity="0.000" id="img-e572ec8a-11">
      <text x="123.23" y="39.04" id="img-e572ec8a-12">evenodd</text>
    </g>
  </g>
<g clip-path="url(#img-e572ec8a-13)">
  <g id="img-e572ec8a-14">
    <g pointer-events="visible" opacity="1" fill="#000000" fill-opacity="0.000" stroke="#000000" stroke-opacity="0.000" class="guide background" id="img-e572ec8a-15">
      <rect x="19.63" y="5" width="102.6" height="75.72" id="img-e572ec8a-16"/>
    </g>
    <g class="guide ygridlines xfixed" stroke-dasharray="0.5,0.5" stroke-width="0.2" stroke="#D0D0E0" id="img-e572ec8a-17">
      <path fill="none" d="M19.63,168.36 L 122.23 168.36" id="img-e572ec8a-18" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,150.43 L 122.23 150.43" id="img-e572ec8a-19" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,132.5 L 122.23 132.5" id="img-e572ec8a-20" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,114.57 L 122.23 114.57" id="img-e572ec8a-21" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,96.64 L 122.23 96.64" id="img-e572ec8a-22" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,78.71 L 122.23 78.71" id="img-e572ec8a-23" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,60.79 L 122.23 60.79" id="img-e572ec8a-24" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,42.86 L 122.23 42.86" id="img-e572ec8a-25" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,24.93 L 122.23 24.93" id="img-e572ec8a-26" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,7 L 122.23 7" id="img-e572ec8a-27" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,-10.93 L 122.23 -10.93" id="img-e572ec8a-28" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-28.86 L 122.23 -28.86" id="img-e572ec8a-29" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-46.79 L 122.23 -46.79" id="img-e572ec8a-30" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-64.72 L 122.23 -64.72" id="img-e572ec8a-31" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-82.64 L 122.23 -82.64" id="img-e572ec8a-32" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,150.43 L 122.23 150.43" id="img-e572ec8a-33" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,146.84 L 122.23 146.84" id="img-e572ec8a-34" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,143.26 L 122.23 143.26" id="img-e572ec8a-35" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,139.67 L 122.23 139.67" id="img-e572ec8a-36" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,136.09 L 122.23 136.09" id="img-e572ec8a-37" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,132.5 L 122.23 132.5" id="img-e572ec8a-38" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,128.92 L 122.23 128.92" id="img-e572ec8a-39" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,125.33 L 122.23 125.33" id="img-e572ec8a-40" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,121.74 L 122.23 121.74" id="img-e572ec8a-41" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,118.16 L 122.23 118.16" id="img-e572ec8a-42" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,114.57 L 122.23 114.57" id="img-e572ec8a-43" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,110.99 L 122.23 110.99" id="img-e572ec8a-44" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,107.4 L 122.23 107.4" id="img-e572ec8a-45" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,103.82 L 122.23 103.82" id="img-e572ec8a-46" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,100.23 L 122.23 100.23" id="img-e572ec8a-47" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,96.64 L 122.23 96.64" id="img-e572ec8a-48" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,93.06 L 122.23 93.06" id="img-e572ec8a-49" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,89.47 L 122.23 89.47" id="img-e572ec8a-50" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,85.89 L 122.23 85.89" id="img-e572ec8a-51" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,82.3 L 122.23 82.3" id="img-e572ec8a-52" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,78.71 L 122.23 78.71" id="img-e572ec8a-53" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,75.13 L 122.23 75.13" id="img-e572ec8a-54" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,71.54 L 122.23 71.54" id="img-e572ec8a-55" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,67.96 L 122.23 67.96" id="img-e572ec8a-56" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,64.37 L 122.23 64.37" id="img-e572ec8a-57" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,60.79 L 122.23 60.79" id="img-e572ec8a-58" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,57.2 L 122.23 57.2" id="img-e572ec8a-59" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,53.61 L 122.23 53.61" id="img-e572ec8a-60" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,50.03 L 122.23 50.03" id="img-e572ec8a-61" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,46.44 L 122.23 46.44" id="img-e572ec8a-62" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,42.86 L 122.23 42.86" id="img-e572ec8a-63" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,39.27 L 122.23 39.27" id="img-e572ec8a-64" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,35.69 L 122.23 35.69" id="img-e572ec8a-65" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,32.1 L 122.23 32.1" id="img-e572ec8a-66" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,28.51 L 122.23 28.51" id="img-e572ec8a-67" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,24.93 L 122.23 24.93" id="img-e572ec8a-68" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,21.34 L 122.23 21.34" id="img-e572ec8a-69" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,17.76 L 122.23 17.76" id="img-e572ec8a-70" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,14.17 L 122.23 14.17" id="img-e572ec8a-71" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,10.59 L 122.23 10.59" id="img-e572ec8a-72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,7 L 122.23 7" id="img-e572ec8a-73" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,3.41 L 122.23 3.41" id="img-e572ec8a-74" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-0.17 L 122.23 -0.17" id="img-e572ec8a-75" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-3.76 L 122.23 -3.76" id="img-e572ec8a-76" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-7.34 L 122.23 -7.34" id="img-e572ec8a-77" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-10.93 L 122.23 -10.93" id="img-e572ec8a-78" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-14.51 L 122.23 -14.51" id="img-e572ec8a-79" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-18.1 L 122.23 -18.1" id="img-e572ec8a-80" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-21.69 L 122.23 -21.69" id="img-e572ec8a-81" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-25.27 L 122.23 -25.27" id="img-e572ec8a-82" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-28.86 L 122.23 -28.86" id="img-e572ec8a-83" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-32.44 L 122.23 -32.44" id="img-e572ec8a-84" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-36.03 L 122.23 -36.03" id="img-e572ec8a-85" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-39.61 L 122.23 -39.61" id="img-e572ec8a-86" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-43.2 L 122.23 -43.2" id="img-e572ec8a-87" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-46.79 L 122.23 -46.79" id="img-e572ec8a-88" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-50.37 L 122.23 -50.37" id="img-e572ec8a-89" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-53.96 L 122.23 -53.96" id="img-e572ec8a-90" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-57.54 L 122.23 -57.54" id="img-e572ec8a-91" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-61.13 L 122.23 -61.13" id="img-e572ec8a-92" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-64.72 L 122.23 -64.72" id="img-e572ec8a-93" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,150.43 L 122.23 150.43" id="img-e572ec8a-94" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M19.63,78.71 L 122.23 78.71" id="img-e572ec8a-95" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M19.63,7 L 122.23 7" id="img-e572ec8a-96" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M19.63,-64.72 L 122.23 -64.72" id="img-e572ec8a-97" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M19.63,150.43 L 122.23 150.43" id="img-e572ec8a-98" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,143.26 L 122.23 143.26" id="img-e572ec8a-99" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,136.09 L 122.23 136.09" id="img-e572ec8a-100" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,128.92 L 122.23 128.92" id="img-e572ec8a-101" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,121.74 L 122.23 121.74" id="img-e572ec8a-102" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,114.57 L 122.23 114.57" id="img-e572ec8a-103" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,107.4 L 122.23 107.4" id="img-e572ec8a-104" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,100.23 L 122.23 100.23" id="img-e572ec8a-105" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,93.06 L 122.23 93.06" id="img-e572ec8a-106" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,85.89 L 122.23 85.89" id="img-e572ec8a-107" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,78.71 L 122.23 78.71" id="img-e572ec8a-108" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,71.54 L 122.23 71.54" id="img-e572ec8a-109" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,64.37 L 122.23 64.37" id="img-e572ec8a-110" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,57.2 L 122.23 57.2" id="img-e572ec8a-111" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,50.03 L 122.23 50.03" id="img-e572ec8a-112" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,42.86 L 122.23 42.86" id="img-e572ec8a-113" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,35.69 L 122.23 35.69" id="img-e572ec8a-114" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,28.51 L 122.23 28.51" id="img-e572ec8a-115" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,21.34 L 122.23 21.34" id="img-e572ec8a-116" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,14.17 L 122.23 14.17" id="img-e572ec8a-117" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,7 L 122.23 7" id="img-e572ec8a-118" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-0.17 L 122.23 -0.17" id="img-e572ec8a-119" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-7.34 L 122.23 -7.34" id="img-e572ec8a-120" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-14.51 L 122.23 -14.51" id="img-e572ec8a-121" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-21.69 L 122.23 -21.69" id="img-e572ec8a-122" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-28.86 L 122.23 -28.86" id="img-e572ec8a-123" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-36.03 L 122.23 -36.03" id="img-e572ec8a-124" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-43.2 L 122.23 -43.2" id="img-e572ec8a-125" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-50.37 L 122.23 -50.37" id="img-e572ec8a-126" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-57.54 L 122.23 -57.54" id="img-e572ec8a-127" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-64.72 L 122.23 -64.72" id="img-e572ec8a-128" gadfly:scale="5.0" visibility="hidden"/>
    </g>
    <g class="guide xgridlines yfixed" stroke-dasharray="0.5,0.5" stroke-width="0.2" stroke="#D0D0E0" id="img-e572ec8a-129">
      <path fill="none" d="M-126.27,5 L -126.27 80.72" id="img-e572ec8a-130" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M-76.97,5 L -76.97 80.72" id="img-e572ec8a-131" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M-27.67,5 L -27.67 80.72" id="img-e572ec8a-132" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M21.63,5 L 21.63 80.72" id="img-e572ec8a-133" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M70.93,5 L 70.93 80.72" id="img-e572ec8a-134" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M120.23,5 L 120.23 80.72" id="img-e572ec8a-135" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M169.53,5 L 169.53 80.72" id="img-e572ec8a-136" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M218.83,5 L 218.83 80.72" id="img-e572ec8a-137" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M268.13,5 L 268.13 80.72" id="img-e572ec8a-138" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M-76.97,5 L -76.97 80.72" id="img-e572ec8a-139" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-72.04,5 L -72.04 80.72" id="img-e572ec8a-140" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-67.11,5 L -67.11 80.72" id="img-e572ec8a-141" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-62.18,5 L -62.18 80.72" id="img-e572ec8a-142" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-57.25,5 L -57.25 80.72" id="img-e572ec8a-143" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-52.32,5 L -52.32 80.72" id="img-e572ec8a-144" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-47.39,5 L -47.39 80.72" id="img-e572ec8a-145" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-42.46,5 L -42.46 80.72" id="img-e572ec8a-146" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-37.53,5 L -37.53 80.72" id="img-e572ec8a-147" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-32.6,5 L -32.6 80.72" id="img-e572ec8a-148" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-27.67,5 L -27.67 80.72" id="img-e572ec8a-149" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-22.74,5 L -22.74 80.72" id="img-e572ec8a-150" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-17.81,5 L -17.81 80.72" id="img-e572ec8a-151" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-12.88,5 L -12.88 80.72" id="img-e572ec8a-152" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-7.95,5 L -7.95 80.72" id="img-e572ec8a-153" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-3.02,5 L -3.02 80.72" id="img-e572ec8a-154" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M1.91,5 L 1.91 80.72" id="img-e572ec8a-155" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M6.84,5 L 6.84 80.72" id="img-e572ec8a-156" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M11.77,5 L 11.77 80.72" id="img-e572ec8a-157" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M16.7,5 L 16.7 80.72" id="img-e572ec8a-158" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M21.63,5 L 21.63 80.72" id="img-e572ec8a-159" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M26.56,5 L 26.56 80.72" id="img-e572ec8a-160" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M31.49,5 L 31.49 80.72" id="img-e572ec8a-161" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M36.42,5 L 36.42 80.72" id="img-e572ec8a-162" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M41.35,5 L 41.35 80.72" id="img-e572ec8a-163" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M46.28,5 L 46.28 80.72" id="img-e572ec8a-164" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M51.21,5 L 51.21 80.72" id="img-e572ec8a-165" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M56.14,5 L 56.14 80.72" id="img-e572ec8a-166" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M61.07,5 L 61.07 80.72" id="img-e572ec8a-167" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M66,5 L 66 80.72" id="img-e572ec8a-168" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M70.93,5 L 70.93 80.72" id="img-e572ec8a-169" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M75.86,5 L 75.86 80.72" id="img-e572ec8a-170" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M80.79,5 L 80.79 80.72" id="img-e572ec8a-171" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M85.72,5 L 85.72 80.72" id="img-e572ec8a-172" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M90.65,5 L 90.65 80.72" id="img-e572ec8a-173" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M95.58,5 L 95.58 80.72" id="img-e572ec8a-174" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M100.51,5 L 100.51 80.72" id="img-e572ec8a-175" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M105.44,5 L 105.44 80.72" id="img-e572ec8a-176" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M110.37,5 L 110.37 80.72" id="img-e572ec8a-177" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M115.3,5 L 115.3 80.72" id="img-e572ec8a-178" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M120.23,5 L 120.23 80.72" id="img-e572ec8a-179" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M125.16,5 L 125.16 80.72" id="img-e572ec8a-180" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M130.09,5 L 130.09 80.72" id="img-e572ec8a-181" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M135.02,5 L 135.02 80.72" id="img-e572ec8a-182" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M139.95,5 L 139.95 80.72" id="img-e572ec8a-183" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M144.88,5 L 144.88 80.72" id="img-e572ec8a-184" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M149.81,5 L 149.81 80.72" id="img-e572ec8a-185" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M154.74,5 L 154.74 80.72" id="img-e572ec8a-186" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M159.67,5 L 159.67 80.72" id="img-e572ec8a-187" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M164.6,5 L 164.6 80.72" id="img-e572ec8a-188" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M169.53,5 L 169.53 80.72" id="img-e572ec8a-189" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M174.46,5 L 174.46 80.72" id="img-e572ec8a-190" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M179.39,5 L 179.39 80.72" id="img-e572ec8a-191" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M184.32,5 L 184.32 80.72" id="img-e572ec8a-192" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M189.25,5 L 189.25 80.72" id="img-e572ec8a-193" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M194.18,5 L 194.18 80.72" id="img-e572ec8a-194" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M199.11,5 L 199.11 80.72" id="img-e572ec8a-195" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M204.04,5 L 204.04 80.72" id="img-e572ec8a-196" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M208.97,5 L 208.97 80.72" id="img-e572ec8a-197" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M213.9,5 L 213.9 80.72" id="img-e572ec8a-198" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M218.83,5 L 218.83 80.72" id="img-e572ec8a-199" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-76.97,5 L -76.97 80.72" id="img-e572ec8a-200" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M21.63,5 L 21.63 80.72" id="img-e572ec8a-201" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M120.23,5 L 120.23 80.72" id="img-e572ec8a-202" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M218.83,5 L 218.83 80.72" id="img-e572ec8a-203" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M-76.97,5 L -76.97 80.72" id="img-e572ec8a-204" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-67.11,5 L -67.11 80.72" id="img-e572ec8a-205" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-57.25,5 L -57.25 80.72" id="img-e572ec8a-206" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-47.39,5 L -47.39 80.72" id="img-e572ec8a-207" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-37.53,5 L -37.53 80.72" id="img-e572ec8a-208" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-27.67,5 L -27.67 80.72" id="img-e572ec8a-209" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-17.81,5 L -17.81 80.72" id="img-e572ec8a-210" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-7.95,5 L -7.95 80.72" id="img-e572ec8a-211" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M1.91,5 L 1.91 80.72" id="img-e572ec8a-212" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M11.77,5 L 11.77 80.72" id="img-e572ec8a-213" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M21.63,5 L 21.63 80.72" id="img-e572ec8a-214" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M31.49,5 L 31.49 80.72" id="img-e572ec8a-215" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M41.35,5 L 41.35 80.72" id="img-e572ec8a-216" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M51.21,5 L 51.21 80.72" id="img-e572ec8a-217" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M61.07,5 L 61.07 80.72" id="img-e572ec8a-218" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M70.93,5 L 70.93 80.72" id="img-e572ec8a-219" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M80.79,5 L 80.79 80.72" id="img-e572ec8a-220" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M90.65,5 L 90.65 80.72" id="img-e572ec8a-221" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M100.51,5 L 100.51 80.72" id="img-e572ec8a-222" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M110.37,5 L 110.37 80.72" id="img-e572ec8a-223" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M120.23,5 L 120.23 80.72" id="img-e572ec8a-224" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M130.09,5 L 130.09 80.72" id="img-e572ec8a-225" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M139.95,5 L 139.95 80.72" id="img-e572ec8a-226" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M149.81,5 L 149.81 80.72" id="img-e572ec8a-227" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M159.67,5 L 159.67 80.72" id="img-e572ec8a-228" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M169.53,5 L 169.53 80.72" id="img-e572ec8a-229" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M179.39,5 L 179.39 80.72" id="img-e572ec8a-230" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M189.25,5 L 189.25 80.72" id="img-e572ec8a-231" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M199.11,5 L 199.11 80.72" id="img-e572ec8a-232" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M208.97,5 L 208.97 80.72" id="img-e572ec8a-233" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M218.83,5 L 218.83 80.72" id="img-e572ec8a-234" gadfly:scale="5.0" visibility="hidden"/>
    </g>
    <g class="plotpanel" id="img-e572ec8a-235">
      <g class="geometry" id="img-e572ec8a-236">
        <g stroke-width="0.3" id="img-e572ec8a-237">
          <g fill="#D4CA3A" stroke="#FFFFFF" class="color_even" id="img-e572ec8a-238">
            <use xlink:href="#img-e572ec8a-239" x="21.83" y="78.36" id="img-e572ec8a-240"/>
            <use xlink:href="#img-e572ec8a-239" x="22.03" y="78" id="img-e572ec8a-241"/>
            <use xlink:href="#img-e572ec8a-239" x="22.22" y="75.85" id="img-e572ec8a-242"/>
            <use xlink:href="#img-e572ec8a-239" x="22.42" y="77.64" id="img-e572ec8a-243"/>
            <use xlink:href="#img-e572ec8a-239" x="22.62" y="76.56" id="img-e572ec8a-244"/>
            <use xlink:href="#img-e572ec8a-239" x="22.81" y="75.49" id="img-e572ec8a-245"/>
            <use xlink:href="#img-e572ec8a-239" x="23.01" y="72.62" id="img-e572ec8a-246"/>
            <use xlink:href="#img-e572ec8a-239" x="23.21" y="77.28" id="img-e572ec8a-247"/>
            <use xlink:href="#img-e572ec8a-239" x="23.41" y="71.54" id="img-e572ec8a-248"/>
            <use xlink:href="#img-e572ec8a-239" x="23.6" y="76.2" id="img-e572ec8a-249"/>
            <use xlink:href="#img-e572ec8a-239" x="23.8" y="73.34" id="img-e572ec8a-250"/>
            <use xlink:href="#img-e572ec8a-239" x="24" y="75.13" id="img-e572ec8a-251"/>
            <use xlink:href="#img-e572ec8a-239" x="24.2" y="75.13" id="img-e572ec8a-252"/>
            <use xlink:href="#img-e572ec8a-239" x="24.39" y="72.26" id="img-e572ec8a-253"/>
            <use xlink:href="#img-e572ec8a-239" x="24.59" y="72.26" id="img-e572ec8a-254"/>
            <use xlink:href="#img-e572ec8a-239" x="24.79" y="76.92" id="img-e572ec8a-255"/>
            <use xlink:href="#img-e572ec8a-239" x="24.98" y="74.05" id="img-e572ec8a-256"/>
            <use xlink:href="#img-e572ec8a-239" x="25.18" y="71.18" id="img-e572ec8a-257"/>
            <use xlink:href="#img-e572ec8a-239" x="25.38" y="71.18" id="img-e572ec8a-258"/>
            <use xlink:href="#img-e572ec8a-239" x="25.58" y="75.85" id="img-e572ec8a-259"/>
            <use xlink:href="#img-e572ec8a-239" x="25.77" y="75.85" id="img-e572ec8a-260"/>
            <use xlink:href="#img-e572ec8a-239" x="25.97" y="72.98" id="img-e572ec8a-261"/>
            <use xlink:href="#img-e572ec8a-239" x="26.17" y="72.98" id="img-e572ec8a-262"/>
            <use xlink:href="#img-e572ec8a-239" x="26.36" y="74.77" id="img-e572ec8a-263"/>
            <use xlink:href="#img-e572ec8a-239" x="26.56" y="70.11" id="img-e572ec8a-264"/>
            <use xlink:href="#img-e572ec8a-239" x="26.76" y="74.77" id="img-e572ec8a-265"/>
            <use xlink:href="#img-e572ec8a-239" x="26.96" y="38.55" id="img-e572ec8a-266"/>
            <use xlink:href="#img-e572ec8a-239" x="27.15" y="71.9" id="img-e572ec8a-267"/>
            <use xlink:href="#img-e572ec8a-239" x="27.35" y="71.9" id="img-e572ec8a-268"/>
            <use xlink:href="#img-e572ec8a-239" x="27.55" y="71.9" id="img-e572ec8a-269"/>
            <use xlink:href="#img-e572ec8a-239" x="27.74" y="40.35" id="img-e572ec8a-270"/>
            <use xlink:href="#img-e572ec8a-239" x="27.94" y="76.56" id="img-e572ec8a-271"/>
            <use xlink:href="#img-e572ec8a-239" x="28.14" y="69.03" id="img-e572ec8a-272"/>
            <use xlink:href="#img-e572ec8a-239" x="28.34" y="73.69" id="img-e572ec8a-273"/>
            <use xlink:href="#img-e572ec8a-239" x="28.53" y="73.69" id="img-e572ec8a-274"/>
            <use xlink:href="#img-e572ec8a-239" x="28.73" y="70.83" id="img-e572ec8a-275"/>
            <use xlink:href="#img-e572ec8a-239" x="28.93" y="70.83" id="img-e572ec8a-276"/>
            <use xlink:href="#img-e572ec8a-239" x="29.13" y="70.83" id="img-e572ec8a-277"/>
            <use xlink:href="#img-e572ec8a-239" x="29.32" y="66.16" id="img-e572ec8a-278"/>
            <use xlink:href="#img-e572ec8a-239" x="29.52" y="75.49" id="img-e572ec8a-279"/>
            <use xlink:href="#img-e572ec8a-239" x="29.72" y="39.27" id="img-e572ec8a-280"/>
            <use xlink:href="#img-e572ec8a-239" x="29.91" y="75.49" id="img-e572ec8a-281"/>
            <use xlink:href="#img-e572ec8a-239" x="30.11" y="67.96" id="img-e572ec8a-282"/>
            <use xlink:href="#img-e572ec8a-239" x="30.31" y="72.62" id="img-e572ec8a-283"/>
            <use xlink:href="#img-e572ec8a-239" x="30.51" y="72.62" id="img-e572ec8a-284"/>
            <use xlink:href="#img-e572ec8a-239" x="30.7" y="72.62" id="img-e572ec8a-285"/>
            <use xlink:href="#img-e572ec8a-239" x="30.9" y="41.06" id="img-e572ec8a-286"/>
            <use xlink:href="#img-e572ec8a-239" x="31.1" y="74.41" id="img-e572ec8a-287"/>
            <use xlink:href="#img-e572ec8a-239" x="31.29" y="69.75" id="img-e572ec8a-288"/>
            <use xlink:href="#img-e572ec8a-239" x="31.49" y="69.75" id="img-e572ec8a-289"/>
            <use xlink:href="#img-e572ec8a-239" x="31.69" y="69.75" id="img-e572ec8a-290"/>
            <use xlink:href="#img-e572ec8a-239" x="31.89" y="74.41" id="img-e572ec8a-291"/>
            <use xlink:href="#img-e572ec8a-239" x="32.08" y="74.41" id="img-e572ec8a-292"/>
            <use xlink:href="#img-e572ec8a-239" x="32.28" y="38.2" id="img-e572ec8a-293"/>
            <use xlink:href="#img-e572ec8a-239" x="32.48" y="38.2" id="img-e572ec8a-294"/>
            <use xlink:href="#img-e572ec8a-239" x="32.67" y="71.54" id="img-e572ec8a-295"/>
            <use xlink:href="#img-e572ec8a-239" x="32.87" y="66.88" id="img-e572ec8a-296"/>
            <use xlink:href="#img-e572ec8a-239" x="33.07" y="71.54" id="img-e572ec8a-297"/>
            <use xlink:href="#img-e572ec8a-239" x="33.27" y="66.88" id="img-e572ec8a-298"/>
            <use xlink:href="#img-e572ec8a-239" x="33.46" y="71.54" id="img-e572ec8a-299"/>
            <use xlink:href="#img-e572ec8a-239" x="33.66" y="71.54" id="img-e572ec8a-300"/>
            <use xlink:href="#img-e572ec8a-239" x="33.86" y="39.99" id="img-e572ec8a-301"/>
            <use xlink:href="#img-e572ec8a-239" x="34.06" y="39.99" id="img-e572ec8a-302"/>
            <use xlink:href="#img-e572ec8a-239" x="34.25" y="76.2" id="img-e572ec8a-303"/>
            <use xlink:href="#img-e572ec8a-239" x="34.45" y="68.67" id="img-e572ec8a-304"/>
            <use xlink:href="#img-e572ec8a-239" x="34.65" y="68.67" id="img-e572ec8a-305"/>
            <use xlink:href="#img-e572ec8a-239" x="34.84" y="68.67" id="img-e572ec8a-306"/>
            <use xlink:href="#img-e572ec8a-239" x="35.04" y="73.34" id="img-e572ec8a-307"/>
            <use xlink:href="#img-e572ec8a-239" x="35.24" y="73.34" id="img-e572ec8a-308"/>
            <use xlink:href="#img-e572ec8a-239" x="35.44" y="73.34" id="img-e572ec8a-309"/>
            <use xlink:href="#img-e572ec8a-239" x="35.63" y="41.78" id="img-e572ec8a-310"/>
            <use xlink:href="#img-e572ec8a-239" x="35.83" y="70.47" id="img-e572ec8a-311"/>
            <use xlink:href="#img-e572ec8a-239" x="36.03" y="37.12" id="img-e572ec8a-312"/>
            <use xlink:href="#img-e572ec8a-239" x="36.22" y="70.47" id="img-e572ec8a-313"/>
            <use xlink:href="#img-e572ec8a-239" x="36.42" y="73.34" id="img-e572ec8a-314"/>
            <use xlink:href="#img-e572ec8a-239" x="36.62" y="70.47" id="img-e572ec8a-315"/>
            <use xlink:href="#img-e572ec8a-239" x="36.82" y="70.47" id="img-e572ec8a-316"/>
            <use xlink:href="#img-e572ec8a-239" x="37.01" y="65.81" id="img-e572ec8a-317"/>
            <use xlink:href="#img-e572ec8a-239" x="37.21" y="65.81" id="img-e572ec8a-318"/>
            <use xlink:href="#img-e572ec8a-239" x="37.41" y="75.13" id="img-e572ec8a-319"/>
            <use xlink:href="#img-e572ec8a-239" x="37.6" y="70.47" id="img-e572ec8a-320"/>
            <use xlink:href="#img-e572ec8a-239" x="37.8" y="38.91" id="img-e572ec8a-321"/>
            <use xlink:href="#img-e572ec8a-239" x="38" y="38.91" id="img-e572ec8a-322"/>
            <use xlink:href="#img-e572ec8a-239" x="38.2" y="75.13" id="img-e572ec8a-323"/>
            <use xlink:href="#img-e572ec8a-239" x="38.39" y="75.13" id="img-e572ec8a-324"/>
            <use xlink:href="#img-e572ec8a-239" x="38.59" y="67.6" id="img-e572ec8a-325"/>
            <use xlink:href="#img-e572ec8a-239" x="38.79" y="67.6" id="img-e572ec8a-326"/>
            <use xlink:href="#img-e572ec8a-239" x="38.99" y="72.26" id="img-e572ec8a-327"/>
            <use xlink:href="#img-e572ec8a-239" x="39.18" y="67.6" id="img-e572ec8a-328"/>
            <use xlink:href="#img-e572ec8a-239" x="39.38" y="72.26" id="img-e572ec8a-329"/>
            <use xlink:href="#img-e572ec8a-239" x="39.58" y="45.37" id="img-e572ec8a-330"/>
            <use xlink:href="#img-e572ec8a-239" x="39.77" y="72.26" id="img-e572ec8a-331"/>
            <use xlink:href="#img-e572ec8a-239" x="39.97" y="72.26" id="img-e572ec8a-332"/>
            <use xlink:href="#img-e572ec8a-239" x="40.17" y="40.71" id="img-e572ec8a-333"/>
            <use xlink:href="#img-e572ec8a-239" x="40.37" y="40.71" id="img-e572ec8a-334"/>
            <use xlink:href="#img-e572ec8a-239" x="40.56" y="74.05" id="img-e572ec8a-335"/>
            <use xlink:href="#img-e572ec8a-239" x="40.76" y="36.04" id="img-e572ec8a-336"/>
            <use xlink:href="#img-e572ec8a-239" x="40.96" y="69.39" id="img-e572ec8a-337"/>
            <use xlink:href="#img-e572ec8a-239" x="41.15" y="69.39" id="img-e572ec8a-338"/>
            <use xlink:href="#img-e572ec8a-239" x="41.35" y="69.39" id="img-e572ec8a-339"/>
            <use xlink:href="#img-e572ec8a-239" x="41.55" y="69.39" id="img-e572ec8a-340"/>
            <use xlink:href="#img-e572ec8a-239" x="41.75" y="69.39" id="img-e572ec8a-341"/>
            <use xlink:href="#img-e572ec8a-239" x="41.94" y="47.16" id="img-e572ec8a-342"/>
            <use xlink:href="#img-e572ec8a-239" x="42.14" y="74.05" id="img-e572ec8a-343"/>
            <use xlink:href="#img-e572ec8a-239" x="42.34" y="64.73" id="img-e572ec8a-344"/>
            <use xlink:href="#img-e572ec8a-239" x="42.53" y="74.05" id="img-e572ec8a-345"/>
            <use xlink:href="#img-e572ec8a-239" x="42.73" y="42.5" id="img-e572ec8a-346"/>
            <use xlink:href="#img-e572ec8a-239" x="42.93" y="37.84" id="img-e572ec8a-347"/>
            <use xlink:href="#img-e572ec8a-239" x="43.13" y="37.84" id="img-e572ec8a-348"/>
            <use xlink:href="#img-e572ec8a-239" x="43.32" y="37.84" id="img-e572ec8a-349"/>
            <use xlink:href="#img-e572ec8a-239" x="43.52" y="53.61" id="img-e572ec8a-350"/>
            <use xlink:href="#img-e572ec8a-239" x="43.72" y="71.18" id="img-e572ec8a-351"/>
            <use xlink:href="#img-e572ec8a-239" x="43.92" y="74.05" id="img-e572ec8a-352"/>
            <use xlink:href="#img-e572ec8a-239" x="44.11" y="66.52" id="img-e572ec8a-353"/>
            <use xlink:href="#img-e572ec8a-239" x="44.31" y="66.52" id="img-e572ec8a-354"/>
            <use xlink:href="#img-e572ec8a-239" x="44.51" y="71.18" id="img-e572ec8a-355"/>
            <use xlink:href="#img-e572ec8a-239" x="44.7" y="71.18" id="img-e572ec8a-356"/>
            <use xlink:href="#img-e572ec8a-239" x="44.9" y="66.52" id="img-e572ec8a-357"/>
            <use xlink:href="#img-e572ec8a-239" x="45.1" y="66.52" id="img-e572ec8a-358"/>
            <use xlink:href="#img-e572ec8a-239" x="45.3" y="71.18" id="img-e572ec8a-359"/>
            <use xlink:href="#img-e572ec8a-239" x="45.49" y="44.29" id="img-e572ec8a-360"/>
            <use xlink:href="#img-e572ec8a-239" x="45.69" y="71.18" id="img-e572ec8a-361"/>
            <use xlink:href="#img-e572ec8a-239" x="45.89" y="61.86" id="img-e572ec8a-362"/>
            <use xlink:href="#img-e572ec8a-239" x="46.08" y="39.63" id="img-e572ec8a-363"/>
            <use xlink:href="#img-e572ec8a-239" x="46.28" y="39.63" id="img-e572ec8a-364"/>
            <use xlink:href="#img-e572ec8a-239" x="46.48" y="39.63" id="img-e572ec8a-365"/>
            <use xlink:href="#img-e572ec8a-239" x="46.68" y="61.86" id="img-e572ec8a-366"/>
            <use xlink:href="#img-e572ec8a-239" x="46.87" y="75.85" id="img-e572ec8a-367"/>
            <use xlink:href="#img-e572ec8a-239" x="47.07" y="34.97" id="img-e572ec8a-368"/>
            <use xlink:href="#img-e572ec8a-239" x="47.27" y="68.32" id="img-e572ec8a-369"/>
            <use xlink:href="#img-e572ec8a-239" x="47.46" y="68.32" id="img-e572ec8a-370"/>
            <use xlink:href="#img-e572ec8a-239" x="47.66" y="68.32" id="img-e572ec8a-371"/>
            <use xlink:href="#img-e572ec8a-239" x="47.86" y="68.32" id="img-e572ec8a-372"/>
            <use xlink:href="#img-e572ec8a-239" x="48.06" y="68.32" id="img-e572ec8a-373"/>
            <use xlink:href="#img-e572ec8a-239" x="48.25" y="63.65" id="img-e572ec8a-374"/>
            <use xlink:href="#img-e572ec8a-239" x="48.45" y="72.98" id="img-e572ec8a-375"/>
            <use xlink:href="#img-e572ec8a-239" x="48.65" y="46.08" id="img-e572ec8a-376"/>
            <use xlink:href="#img-e572ec8a-239" x="48.85" y="72.98" id="img-e572ec8a-377"/>
            <use xlink:href="#img-e572ec8a-239" x="49.04" y="63.65" id="img-e572ec8a-378"/>
            <use xlink:href="#img-e572ec8a-239" x="49.24" y="72.98" id="img-e572ec8a-379"/>
            <use xlink:href="#img-e572ec8a-239" x="49.44" y="72.98" id="img-e572ec8a-380"/>
            <use xlink:href="#img-e572ec8a-239" x="49.63" y="41.42" id="img-e572ec8a-381"/>
            <use xlink:href="#img-e572ec8a-239" x="49.83" y="41.42" id="img-e572ec8a-382"/>
            <use xlink:href="#img-e572ec8a-239" x="50.03" y="70.11" id="img-e572ec8a-383"/>
            <use xlink:href="#img-e572ec8a-239" x="50.23" y="36.76" id="img-e572ec8a-384"/>
            <use xlink:href="#img-e572ec8a-239" x="50.42" y="36.76" id="img-e572ec8a-385"/>
            <use xlink:href="#img-e572ec8a-239" x="50.62" y="36.76" id="img-e572ec8a-386"/>
            <use xlink:href="#img-e572ec8a-239" x="50.82" y="70.11" id="img-e572ec8a-387"/>
            <use xlink:href="#img-e572ec8a-239" x="51.01" y="70.11" id="img-e572ec8a-388"/>
            <use xlink:href="#img-e572ec8a-239" x="51.21" y="72.98" id="img-e572ec8a-389"/>
            <use xlink:href="#img-e572ec8a-239" x="51.41" y="72.98" id="img-e572ec8a-390"/>
            <use xlink:href="#img-e572ec8a-239" x="51.61" y="70.11" id="img-e572ec8a-391"/>
            <use xlink:href="#img-e572ec8a-239" x="51.8" y="65.45" id="img-e572ec8a-392"/>
            <use xlink:href="#img-e572ec8a-239" x="52" y="70.11" id="img-e572ec8a-393"/>
            <use xlink:href="#img-e572ec8a-239" x="52.2" y="47.88" id="img-e572ec8a-394"/>
            <use xlink:href="#img-e572ec8a-239" x="52.39" y="65.45" id="img-e572ec8a-395"/>
            <use xlink:href="#img-e572ec8a-239" x="52.59" y="65.45" id="img-e572ec8a-396"/>
            <use xlink:href="#img-e572ec8a-239" x="52.79" y="65.45" id="img-e572ec8a-397"/>
            <use xlink:href="#img-e572ec8a-239" x="52.99" y="58.99" id="img-e572ec8a-398"/>
            <use xlink:href="#img-e572ec8a-239" x="53.18" y="74.77" id="img-e572ec8a-399"/>
            <use xlink:href="#img-e572ec8a-239" x="53.38" y="43.22" id="img-e572ec8a-400"/>
            <use xlink:href="#img-e572ec8a-239" x="53.58" y="70.11" id="img-e572ec8a-401"/>
            <use xlink:href="#img-e572ec8a-239" x="53.78" y="70.11" id="img-e572ec8a-402"/>
            <use xlink:href="#img-e572ec8a-239" x="53.97" y="38.55" id="img-e572ec8a-403"/>
            <use xlink:href="#img-e572ec8a-239" x="54.17" y="38.55" id="img-e572ec8a-404"/>
            <use xlink:href="#img-e572ec8a-239" x="54.37" y="38.55" id="img-e572ec8a-405"/>
            <use xlink:href="#img-e572ec8a-239" x="54.56" y="54.33" id="img-e572ec8a-406"/>
            <use xlink:href="#img-e572ec8a-239" x="54.76" y="74.77" id="img-e572ec8a-407"/>
            <use xlink:href="#img-e572ec8a-239" x="54.96" y="60.79" id="img-e572ec8a-408"/>
            <use xlink:href="#img-e572ec8a-239" x="55.16" y="74.77" id="img-e572ec8a-409"/>
            <use xlink:href="#img-e572ec8a-239" x="55.35" y="33.89" id="img-e572ec8a-410"/>
            <use xlink:href="#img-e572ec8a-239" x="55.55" y="67.24" id="img-e572ec8a-411"/>
            <use xlink:href="#img-e572ec8a-239" x="55.75" y="67.24" id="img-e572ec8a-412"/>
            <use xlink:href="#img-e572ec8a-239" x="55.94" y="67.24" id="img-e572ec8a-413"/>
            <use xlink:href="#img-e572ec8a-239" x="56.14" y="49.67" id="img-e572ec8a-414"/>
            <use xlink:href="#img-e572ec8a-239" x="56.34" y="71.9" id="img-e572ec8a-415"/>
            <use xlink:href="#img-e572ec8a-239" x="56.54" y="67.24" id="img-e572ec8a-416"/>
            <use xlink:href="#img-e572ec8a-239" x="56.73" y="67.24" id="img-e572ec8a-417"/>
            <use xlink:href="#img-e572ec8a-239" x="56.93" y="67.24" id="img-e572ec8a-418"/>
            <use xlink:href="#img-e572ec8a-239" x="57.13" y="71.9" id="img-e572ec8a-419"/>
            <use xlink:href="#img-e572ec8a-239" x="57.32" y="71.9" id="img-e572ec8a-420"/>
            <use xlink:href="#img-e572ec8a-239" x="57.52" y="45.01" id="img-e572ec8a-421"/>
            <use xlink:href="#img-e572ec8a-239" x="57.72" y="45.01" id="img-e572ec8a-422"/>
            <use xlink:href="#img-e572ec8a-239" x="57.92" y="71.9" id="img-e572ec8a-423"/>
            <use xlink:href="#img-e572ec8a-239" x="58.11" y="62.58" id="img-e572ec8a-424"/>
            <use xlink:href="#img-e572ec8a-239" x="58.31" y="71.9" id="img-e572ec8a-425"/>
            <use xlink:href="#img-e572ec8a-239" x="58.51" y="62.58" id="img-e572ec8a-426"/>
            <use xlink:href="#img-e572ec8a-239" x="58.71" y="40.35" id="img-e572ec8a-427"/>
            <use xlink:href="#img-e572ec8a-239" x="58.9" y="40.35" id="img-e572ec8a-428"/>
            <use xlink:href="#img-e572ec8a-239" x="59.1" y="40.35" id="img-e572ec8a-429"/>
            <use xlink:href="#img-e572ec8a-239" x="59.3" y="62.58" id="img-e572ec8a-430"/>
            <use xlink:href="#img-e572ec8a-239" x="59.49" y="73.69" id="img-e572ec8a-431"/>
            <use xlink:href="#img-e572ec8a-239" x="59.69" y="35.69" id="img-e572ec8a-432"/>
            <use xlink:href="#img-e572ec8a-239" x="59.89" y="35.69" id="img-e572ec8a-433"/>
            <use xlink:href="#img-e572ec8a-239" x="60.09" y="35.69" id="img-e572ec8a-434"/>
            <use xlink:href="#img-e572ec8a-239" x="60.28" y="69.03" id="img-e572ec8a-435"/>
            <use xlink:href="#img-e572ec8a-239" x="60.48" y="69.03" id="img-e572ec8a-436"/>
            <use xlink:href="#img-e572ec8a-239" x="60.68" y="69.03" id="img-e572ec8a-437"/>
            <use xlink:href="#img-e572ec8a-239" x="60.87" y="35.69" id="img-e572ec8a-438"/>
            <use xlink:href="#img-e572ec8a-239" x="61.07" y="69.03" id="img-e572ec8a-439"/>
            <use xlink:href="#img-e572ec8a-239" x="61.27" y="71.9" id="img-e572ec8a-440"/>
            <use xlink:href="#img-e572ec8a-239" x="61.47" y="69.03" id="img-e572ec8a-441"/>
            <use xlink:href="#img-e572ec8a-239" x="61.66" y="64.37" id="img-e572ec8a-442"/>
            <use xlink:href="#img-e572ec8a-239" x="61.86" y="69.03" id="img-e572ec8a-443"/>
            <use xlink:href="#img-e572ec8a-239" x="62.06" y="69.03" id="img-e572ec8a-444"/>
            <use xlink:href="#img-e572ec8a-239" x="62.25" y="46.8" id="img-e572ec8a-445"/>
            <use xlink:href="#img-e572ec8a-239" x="62.45" y="46.8" id="img-e572ec8a-446"/>
            <use xlink:href="#img-e572ec8a-239" x="62.65" y="73.69" id="img-e572ec8a-447"/>
            <use xlink:href="#img-e572ec8a-239" x="62.85" y="64.37" id="img-e572ec8a-448"/>
            <use xlink:href="#img-e572ec8a-239" x="63.04" y="64.37" id="img-e572ec8a-449"/>
            <use xlink:href="#img-e572ec8a-239" x="63.24" y="64.37" id="img-e572ec8a-450"/>
            <use xlink:href="#img-e572ec8a-239" x="63.44" y="73.69" id="img-e572ec8a-451"/>
            <use xlink:href="#img-e572ec8a-239" x="63.64" y="73.69" id="img-e572ec8a-452"/>
            <use xlink:href="#img-e572ec8a-239" x="63.83" y="42.14" id="img-e572ec8a-453"/>
            <use xlink:href="#img-e572ec8a-239" x="64.03" y="42.14" id="img-e572ec8a-454"/>
            <use xlink:href="#img-e572ec8a-239" x="64.23" y="37.48" id="img-e572ec8a-455"/>
            <use xlink:href="#img-e572ec8a-239" x="64.42" y="69.03" id="img-e572ec8a-456"/>
            <use xlink:href="#img-e572ec8a-239" x="64.62" y="37.48" id="img-e572ec8a-457"/>
            <use xlink:href="#img-e572ec8a-239" x="64.82" y="59.71" id="img-e572ec8a-458"/>
            <use xlink:href="#img-e572ec8a-239" x="65.02" y="37.48" id="img-e572ec8a-459"/>
            <use xlink:href="#img-e572ec8a-239" x="65.21" y="37.48" id="img-e572ec8a-460"/>
            <use xlink:href="#img-e572ec8a-239" x="65.41" y="53.26" id="img-e572ec8a-461"/>
            <use xlink:href="#img-e572ec8a-239" x="65.61" y="53.26" id="img-e572ec8a-462"/>
            <use xlink:href="#img-e572ec8a-239" x="65.8" y="70.83" id="img-e572ec8a-463"/>
            <use xlink:href="#img-e572ec8a-239" x="66" y="59.71" id="img-e572ec8a-464"/>
            <use xlink:href="#img-e572ec8a-239" x="66.2" y="73.69" id="img-e572ec8a-465"/>
            <use xlink:href="#img-e572ec8a-239" x="66.4" y="73.69" id="img-e572ec8a-466"/>
            <use xlink:href="#img-e572ec8a-239" x="66.59" y="66.16" id="img-e572ec8a-467"/>
            <use xlink:href="#img-e572ec8a-239" x="66.79" y="66.16" id="img-e572ec8a-468"/>
            <use xlink:href="#img-e572ec8a-239" x="66.99" y="66.16" id="img-e572ec8a-469"/>
            <use xlink:href="#img-e572ec8a-239" x="67.18" y="32.82" id="img-e572ec8a-470"/>
            <use xlink:href="#img-e572ec8a-239" x="67.38" y="70.83" id="img-e572ec8a-471"/>
            <use xlink:href="#img-e572ec8a-239" x="67.58" y="48.59" id="img-e572ec8a-472"/>
            <use xlink:href="#img-e572ec8a-239" x="67.78" y="70.83" id="img-e572ec8a-473"/>
            <use xlink:href="#img-e572ec8a-239" x="67.97" y="32.82" id="img-e572ec8a-474"/>
            <use xlink:href="#img-e572ec8a-239" x="68.17" y="66.16" id="img-e572ec8a-475"/>
            <use xlink:href="#img-e572ec8a-239" x="68.37" y="66.16" id="img-e572ec8a-476"/>
            <use xlink:href="#img-e572ec8a-239" x="68.57" y="66.16" id="img-e572ec8a-477"/>
            <use xlink:href="#img-e572ec8a-239" x="68.76" y="59.71" id="img-e572ec8a-478"/>
            <use xlink:href="#img-e572ec8a-239" x="68.96" y="70.83" id="img-e572ec8a-479"/>
            <use xlink:href="#img-e572ec8a-239" x="69.16" y="70.83" id="img-e572ec8a-480"/>
            <use xlink:href="#img-e572ec8a-239" x="69.35" y="43.93" id="img-e572ec8a-481"/>
            <use xlink:href="#img-e572ec8a-239" x="69.55" y="43.93" id="img-e572ec8a-482"/>
            <use xlink:href="#img-e572ec8a-239" x="69.75" y="70.83" id="img-e572ec8a-483"/>
            <use xlink:href="#img-e572ec8a-239" x="69.95" y="70.83" id="img-e572ec8a-484"/>
            <use xlink:href="#img-e572ec8a-239" x="70.14" y="61.5" id="img-e572ec8a-485"/>
            <use xlink:href="#img-e572ec8a-239" x="70.34" y="61.5" id="img-e572ec8a-486"/>
            <use xlink:href="#img-e572ec8a-239" x="70.54" y="39.27" id="img-e572ec8a-487"/>
            <use xlink:href="#img-e572ec8a-239" x="70.73" y="61.5" id="img-e572ec8a-488"/>
            <use xlink:href="#img-e572ec8a-239" x="70.93" y="39.27" id="img-e572ec8a-489"/>
            <use xlink:href="#img-e572ec8a-239" x="71.13" y="55.05" id="img-e572ec8a-490"/>
            <use xlink:href="#img-e572ec8a-239" x="71.33" y="39.27" id="img-e572ec8a-491"/>
            <use xlink:href="#img-e572ec8a-239" x="71.52" y="39.27" id="img-e572ec8a-492"/>
            <use xlink:href="#img-e572ec8a-239" x="71.72" y="61.5" id="img-e572ec8a-493"/>
            <use xlink:href="#img-e572ec8a-239" x="71.92" y="61.5" id="img-e572ec8a-494"/>
            <use xlink:href="#img-e572ec8a-239" x="72.11" y="75.49" id="img-e572ec8a-495"/>
            <use xlink:href="#img-e572ec8a-239" x="72.31" y="34.61" id="img-e572ec8a-496"/>
            <use xlink:href="#img-e572ec8a-239" x="72.51" y="34.61" id="img-e572ec8a-497"/>
            <use xlink:href="#img-e572ec8a-239" x="72.71" y="34.61" id="img-e572ec8a-498"/>
            <use xlink:href="#img-e572ec8a-239" x="72.9" y="67.96" id="img-e572ec8a-499"/>
            <use xlink:href="#img-e572ec8a-239" x="73.1" y="67.96" id="img-e572ec8a-500"/>
            <use xlink:href="#img-e572ec8a-239" x="73.3" y="67.96" id="img-e572ec8a-501"/>
            <use xlink:href="#img-e572ec8a-239" x="73.5" y="50.39" id="img-e572ec8a-502"/>
            <use xlink:href="#img-e572ec8a-239" x="73.69" y="67.96" id="img-e572ec8a-503"/>
            <use xlink:href="#img-e572ec8a-239" x="73.89" y="34.61" id="img-e572ec8a-504"/>
            <use xlink:href="#img-e572ec8a-239" x="74.09" y="67.96" id="img-e572ec8a-505"/>
            <use xlink:href="#img-e572ec8a-239" x="74.28" y="70.83" id="img-e572ec8a-506"/>
            <use xlink:href="#img-e572ec8a-239" x="74.48" y="67.96" id="img-e572ec8a-507"/>
            <use xlink:href="#img-e572ec8a-239" x="74.68" y="67.96" id="img-e572ec8a-508"/>
            <use xlink:href="#img-e572ec8a-239" x="74.88" y="63.3" id="img-e572ec8a-509"/>
            <use xlink:href="#img-e572ec8a-239" x="75.07" y="63.3" id="img-e572ec8a-510"/>
            <use xlink:href="#img-e572ec8a-239" x="75.27" y="72.62" id="img-e572ec8a-511"/>
            <use xlink:href="#img-e572ec8a-239" x="75.47" y="67.96" id="img-e572ec8a-512"/>
            <use xlink:href="#img-e572ec8a-239" x="75.66" y="45.73" id="img-e572ec8a-513"/>
            <use xlink:href="#img-e572ec8a-239" x="75.86" y="45.73" id="img-e572ec8a-514"/>
            <use xlink:href="#img-e572ec8a-239" x="76.06" y="72.62" id="img-e572ec8a-515"/>
            <use xlink:href="#img-e572ec8a-239" x="76.26" y="72.62" id="img-e572ec8a-516"/>
            <use xlink:href="#img-e572ec8a-239" x="76.45" y="63.3" id="img-e572ec8a-517"/>
            <use xlink:href="#img-e572ec8a-239" x="76.65" y="63.3" id="img-e572ec8a-518"/>
            <use xlink:href="#img-e572ec8a-239" x="76.85" y="72.62" id="img-e572ec8a-519"/>
            <use xlink:href="#img-e572ec8a-239" x="77.04" y="63.3" id="img-e572ec8a-520"/>
            <use xlink:href="#img-e572ec8a-239" x="77.24" y="72.62" id="img-e572ec8a-521"/>
            <use xlink:href="#img-e572ec8a-239" x="77.44" y="56.84" id="img-e572ec8a-522"/>
            <use xlink:href="#img-e572ec8a-239" x="77.64" y="41.06" id="img-e572ec8a-523"/>
            <use xlink:href="#img-e572ec8a-239" x="77.83" y="41.06" id="img-e572ec8a-524"/>
            <use xlink:href="#img-e572ec8a-239" x="78.03" y="41.06" id="img-e572ec8a-525"/>
            <use xlink:href="#img-e572ec8a-239" x="78.23" y="63.3" id="img-e572ec8a-526"/>
            <use xlink:href="#img-e572ec8a-239" x="78.43" y="69.75" id="img-e572ec8a-527"/>
            <use xlink:href="#img-e572ec8a-239" x="78.62" y="67.96" id="img-e572ec8a-528"/>
            <use xlink:href="#img-e572ec8a-239" x="78.82" y="36.4" id="img-e572ec8a-529"/>
            <use xlink:href="#img-e572ec8a-239" x="79.02" y="36.4" id="img-e572ec8a-530"/>
            <use xlink:href="#img-e572ec8a-239" x="79.21" y="36.4" id="img-e572ec8a-531"/>
            <use xlink:href="#img-e572ec8a-239" x="79.41" y="36.4" id="img-e572ec8a-532"/>
            <use xlink:href="#img-e572ec8a-239" x="79.61" y="36.4" id="img-e572ec8a-533"/>
            <use xlink:href="#img-e572ec8a-239" x="79.81" y="58.63" id="img-e572ec8a-534"/>
            <use xlink:href="#img-e572ec8a-239" x="80" y="69.75" id="img-e572ec8a-535"/>
            <use xlink:href="#img-e572ec8a-239" x="80.2" y="52.18" id="img-e572ec8a-536"/>
            <use xlink:href="#img-e572ec8a-239" x="80.4" y="69.75" id="img-e572ec8a-537"/>
            <use xlink:href="#img-e572ec8a-239" x="80.59" y="36.4" id="img-e572ec8a-538"/>
            <use xlink:href="#img-e572ec8a-239" x="80.79" y="72.62" id="img-e572ec8a-539"/>
            <use xlink:href="#img-e572ec8a-239" x="80.99" y="72.62" id="img-e572ec8a-540"/>
            <use xlink:href="#img-e572ec8a-239" x="81.19" y="72.62" id="img-e572ec8a-541"/>
            <use xlink:href="#img-e572ec8a-239" x="81.38" y="63.3" id="img-e572ec8a-542"/>
            <use xlink:href="#img-e572ec8a-239" x="81.58" y="69.75" id="img-e572ec8a-543"/>
            <use xlink:href="#img-e572ec8a-239" x="81.78" y="65.09" id="img-e572ec8a-544"/>
            <use xlink:href="#img-e572ec8a-239" x="81.97" y="65.09" id="img-e572ec8a-545"/>
            <use xlink:href="#img-e572ec8a-239" x="82.17" y="65.09" id="img-e572ec8a-546"/>
            <use xlink:href="#img-e572ec8a-239" x="82.37" y="69.75" id="img-e572ec8a-547"/>
            <use xlink:href="#img-e572ec8a-239" x="82.57" y="69.75" id="img-e572ec8a-548"/>
            <use xlink:href="#img-e572ec8a-239" x="82.76" y="47.52" id="img-e572ec8a-549"/>
            <use xlink:href="#img-e572ec8a-239" x="82.96" y="47.52" id="img-e572ec8a-550"/>
            <use xlink:href="#img-e572ec8a-239" x="83.16" y="65.09" id="img-e572ec8a-551"/>
            <use xlink:href="#img-e572ec8a-239" x="83.36" y="31.74" id="img-e572ec8a-552"/>
            <use xlink:href="#img-e572ec8a-239" x="83.55" y="65.09" id="img-e572ec8a-553"/>
            <use xlink:href="#img-e572ec8a-239" x="83.75" y="65.09" id="img-e572ec8a-554"/>
            <use xlink:href="#img-e572ec8a-239" x="83.95" y="65.09" id="img-e572ec8a-555"/>
            <use xlink:href="#img-e572ec8a-239" x="84.14" y="65.09" id="img-e572ec8a-556"/>
            <use xlink:href="#img-e572ec8a-239" x="84.34" y="58.63" id="img-e572ec8a-557"/>
            <use xlink:href="#img-e572ec8a-239" x="84.54" y="58.63" id="img-e572ec8a-558"/>
            <use xlink:href="#img-e572ec8a-239" x="84.74" y="74.41" id="img-e572ec8a-559"/>
            <use xlink:href="#img-e572ec8a-239" x="84.93" y="69.75" id="img-e572ec8a-560"/>
            <use xlink:href="#img-e572ec8a-239" x="85.13" y="42.86" id="img-e572ec8a-561"/>
            <use xlink:href="#img-e572ec8a-239" x="85.33" y="42.86" id="img-e572ec8a-562"/>
            <use xlink:href="#img-e572ec8a-239" x="85.52" y="69.75" id="img-e572ec8a-563"/>
            <use xlink:href="#img-e572ec8a-239" x="85.72" y="69.75" id="img-e572ec8a-564"/>
            <use xlink:href="#img-e572ec8a-239" x="85.92" y="69.75" id="img-e572ec8a-565"/>
            <use xlink:href="#img-e572ec8a-239" x="86.12" y="27.08" id="img-e572ec8a-566"/>
            <use xlink:href="#img-e572ec8a-239" x="86.31" y="38.2" id="img-e572ec8a-567"/>
            <use xlink:href="#img-e572ec8a-239" x="86.51" y="60.43" id="img-e572ec8a-568"/>
            <use xlink:href="#img-e572ec8a-239" x="86.71" y="38.2" id="img-e572ec8a-569"/>
            <use xlink:href="#img-e572ec8a-239" x="86.9" y="69.75" id="img-e572ec8a-570"/>
            <use xlink:href="#img-e572ec8a-239" x="87.1" y="38.2" id="img-e572ec8a-571"/>
            <use xlink:href="#img-e572ec8a-239" x="87.3" y="38.2" id="img-e572ec8a-572"/>
            <use xlink:href="#img-e572ec8a-239" x="87.5" y="53.97" id="img-e572ec8a-573"/>
            <use xlink:href="#img-e572ec8a-239" x="87.69" y="53.97" id="img-e572ec8a-574"/>
            <use xlink:href="#img-e572ec8a-239" x="87.89" y="74.41" id="img-e572ec8a-575"/>
            <use xlink:href="#img-e572ec8a-239" x="88.09" y="38.2" id="img-e572ec8a-576"/>
            <use xlink:href="#img-e572ec8a-239" x="88.29" y="60.43" id="img-e572ec8a-577"/>
            <use xlink:href="#img-e572ec8a-239" x="88.48" y="60.43" id="img-e572ec8a-578"/>
            <use xlink:href="#img-e572ec8a-239" x="88.68" y="74.41" id="img-e572ec8a-579"/>
            <use xlink:href="#img-e572ec8a-239" x="88.88" y="74.41" id="img-e572ec8a-580"/>
            <use xlink:href="#img-e572ec8a-239" x="89.07" y="33.53" id="img-e572ec8a-581"/>
            <use xlink:href="#img-e572ec8a-239" x="89.27" y="33.53" id="img-e572ec8a-582"/>
            <use xlink:href="#img-e572ec8a-239" x="89.47" y="66.88" id="img-e572ec8a-583"/>
            <use xlink:href="#img-e572ec8a-239" x="89.67" y="33.53" id="img-e572ec8a-584"/>
            <use xlink:href="#img-e572ec8a-239" x="89.86" y="66.88" id="img-e572ec8a-585"/>
            <use xlink:href="#img-e572ec8a-239" x="90.06" y="33.53" id="img-e572ec8a-586"/>
            <use xlink:href="#img-e572ec8a-239" x="90.26" y="66.88" id="img-e572ec8a-587"/>
            <use xlink:href="#img-e572ec8a-239" x="90.45" y="66.88" id="img-e572ec8a-588"/>
            <use xlink:href="#img-e572ec8a-239" x="90.65" y="49.31" id="img-e572ec8a-589"/>
            <use xlink:href="#img-e572ec8a-239" x="90.85" y="49.31" id="img-e572ec8a-590"/>
            <use xlink:href="#img-e572ec8a-239" x="91.05" y="71.54" id="img-e572ec8a-591"/>
            <use xlink:href="#img-e572ec8a-239" x="91.24" y="33.53" id="img-e572ec8a-592"/>
            <use xlink:href="#img-e572ec8a-239" x="91.44" y="66.88" id="img-e572ec8a-593"/>
            <use xlink:href="#img-e572ec8a-239" x="91.64" y="66.88" id="img-e572ec8a-594"/>
            <use xlink:href="#img-e572ec8a-239" x="91.83" y="66.88" id="img-e572ec8a-595"/>
            <use xlink:href="#img-e572ec8a-239" x="92.03" y="66.88" id="img-e572ec8a-596"/>
            <use xlink:href="#img-e572ec8a-239" x="92.23" y="66.88" id="img-e572ec8a-597"/>
            <use xlink:href="#img-e572ec8a-239" x="92.43" y="60.43" id="img-e572ec8a-598"/>
            <use xlink:href="#img-e572ec8a-239" x="92.62" y="71.54" id="img-e572ec8a-599"/>
            <use xlink:href="#img-e572ec8a-239" x="92.82" y="62.22" id="img-e572ec8a-600"/>
            <use xlink:href="#img-e572ec8a-239" x="93.02" y="71.54" id="img-e572ec8a-601"/>
            <use xlink:href="#img-e572ec8a-239" x="93.22" y="62.22" id="img-e572ec8a-602"/>
            <use xlink:href="#img-e572ec8a-239" x="93.41" y="44.65" id="img-e572ec8a-603"/>
            <use xlink:href="#img-e572ec8a-239" x="93.61" y="44.65" id="img-e572ec8a-604"/>
            <use xlink:href="#img-e572ec8a-239" x="93.81" y="44.65" id="img-e572ec8a-605"/>
            <use xlink:href="#img-e572ec8a-239" x="94" y="62.22" id="img-e572ec8a-606"/>
            <use xlink:href="#img-e572ec8a-239" x="94.2" y="71.54" id="img-e572ec8a-607"/>
            <use xlink:href="#img-e572ec8a-239" x="94.4" y="71.54" id="img-e572ec8a-608"/>
            <use xlink:href="#img-e572ec8a-239" x="94.6" y="62.22" id="img-e572ec8a-609"/>
            <use xlink:href="#img-e572ec8a-239" x="94.79" y="62.22" id="img-e572ec8a-610"/>
            <use xlink:href="#img-e572ec8a-239" x="94.99" y="71.54" id="img-e572ec8a-611"/>
            <use xlink:href="#img-e572ec8a-239" x="95.19" y="71.54" id="img-e572ec8a-612"/>
            <use xlink:href="#img-e572ec8a-239" x="95.38" y="62.22" id="img-e572ec8a-613"/>
            <use xlink:href="#img-e572ec8a-239" x="95.58" y="62.22" id="img-e572ec8a-614"/>
            <use xlink:href="#img-e572ec8a-239" x="95.78" y="39.99" id="img-e572ec8a-615"/>
            <use xlink:href="#img-e572ec8a-239" x="95.98" y="55.77" id="img-e572ec8a-616"/>
            <use xlink:href="#img-e572ec8a-239" x="96.17" y="39.99" id="img-e572ec8a-617"/>
            <use xlink:href="#img-e572ec8a-239" x="96.37" y="57.56" id="img-e572ec8a-618"/>
            <use xlink:href="#img-e572ec8a-239" x="96.57" y="39.99" id="img-e572ec8a-619"/>
            <use xlink:href="#img-e572ec8a-239" x="96.76" y="39.99" id="img-e572ec8a-620"/>
            <use xlink:href="#img-e572ec8a-239" x="96.96" y="62.22" id="img-e572ec8a-621"/>
            <use xlink:href="#img-e572ec8a-239" x="97.16" y="62.22" id="img-e572ec8a-622"/>
            <use xlink:href="#img-e572ec8a-239" x="97.36" y="73.34" id="img-e572ec8a-623"/>
            <use xlink:href="#img-e572ec8a-239" x="97.55" y="66.88" id="img-e572ec8a-624"/>
            <use xlink:href="#img-e572ec8a-239" x="97.75" y="35.33" id="img-e572ec8a-625"/>
            <use xlink:href="#img-e572ec8a-239" x="97.95" y="35.33" id="img-e572ec8a-626"/>
            <use xlink:href="#img-e572ec8a-239" x="98.15" y="35.33" id="img-e572ec8a-627"/>
            <use xlink:href="#img-e572ec8a-239" x="98.34" y="35.33" id="img-e572ec8a-628"/>
            <use xlink:href="#img-e572ec8a-239" x="98.54" y="35.33" id="img-e572ec8a-629"/>
            <use xlink:href="#img-e572ec8a-239" x="98.74" y="35.33" id="img-e572ec8a-630"/>
            <use xlink:href="#img-e572ec8a-239" x="98.93" y="68.67" id="img-e572ec8a-631"/>
            <use xlink:href="#img-e572ec8a-239" x="99.13" y="57.56" id="img-e572ec8a-632"/>
            <use xlink:href="#img-e572ec8a-239" x="99.33" y="68.67" id="img-e572ec8a-633"/>
            <use xlink:href="#img-e572ec8a-239" x="99.53" y="51.1" id="img-e572ec8a-634"/>
            <use xlink:href="#img-e572ec8a-239" x="99.72" y="68.67" id="img-e572ec8a-635"/>
            <use xlink:href="#img-e572ec8a-239" x="99.92" y="68.67" id="img-e572ec8a-636"/>
            <use xlink:href="#img-e572ec8a-239" x="100.12" y="35.33" id="img-e572ec8a-637"/>
            <use xlink:href="#img-e572ec8a-239" x="100.31" y="35.33" id="img-e572ec8a-638"/>
            <use xlink:href="#img-e572ec8a-239" x="100.51" y="68.67" id="img-e572ec8a-639"/>
            <use xlink:href="#img-e572ec8a-239" x="100.71" y="71.54" id="img-e572ec8a-640"/>
            <use xlink:href="#img-e572ec8a-239" x="100.91" y="71.54" id="img-e572ec8a-641"/>
            <use xlink:href="#img-e572ec8a-239" x="101.1" y="71.54" id="img-e572ec8a-642"/>
            <use xlink:href="#img-e572ec8a-239" x="101.3" y="68.67" id="img-e572ec8a-643"/>
            <use xlink:href="#img-e572ec8a-239" x="101.5" y="68.67" id="img-e572ec8a-644"/>
            <use xlink:href="#img-e572ec8a-239" x="101.69" y="64.01" id="img-e572ec8a-645"/>
            <use xlink:href="#img-e572ec8a-239" x="101.89" y="64.01" id="img-e572ec8a-646"/>
            <use xlink:href="#img-e572ec8a-239" x="102.09" y="68.67" id="img-e572ec8a-647"/>
            <use xlink:href="#img-e572ec8a-239" x="102.29" y="64.01" id="img-e572ec8a-648"/>
            <use xlink:href="#img-e572ec8a-239" x="102.48" y="68.67" id="img-e572ec8a-649"/>
            <use xlink:href="#img-e572ec8a-239" x="102.68" y="30.67" id="img-e572ec8a-650"/>
            <use xlink:href="#img-e572ec8a-239" x="102.88" y="46.44" id="img-e572ec8a-651"/>
            <use xlink:href="#img-e572ec8a-239" x="103.08" y="46.44" id="img-e572ec8a-652"/>
            <use xlink:href="#img-e572ec8a-239" x="103.27" y="46.44" id="img-e572ec8a-653"/>
            <use xlink:href="#img-e572ec8a-239" x="103.47" y="30.67" id="img-e572ec8a-654"/>
            <use xlink:href="#img-e572ec8a-239" x="103.67" y="73.34" id="img-e572ec8a-655"/>
            <use xlink:href="#img-e572ec8a-239" x="103.86" y="30.67" id="img-e572ec8a-656"/>
            <use xlink:href="#img-e572ec8a-239" x="104.06" y="64.01" id="img-e572ec8a-657"/>
            <use xlink:href="#img-e572ec8a-239" x="104.26" y="64.01" id="img-e572ec8a-658"/>
            <use xlink:href="#img-e572ec8a-239" x="104.46" y="64.01" id="img-e572ec8a-659"/>
            <use xlink:href="#img-e572ec8a-239" x="104.65" y="64.01" id="img-e572ec8a-660"/>
            <use xlink:href="#img-e572ec8a-239" x="104.85" y="64.01" id="img-e572ec8a-661"/>
            <use xlink:href="#img-e572ec8a-239" x="105.05" y="66.88" id="img-e572ec8a-662"/>
            <use xlink:href="#img-e572ec8a-239" x="105.24" y="73.34" id="img-e572ec8a-663"/>
            <use xlink:href="#img-e572ec8a-239" x="105.44" y="57.56" id="img-e572ec8a-664"/>
            <use xlink:href="#img-e572ec8a-239" x="105.64" y="73.34" id="img-e572ec8a-665"/>
            <use xlink:href="#img-e572ec8a-239" x="105.84" y="59.35" id="img-e572ec8a-666"/>
            <use xlink:href="#img-e572ec8a-239" x="106.03" y="41.78" id="img-e572ec8a-667"/>
            <use xlink:href="#img-e572ec8a-239" x="106.23" y="41.78" id="img-e572ec8a-668"/>
            <use xlink:href="#img-e572ec8a-239" x="106.43" y="41.78" id="img-e572ec8a-669"/>
            <use xlink:href="#img-e572ec8a-239" x="106.62" y="64.01" id="img-e572ec8a-670"/>
            <use xlink:href="#img-e572ec8a-239" x="106.82" y="37.12" id="img-e572ec8a-671"/>
            <use xlink:href="#img-e572ec8a-239" x="107.02" y="68.67" id="img-e572ec8a-672"/>
            <use xlink:href="#img-e572ec8a-239" x="107.22" y="68.67" id="img-e572ec8a-673"/>
            <use xlink:href="#img-e572ec8a-239" x="107.41" y="68.67" id="img-e572ec8a-674"/>
            <use xlink:href="#img-e572ec8a-239" x="107.61" y="37.12" id="img-e572ec8a-675"/>
            <use xlink:href="#img-e572ec8a-239" x="107.81" y="37.12" id="img-e572ec8a-676"/>
            <use xlink:href="#img-e572ec8a-239" x="108" y="59.35" id="img-e572ec8a-677"/>
            <use xlink:href="#img-e572ec8a-239" x="108.2" y="59.35" id="img-e572ec8a-678"/>
            <use xlink:href="#img-e572ec8a-239" x="108.4" y="37.12" id="img-e572ec8a-679"/>
            <use xlink:href="#img-e572ec8a-239" x="108.6" y="68.67" id="img-e572ec8a-680"/>
            <use xlink:href="#img-e572ec8a-239" x="108.79" y="37.12" id="img-e572ec8a-681"/>
            <use xlink:href="#img-e572ec8a-239" x="108.99" y="59.35" id="img-e572ec8a-682"/>
            <use xlink:href="#img-e572ec8a-239" x="109.19" y="52.9" id="img-e572ec8a-683"/>
            <use xlink:href="#img-e572ec8a-239" x="109.39" y="52.9" id="img-e572ec8a-684"/>
            <use xlink:href="#img-e572ec8a-239" x="109.58" y="52.9" id="img-e572ec8a-685"/>
            <use xlink:href="#img-e572ec8a-239" x="109.78" y="43.57" id="img-e572ec8a-686"/>
            <use xlink:href="#img-e572ec8a-239" x="109.98" y="70.47" id="img-e572ec8a-687"/>
            <use xlink:href="#img-e572ec8a-239" x="110.17" y="37.12" id="img-e572ec8a-688"/>
            <use xlink:href="#img-e572ec8a-239" x="110.37" y="59.35" id="img-e572ec8a-689"/>
            <use xlink:href="#img-e572ec8a-239" x="110.57" y="59.35" id="img-e572ec8a-690"/>
            <use xlink:href="#img-e572ec8a-239" x="110.77" y="73.34" id="img-e572ec8a-691"/>
            <use xlink:href="#img-e572ec8a-239" x="110.96" y="73.34" id="img-e572ec8a-692"/>
            <use xlink:href="#img-e572ec8a-239" x="111.16" y="73.34" id="img-e572ec8a-693"/>
            <use xlink:href="#img-e572ec8a-239" x="111.36" y="64.01" id="img-e572ec8a-694"/>
            <use xlink:href="#img-e572ec8a-239" x="111.55" y="65.81" id="img-e572ec8a-695"/>
            <use xlink:href="#img-e572ec8a-239" x="111.75" y="32.46" id="img-e572ec8a-696"/>
            <use xlink:href="#img-e572ec8a-239" x="111.95" y="65.81" id="img-e572ec8a-697"/>
            <use xlink:href="#img-e572ec8a-239" x="112.15" y="32.46" id="img-e572ec8a-698"/>
            <use xlink:href="#img-e572ec8a-239" x="112.34" y="65.81" id="img-e572ec8a-699"/>
            <use xlink:href="#img-e572ec8a-239" x="112.54" y="65.81" id="img-e572ec8a-700"/>
            <use xlink:href="#img-e572ec8a-239" x="112.74" y="32.46" id="img-e572ec8a-701"/>
            <use xlink:href="#img-e572ec8a-239" x="112.93" y="32.46" id="img-e572ec8a-702"/>
            <use xlink:href="#img-e572ec8a-239" x="113.13" y="70.47" id="img-e572ec8a-703"/>
            <use xlink:href="#img-e572ec8a-239" x="113.33" y="65.81" id="img-e572ec8a-704"/>
            <use xlink:href="#img-e572ec8a-239" x="113.53" y="48.24" id="img-e572ec8a-705"/>
            <use xlink:href="#img-e572ec8a-239" x="113.72" y="48.24" id="img-e572ec8a-706"/>
            <use xlink:href="#img-e572ec8a-239" x="113.92" y="70.47" id="img-e572ec8a-707"/>
            <use xlink:href="#img-e572ec8a-239" x="114.12" y="70.47" id="img-e572ec8a-708"/>
            <use xlink:href="#img-e572ec8a-239" x="114.32" y="32.46" id="img-e572ec8a-709"/>
            <use xlink:href="#img-e572ec8a-239" x="114.51" y="32.46" id="img-e572ec8a-710"/>
            <use xlink:href="#img-e572ec8a-239" x="114.71" y="65.81" id="img-e572ec8a-711"/>
            <use xlink:href="#img-e572ec8a-239" x="114.91" y="65.81" id="img-e572ec8a-712"/>
            <use xlink:href="#img-e572ec8a-239" x="115.1" y="65.81" id="img-e572ec8a-713"/>
            <use xlink:href="#img-e572ec8a-239" x="115.3" y="68.67" id="img-e572ec8a-714"/>
            <use xlink:href="#img-e572ec8a-239" x="115.5" y="65.81" id="img-e572ec8a-715"/>
            <use xlink:href="#img-e572ec8a-239" x="115.7" y="65.81" id="img-e572ec8a-716"/>
            <use xlink:href="#img-e572ec8a-239" x="115.89" y="59.35" id="img-e572ec8a-717"/>
            <use xlink:href="#img-e572ec8a-239" x="116.09" y="59.35" id="img-e572ec8a-718"/>
            <use xlink:href="#img-e572ec8a-239" x="116.29" y="70.47" id="img-e572ec8a-719"/>
            <use xlink:href="#img-e572ec8a-239" x="116.48" y="61.14" id="img-e572ec8a-720"/>
            <use xlink:href="#img-e572ec8a-239" x="116.68" y="70.47" id="img-e572ec8a-721"/>
            <use xlink:href="#img-e572ec8a-239" x="116.88" y="70.47" id="img-e572ec8a-722"/>
            <use xlink:href="#img-e572ec8a-239" x="117.08" y="43.57" id="img-e572ec8a-723"/>
            <use xlink:href="#img-e572ec8a-239" x="117.27" y="43.57" id="img-e572ec8a-724"/>
            <use xlink:href="#img-e572ec8a-239" x="117.47" y="43.57" id="img-e572ec8a-725"/>
            <use xlink:href="#img-e572ec8a-239" x="117.67" y="27.8" id="img-e572ec8a-726"/>
            <use xlink:href="#img-e572ec8a-239" x="117.86" y="70.47" id="img-e572ec8a-727"/>
            <use xlink:href="#img-e572ec8a-239" x="118.06" y="61.14" id="img-e572ec8a-728"/>
            <use xlink:href="#img-e572ec8a-239" x="118.26" y="70.47" id="img-e572ec8a-729"/>
            <use xlink:href="#img-e572ec8a-239" x="118.46" y="27.8" id="img-e572ec8a-730"/>
            <use xlink:href="#img-e572ec8a-239" x="118.65" y="61.14" id="img-e572ec8a-731"/>
            <use xlink:href="#img-e572ec8a-239" x="118.85" y="61.14" id="img-e572ec8a-732"/>
            <use xlink:href="#img-e572ec8a-239" x="119.05" y="61.14" id="img-e572ec8a-733"/>
            <use xlink:href="#img-e572ec8a-239" x="119.25" y="43.57" id="img-e572ec8a-734"/>
            <use xlink:href="#img-e572ec8a-239" x="119.44" y="38.91" id="img-e572ec8a-735"/>
            <use xlink:href="#img-e572ec8a-239" x="119.64" y="70.47" id="img-e572ec8a-736"/>
            <use xlink:href="#img-e572ec8a-239" x="119.84" y="61.14" id="img-e572ec8a-737"/>
            <use xlink:href="#img-e572ec8a-239" x="120.03" y="61.14" id="img-e572ec8a-738"/>
            <use xlink:href="#img-e572ec8a-239" x="120.23" y="38.91" id="img-e572ec8a-739"/>
          </g>
          <g fill="#00BFFF" stroke="#FFFFFF" class="color_odd" id="img-e572ec8a-740">
            <use xlink:href="#img-e572ec8a-741" x="21.73" y="78.71" id="img-e572ec8a-742"/>
            <use xlink:href="#img-e572ec8a-741" x="21.93" y="76.2" id="img-e572ec8a-743"/>
            <use xlink:href="#img-e572ec8a-741" x="22.12" y="76.92" id="img-e572ec8a-744"/>
            <use xlink:href="#img-e572ec8a-741" x="22.32" y="72.98" id="img-e572ec8a-745"/>
            <use xlink:href="#img-e572ec8a-741" x="22.52" y="71.9" id="img-e572ec8a-746"/>
            <use xlink:href="#img-e572ec8a-741" x="22.72" y="73.69" id="img-e572ec8a-747"/>
            <use xlink:href="#img-e572ec8a-741" x="22.91" y="75.49" id="img-e572ec8a-748"/>
            <use xlink:href="#img-e572ec8a-741" x="23.11" y="72.62" id="img-e572ec8a-749"/>
            <use xlink:href="#img-e572ec8a-741" x="23.31" y="74.41" id="img-e572ec8a-750"/>
            <use xlink:href="#img-e572ec8a-741" x="23.51" y="71.54" id="img-e572ec8a-751"/>
            <use xlink:href="#img-e572ec8a-741" x="23.7" y="76.2" id="img-e572ec8a-752"/>
            <use xlink:href="#img-e572ec8a-741" x="23.9" y="73.34" id="img-e572ec8a-753"/>
            <use xlink:href="#img-e572ec8a-741" x="24.1" y="70.47" id="img-e572ec8a-754"/>
            <use xlink:href="#img-e572ec8a-741" x="24.29" y="38.91" id="img-e572ec8a-755"/>
            <use xlink:href="#img-e572ec8a-741" x="24.49" y="72.26" id="img-e572ec8a-756"/>
            <use xlink:href="#img-e572ec8a-741" x="24.69" y="40.71" id="img-e572ec8a-757"/>
            <use xlink:href="#img-e572ec8a-741" x="24.89" y="69.39" id="img-e572ec8a-758"/>
            <use xlink:href="#img-e572ec8a-741" x="25.08" y="74.05" id="img-e572ec8a-759"/>
            <use xlink:href="#img-e572ec8a-741" x="25.28" y="71.18" id="img-e572ec8a-760"/>
            <use xlink:href="#img-e572ec8a-741" x="25.48" y="66.52" id="img-e572ec8a-761"/>
            <use xlink:href="#img-e572ec8a-741" x="25.67" y="39.63" id="img-e572ec8a-762"/>
            <use xlink:href="#img-e572ec8a-741" x="25.87" y="68.32" id="img-e572ec8a-763"/>
            <use xlink:href="#img-e572ec8a-741" x="26.07" y="72.98" id="img-e572ec8a-764"/>
            <use xlink:href="#img-e572ec8a-741" x="26.27" y="41.42" id="img-e572ec8a-765"/>
            <use xlink:href="#img-e572ec8a-741" x="26.46" y="70.11" id="img-e572ec8a-766"/>
            <use xlink:href="#img-e572ec8a-741" x="26.66" y="70.11" id="img-e572ec8a-767"/>
            <use xlink:href="#img-e572ec8a-741" x="26.86" y="74.77" id="img-e572ec8a-768"/>
            <use xlink:href="#img-e572ec8a-741" x="27.05" y="38.55" id="img-e572ec8a-769"/>
            <use xlink:href="#img-e572ec8a-741" x="27.25" y="67.24" id="img-e572ec8a-770"/>
            <use xlink:href="#img-e572ec8a-741" x="27.45" y="67.24" id="img-e572ec8a-771"/>
            <use xlink:href="#img-e572ec8a-741" x="27.65" y="71.9" id="img-e572ec8a-772"/>
            <use xlink:href="#img-e572ec8a-741" x="27.84" y="40.35" id="img-e572ec8a-773"/>
            <use xlink:href="#img-e572ec8a-741" x="28.04" y="69.03" id="img-e572ec8a-774"/>
            <use xlink:href="#img-e572ec8a-741" x="28.24" y="69.03" id="img-e572ec8a-775"/>
            <use xlink:href="#img-e572ec8a-741" x="28.44" y="73.69" id="img-e572ec8a-776"/>
            <use xlink:href="#img-e572ec8a-741" x="28.63" y="42.14" id="img-e572ec8a-777"/>
            <use xlink:href="#img-e572ec8a-741" x="28.83" y="37.48" id="img-e572ec8a-778"/>
            <use xlink:href="#img-e572ec8a-741" x="29.03" y="73.69" id="img-e572ec8a-779"/>
            <use xlink:href="#img-e572ec8a-741" x="29.22" y="70.83" id="img-e572ec8a-780"/>
            <use xlink:href="#img-e572ec8a-741" x="29.42" y="66.16" id="img-e572ec8a-781"/>
            <use xlink:href="#img-e572ec8a-741" x="29.62" y="70.83" id="img-e572ec8a-782"/>
            <use xlink:href="#img-e572ec8a-741" x="29.82" y="39.27" id="img-e572ec8a-783"/>
            <use xlink:href="#img-e572ec8a-741" x="30.01" y="75.49" id="img-e572ec8a-784"/>
            <use xlink:href="#img-e572ec8a-741" x="30.21" y="67.96" id="img-e572ec8a-785"/>
            <use xlink:href="#img-e572ec8a-741" x="30.41" y="67.96" id="img-e572ec8a-786"/>
            <use xlink:href="#img-e572ec8a-741" x="30.6" y="45.73" id="img-e572ec8a-787"/>
            <use xlink:href="#img-e572ec8a-741" x="30.8" y="72.62" id="img-e572ec8a-788"/>
            <use xlink:href="#img-e572ec8a-741" x="31" y="41.06" id="img-e572ec8a-789"/>
            <use xlink:href="#img-e572ec8a-741" x="31.2" y="36.4" id="img-e572ec8a-790"/>
            <use xlink:href="#img-e572ec8a-741" x="31.39" y="69.75" id="img-e572ec8a-791"/>
            <use xlink:href="#img-e572ec8a-741" x="31.59" y="69.75" id="img-e572ec8a-792"/>
            <use xlink:href="#img-e572ec8a-741" x="31.79" y="47.52" id="img-e572ec8a-793"/>
            <use xlink:href="#img-e572ec8a-741" x="31.98" y="65.09" id="img-e572ec8a-794"/>
            <use xlink:href="#img-e572ec8a-741" x="32.18" y="42.86" id="img-e572ec8a-795"/>
            <use xlink:href="#img-e572ec8a-741" x="32.38" y="38.2" id="img-e572ec8a-796"/>
            <use xlink:href="#img-e572ec8a-741" x="32.58" y="53.97" id="img-e572ec8a-797"/>
            <use xlink:href="#img-e572ec8a-741" x="32.77" y="74.41" id="img-e572ec8a-798"/>
            <use xlink:href="#img-e572ec8a-741" x="32.97" y="66.88" id="img-e572ec8a-799"/>
            <use xlink:href="#img-e572ec8a-741" x="33.17" y="71.54" id="img-e572ec8a-800"/>
            <use xlink:href="#img-e572ec8a-741" x="33.37" y="66.88" id="img-e572ec8a-801"/>
            <use xlink:href="#img-e572ec8a-741" x="33.56" y="44.65" id="img-e572ec8a-802"/>
            <use xlink:href="#img-e572ec8a-741" x="33.76" y="62.22" id="img-e572ec8a-803"/>
            <use xlink:href="#img-e572ec8a-741" x="33.96" y="39.99" id="img-e572ec8a-804"/>
            <use xlink:href="#img-e572ec8a-741" x="34.15" y="62.22" id="img-e572ec8a-805"/>
            <use xlink:href="#img-e572ec8a-741" x="34.35" y="35.33" id="img-e572ec8a-806"/>
            <use xlink:href="#img-e572ec8a-741" x="34.55" y="68.67" id="img-e572ec8a-807"/>
            <use xlink:href="#img-e572ec8a-741" x="34.75" y="68.67" id="img-e572ec8a-808"/>
            <use xlink:href="#img-e572ec8a-741" x="34.94" y="64.01" id="img-e572ec8a-809"/>
            <use xlink:href="#img-e572ec8a-741" x="35.14" y="46.44" id="img-e572ec8a-810"/>
            <use xlink:href="#img-e572ec8a-741" x="35.34" y="64.01" id="img-e572ec8a-811"/>
            <use xlink:href="#img-e572ec8a-741" x="35.53" y="73.34" id="img-e572ec8a-812"/>
            <use xlink:href="#img-e572ec8a-741" x="35.73" y="41.78" id="img-e572ec8a-813"/>
            <use xlink:href="#img-e572ec8a-741" x="35.93" y="37.12" id="img-e572ec8a-814"/>
            <use xlink:href="#img-e572ec8a-741" x="36.13" y="37.12" id="img-e572ec8a-815"/>
            <use xlink:href="#img-e572ec8a-741" x="36.32" y="70.47" id="img-e572ec8a-816"/>
            <use xlink:href="#img-e572ec8a-741" x="36.52" y="73.34" id="img-e572ec8a-817"/>
            <use xlink:href="#img-e572ec8a-741" x="36.72" y="65.81" id="img-e572ec8a-818"/>
            <use xlink:href="#img-e572ec8a-741" x="36.91" y="48.24" id="img-e572ec8a-819"/>
            <use xlink:href="#img-e572ec8a-741" x="37.11" y="65.81" id="img-e572ec8a-820"/>
            <use xlink:href="#img-e572ec8a-741" x="37.31" y="59.35" id="img-e572ec8a-821"/>
            <use xlink:href="#img-e572ec8a-741" x="37.51" y="43.57" id="img-e572ec8a-822"/>
            <use xlink:href="#img-e572ec8a-741" x="37.7" y="70.47" id="img-e572ec8a-823"/>
            <use xlink:href="#img-e572ec8a-741" x="37.9" y="38.91" id="img-e572ec8a-824"/>
            <use xlink:href="#img-e572ec8a-741" x="38.1" y="54.69" id="img-e572ec8a-825"/>
            <use xlink:href="#img-e572ec8a-741" x="38.3" y="61.14" id="img-e572ec8a-826"/>
            <use xlink:href="#img-e572ec8a-741" x="38.49" y="34.25" id="img-e572ec8a-827"/>
            <use xlink:href="#img-e572ec8a-741" x="38.69" y="67.6" id="img-e572ec8a-828"/>
            <use xlink:href="#img-e572ec8a-741" x="38.89" y="50.03" id="img-e572ec8a-829"/>
            <use xlink:href="#img-e572ec8a-741" x="39.08" y="67.6" id="img-e572ec8a-830"/>
            <use xlink:href="#img-e572ec8a-741" x="39.28" y="67.6" id="img-e572ec8a-831"/>
            <use xlink:href="#img-e572ec8a-741" x="39.48" y="72.26" id="img-e572ec8a-832"/>
            <use xlink:href="#img-e572ec8a-741" x="39.68" y="45.37" id="img-e572ec8a-833"/>
            <use xlink:href="#img-e572ec8a-741" x="39.87" y="62.94" id="img-e572ec8a-834"/>
            <use xlink:href="#img-e572ec8a-741" x="40.07" y="62.94" id="img-e572ec8a-835"/>
            <use xlink:href="#img-e572ec8a-741" x="40.27" y="40.71" id="img-e572ec8a-836"/>
            <use xlink:href="#img-e572ec8a-741" x="40.46" y="62.94" id="img-e572ec8a-837"/>
            <use xlink:href="#img-e572ec8a-741" x="40.66" y="36.04" id="img-e572ec8a-838"/>
            <use xlink:href="#img-e572ec8a-741" x="40.86" y="36.04" id="img-e572ec8a-839"/>
            <use xlink:href="#img-e572ec8a-741" x="41.06" y="69.39" id="img-e572ec8a-840"/>
            <use xlink:href="#img-e572ec8a-741" x="41.25" y="36.04" id="img-e572ec8a-841"/>
            <use xlink:href="#img-e572ec8a-741" x="41.45" y="72.26" id="img-e572ec8a-842"/>
            <use xlink:href="#img-e572ec8a-741" x="41.65" y="64.73" id="img-e572ec8a-843"/>
            <use xlink:href="#img-e572ec8a-741" x="41.84" y="69.39" id="img-e572ec8a-844"/>
            <use xlink:href="#img-e572ec8a-741" x="42.04" y="47.16" id="img-e572ec8a-845"/>
            <use xlink:href="#img-e572ec8a-741" x="42.24" y="64.73" id="img-e572ec8a-846"/>
            <use xlink:href="#img-e572ec8a-741" x="42.44" y="64.73" id="img-e572ec8a-847"/>
            <use xlink:href="#img-e572ec8a-741" x="42.63" y="74.05" id="img-e572ec8a-848"/>
            <use xlink:href="#img-e572ec8a-741" x="42.83" y="42.5" id="img-e572ec8a-849"/>
            <use xlink:href="#img-e572ec8a-741" x="43.03" y="69.39" id="img-e572ec8a-850"/>
            <use xlink:href="#img-e572ec8a-741" x="43.22" y="60.07" id="img-e572ec8a-851"/>
            <use xlink:href="#img-e572ec8a-741" x="43.42" y="37.84" id="img-e572ec8a-852"/>
            <use xlink:href="#img-e572ec8a-741" x="43.62" y="53.61" id="img-e572ec8a-853"/>
            <use xlink:href="#img-e572ec8a-741" x="43.82" y="60.07" id="img-e572ec8a-854"/>
            <use xlink:href="#img-e572ec8a-741" x="44.01" y="74.05" id="img-e572ec8a-855"/>
            <use xlink:href="#img-e572ec8a-741" x="44.21" y="66.52" id="img-e572ec8a-856"/>
            <use xlink:href="#img-e572ec8a-741" x="44.41" y="33.18" id="img-e572ec8a-857"/>
            <use xlink:href="#img-e572ec8a-741" x="44.61" y="48.95" id="img-e572ec8a-858"/>
            <use xlink:href="#img-e572ec8a-741" x="44.8" y="33.18" id="img-e572ec8a-859"/>
            <use xlink:href="#img-e572ec8a-741" x="45" y="66.52" id="img-e572ec8a-860"/>
            <use xlink:href="#img-e572ec8a-741" x="45.2" y="60.07" id="img-e572ec8a-861"/>
            <use xlink:href="#img-e572ec8a-741" x="45.39" y="71.18" id="img-e572ec8a-862"/>
            <use xlink:href="#img-e572ec8a-741" x="45.59" y="44.29" id="img-e572ec8a-863"/>
            <use xlink:href="#img-e572ec8a-741" x="45.79" y="71.18" id="img-e572ec8a-864"/>
            <use xlink:href="#img-e572ec8a-741" x="45.99" y="61.86" id="img-e572ec8a-865"/>
            <use xlink:href="#img-e572ec8a-741" x="46.18" y="61.86" id="img-e572ec8a-866"/>
            <use xlink:href="#img-e572ec8a-741" x="46.38" y="55.41" id="img-e572ec8a-867"/>
            <use xlink:href="#img-e572ec8a-741" x="46.58" y="39.63" id="img-e572ec8a-868"/>
            <use xlink:href="#img-e572ec8a-741" x="46.77" y="61.86" id="img-e572ec8a-869"/>
            <use xlink:href="#img-e572ec8a-741" x="46.97" y="34.97" id="img-e572ec8a-870"/>
            <use xlink:href="#img-e572ec8a-741" x="47.17" y="34.97" id="img-e572ec8a-871"/>
            <use xlink:href="#img-e572ec8a-741" x="47.37" y="68.32" id="img-e572ec8a-872"/>
            <use xlink:href="#img-e572ec8a-741" x="47.56" y="50.75" id="img-e572ec8a-873"/>
            <use xlink:href="#img-e572ec8a-741" x="47.76" y="34.97" id="img-e572ec8a-874"/>
            <use xlink:href="#img-e572ec8a-741" x="47.96" y="71.18" id="img-e572ec8a-875"/>
            <use xlink:href="#img-e572ec8a-741" x="48.15" y="68.32" id="img-e572ec8a-876"/>
            <use xlink:href="#img-e572ec8a-741" x="48.35" y="63.65" id="img-e572ec8a-877"/>
            <use xlink:href="#img-e572ec8a-741" x="48.55" y="68.32" id="img-e572ec8a-878"/>
            <use xlink:href="#img-e572ec8a-741" x="48.75" y="46.08" id="img-e572ec8a-879"/>
            <use xlink:href="#img-e572ec8a-741" x="48.94" y="72.98" id="img-e572ec8a-880"/>
            <use xlink:href="#img-e572ec8a-741" x="49.14" y="63.65" id="img-e572ec8a-881"/>
            <use xlink:href="#img-e572ec8a-741" x="49.34" y="63.65" id="img-e572ec8a-882"/>
            <use xlink:href="#img-e572ec8a-741" x="49.54" y="57.2" id="img-e572ec8a-883"/>
            <use xlink:href="#img-e572ec8a-741" x="49.73" y="41.42" id="img-e572ec8a-884"/>
            <use xlink:href="#img-e572ec8a-741" x="49.93" y="63.65" id="img-e572ec8a-885"/>
            <use xlink:href="#img-e572ec8a-741" x="50.13" y="68.32" id="img-e572ec8a-886"/>
            <use xlink:href="#img-e572ec8a-741" x="50.32" y="36.76" id="img-e572ec8a-887"/>
            <use xlink:href="#img-e572ec8a-741" x="50.52" y="36.76" id="img-e572ec8a-888"/>
            <use xlink:href="#img-e572ec8a-741" x="50.72" y="58.99" id="img-e572ec8a-889"/>
            <use xlink:href="#img-e572ec8a-741" x="50.92" y="52.54" id="img-e572ec8a-890"/>
            <use xlink:href="#img-e572ec8a-741" x="51.11" y="36.76" id="img-e572ec8a-891"/>
            <use xlink:href="#img-e572ec8a-741" x="51.31" y="72.98" id="img-e572ec8a-892"/>
            <use xlink:href="#img-e572ec8a-741" x="51.51" y="63.65" id="img-e572ec8a-893"/>
            <use xlink:href="#img-e572ec8a-741" x="51.7" y="65.45" id="img-e572ec8a-894"/>
            <use xlink:href="#img-e572ec8a-741" x="51.9" y="65.45" id="img-e572ec8a-895"/>
            <use xlink:href="#img-e572ec8a-741" x="52.1" y="70.11" id="img-e572ec8a-896"/>
            <use xlink:href="#img-e572ec8a-741" x="52.3" y="47.88" id="img-e572ec8a-897"/>
            <use xlink:href="#img-e572ec8a-741" x="52.49" y="32.1" id="img-e572ec8a-898"/>
            <use xlink:href="#img-e572ec8a-741" x="52.69" y="65.45" id="img-e572ec8a-899"/>
            <use xlink:href="#img-e572ec8a-741" x="52.89" y="65.45" id="img-e572ec8a-900"/>
            <use xlink:href="#img-e572ec8a-741" x="53.08" y="58.99" id="img-e572ec8a-901"/>
            <use xlink:href="#img-e572ec8a-741" x="53.28" y="70.11" id="img-e572ec8a-902"/>
            <use xlink:href="#img-e572ec8a-741" x="53.48" y="43.22" id="img-e572ec8a-903"/>
            <use xlink:href="#img-e572ec8a-741" x="53.68" y="70.11" id="img-e572ec8a-904"/>
            <use xlink:href="#img-e572ec8a-741" x="53.87" y="27.44" id="img-e572ec8a-905"/>
            <use xlink:href="#img-e572ec8a-741" x="54.07" y="60.79" id="img-e572ec8a-906"/>
            <use xlink:href="#img-e572ec8a-741" x="54.27" y="70.11" id="img-e572ec8a-907"/>
            <use xlink:href="#img-e572ec8a-741" x="54.47" y="38.55" id="img-e572ec8a-908"/>
            <use xlink:href="#img-e572ec8a-741" x="54.66" y="54.33" id="img-e572ec8a-909"/>
            <use xlink:href="#img-e572ec8a-741" x="54.86" y="38.55" id="img-e572ec8a-910"/>
            <use xlink:href="#img-e572ec8a-741" x="55.06" y="60.79" id="img-e572ec8a-911"/>
            <use xlink:href="#img-e572ec8a-741" x="55.25" y="74.77" id="img-e572ec8a-912"/>
            <use xlink:href="#img-e572ec8a-741" x="55.45" y="33.89" id="img-e572ec8a-913"/>
            <use xlink:href="#img-e572ec8a-741" x="55.65" y="33.89" id="img-e572ec8a-914"/>
            <use xlink:href="#img-e572ec8a-741" x="55.85" y="33.89" id="img-e572ec8a-915"/>
            <use xlink:href="#img-e572ec8a-741" x="56.04" y="67.24" id="img-e572ec8a-916"/>
            <use xlink:href="#img-e572ec8a-741" x="56.24" y="49.67" id="img-e572ec8a-917"/>
            <use xlink:href="#img-e572ec8a-741" x="56.44" y="33.89" id="img-e572ec8a-918"/>
            <use xlink:href="#img-e572ec8a-741" x="56.63" y="67.24" id="img-e572ec8a-919"/>
            <use xlink:href="#img-e572ec8a-741" x="56.83" y="67.24" id="img-e572ec8a-920"/>
            <use xlink:href="#img-e572ec8a-741" x="57.03" y="60.79" id="img-e572ec8a-921"/>
            <use xlink:href="#img-e572ec8a-741" x="57.23" y="62.58" id="img-e572ec8a-922"/>
            <use xlink:href="#img-e572ec8a-741" x="57.42" y="62.58" id="img-e572ec8a-923"/>
            <use xlink:href="#img-e572ec8a-741" x="57.62" y="45.01" id="img-e572ec8a-924"/>
            <use xlink:href="#img-e572ec8a-741" x="57.82" y="62.58" id="img-e572ec8a-925"/>
            <use xlink:href="#img-e572ec8a-741" x="58.01" y="71.9" id="img-e572ec8a-926"/>
            <use xlink:href="#img-e572ec8a-741" x="58.21" y="62.58" id="img-e572ec8a-927"/>
            <use xlink:href="#img-e572ec8a-741" x="58.41" y="71.9" id="img-e572ec8a-928"/>
            <use xlink:href="#img-e572ec8a-741" x="58.61" y="62.58" id="img-e572ec8a-929"/>
            <use xlink:href="#img-e572ec8a-741" x="58.8" y="56.12" id="img-e572ec8a-930"/>
            <use xlink:href="#img-e572ec8a-741" x="59" y="57.92" id="img-e572ec8a-931"/>
            <use xlink:href="#img-e572ec8a-741" x="59.2" y="40.35" id="img-e572ec8a-932"/>
            <use xlink:href="#img-e572ec8a-741" x="59.4" y="62.58" id="img-e572ec8a-933"/>
            <use xlink:href="#img-e572ec8a-741" x="59.59" y="67.24" id="img-e572ec8a-934"/>
            <use xlink:href="#img-e572ec8a-741" x="59.79" y="35.69" id="img-e572ec8a-935"/>
            <use xlink:href="#img-e572ec8a-741" x="59.99" y="35.69" id="img-e572ec8a-936"/>
            <use xlink:href="#img-e572ec8a-741" x="60.18" y="35.69" id="img-e572ec8a-937"/>
            <use xlink:href="#img-e572ec8a-741" x="60.38" y="57.92" id="img-e572ec8a-938"/>
            <use xlink:href="#img-e572ec8a-741" x="60.58" y="51.46" id="img-e572ec8a-939"/>
            <use xlink:href="#img-e572ec8a-741" x="60.78" y="69.03" id="img-e572ec8a-940"/>
            <use xlink:href="#img-e572ec8a-741" x="60.97" y="35.69" id="img-e572ec8a-941"/>
            <use xlink:href="#img-e572ec8a-741" x="61.17" y="71.9" id="img-e572ec8a-942"/>
            <use xlink:href="#img-e572ec8a-741" x="61.37" y="71.9" id="img-e572ec8a-943"/>
            <use xlink:href="#img-e572ec8a-741" x="61.56" y="69.03" id="img-e572ec8a-944"/>
            <use xlink:href="#img-e572ec8a-741" x="61.76" y="64.37" id="img-e572ec8a-945"/>
            <use xlink:href="#img-e572ec8a-741" x="61.96" y="64.37" id="img-e572ec8a-946"/>
            <use xlink:href="#img-e572ec8a-741" x="62.16" y="31.02" id="img-e572ec8a-947"/>
            <use xlink:href="#img-e572ec8a-741" x="62.35" y="46.8" id="img-e572ec8a-948"/>
            <use xlink:href="#img-e572ec8a-741" x="62.55" y="31.02" id="img-e572ec8a-949"/>
            <use xlink:href="#img-e572ec8a-741" x="62.75" y="31.02" id="img-e572ec8a-950"/>
            <use xlink:href="#img-e572ec8a-741" x="62.94" y="64.37" id="img-e572ec8a-951"/>
            <use xlink:href="#img-e572ec8a-741" x="63.14" y="64.37" id="img-e572ec8a-952"/>
            <use xlink:href="#img-e572ec8a-741" x="63.34" y="67.24" id="img-e572ec8a-953"/>
            <use xlink:href="#img-e572ec8a-741" x="63.54" y="57.92" id="img-e572ec8a-954"/>
            <use xlink:href="#img-e572ec8a-741" x="63.73" y="59.71" id="img-e572ec8a-955"/>
            <use xlink:href="#img-e572ec8a-741" x="63.93" y="42.14" id="img-e572ec8a-956"/>
            <use xlink:href="#img-e572ec8a-741" x="64.13" y="64.37" id="img-e572ec8a-957"/>
            <use xlink:href="#img-e572ec8a-741" x="64.33" y="69.03" id="img-e572ec8a-958"/>
            <use xlink:href="#img-e572ec8a-741" x="64.52" y="69.03" id="img-e572ec8a-959"/>
            <use xlink:href="#img-e572ec8a-741" x="64.72" y="37.48" id="img-e572ec8a-960"/>
            <use xlink:href="#img-e572ec8a-741" x="64.92" y="59.71" id="img-e572ec8a-961"/>
            <use xlink:href="#img-e572ec8a-741" x="65.11" y="69.03" id="img-e572ec8a-962"/>
            <use xlink:href="#img-e572ec8a-741" x="65.31" y="59.71" id="img-e572ec8a-963"/>
            <use xlink:href="#img-e572ec8a-741" x="65.51" y="53.26" id="img-e572ec8a-964"/>
            <use xlink:href="#img-e572ec8a-741" x="65.71" y="43.93" id="img-e572ec8a-965"/>
            <use xlink:href="#img-e572ec8a-741" x="65.9" y="37.48" id="img-e572ec8a-966"/>
            <use xlink:href="#img-e572ec8a-741" x="66.1" y="59.71" id="img-e572ec8a-967"/>
            <use xlink:href="#img-e572ec8a-741" x="66.3" y="73.69" id="img-e572ec8a-968"/>
            <use xlink:href="#img-e572ec8a-741" x="66.49" y="64.37" id="img-e572ec8a-969"/>
            <use xlink:href="#img-e572ec8a-741" x="66.69" y="32.82" id="img-e572ec8a-970"/>
            <use xlink:href="#img-e572ec8a-741" x="66.89" y="32.82" id="img-e572ec8a-971"/>
            <use xlink:href="#img-e572ec8a-741" x="67.09" y="66.16" id="img-e572ec8a-972"/>
            <use xlink:href="#img-e572ec8a-741" x="67.28" y="32.82" id="img-e572ec8a-973"/>
            <use xlink:href="#img-e572ec8a-741" x="67.48" y="66.16" id="img-e572ec8a-974"/>
            <use xlink:href="#img-e572ec8a-741" x="67.68" y="48.59" id="img-e572ec8a-975"/>
            <use xlink:href="#img-e572ec8a-741" x="67.87" y="70.83" id="img-e572ec8a-976"/>
            <use xlink:href="#img-e572ec8a-741" x="68.07" y="32.82" id="img-e572ec8a-977"/>
            <use xlink:href="#img-e572ec8a-741" x="68.27" y="66.16" id="img-e572ec8a-978"/>
            <use xlink:href="#img-e572ec8a-741" x="68.47" y="69.03" id="img-e572ec8a-979"/>
            <use xlink:href="#img-e572ec8a-741" x="68.66" y="66.16" id="img-e572ec8a-980"/>
            <use xlink:href="#img-e572ec8a-741" x="68.86" y="59.71" id="img-e572ec8a-981"/>
            <use xlink:href="#img-e572ec8a-741" x="69.06" y="61.5" id="img-e572ec8a-982"/>
            <use xlink:href="#img-e572ec8a-741" x="69.26" y="70.83" id="img-e572ec8a-983"/>
            <use xlink:href="#img-e572ec8a-741" x="69.45" y="43.93" id="img-e572ec8a-984"/>
            <use xlink:href="#img-e572ec8a-741" x="69.65" y="28.16" id="img-e572ec8a-985"/>
            <use xlink:href="#img-e572ec8a-741" x="69.85" y="61.5" id="img-e572ec8a-986"/>
            <use xlink:href="#img-e572ec8a-741" x="70.04" y="28.16" id="img-e572ec8a-987"/>
            <use xlink:href="#img-e572ec8a-741" x="70.24" y="61.5" id="img-e572ec8a-988"/>
            <use xlink:href="#img-e572ec8a-741" x="70.44" y="43.93" id="img-e572ec8a-989"/>
            <use xlink:href="#img-e572ec8a-741" x="70.64" y="70.83" id="img-e572ec8a-990"/>
            <use xlink:href="#img-e572ec8a-741" x="70.83" y="61.5" id="img-e572ec8a-991"/>
            <use xlink:href="#img-e572ec8a-741" x="71.03" y="39.27" id="img-e572ec8a-992"/>
            <use xlink:href="#img-e572ec8a-741" x="71.23" y="55.05" id="img-e572ec8a-993"/>
            <use xlink:href="#img-e572ec8a-741" x="71.42" y="56.84" id="img-e572ec8a-994"/>
            <use xlink:href="#img-e572ec8a-741" x="71.62" y="66.16" id="img-e572ec8a-995"/>
            <use xlink:href="#img-e572ec8a-741" x="71.82" y="61.5" id="img-e572ec8a-996"/>
            <use xlink:href="#img-e572ec8a-741" x="72.02" y="56.84" id="img-e572ec8a-997"/>
            <use xlink:href="#img-e572ec8a-741" x="72.21" y="66.16" id="img-e572ec8a-998"/>
            <use xlink:href="#img-e572ec8a-741" x="72.41" y="34.61" id="img-e572ec8a-999"/>
            <use xlink:href="#img-e572ec8a-741" x="72.61" y="34.61" id="img-e572ec8a-1000"/>
            <use xlink:href="#img-e572ec8a-741" x="72.8" y="56.84" id="img-e572ec8a-1001"/>
            <use xlink:href="#img-e572ec8a-741" x="73" y="34.61" id="img-e572ec8a-1002"/>
            <use xlink:href="#img-e572ec8a-741" x="73.2" y="34.61" id="img-e572ec8a-1003"/>
            <use xlink:href="#img-e572ec8a-741" x="73.4" y="67.96" id="img-e572ec8a-1004"/>
            <use xlink:href="#img-e572ec8a-741" x="73.59" y="50.39" id="img-e572ec8a-1005"/>
            <use xlink:href="#img-e572ec8a-741" x="73.79" y="67.96" id="img-e572ec8a-1006"/>
            <use xlink:href="#img-e572ec8a-741" x="73.99" y="34.61" id="img-e572ec8a-1007"/>
            <use xlink:href="#img-e572ec8a-741" x="74.19" y="67.96" id="img-e572ec8a-1008"/>
            <use xlink:href="#img-e572ec8a-741" x="74.38" y="70.83" id="img-e572ec8a-1009"/>
            <use xlink:href="#img-e572ec8a-741" x="74.58" y="70.83" id="img-e572ec8a-1010"/>
            <use xlink:href="#img-e572ec8a-741" x="74.78" y="61.5" id="img-e572ec8a-1011"/>
            <use xlink:href="#img-e572ec8a-741" x="74.97" y="63.3" id="img-e572ec8a-1012"/>
            <use xlink:href="#img-e572ec8a-741" x="75.17" y="29.95" id="img-e572ec8a-1013"/>
            <use xlink:href="#img-e572ec8a-741" x="75.37" y="63.3" id="img-e572ec8a-1014"/>
            <use xlink:href="#img-e572ec8a-741" x="75.57" y="67.96" id="img-e572ec8a-1015"/>
            <use xlink:href="#img-e572ec8a-741" x="75.76" y="45.73" id="img-e572ec8a-1016"/>
            <use xlink:href="#img-e572ec8a-741" x="75.96" y="63.3" id="img-e572ec8a-1017"/>
            <use xlink:href="#img-e572ec8a-741" x="76.16" y="29.95" id="img-e572ec8a-1018"/>
            <use xlink:href="#img-e572ec8a-741" x="76.35" y="67.96" id="img-e572ec8a-1019"/>
            <use xlink:href="#img-e572ec8a-741" x="76.55" y="63.3" id="img-e572ec8a-1020"/>
            <use xlink:href="#img-e572ec8a-741" x="76.75" y="47.52" id="img-e572ec8a-1021"/>
            <use xlink:href="#img-e572ec8a-741" x="76.95" y="63.3" id="img-e572ec8a-1022"/>
            <use xlink:href="#img-e572ec8a-741" x="77.14" y="63.3" id="img-e572ec8a-1023"/>
            <use xlink:href="#img-e572ec8a-741" x="77.34" y="72.62" id="img-e572ec8a-1024"/>
            <use xlink:href="#img-e572ec8a-741" x="77.54" y="56.84" id="img-e572ec8a-1025"/>
            <use xlink:href="#img-e572ec8a-741" x="77.73" y="58.63" id="img-e572ec8a-1026"/>
            <use xlink:href="#img-e572ec8a-741" x="77.93" y="67.96" id="img-e572ec8a-1027"/>
            <use xlink:href="#img-e572ec8a-741" x="78.13" y="41.06" id="img-e572ec8a-1028"/>
            <use xlink:href="#img-e572ec8a-741" x="78.33" y="63.3" id="img-e572ec8a-1029"/>
            <use xlink:href="#img-e572ec8a-741" x="78.52" y="67.96" id="img-e572ec8a-1030"/>
            <use xlink:href="#img-e572ec8a-741" x="78.72" y="67.96" id="img-e572ec8a-1031"/>
            <use xlink:href="#img-e572ec8a-741" x="78.92" y="36.4" id="img-e572ec8a-1032"/>
            <use xlink:href="#img-e572ec8a-741" x="79.12" y="67.96" id="img-e572ec8a-1033"/>
            <use xlink:href="#img-e572ec8a-741" x="79.31" y="58.63" id="img-e572ec8a-1034"/>
            <use xlink:href="#img-e572ec8a-741" x="79.51" y="36.4" id="img-e572ec8a-1035"/>
            <use xlink:href="#img-e572ec8a-741" x="79.71" y="36.4" id="img-e572ec8a-1036"/>
            <use xlink:href="#img-e572ec8a-741" x="79.9" y="58.63" id="img-e572ec8a-1037"/>
            <use xlink:href="#img-e572ec8a-741" x="80.1" y="52.18" id="img-e572ec8a-1038"/>
            <use xlink:href="#img-e572ec8a-741" x="80.3" y="52.18" id="img-e572ec8a-1039"/>
            <use xlink:href="#img-e572ec8a-741" x="80.5" y="69.75" id="img-e572ec8a-1040"/>
            <use xlink:href="#img-e572ec8a-741" x="80.69" y="36.4" id="img-e572ec8a-1041"/>
            <use xlink:href="#img-e572ec8a-741" x="80.89" y="58.63" id="img-e572ec8a-1042"/>
            <use xlink:href="#img-e572ec8a-741" x="81.09" y="53.97" id="img-e572ec8a-1043"/>
            <use xlink:href="#img-e572ec8a-741" x="81.28" y="72.62" id="img-e572ec8a-1044"/>
            <use xlink:href="#img-e572ec8a-741" x="81.48" y="63.3" id="img-e572ec8a-1045"/>
            <use xlink:href="#img-e572ec8a-741" x="81.68" y="31.74" id="img-e572ec8a-1046"/>
            <use xlink:href="#img-e572ec8a-741" x="81.88" y="65.09" id="img-e572ec8a-1047"/>
            <use xlink:href="#img-e572ec8a-741" x="82.07" y="65.09" id="img-e572ec8a-1048"/>
            <use xlink:href="#img-e572ec8a-741" x="82.27" y="53.97" id="img-e572ec8a-1049"/>
            <use xlink:href="#img-e572ec8a-741" x="82.47" y="31.74" id="img-e572ec8a-1050"/>
            <use xlink:href="#img-e572ec8a-741" x="82.66" y="31.74" id="img-e572ec8a-1051"/>
            <use xlink:href="#img-e572ec8a-741" x="82.86" y="47.52" id="img-e572ec8a-1052"/>
            <use xlink:href="#img-e572ec8a-741" x="83.06" y="31.74" id="img-e572ec8a-1053"/>
            <use xlink:href="#img-e572ec8a-741" x="83.26" y="69.75" id="img-e572ec8a-1054"/>
            <use xlink:href="#img-e572ec8a-741" x="83.45" y="31.74" id="img-e572ec8a-1055"/>
            <use xlink:href="#img-e572ec8a-741" x="83.65" y="65.09" id="img-e572ec8a-1056"/>
            <use xlink:href="#img-e572ec8a-741" x="83.85" y="65.09" id="img-e572ec8a-1057"/>
            <use xlink:href="#img-e572ec8a-741" x="84.05" y="67.96" id="img-e572ec8a-1058"/>
            <use xlink:href="#img-e572ec8a-741" x="84.24" y="67.96" id="img-e572ec8a-1059"/>
            <use xlink:href="#img-e572ec8a-741" x="84.44" y="58.63" id="img-e572ec8a-1060"/>
            <use xlink:href="#img-e572ec8a-741" x="84.64" y="31.74" id="img-e572ec8a-1061"/>
            <use xlink:href="#img-e572ec8a-741" x="84.83" y="60.43" id="img-e572ec8a-1062"/>
            <use xlink:href="#img-e572ec8a-741" x="85.03" y="69.75" id="img-e572ec8a-1063"/>
            <use xlink:href="#img-e572ec8a-741" x="85.23" y="42.86" id="img-e572ec8a-1064"/>
            <use xlink:href="#img-e572ec8a-741" x="85.43" y="65.09" id="img-e572ec8a-1065"/>
            <use xlink:href="#img-e572ec8a-741" x="85.62" y="27.08" id="img-e572ec8a-1066"/>
            <use xlink:href="#img-e572ec8a-741" x="85.82" y="42.86" id="img-e572ec8a-1067"/>
            <use xlink:href="#img-e572ec8a-741" x="86.02" y="69.75" id="img-e572ec8a-1068"/>
            <use xlink:href="#img-e572ec8a-741" x="86.21" y="27.08" id="img-e572ec8a-1069"/>
            <use xlink:href="#img-e572ec8a-741" x="86.41" y="60.43" id="img-e572ec8a-1070"/>
            <use xlink:href="#img-e572ec8a-741" x="86.61" y="60.43" id="img-e572ec8a-1071"/>
            <use xlink:href="#img-e572ec8a-741" x="86.81" y="38.2" id="img-e572ec8a-1072"/>
            <use xlink:href="#img-e572ec8a-741" x="87" y="69.75" id="img-e572ec8a-1073"/>
            <use xlink:href="#img-e572ec8a-741" x="87.2" y="60.43" id="img-e572ec8a-1074"/>
            <use xlink:href="#img-e572ec8a-741" x="87.4" y="27.08" id="img-e572ec8a-1075"/>
            <use xlink:href="#img-e572ec8a-741" x="87.59" y="53.97" id="img-e572ec8a-1076"/>
            <use xlink:href="#img-e572ec8a-741" x="87.79" y="44.65" id="img-e572ec8a-1077"/>
            <use xlink:href="#img-e572ec8a-741" x="87.99" y="55.77" id="img-e572ec8a-1078"/>
            <use xlink:href="#img-e572ec8a-741" x="88.19" y="38.2" id="img-e572ec8a-1079"/>
            <use xlink:href="#img-e572ec8a-741" x="88.38" y="60.43" id="img-e572ec8a-1080"/>
            <use xlink:href="#img-e572ec8a-741" x="88.58" y="55.77" id="img-e572ec8a-1081"/>
            <use xlink:href="#img-e572ec8a-741" x="88.78" y="55.77" id="img-e572ec8a-1082"/>
            <use xlink:href="#img-e572ec8a-741" x="88.98" y="65.09" id="img-e572ec8a-1083"/>
            <use xlink:href="#img-e572ec8a-741" x="89.17" y="33.53" id="img-e572ec8a-1084"/>
            <use xlink:href="#img-e572ec8a-741" x="89.37" y="65.09" id="img-e572ec8a-1085"/>
            <use xlink:href="#img-e572ec8a-741" x="89.57" y="33.53" id="img-e572ec8a-1086"/>
            <use xlink:href="#img-e572ec8a-741" x="89.76" y="33.53" id="img-e572ec8a-1087"/>
            <use xlink:href="#img-e572ec8a-741" x="89.96" y="66.88" id="img-e572ec8a-1088"/>
            <use xlink:href="#img-e572ec8a-741" x="90.16" y="33.53" id="img-e572ec8a-1089"/>
            <use xlink:href="#img-e572ec8a-741" x="90.36" y="33.53" id="img-e572ec8a-1090"/>
            <use xlink:href="#img-e572ec8a-741" x="90.55" y="55.77" id="img-e572ec8a-1091"/>
            <use xlink:href="#img-e572ec8a-741" x="90.75" y="49.31" id="img-e572ec8a-1092"/>
            <use xlink:href="#img-e572ec8a-741" x="90.95" y="17.76" id="img-e572ec8a-1093"/>
            <use xlink:href="#img-e572ec8a-741" x="91.14" y="66.88" id="img-e572ec8a-1094"/>
            <use xlink:href="#img-e572ec8a-741" x="91.34" y="33.53" id="img-e572ec8a-1095"/>
            <use xlink:href="#img-e572ec8a-741" x="91.54" y="66.88" id="img-e572ec8a-1096"/>
            <use xlink:href="#img-e572ec8a-741" x="91.74" y="55.77" id="img-e572ec8a-1097"/>
            <use xlink:href="#img-e572ec8a-741" x="91.93" y="69.75" id="img-e572ec8a-1098"/>
            <use xlink:href="#img-e572ec8a-741" x="92.13" y="69.75" id="img-e572ec8a-1099"/>
            <use xlink:href="#img-e572ec8a-741" x="92.33" y="66.88" id="img-e572ec8a-1100"/>
            <use xlink:href="#img-e572ec8a-741" x="92.52" y="60.43" id="img-e572ec8a-1101"/>
            <use xlink:href="#img-e572ec8a-741" x="92.72" y="62.22" id="img-e572ec8a-1102"/>
            <use xlink:href="#img-e572ec8a-741" x="92.92" y="62.22" id="img-e572ec8a-1103"/>
            <use xlink:href="#img-e572ec8a-741" x="93.12" y="71.54" id="img-e572ec8a-1104"/>
            <use xlink:href="#img-e572ec8a-741" x="93.31" y="62.22" id="img-e572ec8a-1105"/>
            <use xlink:href="#img-e572ec8a-741" x="93.51" y="66.88" id="img-e572ec8a-1106"/>
            <use xlink:href="#img-e572ec8a-741" x="93.71" y="28.87" id="img-e572ec8a-1107"/>
            <use xlink:href="#img-e572ec8a-741" x="93.91" y="44.65" id="img-e572ec8a-1108"/>
            <use xlink:href="#img-e572ec8a-741" x="94.1" y="62.22" id="img-e572ec8a-1109"/>
            <use xlink:href="#img-e572ec8a-741" x="94.3" y="28.87" id="img-e572ec8a-1110"/>
            <use xlink:href="#img-e572ec8a-741" x="94.5" y="71.54" id="img-e572ec8a-1111"/>
            <use xlink:href="#img-e572ec8a-741" x="94.69" y="62.22" id="img-e572ec8a-1112"/>
            <use xlink:href="#img-e572ec8a-741" x="94.89" y="44.65" id="img-e572ec8a-1113"/>
            <use xlink:href="#img-e572ec8a-741" x="95.09" y="46.44" id="img-e572ec8a-1114"/>
            <use xlink:href="#img-e572ec8a-741" x="95.29" y="62.22" id="img-e572ec8a-1115"/>
            <use xlink:href="#img-e572ec8a-741" x="95.48" y="62.22" id="img-e572ec8a-1116"/>
            <use xlink:href="#img-e572ec8a-741" x="95.68" y="28.87" id="img-e572ec8a-1117"/>
            <use xlink:href="#img-e572ec8a-741" x="95.88" y="71.54" id="img-e572ec8a-1118"/>
            <use xlink:href="#img-e572ec8a-741" x="96.07" y="55.77" id="img-e572ec8a-1119"/>
            <use xlink:href="#img-e572ec8a-741" x="96.27" y="39.99" id="img-e572ec8a-1120"/>
            <use xlink:href="#img-e572ec8a-741" x="96.47" y="57.56" id="img-e572ec8a-1121"/>
            <use xlink:href="#img-e572ec8a-741" x="96.67" y="66.88" id="img-e572ec8a-1122"/>
            <use xlink:href="#img-e572ec8a-741" x="96.86" y="24.21" id="img-e572ec8a-1123"/>
            <use xlink:href="#img-e572ec8a-741" x="97.06" y="62.22" id="img-e572ec8a-1124"/>
            <use xlink:href="#img-e572ec8a-741" x="97.26" y="57.56" id="img-e572ec8a-1125"/>
            <use xlink:href="#img-e572ec8a-741" x="97.45" y="66.88" id="img-e572ec8a-1126"/>
            <use xlink:href="#img-e572ec8a-741" x="97.65" y="66.88" id="img-e572ec8a-1127"/>
            <use xlink:href="#img-e572ec8a-741" x="97.85" y="35.33" id="img-e572ec8a-1128"/>
            <use xlink:href="#img-e572ec8a-741" x="98.05" y="24.21" id="img-e572ec8a-1129"/>
            <use xlink:href="#img-e572ec8a-741" x="98.24" y="66.88" id="img-e572ec8a-1130"/>
            <use xlink:href="#img-e572ec8a-741" x="98.44" y="57.56" id="img-e572ec8a-1131"/>
            <use xlink:href="#img-e572ec8a-741" x="98.64" y="35.33" id="img-e572ec8a-1132"/>
            <use xlink:href="#img-e572ec8a-741" x="98.84" y="35.33" id="img-e572ec8a-1133"/>
            <use xlink:href="#img-e572ec8a-741" x="99.03" y="35.33" id="img-e572ec8a-1134"/>
            <use xlink:href="#img-e572ec8a-741" x="99.23" y="57.56" id="img-e572ec8a-1135"/>
            <use xlink:href="#img-e572ec8a-741" x="99.43" y="68.67" id="img-e572ec8a-1136"/>
            <use xlink:href="#img-e572ec8a-741" x="99.62" y="51.1" id="img-e572ec8a-1137"/>
            <use xlink:href="#img-e572ec8a-741" x="99.82" y="51.1" id="img-e572ec8a-1138"/>
            <use xlink:href="#img-e572ec8a-741" x="100.02" y="41.78" id="img-e572ec8a-1139"/>
            <use xlink:href="#img-e572ec8a-741" x="100.22" y="35.33" id="img-e572ec8a-1140"/>
            <use xlink:href="#img-e572ec8a-741" x="100.41" y="52.9" id="img-e572ec8a-1141"/>
            <use xlink:href="#img-e572ec8a-741" x="100.61" y="57.56" id="img-e572ec8a-1142"/>
            <use xlink:href="#img-e572ec8a-741" x="100.81" y="71.54" id="img-e572ec8a-1143"/>
            <use xlink:href="#img-e572ec8a-741" x="101" y="71.54" id="img-e572ec8a-1144"/>
            <use xlink:href="#img-e572ec8a-741" x="101.2" y="52.9" id="img-e572ec8a-1145"/>
            <use xlink:href="#img-e572ec8a-741" x="101.4" y="62.22" id="img-e572ec8a-1146"/>
            <use xlink:href="#img-e572ec8a-741" x="101.6" y="30.67" id="img-e572ec8a-1147"/>
            <use xlink:href="#img-e572ec8a-741" x="101.79" y="64.01" id="img-e572ec8a-1148"/>
            <use xlink:href="#img-e572ec8a-741" x="101.99" y="30.67" id="img-e572ec8a-1149"/>
            <use xlink:href="#img-e572ec8a-741" x="102.19" y="64.01" id="img-e572ec8a-1150"/>
            <use xlink:href="#img-e572ec8a-741" x="102.38" y="64.01" id="img-e572ec8a-1151"/>
            <use xlink:href="#img-e572ec8a-741" x="102.58" y="68.67" id="img-e572ec8a-1152"/>
            <use xlink:href="#img-e572ec8a-741" x="102.78" y="30.67" id="img-e572ec8a-1153"/>
            <use xlink:href="#img-e572ec8a-741" x="102.98" y="30.67" id="img-e572ec8a-1154"/>
            <use xlink:href="#img-e572ec8a-741" x="103.17" y="64.01" id="img-e572ec8a-1155"/>
            <use xlink:href="#img-e572ec8a-741" x="103.37" y="46.44" id="img-e572ec8a-1156"/>
            <use xlink:href="#img-e572ec8a-741" x="103.57" y="30.67" id="img-e572ec8a-1157"/>
            <use xlink:href="#img-e572ec8a-741" x="103.77" y="68.67" id="img-e572ec8a-1158"/>
            <use xlink:href="#img-e572ec8a-741" x="103.96" y="30.67" id="img-e572ec8a-1159"/>
            <use xlink:href="#img-e572ec8a-741" x="104.16" y="64.01" id="img-e572ec8a-1160"/>
            <use xlink:href="#img-e572ec8a-741" x="104.36" y="48.24" id="img-e572ec8a-1161"/>
            <use xlink:href="#img-e572ec8a-741" x="104.55" y="64.01" id="img-e572ec8a-1162"/>
            <use xlink:href="#img-e572ec8a-741" x="104.75" y="64.01" id="img-e572ec8a-1163"/>
            <use xlink:href="#img-e572ec8a-741" x="104.95" y="64.01" id="img-e572ec8a-1164"/>
            <use xlink:href="#img-e572ec8a-741" x="105.15" y="66.88" id="img-e572ec8a-1165"/>
            <use xlink:href="#img-e572ec8a-741" x="105.34" y="57.56" id="img-e572ec8a-1166"/>
            <use xlink:href="#img-e572ec8a-741" x="105.54" y="57.56" id="img-e572ec8a-1167"/>
            <use xlink:href="#img-e572ec8a-741" x="105.74" y="73.34" id="img-e572ec8a-1168"/>
            <use xlink:href="#img-e572ec8a-741" x="105.93" y="59.35" id="img-e572ec8a-1169"/>
            <use xlink:href="#img-e572ec8a-741" x="106.13" y="68.67" id="img-e572ec8a-1170"/>
            <use xlink:href="#img-e572ec8a-741" x="106.33" y="26" id="img-e572ec8a-1171"/>
            <use xlink:href="#img-e572ec8a-741" x="106.53" y="41.78" id="img-e572ec8a-1172"/>
            <use xlink:href="#img-e572ec8a-741" x="106.72" y="64.01" id="img-e572ec8a-1173"/>
            <use xlink:href="#img-e572ec8a-741" x="106.92" y="26" id="img-e572ec8a-1174"/>
            <use xlink:href="#img-e572ec8a-741" x="107.12" y="68.67" id="img-e572ec8a-1175"/>
            <use xlink:href="#img-e572ec8a-741" x="107.31" y="68.67" id="img-e572ec8a-1176"/>
            <use xlink:href="#img-e572ec8a-741" x="107.51" y="14.89" id="img-e572ec8a-1177"/>
            <use xlink:href="#img-e572ec8a-741" x="107.71" y="26" id="img-e572ec8a-1178"/>
            <use xlink:href="#img-e572ec8a-741" x="107.91" y="68.67" id="img-e572ec8a-1179"/>
            <use xlink:href="#img-e572ec8a-741" x="108.1" y="59.35" id="img-e572ec8a-1180"/>
            <use xlink:href="#img-e572ec8a-741" x="108.3" y="26" id="img-e572ec8a-1181"/>
            <use xlink:href="#img-e572ec8a-741" x="108.5" y="37.12" id="img-e572ec8a-1182"/>
            <use xlink:href="#img-e572ec8a-741" x="108.7" y="68.67" id="img-e572ec8a-1183"/>
            <use xlink:href="#img-e572ec8a-741" x="108.89" y="37.12" id="img-e572ec8a-1184"/>
            <use xlink:href="#img-e572ec8a-741" x="109.09" y="59.35" id="img-e572ec8a-1185"/>
            <use xlink:href="#img-e572ec8a-741" x="109.29" y="26" id="img-e572ec8a-1186"/>
            <use xlink:href="#img-e572ec8a-741" x="109.48" y="62.22" id="img-e572ec8a-1187"/>
            <use xlink:href="#img-e572ec8a-741" x="109.68" y="52.9" id="img-e572ec8a-1188"/>
            <use xlink:href="#img-e572ec8a-741" x="109.88" y="43.57" id="img-e572ec8a-1189"/>
            <use xlink:href="#img-e572ec8a-741" x="110.08" y="54.69" id="img-e572ec8a-1190"/>
            <use xlink:href="#img-e572ec8a-741" x="110.27" y="37.12" id="img-e572ec8a-1191"/>
            <use xlink:href="#img-e572ec8a-741" x="110.47" y="59.35" id="img-e572ec8a-1192"/>
            <use xlink:href="#img-e572ec8a-741" x="110.67" y="37.12" id="img-e572ec8a-1193"/>
            <use xlink:href="#img-e572ec8a-741" x="110.86" y="54.69" id="img-e572ec8a-1194"/>
            <use xlink:href="#img-e572ec8a-741" x="111.06" y="59.35" id="img-e572ec8a-1195"/>
            <use xlink:href="#img-e572ec8a-741" x="111.26" y="73.34" id="img-e572ec8a-1196"/>
            <use xlink:href="#img-e572ec8a-741" x="111.46" y="64.01" id="img-e572ec8a-1197"/>
            <use xlink:href="#img-e572ec8a-741" x="111.65" y="32.46" id="img-e572ec8a-1198"/>
            <use xlink:href="#img-e572ec8a-741" x="111.85" y="32.46" id="img-e572ec8a-1199"/>
            <use xlink:href="#img-e572ec8a-741" x="112.05" y="65.81" id="img-e572ec8a-1200"/>
            <use xlink:href="#img-e572ec8a-741" x="112.24" y="32.46" id="img-e572ec8a-1201"/>
            <use xlink:href="#img-e572ec8a-741" x="112.44" y="32.46" id="img-e572ec8a-1202"/>
            <use xlink:href="#img-e572ec8a-741" x="112.64" y="54.69" id="img-e572ec8a-1203"/>
            <use xlink:href="#img-e572ec8a-741" x="112.84" y="32.46" id="img-e572ec8a-1204"/>
            <use xlink:href="#img-e572ec8a-741" x="113.03" y="37.12" id="img-e572ec8a-1205"/>
            <use xlink:href="#img-e572ec8a-741" x="113.23" y="32.46" id="img-e572ec8a-1206"/>
            <use xlink:href="#img-e572ec8a-741" x="113.43" y="65.81" id="img-e572ec8a-1207"/>
            <use xlink:href="#img-e572ec8a-741" x="113.63" y="48.24" id="img-e572ec8a-1208"/>
            <use xlink:href="#img-e572ec8a-741" x="113.82" y="32.46" id="img-e572ec8a-1209"/>
            <use xlink:href="#img-e572ec8a-741" x="114.02" y="16.68" id="img-e572ec8a-1210"/>
            <use xlink:href="#img-e572ec8a-741" x="114.22" y="48.24" id="img-e572ec8a-1211"/>
            <use xlink:href="#img-e572ec8a-741" x="114.41" y="32.46" id="img-e572ec8a-1212"/>
            <use xlink:href="#img-e572ec8a-741" x="114.61" y="65.81" id="img-e572ec8a-1213"/>
            <use xlink:href="#img-e572ec8a-741" x="114.81" y="65.81" id="img-e572ec8a-1214"/>
            <use xlink:href="#img-e572ec8a-741" x="115.01" y="65.81" id="img-e572ec8a-1215"/>
            <use xlink:href="#img-e572ec8a-741" x="115.2" y="65.81" id="img-e572ec8a-1216"/>
            <use xlink:href="#img-e572ec8a-741" x="115.4" y="68.67" id="img-e572ec8a-1217"/>
            <use xlink:href="#img-e572ec8a-741" x="115.6" y="68.67" id="img-e572ec8a-1218"/>
            <use xlink:href="#img-e572ec8a-741" x="115.79" y="68.67" id="img-e572ec8a-1219"/>
            <use xlink:href="#img-e572ec8a-741" x="115.99" y="59.35" id="img-e572ec8a-1220"/>
            <use xlink:href="#img-e572ec8a-741" x="116.19" y="32.46" id="img-e572ec8a-1221"/>
            <use xlink:href="#img-e572ec8a-741" x="116.39" y="61.14" id="img-e572ec8a-1222"/>
            <use xlink:href="#img-e572ec8a-741" x="116.58" y="61.14" id="img-e572ec8a-1223"/>
            <use xlink:href="#img-e572ec8a-741" x="116.78" y="70.47" id="img-e572ec8a-1224"/>
            <use xlink:href="#img-e572ec8a-741" x="116.98" y="27.8" id="img-e572ec8a-1225"/>
            <use xlink:href="#img-e572ec8a-741" x="117.17" y="61.14" id="img-e572ec8a-1226"/>
            <use xlink:href="#img-e572ec8a-741" x="117.37" y="65.81" id="img-e572ec8a-1227"/>
            <use xlink:href="#img-e572ec8a-741" x="117.57" y="43.57" id="img-e572ec8a-1228"/>
            <use xlink:href="#img-e572ec8a-741" x="117.77" y="27.8" id="img-e572ec8a-1229"/>
            <use xlink:href="#img-e572ec8a-741" x="117.96" y="43.57" id="img-e572ec8a-1230"/>
            <use xlink:href="#img-e572ec8a-741" x="118.16" y="61.14" id="img-e572ec8a-1231"/>
            <use xlink:href="#img-e572ec8a-741" x="118.36" y="70.47" id="img-e572ec8a-1232"/>
            <use xlink:href="#img-e572ec8a-741" x="118.56" y="27.8" id="img-e572ec8a-1233"/>
            <use xlink:href="#img-e572ec8a-741" x="118.75" y="70.47" id="img-e572ec8a-1234"/>
            <use xlink:href="#img-e572ec8a-741" x="118.95" y="65.81" id="img-e572ec8a-1235"/>
            <use xlink:href="#img-e572ec8a-741" x="119.15" y="61.14" id="img-e572ec8a-1236"/>
            <use xlink:href="#img-e572ec8a-741" x="119.34" y="43.57" id="img-e572ec8a-1237"/>
            <use xlink:href="#img-e572ec8a-741" x="119.54" y="45.37" id="img-e572ec8a-1238"/>
            <use xlink:href="#img-e572ec8a-741" x="119.74" y="70.47" id="img-e572ec8a-1239"/>
            <use xlink:href="#img-e572ec8a-741" x="119.94" y="61.14" id="img-e572ec8a-1240"/>
            <use xlink:href="#img-e572ec8a-741" x="120.13" y="61.14" id="img-e572ec8a-1241"/>
          </g>
        </g>
      </g>
    </g>
    <g opacity="0" class="guide zoomslider" stroke="#000000" stroke-opacity="0.000" id="img-e572ec8a-1242">
      <g fill="#EAEAEA" stroke-width="0.3" stroke-opacity="0" stroke="#6A6A6A" id="img-e572ec8a-1243">
        <rect x="115.23" y="8" width="4" height="4" id="img-e572ec8a-1244"/>
        <g class="button_logo" fill="#6A6A6A" id="img-e572ec8a-1245">
          <path d="M116.03,9.6 L 116.83 9.6 116.83 8.8 117.63 8.8 117.63 9.6 118.43 9.6 118.43 10.4 117.63 10.4 117.63 11.2 116.83 11.2 116.83 10.4 116.03 10.4 z" id="img-e572ec8a-1246"/>
        </g>
      </g>
      <g fill="#EAEAEA" id="img-e572ec8a-1247">
        <rect x="95.73" y="8" width="19" height="4" id="img-e572ec8a-1248"/>
      </g>
      <g class="zoomslider_thumb" fill="#6A6A6A" id="img-e572ec8a-1249">
        <rect x="104.23" y="8" width="2" height="4" id="img-e572ec8a-1250"/>
      </g>
      <g fill="#EAEAEA" stroke-width="0.3" stroke-opacity="0" stroke="#6A6A6A" id="img-e572ec8a-1251">
        <rect x="91.23" y="8" width="4" height="4" id="img-e572ec8a-1252"/>
        <g class="button_logo" fill="#6A6A6A" id="img-e572ec8a-1253">
          <path d="M92.03,9.6 L 94.43 9.6 94.43 10.4 92.03 10.4 z" id="img-e572ec8a-1254"/>
        </g>
      </g>
    </g>
  </g>
</g>
  <g class="guide ylabels" font-size="2.82" font-family="'PT Sans Caption','Helvetica Neue','Helvetica',sans-serif" fill="#6C606B" id="img-e572ec8a-1255">
    <text x="18.63" y="168.36" text-anchor="end" dy="0.35em" id="img-e572ec8a-1256" gadfly:scale="1.0" visibility="hidden">-250</text>
    <text x="18.63" y="150.43" text-anchor="end" dy="0.35em" id="img-e572ec8a-1257" gadfly:scale="1.0" visibility="hidden">-200</text>
    <text x="18.63" y="132.5" text-anchor="end" dy="0.35em" id="img-e572ec8a-1258" gadfly:scale="1.0" visibility="hidden">-150</text>
    <text x="18.63" y="114.57" text-anchor="end" dy="0.35em" id="img-e572ec8a-1259" gadfly:scale="1.0" visibility="hidden">-100</text>
    <text x="18.63" y="96.64" text-anchor="end" dy="0.35em" id="img-e572ec8a-1260" gadfly:scale="1.0" visibility="hidden">-50</text>
    <text x="18.63" y="78.71" text-anchor="end" dy="0.35em" id="img-e572ec8a-1261" gadfly:scale="1.0" visibility="visible">0</text>
    <text x="18.63" y="60.79" text-anchor="end" dy="0.35em" id="img-e572ec8a-1262" gadfly:scale="1.0" visibility="visible">50</text>
    <text x="18.63" y="42.86" text-anchor="end" dy="0.35em" id="img-e572ec8a-1263" gadfly:scale="1.0" visibility="visible">100</text>
    <text x="18.63" y="24.93" text-anchor="end" dy="0.35em" id="img-e572ec8a-1264" gadfly:scale="1.0" visibility="visible">150</text>
    <text x="18.63" y="7" text-anchor="end" dy="0.35em" id="img-e572ec8a-1265" gadfly:scale="1.0" visibility="visible">200</text>
    <text x="18.63" y="-10.93" text-anchor="end" dy="0.35em" id="img-e572ec8a-1266" gadfly:scale="1.0" visibility="hidden">250</text>
    <text x="18.63" y="-28.86" text-anchor="end" dy="0.35em" id="img-e572ec8a-1267" gadfly:scale="1.0" visibility="hidden">300</text>
    <text x="18.63" y="-46.79" text-anchor="end" dy="0.35em" id="img-e572ec8a-1268" gadfly:scale="1.0" visibility="hidden">350</text>
    <text x="18.63" y="-64.72" text-anchor="end" dy="0.35em" id="img-e572ec8a-1269" gadfly:scale="1.0" visibility="hidden">400</text>
    <text x="18.63" y="-82.64" text-anchor="end" dy="0.35em" id="img-e572ec8a-1270" gadfly:scale="1.0" visibility="hidden">450</text>
    <text x="18.63" y="150.43" text-anchor="end" dy="0.35em" id="img-e572ec8a-1271" gadfly:scale="10.0" visibility="hidden">-200</text>
    <text x="18.63" y="146.84" text-anchor="end" dy="0.35em" id="img-e572ec8a-1272" gadfly:scale="10.0" visibility="hidden">-190</text>
    <text x="18.63" y="143.26" text-anchor="end" dy="0.35em" id="img-e572ec8a-1273" gadfly:scale="10.0" visibility="hidden">-180</text>
    <text x="18.63" y="139.67" text-anchor="end" dy="0.35em" id="img-e572ec8a-1274" gadfly:scale="10.0" visibility="hidden">-170</text>
    <text x="18.63" y="136.09" text-anchor="end" dy="0.35em" id="img-e572ec8a-1275" gadfly:scale="10.0" visibility="hidden">-160</text>
    <text x="18.63" y="132.5" text-anchor="end" dy="0.35em" id="img-e572ec8a-1276" gadfly:scale="10.0" visibility="hidden">-150</text>
    <text x="18.63" y="128.92" text-anchor="end" dy="0.35em" id="img-e572ec8a-1277" gadfly:scale="10.0" visibility="hidden">-140</text>
    <text x="18.63" y="125.33" text-anchor="end" dy="0.35em" id="img-e572ec8a-1278" gadfly:scale="10.0" visibility="hidden">-130</text>
    <text x="18.63" y="121.74" text-anchor="end" dy="0.35em" id="img-e572ec8a-1279" gadfly:scale="10.0" visibility="hidden">-120</text>
    <text x="18.63" y="118.16" text-anchor="end" dy="0.35em" id="img-e572ec8a-1280" gadfly:scale="10.0" visibility="hidden">-110</text>
    <text x="18.63" y="114.57" text-anchor="end" dy="0.35em" id="img-e572ec8a-1281" gadfly:scale="10.0" visibility="hidden">-100</text>
    <text x="18.63" y="110.99" text-anchor="end" dy="0.35em" id="img-e572ec8a-1282" gadfly:scale="10.0" visibility="hidden">-90</text>
    <text x="18.63" y="107.4" text-anchor="end" dy="0.35em" id="img-e572ec8a-1283" gadfly:scale="10.0" visibility="hidden">-80</text>
    <text x="18.63" y="103.82" text-anchor="end" dy="0.35em" id="img-e572ec8a-1284" gadfly:scale="10.0" visibility="hidden">-70</text>
    <text x="18.63" y="100.23" text-anchor="end" dy="0.35em" id="img-e572ec8a-1285" gadfly:scale="10.0" visibility="hidden">-60</text>
    <text x="18.63" y="96.64" text-anchor="end" dy="0.35em" id="img-e572ec8a-1286" gadfly:scale="10.0" visibility="hidden">-50</text>
    <text x="18.63" y="93.06" text-anchor="end" dy="0.35em" id="img-e572ec8a-1287" gadfly:scale="10.0" visibility="hidden">-40</text>
    <text x="18.63" y="89.47" text-anchor="end" dy="0.35em" id="img-e572ec8a-1288" gadfly:scale="10.0" visibility="hidden">-30</text>
    <text x="18.63" y="85.89" text-anchor="end" dy="0.35em" id="img-e572ec8a-1289" gadfly:scale="10.0" visibility="hidden">-20</text>
    <text x="18.63" y="82.3" text-anchor="end" dy="0.35em" id="img-e572ec8a-1290" gadfly:scale="10.0" visibility="hidden">-10</text>
    <text x="18.63" y="78.71" text-anchor="end" dy="0.35em" id="img-e572ec8a-1291" gadfly:scale="10.0" visibility="hidden">0</text>
    <text x="18.63" y="75.13" text-anchor="end" dy="0.35em" id="img-e572ec8a-1292" gadfly:scale="10.0" visibility="hidden">10</text>
    <text x="18.63" y="71.54" text-anchor="end" dy="0.35em" id="img-e572ec8a-1293" gadfly:scale="10.0" visibility="hidden">20</text>
    <text x="18.63" y="67.96" text-anchor="end" dy="0.35em" id="img-e572ec8a-1294" gadfly:scale="10.0" visibility="hidden">30</text>
    <text x="18.63" y="64.37" text-anchor="end" dy="0.35em" id="img-e572ec8a-1295" gadfly:scale="10.0" visibility="hidden">40</text>
    <text x="18.63" y="60.79" text-anchor="end" dy="0.35em" id="img-e572ec8a-1296" gadfly:scale="10.0" visibility="hidden">50</text>
    <text x="18.63" y="57.2" text-anchor="end" dy="0.35em" id="img-e572ec8a-1297" gadfly:scale="10.0" visibility="hidden">60</text>
    <text x="18.63" y="53.61" text-anchor="end" dy="0.35em" id="img-e572ec8a-1298" gadfly:scale="10.0" visibility="hidden">70</text>
    <text x="18.63" y="50.03" text-anchor="end" dy="0.35em" id="img-e572ec8a-1299" gadfly:scale="10.0" visibility="hidden">80</text>
    <text x="18.63" y="46.44" text-anchor="end" dy="0.35em" id="img-e572ec8a-1300" gadfly:scale="10.0" visibility="hidden">90</text>
    <text x="18.63" y="42.86" text-anchor="end" dy="0.35em" id="img-e572ec8a-1301" gadfly:scale="10.0" visibility="hidden">100</text>
    <text x="18.63" y="39.27" text-anchor="end" dy="0.35em" id="img-e572ec8a-1302" gadfly:scale="10.0" visibility="hidden">110</text>
    <text x="18.63" y="35.69" text-anchor="end" dy="0.35em" id="img-e572ec8a-1303" gadfly:scale="10.0" visibility="hidden">120</text>
    <text x="18.63" y="32.1" text-anchor="end" dy="0.35em" id="img-e572ec8a-1304" gadfly:scale="10.0" visibility="hidden">130</text>
    <text x="18.63" y="28.51" text-anchor="end" dy="0.35em" id="img-e572ec8a-1305" gadfly:scale="10.0" visibility="hidden">140</text>
    <text x="18.63" y="24.93" text-anchor="end" dy="0.35em" id="img-e572ec8a-1306" gadfly:scale="10.0" visibility="hidden">150</text>
    <text x="18.63" y="21.34" text-anchor="end" dy="0.35em" id="img-e572ec8a-1307" gadfly:scale="10.0" visibility="hidden">160</text>
    <text x="18.63" y="17.76" text-anchor="end" dy="0.35em" id="img-e572ec8a-1308" gadfly:scale="10.0" visibility="hidden">170</text>
    <text x="18.63" y="14.17" text-anchor="end" dy="0.35em" id="img-e572ec8a-1309" gadfly:scale="10.0" visibility="hidden">180</text>
    <text x="18.63" y="10.59" text-anchor="end" dy="0.35em" id="img-e572ec8a-1310" gadfly:scale="10.0" visibility="hidden">190</text>
    <text x="18.63" y="7" text-anchor="end" dy="0.35em" id="img-e572ec8a-1311" gadfly:scale="10.0" visibility="hidden">200</text>
    <text x="18.63" y="3.41" text-anchor="end" dy="0.35em" id="img-e572ec8a-1312" gadfly:scale="10.0" visibility="hidden">210</text>
    <text x="18.63" y="-0.17" text-anchor="end" dy="0.35em" id="img-e572ec8a-1313" gadfly:scale="10.0" visibility="hidden">220</text>
    <text x="18.63" y="-3.76" text-anchor="end" dy="0.35em" id="img-e572ec8a-1314" gadfly:scale="10.0" visibility="hidden">230</text>
    <text x="18.63" y="-7.34" text-anchor="end" dy="0.35em" id="img-e572ec8a-1315" gadfly:scale="10.0" visibility="hidden">240</text>
    <text x="18.63" y="-10.93" text-anchor="end" dy="0.35em" id="img-e572ec8a-1316" gadfly:scale="10.0" visibility="hidden">250</text>
    <text x="18.63" y="-14.51" text-anchor="end" dy="0.35em" id="img-e572ec8a-1317" gadfly:scale="10.0" visibility="hidden">260</text>
    <text x="18.63" y="-18.1" text-anchor="end" dy="0.35em" id="img-e572ec8a-1318" gadfly:scale="10.0" visibility="hidden">270</text>
    <text x="18.63" y="-21.69" text-anchor="end" dy="0.35em" id="img-e572ec8a-1319" gadfly:scale="10.0" visibility="hidden">280</text>
    <text x="18.63" y="-25.27" text-anchor="end" dy="0.35em" id="img-e572ec8a-1320" gadfly:scale="10.0" visibility="hidden">290</text>
    <text x="18.63" y="-28.86" text-anchor="end" dy="0.35em" id="img-e572ec8a-1321" gadfly:scale="10.0" visibility="hidden">300</text>
    <text x="18.63" y="-32.44" text-anchor="end" dy="0.35em" id="img-e572ec8a-1322" gadfly:scale="10.0" visibility="hidden">310</text>
    <text x="18.63" y="-36.03" text-anchor="end" dy="0.35em" id="img-e572ec8a-1323" gadfly:scale="10.0" visibility="hidden">320</text>
    <text x="18.63" y="-39.61" text-anchor="end" dy="0.35em" id="img-e572ec8a-1324" gadfly:scale="10.0" visibility="hidden">330</text>
    <text x="18.63" y="-43.2" text-anchor="end" dy="0.35em" id="img-e572ec8a-1325" gadfly:scale="10.0" visibility="hidden">340</text>
    <text x="18.63" y="-46.79" text-anchor="end" dy="0.35em" id="img-e572ec8a-1326" gadfly:scale="10.0" visibility="hidden">350</text>
    <text x="18.63" y="-50.37" text-anchor="end" dy="0.35em" id="img-e572ec8a-1327" gadfly:scale="10.0" visibility="hidden">360</text>
    <text x="18.63" y="-53.96" text-anchor="end" dy="0.35em" id="img-e572ec8a-1328" gadfly:scale="10.0" visibility="hidden">370</text>
    <text x="18.63" y="-57.54" text-anchor="end" dy="0.35em" id="img-e572ec8a-1329" gadfly:scale="10.0" visibility="hidden">380</text>
    <text x="18.63" y="-61.13" text-anchor="end" dy="0.35em" id="img-e572ec8a-1330" gadfly:scale="10.0" visibility="hidden">390</text>
    <text x="18.63" y="-64.72" text-anchor="end" dy="0.35em" id="img-e572ec8a-1331" gadfly:scale="10.0" visibility="hidden">400</text>
    <text x="18.63" y="150.43" text-anchor="end" dy="0.35em" id="img-e572ec8a-1332" gadfly:scale="0.5" visibility="hidden">-200</text>
    <text x="18.63" y="78.71" text-anchor="end" dy="0.35em" id="img-e572ec8a-1333" gadfly:scale="0.5" visibility="hidden">0</text>
    <text x="18.63" y="7" text-anchor="end" dy="0.35em" id="img-e572ec8a-1334" gadfly:scale="0.5" visibility="hidden">200</text>
    <text x="18.63" y="-64.72" text-anchor="end" dy="0.35em" id="img-e572ec8a-1335" gadfly:scale="0.5" visibility="hidden">400</text>
    <text x="18.63" y="150.43" text-anchor="end" dy="0.35em" id="img-e572ec8a-1336" gadfly:scale="5.0" visibility="hidden">-200</text>
    <text x="18.63" y="143.26" text-anchor="end" dy="0.35em" id="img-e572ec8a-1337" gadfly:scale="5.0" visibility="hidden">-180</text>
    <text x="18.63" y="136.09" text-anchor="end" dy="0.35em" id="img-e572ec8a-1338" gadfly:scale="5.0" visibility="hidden">-160</text>
    <text x="18.63" y="128.92" text-anchor="end" dy="0.35em" id="img-e572ec8a-1339" gadfly:scale="5.0" visibility="hidden">-140</text>
    <text x="18.63" y="121.74" text-anchor="end" dy="0.35em" id="img-e572ec8a-1340" gadfly:scale="5.0" visibility="hidden">-120</text>
    <text x="18.63" y="114.57" text-anchor="end" dy="0.35em" id="img-e572ec8a-1341" gadfly:scale="5.0" visibility="hidden">-100</text>
    <text x="18.63" y="107.4" text-anchor="end" dy="0.35em" id="img-e572ec8a-1342" gadfly:scale="5.0" visibility="hidden">-80</text>
    <text x="18.63" y="100.23" text-anchor="end" dy="0.35em" id="img-e572ec8a-1343" gadfly:scale="5.0" visibility="hidden">-60</text>
    <text x="18.63" y="93.06" text-anchor="end" dy="0.35em" id="img-e572ec8a-1344" gadfly:scale="5.0" visibility="hidden">-40</text>
    <text x="18.63" y="85.89" text-anchor="end" dy="0.35em" id="img-e572ec8a-1345" gadfly:scale="5.0" visibility="hidden">-20</text>
    <text x="18.63" y="78.71" text-anchor="end" dy="0.35em" id="img-e572ec8a-1346" gadfly:scale="5.0" visibility="hidden">0</text>
    <text x="18.63" y="71.54" text-anchor="end" dy="0.35em" id="img-e572ec8a-1347" gadfly:scale="5.0" visibility="hidden">20</text>
    <text x="18.63" y="64.37" text-anchor="end" dy="0.35em" id="img-e572ec8a-1348" gadfly:scale="5.0" visibility="hidden">40</text>
    <text x="18.63" y="57.2" text-anchor="end" dy="0.35em" id="img-e572ec8a-1349" gadfly:scale="5.0" visibility="hidden">60</text>
    <text x="18.63" y="50.03" text-anchor="end" dy="0.35em" id="img-e572ec8a-1350" gadfly:scale="5.0" visibility="hidden">80</text>
    <text x="18.63" y="42.86" text-anchor="end" dy="0.35em" id="img-e572ec8a-1351" gadfly:scale="5.0" visibility="hidden">100</text>
    <text x="18.63" y="35.69" text-anchor="end" dy="0.35em" id="img-e572ec8a-1352" gadfly:scale="5.0" visibility="hidden">120</text>
    <text x="18.63" y="28.51" text-anchor="end" dy="0.35em" id="img-e572ec8a-1353" gadfly:scale="5.0" visibility="hidden">140</text>
    <text x="18.63" y="21.34" text-anchor="end" dy="0.35em" id="img-e572ec8a-1354" gadfly:scale="5.0" visibility="hidden">160</text>
    <text x="18.63" y="14.17" text-anchor="end" dy="0.35em" id="img-e572ec8a-1355" gadfly:scale="5.0" visibility="hidden">180</text>
    <text x="18.63" y="7" text-anchor="end" dy="0.35em" id="img-e572ec8a-1356" gadfly:scale="5.0" visibility="hidden">200</text>
    <text x="18.63" y="-0.17" text-anchor="end" dy="0.35em" id="img-e572ec8a-1357" gadfly:scale="5.0" visibility="hidden">220</text>
    <text x="18.63" y="-7.34" text-anchor="end" dy="0.35em" id="img-e572ec8a-1358" gadfly:scale="5.0" visibility="hidden">240</text>
    <text x="18.63" y="-14.51" text-anchor="end" dy="0.35em" id="img-e572ec8a-1359" gadfly:scale="5.0" visibility="hidden">260</text>
    <text x="18.63" y="-21.69" text-anchor="end" dy="0.35em" id="img-e572ec8a-1360" gadfly:scale="5.0" visibility="hidden">280</text>
    <text x="18.63" y="-28.86" text-anchor="end" dy="0.35em" id="img-e572ec8a-1361" gadfly:scale="5.0" visibility="hidden">300</text>
    <text x="18.63" y="-36.03" text-anchor="end" dy="0.35em" id="img-e572ec8a-1362" gadfly:scale="5.0" visibility="hidden">320</text>
    <text x="18.63" y="-43.2" text-anchor="end" dy="0.35em" id="img-e572ec8a-1363" gadfly:scale="5.0" visibility="hidden">340</text>
    <text x="18.63" y="-50.37" text-anchor="end" dy="0.35em" id="img-e572ec8a-1364" gadfly:scale="5.0" visibility="hidden">360</text>
    <text x="18.63" y="-57.54" text-anchor="end" dy="0.35em" id="img-e572ec8a-1365" gadfly:scale="5.0" visibility="hidden">380</text>
    <text x="18.63" y="-64.72" text-anchor="end" dy="0.35em" id="img-e572ec8a-1366" gadfly:scale="5.0" visibility="hidden">400</text>
  </g>
  <g font-size="3.88" font-family="'PT Sans','Helvetica Neue','Helvetica',sans-serif" fill="#564A55" stroke="#000000" stroke-opacity="0.000" id="img-e572ec8a-1367">
    <text x="8.81" y="40.86" text-anchor="middle" dy="0.35em" transform="rotate(-90, 8.81, 42.86)" id="img-e572ec8a-1368">NumofSteps</text>
  </g>
</g>
<defs>
  <clipPath id="img-e572ec8a-13">
  <path d="M19.63,5 L 122.23 5 122.23 80.72 19.63 80.72" />
</clipPath>
  <g id="img-e572ec8a-239">
    <circle cx="0" cy="0" r="0.9" id="img-e572ec8a-1369"/>
  </g>
  <g id="img-e572ec8a-741">
    <circle cx="0" cy="0" r="0.9" id="img-e572ec8a-1370"/>
  </g>
</defs>
<script> <![CDATA[
(function(N){var k=/[\.\/]/,L=/\s*,\s*/,C=function(a,d){return a-d},a,v,y={n:{}},M=function(){for(var a=0,d=this.length;a<d;a++)if("undefined"!=typeof this[a])return this[a]},A=function(){for(var a=this.length;--a;)if("undefined"!=typeof this[a])return this[a]},w=function(k,d){k=String(k);var f=v,n=Array.prototype.slice.call(arguments,2),u=w.listeners(k),p=0,b,q=[],e={},l=[],r=a;l.firstDefined=M;l.lastDefined=A;a=k;for(var s=v=0,x=u.length;s<x;s++)"zIndex"in u[s]&&(q.push(u[s].zIndex),0>u[s].zIndex&&
(e[u[s].zIndex]=u[s]));for(q.sort(C);0>q[p];)if(b=e[q[p++] ],l.push(b.apply(d,n)),v)return v=f,l;for(s=0;s<x;s++)if(b=u[s],"zIndex"in b)if(b.zIndex==q[p]){l.push(b.apply(d,n));if(v)break;do if(p++,(b=e[q[p] ])&&l.push(b.apply(d,n)),v)break;while(b)}else e[b.zIndex]=b;else if(l.push(b.apply(d,n)),v)break;v=f;a=r;return l};w._events=y;w.listeners=function(a){a=a.split(k);var d=y,f,n,u,p,b,q,e,l=[d],r=[];u=0;for(p=a.length;u<p;u++){e=[];b=0;for(q=l.length;b<q;b++)for(d=l[b].n,f=[d[a[u] ],d["*"] ],n=2;n--;)if(d=
f[n])e.push(d),r=r.concat(d.f||[]);l=e}return r};w.on=function(a,d){a=String(a);if("function"!=typeof d)return function(){};for(var f=a.split(L),n=0,u=f.length;n<u;n++)(function(a){a=a.split(k);for(var b=y,f,e=0,l=a.length;e<l;e++)b=b.n,b=b.hasOwnProperty(a[e])&&b[a[e] ]||(b[a[e] ]={n:{}});b.f=b.f||[];e=0;for(l=b.f.length;e<l;e++)if(b.f[e]==d){f=!0;break}!f&&b.f.push(d)})(f[n]);return function(a){+a==+a&&(d.zIndex=+a)}};w.f=function(a){var d=[].slice.call(arguments,1);return function(){w.apply(null,
[a,null].concat(d).concat([].slice.call(arguments,0)))}};w.stop=function(){v=1};w.nt=function(k){return k?(new RegExp("(?:\\.|\\/|^)"+k+"(?:\\.|\\/|$)")).test(a):a};w.nts=function(){return a.split(k)};w.off=w.unbind=function(a,d){if(a){var f=a.split(L);if(1<f.length)for(var n=0,u=f.length;n<u;n++)w.off(f[n],d);else{for(var f=a.split(k),p,b,q,e,l=[y],n=0,u=f.length;n<u;n++)for(e=0;e<l.length;e+=q.length-2){q=[e,1];p=l[e].n;if("*"!=f[n])p[f[n] ]&&q.push(p[f[n] ]);else for(b in p)p.hasOwnProperty(b)&&
q.push(p[b]);l.splice.apply(l,q)}n=0;for(u=l.length;n<u;n++)for(p=l[n];p.n;){if(d){if(p.f){e=0;for(f=p.f.length;e<f;e++)if(p.f[e]==d){p.f.splice(e,1);break}!p.f.length&&delete p.f}for(b in p.n)if(p.n.hasOwnProperty(b)&&p.n[b].f){q=p.n[b].f;e=0;for(f=q.length;e<f;e++)if(q[e]==d){q.splice(e,1);break}!q.length&&delete p.n[b].f}}else for(b in delete p.f,p.n)p.n.hasOwnProperty(b)&&p.n[b].f&&delete p.n[b].f;p=p.n}}}else w._events=y={n:{}}};w.once=function(a,d){var f=function(){w.unbind(a,f);return d.apply(this,
arguments)};return w.on(a,f)};w.version="0.4.2";w.toString=function(){return"You are running Eve 0.4.2"};"undefined"!=typeof module&&module.exports?module.exports=w:"function"===typeof define&&define.amd?define("eve",[],function(){return w}):N.eve=w})(this);
(function(N,k){"function"===typeof define&&define.amd?define("Snap.svg",["eve"],function(L){return k(N,L)}):k(N,N.eve)})(this,function(N,k){var L=function(a){var k={},y=N.requestAnimationFrame||N.webkitRequestAnimationFrame||N.mozRequestAnimationFrame||N.oRequestAnimationFrame||N.msRequestAnimationFrame||function(a){setTimeout(a,16)},M=Array.isArray||function(a){return a instanceof Array||"[object Array]"==Object.prototype.toString.call(a)},A=0,w="M"+(+new Date).toString(36),z=function(a){if(null==
a)return this.s;var b=this.s-a;this.b+=this.dur*b;this.B+=this.dur*b;this.s=a},d=function(a){if(null==a)return this.spd;this.spd=a},f=function(a){if(null==a)return this.dur;this.s=this.s*a/this.dur;this.dur=a},n=function(){delete k[this.id];this.update();a("mina.stop."+this.id,this)},u=function(){this.pdif||(delete k[this.id],this.update(),this.pdif=this.get()-this.b)},p=function(){this.pdif&&(this.b=this.get()-this.pdif,delete this.pdif,k[this.id]=this)},b=function(){var a;if(M(this.start)){a=[];
for(var b=0,e=this.start.length;b<e;b++)a[b]=+this.start[b]+(this.end[b]-this.start[b])*this.easing(this.s)}else a=+this.start+(this.end-this.start)*this.easing(this.s);this.set(a)},q=function(){var l=0,b;for(b in k)if(k.hasOwnProperty(b)){var e=k[b],f=e.get();l++;e.s=(f-e.b)/(e.dur/e.spd);1<=e.s&&(delete k[b],e.s=1,l--,function(b){setTimeout(function(){a("mina.finish."+b.id,b)})}(e));e.update()}l&&y(q)},e=function(a,r,s,x,G,h,J){a={id:w+(A++).toString(36),start:a,end:r,b:s,s:0,dur:x-s,spd:1,get:G,
set:h,easing:J||e.linear,status:z,speed:d,duration:f,stop:n,pause:u,resume:p,update:b};k[a.id]=a;r=0;for(var K in k)if(k.hasOwnProperty(K)&&(r++,2==r))break;1==r&&y(q);return a};e.time=Date.now||function(){return+new Date};e.getById=function(a){return k[a]||null};e.linear=function(a){return a};e.easeout=function(a){return Math.pow(a,1.7)};e.easein=function(a){return Math.pow(a,0.48)};e.easeinout=function(a){if(1==a)return 1;if(0==a)return 0;var b=0.48-a/1.04,e=Math.sqrt(0.1734+b*b);a=e-b;a=Math.pow(Math.abs(a),
1/3)*(0>a?-1:1);b=-e-b;b=Math.pow(Math.abs(b),1/3)*(0>b?-1:1);a=a+b+0.5;return 3*(1-a)*a*a+a*a*a};e.backin=function(a){return 1==a?1:a*a*(2.70158*a-1.70158)};e.backout=function(a){if(0==a)return 0;a-=1;return a*a*(2.70158*a+1.70158)+1};e.elastic=function(a){return a==!!a?a:Math.pow(2,-10*a)*Math.sin(2*(a-0.075)*Math.PI/0.3)+1};e.bounce=function(a){a<1/2.75?a*=7.5625*a:a<2/2.75?(a-=1.5/2.75,a=7.5625*a*a+0.75):a<2.5/2.75?(a-=2.25/2.75,a=7.5625*a*a+0.9375):(a-=2.625/2.75,a=7.5625*a*a+0.984375);return a};
return N.mina=e}("undefined"==typeof k?function(){}:k),C=function(){function a(c,t){if(c){if(c.tagName)return x(c);if(y(c,"array")&&a.set)return a.set.apply(a,c);if(c instanceof e)return c;if(null==t)return c=G.doc.querySelector(c),x(c)}return new s(null==c?"100%":c,null==t?"100%":t)}function v(c,a){if(a){"#text"==c&&(c=G.doc.createTextNode(a.text||""));"string"==typeof c&&(c=v(c));if("string"==typeof a)return"xlink:"==a.substring(0,6)?c.getAttributeNS(m,a.substring(6)):"xml:"==a.substring(0,4)?c.getAttributeNS(la,
a.substring(4)):c.getAttribute(a);for(var da in a)if(a[h](da)){var b=J(a[da]);b?"xlink:"==da.substring(0,6)?c.setAttributeNS(m,da.substring(6),b):"xml:"==da.substring(0,4)?c.setAttributeNS(la,da.substring(4),b):c.setAttribute(da,b):c.removeAttribute(da)}}else c=G.doc.createElementNS(la,c);return c}function y(c,a){a=J.prototype.toLowerCase.call(a);return"finite"==a?isFinite(c):"array"==a&&(c instanceof Array||Array.isArray&&Array.isArray(c))?!0:"null"==a&&null===c||a==typeof c&&null!==c||"object"==
a&&c===Object(c)||$.call(c).slice(8,-1).toLowerCase()==a}function M(c){if("function"==typeof c||Object(c)!==c)return c;var a=new c.constructor,b;for(b in c)c[h](b)&&(a[b]=M(c[b]));return a}function A(c,a,b){function m(){var e=Array.prototype.slice.call(arguments,0),f=e.join("\u2400"),d=m.cache=m.cache||{},l=m.count=m.count||[];if(d[h](f)){a:for(var e=l,l=f,B=0,H=e.length;B<H;B++)if(e[B]===l){e.push(e.splice(B,1)[0]);break a}return b?b(d[f]):d[f]}1E3<=l.length&&delete d[l.shift()];l.push(f);d[f]=c.apply(a,
e);return b?b(d[f]):d[f]}return m}function w(c,a,b,m,e,f){return null==e?(c-=b,a-=m,c||a?(180*I.atan2(-a,-c)/C+540)%360:0):w(c,a,e,f)-w(b,m,e,f)}function z(c){return c%360*C/180}function d(c){var a=[];c=c.replace(/(?:^|\s)(\w+)\(([^)]+)\)/g,function(c,b,m){m=m.split(/\s*,\s*|\s+/);"rotate"==b&&1==m.length&&m.push(0,0);"scale"==b&&(2<m.length?m=m.slice(0,2):2==m.length&&m.push(0,0),1==m.length&&m.push(m[0],0,0));"skewX"==b?a.push(["m",1,0,I.tan(z(m[0])),1,0,0]):"skewY"==b?a.push(["m",1,I.tan(z(m[0])),
0,1,0,0]):a.push([b.charAt(0)].concat(m));return c});return a}function f(c,t){var b=O(c),m=new a.Matrix;if(b)for(var e=0,f=b.length;e<f;e++){var h=b[e],d=h.length,B=J(h[0]).toLowerCase(),H=h[0]!=B,l=H?m.invert():0,E;"t"==B&&2==d?m.translate(h[1],0):"t"==B&&3==d?H?(d=l.x(0,0),B=l.y(0,0),H=l.x(h[1],h[2]),l=l.y(h[1],h[2]),m.translate(H-d,l-B)):m.translate(h[1],h[2]):"r"==B?2==d?(E=E||t,m.rotate(h[1],E.x+E.width/2,E.y+E.height/2)):4==d&&(H?(H=l.x(h[2],h[3]),l=l.y(h[2],h[3]),m.rotate(h[1],H,l)):m.rotate(h[1],
h[2],h[3])):"s"==B?2==d||3==d?(E=E||t,m.scale(h[1],h[d-1],E.x+E.width/2,E.y+E.height/2)):4==d?H?(H=l.x(h[2],h[3]),l=l.y(h[2],h[3]),m.scale(h[1],h[1],H,l)):m.scale(h[1],h[1],h[2],h[3]):5==d&&(H?(H=l.x(h[3],h[4]),l=l.y(h[3],h[4]),m.scale(h[1],h[2],H,l)):m.scale(h[1],h[2],h[3],h[4])):"m"==B&&7==d&&m.add(h[1],h[2],h[3],h[4],h[5],h[6])}return m}function n(c,t){if(null==t){var m=!0;t="linearGradient"==c.type||"radialGradient"==c.type?c.node.getAttribute("gradientTransform"):"pattern"==c.type?c.node.getAttribute("patternTransform"):
c.node.getAttribute("transform");if(!t)return new a.Matrix;t=d(t)}else t=a._.rgTransform.test(t)?J(t).replace(/\.{3}|\u2026/g,c._.transform||aa):d(t),y(t,"array")&&(t=a.path?a.path.toString.call(t):J(t)),c._.transform=t;var b=f(t,c.getBBox(1));if(m)return b;c.matrix=b}function u(c){c=c.node.ownerSVGElement&&x(c.node.ownerSVGElement)||c.node.parentNode&&x(c.node.parentNode)||a.select("svg")||a(0,0);var t=c.select("defs"),t=null==t?!1:t.node;t||(t=r("defs",c.node).node);return t}function p(c){return c.node.ownerSVGElement&&
x(c.node.ownerSVGElement)||a.select("svg")}function b(c,a,m){function b(c){if(null==c)return aa;if(c==+c)return c;v(B,{width:c});try{return B.getBBox().width}catch(a){return 0}}function h(c){if(null==c)return aa;if(c==+c)return c;v(B,{height:c});try{return B.getBBox().height}catch(a){return 0}}function e(b,B){null==a?d[b]=B(c.attr(b)||0):b==a&&(d=B(null==m?c.attr(b)||0:m))}var f=p(c).node,d={},B=f.querySelector(".svg---mgr");B||(B=v("rect"),v(B,{x:-9E9,y:-9E9,width:10,height:10,"class":"svg---mgr",
fill:"none"}),f.appendChild(B));switch(c.type){case "rect":e("rx",b),e("ry",h);case "image":e("width",b),e("height",h);case "text":e("x",b);e("y",h);break;case "circle":e("cx",b);e("cy",h);e("r",b);break;case "ellipse":e("cx",b);e("cy",h);e("rx",b);e("ry",h);break;case "line":e("x1",b);e("x2",b);e("y1",h);e("y2",h);break;case "marker":e("refX",b);e("markerWidth",b);e("refY",h);e("markerHeight",h);break;case "radialGradient":e("fx",b);e("fy",h);break;case "tspan":e("dx",b);e("dy",h);break;default:e(a,
b)}f.removeChild(B);return d}function q(c){y(c,"array")||(c=Array.prototype.slice.call(arguments,0));for(var a=0,b=0,m=this.node;this[a];)delete this[a++];for(a=0;a<c.length;a++)"set"==c[a].type?c[a].forEach(function(c){m.appendChild(c.node)}):m.appendChild(c[a].node);for(var h=m.childNodes,a=0;a<h.length;a++)this[b++]=x(h[a]);return this}function e(c){if(c.snap in E)return E[c.snap];var a=this.id=V(),b;try{b=c.ownerSVGElement}catch(m){}this.node=c;b&&(this.paper=new s(b));this.type=c.tagName;this.anims=
{};this._={transform:[]};c.snap=a;E[a]=this;"g"==this.type&&(this.add=q);if(this.type in{g:1,mask:1,pattern:1})for(var e in s.prototype)s.prototype[h](e)&&(this[e]=s.prototype[e])}function l(c){this.node=c}function r(c,a){var b=v(c);a.appendChild(b);return x(b)}function s(c,a){var b,m,f,d=s.prototype;if(c&&"svg"==c.tagName){if(c.snap in E)return E[c.snap];var l=c.ownerDocument;b=new e(c);m=c.getElementsByTagName("desc")[0];f=c.getElementsByTagName("defs")[0];m||(m=v("desc"),m.appendChild(l.createTextNode("Created with Snap")),
b.node.appendChild(m));f||(f=v("defs"),b.node.appendChild(f));b.defs=f;for(var ca in d)d[h](ca)&&(b[ca]=d[ca]);b.paper=b.root=b}else b=r("svg",G.doc.body),v(b.node,{height:a,version:1.1,width:c,xmlns:la});return b}function x(c){return!c||c instanceof e||c instanceof l?c:c.tagName&&"svg"==c.tagName.toLowerCase()?new s(c):c.tagName&&"object"==c.tagName.toLowerCase()&&"image/svg+xml"==c.type?new s(c.contentDocument.getElementsByTagName("svg")[0]):new e(c)}a.version="0.3.0";a.toString=function(){return"Snap v"+
this.version};a._={};var G={win:N,doc:N.document};a._.glob=G;var h="hasOwnProperty",J=String,K=parseFloat,U=parseInt,I=Math,P=I.max,Q=I.min,Y=I.abs,C=I.PI,aa="",$=Object.prototype.toString,F=/^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?%?)\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?%?)\s*\))\s*$/i;a._.separator=
RegExp("[,\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]+");var S=RegExp("[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*"),X={hs:1,rg:1},W=RegExp("([a-z])[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)",
"ig"),ma=RegExp("([rstm])[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)","ig"),Z=RegExp("(-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?)[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*",
"ig"),na=0,ba="S"+(+new Date).toString(36),V=function(){return ba+(na++).toString(36)},m="http://www.w3.org/1999/xlink",la="http://www.w3.org/2000/svg",E={},ca=a.url=function(c){return"url('#"+c+"')"};a._.$=v;a._.id=V;a.format=function(){var c=/\{([^\}]+)\}/g,a=/(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g,b=function(c,b,m){var h=m;b.replace(a,function(c,a,b,m,t){a=a||m;h&&(a in h&&(h=h[a]),"function"==typeof h&&t&&(h=h()))});return h=(null==h||h==m?c:h)+""};return function(a,m){return J(a).replace(c,
function(c,a){return b(c,a,m)})}}();a._.clone=M;a._.cacher=A;a.rad=z;a.deg=function(c){return 180*c/C%360};a.angle=w;a.is=y;a.snapTo=function(c,a,b){b=y(b,"finite")?b:10;if(y(c,"array"))for(var m=c.length;m--;){if(Y(c[m]-a)<=b)return c[m]}else{c=+c;m=a%c;if(m<b)return a-m;if(m>c-b)return a-m+c}return a};a.getRGB=A(function(c){if(!c||(c=J(c)).indexOf("-")+1)return{r:-1,g:-1,b:-1,hex:"none",error:1,toString:ka};if("none"==c)return{r:-1,g:-1,b:-1,hex:"none",toString:ka};!X[h](c.toLowerCase().substring(0,
2))&&"#"!=c.charAt()&&(c=T(c));if(!c)return{r:-1,g:-1,b:-1,hex:"none",error:1,toString:ka};var b,m,e,f,d;if(c=c.match(F)){c[2]&&(e=U(c[2].substring(5),16),m=U(c[2].substring(3,5),16),b=U(c[2].substring(1,3),16));c[3]&&(e=U((d=c[3].charAt(3))+d,16),m=U((d=c[3].charAt(2))+d,16),b=U((d=c[3].charAt(1))+d,16));c[4]&&(d=c[4].split(S),b=K(d[0]),"%"==d[0].slice(-1)&&(b*=2.55),m=K(d[1]),"%"==d[1].slice(-1)&&(m*=2.55),e=K(d[2]),"%"==d[2].slice(-1)&&(e*=2.55),"rgba"==c[1].toLowerCase().slice(0,4)&&(f=K(d[3])),
d[3]&&"%"==d[3].slice(-1)&&(f/=100));if(c[5])return d=c[5].split(S),b=K(d[0]),"%"==d[0].slice(-1)&&(b/=100),m=K(d[1]),"%"==d[1].slice(-1)&&(m/=100),e=K(d[2]),"%"==d[2].slice(-1)&&(e/=100),"deg"!=d[0].slice(-3)&&"\u00b0"!=d[0].slice(-1)||(b/=360),"hsba"==c[1].toLowerCase().slice(0,4)&&(f=K(d[3])),d[3]&&"%"==d[3].slice(-1)&&(f/=100),a.hsb2rgb(b,m,e,f);if(c[6])return d=c[6].split(S),b=K(d[0]),"%"==d[0].slice(-1)&&(b/=100),m=K(d[1]),"%"==d[1].slice(-1)&&(m/=100),e=K(d[2]),"%"==d[2].slice(-1)&&(e/=100),
"deg"!=d[0].slice(-3)&&"\u00b0"!=d[0].slice(-1)||(b/=360),"hsla"==c[1].toLowerCase().slice(0,4)&&(f=K(d[3])),d[3]&&"%"==d[3].slice(-1)&&(f/=100),a.hsl2rgb(b,m,e,f);b=Q(I.round(b),255);m=Q(I.round(m),255);e=Q(I.round(e),255);f=Q(P(f,0),1);c={r:b,g:m,b:e,toString:ka};c.hex="#"+(16777216|e|m<<8|b<<16).toString(16).slice(1);c.opacity=y(f,"finite")?f:1;return c}return{r:-1,g:-1,b:-1,hex:"none",error:1,toString:ka}},a);a.hsb=A(function(c,b,m){return a.hsb2rgb(c,b,m).hex});a.hsl=A(function(c,b,m){return a.hsl2rgb(c,
b,m).hex});a.rgb=A(function(c,a,b,m){if(y(m,"finite")){var e=I.round;return"rgba("+[e(c),e(a),e(b),+m.toFixed(2)]+")"}return"#"+(16777216|b|a<<8|c<<16).toString(16).slice(1)});var T=function(c){var a=G.doc.getElementsByTagName("head")[0]||G.doc.getElementsByTagName("svg")[0];T=A(function(c){if("red"==c.toLowerCase())return"rgb(255, 0, 0)";a.style.color="rgb(255, 0, 0)";a.style.color=c;c=G.doc.defaultView.getComputedStyle(a,aa).getPropertyValue("color");return"rgb(255, 0, 0)"==c?null:c});return T(c)},
qa=function(){return"hsb("+[this.h,this.s,this.b]+")"},ra=function(){return"hsl("+[this.h,this.s,this.l]+")"},ka=function(){return 1==this.opacity||null==this.opacity?this.hex:"rgba("+[this.r,this.g,this.b,this.opacity]+")"},D=function(c,b,m){null==b&&y(c,"object")&&"r"in c&&"g"in c&&"b"in c&&(m=c.b,b=c.g,c=c.r);null==b&&y(c,string)&&(m=a.getRGB(c),c=m.r,b=m.g,m=m.b);if(1<c||1<b||1<m)c/=255,b/=255,m/=255;return[c,b,m]},oa=function(c,b,m,e){c=I.round(255*c);b=I.round(255*b);m=I.round(255*m);c={r:c,
g:b,b:m,opacity:y(e,"finite")?e:1,hex:a.rgb(c,b,m),toString:ka};y(e,"finite")&&(c.opacity=e);return c};a.color=function(c){var b;y(c,"object")&&"h"in c&&"s"in c&&"b"in c?(b=a.hsb2rgb(c),c.r=b.r,c.g=b.g,c.b=b.b,c.opacity=1,c.hex=b.hex):y(c,"object")&&"h"in c&&"s"in c&&"l"in c?(b=a.hsl2rgb(c),c.r=b.r,c.g=b.g,c.b=b.b,c.opacity=1,c.hex=b.hex):(y(c,"string")&&(c=a.getRGB(c)),y(c,"object")&&"r"in c&&"g"in c&&"b"in c&&!("error"in c)?(b=a.rgb2hsl(c),c.h=b.h,c.s=b.s,c.l=b.l,b=a.rgb2hsb(c),c.v=b.b):(c={hex:"none"},
c.r=c.g=c.b=c.h=c.s=c.v=c.l=-1,c.error=1));c.toString=ka;return c};a.hsb2rgb=function(c,a,b,m){y(c,"object")&&"h"in c&&"s"in c&&"b"in c&&(b=c.b,a=c.s,c=c.h,m=c.o);var e,h,d;c=360*c%360/60;d=b*a;a=d*(1-Y(c%2-1));b=e=h=b-d;c=~~c;b+=[d,a,0,0,a,d][c];e+=[a,d,d,a,0,0][c];h+=[0,0,a,d,d,a][c];return oa(b,e,h,m)};a.hsl2rgb=function(c,a,b,m){y(c,"object")&&"h"in c&&"s"in c&&"l"in c&&(b=c.l,a=c.s,c=c.h);if(1<c||1<a||1<b)c/=360,a/=100,b/=100;var e,h,d;c=360*c%360/60;d=2*a*(0.5>b?b:1-b);a=d*(1-Y(c%2-1));b=e=
h=b-d/2;c=~~c;b+=[d,a,0,0,a,d][c];e+=[a,d,d,a,0,0][c];h+=[0,0,a,d,d,a][c];return oa(b,e,h,m)};a.rgb2hsb=function(c,a,b){b=D(c,a,b);c=b[0];a=b[1];b=b[2];var m,e;m=P(c,a,b);e=m-Q(c,a,b);c=((0==e?0:m==c?(a-b)/e:m==a?(b-c)/e+2:(c-a)/e+4)+360)%6*60/360;return{h:c,s:0==e?0:e/m,b:m,toString:qa}};a.rgb2hsl=function(c,a,b){b=D(c,a,b);c=b[0];a=b[1];b=b[2];var m,e,h;m=P(c,a,b);e=Q(c,a,b);h=m-e;c=((0==h?0:m==c?(a-b)/h:m==a?(b-c)/h+2:(c-a)/h+4)+360)%6*60/360;m=(m+e)/2;return{h:c,s:0==h?0:0.5>m?h/(2*m):h/(2-2*
m),l:m,toString:ra}};a.parsePathString=function(c){if(!c)return null;var b=a.path(c);if(b.arr)return a.path.clone(b.arr);var m={a:7,c:6,o:2,h:1,l:2,m:2,r:4,q:4,s:4,t:2,v:1,u:3,z:0},e=[];y(c,"array")&&y(c[0],"array")&&(e=a.path.clone(c));e.length||J(c).replace(W,function(c,a,b){var h=[];c=a.toLowerCase();b.replace(Z,function(c,a){a&&h.push(+a)});"m"==c&&2<h.length&&(e.push([a].concat(h.splice(0,2))),c="l",a="m"==a?"l":"L");"o"==c&&1==h.length&&e.push([a,h[0] ]);if("r"==c)e.push([a].concat(h));else for(;h.length>=
m[c]&&(e.push([a].concat(h.splice(0,m[c]))),m[c]););});e.toString=a.path.toString;b.arr=a.path.clone(e);return e};var O=a.parseTransformString=function(c){if(!c)return null;var b=[];y(c,"array")&&y(c[0],"array")&&(b=a.path.clone(c));b.length||J(c).replace(ma,function(c,a,m){var e=[];a.toLowerCase();m.replace(Z,function(c,a){a&&e.push(+a)});b.push([a].concat(e))});b.toString=a.path.toString;return b};a._.svgTransform2string=d;a._.rgTransform=RegExp("^[a-z][\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*-?\\.?\\d",
"i");a._.transform2matrix=f;a._unit2px=b;a._.getSomeDefs=u;a._.getSomeSVG=p;a.select=function(c){return x(G.doc.querySelector(c))};a.selectAll=function(c){c=G.doc.querySelectorAll(c);for(var b=(a.set||Array)(),m=0;m<c.length;m++)b.push(x(c[m]));return b};setInterval(function(){for(var c in E)if(E[h](c)){var a=E[c],b=a.node;("svg"!=a.type&&!b.ownerSVGElement||"svg"==a.type&&(!b.parentNode||"ownerSVGElement"in b.parentNode&&!b.ownerSVGElement))&&delete E[c]}},1E4);(function(c){function m(c){function a(c,
b){var m=v(c.node,b);(m=(m=m&&m.match(d))&&m[2])&&"#"==m.charAt()&&(m=m.substring(1))&&(f[m]=(f[m]||[]).concat(function(a){var m={};m[b]=ca(a);v(c.node,m)}))}function b(c){var a=v(c.node,"xlink:href");a&&"#"==a.charAt()&&(a=a.substring(1))&&(f[a]=(f[a]||[]).concat(function(a){c.attr("xlink:href","#"+a)}))}var e=c.selectAll("*"),h,d=/^\s*url\(("|'|)(.*)\1\)\s*$/;c=[];for(var f={},l=0,E=e.length;l<E;l++){h=e[l];a(h,"fill");a(h,"stroke");a(h,"filter");a(h,"mask");a(h,"clip-path");b(h);var t=v(h.node,
"id");t&&(v(h.node,{id:h.id}),c.push({old:t,id:h.id}))}l=0;for(E=c.length;l<E;l++)if(e=f[c[l].old])for(h=0,t=e.length;h<t;h++)e[h](c[l].id)}function e(c,a,b){return function(m){m=m.slice(c,a);1==m.length&&(m=m[0]);return b?b(m):m}}function d(c){return function(){var a=c?"<"+this.type:"",b=this.node.attributes,m=this.node.childNodes;if(c)for(var e=0,h=b.length;e<h;e++)a+=" "+b[e].name+'="'+b[e].value.replace(/"/g,'\\"')+'"';if(m.length){c&&(a+=">");e=0;for(h=m.length;e<h;e++)3==m[e].nodeType?a+=m[e].nodeValue:
1==m[e].nodeType&&(a+=x(m[e]).toString());c&&(a+="</"+this.type+">")}else c&&(a+="/>");return a}}c.attr=function(c,a){if(!c)return this;if(y(c,"string"))if(1<arguments.length){var b={};b[c]=a;c=b}else return k("snap.util.getattr."+c,this).firstDefined();for(var m in c)c[h](m)&&k("snap.util.attr."+m,this,c[m]);return this};c.getBBox=function(c){if(!a.Matrix||!a.path)return this.node.getBBox();var b=this,m=new a.Matrix;if(b.removed)return a._.box();for(;"use"==b.type;)if(c||(m=m.add(b.transform().localMatrix.translate(b.attr("x")||
0,b.attr("y")||0))),b.original)b=b.original;else var e=b.attr("xlink:href"),b=b.original=b.node.ownerDocument.getElementById(e.substring(e.indexOf("#")+1));var e=b._,h=a.path.get[b.type]||a.path.get.deflt;try{if(c)return e.bboxwt=h?a.path.getBBox(b.realPath=h(b)):a._.box(b.node.getBBox()),a._.box(e.bboxwt);b.realPath=h(b);b.matrix=b.transform().localMatrix;e.bbox=a.path.getBBox(a.path.map(b.realPath,m.add(b.matrix)));return a._.box(e.bbox)}catch(d){return a._.box()}};var f=function(){return this.string};
c.transform=function(c){var b=this._;if(null==c){var m=this;c=new a.Matrix(this.node.getCTM());for(var e=n(this),h=[e],d=new a.Matrix,l=e.toTransformString(),b=J(e)==J(this.matrix)?J(b.transform):l;"svg"!=m.type&&(m=m.parent());)h.push(n(m));for(m=h.length;m--;)d.add(h[m]);return{string:b,globalMatrix:c,totalMatrix:d,localMatrix:e,diffMatrix:c.clone().add(e.invert()),global:c.toTransformString(),total:d.toTransformString(),local:l,toString:f}}c instanceof a.Matrix?this.matrix=c:n(this,c);this.node&&
("linearGradient"==this.type||"radialGradient"==this.type?v(this.node,{gradientTransform:this.matrix}):"pattern"==this.type?v(this.node,{patternTransform:this.matrix}):v(this.node,{transform:this.matrix}));return this};c.parent=function(){return x(this.node.parentNode)};c.append=c.add=function(c){if(c){if("set"==c.type){var a=this;c.forEach(function(c){a.add(c)});return this}c=x(c);this.node.appendChild(c.node);c.paper=this.paper}return this};c.appendTo=function(c){c&&(c=x(c),c.append(this));return this};
c.prepend=function(c){if(c){if("set"==c.type){var a=this,b;c.forEach(function(c){b?b.after(c):a.prepend(c);b=c});return this}c=x(c);var m=c.parent();this.node.insertBefore(c.node,this.node.firstChild);this.add&&this.add();c.paper=this.paper;this.parent()&&this.parent().add();m&&m.add()}return this};c.prependTo=function(c){c=x(c);c.prepend(this);return this};c.before=function(c){if("set"==c.type){var a=this;c.forEach(function(c){var b=c.parent();a.node.parentNode.insertBefore(c.node,a.node);b&&b.add()});
this.parent().add();return this}c=x(c);var b=c.parent();this.node.parentNode.insertBefore(c.node,this.node);this.parent()&&this.parent().add();b&&b.add();c.paper=this.paper;return this};c.after=function(c){c=x(c);var a=c.parent();this.node.nextSibling?this.node.parentNode.insertBefore(c.node,this.node.nextSibling):this.node.parentNode.appendChild(c.node);this.parent()&&this.parent().add();a&&a.add();c.paper=this.paper;return this};c.insertBefore=function(c){c=x(c);var a=this.parent();c.node.parentNode.insertBefore(this.node,
c.node);this.paper=c.paper;a&&a.add();c.parent()&&c.parent().add();return this};c.insertAfter=function(c){c=x(c);var a=this.parent();c.node.parentNode.insertBefore(this.node,c.node.nextSibling);this.paper=c.paper;a&&a.add();c.parent()&&c.parent().add();return this};c.remove=function(){var c=this.parent();this.node.parentNode&&this.node.parentNode.removeChild(this.node);delete this.paper;this.removed=!0;c&&c.add();return this};c.select=function(c){return x(this.node.querySelector(c))};c.selectAll=
function(c){c=this.node.querySelectorAll(c);for(var b=(a.set||Array)(),m=0;m<c.length;m++)b.push(x(c[m]));return b};c.asPX=function(c,a){null==a&&(a=this.attr(c));return+b(this,c,a)};c.use=function(){var c,a=this.node.id;a||(a=this.id,v(this.node,{id:a}));c="linearGradient"==this.type||"radialGradient"==this.type||"pattern"==this.type?r(this.type,this.node.parentNode):r("use",this.node.parentNode);v(c.node,{"xlink:href":"#"+a});c.original=this;return c};var l=/\S+/g;c.addClass=function(c){var a=(c||
"").match(l)||[];c=this.node;var b=c.className.baseVal,m=b.match(l)||[],e,h,d;if(a.length){for(e=0;d=a[e++];)h=m.indexOf(d),~h||m.push(d);a=m.join(" ");b!=a&&(c.className.baseVal=a)}return this};c.removeClass=function(c){var a=(c||"").match(l)||[];c=this.node;var b=c.className.baseVal,m=b.match(l)||[],e,h;if(m.length){for(e=0;h=a[e++];)h=m.indexOf(h),~h&&m.splice(h,1);a=m.join(" ");b!=a&&(c.className.baseVal=a)}return this};c.hasClass=function(c){return!!~(this.node.className.baseVal.match(l)||[]).indexOf(c)};
c.toggleClass=function(c,a){if(null!=a)return a?this.addClass(c):this.removeClass(c);var b=(c||"").match(l)||[],m=this.node,e=m.className.baseVal,h=e.match(l)||[],d,f,E;for(d=0;E=b[d++];)f=h.indexOf(E),~f?h.splice(f,1):h.push(E);b=h.join(" ");e!=b&&(m.className.baseVal=b);return this};c.clone=function(){var c=x(this.node.cloneNode(!0));v(c.node,"id")&&v(c.node,{id:c.id});m(c);c.insertAfter(this);return c};c.toDefs=function(){u(this).appendChild(this.node);return this};c.pattern=c.toPattern=function(c,
a,b,m){var e=r("pattern",u(this));null==c&&(c=this.getBBox());y(c,"object")&&"x"in c&&(a=c.y,b=c.width,m=c.height,c=c.x);v(e.node,{x:c,y:a,width:b,height:m,patternUnits:"userSpaceOnUse",id:e.id,viewBox:[c,a,b,m].join(" ")});e.node.appendChild(this.node);return e};c.marker=function(c,a,b,m,e,h){var d=r("marker",u(this));null==c&&(c=this.getBBox());y(c,"object")&&"x"in c&&(a=c.y,b=c.width,m=c.height,e=c.refX||c.cx,h=c.refY||c.cy,c=c.x);v(d.node,{viewBox:[c,a,b,m].join(" "),markerWidth:b,markerHeight:m,
orient:"auto",refX:e||0,refY:h||0,id:d.id});d.node.appendChild(this.node);return d};var E=function(c,a,b,m){"function"!=typeof b||b.length||(m=b,b=L.linear);this.attr=c;this.dur=a;b&&(this.easing=b);m&&(this.callback=m)};a._.Animation=E;a.animation=function(c,a,b,m){return new E(c,a,b,m)};c.inAnim=function(){var c=[],a;for(a in this.anims)this.anims[h](a)&&function(a){c.push({anim:new E(a._attrs,a.dur,a.easing,a._callback),mina:a,curStatus:a.status(),status:function(c){return a.status(c)},stop:function(){a.stop()}})}(this.anims[a]);
return c};a.animate=function(c,a,b,m,e,h){"function"!=typeof e||e.length||(h=e,e=L.linear);var d=L.time();c=L(c,a,d,d+m,L.time,b,e);h&&k.once("mina.finish."+c.id,h);return c};c.stop=function(){for(var c=this.inAnim(),a=0,b=c.length;a<b;a++)c[a].stop();return this};c.animate=function(c,a,b,m){"function"!=typeof b||b.length||(m=b,b=L.linear);c instanceof E&&(m=c.callback,b=c.easing,a=b.dur,c=c.attr);var d=[],f=[],l={},t,ca,n,T=this,q;for(q in c)if(c[h](q)){T.equal?(n=T.equal(q,J(c[q])),t=n.from,ca=
n.to,n=n.f):(t=+T.attr(q),ca=+c[q]);var la=y(t,"array")?t.length:1;l[q]=e(d.length,d.length+la,n);d=d.concat(t);f=f.concat(ca)}t=L.time();var p=L(d,f,t,t+a,L.time,function(c){var a={},b;for(b in l)l[h](b)&&(a[b]=l[b](c));T.attr(a)},b);T.anims[p.id]=p;p._attrs=c;p._callback=m;k("snap.animcreated."+T.id,p);k.once("mina.finish."+p.id,function(){delete T.anims[p.id];m&&m.call(T)});k.once("mina.stop."+p.id,function(){delete T.anims[p.id]});return T};var T={};c.data=function(c,b){var m=T[this.id]=T[this.id]||
{};if(0==arguments.length)return k("snap.data.get."+this.id,this,m,null),m;if(1==arguments.length){if(a.is(c,"object")){for(var e in c)c[h](e)&&this.data(e,c[e]);return this}k("snap.data.get."+this.id,this,m[c],c);return m[c]}m[c]=b;k("snap.data.set."+this.id,this,b,c);return this};c.removeData=function(c){null==c?T[this.id]={}:T[this.id]&&delete T[this.id][c];return this};c.outerSVG=c.toString=d(1);c.innerSVG=d()})(e.prototype);a.parse=function(c){var a=G.doc.createDocumentFragment(),b=!0,m=G.doc.createElement("div");
c=J(c);c.match(/^\s*<\s*svg(?:\s|>)/)||(c="<svg>"+c+"</svg>",b=!1);m.innerHTML=c;if(c=m.getElementsByTagName("svg")[0])if(b)a=c;else for(;c.firstChild;)a.appendChild(c.firstChild);m.innerHTML=aa;return new l(a)};l.prototype.select=e.prototype.select;l.prototype.selectAll=e.prototype.selectAll;a.fragment=function(){for(var c=Array.prototype.slice.call(arguments,0),b=G.doc.createDocumentFragment(),m=0,e=c.length;m<e;m++){var h=c[m];h.node&&h.node.nodeType&&b.appendChild(h.node);h.nodeType&&b.appendChild(h);
"string"==typeof h&&b.appendChild(a.parse(h).node)}return new l(b)};a._.make=r;a._.wrap=x;s.prototype.el=function(c,a){var b=r(c,this.node);a&&b.attr(a);return b};k.on("snap.util.getattr",function(){var c=k.nt(),c=c.substring(c.lastIndexOf(".")+1),a=c.replace(/[A-Z]/g,function(c){return"-"+c.toLowerCase()});return pa[h](a)?this.node.ownerDocument.defaultView.getComputedStyle(this.node,null).getPropertyValue(a):v(this.node,c)});var pa={"alignment-baseline":0,"baseline-shift":0,clip:0,"clip-path":0,
"clip-rule":0,color:0,"color-interpolation":0,"color-interpolation-filters":0,"color-profile":0,"color-rendering":0,cursor:0,direction:0,display:0,"dominant-baseline":0,"enable-background":0,fill:0,"fill-opacity":0,"fill-rule":0,filter:0,"flood-color":0,"flood-opacity":0,font:0,"font-family":0,"font-size":0,"font-size-adjust":0,"font-stretch":0,"font-style":0,"font-variant":0,"font-weight":0,"glyph-orientation-horizontal":0,"glyph-orientation-vertical":0,"image-rendering":0,kerning:0,"letter-spacing":0,
"lighting-color":0,marker:0,"marker-end":0,"marker-mid":0,"marker-start":0,mask:0,opacity:0,overflow:0,"pointer-events":0,"shape-rendering":0,"stop-color":0,"stop-opacity":0,stroke:0,"stroke-dasharray":0,"stroke-dashoffset":0,"stroke-linecap":0,"stroke-linejoin":0,"stroke-miterlimit":0,"stroke-opacity":0,"stroke-width":0,"text-anchor":0,"text-decoration":0,"text-rendering":0,"unicode-bidi":0,visibility:0,"word-spacing":0,"writing-mode":0};k.on("snap.util.attr",function(c){var a=k.nt(),b={},a=a.substring(a.lastIndexOf(".")+
1);b[a]=c;var m=a.replace(/-(\w)/gi,function(c,a){return a.toUpperCase()}),a=a.replace(/[A-Z]/g,function(c){return"-"+c.toLowerCase()});pa[h](a)?this.node.style[m]=null==c?aa:c:v(this.node,b)});a.ajax=function(c,a,b,m){var e=new XMLHttpRequest,h=V();if(e){if(y(a,"function"))m=b,b=a,a=null;else if(y(a,"object")){var d=[],f;for(f in a)a.hasOwnProperty(f)&&d.push(encodeURIComponent(f)+"="+encodeURIComponent(a[f]));a=d.join("&")}e.open(a?"POST":"GET",c,!0);a&&(e.setRequestHeader("X-Requested-With","XMLHttpRequest"),
e.setRequestHeader("Content-type","application/x-www-form-urlencoded"));b&&(k.once("snap.ajax."+h+".0",b),k.once("snap.ajax."+h+".200",b),k.once("snap.ajax."+h+".304",b));e.onreadystatechange=function(){4==e.readyState&&k("snap.ajax."+h+"."+e.status,m,e)};if(4==e.readyState)return e;e.send(a);return e}};a.load=function(c,b,m){a.ajax(c,function(c){c=a.parse(c.responseText);m?b.call(m,c):b(c)})};a.getElementByPoint=function(c,a){var b,m,e=G.doc.elementFromPoint(c,a);if(G.win.opera&&"svg"==e.tagName){b=
e;m=b.getBoundingClientRect();b=b.ownerDocument;var h=b.body,d=b.documentElement;b=m.top+(g.win.pageYOffset||d.scrollTop||h.scrollTop)-(d.clientTop||h.clientTop||0);m=m.left+(g.win.pageXOffset||d.scrollLeft||h.scrollLeft)-(d.clientLeft||h.clientLeft||0);h=e.createSVGRect();h.x=c-m;h.y=a-b;h.width=h.height=1;b=e.getIntersectionList(h,null);b.length&&(e=b[b.length-1])}return e?x(e):null};a.plugin=function(c){c(a,e,s,G,l)};return G.win.Snap=a}();C.plugin(function(a,k,y,M,A){function w(a,d,f,b,q,e){null==
d&&"[object SVGMatrix]"==z.call(a)?(this.a=a.a,this.b=a.b,this.c=a.c,this.d=a.d,this.e=a.e,this.f=a.f):null!=a?(this.a=+a,this.b=+d,this.c=+f,this.d=+b,this.e=+q,this.f=+e):(this.a=1,this.c=this.b=0,this.d=1,this.f=this.e=0)}var z=Object.prototype.toString,d=String,f=Math;(function(n){function k(a){return a[0]*a[0]+a[1]*a[1]}function p(a){var d=f.sqrt(k(a));a[0]&&(a[0]/=d);a[1]&&(a[1]/=d)}n.add=function(a,d,e,f,n,p){var k=[[],[],[] ],u=[[this.a,this.c,this.e],[this.b,this.d,this.f],[0,0,1] ];d=[[a,
e,n],[d,f,p],[0,0,1] ];a&&a instanceof w&&(d=[[a.a,a.c,a.e],[a.b,a.d,a.f],[0,0,1] ]);for(a=0;3>a;a++)for(e=0;3>e;e++){for(f=n=0;3>f;f++)n+=u[a][f]*d[f][e];k[a][e]=n}this.a=k[0][0];this.b=k[1][0];this.c=k[0][1];this.d=k[1][1];this.e=k[0][2];this.f=k[1][2];return this};n.invert=function(){var a=this.a*this.d-this.b*this.c;return new w(this.d/a,-this.b/a,-this.c/a,this.a/a,(this.c*this.f-this.d*this.e)/a,(this.b*this.e-this.a*this.f)/a)};n.clone=function(){return new w(this.a,this.b,this.c,this.d,this.e,
this.f)};n.translate=function(a,d){return this.add(1,0,0,1,a,d)};n.scale=function(a,d,e,f){null==d&&(d=a);(e||f)&&this.add(1,0,0,1,e,f);this.add(a,0,0,d,0,0);(e||f)&&this.add(1,0,0,1,-e,-f);return this};n.rotate=function(b,d,e){b=a.rad(b);d=d||0;e=e||0;var l=+f.cos(b).toFixed(9);b=+f.sin(b).toFixed(9);this.add(l,b,-b,l,d,e);return this.add(1,0,0,1,-d,-e)};n.x=function(a,d){return a*this.a+d*this.c+this.e};n.y=function(a,d){return a*this.b+d*this.d+this.f};n.get=function(a){return+this[d.fromCharCode(97+
a)].toFixed(4)};n.toString=function(){return"matrix("+[this.get(0),this.get(1),this.get(2),this.get(3),this.get(4),this.get(5)].join()+")"};n.offset=function(){return[this.e.toFixed(4),this.f.toFixed(4)]};n.determinant=function(){return this.a*this.d-this.b*this.c};n.split=function(){var b={};b.dx=this.e;b.dy=this.f;var d=[[this.a,this.c],[this.b,this.d] ];b.scalex=f.sqrt(k(d[0]));p(d[0]);b.shear=d[0][0]*d[1][0]+d[0][1]*d[1][1];d[1]=[d[1][0]-d[0][0]*b.shear,d[1][1]-d[0][1]*b.shear];b.scaley=f.sqrt(k(d[1]));
p(d[1]);b.shear/=b.scaley;0>this.determinant()&&(b.scalex=-b.scalex);var e=-d[0][1],d=d[1][1];0>d?(b.rotate=a.deg(f.acos(d)),0>e&&(b.rotate=360-b.rotate)):b.rotate=a.deg(f.asin(e));b.isSimple=!+b.shear.toFixed(9)&&(b.scalex.toFixed(9)==b.scaley.toFixed(9)||!b.rotate);b.isSuperSimple=!+b.shear.toFixed(9)&&b.scalex.toFixed(9)==b.scaley.toFixed(9)&&!b.rotate;b.noRotation=!+b.shear.toFixed(9)&&!b.rotate;return b};n.toTransformString=function(a){a=a||this.split();if(+a.shear.toFixed(9))return"m"+[this.get(0),
this.get(1),this.get(2),this.get(3),this.get(4),this.get(5)];a.scalex=+a.scalex.toFixed(4);a.scaley=+a.scaley.toFixed(4);a.rotate=+a.rotate.toFixed(4);return(a.dx||a.dy?"t"+[+a.dx.toFixed(4),+a.dy.toFixed(4)]:"")+(1!=a.scalex||1!=a.scaley?"s"+[a.scalex,a.scaley,0,0]:"")+(a.rotate?"r"+[+a.rotate.toFixed(4),0,0]:"")}})(w.prototype);a.Matrix=w;a.matrix=function(a,d,f,b,k,e){return new w(a,d,f,b,k,e)}});C.plugin(function(a,v,y,M,A){function w(h){return function(d){k.stop();d instanceof A&&1==d.node.childNodes.length&&
("radialGradient"==d.node.firstChild.tagName||"linearGradient"==d.node.firstChild.tagName||"pattern"==d.node.firstChild.tagName)&&(d=d.node.firstChild,b(this).appendChild(d),d=u(d));if(d instanceof v)if("radialGradient"==d.type||"linearGradient"==d.type||"pattern"==d.type){d.node.id||e(d.node,{id:d.id});var f=l(d.node.id)}else f=d.attr(h);else f=a.color(d),f.error?(f=a(b(this).ownerSVGElement).gradient(d))?(f.node.id||e(f.node,{id:f.id}),f=l(f.node.id)):f=d:f=r(f);d={};d[h]=f;e(this.node,d);this.node.style[h]=
x}}function z(a){k.stop();a==+a&&(a+="px");this.node.style.fontSize=a}function d(a){var b=[];a=a.childNodes;for(var e=0,f=a.length;e<f;e++){var l=a[e];3==l.nodeType&&b.push(l.nodeValue);"tspan"==l.tagName&&(1==l.childNodes.length&&3==l.firstChild.nodeType?b.push(l.firstChild.nodeValue):b.push(d(l)))}return b}function f(){k.stop();return this.node.style.fontSize}var n=a._.make,u=a._.wrap,p=a.is,b=a._.getSomeDefs,q=/^url\(#?([^)]+)\)$/,e=a._.$,l=a.url,r=String,s=a._.separator,x="";k.on("snap.util.attr.mask",
function(a){if(a instanceof v||a instanceof A){k.stop();a instanceof A&&1==a.node.childNodes.length&&(a=a.node.firstChild,b(this).appendChild(a),a=u(a));if("mask"==a.type)var d=a;else d=n("mask",b(this)),d.node.appendChild(a.node);!d.node.id&&e(d.node,{id:d.id});e(this.node,{mask:l(d.id)})}});(function(a){k.on("snap.util.attr.clip",a);k.on("snap.util.attr.clip-path",a);k.on("snap.util.attr.clipPath",a)})(function(a){if(a instanceof v||a instanceof A){k.stop();if("clipPath"==a.type)var d=a;else d=
n("clipPath",b(this)),d.node.appendChild(a.node),!d.node.id&&e(d.node,{id:d.id});e(this.node,{"clip-path":l(d.id)})}});k.on("snap.util.attr.fill",w("fill"));k.on("snap.util.attr.stroke",w("stroke"));var G=/^([lr])(?:\(([^)]*)\))?(.*)$/i;k.on("snap.util.grad.parse",function(a){a=r(a);var b=a.match(G);if(!b)return null;a=b[1];var e=b[2],b=b[3],e=e.split(/\s*,\s*/).map(function(a){return+a==a?+a:a});1==e.length&&0==e[0]&&(e=[]);b=b.split("-");b=b.map(function(a){a=a.split(":");var b={color:a[0]};a[1]&&
(b.offset=parseFloat(a[1]));return b});return{type:a,params:e,stops:b}});k.on("snap.util.attr.d",function(b){k.stop();p(b,"array")&&p(b[0],"array")&&(b=a.path.toString.call(b));b=r(b);b.match(/[ruo]/i)&&(b=a.path.toAbsolute(b));e(this.node,{d:b})})(-1);k.on("snap.util.attr.#text",function(a){k.stop();a=r(a);for(a=M.doc.createTextNode(a);this.node.firstChild;)this.node.removeChild(this.node.firstChild);this.node.appendChild(a)})(-1);k.on("snap.util.attr.path",function(a){k.stop();this.attr({d:a})})(-1);
k.on("snap.util.attr.class",function(a){k.stop();this.node.className.baseVal=a})(-1);k.on("snap.util.attr.viewBox",function(a){a=p(a,"object")&&"x"in a?[a.x,a.y,a.width,a.height].join(" "):p(a,"array")?a.join(" "):a;e(this.node,{viewBox:a});k.stop()})(-1);k.on("snap.util.attr.transform",function(a){this.transform(a);k.stop()})(-1);k.on("snap.util.attr.r",function(a){"rect"==this.type&&(k.stop(),e(this.node,{rx:a,ry:a}))})(-1);k.on("snap.util.attr.textpath",function(a){k.stop();if("text"==this.type){var d,
f;if(!a&&this.textPath){for(a=this.textPath;a.node.firstChild;)this.node.appendChild(a.node.firstChild);a.remove();delete this.textPath}else if(p(a,"string")?(d=b(this),a=u(d.parentNode).path(a),d.appendChild(a.node),d=a.id,a.attr({id:d})):(a=u(a),a instanceof v&&(d=a.attr("id"),d||(d=a.id,a.attr({id:d})))),d)if(a=this.textPath,f=this.node,a)a.attr({"xlink:href":"#"+d});else{for(a=e("textPath",{"xlink:href":"#"+d});f.firstChild;)a.appendChild(f.firstChild);f.appendChild(a);this.textPath=u(a)}}})(-1);
k.on("snap.util.attr.text",function(a){if("text"==this.type){for(var b=this.node,d=function(a){var b=e("tspan");if(p(a,"array"))for(var f=0;f<a.length;f++)b.appendChild(d(a[f]));else b.appendChild(M.doc.createTextNode(a));b.normalize&&b.normalize();return b};b.firstChild;)b.removeChild(b.firstChild);for(a=d(a);a.firstChild;)b.appendChild(a.firstChild)}k.stop()})(-1);k.on("snap.util.attr.fontSize",z)(-1);k.on("snap.util.attr.font-size",z)(-1);k.on("snap.util.getattr.transform",function(){k.stop();
return this.transform()})(-1);k.on("snap.util.getattr.textpath",function(){k.stop();return this.textPath})(-1);(function(){function b(d){return function(){k.stop();var b=M.doc.defaultView.getComputedStyle(this.node,null).getPropertyValue("marker-"+d);return"none"==b?b:a(M.doc.getElementById(b.match(q)[1]))}}function d(a){return function(b){k.stop();var d="marker"+a.charAt(0).toUpperCase()+a.substring(1);if(""==b||!b)this.node.style[d]="none";else if("marker"==b.type){var f=b.node.id;f||e(b.node,{id:b.id});
this.node.style[d]=l(f)}}}k.on("snap.util.getattr.marker-end",b("end"))(-1);k.on("snap.util.getattr.markerEnd",b("end"))(-1);k.on("snap.util.getattr.marker-start",b("start"))(-1);k.on("snap.util.getattr.markerStart",b("start"))(-1);k.on("snap.util.getattr.marker-mid",b("mid"))(-1);k.on("snap.util.getattr.markerMid",b("mid"))(-1);k.on("snap.util.attr.marker-end",d("end"))(-1);k.on("snap.util.attr.markerEnd",d("end"))(-1);k.on("snap.util.attr.marker-start",d("start"))(-1);k.on("snap.util.attr.markerStart",
d("start"))(-1);k.on("snap.util.attr.marker-mid",d("mid"))(-1);k.on("snap.util.attr.markerMid",d("mid"))(-1)})();k.on("snap.util.getattr.r",function(){if("rect"==this.type&&e(this.node,"rx")==e(this.node,"ry"))return k.stop(),e(this.node,"rx")})(-1);k.on("snap.util.getattr.text",function(){if("text"==this.type||"tspan"==this.type){k.stop();var a=d(this.node);return 1==a.length?a[0]:a}})(-1);k.on("snap.util.getattr.#text",function(){return this.node.textContent})(-1);k.on("snap.util.getattr.viewBox",
function(){k.stop();var b=e(this.node,"viewBox");if(b)return b=b.split(s),a._.box(+b[0],+b[1],+b[2],+b[3])})(-1);k.on("snap.util.getattr.points",function(){var a=e(this.node,"points");k.stop();if(a)return a.split(s)})(-1);k.on("snap.util.getattr.path",function(){var a=e(this.node,"d");k.stop();return a})(-1);k.on("snap.util.getattr.class",function(){return this.node.className.baseVal})(-1);k.on("snap.util.getattr.fontSize",f)(-1);k.on("snap.util.getattr.font-size",f)(-1)});C.plugin(function(a,v,y,
M,A){function w(a){return a}function z(a){return function(b){return+b.toFixed(3)+a}}var d={"+":function(a,b){return a+b},"-":function(a,b){return a-b},"/":function(a,b){return a/b},"*":function(a,b){return a*b}},f=String,n=/[a-z]+$/i,u=/^\s*([+\-\/*])\s*=\s*([\d.eE+\-]+)\s*([^\d\s]+)?\s*$/;k.on("snap.util.attr",function(a){if(a=f(a).match(u)){var b=k.nt(),b=b.substring(b.lastIndexOf(".")+1),q=this.attr(b),e={};k.stop();var l=a[3]||"",r=q.match(n),s=d[a[1] ];r&&r==l?a=s(parseFloat(q),+a[2]):(q=this.asPX(b),
a=s(this.asPX(b),this.asPX(b,a[2]+l)));isNaN(q)||isNaN(a)||(e[b]=a,this.attr(e))}})(-10);k.on("snap.util.equal",function(a,b){var q=f(this.attr(a)||""),e=f(b).match(u);if(e){k.stop();var l=e[3]||"",r=q.match(n),s=d[e[1] ];if(r&&r==l)return{from:parseFloat(q),to:s(parseFloat(q),+e[2]),f:z(r)};q=this.asPX(a);return{from:q,to:s(q,this.asPX(a,e[2]+l)),f:w}}})(-10)});C.plugin(function(a,v,y,M,A){var w=y.prototype,z=a.is;w.rect=function(a,d,k,p,b,q){var e;null==q&&(q=b);z(a,"object")&&"[object Object]"==
a?e=a:null!=a&&(e={x:a,y:d,width:k,height:p},null!=b&&(e.rx=b,e.ry=q));return this.el("rect",e)};w.circle=function(a,d,k){var p;z(a,"object")&&"[object Object]"==a?p=a:null!=a&&(p={cx:a,cy:d,r:k});return this.el("circle",p)};var d=function(){function a(){this.parentNode.removeChild(this)}return function(d,k){var p=M.doc.createElement("img"),b=M.doc.body;p.style.cssText="position:absolute;left:-9999em;top:-9999em";p.onload=function(){k.call(p);p.onload=p.onerror=null;b.removeChild(p)};p.onerror=a;
b.appendChild(p);p.src=d}}();w.image=function(f,n,k,p,b){var q=this.el("image");if(z(f,"object")&&"src"in f)q.attr(f);else if(null!=f){var e={"xlink:href":f,preserveAspectRatio:"none"};null!=n&&null!=k&&(e.x=n,e.y=k);null!=p&&null!=b?(e.width=p,e.height=b):d(f,function(){a._.$(q.node,{width:this.offsetWidth,height:this.offsetHeight})});a._.$(q.node,e)}return q};w.ellipse=function(a,d,k,p){var b;z(a,"object")&&"[object Object]"==a?b=a:null!=a&&(b={cx:a,cy:d,rx:k,ry:p});return this.el("ellipse",b)};
w.path=function(a){var d;z(a,"object")&&!z(a,"array")?d=a:a&&(d={d:a});return this.el("path",d)};w.group=w.g=function(a){var d=this.el("g");1==arguments.length&&a&&!a.type?d.attr(a):arguments.length&&d.add(Array.prototype.slice.call(arguments,0));return d};w.svg=function(a,d,k,p,b,q,e,l){var r={};z(a,"object")&&null==d?r=a:(null!=a&&(r.x=a),null!=d&&(r.y=d),null!=k&&(r.width=k),null!=p&&(r.height=p),null!=b&&null!=q&&null!=e&&null!=l&&(r.viewBox=[b,q,e,l]));return this.el("svg",r)};w.mask=function(a){var d=
this.el("mask");1==arguments.length&&a&&!a.type?d.attr(a):arguments.length&&d.add(Array.prototype.slice.call(arguments,0));return d};w.ptrn=function(a,d,k,p,b,q,e,l){if(z(a,"object"))var r=a;else arguments.length?(r={},null!=a&&(r.x=a),null!=d&&(r.y=d),null!=k&&(r.width=k),null!=p&&(r.height=p),null!=b&&null!=q&&null!=e&&null!=l&&(r.viewBox=[b,q,e,l])):r={patternUnits:"userSpaceOnUse"};return this.el("pattern",r)};w.use=function(a){return null!=a?(make("use",this.node),a instanceof v&&(a.attr("id")||
a.attr({id:ID()}),a=a.attr("id")),this.el("use",{"xlink:href":a})):v.prototype.use.call(this)};w.text=function(a,d,k){var p={};z(a,"object")?p=a:null!=a&&(p={x:a,y:d,text:k||""});return this.el("text",p)};w.line=function(a,d,k,p){var b={};z(a,"object")?b=a:null!=a&&(b={x1:a,x2:k,y1:d,y2:p});return this.el("line",b)};w.polyline=function(a){1<arguments.length&&(a=Array.prototype.slice.call(arguments,0));var d={};z(a,"object")&&!z(a,"array")?d=a:null!=a&&(d={points:a});return this.el("polyline",d)};
w.polygon=function(a){1<arguments.length&&(a=Array.prototype.slice.call(arguments,0));var d={};z(a,"object")&&!z(a,"array")?d=a:null!=a&&(d={points:a});return this.el("polygon",d)};(function(){function d(){return this.selectAll("stop")}function n(b,d){var f=e("stop"),k={offset:+d+"%"};b=a.color(b);k["stop-color"]=b.hex;1>b.opacity&&(k["stop-opacity"]=b.opacity);e(f,k);this.node.appendChild(f);return this}function u(){if("linearGradient"==this.type){var b=e(this.node,"x1")||0,d=e(this.node,"x2")||
1,f=e(this.node,"y1")||0,k=e(this.node,"y2")||0;return a._.box(b,f,math.abs(d-b),math.abs(k-f))}b=this.node.r||0;return a._.box((this.node.cx||0.5)-b,(this.node.cy||0.5)-b,2*b,2*b)}function p(a,d){function f(a,b){for(var d=(b-u)/(a-w),e=w;e<a;e++)h[e].offset=+(+u+d*(e-w)).toFixed(2);w=a;u=b}var n=k("snap.util.grad.parse",null,d).firstDefined(),p;if(!n)return null;n.params.unshift(a);p="l"==n.type.toLowerCase()?b.apply(0,n.params):q.apply(0,n.params);n.type!=n.type.toLowerCase()&&e(p.node,{gradientUnits:"userSpaceOnUse"});
var h=n.stops,n=h.length,u=0,w=0;n--;for(var v=0;v<n;v++)"offset"in h[v]&&f(v,h[v].offset);h[n].offset=h[n].offset||100;f(n,h[n].offset);for(v=0;v<=n;v++){var y=h[v];p.addStop(y.color,y.offset)}return p}function b(b,k,p,q,w){b=a._.make("linearGradient",b);b.stops=d;b.addStop=n;b.getBBox=u;null!=k&&e(b.node,{x1:k,y1:p,x2:q,y2:w});return b}function q(b,k,p,q,w,h){b=a._.make("radialGradient",b);b.stops=d;b.addStop=n;b.getBBox=u;null!=k&&e(b.node,{cx:k,cy:p,r:q});null!=w&&null!=h&&e(b.node,{fx:w,fy:h});
return b}var e=a._.$;w.gradient=function(a){return p(this.defs,a)};w.gradientLinear=function(a,d,e,f){return b(this.defs,a,d,e,f)};w.gradientRadial=function(a,b,d,e,f){return q(this.defs,a,b,d,e,f)};w.toString=function(){var b=this.node.ownerDocument,d=b.createDocumentFragment(),b=b.createElement("div"),e=this.node.cloneNode(!0);d.appendChild(b);b.appendChild(e);a._.$(e,{xmlns:"http://www.w3.org/2000/svg"});b=b.innerHTML;d.removeChild(d.firstChild);return b};w.clear=function(){for(var a=this.node.firstChild,
b;a;)b=a.nextSibling,"defs"!=a.tagName?a.parentNode.removeChild(a):w.clear.call({node:a}),a=b}})()});C.plugin(function(a,k,y,M){function A(a){var b=A.ps=A.ps||{};b[a]?b[a].sleep=100:b[a]={sleep:100};setTimeout(function(){for(var d in b)b[L](d)&&d!=a&&(b[d].sleep--,!b[d].sleep&&delete b[d])});return b[a]}function w(a,b,d,e){null==a&&(a=b=d=e=0);null==b&&(b=a.y,d=a.width,e=a.height,a=a.x);return{x:a,y:b,width:d,w:d,height:e,h:e,x2:a+d,y2:b+e,cx:a+d/2,cy:b+e/2,r1:F.min(d,e)/2,r2:F.max(d,e)/2,r0:F.sqrt(d*
d+e*e)/2,path:s(a,b,d,e),vb:[a,b,d,e].join(" ")}}function z(){return this.join(",").replace(N,"$1")}function d(a){a=C(a);a.toString=z;return a}function f(a,b,d,h,f,k,l,n,p){if(null==p)return e(a,b,d,h,f,k,l,n);if(0>p||e(a,b,d,h,f,k,l,n)<p)p=void 0;else{var q=0.5,O=1-q,s;for(s=e(a,b,d,h,f,k,l,n,O);0.01<Z(s-p);)q/=2,O+=(s<p?1:-1)*q,s=e(a,b,d,h,f,k,l,n,O);p=O}return u(a,b,d,h,f,k,l,n,p)}function n(b,d){function e(a){return+(+a).toFixed(3)}return a._.cacher(function(a,h,l){a instanceof k&&(a=a.attr("d"));
a=I(a);for(var n,p,D,q,O="",s={},c=0,t=0,r=a.length;t<r;t++){D=a[t];if("M"==D[0])n=+D[1],p=+D[2];else{q=f(n,p,D[1],D[2],D[3],D[4],D[5],D[6]);if(c+q>h){if(d&&!s.start){n=f(n,p,D[1],D[2],D[3],D[4],D[5],D[6],h-c);O+=["C"+e(n.start.x),e(n.start.y),e(n.m.x),e(n.m.y),e(n.x),e(n.y)];if(l)return O;s.start=O;O=["M"+e(n.x),e(n.y)+"C"+e(n.n.x),e(n.n.y),e(n.end.x),e(n.end.y),e(D[5]),e(D[6])].join();c+=q;n=+D[5];p=+D[6];continue}if(!b&&!d)return n=f(n,p,D[1],D[2],D[3],D[4],D[5],D[6],h-c)}c+=q;n=+D[5];p=+D[6]}O+=
D.shift()+D}s.end=O;return n=b?c:d?s:u(n,p,D[0],D[1],D[2],D[3],D[4],D[5],1)},null,a._.clone)}function u(a,b,d,e,h,f,k,l,n){var p=1-n,q=ma(p,3),s=ma(p,2),c=n*n,t=c*n,r=q*a+3*s*n*d+3*p*n*n*h+t*k,q=q*b+3*s*n*e+3*p*n*n*f+t*l,s=a+2*n*(d-a)+c*(h-2*d+a),t=b+2*n*(e-b)+c*(f-2*e+b),x=d+2*n*(h-d)+c*(k-2*h+d),c=e+2*n*(f-e)+c*(l-2*f+e);a=p*a+n*d;b=p*b+n*e;h=p*h+n*k;f=p*f+n*l;l=90-180*F.atan2(s-x,t-c)/S;return{x:r,y:q,m:{x:s,y:t},n:{x:x,y:c},start:{x:a,y:b},end:{x:h,y:f},alpha:l}}function p(b,d,e,h,f,n,k,l){a.is(b,
"array")||(b=[b,d,e,h,f,n,k,l]);b=U.apply(null,b);return w(b.min.x,b.min.y,b.max.x-b.min.x,b.max.y-b.min.y)}function b(a,b,d){return b>=a.x&&b<=a.x+a.width&&d>=a.y&&d<=a.y+a.height}function q(a,d){a=w(a);d=w(d);return b(d,a.x,a.y)||b(d,a.x2,a.y)||b(d,a.x,a.y2)||b(d,a.x2,a.y2)||b(a,d.x,d.y)||b(a,d.x2,d.y)||b(a,d.x,d.y2)||b(a,d.x2,d.y2)||(a.x<d.x2&&a.x>d.x||d.x<a.x2&&d.x>a.x)&&(a.y<d.y2&&a.y>d.y||d.y<a.y2&&d.y>a.y)}function e(a,b,d,e,h,f,n,k,l){null==l&&(l=1);l=(1<l?1:0>l?0:l)/2;for(var p=[-0.1252,
0.1252,-0.3678,0.3678,-0.5873,0.5873,-0.7699,0.7699,-0.9041,0.9041,-0.9816,0.9816],q=[0.2491,0.2491,0.2335,0.2335,0.2032,0.2032,0.1601,0.1601,0.1069,0.1069,0.0472,0.0472],s=0,c=0;12>c;c++)var t=l*p[c]+l,r=t*(t*(-3*a+9*d-9*h+3*n)+6*a-12*d+6*h)-3*a+3*d,t=t*(t*(-3*b+9*e-9*f+3*k)+6*b-12*e+6*f)-3*b+3*e,s=s+q[c]*F.sqrt(r*r+t*t);return l*s}function l(a,b,d){a=I(a);b=I(b);for(var h,f,l,n,k,s,r,O,x,c,t=d?0:[],w=0,v=a.length;w<v;w++)if(x=a[w],"M"==x[0])h=k=x[1],f=s=x[2];else{"C"==x[0]?(x=[h,f].concat(x.slice(1)),
h=x[6],f=x[7]):(x=[h,f,h,f,k,s,k,s],h=k,f=s);for(var G=0,y=b.length;G<y;G++)if(c=b[G],"M"==c[0])l=r=c[1],n=O=c[2];else{"C"==c[0]?(c=[l,n].concat(c.slice(1)),l=c[6],n=c[7]):(c=[l,n,l,n,r,O,r,O],l=r,n=O);var z;var K=x,B=c;z=d;var H=p(K),J=p(B);if(q(H,J)){for(var H=e.apply(0,K),J=e.apply(0,B),H=~~(H/8),J=~~(J/8),U=[],A=[],F={},M=z?0:[],P=0;P<H+1;P++){var C=u.apply(0,K.concat(P/H));U.push({x:C.x,y:C.y,t:P/H})}for(P=0;P<J+1;P++)C=u.apply(0,B.concat(P/J)),A.push({x:C.x,y:C.y,t:P/J});for(P=0;P<H;P++)for(K=
0;K<J;K++){var Q=U[P],L=U[P+1],B=A[K],C=A[K+1],N=0.001>Z(L.x-Q.x)?"y":"x",S=0.001>Z(C.x-B.x)?"y":"x",R;R=Q.x;var Y=Q.y,V=L.x,ea=L.y,fa=B.x,ga=B.y,ha=C.x,ia=C.y;if(W(R,V)<X(fa,ha)||X(R,V)>W(fa,ha)||W(Y,ea)<X(ga,ia)||X(Y,ea)>W(ga,ia))R=void 0;else{var $=(R*ea-Y*V)*(fa-ha)-(R-V)*(fa*ia-ga*ha),aa=(R*ea-Y*V)*(ga-ia)-(Y-ea)*(fa*ia-ga*ha),ja=(R-V)*(ga-ia)-(Y-ea)*(fa-ha);if(ja){var $=$/ja,aa=aa/ja,ja=+$.toFixed(2),ba=+aa.toFixed(2);R=ja<+X(R,V).toFixed(2)||ja>+W(R,V).toFixed(2)||ja<+X(fa,ha).toFixed(2)||
ja>+W(fa,ha).toFixed(2)||ba<+X(Y,ea).toFixed(2)||ba>+W(Y,ea).toFixed(2)||ba<+X(ga,ia).toFixed(2)||ba>+W(ga,ia).toFixed(2)?void 0:{x:$,y:aa}}else R=void 0}R&&F[R.x.toFixed(4)]!=R.y.toFixed(4)&&(F[R.x.toFixed(4)]=R.y.toFixed(4),Q=Q.t+Z((R[N]-Q[N])/(L[N]-Q[N]))*(L.t-Q.t),B=B.t+Z((R[S]-B[S])/(C[S]-B[S]))*(C.t-B.t),0<=Q&&1>=Q&&0<=B&&1>=B&&(z?M++:M.push({x:R.x,y:R.y,t1:Q,t2:B})))}z=M}else z=z?0:[];if(d)t+=z;else{H=0;for(J=z.length;H<J;H++)z[H].segment1=w,z[H].segment2=G,z[H].bez1=x,z[H].bez2=c;t=t.concat(z)}}}return t}
function r(a){var b=A(a);if(b.bbox)return C(b.bbox);if(!a)return w();a=I(a);for(var d=0,e=0,h=[],f=[],l,n=0,k=a.length;n<k;n++)l=a[n],"M"==l[0]?(d=l[1],e=l[2],h.push(d),f.push(e)):(d=U(d,e,l[1],l[2],l[3],l[4],l[5],l[6]),h=h.concat(d.min.x,d.max.x),f=f.concat(d.min.y,d.max.y),d=l[5],e=l[6]);a=X.apply(0,h);l=X.apply(0,f);h=W.apply(0,h);f=W.apply(0,f);f=w(a,l,h-a,f-l);b.bbox=C(f);return f}function s(a,b,d,e,h){if(h)return[["M",+a+ +h,b],["l",d-2*h,0],["a",h,h,0,0,1,h,h],["l",0,e-2*h],["a",h,h,0,0,1,
-h,h],["l",2*h-d,0],["a",h,h,0,0,1,-h,-h],["l",0,2*h-e],["a",h,h,0,0,1,h,-h],["z"] ];a=[["M",a,b],["l",d,0],["l",0,e],["l",-d,0],["z"] ];a.toString=z;return a}function x(a,b,d,e,h){null==h&&null==e&&(e=d);a=+a;b=+b;d=+d;e=+e;if(null!=h){var f=Math.PI/180,l=a+d*Math.cos(-e*f);a+=d*Math.cos(-h*f);var n=b+d*Math.sin(-e*f);b+=d*Math.sin(-h*f);d=[["M",l,n],["A",d,d,0,+(180<h-e),0,a,b] ]}else d=[["M",a,b],["m",0,-e],["a",d,e,0,1,1,0,2*e],["a",d,e,0,1,1,0,-2*e],["z"] ];d.toString=z;return d}function G(b){var e=
A(b);if(e.abs)return d(e.abs);Q(b,"array")&&Q(b&&b[0],"array")||(b=a.parsePathString(b));if(!b||!b.length)return[["M",0,0] ];var h=[],f=0,l=0,n=0,k=0,p=0;"M"==b[0][0]&&(f=+b[0][1],l=+b[0][2],n=f,k=l,p++,h[0]=["M",f,l]);for(var q=3==b.length&&"M"==b[0][0]&&"R"==b[1][0].toUpperCase()&&"Z"==b[2][0].toUpperCase(),s,r,w=p,c=b.length;w<c;w++){h.push(s=[]);r=b[w];p=r[0];if(p!=p.toUpperCase())switch(s[0]=p.toUpperCase(),s[0]){case "A":s[1]=r[1];s[2]=r[2];s[3]=r[3];s[4]=r[4];s[5]=r[5];s[6]=+r[6]+f;s[7]=+r[7]+
l;break;case "V":s[1]=+r[1]+l;break;case "H":s[1]=+r[1]+f;break;case "R":for(var t=[f,l].concat(r.slice(1)),u=2,v=t.length;u<v;u++)t[u]=+t[u]+f,t[++u]=+t[u]+l;h.pop();h=h.concat(P(t,q));break;case "O":h.pop();t=x(f,l,r[1],r[2]);t.push(t[0]);h=h.concat(t);break;case "U":h.pop();h=h.concat(x(f,l,r[1],r[2],r[3]));s=["U"].concat(h[h.length-1].slice(-2));break;case "M":n=+r[1]+f,k=+r[2]+l;default:for(u=1,v=r.length;u<v;u++)s[u]=+r[u]+(u%2?f:l)}else if("R"==p)t=[f,l].concat(r.slice(1)),h.pop(),h=h.concat(P(t,
q)),s=["R"].concat(r.slice(-2));else if("O"==p)h.pop(),t=x(f,l,r[1],r[2]),t.push(t[0]),h=h.concat(t);else if("U"==p)h.pop(),h=h.concat(x(f,l,r[1],r[2],r[3])),s=["U"].concat(h[h.length-1].slice(-2));else for(t=0,u=r.length;t<u;t++)s[t]=r[t];p=p.toUpperCase();if("O"!=p)switch(s[0]){case "Z":f=+n;l=+k;break;case "H":f=s[1];break;case "V":l=s[1];break;case "M":n=s[s.length-2],k=s[s.length-1];default:f=s[s.length-2],l=s[s.length-1]}}h.toString=z;e.abs=d(h);return h}function h(a,b,d,e){return[a,b,d,e,d,
e]}function J(a,b,d,e,h,f){var l=1/3,n=2/3;return[l*a+n*d,l*b+n*e,l*h+n*d,l*f+n*e,h,f]}function K(b,d,e,h,f,l,n,k,p,s){var r=120*S/180,q=S/180*(+f||0),c=[],t,x=a._.cacher(function(a,b,c){var d=a*F.cos(c)-b*F.sin(c);a=a*F.sin(c)+b*F.cos(c);return{x:d,y:a}});if(s)v=s[0],t=s[1],l=s[2],u=s[3];else{t=x(b,d,-q);b=t.x;d=t.y;t=x(k,p,-q);k=t.x;p=t.y;F.cos(S/180*f);F.sin(S/180*f);t=(b-k)/2;v=(d-p)/2;u=t*t/(e*e)+v*v/(h*h);1<u&&(u=F.sqrt(u),e*=u,h*=u);var u=e*e,w=h*h,u=(l==n?-1:1)*F.sqrt(Z((u*w-u*v*v-w*t*t)/
(u*v*v+w*t*t)));l=u*e*v/h+(b+k)/2;var u=u*-h*t/e+(d+p)/2,v=F.asin(((d-u)/h).toFixed(9));t=F.asin(((p-u)/h).toFixed(9));v=b<l?S-v:v;t=k<l?S-t:t;0>v&&(v=2*S+v);0>t&&(t=2*S+t);n&&v>t&&(v-=2*S);!n&&t>v&&(t-=2*S)}if(Z(t-v)>r){var c=t,w=k,G=p;t=v+r*(n&&t>v?1:-1);k=l+e*F.cos(t);p=u+h*F.sin(t);c=K(k,p,e,h,f,0,n,w,G,[t,c,l,u])}l=t-v;f=F.cos(v);r=F.sin(v);n=F.cos(t);t=F.sin(t);l=F.tan(l/4);e=4/3*e*l;l*=4/3*h;h=[b,d];b=[b+e*r,d-l*f];d=[k+e*t,p-l*n];k=[k,p];b[0]=2*h[0]-b[0];b[1]=2*h[1]-b[1];if(s)return[b,d,k].concat(c);
c=[b,d,k].concat(c).join().split(",");s=[];k=0;for(p=c.length;k<p;k++)s[k]=k%2?x(c[k-1],c[k],q).y:x(c[k],c[k+1],q).x;return s}function U(a,b,d,e,h,f,l,k){for(var n=[],p=[[],[] ],s,r,c,t,q=0;2>q;++q)0==q?(r=6*a-12*d+6*h,s=-3*a+9*d-9*h+3*l,c=3*d-3*a):(r=6*b-12*e+6*f,s=-3*b+9*e-9*f+3*k,c=3*e-3*b),1E-12>Z(s)?1E-12>Z(r)||(s=-c/r,0<s&&1>s&&n.push(s)):(t=r*r-4*c*s,c=F.sqrt(t),0>t||(t=(-r+c)/(2*s),0<t&&1>t&&n.push(t),s=(-r-c)/(2*s),0<s&&1>s&&n.push(s)));for(r=q=n.length;q--;)s=n[q],c=1-s,p[0][q]=c*c*c*a+3*
c*c*s*d+3*c*s*s*h+s*s*s*l,p[1][q]=c*c*c*b+3*c*c*s*e+3*c*s*s*f+s*s*s*k;p[0][r]=a;p[1][r]=b;p[0][r+1]=l;p[1][r+1]=k;p[0].length=p[1].length=r+2;return{min:{x:X.apply(0,p[0]),y:X.apply(0,p[1])},max:{x:W.apply(0,p[0]),y:W.apply(0,p[1])}}}function I(a,b){var e=!b&&A(a);if(!b&&e.curve)return d(e.curve);var f=G(a),l=b&&G(b),n={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},k={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},p=function(a,b,c){if(!a)return["C",b.x,b.y,b.x,b.y,b.x,b.y];a[0]in{T:1,Q:1}||(b.qx=b.qy=null);
switch(a[0]){case "M":b.X=a[1];b.Y=a[2];break;case "A":a=["C"].concat(K.apply(0,[b.x,b.y].concat(a.slice(1))));break;case "S":"C"==c||"S"==c?(c=2*b.x-b.bx,b=2*b.y-b.by):(c=b.x,b=b.y);a=["C",c,b].concat(a.slice(1));break;case "T":"Q"==c||"T"==c?(b.qx=2*b.x-b.qx,b.qy=2*b.y-b.qy):(b.qx=b.x,b.qy=b.y);a=["C"].concat(J(b.x,b.y,b.qx,b.qy,a[1],a[2]));break;case "Q":b.qx=a[1];b.qy=a[2];a=["C"].concat(J(b.x,b.y,a[1],a[2],a[3],a[4]));break;case "L":a=["C"].concat(h(b.x,b.y,a[1],a[2]));break;case "H":a=["C"].concat(h(b.x,
b.y,a[1],b.y));break;case "V":a=["C"].concat(h(b.x,b.y,b.x,a[1]));break;case "Z":a=["C"].concat(h(b.x,b.y,b.X,b.Y))}return a},s=function(a,b){if(7<a[b].length){a[b].shift();for(var c=a[b];c.length;)q[b]="A",l&&(u[b]="A"),a.splice(b++,0,["C"].concat(c.splice(0,6)));a.splice(b,1);v=W(f.length,l&&l.length||0)}},r=function(a,b,c,d,e){a&&b&&"M"==a[e][0]&&"M"!=b[e][0]&&(b.splice(e,0,["M",d.x,d.y]),c.bx=0,c.by=0,c.x=a[e][1],c.y=a[e][2],v=W(f.length,l&&l.length||0))},q=[],u=[],c="",t="",x=0,v=W(f.length,
l&&l.length||0);for(;x<v;x++){f[x]&&(c=f[x][0]);"C"!=c&&(q[x]=c,x&&(t=q[x-1]));f[x]=p(f[x],n,t);"A"!=q[x]&&"C"==c&&(q[x]="C");s(f,x);l&&(l[x]&&(c=l[x][0]),"C"!=c&&(u[x]=c,x&&(t=u[x-1])),l[x]=p(l[x],k,t),"A"!=u[x]&&"C"==c&&(u[x]="C"),s(l,x));r(f,l,n,k,x);r(l,f,k,n,x);var w=f[x],z=l&&l[x],y=w.length,U=l&&z.length;n.x=w[y-2];n.y=w[y-1];n.bx=$(w[y-4])||n.x;n.by=$(w[y-3])||n.y;k.bx=l&&($(z[U-4])||k.x);k.by=l&&($(z[U-3])||k.y);k.x=l&&z[U-2];k.y=l&&z[U-1]}l||(e.curve=d(f));return l?[f,l]:f}function P(a,
b){for(var d=[],e=0,h=a.length;h-2*!b>e;e+=2){var f=[{x:+a[e-2],y:+a[e-1]},{x:+a[e],y:+a[e+1]},{x:+a[e+2],y:+a[e+3]},{x:+a[e+4],y:+a[e+5]}];b?e?h-4==e?f[3]={x:+a[0],y:+a[1]}:h-2==e&&(f[2]={x:+a[0],y:+a[1]},f[3]={x:+a[2],y:+a[3]}):f[0]={x:+a[h-2],y:+a[h-1]}:h-4==e?f[3]=f[2]:e||(f[0]={x:+a[e],y:+a[e+1]});d.push(["C",(-f[0].x+6*f[1].x+f[2].x)/6,(-f[0].y+6*f[1].y+f[2].y)/6,(f[1].x+6*f[2].x-f[3].x)/6,(f[1].y+6*f[2].y-f[3].y)/6,f[2].x,f[2].y])}return d}y=k.prototype;var Q=a.is,C=a._.clone,L="hasOwnProperty",
N=/,?([a-z]),?/gi,$=parseFloat,F=Math,S=F.PI,X=F.min,W=F.max,ma=F.pow,Z=F.abs;M=n(1);var na=n(),ba=n(0,1),V=a._unit2px;a.path=A;a.path.getTotalLength=M;a.path.getPointAtLength=na;a.path.getSubpath=function(a,b,d){if(1E-6>this.getTotalLength(a)-d)return ba(a,b).end;a=ba(a,d,1);return b?ba(a,b).end:a};y.getTotalLength=function(){if(this.node.getTotalLength)return this.node.getTotalLength()};y.getPointAtLength=function(a){return na(this.attr("d"),a)};y.getSubpath=function(b,d){return a.path.getSubpath(this.attr("d"),
b,d)};a._.box=w;a.path.findDotsAtSegment=u;a.path.bezierBBox=p;a.path.isPointInsideBBox=b;a.path.isBBoxIntersect=q;a.path.intersection=function(a,b){return l(a,b)};a.path.intersectionNumber=function(a,b){return l(a,b,1)};a.path.isPointInside=function(a,d,e){var h=r(a);return b(h,d,e)&&1==l(a,[["M",d,e],["H",h.x2+10] ],1)%2};a.path.getBBox=r;a.path.get={path:function(a){return a.attr("path")},circle:function(a){a=V(a);return x(a.cx,a.cy,a.r)},ellipse:function(a){a=V(a);return x(a.cx||0,a.cy||0,a.rx,
a.ry)},rect:function(a){a=V(a);return s(a.x||0,a.y||0,a.width,a.height,a.rx,a.ry)},image:function(a){a=V(a);return s(a.x||0,a.y||0,a.width,a.height)},line:function(a){return"M"+[a.attr("x1")||0,a.attr("y1")||0,a.attr("x2"),a.attr("y2")]},polyline:function(a){return"M"+a.attr("points")},polygon:function(a){return"M"+a.attr("points")+"z"},deflt:function(a){a=a.node.getBBox();return s(a.x,a.y,a.width,a.height)}};a.path.toRelative=function(b){var e=A(b),h=String.prototype.toLowerCase;if(e.rel)return d(e.rel);
a.is(b,"array")&&a.is(b&&b[0],"array")||(b=a.parsePathString(b));var f=[],l=0,n=0,k=0,p=0,s=0;"M"==b[0][0]&&(l=b[0][1],n=b[0][2],k=l,p=n,s++,f.push(["M",l,n]));for(var r=b.length;s<r;s++){var q=f[s]=[],x=b[s];if(x[0]!=h.call(x[0]))switch(q[0]=h.call(x[0]),q[0]){case "a":q[1]=x[1];q[2]=x[2];q[3]=x[3];q[4]=x[4];q[5]=x[5];q[6]=+(x[6]-l).toFixed(3);q[7]=+(x[7]-n).toFixed(3);break;case "v":q[1]=+(x[1]-n).toFixed(3);break;case "m":k=x[1],p=x[2];default:for(var c=1,t=x.length;c<t;c++)q[c]=+(x[c]-(c%2?l:
n)).toFixed(3)}else for(f[s]=[],"m"==x[0]&&(k=x[1]+l,p=x[2]+n),q=0,c=x.length;q<c;q++)f[s][q]=x[q];x=f[s].length;switch(f[s][0]){case "z":l=k;n=p;break;case "h":l+=+f[s][x-1];break;case "v":n+=+f[s][x-1];break;default:l+=+f[s][x-2],n+=+f[s][x-1]}}f.toString=z;e.rel=d(f);return f};a.path.toAbsolute=G;a.path.toCubic=I;a.path.map=function(a,b){if(!b)return a;var d,e,h,f,l,n,k;a=I(a);h=0;for(l=a.length;h<l;h++)for(k=a[h],f=1,n=k.length;f<n;f+=2)d=b.x(k[f],k[f+1]),e=b.y(k[f],k[f+1]),k[f]=d,k[f+1]=e;return a};
a.path.toString=z;a.path.clone=d});C.plugin(function(a,v,y,C){var A=Math.max,w=Math.min,z=function(a){this.items=[];this.bindings={};this.length=0;this.type="set";if(a)for(var f=0,n=a.length;f<n;f++)a[f]&&(this[this.items.length]=this.items[this.items.length]=a[f],this.length++)};v=z.prototype;v.push=function(){for(var a,f,n=0,k=arguments.length;n<k;n++)if(a=arguments[n])f=this.items.length,this[f]=this.items[f]=a,this.length++;return this};v.pop=function(){this.length&&delete this[this.length--];
return this.items.pop()};v.forEach=function(a,f){for(var n=0,k=this.items.length;n<k&&!1!==a.call(f,this.items[n],n);n++);return this};v.animate=function(d,f,n,u){"function"!=typeof n||n.length||(u=n,n=L.linear);d instanceof a._.Animation&&(u=d.callback,n=d.easing,f=n.dur,d=d.attr);var p=arguments;if(a.is(d,"array")&&a.is(p[p.length-1],"array"))var b=!0;var q,e=function(){q?this.b=q:q=this.b},l=0,r=u&&function(){l++==this.length&&u.call(this)};return this.forEach(function(a,l){k.once("snap.animcreated."+
a.id,e);b?p[l]&&a.animate.apply(a,p[l]):a.animate(d,f,n,r)})};v.remove=function(){for(;this.length;)this.pop().remove();return this};v.bind=function(a,f,k){var u={};if("function"==typeof f)this.bindings[a]=f;else{var p=k||a;this.bindings[a]=function(a){u[p]=a;f.attr(u)}}return this};v.attr=function(a){var f={},k;for(k in a)if(this.bindings[k])this.bindings[k](a[k]);else f[k]=a[k];a=0;for(k=this.items.length;a<k;a++)this.items[a].attr(f);return this};v.clear=function(){for(;this.length;)this.pop()};
v.splice=function(a,f,k){a=0>a?A(this.length+a,0):a;f=A(0,w(this.length-a,f));var u=[],p=[],b=[],q;for(q=2;q<arguments.length;q++)b.push(arguments[q]);for(q=0;q<f;q++)p.push(this[a+q]);for(;q<this.length-a;q++)u.push(this[a+q]);var e=b.length;for(q=0;q<e+u.length;q++)this.items[a+q]=this[a+q]=q<e?b[q]:u[q-e];for(q=this.items.length=this.length-=f-e;this[q];)delete this[q++];return new z(p)};v.exclude=function(a){for(var f=0,k=this.length;f<k;f++)if(this[f]==a)return this.splice(f,1),!0;return!1};
v.insertAfter=function(a){for(var f=this.items.length;f--;)this.items[f].insertAfter(a);return this};v.getBBox=function(){for(var a=[],f=[],k=[],u=[],p=this.items.length;p--;)if(!this.items[p].removed){var b=this.items[p].getBBox();a.push(b.x);f.push(b.y);k.push(b.x+b.width);u.push(b.y+b.height)}a=w.apply(0,a);f=w.apply(0,f);k=A.apply(0,k);u=A.apply(0,u);return{x:a,y:f,x2:k,y2:u,width:k-a,height:u-f,cx:a+(k-a)/2,cy:f+(u-f)/2}};v.clone=function(a){a=new z;for(var f=0,k=this.items.length;f<k;f++)a.push(this.items[f].clone());
return a};v.toString=function(){return"Snap\u2018s set"};v.type="set";a.set=function(){var a=new z;arguments.length&&a.push.apply(a,Array.prototype.slice.call(arguments,0));return a}});C.plugin(function(a,v,y,C){function A(a){var b=a[0];switch(b.toLowerCase()){case "t":return[b,0,0];case "m":return[b,1,0,0,1,0,0];case "r":return 4==a.length?[b,0,a[2],a[3] ]:[b,0];case "s":return 5==a.length?[b,1,1,a[3],a[4] ]:3==a.length?[b,1,1]:[b,1]}}function w(b,d,f){d=q(d).replace(/\.{3}|\u2026/g,b);b=a.parseTransformString(b)||
[];d=a.parseTransformString(d)||[];for(var k=Math.max(b.length,d.length),p=[],v=[],h=0,w,z,y,I;h<k;h++){y=b[h]||A(d[h]);I=d[h]||A(y);if(y[0]!=I[0]||"r"==y[0].toLowerCase()&&(y[2]!=I[2]||y[3]!=I[3])||"s"==y[0].toLowerCase()&&(y[3]!=I[3]||y[4]!=I[4])){b=a._.transform2matrix(b,f());d=a._.transform2matrix(d,f());p=[["m",b.a,b.b,b.c,b.d,b.e,b.f] ];v=[["m",d.a,d.b,d.c,d.d,d.e,d.f] ];break}p[h]=[];v[h]=[];w=0;for(z=Math.max(y.length,I.length);w<z;w++)w in y&&(p[h][w]=y[w]),w in I&&(v[h][w]=I[w])}return{from:u(p),
to:u(v),f:n(p)}}function z(a){return a}function d(a){return function(b){return+b.toFixed(3)+a}}function f(b){return a.rgb(b[0],b[1],b[2])}function n(a){var b=0,d,f,k,n,h,p,q=[];d=0;for(f=a.length;d<f;d++){h="[";p=['"'+a[d][0]+'"'];k=1;for(n=a[d].length;k<n;k++)p[k]="val["+b++ +"]";h+=p+"]";q[d]=h}return Function("val","return Snap.path.toString.call(["+q+"])")}function u(a){for(var b=[],d=0,f=a.length;d<f;d++)for(var k=1,n=a[d].length;k<n;k++)b.push(a[d][k]);return b}var p={},b=/[a-z]+$/i,q=String;
p.stroke=p.fill="colour";v.prototype.equal=function(a,b){return k("snap.util.equal",this,a,b).firstDefined()};k.on("snap.util.equal",function(e,k){var r,s;r=q(this.attr(e)||"");var x=this;if(r==+r&&k==+k)return{from:+r,to:+k,f:z};if("colour"==p[e])return r=a.color(r),s=a.color(k),{from:[r.r,r.g,r.b,r.opacity],to:[s.r,s.g,s.b,s.opacity],f:f};if("transform"==e||"gradientTransform"==e||"patternTransform"==e)return k instanceof a.Matrix&&(k=k.toTransformString()),a._.rgTransform.test(k)||(k=a._.svgTransform2string(k)),
w(r,k,function(){return x.getBBox(1)});if("d"==e||"path"==e)return r=a.path.toCubic(r,k),{from:u(r[0]),to:u(r[1]),f:n(r[0])};if("points"==e)return r=q(r).split(a._.separator),s=q(k).split(a._.separator),{from:r,to:s,f:function(a){return a}};aUnit=r.match(b);s=q(k).match(b);return aUnit&&aUnit==s?{from:parseFloat(r),to:parseFloat(k),f:d(aUnit)}:{from:this.asPX(e),to:this.asPX(e,k),f:z}})});C.plugin(function(a,v,y,C){var A=v.prototype,w="createTouch"in C.doc;v="click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend touchcancel".split(" ");
var z={mousedown:"touchstart",mousemove:"touchmove",mouseup:"touchend"},d=function(a,b){var d="y"==a?"scrollTop":"scrollLeft",e=b&&b.node?b.node.ownerDocument:C.doc;return e[d in e.documentElement?"documentElement":"body"][d]},f=function(){this.returnValue=!1},n=function(){return this.originalEvent.preventDefault()},u=function(){this.cancelBubble=!0},p=function(){return this.originalEvent.stopPropagation()},b=function(){if(C.doc.addEventListener)return function(a,b,e,f){var k=w&&z[b]?z[b]:b,l=function(k){var l=
d("y",f),q=d("x",f);if(w&&z.hasOwnProperty(b))for(var r=0,u=k.targetTouches&&k.targetTouches.length;r<u;r++)if(k.targetTouches[r].target==a||a.contains(k.targetTouches[r].target)){u=k;k=k.targetTouches[r];k.originalEvent=u;k.preventDefault=n;k.stopPropagation=p;break}return e.call(f,k,k.clientX+q,k.clientY+l)};b!==k&&a.addEventListener(b,l,!1);a.addEventListener(k,l,!1);return function(){b!==k&&a.removeEventListener(b,l,!1);a.removeEventListener(k,l,!1);return!0}};if(C.doc.attachEvent)return function(a,
b,e,h){var k=function(a){a=a||h.node.ownerDocument.window.event;var b=d("y",h),k=d("x",h),k=a.clientX+k,b=a.clientY+b;a.preventDefault=a.preventDefault||f;a.stopPropagation=a.stopPropagation||u;return e.call(h,a,k,b)};a.attachEvent("on"+b,k);return function(){a.detachEvent("on"+b,k);return!0}}}(),q=[],e=function(a){for(var b=a.clientX,e=a.clientY,f=d("y"),l=d("x"),n,p=q.length;p--;){n=q[p];if(w)for(var r=a.touches&&a.touches.length,u;r--;){if(u=a.touches[r],u.identifier==n.el._drag.id||n.el.node.contains(u.target)){b=
u.clientX;e=u.clientY;(a.originalEvent?a.originalEvent:a).preventDefault();break}}else a.preventDefault();b+=l;e+=f;k("snap.drag.move."+n.el.id,n.move_scope||n.el,b-n.el._drag.x,e-n.el._drag.y,b,e,a)}},l=function(b){a.unmousemove(e).unmouseup(l);for(var d=q.length,f;d--;)f=q[d],f.el._drag={},k("snap.drag.end."+f.el.id,f.end_scope||f.start_scope||f.move_scope||f.el,b);q=[]};for(y=v.length;y--;)(function(d){a[d]=A[d]=function(e,f){a.is(e,"function")&&(this.events=this.events||[],this.events.push({name:d,
f:e,unbind:b(this.node||document,d,e,f||this)}));return this};a["un"+d]=A["un"+d]=function(a){for(var b=this.events||[],e=b.length;e--;)if(b[e].name==d&&(b[e].f==a||!a)){b[e].unbind();b.splice(e,1);!b.length&&delete this.events;break}return this}})(v[y]);A.hover=function(a,b,d,e){return this.mouseover(a,d).mouseout(b,e||d)};A.unhover=function(a,b){return this.unmouseover(a).unmouseout(b)};var r=[];A.drag=function(b,d,f,h,n,p){function u(r,v,w){(r.originalEvent||r).preventDefault();this._drag.x=v;
this._drag.y=w;this._drag.id=r.identifier;!q.length&&a.mousemove(e).mouseup(l);q.push({el:this,move_scope:h,start_scope:n,end_scope:p});d&&k.on("snap.drag.start."+this.id,d);b&&k.on("snap.drag.move."+this.id,b);f&&k.on("snap.drag.end."+this.id,f);k("snap.drag.start."+this.id,n||h||this,v,w,r)}if(!arguments.length){var v;return this.drag(function(a,b){this.attr({transform:v+(v?"T":"t")+[a,b]})},function(){v=this.transform().local})}this._drag={};r.push({el:this,start:u});this.mousedown(u);return this};
A.undrag=function(){for(var b=r.length;b--;)r[b].el==this&&(this.unmousedown(r[b].start),r.splice(b,1),k.unbind("snap.drag.*."+this.id));!r.length&&a.unmousemove(e).unmouseup(l);return this}});C.plugin(function(a,v,y,C){y=y.prototype;var A=/^\s*url\((.+)\)/,w=String,z=a._.$;a.filter={};y.filter=function(d){var f=this;"svg"!=f.type&&(f=f.paper);d=a.parse(w(d));var k=a._.id(),u=z("filter");z(u,{id:k,filterUnits:"userSpaceOnUse"});u.appendChild(d.node);f.defs.appendChild(u);return new v(u)};k.on("snap.util.getattr.filter",
function(){k.stop();var d=z(this.node,"filter");if(d)return(d=w(d).match(A))&&a.select(d[1])});k.on("snap.util.attr.filter",function(d){if(d instanceof v&&"filter"==d.type){k.stop();var f=d.node.id;f||(z(d.node,{id:d.id}),f=d.id);z(this.node,{filter:a.url(f)})}d&&"none"!=d||(k.stop(),this.node.removeAttribute("filter"))});a.filter.blur=function(d,f){null==d&&(d=2);return a.format('<feGaussianBlur stdDeviation="{def}"/>',{def:null==f?d:[d,f]})};a.filter.blur.toString=function(){return this()};a.filter.shadow=
function(d,f,k,u,p){"string"==typeof k&&(p=u=k,k=4);"string"!=typeof u&&(p=u,u="#000");null==k&&(k=4);null==p&&(p=1);null==d&&(d=0,f=2);null==f&&(f=d);u=a.color(u||"#000");return a.format('<feGaussianBlur in="SourceAlpha" stdDeviation="{blur}"/><feOffset dx="{dx}" dy="{dy}" result="offsetblur"/><feFlood flood-color="{color}"/><feComposite in2="offsetblur" operator="in"/><feComponentTransfer><feFuncA type="linear" slope="{opacity}"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>',
{color:u,dx:d,dy:f,blur:k,opacity:p})};a.filter.shadow.toString=function(){return this()};a.filter.grayscale=function(d){null==d&&(d=1);return a.format('<feColorMatrix type="matrix" values="{a} {b} {c} 0 0 {d} {e} {f} 0 0 {g} {b} {h} 0 0 0 0 0 1 0"/>',{a:0.2126+0.7874*(1-d),b:0.7152-0.7152*(1-d),c:0.0722-0.0722*(1-d),d:0.2126-0.2126*(1-d),e:0.7152+0.2848*(1-d),f:0.0722-0.0722*(1-d),g:0.2126-0.2126*(1-d),h:0.0722+0.9278*(1-d)})};a.filter.grayscale.toString=function(){return this()};a.filter.sepia=
function(d){null==d&&(d=1);return a.format('<feColorMatrix type="matrix" values="{a} {b} {c} 0 0 {d} {e} {f} 0 0 {g} {h} {i} 0 0 0 0 0 1 0"/>',{a:0.393+0.607*(1-d),b:0.769-0.769*(1-d),c:0.189-0.189*(1-d),d:0.349-0.349*(1-d),e:0.686+0.314*(1-d),f:0.168-0.168*(1-d),g:0.272-0.272*(1-d),h:0.534-0.534*(1-d),i:0.131+0.869*(1-d)})};a.filter.sepia.toString=function(){return this()};a.filter.saturate=function(d){null==d&&(d=1);return a.format('<feColorMatrix type="saturate" values="{amount}"/>',{amount:1-
d})};a.filter.saturate.toString=function(){return this()};a.filter.hueRotate=function(d){return a.format('<feColorMatrix type="hueRotate" values="{angle}"/>',{angle:d||0})};a.filter.hueRotate.toString=function(){return this()};a.filter.invert=function(d){null==d&&(d=1);return a.format('<feComponentTransfer><feFuncR type="table" tableValues="{amount} {amount2}"/><feFuncG type="table" tableValues="{amount} {amount2}"/><feFuncB type="table" tableValues="{amount} {amount2}"/></feComponentTransfer>',{amount:d,
amount2:1-d})};a.filter.invert.toString=function(){return this()};a.filter.brightness=function(d){null==d&&(d=1);return a.format('<feComponentTransfer><feFuncR type="linear" slope="{amount}"/><feFuncG type="linear" slope="{amount}"/><feFuncB type="linear" slope="{amount}"/></feComponentTransfer>',{amount:d})};a.filter.brightness.toString=function(){return this()};a.filter.contrast=function(d){null==d&&(d=1);return a.format('<feComponentTransfer><feFuncR type="linear" slope="{amount}" intercept="{amount2}"/><feFuncG type="linear" slope="{amount}" intercept="{amount2}"/><feFuncB type="linear" slope="{amount}" intercept="{amount2}"/></feComponentTransfer>',
{amount:d,amount2:0.5-d/2})};a.filter.contrast.toString=function(){return this()}});return C});

]]> </script>
<script> <![CDATA[

(function (glob, factory) {
    // AMD support
    if (typeof define === "function" && define.amd) {
        // Define as an anonymous module
        define("Gadfly", ["Snap.svg"], function (Snap) {
            return factory(Snap);
        });
    } else {
        // Browser globals (glob is window)
        // Snap adds itself to window
        glob.Gadfly = factory(glob.Snap);
    }
}(this, function (Snap) {

var Gadfly = {};

// Get an x/y coordinate value in pixels
var xPX = function(fig, x) {
    var client_box = fig.node.getBoundingClientRect();
    return x * fig.node.viewBox.baseVal.width / client_box.width;
};

var yPX = function(fig, y) {
    var client_box = fig.node.getBoundingClientRect();
    return y * fig.node.viewBox.baseVal.height / client_box.height;
};


Snap.plugin(function (Snap, Element, Paper, global) {
    // Traverse upwards from a snap element to find and return the first
    // note with the "plotroot" class.
    Element.prototype.plotroot = function () {
        var element = this;
        while (!element.hasClass("plotroot") && element.parent() != null) {
            element = element.parent();
        }
        return element;
    };

    Element.prototype.svgroot = function () {
        var element = this;
        while (element.node.nodeName != "svg" && element.parent() != null) {
            element = element.parent();
        }
        return element;
    };

    Element.prototype.plotbounds = function () {
        var root = this.plotroot()
        var bbox = root.select(".guide.background").node.getBBox();
        return {
            x0: bbox.x,
            x1: bbox.x + bbox.width,
            y0: bbox.y,
            y1: bbox.y + bbox.height
        };
    };

    Element.prototype.plotcenter = function () {
        var root = this.plotroot()
        var bbox = root.select(".guide.background").node.getBBox();
        return {
            x: bbox.x + bbox.width / 2,
            y: bbox.y + bbox.height / 2
        };
    };

    // Emulate IE style mouseenter/mouseleave events, since Microsoft always
    // does everything right.
    // See: http://www.dynamic-tools.net/toolbox/isMouseLeaveOrEnter/
    var events = ["mouseenter", "mouseleave"];

    for (i in events) {
        (function (event_name) {
            var event_name = events[i];
            Element.prototype[event_name] = function (fn, scope) {
                if (Snap.is(fn, "function")) {
                    var fn2 = function (event) {
                        if (event.type != "mouseover" && event.type != "mouseout") {
                            return;
                        }

                        var reltg = event.relatedTarget ? event.relatedTarget :
                            event.type == "mouseout" ? event.toElement : event.fromElement;
                        while (reltg && reltg != this.node) reltg = reltg.parentNode;

                        if (reltg != this.node) {
                            return fn.apply(this, event);
                        }
                    };

                    if (event_name == "mouseenter") {
                        this.mouseover(fn2, scope);
                    } else {
                        this.mouseout(fn2, scope);
                    }
                }
                return this;
            };
        })(events[i]);
    }


    Element.prototype.mousewheel = function (fn, scope) {
        if (Snap.is(fn, "function")) {
            var el = this;
            var fn2 = function (event) {
                fn.apply(el, [event]);
            };
        }

        this.node.addEventListener(
            /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel",
            fn2);

        return this;
    };


    // Snap's attr function can be too slow for things like panning/zooming.
    // This is a function to directly update element attributes without going
    // through eve.
    Element.prototype.attribute = function(key, val) {
        if (val === undefined) {
            return this.node.getAttribute(key);
        } else {
            this.node.setAttribute(key, val);
            return this;
        }
    };

    Element.prototype.init_gadfly = function() {
        this.mouseenter(Gadfly.plot_mouseover)
            .mouseleave(Gadfly.plot_mouseout)
            .dblclick(Gadfly.plot_dblclick)
            .mousewheel(Gadfly.guide_background_scroll)
            .drag(Gadfly.guide_background_drag_onmove,
                  Gadfly.guide_background_drag_onstart,
                  Gadfly.guide_background_drag_onend);
        this.mouseenter(function (event) {
            init_pan_zoom(this.plotroot());
        });
        return this;
    };
});


// When the plot is moused over, emphasize the grid lines.
Gadfly.plot_mouseover = function(event) {
    var root = this.plotroot();

    var keyboard_zoom = function(event) {
        if (event.which == 187) { // plus
            increase_zoom_by_position(root, 0.1, true);
        } else if (event.which == 189) { // minus
            increase_zoom_by_position(root, -0.1, true);
        }
    };
    root.data("keyboard_zoom", keyboard_zoom);
    window.addEventListener("keyup", keyboard_zoom);

    var xgridlines = root.select(".xgridlines"),
        ygridlines = root.select(".ygridlines");

    xgridlines.data("unfocused_strokedash",
                    xgridlines.attribute("stroke-dasharray").replace(/(\d)(,|$)/g, "$1mm$2"));
    ygridlines.data("unfocused_strokedash",
                    ygridlines.attribute("stroke-dasharray").replace(/(\d)(,|$)/g, "$1mm$2"));

    // emphasize grid lines
    var destcolor = root.data("focused_xgrid_color");
    xgridlines.attribute("stroke-dasharray", "none")
              .selectAll("path")
              .animate({stroke: destcolor}, 250);

    destcolor = root.data("focused_ygrid_color");
    ygridlines.attribute("stroke-dasharray", "none")
              .selectAll("path")
              .animate({stroke: destcolor}, 250);

    // reveal zoom slider
    root.select(".zoomslider")
        .animate({opacity: 1.0}, 250);
};

// Reset pan and zoom on double click
Gadfly.plot_dblclick = function(event) {
  set_plot_pan_zoom(this.plotroot(), 0.0, 0.0, 1.0);
};

// Unemphasize grid lines on mouse out.
Gadfly.plot_mouseout = function(event) {
    var root = this.plotroot();

    window.removeEventListener("keyup", root.data("keyboard_zoom"));
    root.data("keyboard_zoom", undefined);

    var xgridlines = root.select(".xgridlines"),
        ygridlines = root.select(".ygridlines");

    var destcolor = root.data("unfocused_xgrid_color");

    xgridlines.attribute("stroke-dasharray", xgridlines.data("unfocused_strokedash"))
              .selectAll("path")
              .animate({stroke: destcolor}, 250);

    destcolor = root.data("unfocused_ygrid_color");
    ygridlines.attribute("stroke-dasharray", ygridlines.data("unfocused_strokedash"))
              .selectAll("path")
              .animate({stroke: destcolor}, 250);

    // hide zoom slider
    root.select(".zoomslider")
        .animate({opacity: 0.0}, 250);
};


var set_geometry_transform = function(root, tx, ty, scale) {
    var xscalable = root.hasClass("xscalable"),
        yscalable = root.hasClass("yscalable");

    var old_scale = root.data("scale");

    var xscale = xscalable ? scale : 1.0,
        yscale = yscalable ? scale : 1.0;

    tx = xscalable ? tx : 0.0;
    ty = yscalable ? ty : 0.0;

    var t = new Snap.Matrix().translate(tx, ty).scale(xscale, yscale);

    root.selectAll(".geometry, image")
        .forEach(function (element, i) {
            element.transform(t);
        });

    bounds = root.plotbounds();

    if (yscalable) {
        var xfixed_t = new Snap.Matrix().translate(0, ty).scale(1.0, yscale);
        root.selectAll(".xfixed")
            .forEach(function (element, i) {
                element.transform(xfixed_t);
            });

        root.select(".ylabels")
            .transform(xfixed_t)
            .selectAll("text")
            .forEach(function (element, i) {
                if (element.attribute("gadfly:inscale") == "true") {
                    var cx = element.asPX("x"),
                        cy = element.asPX("y");
                    var st = element.data("static_transform");
                    unscale_t = new Snap.Matrix();
                    unscale_t.scale(1, 1/scale, cx, cy).add(st);
                    element.transform(unscale_t);

                    var y = cy * scale + ty;
                    element.attr("visibility",
                        bounds.y0 <= y && y <= bounds.y1 ? "visible" : "hidden");
                }
            });
    }

    if (xscalable) {
        var yfixed_t = new Snap.Matrix().translate(tx, 0).scale(xscale, 1.0);
        var xtrans = new Snap.Matrix().translate(tx, 0);
        root.selectAll(".yfixed")
            .forEach(function (element, i) {
                element.transform(yfixed_t);
            });

        root.select(".xlabels")
            .transform(yfixed_t)
            .selectAll("text")
            .forEach(function (element, i) {
                if (element.attribute("gadfly:inscale") == "true") {
                    var cx = element.asPX("x"),
                        cy = element.asPX("y");
                    var st = element.data("static_transform");
                    unscale_t = new Snap.Matrix();
                    unscale_t.scale(1/scale, 1, cx, cy).add(st);

                    element.transform(unscale_t);

                    var x = cx * scale + tx;
                    element.attr("visibility",
                        bounds.x0 <= x && x <= bounds.x1 ? "visible" : "hidden");
                    }
            });
    }

    // we must unscale anything that is scale invariance: widths, raiduses, etc.
    var size_attribs = ["font-size"];
    var unscaled_selection = ".geometry, .geometry *";
    if (xscalable) {
        size_attribs.push("rx");
        unscaled_selection += ", .xgridlines";
    }
    if (yscalable) {
        size_attribs.push("ry");
        unscaled_selection += ", .ygridlines";
    }

    root.selectAll(unscaled_selection)
        .forEach(function (element, i) {
            // circle need special help
            if (element.node.nodeName == "circle") {
                var cx = element.attribute("cx"),
                    cy = element.attribute("cy");
                unscale_t = new Snap.Matrix().scale(1/xscale, 1/yscale,
                                                        cx, cy);
                element.transform(unscale_t);
                return;
            }

            for (i in size_attribs) {
                var key = size_attribs[i];
                var val = parseFloat(element.attribute(key));
                if (val !== undefined && val != 0 && !isNaN(val)) {
                    element.attribute(key, val * old_scale / scale);
                }
            }
        });
};


// Find the most appropriate tick scale and update label visibility.
var update_tickscale = function(root, scale, axis) {
    if (!root.hasClass(axis + "scalable")) return;

    var tickscales = root.data(axis + "tickscales");
    var best_tickscale = 1.0;
    var best_tickscale_dist = Infinity;
    for (tickscale in tickscales) {
        var dist = Math.abs(Math.log(tickscale) - Math.log(scale));
        if (dist < best_tickscale_dist) {
            best_tickscale_dist = dist;
            best_tickscale = tickscale;
        }
    }

    if (best_tickscale != root.data(axis + "tickscale")) {
        root.data(axis + "tickscale", best_tickscale);
        var mark_inscale_gridlines = function (element, i) {
            var inscale = element.attr("gadfly:scale") == best_tickscale;
            element.attribute("gadfly:inscale", inscale);
            element.attr("visibility", inscale ? "visible" : "hidden");
        };

        var mark_inscale_labels = function (element, i) {
            var inscale = element.attr("gadfly:scale") == best_tickscale;
            element.attribute("gadfly:inscale", inscale);
            element.attr("visibility", inscale ? "visible" : "hidden");
        };

        root.select("." + axis + "gridlines").selectAll("path").forEach(mark_inscale_gridlines);
        root.select("." + axis + "labels").selectAll("text").forEach(mark_inscale_labels);
    }
};


var set_plot_pan_zoom = function(root, tx, ty, scale) {
    var old_scale = root.data("scale");
    var bounds = root.plotbounds();

    var width = bounds.x1 - bounds.x0,
        height = bounds.y1 - bounds.y0;

    // compute the viewport derived from tx, ty, and scale
    var x_min = -width * scale - (scale * width - width),
        x_max = width * scale,
        y_min = -height * scale - (scale * height - height),
        y_max = height * scale;

    var x0 = bounds.x0 - scale * bounds.x0,
        y0 = bounds.y0 - scale * bounds.y0;

    var tx = Math.max(Math.min(tx - x0, x_max), x_min),
        ty = Math.max(Math.min(ty - y0, y_max), y_min);

    tx += x0;
    ty += y0;

    // when the scale change, we may need to alter which set of
    // ticks is being displayed
    if (scale != old_scale) {
        update_tickscale(root, scale, "x");
        update_tickscale(root, scale, "y");
    }

    set_geometry_transform(root, tx, ty, scale);

    root.data("scale", scale);
    root.data("tx", tx);
    root.data("ty", ty);
};


var scale_centered_translation = function(root, scale) {
    var bounds = root.plotbounds();

    var width = bounds.x1 - bounds.x0,
        height = bounds.y1 - bounds.y0;

    var tx0 = root.data("tx"),
        ty0 = root.data("ty");

    var scale0 = root.data("scale");

    // how off from center the current view is
    var xoff = tx0 - (bounds.x0 * (1 - scale0) + (width * (1 - scale0)) / 2),
        yoff = ty0 - (bounds.y0 * (1 - scale0) + (height * (1 - scale0)) / 2);

    // rescale offsets
    xoff = xoff * scale / scale0;
    yoff = yoff * scale / scale0;

    // adjust for the panel position being scaled
    var x_edge_adjust = bounds.x0 * (1 - scale),
        y_edge_adjust = bounds.y0 * (1 - scale);

    return {
        x: xoff + x_edge_adjust + (width - width * scale) / 2,
        y: yoff + y_edge_adjust + (height - height * scale) / 2
    };
};


// Initialize data for panning zooming if it isn't already.
var init_pan_zoom = function(root) {
    if (root.data("zoompan-ready")) {
        return;
    }

    // The non-scaling-stroke trick. Rather than try to correct for the
    // stroke-width when zooming, we force it to a fixed value.
    var px_per_mm = root.node.getCTM().a;

    // Drag events report deltas in pixels, which we'd like to convert to
    // millimeters.
    root.data("px_per_mm", px_per_mm);

    root.selectAll("path")
        .forEach(function (element, i) {
        sw = element.asPX("stroke-width") * px_per_mm;
        if (sw > 0) {
            element.attribute("stroke-width", sw);
            element.attribute("vector-effect", "non-scaling-stroke");
        }
    });

    // Store ticks labels original tranformation
    root.selectAll(".xlabels > text, .ylabels > text")
        .forEach(function (element, i) {
            var lm = element.transform().localMatrix;
            element.data("static_transform",
                new Snap.Matrix(lm.a, lm.b, lm.c, lm.d, lm.e, lm.f));
        });

    var xgridlines = root.select(".xgridlines");
    var ygridlines = root.select(".ygridlines");
    var xlabels = root.select(".xlabels");
    var ylabels = root.select(".ylabels");

    if (root.data("tx") === undefined) root.data("tx", 0);
    if (root.data("ty") === undefined) root.data("ty", 0);
    if (root.data("scale") === undefined) root.data("scale", 1.0);
    if (root.data("xtickscales") === undefined) {

        // index all the tick scales that are listed
        var xtickscales = {};
        var ytickscales = {};
        var add_x_tick_scales = function (element, i) {
            xtickscales[element.attribute("gadfly:scale")] = true;
        };
        var add_y_tick_scales = function (element, i) {
            ytickscales[element.attribute("gadfly:scale")] = true;
        };

        if (xgridlines) xgridlines.selectAll("path").forEach(add_x_tick_scales);
        if (ygridlines) ygridlines.selectAll("path").forEach(add_y_tick_scales);
        if (xlabels) xlabels.selectAll("text").forEach(add_x_tick_scales);
        if (ylabels) ylabels.selectAll("text").forEach(add_y_tick_scales);

        root.data("xtickscales", xtickscales);
        root.data("ytickscales", ytickscales);
        root.data("xtickscale", 1.0);
    }

    var min_scale = 1.0, max_scale = 1.0;
    for (scale in xtickscales) {
        min_scale = Math.min(min_scale, scale);
        max_scale = Math.max(max_scale, scale);
    }
    for (scale in ytickscales) {
        min_scale = Math.min(min_scale, scale);
        max_scale = Math.max(max_scale, scale);
    }
    root.data("min_scale", min_scale);
    root.data("max_scale", max_scale);

    // store the original positions of labels
    if (xlabels) {
        xlabels.selectAll("text")
               .forEach(function (element, i) {
                   element.data("x", element.asPX("x"));
               });
    }

    if (ylabels) {
        ylabels.selectAll("text")
               .forEach(function (element, i) {
                   element.data("y", element.asPX("y"));
               });
    }

    // mark grid lines and ticks as in or out of scale.
    var mark_inscale = function (element, i) {
        element.attribute("gadfly:inscale", element.attribute("gadfly:scale") == 1.0);
    };

    if (xgridlines) xgridlines.selectAll("path").forEach(mark_inscale);
    if (ygridlines) ygridlines.selectAll("path").forEach(mark_inscale);
    if (xlabels) xlabels.selectAll("text").forEach(mark_inscale);
    if (ylabels) ylabels.selectAll("text").forEach(mark_inscale);

    // figure out the upper ond lower bounds on panning using the maximum
    // and minum grid lines
    var bounds = root.plotbounds();
    var pan_bounds = {
        x0: 0.0,
        y0: 0.0,
        x1: 0.0,
        y1: 0.0
    };

    if (xgridlines) {
        xgridlines
            .selectAll("path")
            .forEach(function (element, i) {
                if (element.attribute("gadfly:inscale") == "true") {
                    var bbox = element.node.getBBox();
                    if (bounds.x1 - bbox.x < pan_bounds.x0) {
                        pan_bounds.x0 = bounds.x1 - bbox.x;
                    }
                    if (bounds.x0 - bbox.x > pan_bounds.x1) {
                        pan_bounds.x1 = bounds.x0 - bbox.x;
                    }
                    element.attr("visibility", "visible");
                }
            });
    }

    if (ygridlines) {
        ygridlines
            .selectAll("path")
            .forEach(function (element, i) {
                if (element.attribute("gadfly:inscale") == "true") {
                    var bbox = element.node.getBBox();
                    if (bounds.y1 - bbox.y < pan_bounds.y0) {
                        pan_bounds.y0 = bounds.y1 - bbox.y;
                    }
                    if (bounds.y0 - bbox.y > pan_bounds.y1) {
                        pan_bounds.y1 = bounds.y0 - bbox.y;
                    }
                    element.attr("visibility", "visible");
                }
            });
    }

    // nudge these values a little
    pan_bounds.x0 -= 5;
    pan_bounds.x1 += 5;
    pan_bounds.y0 -= 5;
    pan_bounds.y1 += 5;
    root.data("pan_bounds", pan_bounds);

    root.data("zoompan-ready", true)
};


// drag actions, i.e. zooming and panning
var pan_action = {
    start: function(root, x, y, event) {
        root.data("dx", 0);
        root.data("dy", 0);
        root.data("tx0", root.data("tx"));
        root.data("ty0", root.data("ty"));
    },
    update: function(root, dx, dy, x, y, event) {
        var px_per_mm = root.data("px_per_mm");
        dx /= px_per_mm;
        dy /= px_per_mm;

        var tx0 = root.data("tx"),
            ty0 = root.data("ty");

        var dx0 = root.data("dx"),
            dy0 = root.data("dy");

        root.data("dx", dx);
        root.data("dy", dy);

        dx = dx - dx0;
        dy = dy - dy0;

        var tx = tx0 + dx,
            ty = ty0 + dy;

        set_plot_pan_zoom(root, tx, ty, root.data("scale"));
    },
    end: function(root, event) {

    },
    cancel: function(root) {
        set_plot_pan_zoom(root, root.data("tx0"), root.data("ty0"), root.data("scale"));
    }
};

var zoom_box;
var zoom_action = {
    start: function(root, x, y, event) {
        var bounds = root.plotbounds();
        var width = bounds.x1 - bounds.x0,
            height = bounds.y1 - bounds.y0;
        var ratio = width / height;
        var xscalable = root.hasClass("xscalable"),
            yscalable = root.hasClass("yscalable");
        var px_per_mm = root.data("px_per_mm");
        x = xscalable ? x / px_per_mm : bounds.x0;
        y = yscalable ? y / px_per_mm : bounds.y0;
        var w = xscalable ? 0 : width;
        var h = yscalable ? 0 : height;
        zoom_box = root.rect(x, y, w, h).attr({
            "fill": "#000",
            "opacity": 0.25
        });
        zoom_box.data("ratio", ratio);
    },
    update: function(root, dx, dy, x, y, event) {
        var xscalable = root.hasClass("xscalable"),
            yscalable = root.hasClass("yscalable");
        var px_per_mm = root.data("px_per_mm");
        var bounds = root.plotbounds();
        if (yscalable) {
            y /= px_per_mm;
            y = Math.max(bounds.y0, y);
            y = Math.min(bounds.y1, y);
        } else {
            y = bounds.y1;
        }
        if (xscalable) {
            x /= px_per_mm;
            x = Math.max(bounds.x0, x);
            x = Math.min(bounds.x1, x);
        } else {
            x = bounds.x1;
        }

        dx = x - zoom_box.attr("x");
        dy = y - zoom_box.attr("y");
        if (xscalable && yscalable) {
            var ratio = zoom_box.data("ratio");
            var width = Math.min(Math.abs(dx), ratio * Math.abs(dy));
            var height = Math.min(Math.abs(dy), Math.abs(dx) / ratio);
            dx = width * dx / Math.abs(dx);
            dy = height * dy / Math.abs(dy);
        }
        var xoffset = 0,
            yoffset = 0;
        if (dx < 0) {
            xoffset = dx;
            dx = -1 * dx;
        }
        if (dy < 0) {
            yoffset = dy;
            dy = -1 * dy;
        }
        if (isNaN(dy)) {
            dy = 0.0;
        }
        if (isNaN(dx)) {
            dx = 0.0;
        }
        zoom_box.transform("T" + xoffset + "," + yoffset);
        zoom_box.attr("width", dx);
        zoom_box.attr("height", dy);
    },
    end: function(root, event) {
        var xscalable = root.hasClass("xscalable"),
            yscalable = root.hasClass("yscalable");
        var zoom_bounds = zoom_box.getBBox();
        if (zoom_bounds.width * zoom_bounds.height <= 0) {
            return;
        }
        var plot_bounds = root.plotbounds();
        var zoom_factor = 1.0;
        if (yscalable) {
            zoom_factor = (plot_bounds.y1 - plot_bounds.y0) / zoom_bounds.height;
        } else {
            zoom_factor = (plot_bounds.x1 - plot_bounds.x0) / zoom_bounds.width;
        }
        var tx = (root.data("tx") - zoom_bounds.x) * zoom_factor + plot_bounds.x0,
            ty = (root.data("ty") - zoom_bounds.y) * zoom_factor + plot_bounds.y0;
        set_plot_pan_zoom(root, tx, ty, root.data("scale") * zoom_factor);
        zoom_box.remove();
    },
    cancel: function(root) {
        zoom_box.remove();
    }
};


Gadfly.guide_background_drag_onstart = function(x, y, event) {
    var root = this.plotroot();
    var scalable = root.hasClass("xscalable") || root.hasClass("yscalable");
    var zoomable = !event.altKey && !event.ctrlKey && event.shiftKey && scalable;
    var panable = !event.altKey && !event.ctrlKey && !event.shiftKey && scalable;
    var drag_action = zoomable ? zoom_action :
                      panable  ? pan_action :
                                 undefined;
    root.data("drag_action", drag_action);
    if (drag_action) {
        var cancel_drag_action = function(event) {
            if (event.which == 27) { // esc key
                drag_action.cancel(root);
                root.data("drag_action", undefined);
            }
        };
        window.addEventListener("keyup", cancel_drag_action);
        root.data("cancel_drag_action", cancel_drag_action);
        drag_action.start(root, x, y, event);
    }
};


Gadfly.guide_background_drag_onmove = function(dx, dy, x, y, event) {
    var root = this.plotroot();
    var drag_action = root.data("drag_action");
    if (drag_action) {
        drag_action.update(root, dx, dy, x, y, event);
    }
};


Gadfly.guide_background_drag_onend = function(event) {
    var root = this.plotroot();
    window.removeEventListener("keyup", root.data("cancel_drag_action"));
    root.data("cancel_drag_action", undefined);
    var drag_action = root.data("drag_action");
    if (drag_action) {
        drag_action.end(root, event);
    }
    root.data("drag_action", undefined);
};


Gadfly.guide_background_scroll = function(event) {
    if (event.shiftKey) {
        increase_zoom_by_position(this.plotroot(), 0.001 * event.wheelDelta);
        event.preventDefault();
    }
};


Gadfly.zoomslider_button_mouseover = function(event) {
    this.select(".button_logo")
         .animate({fill: this.data("mouseover_color")}, 100);
};


Gadfly.zoomslider_button_mouseout = function(event) {
     this.select(".button_logo")
         .animate({fill: this.data("mouseout_color")}, 100);
};


Gadfly.zoomslider_zoomout_click = function(event) {
    increase_zoom_by_position(this.plotroot(), -0.1, true);
};


Gadfly.zoomslider_zoomin_click = function(event) {
    increase_zoom_by_position(this.plotroot(), 0.1, true);
};


Gadfly.zoomslider_track_click = function(event) {
    // TODO
};


// Map slider position x to scale y using the function y = a*exp(b*x)+c.
// The constants a, b, and c are solved using the constraint that the function
// should go through the points (0; min_scale), (0.5; 1), and (1; max_scale).
var scale_from_slider_position = function(position, min_scale, max_scale) {
    var a = (1 - 2 * min_scale + min_scale * min_scale) / (min_scale + max_scale - 2),
        b = 2 * Math.log((max_scale - 1) / (1 - min_scale)),
        c = (min_scale * max_scale - 1) / (min_scale + max_scale - 2);
    return a * Math.exp(b * position) + c;
}

// inverse of scale_from_slider_position
var slider_position_from_scale = function(scale, min_scale, max_scale) {
    var a = (1 - 2 * min_scale + min_scale * min_scale) / (min_scale + max_scale - 2),
        b = 2 * Math.log((max_scale - 1) / (1 - min_scale)),
        c = (min_scale * max_scale - 1) / (min_scale + max_scale - 2);
    return 1 / b * Math.log((scale - c) / a);
}

var increase_zoom_by_position = function(root, delta_position, animate) {
    var scale = root.data("scale"),
        min_scale = root.data("min_scale"),
        max_scale = root.data("max_scale");
    var position = slider_position_from_scale(scale, min_scale, max_scale);
    position += delta_position;
    scale = scale_from_slider_position(position, min_scale, max_scale);
    set_zoom(root, scale, animate);
}

var set_zoom = function(root, scale, animate) {
    var min_scale = root.data("min_scale"),
        max_scale = root.data("max_scale"),
        old_scale = root.data("scale");
    var new_scale = Math.max(min_scale, Math.min(scale, max_scale));
    if (animate) {
        Snap.animate(
            old_scale,
            new_scale,
            function (new_scale) {
                update_plot_scale(root, new_scale);
            },
            200);
    } else {
        update_plot_scale(root, new_scale);
    }
}


var update_plot_scale = function(root, new_scale) {
    var trans = scale_centered_translation(root, new_scale);
    set_plot_pan_zoom(root, trans.x, trans.y, new_scale);

    root.selectAll(".zoomslider_thumb")
        .forEach(function (element, i) {
            var min_pos = element.data("min_pos"),
                max_pos = element.data("max_pos"),
                min_scale = root.data("min_scale"),
                max_scale = root.data("max_scale");
            var xmid = (min_pos + max_pos) / 2;
            var xpos = slider_position_from_scale(new_scale, min_scale, max_scale);
            element.transform(new Snap.Matrix().translate(
                Math.max(min_pos, Math.min(
                         max_pos, min_pos + (max_pos - min_pos) * xpos)) - xmid, 0));
    });
};


Gadfly.zoomslider_thumb_dragmove = function(dx, dy, x, y, event) {
    var root = this.plotroot();
    var min_pos = this.data("min_pos"),
        max_pos = this.data("max_pos"),
        min_scale = root.data("min_scale"),
        max_scale = root.data("max_scale"),
        old_scale = root.data("old_scale");

    var px_per_mm = root.data("px_per_mm");
    dx /= px_per_mm;
    dy /= px_per_mm;

    var xmid = (min_pos + max_pos) / 2;
    var xpos = slider_position_from_scale(old_scale, min_scale, max_scale) +
                   dx / (max_pos - min_pos);

    // compute the new scale
    var new_scale = scale_from_slider_position(xpos, min_scale, max_scale);
    new_scale = Math.min(max_scale, Math.max(min_scale, new_scale));

    update_plot_scale(root, new_scale);
    event.stopPropagation();
};


Gadfly.zoomslider_thumb_dragstart = function(x, y, event) {
    this.animate({fill: this.data("mouseover_color")}, 100);
    var root = this.plotroot();

    // keep track of what the scale was when we started dragging
    root.data("old_scale", root.data("scale"));
    event.stopPropagation();
};


Gadfly.zoomslider_thumb_dragend = function(event) {
    this.animate({fill: this.data("mouseout_color")}, 100);
    event.stopPropagation();
};


var toggle_color_class = function(root, color_class, ison) {
    var guides = root.selectAll(".guide." + color_class + ",.guide ." + color_class);
    var geoms = root.selectAll(".geometry." + color_class + ",.geometry ." + color_class);
    if (ison) {
        guides.animate({opacity: 0.5}, 250);
        geoms.animate({opacity: 0.0}, 250);
    } else {
        guides.animate({opacity: 1.0}, 250);
        geoms.animate({opacity: 1.0}, 250);
    }
};


Gadfly.colorkey_swatch_click = function(event) {
    var root = this.plotroot();
    var color_class = this.data("color_class");

    if (event.shiftKey) {
        root.selectAll(".colorkey text")
            .forEach(function (element) {
                var other_color_class = element.data("color_class");
                if (other_color_class != color_class) {
                    toggle_color_class(root, other_color_class,
                                       element.attr("opacity") == 1.0);
                }
            });
    } else {
        toggle_color_class(root, color_class, this.attr("opacity") == 1.0);
    }
};


return Gadfly;

}));


//@ sourceURL=gadfly.js

(function (glob, factory) {
    // AMD support
      if (typeof require === "function" && typeof define === "function" && define.amd) {
        require(["Snap.svg", "Gadfly"], function (Snap, Gadfly) {
            factory(Snap, Gadfly);
        });
      } else {
          factory(glob.Snap, glob.Gadfly);
      }
})(window, function (Snap, Gadfly) {
    var fig = Snap("#img-e572ec8a");
fig.select("#img-e572ec8a-4")
   .drag(function() {}, function() {}, function() {});
fig.select("#img-e572ec8a-6")
   .data("color_class", "color_odd")
.click(Gadfly.colorkey_swatch_click)
;
fig.select("#img-e572ec8a-7")
   .data("color_class", "color_even")
.click(Gadfly.colorkey_swatch_click)
;
fig.select("#img-e572ec8a-9")
   .data("color_class", "color_odd")
.click(Gadfly.colorkey_swatch_click)
;
fig.select("#img-e572ec8a-10")
   .data("color_class", "color_even")
.click(Gadfly.colorkey_swatch_click)
;
fig.select("#img-e572ec8a-14")
   .init_gadfly();
fig.select("#img-e572ec8a-17")
   .plotroot().data("unfocused_ygrid_color", "#D0D0E0")
;
fig.select("#img-e572ec8a-17")
   .plotroot().data("focused_ygrid_color", "#A0A0A0")
;
fig.select("#img-e572ec8a-129")
   .plotroot().data("unfocused_xgrid_color", "#D0D0E0")
;
fig.select("#img-e572ec8a-129")
   .plotroot().data("focused_xgrid_color", "#A0A0A0")
;
fig.select("#img-e572ec8a-1243")
   .data("mouseover_color", "#CD5C5C")
;
fig.select("#img-e572ec8a-1243")
   .data("mouseout_color", "#6A6A6A")
;
fig.select("#img-e572ec8a-1243")
   .click(Gadfly.zoomslider_zoomin_click)
.mouseenter(Gadfly.zoomslider_button_mouseover)
.mouseleave(Gadfly.zoomslider_button_mouseout)
;
fig.select("#img-e572ec8a-1247")
   .data("max_pos", 106.23)
;
fig.select("#img-e572ec8a-1247")
   .data("min_pos", 89.23)
;
fig.select("#img-e572ec8a-1247")
   .click(Gadfly.zoomslider_track_click);
fig.select("#img-e572ec8a-1249")
   .data("max_pos", 106.23)
;
fig.select("#img-e572ec8a-1249")
   .data("min_pos", 89.23)
;
fig.select("#img-e572ec8a-1249")
   .data("mouseover_color", "#CD5C5C")
;
fig.select("#img-e572ec8a-1249")
   .data("mouseout_color", "#6A6A6A")
;
fig.select("#img-e572ec8a-1249")
   .drag(Gadfly.zoomslider_thumb_dragmove,
     Gadfly.zoomslider_thumb_dragstart,
     Gadfly.zoomslider_thumb_dragend)
;
fig.select("#img-e572ec8a-1251")
   .data("mouseover_color", "#CD5C5C")
;
fig.select("#img-e572ec8a-1251")
   .data("mouseout_color", "#6A6A6A")
;
fig.select("#img-e572ec8a-1251")
   .click(Gadfly.zoomslider_zoomout_click)
.mouseenter(Gadfly.zoomslider_button_mouseover)
.mouseleave(Gadfly.zoomslider_button_mouseout)
;
    });
]]> </script>
</svg>

</div>


It looks like odd numbers overlay the even numbers points. Let's plot even and odd numbers side by side.


```julia
a = plot(df[df[:evenodd] .== "odd",:],
         x="Number", y="NumofSteps", 
         Geom.point,
         Guide.xlabel("Odd"))

b = plot(df[df[:evenodd] .== "even",:],
         x="Number", y="NumofSteps", 
         Geom.point,  
Guide.xlabel("Even"),
         Theme(default_color=colorant"#d4ca59"))

vstack(a,b)
```

<div class="output_html rendered_html output_subarea output_execute_result">
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     xmlns:gadfly="http://www.gadflyjl.org/ns"
     version="1.2"
     width="141.42mm" height="100mm" viewBox="0 0 141.42 100"
     stroke="none"
     fill="#000000"
     stroke-width="0.3"
     font-size="3.88"

     id="img-87eecd28">
<g class="plotroot xscalable yscalable" id="img-87eecd28-1">
  <g font-size="3.88" font-family="'PT Sans','Helvetica Neue','Helvetica',sans-serif" fill="#564A55" stroke="#000000" stroke-opacity="0.000" id="img-87eecd28-2">
    <text x="78.03" y="88.39" text-anchor="middle" dy="0.6em">Even</text>
  </g>
  <g class="guide xlabels" font-size="2.82" font-family="'PT Sans Caption','Helvetica Neue','Helvetica',sans-serif" fill="#6C606B" id="img-87eecd28-3">
    <text x="-147.55" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">-1500</text>
    <text x="-91.16" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">-1000</text>
    <text x="-34.76" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">-500</text>
    <text x="21.63" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="visible">0</text>
    <text x="78.03" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="visible">500</text>
    <text x="134.42" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="visible">1000</text>
    <text x="190.82" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">1500</text>
    <text x="247.21" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">2000</text>
    <text x="303.61" y="84.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">2500</text>
    <text x="-91.16" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-1000</text>
    <text x="-85.52" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-950</text>
    <text x="-79.88" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-900</text>
    <text x="-74.24" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-850</text>
    <text x="-68.6" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-800</text>
    <text x="-62.96" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-750</text>
    <text x="-57.32" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-700</text>
    <text x="-51.68" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-650</text>
    <text x="-46.04" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-600</text>
    <text x="-40.4" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-550</text>
    <text x="-34.76" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-500</text>
    <text x="-29.12" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-450</text>
    <text x="-23.48" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-400</text>
    <text x="-17.84" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-350</text>
    <text x="-12.21" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-300</text>
    <text x="-6.57" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-250</text>
    <text x="-0.93" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-200</text>
    <text x="4.71" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-150</text>
    <text x="10.35" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-100</text>
    <text x="15.99" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-50</text>
    <text x="21.63" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">0</text>
    <text x="27.27" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">50</text>
    <text x="32.91" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">100</text>
    <text x="38.55" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">150</text>
    <text x="44.19" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">200</text>
    <text x="49.83" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">250</text>
    <text x="55.47" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">300</text>
    <text x="61.11" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">350</text>
    <text x="66.75" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">400</text>
    <text x="72.39" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">450</text>
    <text x="78.03" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">500</text>
    <text x="83.67" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">550</text>
    <text x="89.31" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">600</text>
    <text x="94.94" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">650</text>
    <text x="100.58" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">700</text>
    <text x="106.22" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">750</text>
    <text x="111.86" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">800</text>
    <text x="117.5" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">850</text>
    <text x="123.14" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">900</text>
    <text x="128.78" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">950</text>
    <text x="134.42" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1000</text>
    <text x="140.06" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1050</text>
    <text x="145.7" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1100</text>
    <text x="151.34" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1150</text>
    <text x="156.98" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1200</text>
    <text x="162.62" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1250</text>
    <text x="168.26" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1300</text>
    <text x="173.9" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1350</text>
    <text x="179.54" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1400</text>
    <text x="185.18" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1450</text>
    <text x="190.82" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1500</text>
    <text x="196.46" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1550</text>
    <text x="202.1" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1600</text>
    <text x="207.73" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1650</text>
    <text x="213.37" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1700</text>
    <text x="219.01" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1750</text>
    <text x="224.65" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1800</text>
    <text x="230.29" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1850</text>
    <text x="235.93" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1900</text>
    <text x="241.57" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1950</text>
    <text x="247.21" y="84.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">2000</text>
    <text x="-91.16" y="84.39" text-anchor="middle" gadfly:scale="0.5" visibility="hidden">-1000</text>
    <text x="21.63" y="84.39" text-anchor="middle" gadfly:scale="0.5" visibility="hidden">0</text>
    <text x="134.42" y="84.39" text-anchor="middle" gadfly:scale="0.5" visibility="hidden">1000</text>
    <text x="247.21" y="84.39" text-anchor="middle" gadfly:scale="0.5" visibility="hidden">2000</text>
    <text x="-91.16" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-1000</text>
    <text x="-79.88" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-900</text>
    <text x="-68.6" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-800</text>
    <text x="-57.32" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-700</text>
    <text x="-46.04" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-600</text>
    <text x="-34.76" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-500</text>
    <text x="-23.48" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-400</text>
    <text x="-12.21" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-300</text>
    <text x="-0.93" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-200</text>
    <text x="10.35" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-100</text>
    <text x="21.63" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">0</text>
    <text x="32.91" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">100</text>
    <text x="44.19" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">200</text>
    <text x="55.47" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">300</text>
    <text x="66.75" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">400</text>
    <text x="78.03" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">500</text>
    <text x="89.31" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">600</text>
    <text x="100.58" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">700</text>
    <text x="111.86" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">800</text>
    <text x="123.14" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">900</text>
    <text x="134.42" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1000</text>
    <text x="145.7" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1100</text>
    <text x="156.98" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1200</text>
    <text x="168.26" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1300</text>
    <text x="179.54" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1400</text>
    <text x="190.82" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1500</text>
    <text x="202.1" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1600</text>
    <text x="213.37" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1700</text>
    <text x="224.65" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1800</text>
    <text x="235.93" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1900</text>
    <text x="247.21" y="84.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">2000</text>
  </g>
<g clip-path="url(#img-87eecd28-4)">
  <g id="img-87eecd28-5">
    <g pointer-events="visible" opacity="1" fill="#000000" fill-opacity="0.000" stroke="#000000" stroke-opacity="0.000" class="guide background" id="img-87eecd28-6">
      <rect x="19.63" y="55" width="116.79" height="25.72"/>
    </g>
    <g class="guide ygridlines xfixed" stroke-dasharray="0.5,0.5" stroke-width="0.2" stroke="#D0D0E0" id="img-87eecd28-7">
      <path fill="none" d="M19.63,107.67 L 136.42 107.67" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,100.43 L 136.42 100.43" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,93.19 L 136.42 93.19" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,85.95 L 136.42 85.95" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,78.72 L 136.42 78.72" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,71.48 L 136.42 71.48" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,64.24 L 136.42 64.24" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,57 L 136.42 57" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,49.76 L 136.42 49.76" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,42.52 L 136.42 42.52" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,35.29 L 136.42 35.29" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,28.05 L 136.42 28.05" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,100.43 L 136.42 100.43" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,99.71 L 136.42 99.71" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,98.98 L 136.42 98.98" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,98.26 L 136.42 98.26" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,97.53 L 136.42 97.53" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,96.81 L 136.42 96.81" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,96.09 L 136.42 96.09" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,95.36 L 136.42 95.36" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,94.64 L 136.42 94.64" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,93.92 L 136.42 93.92" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,93.19 L 136.42 93.19" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,92.47 L 136.42 92.47" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,91.74 L 136.42 91.74" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,91.02 L 136.42 91.02" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,90.3 L 136.42 90.3" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,89.57 L 136.42 89.57" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,88.85 L 136.42 88.85" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,88.12 L 136.42 88.12" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,87.4 L 136.42 87.4" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,86.68 L 136.42 86.68" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,85.95 L 136.42 85.95" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,85.23 L 136.42 85.23" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,84.51 L 136.42 84.51" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,83.78 L 136.42 83.78" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,83.06 L 136.42 83.06" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,82.33 L 136.42 82.33" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,81.61 L 136.42 81.61" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,80.89 L 136.42 80.89" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,80.16 L 136.42 80.16" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,79.44 L 136.42 79.44" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,78.72 L 136.42 78.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,77.99 L 136.42 77.99" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,77.27 L 136.42 77.27" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,76.54 L 136.42 76.54" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,75.82 L 136.42 75.82" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,75.1 L 136.42 75.1" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,74.37 L 136.42 74.37" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,73.65 L 136.42 73.65" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,72.92 L 136.42 72.92" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,72.2 L 136.42 72.2" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,71.48 L 136.42 71.48" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,70.75 L 136.42 70.75" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,70.03 L 136.42 70.03" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,69.31 L 136.42 69.31" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,68.58 L 136.42 68.58" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,67.86 L 136.42 67.86" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,67.13 L 136.42 67.13" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,66.41 L 136.42 66.41" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,65.69 L 136.42 65.69" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,64.96 L 136.42 64.96" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,64.24 L 136.42 64.24" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,63.51 L 136.42 63.51" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,62.79 L 136.42 62.79" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,62.07 L 136.42 62.07" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,61.34 L 136.42 61.34" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,60.62 L 136.42 60.62" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,59.9 L 136.42 59.9" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,59.17 L 136.42 59.17" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,58.45 L 136.42 58.45" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,57.72 L 136.42 57.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,57 L 136.42 57" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,56.28 L 136.42 56.28" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,55.55 L 136.42 55.55" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,54.83 L 136.42 54.83" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,54.1 L 136.42 54.1" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,53.38 L 136.42 53.38" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,52.66 L 136.42 52.66" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,51.93 L 136.42 51.93" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,51.21 L 136.42 51.21" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,50.49 L 136.42 50.49" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,49.76 L 136.42 49.76" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,49.04 L 136.42 49.04" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,48.31 L 136.42 48.31" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,47.59 L 136.42 47.59" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,46.87 L 136.42 46.87" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,46.14 L 136.42 46.14" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,45.42 L 136.42 45.42" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,44.69 L 136.42 44.69" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,43.97 L 136.42 43.97" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,43.25 L 136.42 43.25" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,42.52 L 136.42 42.52" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,41.8 L 136.42 41.8" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,41.08 L 136.42 41.08" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,40.35 L 136.42 40.35" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,39.63 L 136.42 39.63" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,38.9 L 136.42 38.9" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,38.18 L 136.42 38.18" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,37.46 L 136.42 37.46" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,36.73 L 136.42 36.73" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,36.01 L 136.42 36.01" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,35.29 L 136.42 35.29" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,107.67 L 136.42 107.67" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M19.63,78.72 L 136.42 78.72" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M19.63,49.76 L 136.42 49.76" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M19.63,20.81 L 136.42 20.81" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M19.63,100.43 L 136.42 100.43" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,98.98 L 136.42 98.98" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,97.53 L 136.42 97.53" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,96.09 L 136.42 96.09" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,94.64 L 136.42 94.64" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,93.19 L 136.42 93.19" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,91.74 L 136.42 91.74" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,90.3 L 136.42 90.3" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,88.85 L 136.42 88.85" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,87.4 L 136.42 87.4" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,85.95 L 136.42 85.95" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,84.51 L 136.42 84.51" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,83.06 L 136.42 83.06" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,81.61 L 136.42 81.61" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,80.16 L 136.42 80.16" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,78.72 L 136.42 78.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,77.27 L 136.42 77.27" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,75.82 L 136.42 75.82" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,74.37 L 136.42 74.37" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,72.92 L 136.42 72.92" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,71.48 L 136.42 71.48" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,70.03 L 136.42 70.03" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,68.58 L 136.42 68.58" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,67.13 L 136.42 67.13" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,65.69 L 136.42 65.69" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,64.24 L 136.42 64.24" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,62.79 L 136.42 62.79" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,61.34 L 136.42 61.34" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,59.9 L 136.42 59.9" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,58.45 L 136.42 58.45" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,57 L 136.42 57" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,55.55 L 136.42 55.55" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,54.1 L 136.42 54.1" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,52.66 L 136.42 52.66" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,51.21 L 136.42 51.21" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,49.76 L 136.42 49.76" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,48.31 L 136.42 48.31" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,46.87 L 136.42 46.87" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,45.42 L 136.42 45.42" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,43.97 L 136.42 43.97" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,42.52 L 136.42 42.52" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,41.08 L 136.42 41.08" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,39.63 L 136.42 39.63" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,38.18 L 136.42 38.18" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,36.73 L 136.42 36.73" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,35.29 L 136.42 35.29" gadfly:scale="5.0" visibility="hidden"/>
    </g>
    <g class="guide xgridlines yfixed" stroke-dasharray="0.5,0.5" stroke-width="0.2" stroke="#D0D0E0" id="img-87eecd28-8">
      <path fill="none" d="M-147.55,55 L -147.55 80.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M-91.16,55 L -91.16 80.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M-34.76,55 L -34.76 80.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M21.63,55 L 21.63 80.72" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M78.03,55 L 78.03 80.72" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M134.42,55 L 134.42 80.72" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M190.82,55 L 190.82 80.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M247.21,55 L 247.21 80.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M303.61,55 L 303.61 80.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M-91.16,55 L -91.16 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-85.52,55 L -85.52 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-79.88,55 L -79.88 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-74.24,55 L -74.24 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-68.6,55 L -68.6 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-62.96,55 L -62.96 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-57.32,55 L -57.32 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-51.68,55 L -51.68 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-46.04,55 L -46.04 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-40.4,55 L -40.4 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-34.76,55 L -34.76 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-29.12,55 L -29.12 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-23.48,55 L -23.48 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-17.84,55 L -17.84 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-12.21,55 L -12.21 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-6.57,55 L -6.57 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-0.93,55 L -0.93 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M4.71,55 L 4.71 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M10.35,55 L 10.35 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M15.99,55 L 15.99 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M21.63,55 L 21.63 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M27.27,55 L 27.27 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M32.91,55 L 32.91 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M38.55,55 L 38.55 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M44.19,55 L 44.19 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M49.83,55 L 49.83 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M55.47,55 L 55.47 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M61.11,55 L 61.11 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M66.75,55 L 66.75 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M72.39,55 L 72.39 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M78.03,55 L 78.03 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M83.67,55 L 83.67 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M89.31,55 L 89.31 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M94.94,55 L 94.94 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M100.58,55 L 100.58 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M106.22,55 L 106.22 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M111.86,55 L 111.86 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M117.5,55 L 117.5 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M123.14,55 L 123.14 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M128.78,55 L 128.78 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M134.42,55 L 134.42 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M140.06,55 L 140.06 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M145.7,55 L 145.7 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M151.34,55 L 151.34 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M156.98,55 L 156.98 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M162.62,55 L 162.62 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M168.26,55 L 168.26 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M173.9,55 L 173.9 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M179.54,55 L 179.54 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M185.18,55 L 185.18 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M190.82,55 L 190.82 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M196.46,55 L 196.46 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M202.1,55 L 202.1 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M207.73,55 L 207.73 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M213.37,55 L 213.37 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M219.01,55 L 219.01 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M224.65,55 L 224.65 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M230.29,55 L 230.29 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M235.93,55 L 235.93 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M241.57,55 L 241.57 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M247.21,55 L 247.21 80.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-91.16,55 L -91.16 80.72" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M21.63,55 L 21.63 80.72" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M134.42,55 L 134.42 80.72" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M247.21,55 L 247.21 80.72" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M-91.16,55 L -91.16 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-79.88,55 L -79.88 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-68.6,55 L -68.6 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-57.32,55 L -57.32 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-46.04,55 L -46.04 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-34.76,55 L -34.76 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-23.48,55 L -23.48 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-12.21,55 L -12.21 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-0.93,55 L -0.93 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M10.35,55 L 10.35 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M21.63,55 L 21.63 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M32.91,55 L 32.91 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M44.19,55 L 44.19 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M55.47,55 L 55.47 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M66.75,55 L 66.75 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M78.03,55 L 78.03 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M89.31,55 L 89.31 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M100.58,55 L 100.58 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M111.86,55 L 111.86 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M123.14,55 L 123.14 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M134.42,55 L 134.42 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M145.7,55 L 145.7 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M156.98,55 L 156.98 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M168.26,55 L 168.26 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M179.54,55 L 179.54 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M190.82,55 L 190.82 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M202.1,55 L 202.1 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M213.37,55 L 213.37 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M224.65,55 L 224.65 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M235.93,55 L 235.93 80.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M247.21,55 L 247.21 80.72" gadfly:scale="5.0" visibility="hidden"/>
    </g>
    <g class="plotpanel" id="img-87eecd28-9">
      <g class="geometry" id="img-87eecd28-10">
        <g class="color_RGBA{Float32}(0.8313726f0,0.79215693f0,0.34901962f0,1.0f0)" stroke="#FFFFFF" stroke-width="0.3" fill="#D4CA59" id="img-87eecd28-11">
          <use xlink:href="#img-87eecd28-12" x="21.86" y="78.57"/>
          <use xlink:href="#img-87eecd28-12" x="22.08" y="78.43"/>
          <use xlink:href="#img-87eecd28-12" x="22.31" y="77.56"/>
          <use xlink:href="#img-87eecd28-12" x="22.53" y="78.28"/>
          <use xlink:href="#img-87eecd28-12" x="22.76" y="77.85"/>
          <use xlink:href="#img-87eecd28-12" x="22.99" y="77.41"/>
          <use xlink:href="#img-87eecd28-12" x="23.21" y="76.25"/>
          <use xlink:href="#img-87eecd28-12" x="23.44" y="78.14"/>
          <use xlink:href="#img-87eecd28-12" x="23.66" y="75.82"/>
          <use xlink:href="#img-87eecd28-12" x="23.89" y="77.7"/>
          <use xlink:href="#img-87eecd28-12" x="24.11" y="76.54"/>
          <use xlink:href="#img-87eecd28-12" x="24.34" y="77.27"/>
          <use xlink:href="#img-87eecd28-12" x="24.56" y="77.27"/>
          <use xlink:href="#img-87eecd28-12" x="24.79" y="76.11"/>
          <use xlink:href="#img-87eecd28-12" x="25.02" y="76.11"/>
          <use xlink:href="#img-87eecd28-12" x="25.24" y="77.99"/>
          <use xlink:href="#img-87eecd28-12" x="25.47" y="76.83"/>
          <use xlink:href="#img-87eecd28-12" x="25.69" y="75.67"/>
          <use xlink:href="#img-87eecd28-12" x="25.92" y="75.67"/>
          <use xlink:href="#img-87eecd28-12" x="26.14" y="77.56"/>
          <use xlink:href="#img-87eecd28-12" x="26.37" y="77.56"/>
          <use xlink:href="#img-87eecd28-12" x="26.59" y="76.4"/>
          <use xlink:href="#img-87eecd28-12" x="26.82" y="76.4"/>
          <use xlink:href="#img-87eecd28-12" x="27.05" y="77.12"/>
          <use xlink:href="#img-87eecd28-12" x="27.27" y="75.24"/>
          <use xlink:href="#img-87eecd28-12" x="27.5" y="77.12"/>
          <use xlink:href="#img-87eecd28-12" x="27.72" y="62.5"/>
          <use xlink:href="#img-87eecd28-12" x="27.95" y="75.96"/>
          <use xlink:href="#img-87eecd28-12" x="28.17" y="75.96"/>
          <use xlink:href="#img-87eecd28-12" x="28.4" y="75.96"/>
          <use xlink:href="#img-87eecd28-12" x="28.62" y="63.22"/>
          <use xlink:href="#img-87eecd28-12" x="28.85" y="77.85"/>
          <use xlink:href="#img-87eecd28-12" x="29.08" y="74.81"/>
          <use xlink:href="#img-87eecd28-12" x="29.3" y="76.69"/>
          <use xlink:href="#img-87eecd28-12" x="29.53" y="76.69"/>
          <use xlink:href="#img-87eecd28-12" x="29.75" y="75.53"/>
          <use xlink:href="#img-87eecd28-12" x="29.98" y="75.53"/>
          <use xlink:href="#img-87eecd28-12" x="30.2" y="75.53"/>
          <use xlink:href="#img-87eecd28-12" x="30.43" y="73.65"/>
          <use xlink:href="#img-87eecd28-12" x="30.65" y="77.41"/>
          <use xlink:href="#img-87eecd28-12" x="30.88" y="62.79"/>
          <use xlink:href="#img-87eecd28-12" x="31.11" y="77.41"/>
          <use xlink:href="#img-87eecd28-12" x="31.33" y="74.37"/>
          <use xlink:href="#img-87eecd28-12" x="31.56" y="76.25"/>
          <use xlink:href="#img-87eecd28-12" x="31.78" y="76.25"/>
          <use xlink:href="#img-87eecd28-12" x="32.01" y="76.25"/>
          <use xlink:href="#img-87eecd28-12" x="32.23" y="63.51"/>
          <use xlink:href="#img-87eecd28-12" x="32.46" y="76.98"/>
          <use xlink:href="#img-87eecd28-12" x="32.69" y="75.1"/>
          <use xlink:href="#img-87eecd28-12" x="32.91" y="75.1"/>
          <use xlink:href="#img-87eecd28-12" x="33.14" y="75.1"/>
          <use xlink:href="#img-87eecd28-12" x="33.36" y="76.98"/>
          <use xlink:href="#img-87eecd28-12" x="33.59" y="76.98"/>
          <use xlink:href="#img-87eecd28-12" x="33.81" y="62.36"/>
          <use xlink:href="#img-87eecd28-12" x="34.04" y="62.36"/>
          <use xlink:href="#img-87eecd28-12" x="34.26" y="75.82"/>
          <use xlink:href="#img-87eecd28-12" x="34.49" y="73.94"/>
          <use xlink:href="#img-87eecd28-12" x="34.72" y="75.82"/>
          <use xlink:href="#img-87eecd28-12" x="34.94" y="73.94"/>
          <use xlink:href="#img-87eecd28-12" x="35.17" y="75.82"/>
          <use xlink:href="#img-87eecd28-12" x="35.39" y="75.82"/>
          <use xlink:href="#img-87eecd28-12" x="35.62" y="63.08"/>
          <use xlink:href="#img-87eecd28-12" x="35.84" y="63.08"/>
          <use xlink:href="#img-87eecd28-12" x="36.07" y="77.7"/>
          <use xlink:href="#img-87eecd28-12" x="36.29" y="74.66"/>
          <use xlink:href="#img-87eecd28-12" x="36.52" y="74.66"/>
          <use xlink:href="#img-87eecd28-12" x="36.75" y="74.66"/>
          <use xlink:href="#img-87eecd28-12" x="36.97" y="76.54"/>
          <use xlink:href="#img-87eecd28-12" x="37.2" y="76.54"/>
          <use xlink:href="#img-87eecd28-12" x="37.42" y="76.54"/>
          <use xlink:href="#img-87eecd28-12" x="37.65" y="63.8"/>
          <use xlink:href="#img-87eecd28-12" x="37.87" y="75.39"/>
          <use xlink:href="#img-87eecd28-12" x="38.1" y="61.92"/>
          <use xlink:href="#img-87eecd28-12" x="38.32" y="75.39"/>
          <use xlink:href="#img-87eecd28-12" x="38.55" y="76.54"/>
          <use xlink:href="#img-87eecd28-12" x="38.78" y="75.39"/>
          <use xlink:href="#img-87eecd28-12" x="39" y="75.39"/>
          <use xlink:href="#img-87eecd28-12" x="39.23" y="73.5"/>
          <use xlink:href="#img-87eecd28-12" x="39.45" y="73.5"/>
          <use xlink:href="#img-87eecd28-12" x="39.68" y="77.27"/>
          <use xlink:href="#img-87eecd28-12" x="39.9" y="75.39"/>
          <use xlink:href="#img-87eecd28-12" x="40.13" y="62.65"/>
          <use xlink:href="#img-87eecd28-12" x="40.35" y="62.65"/>
          <use xlink:href="#img-87eecd28-12" x="40.58" y="77.27"/>
          <use xlink:href="#img-87eecd28-12" x="40.81" y="77.27"/>
          <use xlink:href="#img-87eecd28-12" x="41.03" y="74.23"/>
          <use xlink:href="#img-87eecd28-12" x="41.26" y="74.23"/>
          <use xlink:href="#img-87eecd28-12" x="41.48" y="76.11"/>
          <use xlink:href="#img-87eecd28-12" x="41.71" y="74.23"/>
          <use xlink:href="#img-87eecd28-12" x="41.93" y="76.11"/>
          <use xlink:href="#img-87eecd28-12" x="42.16" y="65.25"/>
          <use xlink:href="#img-87eecd28-12" x="42.38" y="76.11"/>
          <use xlink:href="#img-87eecd28-12" x="42.61" y="76.11"/>
          <use xlink:href="#img-87eecd28-12" x="42.84" y="63.37"/>
          <use xlink:href="#img-87eecd28-12" x="43.06" y="63.37"/>
          <use xlink:href="#img-87eecd28-12" x="43.29" y="76.83"/>
          <use xlink:href="#img-87eecd28-12" x="43.51" y="61.49"/>
          <use xlink:href="#img-87eecd28-12" x="43.74" y="74.95"/>
          <use xlink:href="#img-87eecd28-12" x="43.96" y="74.95"/>
          <use xlink:href="#img-87eecd28-12" x="44.19" y="74.95"/>
          <use xlink:href="#img-87eecd28-12" x="44.42" y="74.95"/>
          <use xlink:href="#img-87eecd28-12" x="44.64" y="74.95"/>
          <use xlink:href="#img-87eecd28-12" x="44.87" y="65.98"/>
          <use xlink:href="#img-87eecd28-12" x="45.09" y="76.83"/>
          <use xlink:href="#img-87eecd28-12" x="45.32" y="73.07"/>
          <use xlink:href="#img-87eecd28-12" x="45.54" y="76.83"/>
          <use xlink:href="#img-87eecd28-12" x="45.77" y="64.09"/>
          <use xlink:href="#img-87eecd28-12" x="45.99" y="62.21"/>
          <use xlink:href="#img-87eecd28-12" x="46.22" y="62.21"/>
          <use xlink:href="#img-87eecd28-12" x="46.45" y="62.21"/>
          <use xlink:href="#img-87eecd28-12" x="46.67" y="68.58"/>
          <use xlink:href="#img-87eecd28-12" x="46.9" y="75.67"/>
          <use xlink:href="#img-87eecd28-12" x="47.12" y="76.83"/>
          <use xlink:href="#img-87eecd28-12" x="47.35" y="73.79"/>
          <use xlink:href="#img-87eecd28-12" x="47.57" y="73.79"/>
          <use xlink:href="#img-87eecd28-12" x="47.8" y="75.67"/>
          <use xlink:href="#img-87eecd28-12" x="48.02" y="75.67"/>
          <use xlink:href="#img-87eecd28-12" x="48.25" y="73.79"/>
          <use xlink:href="#img-87eecd28-12" x="48.48" y="73.79"/>
          <use xlink:href="#img-87eecd28-12" x="48.7" y="75.67"/>
          <use xlink:href="#img-87eecd28-12" x="48.93" y="64.82"/>
          <use xlink:href="#img-87eecd28-12" x="49.15" y="75.67"/>
          <use xlink:href="#img-87eecd28-12" x="49.38" y="71.91"/>
          <use xlink:href="#img-87eecd28-12" x="49.6" y="62.94"/>
          <use xlink:href="#img-87eecd28-12" x="49.83" y="62.94"/>
          <use xlink:href="#img-87eecd28-12" x="50.05" y="62.94"/>
          <use xlink:href="#img-87eecd28-12" x="50.28" y="71.91"/>
          <use xlink:href="#img-87eecd28-12" x="50.51" y="77.56"/>
          <use xlink:href="#img-87eecd28-12" x="50.73" y="61.05"/>
          <use xlink:href="#img-87eecd28-12" x="50.96" y="74.52"/>
          <use xlink:href="#img-87eecd28-12" x="51.18" y="74.52"/>
          <use xlink:href="#img-87eecd28-12" x="51.41" y="74.52"/>
          <use xlink:href="#img-87eecd28-12" x="51.63" y="74.52"/>
          <use xlink:href="#img-87eecd28-12" x="51.86" y="74.52"/>
          <use xlink:href="#img-87eecd28-12" x="52.08" y="72.63"/>
          <use xlink:href="#img-87eecd28-12" x="52.31" y="76.4"/>
          <use xlink:href="#img-87eecd28-12" x="52.54" y="65.54"/>
          <use xlink:href="#img-87eecd28-12" x="52.76" y="76.4"/>
          <use xlink:href="#img-87eecd28-12" x="52.99" y="72.63"/>
          <use xlink:href="#img-87eecd28-12" x="53.21" y="76.4"/>
          <use xlink:href="#img-87eecd28-12" x="53.44" y="76.4"/>
          <use xlink:href="#img-87eecd28-12" x="53.66" y="63.66"/>
          <use xlink:href="#img-87eecd28-12" x="53.89" y="63.66"/>
          <use xlink:href="#img-87eecd28-12" x="54.12" y="75.24"/>
          <use xlink:href="#img-87eecd28-12" x="54.34" y="61.78"/>
          <use xlink:href="#img-87eecd28-12" x="54.57" y="61.78"/>
          <use xlink:href="#img-87eecd28-12" x="54.79" y="61.78"/>
          <use xlink:href="#img-87eecd28-12" x="55.02" y="75.24"/>
          <use xlink:href="#img-87eecd28-12" x="55.24" y="75.24"/>
          <use xlink:href="#img-87eecd28-12" x="55.47" y="76.4"/>
          <use xlink:href="#img-87eecd28-12" x="55.69" y="76.4"/>
          <use xlink:href="#img-87eecd28-12" x="55.92" y="75.24"/>
          <use xlink:href="#img-87eecd28-12" x="56.15" y="73.36"/>
          <use xlink:href="#img-87eecd28-12" x="56.37" y="75.24"/>
          <use xlink:href="#img-87eecd28-12" x="56.6" y="66.27"/>
          <use xlink:href="#img-87eecd28-12" x="56.82" y="73.36"/>
          <use xlink:href="#img-87eecd28-12" x="57.05" y="73.36"/>
          <use xlink:href="#img-87eecd28-12" x="57.27" y="73.36"/>
          <use xlink:href="#img-87eecd28-12" x="57.5" y="70.75"/>
          <use xlink:href="#img-87eecd28-12" x="57.72" y="77.12"/>
          <use xlink:href="#img-87eecd28-12" x="57.95" y="64.38"/>
          <use xlink:href="#img-87eecd28-12" x="58.18" y="75.24"/>
          <use xlink:href="#img-87eecd28-12" x="58.4" y="75.24"/>
          <use xlink:href="#img-87eecd28-12" x="58.63" y="62.5"/>
          <use xlink:href="#img-87eecd28-12" x="58.85" y="62.5"/>
          <use xlink:href="#img-87eecd28-12" x="59.08" y="62.5"/>
          <use xlink:href="#img-87eecd28-12" x="59.3" y="68.87"/>
          <use xlink:href="#img-87eecd28-12" x="59.53" y="77.12"/>
          <use xlink:href="#img-87eecd28-12" x="59.75" y="71.48"/>
          <use xlink:href="#img-87eecd28-12" x="59.98" y="77.12"/>
          <use xlink:href="#img-87eecd28-12" x="60.21" y="60.62"/>
          <use xlink:href="#img-87eecd28-12" x="60.43" y="74.08"/>
          <use xlink:href="#img-87eecd28-12" x="60.66" y="74.08"/>
          <use xlink:href="#img-87eecd28-12" x="60.88" y="74.08"/>
          <use xlink:href="#img-87eecd28-12" x="61.11" y="66.99"/>
          <use xlink:href="#img-87eecd28-12" x="61.33" y="75.96"/>
          <use xlink:href="#img-87eecd28-12" x="61.56" y="74.08"/>
          <use xlink:href="#img-87eecd28-12" x="61.78" y="74.08"/>
          <use xlink:href="#img-87eecd28-12" x="62.01" y="74.08"/>
          <use xlink:href="#img-87eecd28-12" x="62.24" y="75.96"/>
          <use xlink:href="#img-87eecd28-12" x="62.46" y="75.96"/>
          <use xlink:href="#img-87eecd28-12" x="62.69" y="65.11"/>
          <use xlink:href="#img-87eecd28-12" x="62.91" y="65.11"/>
          <use xlink:href="#img-87eecd28-12" x="63.14" y="75.96"/>
          <use xlink:href="#img-87eecd28-12" x="63.36" y="72.2"/>
          <use xlink:href="#img-87eecd28-12" x="63.59" y="75.96"/>
          <use xlink:href="#img-87eecd28-12" x="63.82" y="72.2"/>
          <use xlink:href="#img-87eecd28-12" x="64.04" y="63.22"/>
          <use xlink:href="#img-87eecd28-12" x="64.27" y="63.22"/>
          <use xlink:href="#img-87eecd28-12" x="64.49" y="63.22"/>
          <use xlink:href="#img-87eecd28-12" x="64.72" y="72.2"/>
          <use xlink:href="#img-87eecd28-12" x="64.94" y="76.69"/>
          <use xlink:href="#img-87eecd28-12" x="65.17" y="61.34"/>
          <use xlink:href="#img-87eecd28-12" x="65.39" y="61.34"/>
          <use xlink:href="#img-87eecd28-12" x="65.62" y="61.34"/>
          <use xlink:href="#img-87eecd28-12" x="65.85" y="74.81"/>
          <use xlink:href="#img-87eecd28-12" x="66.07" y="74.81"/>
          <use xlink:href="#img-87eecd28-12" x="66.3" y="74.81"/>
          <use xlink:href="#img-87eecd28-12" x="66.52" y="61.34"/>
          <use xlink:href="#img-87eecd28-12" x="66.75" y="74.81"/>
          <use xlink:href="#img-87eecd28-12" x="66.97" y="75.96"/>
          <use xlink:href="#img-87eecd28-12" x="67.2" y="74.81"/>
          <use xlink:href="#img-87eecd28-12" x="67.42" y="72.92"/>
          <use xlink:href="#img-87eecd28-12" x="67.65" y="74.81"/>
          <use xlink:href="#img-87eecd28-12" x="67.88" y="74.81"/>
          <use xlink:href="#img-87eecd28-12" x="68.1" y="65.83"/>
          <use xlink:href="#img-87eecd28-12" x="68.33" y="65.83"/>
          <use xlink:href="#img-87eecd28-12" x="68.55" y="76.69"/>
          <use xlink:href="#img-87eecd28-12" x="68.78" y="72.92"/>
          <use xlink:href="#img-87eecd28-12" x="69" y="72.92"/>
          <use xlink:href="#img-87eecd28-12" x="69.23" y="72.92"/>
          <use xlink:href="#img-87eecd28-12" x="69.45" y="76.69"/>
          <use xlink:href="#img-87eecd28-12" x="69.68" y="76.69"/>
          <use xlink:href="#img-87eecd28-12" x="69.91" y="63.95"/>
          <use xlink:href="#img-87eecd28-12" x="70.13" y="63.95"/>
          <use xlink:href="#img-87eecd28-12" x="70.36" y="62.07"/>
          <use xlink:href="#img-87eecd28-12" x="70.58" y="74.81"/>
          <use xlink:href="#img-87eecd28-12" x="70.81" y="62.07"/>
          <use xlink:href="#img-87eecd28-12" x="71.03" y="71.04"/>
          <use xlink:href="#img-87eecd28-12" x="71.26" y="62.07"/>
          <use xlink:href="#img-87eecd28-12" x="71.48" y="62.07"/>
          <use xlink:href="#img-87eecd28-12" x="71.71" y="68.44"/>
          <use xlink:href="#img-87eecd28-12" x="71.94" y="68.44"/>
          <use xlink:href="#img-87eecd28-12" x="72.16" y="75.53"/>
          <use xlink:href="#img-87eecd28-12" x="72.39" y="71.04"/>
          <use xlink:href="#img-87eecd28-12" x="72.61" y="76.69"/>
          <use xlink:href="#img-87eecd28-12" x="72.84" y="76.69"/>
          <use xlink:href="#img-87eecd28-12" x="73.06" y="73.65"/>
          <use xlink:href="#img-87eecd28-12" x="73.29" y="73.65"/>
          <use xlink:href="#img-87eecd28-12" x="73.51" y="73.65"/>
          <use xlink:href="#img-87eecd28-12" x="73.74" y="60.18"/>
          <use xlink:href="#img-87eecd28-12" x="73.97" y="75.53"/>
          <use xlink:href="#img-87eecd28-12" x="74.19" y="66.55"/>
          <use xlink:href="#img-87eecd28-12" x="74.42" y="75.53"/>
          <use xlink:href="#img-87eecd28-12" x="74.64" y="60.18"/>
          <use xlink:href="#img-87eecd28-12" x="74.87" y="73.65"/>
          <use xlink:href="#img-87eecd28-12" x="75.09" y="73.65"/>
          <use xlink:href="#img-87eecd28-12" x="75.32" y="73.65"/>
          <use xlink:href="#img-87eecd28-12" x="75.55" y="71.04"/>
          <use xlink:href="#img-87eecd28-12" x="75.77" y="75.53"/>
          <use xlink:href="#img-87eecd28-12" x="76" y="75.53"/>
          <use xlink:href="#img-87eecd28-12" x="76.22" y="64.67"/>
          <use xlink:href="#img-87eecd28-12" x="76.45" y="64.67"/>
          <use xlink:href="#img-87eecd28-12" x="76.67" y="75.53"/>
          <use xlink:href="#img-87eecd28-12" x="76.9" y="75.53"/>
          <use xlink:href="#img-87eecd28-12" x="77.12" y="71.77"/>
          <use xlink:href="#img-87eecd28-12" x="77.35" y="71.77"/>
          <use xlink:href="#img-87eecd28-12" x="77.58" y="62.79"/>
          <use xlink:href="#img-87eecd28-12" x="77.8" y="71.77"/>
          <use xlink:href="#img-87eecd28-12" x="78.03" y="62.79"/>
          <use xlink:href="#img-87eecd28-12" x="78.25" y="69.16"/>
          <use xlink:href="#img-87eecd28-12" x="78.48" y="62.79"/>
          <use xlink:href="#img-87eecd28-12" x="78.7" y="62.79"/>
          <use xlink:href="#img-87eecd28-12" x="78.93" y="71.77"/>
          <use xlink:href="#img-87eecd28-12" x="79.15" y="71.77"/>
          <use xlink:href="#img-87eecd28-12" x="79.38" y="77.41"/>
          <use xlink:href="#img-87eecd28-12" x="79.61" y="60.91"/>
          <use xlink:href="#img-87eecd28-12" x="79.83" y="60.91"/>
          <use xlink:href="#img-87eecd28-12" x="80.06" y="60.91"/>
          <use xlink:href="#img-87eecd28-12" x="80.28" y="74.37"/>
          <use xlink:href="#img-87eecd28-12" x="80.51" y="74.37"/>
          <use xlink:href="#img-87eecd28-12" x="80.73" y="74.37"/>
          <use xlink:href="#img-87eecd28-12" x="80.96" y="67.28"/>
          <use xlink:href="#img-87eecd28-12" x="81.18" y="74.37"/>
          <use xlink:href="#img-87eecd28-12" x="81.41" y="60.91"/>
          <use xlink:href="#img-87eecd28-12" x="81.64" y="74.37"/>
          <use xlink:href="#img-87eecd28-12" x="81.86" y="75.53"/>
          <use xlink:href="#img-87eecd28-12" x="82.09" y="74.37"/>
          <use xlink:href="#img-87eecd28-12" x="82.31" y="74.37"/>
          <use xlink:href="#img-87eecd28-12" x="82.54" y="72.49"/>
          <use xlink:href="#img-87eecd28-12" x="82.76" y="72.49"/>
          <use xlink:href="#img-87eecd28-12" x="82.99" y="76.25"/>
          <use xlink:href="#img-87eecd28-12" x="83.21" y="74.37"/>
          <use xlink:href="#img-87eecd28-12" x="83.44" y="65.4"/>
          <use xlink:href="#img-87eecd28-12" x="83.67" y="65.4"/>
          <use xlink:href="#img-87eecd28-12" x="83.89" y="76.25"/>
          <use xlink:href="#img-87eecd28-12" x="84.12" y="76.25"/>
          <use xlink:href="#img-87eecd28-12" x="84.34" y="72.49"/>
          <use xlink:href="#img-87eecd28-12" x="84.57" y="72.49"/>
          <use xlink:href="#img-87eecd28-12" x="84.79" y="76.25"/>
          <use xlink:href="#img-87eecd28-12" x="85.02" y="72.49"/>
          <use xlink:href="#img-87eecd28-12" x="85.25" y="76.25"/>
          <use xlink:href="#img-87eecd28-12" x="85.47" y="69.88"/>
          <use xlink:href="#img-87eecd28-12" x="85.7" y="63.51"/>
          <use xlink:href="#img-87eecd28-12" x="85.92" y="63.51"/>
          <use xlink:href="#img-87eecd28-12" x="86.15" y="63.51"/>
          <use xlink:href="#img-87eecd28-12" x="86.37" y="72.49"/>
          <use xlink:href="#img-87eecd28-12" x="86.6" y="75.1"/>
          <use xlink:href="#img-87eecd28-12" x="86.82" y="74.37"/>
          <use xlink:href="#img-87eecd28-12" x="87.05" y="61.63"/>
          <use xlink:href="#img-87eecd28-12" x="87.28" y="61.63"/>
          <use xlink:href="#img-87eecd28-12" x="87.5" y="61.63"/>
          <use xlink:href="#img-87eecd28-12" x="87.73" y="61.63"/>
          <use xlink:href="#img-87eecd28-12" x="87.95" y="61.63"/>
          <use xlink:href="#img-87eecd28-12" x="88.18" y="70.61"/>
          <use xlink:href="#img-87eecd28-12" x="88.4" y="75.1"/>
          <use xlink:href="#img-87eecd28-12" x="88.63" y="68"/>
          <use xlink:href="#img-87eecd28-12" x="88.85" y="75.1"/>
          <use xlink:href="#img-87eecd28-12" x="89.08" y="61.63"/>
          <use xlink:href="#img-87eecd28-12" x="89.31" y="76.25"/>
          <use xlink:href="#img-87eecd28-12" x="89.53" y="76.25"/>
          <use xlink:href="#img-87eecd28-12" x="89.76" y="76.25"/>
          <use xlink:href="#img-87eecd28-12" x="89.98" y="72.49"/>
          <use xlink:href="#img-87eecd28-12" x="90.21" y="75.1"/>
          <use xlink:href="#img-87eecd28-12" x="90.43" y="73.21"/>
          <use xlink:href="#img-87eecd28-12" x="90.66" y="73.21"/>
          <use xlink:href="#img-87eecd28-12" x="90.88" y="73.21"/>
          <use xlink:href="#img-87eecd28-12" x="91.11" y="75.1"/>
          <use xlink:href="#img-87eecd28-12" x="91.34" y="75.1"/>
          <use xlink:href="#img-87eecd28-12" x="91.56" y="66.12"/>
          <use xlink:href="#img-87eecd28-12" x="91.79" y="66.12"/>
          <use xlink:href="#img-87eecd28-12" x="92.01" y="73.21"/>
          <use xlink:href="#img-87eecd28-12" x="92.24" y="59.75"/>
          <use xlink:href="#img-87eecd28-12" x="92.46" y="73.21"/>
          <use xlink:href="#img-87eecd28-12" x="92.69" y="73.21"/>
          <use xlink:href="#img-87eecd28-12" x="92.91" y="73.21"/>
          <use xlink:href="#img-87eecd28-12" x="93.14" y="73.21"/>
          <use xlink:href="#img-87eecd28-12" x="93.37" y="70.61"/>
          <use xlink:href="#img-87eecd28-12" x="93.59" y="70.61"/>
          <use xlink:href="#img-87eecd28-12" x="93.82" y="76.98"/>
          <use xlink:href="#img-87eecd28-12" x="94.04" y="75.1"/>
          <use xlink:href="#img-87eecd28-12" x="94.27" y="64.24"/>
          <use xlink:href="#img-87eecd28-12" x="94.49" y="64.24"/>
          <use xlink:href="#img-87eecd28-12" x="94.72" y="75.1"/>
          <use xlink:href="#img-87eecd28-12" x="94.94" y="75.1"/>
          <use xlink:href="#img-87eecd28-12" x="95.17" y="75.1"/>
          <use xlink:href="#img-87eecd28-12" x="95.4" y="57.87"/>
          <use xlink:href="#img-87eecd28-12" x="95.62" y="62.36"/>
          <use xlink:href="#img-87eecd28-12" x="95.85" y="71.33"/>
          <use xlink:href="#img-87eecd28-12" x="96.07" y="62.36"/>
          <use xlink:href="#img-87eecd28-12" x="96.3" y="75.1"/>
          <use xlink:href="#img-87eecd28-12" x="96.52" y="62.36"/>
          <use xlink:href="#img-87eecd28-12" x="96.75" y="62.36"/>
          <use xlink:href="#img-87eecd28-12" x="96.98" y="68.73"/>
          <use xlink:href="#img-87eecd28-12" x="97.2" y="68.73"/>
          <use xlink:href="#img-87eecd28-12" x="97.43" y="76.98"/>
          <use xlink:href="#img-87eecd28-12" x="97.65" y="62.36"/>
          <use xlink:href="#img-87eecd28-12" x="97.88" y="71.33"/>
          <use xlink:href="#img-87eecd28-12" x="98.1" y="71.33"/>
          <use xlink:href="#img-87eecd28-12" x="98.33" y="76.98"/>
          <use xlink:href="#img-87eecd28-12" x="98.55" y="76.98"/>
          <use xlink:href="#img-87eecd28-12" x="98.78" y="60.47"/>
          <use xlink:href="#img-87eecd28-12" x="99.01" y="60.47"/>
          <use xlink:href="#img-87eecd28-12" x="99.23" y="73.94"/>
          <use xlink:href="#img-87eecd28-12" x="99.46" y="60.47"/>
          <use xlink:href="#img-87eecd28-12" x="99.68" y="73.94"/>
          <use xlink:href="#img-87eecd28-12" x="99.91" y="60.47"/>
          <use xlink:href="#img-87eecd28-12" x="100.13" y="73.94"/>
          <use xlink:href="#img-87eecd28-12" x="100.36" y="73.94"/>
          <use xlink:href="#img-87eecd28-12" x="100.58" y="66.84"/>
          <use xlink:href="#img-87eecd28-12" x="100.81" y="66.84"/>
          <use xlink:href="#img-87eecd28-12" x="101.04" y="75.82"/>
          <use xlink:href="#img-87eecd28-12" x="101.26" y="60.47"/>
          <use xlink:href="#img-87eecd28-12" x="101.49" y="73.94"/>
          <use xlink:href="#img-87eecd28-12" x="101.71" y="73.94"/>
          <use xlink:href="#img-87eecd28-12" x="101.94" y="73.94"/>
          <use xlink:href="#img-87eecd28-12" x="102.16" y="73.94"/>
          <use xlink:href="#img-87eecd28-12" x="102.39" y="73.94"/>
          <use xlink:href="#img-87eecd28-12" x="102.61" y="71.33"/>
          <use xlink:href="#img-87eecd28-12" x="102.84" y="75.82"/>
          <use xlink:href="#img-87eecd28-12" x="103.07" y="72.06"/>
          <use xlink:href="#img-87eecd28-12" x="103.29" y="75.82"/>
          <use xlink:href="#img-87eecd28-12" x="103.52" y="72.06"/>
          <use xlink:href="#img-87eecd28-12" x="103.74" y="64.96"/>
          <use xlink:href="#img-87eecd28-12" x="103.97" y="64.96"/>
          <use xlink:href="#img-87eecd28-12" x="104.19" y="64.96"/>
          <use xlink:href="#img-87eecd28-12" x="104.42" y="72.06"/>
          <use xlink:href="#img-87eecd28-12" x="104.64" y="75.82"/>
          <use xlink:href="#img-87eecd28-12" x="104.87" y="75.82"/>
          <use xlink:href="#img-87eecd28-12" x="105.1" y="72.06"/>
          <use xlink:href="#img-87eecd28-12" x="105.32" y="72.06"/>
          <use xlink:href="#img-87eecd28-12" x="105.55" y="75.82"/>
          <use xlink:href="#img-87eecd28-12" x="105.77" y="75.82"/>
          <use xlink:href="#img-87eecd28-12" x="106" y="72.06"/>
          <use xlink:href="#img-87eecd28-12" x="106.22" y="72.06"/>
          <use xlink:href="#img-87eecd28-12" x="106.45" y="63.08"/>
          <use xlink:href="#img-87eecd28-12" x="106.68" y="69.45"/>
          <use xlink:href="#img-87eecd28-12" x="106.9" y="63.08"/>
          <use xlink:href="#img-87eecd28-12" x="107.13" y="70.17"/>
          <use xlink:href="#img-87eecd28-12" x="107.35" y="63.08"/>
          <use xlink:href="#img-87eecd28-12" x="107.58" y="63.08"/>
          <use xlink:href="#img-87eecd28-12" x="107.8" y="72.06"/>
          <use xlink:href="#img-87eecd28-12" x="108.03" y="72.06"/>
          <use xlink:href="#img-87eecd28-12" x="108.25" y="76.54"/>
          <use xlink:href="#img-87eecd28-12" x="108.48" y="73.94"/>
          <use xlink:href="#img-87eecd28-12" x="108.71" y="61.2"/>
          <use xlink:href="#img-87eecd28-12" x="108.93" y="61.2"/>
          <use xlink:href="#img-87eecd28-12" x="109.16" y="61.2"/>
          <use xlink:href="#img-87eecd28-12" x="109.38" y="61.2"/>
          <use xlink:href="#img-87eecd28-12" x="109.61" y="61.2"/>
          <use xlink:href="#img-87eecd28-12" x="109.83" y="61.2"/>
          <use xlink:href="#img-87eecd28-12" x="110.06" y="74.66"/>
          <use xlink:href="#img-87eecd28-12" x="110.28" y="70.17"/>
          <use xlink:href="#img-87eecd28-12" x="110.51" y="74.66"/>
          <use xlink:href="#img-87eecd28-12" x="110.74" y="67.57"/>
          <use xlink:href="#img-87eecd28-12" x="110.96" y="74.66"/>
          <use xlink:href="#img-87eecd28-12" x="111.19" y="74.66"/>
          <use xlink:href="#img-87eecd28-12" x="111.41" y="61.2"/>
          <use xlink:href="#img-87eecd28-12" x="111.64" y="61.2"/>
          <use xlink:href="#img-87eecd28-12" x="111.86" y="74.66"/>
          <use xlink:href="#img-87eecd28-12" x="112.09" y="75.82"/>
          <use xlink:href="#img-87eecd28-12" x="112.31" y="75.82"/>
          <use xlink:href="#img-87eecd28-12" x="112.54" y="75.82"/>
          <use xlink:href="#img-87eecd28-12" x="112.77" y="74.66"/>
          <use xlink:href="#img-87eecd28-12" x="112.99" y="74.66"/>
          <use xlink:href="#img-87eecd28-12" x="113.22" y="72.78"/>
          <use xlink:href="#img-87eecd28-12" x="113.44" y="72.78"/>
          <use xlink:href="#img-87eecd28-12" x="113.67" y="74.66"/>
          <use xlink:href="#img-87eecd28-12" x="113.89" y="72.78"/>
          <use xlink:href="#img-87eecd28-12" x="114.12" y="74.66"/>
          <use xlink:href="#img-87eecd28-12" x="114.34" y="59.32"/>
          <use xlink:href="#img-87eecd28-12" x="114.57" y="65.69"/>
          <use xlink:href="#img-87eecd28-12" x="114.8" y="65.69"/>
          <use xlink:href="#img-87eecd28-12" x="115.02" y="65.69"/>
          <use xlink:href="#img-87eecd28-12" x="115.25" y="59.32"/>
          <use xlink:href="#img-87eecd28-12" x="115.47" y="76.54"/>
          <use xlink:href="#img-87eecd28-12" x="115.7" y="59.32"/>
          <use xlink:href="#img-87eecd28-12" x="115.92" y="72.78"/>
          <use xlink:href="#img-87eecd28-12" x="116.15" y="72.78"/>
          <use xlink:href="#img-87eecd28-12" x="116.38" y="72.78"/>
          <use xlink:href="#img-87eecd28-12" x="116.6" y="72.78"/>
          <use xlink:href="#img-87eecd28-12" x="116.83" y="72.78"/>
          <use xlink:href="#img-87eecd28-12" x="117.05" y="73.94"/>
          <use xlink:href="#img-87eecd28-12" x="117.28" y="76.54"/>
          <use xlink:href="#img-87eecd28-12" x="117.5" y="70.17"/>
          <use xlink:href="#img-87eecd28-12" x="117.73" y="76.54"/>
          <use xlink:href="#img-87eecd28-12" x="117.95" y="70.9"/>
          <use xlink:href="#img-87eecd28-12" x="118.18" y="63.8"/>
          <use xlink:href="#img-87eecd28-12" x="118.41" y="63.8"/>
          <use xlink:href="#img-87eecd28-12" x="118.63" y="63.8"/>
          <use xlink:href="#img-87eecd28-12" x="118.86" y="72.78"/>
          <use xlink:href="#img-87eecd28-12" x="119.08" y="61.92"/>
          <use xlink:href="#img-87eecd28-12" x="119.31" y="74.66"/>
          <use xlink:href="#img-87eecd28-12" x="119.53" y="74.66"/>
          <use xlink:href="#img-87eecd28-12" x="119.76" y="74.66"/>
          <use xlink:href="#img-87eecd28-12" x="119.98" y="61.92"/>
          <use xlink:href="#img-87eecd28-12" x="120.21" y="61.92"/>
          <use xlink:href="#img-87eecd28-12" x="120.44" y="70.9"/>
          <use xlink:href="#img-87eecd28-12" x="120.66" y="70.9"/>
          <use xlink:href="#img-87eecd28-12" x="120.89" y="61.92"/>
          <use xlink:href="#img-87eecd28-12" x="121.11" y="74.66"/>
          <use xlink:href="#img-87eecd28-12" x="121.34" y="61.92"/>
          <use xlink:href="#img-87eecd28-12" x="121.56" y="70.9"/>
          <use xlink:href="#img-87eecd28-12" x="121.79" y="68.29"/>
          <use xlink:href="#img-87eecd28-12" x="122.01" y="68.29"/>
          <use xlink:href="#img-87eecd28-12" x="122.24" y="68.29"/>
          <use xlink:href="#img-87eecd28-12" x="122.47" y="64.53"/>
          <use xlink:href="#img-87eecd28-12" x="122.69" y="75.39"/>
          <use xlink:href="#img-87eecd28-12" x="122.92" y="61.92"/>
          <use xlink:href="#img-87eecd28-12" x="123.14" y="70.9"/>
          <use xlink:href="#img-87eecd28-12" x="123.37" y="70.9"/>
          <use xlink:href="#img-87eecd28-12" x="123.59" y="76.54"/>
          <use xlink:href="#img-87eecd28-12" x="123.82" y="76.54"/>
          <use xlink:href="#img-87eecd28-12" x="124.04" y="76.54"/>
          <use xlink:href="#img-87eecd28-12" x="124.27" y="72.78"/>
          <use xlink:href="#img-87eecd28-12" x="124.5" y="73.5"/>
          <use xlink:href="#img-87eecd28-12" x="124.72" y="60.04"/>
          <use xlink:href="#img-87eecd28-12" x="124.95" y="73.5"/>
          <use xlink:href="#img-87eecd28-12" x="125.17" y="60.04"/>
          <use xlink:href="#img-87eecd28-12" x="125.4" y="73.5"/>
          <use xlink:href="#img-87eecd28-12" x="125.62" y="73.5"/>
          <use xlink:href="#img-87eecd28-12" x="125.85" y="60.04"/>
          <use xlink:href="#img-87eecd28-12" x="126.07" y="60.04"/>
          <use xlink:href="#img-87eecd28-12" x="126.3" y="75.39"/>
          <use xlink:href="#img-87eecd28-12" x="126.53" y="73.5"/>
          <use xlink:href="#img-87eecd28-12" x="126.75" y="66.41"/>
          <use xlink:href="#img-87eecd28-12" x="126.98" y="66.41"/>
          <use xlink:href="#img-87eecd28-12" x="127.2" y="75.39"/>
          <use xlink:href="#img-87eecd28-12" x="127.43" y="75.39"/>
          <use xlink:href="#img-87eecd28-12" x="127.65" y="60.04"/>
          <use xlink:href="#img-87eecd28-12" x="127.88" y="60.04"/>
          <use xlink:href="#img-87eecd28-12" x="128.11" y="73.5"/>
          <use xlink:href="#img-87eecd28-12" x="128.33" y="73.5"/>
          <use xlink:href="#img-87eecd28-12" x="128.56" y="73.5"/>
          <use xlink:href="#img-87eecd28-12" x="128.78" y="74.66"/>
          <use xlink:href="#img-87eecd28-12" x="129.01" y="73.5"/>
          <use xlink:href="#img-87eecd28-12" x="129.23" y="73.5"/>
          <use xlink:href="#img-87eecd28-12" x="129.46" y="70.9"/>
          <use xlink:href="#img-87eecd28-12" x="129.68" y="70.9"/>
          <use xlink:href="#img-87eecd28-12" x="129.91" y="75.39"/>
          <use xlink:href="#img-87eecd28-12" x="130.14" y="71.62"/>
          <use xlink:href="#img-87eecd28-12" x="130.36" y="75.39"/>
          <use xlink:href="#img-87eecd28-12" x="130.59" y="75.39"/>
          <use xlink:href="#img-87eecd28-12" x="130.81" y="64.53"/>
          <use xlink:href="#img-87eecd28-12" x="131.04" y="64.53"/>
          <use xlink:href="#img-87eecd28-12" x="131.26" y="64.53"/>
          <use xlink:href="#img-87eecd28-12" x="131.49" y="58.16"/>
          <use xlink:href="#img-87eecd28-12" x="131.71" y="75.39"/>
          <use xlink:href="#img-87eecd28-12" x="131.94" y="71.62"/>
          <use xlink:href="#img-87eecd28-12" x="132.17" y="75.39"/>
          <use xlink:href="#img-87eecd28-12" x="132.39" y="58.16"/>
          <use xlink:href="#img-87eecd28-12" x="132.62" y="71.62"/>
          <use xlink:href="#img-87eecd28-12" x="132.84" y="71.62"/>
          <use xlink:href="#img-87eecd28-12" x="133.07" y="71.62"/>
          <use xlink:href="#img-87eecd28-12" x="133.29" y="64.53"/>
          <use xlink:href="#img-87eecd28-12" x="133.52" y="62.65"/>
          <use xlink:href="#img-87eecd28-12" x="133.74" y="75.39"/>
          <use xlink:href="#img-87eecd28-12" x="133.97" y="71.62"/>
          <use xlink:href="#img-87eecd28-12" x="134.2" y="71.62"/>
          <use xlink:href="#img-87eecd28-12" x="134.42" y="62.65"/>
        </g>
      </g>
    </g>
    <g opacity="0" class="guide zoomslider" stroke="#000000" stroke-opacity="0.000" id="img-87eecd28-13">
      <g fill="#EAEAEA" stroke-width="0.3" stroke-opacity="0" stroke="#6A6A6A" id="img-87eecd28-14">
        <rect x="129.42" y="58" width="4" height="4"/>
        <g class="button_logo" fill="#6A6A6A" id="img-87eecd28-15">
          <path d="M130.22,59.6 L 131.02 59.6 131.02 58.8 131.82 58.8 131.82 59.6 132.62 59.6 132.62 60.4 131.82 60.4 131.82 61.2 131.02 61.2 131.02 60.4 130.22 60.4 z"/>
        </g>
      </g>
      <g fill="#EAEAEA" id="img-87eecd28-16">
        <rect x="109.92" y="58" width="19" height="4"/>
      </g>
      <g class="zoomslider_thumb" fill="#6A6A6A" id="img-87eecd28-17">
        <rect x="118.42" y="58" width="2" height="4"/>
      </g>
      <g fill="#EAEAEA" stroke-width="0.3" stroke-opacity="0" stroke="#6A6A6A" id="img-87eecd28-18">
        <rect x="105.42" y="58" width="4" height="4"/>
        <g class="button_logo" fill="#6A6A6A" id="img-87eecd28-19">
          <path d="M106.22,59.6 L 108.62 59.6 108.62 60.4 106.22 60.4 z"/>
        </g>
      </g>
    </g>
  </g>
</g>
  <g class="guide ylabels" font-size="2.82" font-family="'PT Sans Caption','Helvetica Neue','Helvetica',sans-serif" fill="#6C606B" id="img-87eecd28-20">
    <text x="18.63" y="107.67" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">-200</text>
    <text x="18.63" y="100.43" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">-150</text>
    <text x="18.63" y="93.19" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">-100</text>
    <text x="18.63" y="85.95" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">-50</text>
    <text x="18.63" y="78.72" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="visible">0</text>
    <text x="18.63" y="71.48" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="visible">50</text>
    <text x="18.63" y="64.24" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="visible">100</text>
    <text x="18.63" y="57" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="visible">150</text>
    <text x="18.63" y="49.76" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">200</text>
    <text x="18.63" y="42.52" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">250</text>
    <text x="18.63" y="35.29" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">300</text>
    <text x="18.63" y="28.05" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">350</text>
    <text x="18.63" y="100.43" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-150</text>
    <text x="18.63" y="99.71" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-145</text>
    <text x="18.63" y="98.98" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-140</text>
    <text x="18.63" y="98.26" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-135</text>
    <text x="18.63" y="97.53" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-130</text>
    <text x="18.63" y="96.81" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-125</text>
    <text x="18.63" y="96.09" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-120</text>
    <text x="18.63" y="95.36" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-115</text>
    <text x="18.63" y="94.64" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-110</text>
    <text x="18.63" y="93.92" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-105</text>
    <text x="18.63" y="93.19" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-100</text>
    <text x="18.63" y="92.47" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-95</text>
    <text x="18.63" y="91.74" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-90</text>
    <text x="18.63" y="91.02" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-85</text>
    <text x="18.63" y="90.3" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-80</text>
    <text x="18.63" y="89.57" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-75</text>
    <text x="18.63" y="88.85" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-70</text>
    <text x="18.63" y="88.12" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-65</text>
    <text x="18.63" y="87.4" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-60</text>
    <text x="18.63" y="86.68" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-55</text>
    <text x="18.63" y="85.95" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-50</text>
    <text x="18.63" y="85.23" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-45</text>
    <text x="18.63" y="84.51" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-40</text>
    <text x="18.63" y="83.78" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-35</text>
    <text x="18.63" y="83.06" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-30</text>
    <text x="18.63" y="82.33" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-25</text>
    <text x="18.63" y="81.61" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-20</text>
    <text x="18.63" y="80.89" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-15</text>
    <text x="18.63" y="80.16" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-10</text>
    <text x="18.63" y="79.44" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-5</text>
    <text x="18.63" y="78.72" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">0</text>
    <text x="18.63" y="77.99" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">5</text>
    <text x="18.63" y="77.27" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">10</text>
    <text x="18.63" y="76.54" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">15</text>
    <text x="18.63" y="75.82" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">20</text>
    <text x="18.63" y="75.1" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">25</text>
    <text x="18.63" y="74.37" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">30</text>
    <text x="18.63" y="73.65" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">35</text>
    <text x="18.63" y="72.92" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">40</text>
    <text x="18.63" y="72.2" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">45</text>
    <text x="18.63" y="71.48" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">50</text>
    <text x="18.63" y="70.75" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">55</text>
    <text x="18.63" y="70.03" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">60</text>
    <text x="18.63" y="69.31" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">65</text>
    <text x="18.63" y="68.58" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">70</text>
    <text x="18.63" y="67.86" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">75</text>
    <text x="18.63" y="67.13" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">80</text>
    <text x="18.63" y="66.41" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">85</text>
    <text x="18.63" y="65.69" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">90</text>
    <text x="18.63" y="64.96" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">95</text>
    <text x="18.63" y="64.24" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">100</text>
    <text x="18.63" y="63.51" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">105</text>
    <text x="18.63" y="62.79" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">110</text>
    <text x="18.63" y="62.07" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">115</text>
    <text x="18.63" y="61.34" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">120</text>
    <text x="18.63" y="60.62" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">125</text>
    <text x="18.63" y="59.9" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">130</text>
    <text x="18.63" y="59.17" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">135</text>
    <text x="18.63" y="58.45" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">140</text>
    <text x="18.63" y="57.72" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">145</text>
    <text x="18.63" y="57" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">150</text>
    <text x="18.63" y="56.28" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">155</text>
    <text x="18.63" y="55.55" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">160</text>
    <text x="18.63" y="54.83" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">165</text>
    <text x="18.63" y="54.1" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">170</text>
    <text x="18.63" y="53.38" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">175</text>
    <text x="18.63" y="52.66" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">180</text>
    <text x="18.63" y="51.93" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">185</text>
    <text x="18.63" y="51.21" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">190</text>
    <text x="18.63" y="50.49" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">195</text>
    <text x="18.63" y="49.76" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">200</text>
    <text x="18.63" y="49.04" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">205</text>
    <text x="18.63" y="48.31" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">210</text>
    <text x="18.63" y="47.59" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">215</text>
    <text x="18.63" y="46.87" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">220</text>
    <text x="18.63" y="46.14" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">225</text>
    <text x="18.63" y="45.42" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">230</text>
    <text x="18.63" y="44.69" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">235</text>
    <text x="18.63" y="43.97" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">240</text>
    <text x="18.63" y="43.25" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">245</text>
    <text x="18.63" y="42.52" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">250</text>
    <text x="18.63" y="41.8" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">255</text>
    <text x="18.63" y="41.08" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">260</text>
    <text x="18.63" y="40.35" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">265</text>
    <text x="18.63" y="39.63" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">270</text>
    <text x="18.63" y="38.9" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">275</text>
    <text x="18.63" y="38.18" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">280</text>
    <text x="18.63" y="37.46" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">285</text>
    <text x="18.63" y="36.73" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">290</text>
    <text x="18.63" y="36.01" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">295</text>
    <text x="18.63" y="35.29" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">300</text>
    <text x="18.63" y="107.67" text-anchor="end" dy="0.35em" gadfly:scale="0.5" visibility="hidden">-200</text>
    <text x="18.63" y="78.72" text-anchor="end" dy="0.35em" gadfly:scale="0.5" visibility="hidden">0</text>
    <text x="18.63" y="49.76" text-anchor="end" dy="0.35em" gadfly:scale="0.5" visibility="hidden">200</text>
    <text x="18.63" y="20.81" text-anchor="end" dy="0.35em" gadfly:scale="0.5" visibility="hidden">400</text>
    <text x="18.63" y="100.43" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-150</text>
    <text x="18.63" y="98.98" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-140</text>
    <text x="18.63" y="97.53" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-130</text>
    <text x="18.63" y="96.09" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-120</text>
    <text x="18.63" y="94.64" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-110</text>
    <text x="18.63" y="93.19" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-100</text>
    <text x="18.63" y="91.74" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-90</text>
    <text x="18.63" y="90.3" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-80</text>
    <text x="18.63" y="88.85" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-70</text>
    <text x="18.63" y="87.4" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-60</text>
    <text x="18.63" y="85.95" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-50</text>
    <text x="18.63" y="84.51" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-40</text>
    <text x="18.63" y="83.06" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-30</text>
    <text x="18.63" y="81.61" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-20</text>
    <text x="18.63" y="80.16" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-10</text>
    <text x="18.63" y="78.72" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">0</text>
    <text x="18.63" y="77.27" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">10</text>
    <text x="18.63" y="75.82" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">20</text>
    <text x="18.63" y="74.37" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">30</text>
    <text x="18.63" y="72.92" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">40</text>
    <text x="18.63" y="71.48" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">50</text>
    <text x="18.63" y="70.03" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">60</text>
    <text x="18.63" y="68.58" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">70</text>
    <text x="18.63" y="67.13" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">80</text>
    <text x="18.63" y="65.69" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">90</text>
    <text x="18.63" y="64.24" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">100</text>
    <text x="18.63" y="62.79" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">110</text>
    <text x="18.63" y="61.34" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">120</text>
    <text x="18.63" y="59.9" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">130</text>
    <text x="18.63" y="58.45" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">140</text>
    <text x="18.63" y="57" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">150</text>
    <text x="18.63" y="55.55" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">160</text>
    <text x="18.63" y="54.1" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">170</text>
    <text x="18.63" y="52.66" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">180</text>
    <text x="18.63" y="51.21" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">190</text>
    <text x="18.63" y="49.76" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">200</text>
    <text x="18.63" y="48.31" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">210</text>
    <text x="18.63" y="46.87" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">220</text>
    <text x="18.63" y="45.42" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">230</text>
    <text x="18.63" y="43.97" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">240</text>
    <text x="18.63" y="42.52" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">250</text>
    <text x="18.63" y="41.08" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">260</text>
    <text x="18.63" y="39.63" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">270</text>
    <text x="18.63" y="38.18" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">280</text>
    <text x="18.63" y="36.73" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">290</text>
    <text x="18.63" y="35.29" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">300</text>
  </g>
  <g font-size="3.88" font-family="'PT Sans','Helvetica Neue','Helvetica',sans-serif" fill="#564A55" stroke="#000000" stroke-opacity="0.000" id="img-87eecd28-21">
    <text x="8.81" y="65.86" text-anchor="middle" dy="0.35em" transform="rotate(-90, 8.81, 67.86)">NumofSteps</text>
  </g>
</g>
<g class="plotroot xscalable yscalable" id="img-87eecd28-22">
  <g font-size="3.88" font-family="'PT Sans','Helvetica Neue','Helvetica',sans-serif" fill="#564A55" stroke="#000000" stroke-opacity="0.000" id="img-87eecd28-23">
    <text x="78.03" y="38.39" text-anchor="middle" dy="0.6em">Odd</text>
  </g>
  <g class="guide xlabels" font-size="2.82" font-family="'PT Sans Caption','Helvetica Neue','Helvetica',sans-serif" fill="#6C606B" id="img-87eecd28-24">
    <text x="-147.55" y="34.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">-1500</text>
    <text x="-91.16" y="34.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">-1000</text>
    <text x="-34.76" y="34.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">-500</text>
    <text x="21.63" y="34.39" text-anchor="middle" gadfly:scale="1.0" visibility="visible">0</text>
    <text x="78.03" y="34.39" text-anchor="middle" gadfly:scale="1.0" visibility="visible">500</text>
    <text x="134.42" y="34.39" text-anchor="middle" gadfly:scale="1.0" visibility="visible">1000</text>
    <text x="190.82" y="34.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">1500</text>
    <text x="247.21" y="34.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">2000</text>
    <text x="303.61" y="34.39" text-anchor="middle" gadfly:scale="1.0" visibility="hidden">2500</text>
    <text x="-91.16" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-1000</text>
    <text x="-85.52" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-950</text>
    <text x="-79.88" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-900</text>
    <text x="-74.24" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-850</text>
    <text x="-68.6" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-800</text>
    <text x="-62.96" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-750</text>
    <text x="-57.32" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-700</text>
    <text x="-51.68" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-650</text>
    <text x="-46.04" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-600</text>
    <text x="-40.4" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-550</text>
    <text x="-34.76" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-500</text>
    <text x="-29.12" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-450</text>
    <text x="-23.48" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-400</text>
    <text x="-17.84" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-350</text>
    <text x="-12.21" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-300</text>
    <text x="-6.57" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-250</text>
    <text x="-0.93" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-200</text>
    <text x="4.71" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-150</text>
    <text x="10.35" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-100</text>
    <text x="15.99" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">-50</text>
    <text x="21.63" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">0</text>
    <text x="27.27" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">50</text>
    <text x="32.91" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">100</text>
    <text x="38.55" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">150</text>
    <text x="44.19" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">200</text>
    <text x="49.83" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">250</text>
    <text x="55.47" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">300</text>
    <text x="61.11" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">350</text>
    <text x="66.75" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">400</text>
    <text x="72.39" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">450</text>
    <text x="78.03" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">500</text>
    <text x="83.67" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">550</text>
    <text x="89.31" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">600</text>
    <text x="94.94" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">650</text>
    <text x="100.58" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">700</text>
    <text x="106.22" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">750</text>
    <text x="111.86" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">800</text>
    <text x="117.5" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">850</text>
    <text x="123.14" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">900</text>
    <text x="128.78" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">950</text>
    <text x="134.42" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1000</text>
    <text x="140.06" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1050</text>
    <text x="145.7" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1100</text>
    <text x="151.34" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1150</text>
    <text x="156.98" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1200</text>
    <text x="162.62" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1250</text>
    <text x="168.26" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1300</text>
    <text x="173.9" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1350</text>
    <text x="179.54" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1400</text>
    <text x="185.18" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1450</text>
    <text x="190.82" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1500</text>
    <text x="196.46" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1550</text>
    <text x="202.1" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1600</text>
    <text x="207.73" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1650</text>
    <text x="213.37" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1700</text>
    <text x="219.01" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1750</text>
    <text x="224.65" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1800</text>
    <text x="230.29" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1850</text>
    <text x="235.93" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1900</text>
    <text x="241.57" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">1950</text>
    <text x="247.21" y="34.39" text-anchor="middle" gadfly:scale="10.0" visibility="hidden">2000</text>
    <text x="-91.16" y="34.39" text-anchor="middle" gadfly:scale="0.5" visibility="hidden">-1000</text>
    <text x="21.63" y="34.39" text-anchor="middle" gadfly:scale="0.5" visibility="hidden">0</text>
    <text x="134.42" y="34.39" text-anchor="middle" gadfly:scale="0.5" visibility="hidden">1000</text>
    <text x="247.21" y="34.39" text-anchor="middle" gadfly:scale="0.5" visibility="hidden">2000</text>
    <text x="-91.16" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-1000</text>
    <text x="-79.88" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-900</text>
    <text x="-68.6" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-800</text>
    <text x="-57.32" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-700</text>
    <text x="-46.04" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-600</text>
    <text x="-34.76" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-500</text>
    <text x="-23.48" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-400</text>
    <text x="-12.21" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-300</text>
    <text x="-0.93" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-200</text>
    <text x="10.35" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">-100</text>
    <text x="21.63" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">0</text>
    <text x="32.91" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">100</text>
    <text x="44.19" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">200</text>
    <text x="55.47" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">300</text>
    <text x="66.75" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">400</text>
    <text x="78.03" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">500</text>
    <text x="89.31" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">600</text>
    <text x="100.58" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">700</text>
    <text x="111.86" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">800</text>
    <text x="123.14" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">900</text>
    <text x="134.42" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1000</text>
    <text x="145.7" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1100</text>
    <text x="156.98" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1200</text>
    <text x="168.26" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1300</text>
    <text x="179.54" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1400</text>
    <text x="190.82" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1500</text>
    <text x="202.1" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1600</text>
    <text x="213.37" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1700</text>
    <text x="224.65" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1800</text>
    <text x="235.93" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">1900</text>
    <text x="247.21" y="34.39" text-anchor="middle" gadfly:scale="5.0" visibility="hidden">2000</text>
  </g>
<g clip-path="url(#img-87eecd28-25)">
  <g id="img-87eecd28-26">
    <g pointer-events="visible" opacity="1" fill="#000000" fill-opacity="0.000" stroke="#000000" stroke-opacity="0.000" class="guide background" id="img-87eecd28-27">
      <rect x="19.63" y="5" width="116.79" height="25.72"/>
    </g>
    <g class="guide ygridlines xfixed" stroke-dasharray="0.5,0.5" stroke-width="0.2" stroke="#D0D0E0" id="img-87eecd28-28">
      <path fill="none" d="M19.63,55.86 L 136.42 55.86" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,50.43 L 136.42 50.43" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,45 L 136.42 45" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,39.57 L 136.42 39.57" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,34.14 L 136.42 34.14" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,28.72 L 136.42 28.72" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,23.29 L 136.42 23.29" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,17.86 L 136.42 17.86" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,12.43 L 136.42 12.43" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,7 L 136.42 7" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M19.63,1.57 L 136.42 1.57" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-3.86 L 136.42 -3.86" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-9.29 L 136.42 -9.29" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-14.72 L 136.42 -14.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-20.14 L 136.42 -20.14" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M19.63,50.43 L 136.42 50.43" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,49.34 L 136.42 49.34" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,48.26 L 136.42 48.26" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,47.17 L 136.42 47.17" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,46.09 L 136.42 46.09" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,45 L 136.42 45" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,43.92 L 136.42 43.92" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,42.83 L 136.42 42.83" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,41.74 L 136.42 41.74" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,40.66 L 136.42 40.66" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,39.57 L 136.42 39.57" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,38.49 L 136.42 38.49" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,37.4 L 136.42 37.4" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,36.32 L 136.42 36.32" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,35.23 L 136.42 35.23" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,34.14 L 136.42 34.14" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,33.06 L 136.42 33.06" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,31.97 L 136.42 31.97" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,30.89 L 136.42 30.89" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,29.8 L 136.42 29.8" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,28.72 L 136.42 28.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,27.63 L 136.42 27.63" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,26.54 L 136.42 26.54" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,25.46 L 136.42 25.46" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,24.37 L 136.42 24.37" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,23.29 L 136.42 23.29" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,22.2 L 136.42 22.2" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,21.11 L 136.42 21.11" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,20.03 L 136.42 20.03" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,18.94 L 136.42 18.94" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,17.86 L 136.42 17.86" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,16.77 L 136.42 16.77" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,15.69 L 136.42 15.69" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,14.6 L 136.42 14.6" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,13.51 L 136.42 13.51" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,12.43 L 136.42 12.43" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,11.34 L 136.42 11.34" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,10.26 L 136.42 10.26" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,9.17 L 136.42 9.17" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,8.09 L 136.42 8.09" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,7 L 136.42 7" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,5.91 L 136.42 5.91" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,4.83 L 136.42 4.83" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,3.74 L 136.42 3.74" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,2.66 L 136.42 2.66" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,1.57 L 136.42 1.57" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,0.49 L 136.42 0.49" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-0.6 L 136.42 -0.6" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-1.69 L 136.42 -1.69" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-2.77 L 136.42 -2.77" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-3.86 L 136.42 -3.86" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-4.94 L 136.42 -4.94" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-6.03 L 136.42 -6.03" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-7.11 L 136.42 -7.11" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-8.2 L 136.42 -8.2" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-9.29 L 136.42 -9.29" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-10.37 L 136.42 -10.37" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-11.46 L 136.42 -11.46" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-12.54 L 136.42 -12.54" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-13.63 L 136.42 -13.63" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-14.72 L 136.42 -14.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M19.63,50.43 L 136.42 50.43" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M19.63,28.72 L 136.42 28.72" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M19.63,7 L 136.42 7" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M19.63,-14.72 L 136.42 -14.72" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M19.63,50.43 L 136.42 50.43" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,48.26 L 136.42 48.26" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,46.09 L 136.42 46.09" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,43.92 L 136.42 43.92" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,41.74 L 136.42 41.74" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,39.57 L 136.42 39.57" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,37.4 L 136.42 37.4" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,35.23 L 136.42 35.23" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,33.06 L 136.42 33.06" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,30.89 L 136.42 30.89" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,28.72 L 136.42 28.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,26.54 L 136.42 26.54" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,24.37 L 136.42 24.37" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,22.2 L 136.42 22.2" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,20.03 L 136.42 20.03" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,17.86 L 136.42 17.86" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,15.69 L 136.42 15.69" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,13.51 L 136.42 13.51" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,11.34 L 136.42 11.34" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,9.17 L 136.42 9.17" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,7 L 136.42 7" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,4.83 L 136.42 4.83" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,2.66 L 136.42 2.66" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,0.49 L 136.42 0.49" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-1.69 L 136.42 -1.69" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-3.86 L 136.42 -3.86" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-6.03 L 136.42 -6.03" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-8.2 L 136.42 -8.2" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-10.37 L 136.42 -10.37" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-12.54 L 136.42 -12.54" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M19.63,-14.72 L 136.42 -14.72" gadfly:scale="5.0" visibility="hidden"/>
    </g>
    <g class="guide xgridlines yfixed" stroke-dasharray="0.5,0.5" stroke-width="0.2" stroke="#D0D0E0" id="img-87eecd28-29">
      <path fill="none" d="M-147.55,5 L -147.55 30.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M-91.16,5 L -91.16 30.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M-34.76,5 L -34.76 30.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M21.63,5 L 21.63 30.72" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M78.03,5 L 78.03 30.72" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M134.42,5 L 134.42 30.72" gadfly:scale="1.0" visibility="visible"/>
      <path fill="none" d="M190.82,5 L 190.82 30.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M247.21,5 L 247.21 30.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M303.61,5 L 303.61 30.72" gadfly:scale="1.0" visibility="hidden"/>
      <path fill="none" d="M-91.16,5 L -91.16 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-85.52,5 L -85.52 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-79.88,5 L -79.88 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-74.24,5 L -74.24 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-68.6,5 L -68.6 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-62.96,5 L -62.96 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-57.32,5 L -57.32 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-51.68,5 L -51.68 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-46.04,5 L -46.04 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-40.4,5 L -40.4 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-34.76,5 L -34.76 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-29.12,5 L -29.12 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-23.48,5 L -23.48 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-17.84,5 L -17.84 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-12.21,5 L -12.21 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-6.57,5 L -6.57 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-0.93,5 L -0.93 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M4.71,5 L 4.71 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M10.35,5 L 10.35 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M15.99,5 L 15.99 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M21.63,5 L 21.63 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M27.27,5 L 27.27 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M32.91,5 L 32.91 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M38.55,5 L 38.55 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M44.19,5 L 44.19 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M49.83,5 L 49.83 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M55.47,5 L 55.47 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M61.11,5 L 61.11 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M66.75,5 L 66.75 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M72.39,5 L 72.39 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M78.03,5 L 78.03 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M83.67,5 L 83.67 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M89.31,5 L 89.31 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M94.94,5 L 94.94 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M100.58,5 L 100.58 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M106.22,5 L 106.22 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M111.86,5 L 111.86 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M117.5,5 L 117.5 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M123.14,5 L 123.14 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M128.78,5 L 128.78 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M134.42,5 L 134.42 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M140.06,5 L 140.06 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M145.7,5 L 145.7 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M151.34,5 L 151.34 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M156.98,5 L 156.98 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M162.62,5 L 162.62 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M168.26,5 L 168.26 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M173.9,5 L 173.9 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M179.54,5 L 179.54 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M185.18,5 L 185.18 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M190.82,5 L 190.82 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M196.46,5 L 196.46 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M202.1,5 L 202.1 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M207.73,5 L 207.73 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M213.37,5 L 213.37 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M219.01,5 L 219.01 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M224.65,5 L 224.65 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M230.29,5 L 230.29 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M235.93,5 L 235.93 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M241.57,5 L 241.57 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M247.21,5 L 247.21 30.72" gadfly:scale="10.0" visibility="hidden"/>
      <path fill="none" d="M-91.16,5 L -91.16 30.72" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M21.63,5 L 21.63 30.72" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M134.42,5 L 134.42 30.72" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M247.21,5 L 247.21 30.72" gadfly:scale="0.5" visibility="hidden"/>
      <path fill="none" d="M-91.16,5 L -91.16 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-79.88,5 L -79.88 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-68.6,5 L -68.6 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-57.32,5 L -57.32 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-46.04,5 L -46.04 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-34.76,5 L -34.76 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-23.48,5 L -23.48 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-12.21,5 L -12.21 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M-0.93,5 L -0.93 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M10.35,5 L 10.35 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M21.63,5 L 21.63 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M32.91,5 L 32.91 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M44.19,5 L 44.19 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M55.47,5 L 55.47 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M66.75,5 L 66.75 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M78.03,5 L 78.03 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M89.31,5 L 89.31 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M100.58,5 L 100.58 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M111.86,5 L 111.86 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M123.14,5 L 123.14 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M134.42,5 L 134.42 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M145.7,5 L 145.7 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M156.98,5 L 156.98 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M168.26,5 L 168.26 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M179.54,5 L 179.54 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M190.82,5 L 190.82 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M202.1,5 L 202.1 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M213.37,5 L 213.37 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M224.65,5 L 224.65 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M235.93,5 L 235.93 30.72" gadfly:scale="5.0" visibility="hidden"/>
      <path fill="none" d="M247.21,5 L 247.21 30.72" gadfly:scale="5.0" visibility="hidden"/>
    </g>
    <g class="plotpanel" id="img-87eecd28-30">
      <g class="geometry" id="img-87eecd28-31">
        <g class="color_RGBA{Float32}(0.0f0,0.74736935f0,1.0f0,1.0f0)" stroke="#FFFFFF" stroke-width="0.3" fill="#00BFFF" id="img-87eecd28-32">
          <use xlink:href="#img-87eecd28-33" x="21.74" y="28.72"/>
          <use xlink:href="#img-87eecd28-33" x="21.97" y="27.95"/>
          <use xlink:href="#img-87eecd28-33" x="22.2" y="28.17"/>
          <use xlink:href="#img-87eecd28-33" x="22.42" y="26.98"/>
          <use xlink:href="#img-87eecd28-33" x="22.65" y="26.65"/>
          <use xlink:href="#img-87eecd28-33" x="22.87" y="27.19"/>
          <use xlink:href="#img-87eecd28-33" x="23.1" y="27.74"/>
          <use xlink:href="#img-87eecd28-33" x="23.32" y="26.87"/>
          <use xlink:href="#img-87eecd28-33" x="23.55" y="27.41"/>
          <use xlink:href="#img-87eecd28-33" x="23.77" y="26.54"/>
          <use xlink:href="#img-87eecd28-33" x="24" y="27.95"/>
          <use xlink:href="#img-87eecd28-33" x="24.23" y="27.09"/>
          <use xlink:href="#img-87eecd28-33" x="24.45" y="26.22"/>
          <use xlink:href="#img-87eecd28-33" x="24.68" y="16.66"/>
          <use xlink:href="#img-87eecd28-33" x="24.9" y="26.76"/>
          <use xlink:href="#img-87eecd28-33" x="25.13" y="17.21"/>
          <use xlink:href="#img-87eecd28-33" x="25.35" y="25.89"/>
          <use xlink:href="#img-87eecd28-33" x="25.58" y="27.3"/>
          <use xlink:href="#img-87eecd28-33" x="25.8" y="26.43"/>
          <use xlink:href="#img-87eecd28-33" x="26.03" y="25.02"/>
          <use xlink:href="#img-87eecd28-33" x="26.26" y="16.88"/>
          <use xlink:href="#img-87eecd28-33" x="26.48" y="25.57"/>
          <use xlink:href="#img-87eecd28-33" x="26.71" y="26.98"/>
          <use xlink:href="#img-87eecd28-33" x="26.93" y="17.42"/>
          <use xlink:href="#img-87eecd28-33" x="27.16" y="26.11"/>
          <use xlink:href="#img-87eecd28-33" x="27.38" y="26.11"/>
          <use xlink:href="#img-87eecd28-33" x="27.61" y="27.52"/>
          <use xlink:href="#img-87eecd28-33" x="27.84" y="16.55"/>
          <use xlink:href="#img-87eecd28-33" x="28.06" y="25.24"/>
          <use xlink:href="#img-87eecd28-33" x="28.29" y="25.24"/>
          <use xlink:href="#img-87eecd28-33" x="28.51" y="26.65"/>
          <use xlink:href="#img-87eecd28-33" x="28.74" y="17.1"/>
          <use xlink:href="#img-87eecd28-33" x="28.96" y="25.78"/>
          <use xlink:href="#img-87eecd28-33" x="29.19" y="25.78"/>
          <use xlink:href="#img-87eecd28-33" x="29.41" y="27.19"/>
          <use xlink:href="#img-87eecd28-33" x="29.64" y="17.64"/>
          <use xlink:href="#img-87eecd28-33" x="29.87" y="16.23"/>
          <use xlink:href="#img-87eecd28-33" x="30.09" y="27.19"/>
          <use xlink:href="#img-87eecd28-33" x="30.32" y="26.33"/>
          <use xlink:href="#img-87eecd28-33" x="30.54" y="24.91"/>
          <use xlink:href="#img-87eecd28-33" x="30.77" y="26.33"/>
          <use xlink:href="#img-87eecd28-33" x="30.99" y="16.77"/>
          <use xlink:href="#img-87eecd28-33" x="31.22" y="27.74"/>
          <use xlink:href="#img-87eecd28-33" x="31.44" y="25.46"/>
          <use xlink:href="#img-87eecd28-33" x="31.67" y="25.46"/>
          <use xlink:href="#img-87eecd28-33" x="31.9" y="18.73"/>
          <use xlink:href="#img-87eecd28-33" x="32.12" y="26.87"/>
          <use xlink:href="#img-87eecd28-33" x="32.35" y="17.31"/>
          <use xlink:href="#img-87eecd28-33" x="32.57" y="15.9"/>
          <use xlink:href="#img-87eecd28-33" x="32.8" y="26"/>
          <use xlink:href="#img-87eecd28-33" x="33.02" y="26"/>
          <use xlink:href="#img-87eecd28-33" x="33.25" y="19.27"/>
          <use xlink:href="#img-87eecd28-33" x="33.47" y="24.59"/>
          <use xlink:href="#img-87eecd28-33" x="33.7" y="17.86"/>
          <use xlink:href="#img-87eecd28-33" x="33.93" y="16.45"/>
          <use xlink:href="#img-87eecd28-33" x="34.15" y="21.22"/>
          <use xlink:href="#img-87eecd28-33" x="34.38" y="27.41"/>
          <use xlink:href="#img-87eecd28-33" x="34.6" y="25.13"/>
          <use xlink:href="#img-87eecd28-33" x="34.83" y="26.54"/>
          <use xlink:href="#img-87eecd28-33" x="35.05" y="25.13"/>
          <use xlink:href="#img-87eecd28-33" x="35.28" y="18.4"/>
          <use xlink:href="#img-87eecd28-33" x="35.5" y="23.72"/>
          <use xlink:href="#img-87eecd28-33" x="35.73" y="16.99"/>
          <use xlink:href="#img-87eecd28-33" x="35.96" y="23.72"/>
          <use xlink:href="#img-87eecd28-33" x="36.18" y="15.58"/>
          <use xlink:href="#img-87eecd28-33" x="36.41" y="25.67"/>
          <use xlink:href="#img-87eecd28-33" x="36.63" y="25.67"/>
          <use xlink:href="#img-87eecd28-33" x="36.86" y="24.26"/>
          <use xlink:href="#img-87eecd28-33" x="37.08" y="18.94"/>
          <use xlink:href="#img-87eecd28-33" x="37.31" y="24.26"/>
          <use xlink:href="#img-87eecd28-33" x="37.54" y="27.09"/>
          <use xlink:href="#img-87eecd28-33" x="37.76" y="17.53"/>
          <use xlink:href="#img-87eecd28-33" x="37.99" y="16.12"/>
          <use xlink:href="#img-87eecd28-33" x="38.21" y="16.12"/>
          <use xlink:href="#img-87eecd28-33" x="38.44" y="26.22"/>
          <use xlink:href="#img-87eecd28-33" x="38.66" y="27.09"/>
          <use xlink:href="#img-87eecd28-33" x="38.89" y="24.81"/>
          <use xlink:href="#img-87eecd28-33" x="39.11" y="19.49"/>
          <use xlink:href="#img-87eecd28-33" x="39.34" y="24.81"/>
          <use xlink:href="#img-87eecd28-33" x="39.57" y="22.85"/>
          <use xlink:href="#img-87eecd28-33" x="39.79" y="18.07"/>
          <use xlink:href="#img-87eecd28-33" x="40.02" y="26.22"/>
          <use xlink:href="#img-87eecd28-33" x="40.24" y="16.66"/>
          <use xlink:href="#img-87eecd28-33" x="40.47" y="21.44"/>
          <use xlink:href="#img-87eecd28-33" x="40.69" y="23.39"/>
          <use xlink:href="#img-87eecd28-33" x="40.92" y="15.25"/>
          <use xlink:href="#img-87eecd28-33" x="41.14" y="25.35"/>
          <use xlink:href="#img-87eecd28-33" x="41.37" y="20.03"/>
          <use xlink:href="#img-87eecd28-33" x="41.6" y="25.35"/>
          <use xlink:href="#img-87eecd28-33" x="41.82" y="25.35"/>
          <use xlink:href="#img-87eecd28-33" x="42.05" y="26.76"/>
          <use xlink:href="#img-87eecd28-33" x="42.27" y="18.62"/>
          <use xlink:href="#img-87eecd28-33" x="42.5" y="23.94"/>
          <use xlink:href="#img-87eecd28-33" x="42.72" y="23.94"/>
          <use xlink:href="#img-87eecd28-33" x="42.95" y="17.21"/>
          <use xlink:href="#img-87eecd28-33" x="43.17" y="23.94"/>
          <use xlink:href="#img-87eecd28-33" x="43.4" y="15.79"/>
          <use xlink:href="#img-87eecd28-33" x="43.63" y="15.79"/>
          <use xlink:href="#img-87eecd28-33" x="43.85" y="25.89"/>
          <use xlink:href="#img-87eecd28-33" x="44.08" y="15.79"/>
          <use xlink:href="#img-87eecd28-33" x="44.3" y="26.76"/>
          <use xlink:href="#img-87eecd28-33" x="44.53" y="24.48"/>
          <use xlink:href="#img-87eecd28-33" x="44.75" y="25.89"/>
          <use xlink:href="#img-87eecd28-33" x="44.98" y="19.16"/>
          <use xlink:href="#img-87eecd28-33" x="45.2" y="24.48"/>
          <use xlink:href="#img-87eecd28-33" x="45.43" y="24.48"/>
          <use xlink:href="#img-87eecd28-33" x="45.66" y="27.3"/>
          <use xlink:href="#img-87eecd28-33" x="45.88" y="17.75"/>
          <use xlink:href="#img-87eecd28-33" x="46.11" y="25.89"/>
          <use xlink:href="#img-87eecd28-33" x="46.33" y="23.07"/>
          <use xlink:href="#img-87eecd28-33" x="46.56" y="16.34"/>
          <use xlink:href="#img-87eecd28-33" x="46.78" y="21.11"/>
          <use xlink:href="#img-87eecd28-33" x="47.01" y="23.07"/>
          <use xlink:href="#img-87eecd28-33" x="47.23" y="27.3"/>
          <use xlink:href="#img-87eecd28-33" x="47.46" y="25.02"/>
          <use xlink:href="#img-87eecd28-33" x="47.69" y="14.93"/>
          <use xlink:href="#img-87eecd28-33" x="47.91" y="19.7"/>
          <use xlink:href="#img-87eecd28-33" x="48.14" y="14.93"/>
          <use xlink:href="#img-87eecd28-33" x="48.36" y="25.02"/>
          <use xlink:href="#img-87eecd28-33" x="48.59" y="23.07"/>
          <use xlink:href="#img-87eecd28-33" x="48.81" y="26.43"/>
          <use xlink:href="#img-87eecd28-33" x="49.04" y="18.29"/>
          <use xlink:href="#img-87eecd28-33" x="49.27" y="26.43"/>
          <use xlink:href="#img-87eecd28-33" x="49.49" y="23.61"/>
          <use xlink:href="#img-87eecd28-33" x="49.72" y="23.61"/>
          <use xlink:href="#img-87eecd28-33" x="49.94" y="21.66"/>
          <use xlink:href="#img-87eecd28-33" x="50.17" y="16.88"/>
          <use xlink:href="#img-87eecd28-33" x="50.39" y="23.61"/>
          <use xlink:href="#img-87eecd28-33" x="50.62" y="15.47"/>
          <use xlink:href="#img-87eecd28-33" x="50.84" y="15.47"/>
          <use xlink:href="#img-87eecd28-33" x="51.07" y="25.57"/>
          <use xlink:href="#img-87eecd28-33" x="51.3" y="20.25"/>
          <use xlink:href="#img-87eecd28-33" x="51.52" y="15.47"/>
          <use xlink:href="#img-87eecd28-33" x="51.75" y="26.43"/>
          <use xlink:href="#img-87eecd28-33" x="51.97" y="25.57"/>
          <use xlink:href="#img-87eecd28-33" x="52.2" y="24.15"/>
          <use xlink:href="#img-87eecd28-33" x="52.42" y="25.57"/>
          <use xlink:href="#img-87eecd28-33" x="52.65" y="18.83"/>
          <use xlink:href="#img-87eecd28-33" x="52.87" y="26.98"/>
          <use xlink:href="#img-87eecd28-33" x="53.1" y="24.15"/>
          <use xlink:href="#img-87eecd28-33" x="53.33" y="24.15"/>
          <use xlink:href="#img-87eecd28-33" x="53.55" y="22.2"/>
          <use xlink:href="#img-87eecd28-33" x="53.78" y="17.42"/>
          <use xlink:href="#img-87eecd28-33" x="54" y="24.15"/>
          <use xlink:href="#img-87eecd28-33" x="54.23" y="25.57"/>
          <use xlink:href="#img-87eecd28-33" x="54.45" y="16.01"/>
          <use xlink:href="#img-87eecd28-33" x="54.68" y="16.01"/>
          <use xlink:href="#img-87eecd28-33" x="54.9" y="22.74"/>
          <use xlink:href="#img-87eecd28-33" x="55.13" y="20.79"/>
          <use xlink:href="#img-87eecd28-33" x="55.36" y="16.01"/>
          <use xlink:href="#img-87eecd28-33" x="55.58" y="26.98"/>
          <use xlink:href="#img-87eecd28-33" x="55.81" y="24.15"/>
          <use xlink:href="#img-87eecd28-33" x="56.03" y="24.7"/>
          <use xlink:href="#img-87eecd28-33" x="56.26" y="24.7"/>
          <use xlink:href="#img-87eecd28-33" x="56.48" y="26.11"/>
          <use xlink:href="#img-87eecd28-33" x="56.71" y="19.38"/>
          <use xlink:href="#img-87eecd28-33" x="56.93" y="14.6"/>
          <use xlink:href="#img-87eecd28-33" x="57.16" y="24.7"/>
          <use xlink:href="#img-87eecd28-33" x="57.39" y="24.7"/>
          <use xlink:href="#img-87eecd28-33" x="57.61" y="22.74"/>
          <use xlink:href="#img-87eecd28-33" x="57.84" y="26.11"/>
          <use xlink:href="#img-87eecd28-33" x="58.06" y="17.97"/>
          <use xlink:href="#img-87eecd28-33" x="58.29" y="26.11"/>
          <use xlink:href="#img-87eecd28-33" x="58.51" y="13.19"/>
          <use xlink:href="#img-87eecd28-33" x="58.74" y="23.29"/>
          <use xlink:href="#img-87eecd28-33" x="58.97" y="26.11"/>
          <use xlink:href="#img-87eecd28-33" x="59.19" y="16.55"/>
          <use xlink:href="#img-87eecd28-33" x="59.42" y="21.33"/>
          <use xlink:href="#img-87eecd28-33" x="59.64" y="16.55"/>
          <use xlink:href="#img-87eecd28-33" x="59.87" y="23.29"/>
          <use xlink:href="#img-87eecd28-33" x="60.09" y="27.52"/>
          <use xlink:href="#img-87eecd28-33" x="60.32" y="15.14"/>
          <use xlink:href="#img-87eecd28-33" x="60.54" y="15.14"/>
          <use xlink:href="#img-87eecd28-33" x="60.77" y="15.14"/>
          <use xlink:href="#img-87eecd28-33" x="61" y="25.24"/>
          <use xlink:href="#img-87eecd28-33" x="61.22" y="19.92"/>
          <use xlink:href="#img-87eecd28-33" x="61.45" y="15.14"/>
          <use xlink:href="#img-87eecd28-33" x="61.67" y="25.24"/>
          <use xlink:href="#img-87eecd28-33" x="61.9" y="25.24"/>
          <use xlink:href="#img-87eecd28-33" x="62.12" y="23.29"/>
          <use xlink:href="#img-87eecd28-33" x="62.35" y="23.83"/>
          <use xlink:href="#img-87eecd28-33" x="62.57" y="23.83"/>
          <use xlink:href="#img-87eecd28-33" x="62.8" y="18.51"/>
          <use xlink:href="#img-87eecd28-33" x="63.03" y="23.83"/>
          <use xlink:href="#img-87eecd28-33" x="63.25" y="26.65"/>
          <use xlink:href="#img-87eecd28-33" x="63.48" y="23.83"/>
          <use xlink:href="#img-87eecd28-33" x="63.7" y="26.65"/>
          <use xlink:href="#img-87eecd28-33" x="63.93" y="23.83"/>
          <use xlink:href="#img-87eecd28-33" x="64.15" y="21.87"/>
          <use xlink:href="#img-87eecd28-33" x="64.38" y="22.42"/>
          <use xlink:href="#img-87eecd28-33" x="64.6" y="17.1"/>
          <use xlink:href="#img-87eecd28-33" x="64.83" y="23.83"/>
          <use xlink:href="#img-87eecd28-33" x="65.06" y="25.24"/>
          <use xlink:href="#img-87eecd28-33" x="65.28" y="15.69"/>
          <use xlink:href="#img-87eecd28-33" x="65.51" y="15.69"/>
          <use xlink:href="#img-87eecd28-33" x="65.73" y="15.69"/>
          <use xlink:href="#img-87eecd28-33" x="65.96" y="22.42"/>
          <use xlink:href="#img-87eecd28-33" x="66.18" y="20.46"/>
          <use xlink:href="#img-87eecd28-33" x="66.41" y="25.78"/>
          <use xlink:href="#img-87eecd28-33" x="66.63" y="15.69"/>
          <use xlink:href="#img-87eecd28-33" x="66.86" y="26.65"/>
          <use xlink:href="#img-87eecd28-33" x="67.09" y="26.65"/>
          <use xlink:href="#img-87eecd28-33" x="67.31" y="25.78"/>
          <use xlink:href="#img-87eecd28-33" x="67.54" y="24.37"/>
          <use xlink:href="#img-87eecd28-33" x="67.76" y="24.37"/>
          <use xlink:href="#img-87eecd28-33" x="67.99" y="14.27"/>
          <use xlink:href="#img-87eecd28-33" x="68.21" y="19.05"/>
          <use xlink:href="#img-87eecd28-33" x="68.44" y="14.27"/>
          <use xlink:href="#img-87eecd28-33" x="68.66" y="14.27"/>
          <use xlink:href="#img-87eecd28-33" x="68.89" y="24.37"/>
          <use xlink:href="#img-87eecd28-33" x="69.12" y="24.37"/>
          <use xlink:href="#img-87eecd28-33" x="69.34" y="25.24"/>
          <use xlink:href="#img-87eecd28-33" x="69.57" y="22.42"/>
          <use xlink:href="#img-87eecd28-33" x="69.79" y="22.96"/>
          <use xlink:href="#img-87eecd28-33" x="70.02" y="17.64"/>
          <use xlink:href="#img-87eecd28-33" x="70.24" y="24.37"/>
          <use xlink:href="#img-87eecd28-33" x="70.47" y="25.78"/>
          <use xlink:href="#img-87eecd28-33" x="70.7" y="25.78"/>
          <use xlink:href="#img-87eecd28-33" x="70.92" y="16.23"/>
          <use xlink:href="#img-87eecd28-33" x="71.15" y="22.96"/>
          <use xlink:href="#img-87eecd28-33" x="71.37" y="25.78"/>
          <use xlink:href="#img-87eecd28-33" x="71.6" y="22.96"/>
          <use xlink:href="#img-87eecd28-33" x="71.82" y="21.01"/>
          <use xlink:href="#img-87eecd28-33" x="72.05" y="18.18"/>
          <use xlink:href="#img-87eecd28-33" x="72.27" y="16.23"/>
          <use xlink:href="#img-87eecd28-33" x="72.5" y="22.96"/>
          <use xlink:href="#img-87eecd28-33" x="72.73" y="27.19"/>
          <use xlink:href="#img-87eecd28-33" x="72.95" y="24.37"/>
          <use xlink:href="#img-87eecd28-33" x="73.18" y="14.82"/>
          <use xlink:href="#img-87eecd28-33" x="73.4" y="14.82"/>
          <use xlink:href="#img-87eecd28-33" x="73.63" y="24.91"/>
          <use xlink:href="#img-87eecd28-33" x="73.85" y="14.82"/>
          <use xlink:href="#img-87eecd28-33" x="74.08" y="24.91"/>
          <use xlink:href="#img-87eecd28-33" x="74.3" y="19.59"/>
          <use xlink:href="#img-87eecd28-33" x="74.53" y="26.33"/>
          <use xlink:href="#img-87eecd28-33" x="74.76" y="14.82"/>
          <use xlink:href="#img-87eecd28-33" x="74.98" y="24.91"/>
          <use xlink:href="#img-87eecd28-33" x="75.21" y="25.78"/>
          <use xlink:href="#img-87eecd28-33" x="75.43" y="24.91"/>
          <use xlink:href="#img-87eecd28-33" x="75.66" y="22.96"/>
          <use xlink:href="#img-87eecd28-33" x="75.88" y="23.5"/>
          <use xlink:href="#img-87eecd28-33" x="76.11" y="26.33"/>
          <use xlink:href="#img-87eecd28-33" x="76.33" y="18.18"/>
          <use xlink:href="#img-87eecd28-33" x="76.56" y="13.41"/>
          <use xlink:href="#img-87eecd28-33" x="76.79" y="23.5"/>
          <use xlink:href="#img-87eecd28-33" x="77.01" y="13.41"/>
          <use xlink:href="#img-87eecd28-33" x="77.24" y="23.5"/>
          <use xlink:href="#img-87eecd28-33" x="77.46" y="18.18"/>
          <use xlink:href="#img-87eecd28-33" x="77.69" y="26.33"/>
          <use xlink:href="#img-87eecd28-33" x="77.91" y="23.5"/>
          <use xlink:href="#img-87eecd28-33" x="78.14" y="16.77"/>
          <use xlink:href="#img-87eecd28-33" x="78.36" y="21.55"/>
          <use xlink:href="#img-87eecd28-33" x="78.59" y="22.09"/>
          <use xlink:href="#img-87eecd28-33" x="78.82" y="24.91"/>
          <use xlink:href="#img-87eecd28-33" x="79.04" y="23.5"/>
          <use xlink:href="#img-87eecd28-33" x="79.27" y="22.09"/>
          <use xlink:href="#img-87eecd28-33" x="79.49" y="24.91"/>
          <use xlink:href="#img-87eecd28-33" x="79.72" y="15.36"/>
          <use xlink:href="#img-87eecd28-33" x="79.94" y="15.36"/>
          <use xlink:href="#img-87eecd28-33" x="80.17" y="22.09"/>
          <use xlink:href="#img-87eecd28-33" x="80.4" y="15.36"/>
          <use xlink:href="#img-87eecd28-33" x="80.62" y="15.36"/>
          <use xlink:href="#img-87eecd28-33" x="80.85" y="25.46"/>
          <use xlink:href="#img-87eecd28-33" x="81.07" y="20.14"/>
          <use xlink:href="#img-87eecd28-33" x="81.3" y="25.46"/>
          <use xlink:href="#img-87eecd28-33" x="81.52" y="15.36"/>
          <use xlink:href="#img-87eecd28-33" x="81.75" y="25.46"/>
          <use xlink:href="#img-87eecd28-33" x="81.97" y="26.33"/>
          <use xlink:href="#img-87eecd28-33" x="82.2" y="26.33"/>
          <use xlink:href="#img-87eecd28-33" x="82.43" y="23.5"/>
          <use xlink:href="#img-87eecd28-33" x="82.65" y="24.05"/>
          <use xlink:href="#img-87eecd28-33" x="82.88" y="13.95"/>
          <use xlink:href="#img-87eecd28-33" x="83.1" y="24.05"/>
          <use xlink:href="#img-87eecd28-33" x="83.33" y="25.46"/>
          <use xlink:href="#img-87eecd28-33" x="83.55" y="18.73"/>
          <use xlink:href="#img-87eecd28-33" x="83.78" y="24.05"/>
          <use xlink:href="#img-87eecd28-33" x="84" y="13.95"/>
          <use xlink:href="#img-87eecd28-33" x="84.23" y="25.46"/>
          <use xlink:href="#img-87eecd28-33" x="84.46" y="24.05"/>
          <use xlink:href="#img-87eecd28-33" x="84.68" y="19.27"/>
          <use xlink:href="#img-87eecd28-33" x="84.91" y="24.05"/>
          <use xlink:href="#img-87eecd28-33" x="85.13" y="24.05"/>
          <use xlink:href="#img-87eecd28-33" x="85.36" y="26.87"/>
          <use xlink:href="#img-87eecd28-33" x="85.58" y="22.09"/>
          <use xlink:href="#img-87eecd28-33" x="85.81" y="22.63"/>
          <use xlink:href="#img-87eecd28-33" x="86.03" y="25.46"/>
          <use xlink:href="#img-87eecd28-33" x="86.26" y="17.31"/>
          <use xlink:href="#img-87eecd28-33" x="86.49" y="24.05"/>
          <use xlink:href="#img-87eecd28-33" x="86.71" y="25.46"/>
          <use xlink:href="#img-87eecd28-33" x="86.94" y="25.46"/>
          <use xlink:href="#img-87eecd28-33" x="87.16" y="15.9"/>
          <use xlink:href="#img-87eecd28-33" x="87.39" y="25.46"/>
          <use xlink:href="#img-87eecd28-33" x="87.61" y="22.63"/>
          <use xlink:href="#img-87eecd28-33" x="87.84" y="15.9"/>
          <use xlink:href="#img-87eecd28-33" x="88.06" y="15.9"/>
          <use xlink:href="#img-87eecd28-33" x="88.29" y="22.63"/>
          <use xlink:href="#img-87eecd28-33" x="88.52" y="20.68"/>
          <use xlink:href="#img-87eecd28-33" x="88.74" y="20.68"/>
          <use xlink:href="#img-87eecd28-33" x="88.97" y="26"/>
          <use xlink:href="#img-87eecd28-33" x="89.19" y="15.9"/>
          <use xlink:href="#img-87eecd28-33" x="89.42" y="22.63"/>
          <use xlink:href="#img-87eecd28-33" x="89.64" y="21.22"/>
          <use xlink:href="#img-87eecd28-33" x="89.87" y="26.87"/>
          <use xlink:href="#img-87eecd28-33" x="90.1" y="24.05"/>
          <use xlink:href="#img-87eecd28-33" x="90.32" y="14.49"/>
          <use xlink:href="#img-87eecd28-33" x="90.55" y="24.59"/>
          <use xlink:href="#img-87eecd28-33" x="90.77" y="24.59"/>
          <use xlink:href="#img-87eecd28-33" x="91" y="21.22"/>
          <use xlink:href="#img-87eecd28-33" x="91.22" y="14.49"/>
          <use xlink:href="#img-87eecd28-33" x="91.45" y="14.49"/>
          <use xlink:href="#img-87eecd28-33" x="91.67" y="19.27"/>
          <use xlink:href="#img-87eecd28-33" x="91.9" y="14.49"/>
          <use xlink:href="#img-87eecd28-33" x="92.13" y="26"/>
          <use xlink:href="#img-87eecd28-33" x="92.35" y="14.49"/>
          <use xlink:href="#img-87eecd28-33" x="92.58" y="24.59"/>
          <use xlink:href="#img-87eecd28-33" x="92.8" y="24.59"/>
          <use xlink:href="#img-87eecd28-33" x="93.03" y="25.46"/>
          <use xlink:href="#img-87eecd28-33" x="93.25" y="25.46"/>
          <use xlink:href="#img-87eecd28-33" x="93.48" y="22.63"/>
          <use xlink:href="#img-87eecd28-33" x="93.7" y="14.49"/>
          <use xlink:href="#img-87eecd28-33" x="93.93" y="23.18"/>
          <use xlink:href="#img-87eecd28-33" x="94.16" y="26"/>
          <use xlink:href="#img-87eecd28-33" x="94.38" y="17.86"/>
          <use xlink:href="#img-87eecd28-33" x="94.61" y="24.59"/>
          <use xlink:href="#img-87eecd28-33" x="94.83" y="13.08"/>
          <use xlink:href="#img-87eecd28-33" x="95.06" y="17.86"/>
          <use xlink:href="#img-87eecd28-33" x="95.28" y="26"/>
          <use xlink:href="#img-87eecd28-33" x="95.51" y="13.08"/>
          <use xlink:href="#img-87eecd28-33" x="95.73" y="23.18"/>
          <use xlink:href="#img-87eecd28-33" x="95.96" y="23.18"/>
          <use xlink:href="#img-87eecd28-33" x="96.19" y="16.45"/>
          <use xlink:href="#img-87eecd28-33" x="96.41" y="26"/>
          <use xlink:href="#img-87eecd28-33" x="96.64" y="23.18"/>
          <use xlink:href="#img-87eecd28-33" x="96.86" y="13.08"/>
          <use xlink:href="#img-87eecd28-33" x="97.09" y="21.22"/>
          <use xlink:href="#img-87eecd28-33" x="97.31" y="18.4"/>
          <use xlink:href="#img-87eecd28-33" x="97.54" y="21.77"/>
          <use xlink:href="#img-87eecd28-33" x="97.76" y="16.45"/>
          <use xlink:href="#img-87eecd28-33" x="97.99" y="23.18"/>
          <use xlink:href="#img-87eecd28-33" x="98.22" y="21.77"/>
          <use xlink:href="#img-87eecd28-33" x="98.44" y="21.77"/>
          <use xlink:href="#img-87eecd28-33" x="98.67" y="24.59"/>
          <use xlink:href="#img-87eecd28-33" x="98.89" y="15.03"/>
          <use xlink:href="#img-87eecd28-33" x="99.12" y="24.59"/>
          <use xlink:href="#img-87eecd28-33" x="99.34" y="15.03"/>
          <use xlink:href="#img-87eecd28-33" x="99.57" y="15.03"/>
          <use xlink:href="#img-87eecd28-33" x="99.79" y="25.13"/>
          <use xlink:href="#img-87eecd28-33" x="100.02" y="15.03"/>
          <use xlink:href="#img-87eecd28-33" x="100.25" y="15.03"/>
          <use xlink:href="#img-87eecd28-33" x="100.47" y="21.77"/>
          <use xlink:href="#img-87eecd28-33" x="100.7" y="19.81"/>
          <use xlink:href="#img-87eecd28-33" x="100.92" y="10.26"/>
          <use xlink:href="#img-87eecd28-33" x="101.15" y="25.13"/>
          <use xlink:href="#img-87eecd28-33" x="101.37" y="15.03"/>
          <use xlink:href="#img-87eecd28-33" x="101.6" y="25.13"/>
          <use xlink:href="#img-87eecd28-33" x="101.83" y="21.77"/>
          <use xlink:href="#img-87eecd28-33" x="102.05" y="26"/>
          <use xlink:href="#img-87eecd28-33" x="102.28" y="26"/>
          <use xlink:href="#img-87eecd28-33" x="102.5" y="25.13"/>
          <use xlink:href="#img-87eecd28-33" x="102.73" y="23.18"/>
          <use xlink:href="#img-87eecd28-33" x="102.95" y="23.72"/>
          <use xlink:href="#img-87eecd28-33" x="103.18" y="23.72"/>
          <use xlink:href="#img-87eecd28-33" x="103.4" y="26.54"/>
          <use xlink:href="#img-87eecd28-33" x="103.63" y="23.72"/>
          <use xlink:href="#img-87eecd28-33" x="103.86" y="25.13"/>
          <use xlink:href="#img-87eecd28-33" x="104.08" y="13.62"/>
          <use xlink:href="#img-87eecd28-33" x="104.31" y="18.4"/>
          <use xlink:href="#img-87eecd28-33" x="104.53" y="23.72"/>
          <use xlink:href="#img-87eecd28-33" x="104.76" y="13.62"/>
          <use xlink:href="#img-87eecd28-33" x="104.98" y="26.54"/>
          <use xlink:href="#img-87eecd28-33" x="105.21" y="23.72"/>
          <use xlink:href="#img-87eecd28-33" x="105.43" y="18.4"/>
          <use xlink:href="#img-87eecd28-33" x="105.66" y="18.94"/>
          <use xlink:href="#img-87eecd28-33" x="105.89" y="23.72"/>
          <use xlink:href="#img-87eecd28-33" x="106.11" y="23.72"/>
          <use xlink:href="#img-87eecd28-33" x="106.34" y="13.62"/>
          <use xlink:href="#img-87eecd28-33" x="106.56" y="26.54"/>
          <use xlink:href="#img-87eecd28-33" x="106.79" y="21.77"/>
          <use xlink:href="#img-87eecd28-33" x="107.01" y="16.99"/>
          <use xlink:href="#img-87eecd28-33" x="107.24" y="22.31"/>
          <use xlink:href="#img-87eecd28-33" x="107.46" y="25.13"/>
          <use xlink:href="#img-87eecd28-33" x="107.69" y="12.21"/>
          <use xlink:href="#img-87eecd28-33" x="107.92" y="23.72"/>
          <use xlink:href="#img-87eecd28-33" x="108.14" y="22.31"/>
          <use xlink:href="#img-87eecd28-33" x="108.37" y="25.13"/>
          <use xlink:href="#img-87eecd28-33" x="108.59" y="25.13"/>
          <use xlink:href="#img-87eecd28-33" x="108.82" y="15.58"/>
          <use xlink:href="#img-87eecd28-33" x="109.04" y="12.21"/>
          <use xlink:href="#img-87eecd28-33" x="109.27" y="25.13"/>
          <use xlink:href="#img-87eecd28-33" x="109.49" y="22.31"/>
          <use xlink:href="#img-87eecd28-33" x="109.72" y="15.58"/>
          <use xlink:href="#img-87eecd28-33" x="109.95" y="15.58"/>
          <use xlink:href="#img-87eecd28-33" x="110.17" y="15.58"/>
          <use xlink:href="#img-87eecd28-33" x="110.4" y="22.31"/>
          <use xlink:href="#img-87eecd28-33" x="110.62" y="25.67"/>
          <use xlink:href="#img-87eecd28-33" x="110.85" y="20.35"/>
          <use xlink:href="#img-87eecd28-33" x="111.07" y="20.35"/>
          <use xlink:href="#img-87eecd28-33" x="111.3" y="17.53"/>
          <use xlink:href="#img-87eecd28-33" x="111.53" y="15.58"/>
          <use xlink:href="#img-87eecd28-33" x="111.75" y="20.9"/>
          <use xlink:href="#img-87eecd28-33" x="111.98" y="22.31"/>
          <use xlink:href="#img-87eecd28-33" x="112.2" y="26.54"/>
          <use xlink:href="#img-87eecd28-33" x="112.43" y="26.54"/>
          <use xlink:href="#img-87eecd28-33" x="112.65" y="20.9"/>
          <use xlink:href="#img-87eecd28-33" x="112.88" y="23.72"/>
          <use xlink:href="#img-87eecd28-33" x="113.1" y="14.17"/>
          <use xlink:href="#img-87eecd28-33" x="113.33" y="24.26"/>
          <use xlink:href="#img-87eecd28-33" x="113.56" y="14.17"/>
          <use xlink:href="#img-87eecd28-33" x="113.78" y="24.26"/>
          <use xlink:href="#img-87eecd28-33" x="114.01" y="24.26"/>
          <use xlink:href="#img-87eecd28-33" x="114.23" y="25.67"/>
          <use xlink:href="#img-87eecd28-33" x="114.46" y="14.17"/>
          <use xlink:href="#img-87eecd28-33" x="114.68" y="14.17"/>
          <use xlink:href="#img-87eecd28-33" x="114.91" y="24.26"/>
          <use xlink:href="#img-87eecd28-33" x="115.13" y="18.94"/>
          <use xlink:href="#img-87eecd28-33" x="115.36" y="14.17"/>
          <use xlink:href="#img-87eecd28-33" x="115.59" y="25.67"/>
          <use xlink:href="#img-87eecd28-33" x="115.81" y="14.17"/>
          <use xlink:href="#img-87eecd28-33" x="116.04" y="24.26"/>
          <use xlink:href="#img-87eecd28-33" x="116.26" y="19.49"/>
          <use xlink:href="#img-87eecd28-33" x="116.49" y="24.26"/>
          <use xlink:href="#img-87eecd28-33" x="116.71" y="24.26"/>
          <use xlink:href="#img-87eecd28-33" x="116.94" y="24.26"/>
          <use xlink:href="#img-87eecd28-33" x="117.16" y="25.13"/>
          <use xlink:href="#img-87eecd28-33" x="117.39" y="22.31"/>
          <use xlink:href="#img-87eecd28-33" x="117.62" y="22.31"/>
          <use xlink:href="#img-87eecd28-33" x="117.84" y="27.09"/>
          <use xlink:href="#img-87eecd28-33" x="118.07" y="22.85"/>
          <use xlink:href="#img-87eecd28-33" x="118.29" y="25.67"/>
          <use xlink:href="#img-87eecd28-33" x="118.52" y="12.75"/>
          <use xlink:href="#img-87eecd28-33" x="118.74" y="17.53"/>
          <use xlink:href="#img-87eecd28-33" x="118.97" y="24.26"/>
          <use xlink:href="#img-87eecd28-33" x="119.19" y="12.75"/>
          <use xlink:href="#img-87eecd28-33" x="119.42" y="25.67"/>
          <use xlink:href="#img-87eecd28-33" x="119.65" y="25.67"/>
          <use xlink:href="#img-87eecd28-33" x="119.87" y="9.39"/>
          <use xlink:href="#img-87eecd28-33" x="120.1" y="12.75"/>
          <use xlink:href="#img-87eecd28-33" x="120.32" y="25.67"/>
          <use xlink:href="#img-87eecd28-33" x="120.55" y="22.85"/>
          <use xlink:href="#img-87eecd28-33" x="120.77" y="12.75"/>
          <use xlink:href="#img-87eecd28-33" x="121" y="16.12"/>
          <use xlink:href="#img-87eecd28-33" x="121.22" y="25.67"/>
          <use xlink:href="#img-87eecd28-33" x="121.45" y="16.12"/>
          <use xlink:href="#img-87eecd28-33" x="121.68" y="22.85"/>
          <use xlink:href="#img-87eecd28-33" x="121.9" y="12.75"/>
          <use xlink:href="#img-87eecd28-33" x="122.13" y="23.72"/>
          <use xlink:href="#img-87eecd28-33" x="122.35" y="20.9"/>
          <use xlink:href="#img-87eecd28-33" x="122.58" y="18.07"/>
          <use xlink:href="#img-87eecd28-33" x="122.8" y="21.44"/>
          <use xlink:href="#img-87eecd28-33" x="123.03" y="16.12"/>
          <use xlink:href="#img-87eecd28-33" x="123.26" y="22.85"/>
          <use xlink:href="#img-87eecd28-33" x="123.48" y="16.12"/>
          <use xlink:href="#img-87eecd28-33" x="123.71" y="21.44"/>
          <use xlink:href="#img-87eecd28-33" x="123.93" y="22.85"/>
          <use xlink:href="#img-87eecd28-33" x="124.16" y="27.09"/>
          <use xlink:href="#img-87eecd28-33" x="124.38" y="24.26"/>
          <use xlink:href="#img-87eecd28-33" x="124.61" y="14.71"/>
          <use xlink:href="#img-87eecd28-33" x="124.83" y="14.71"/>
          <use xlink:href="#img-87eecd28-33" x="125.06" y="24.81"/>
          <use xlink:href="#img-87eecd28-33" x="125.29" y="14.71"/>
          <use xlink:href="#img-87eecd28-33" x="125.51" y="14.71"/>
          <use xlink:href="#img-87eecd28-33" x="125.74" y="21.44"/>
          <use xlink:href="#img-87eecd28-33" x="125.96" y="14.71"/>
          <use xlink:href="#img-87eecd28-33" x="126.19" y="16.12"/>
          <use xlink:href="#img-87eecd28-33" x="126.41" y="14.71"/>
          <use xlink:href="#img-87eecd28-33" x="126.64" y="24.81"/>
          <use xlink:href="#img-87eecd28-33" x="126.86" y="19.49"/>
          <use xlink:href="#img-87eecd28-33" x="127.09" y="14.71"/>
          <use xlink:href="#img-87eecd28-33" x="127.32" y="9.93"/>
          <use xlink:href="#img-87eecd28-33" x="127.54" y="19.49"/>
          <use xlink:href="#img-87eecd28-33" x="127.77" y="14.71"/>
          <use xlink:href="#img-87eecd28-33" x="127.99" y="24.81"/>
          <use xlink:href="#img-87eecd28-33" x="128.22" y="24.81"/>
          <use xlink:href="#img-87eecd28-33" x="128.44" y="24.81"/>
          <use xlink:href="#img-87eecd28-33" x="128.67" y="24.81"/>
          <use xlink:href="#img-87eecd28-33" x="128.89" y="25.67"/>
          <use xlink:href="#img-87eecd28-33" x="129.12" y="25.67"/>
          <use xlink:href="#img-87eecd28-33" x="129.35" y="25.67"/>
          <use xlink:href="#img-87eecd28-33" x="129.57" y="22.85"/>
          <use xlink:href="#img-87eecd28-33" x="129.8" y="14.71"/>
          <use xlink:href="#img-87eecd28-33" x="130.02" y="23.39"/>
          <use xlink:href="#img-87eecd28-33" x="130.25" y="23.39"/>
          <use xlink:href="#img-87eecd28-33" x="130.47" y="26.22"/>
          <use xlink:href="#img-87eecd28-33" x="130.7" y="13.3"/>
          <use xlink:href="#img-87eecd28-33" x="130.92" y="23.39"/>
          <use xlink:href="#img-87eecd28-33" x="131.15" y="24.81"/>
          <use xlink:href="#img-87eecd28-33" x="131.38" y="18.07"/>
          <use xlink:href="#img-87eecd28-33" x="131.6" y="13.3"/>
          <use xlink:href="#img-87eecd28-33" x="131.83" y="18.07"/>
          <use xlink:href="#img-87eecd28-33" x="132.05" y="23.39"/>
          <use xlink:href="#img-87eecd28-33" x="132.28" y="26.22"/>
          <use xlink:href="#img-87eecd28-33" x="132.5" y="13.3"/>
          <use xlink:href="#img-87eecd28-33" x="132.73" y="26.22"/>
          <use xlink:href="#img-87eecd28-33" x="132.96" y="24.81"/>
          <use xlink:href="#img-87eecd28-33" x="133.18" y="23.39"/>
          <use xlink:href="#img-87eecd28-33" x="133.41" y="18.07"/>
          <use xlink:href="#img-87eecd28-33" x="133.63" y="18.62"/>
          <use xlink:href="#img-87eecd28-33" x="133.86" y="26.22"/>
          <use xlink:href="#img-87eecd28-33" x="134.08" y="23.39"/>
          <use xlink:href="#img-87eecd28-33" x="134.31" y="23.39"/>
        </g>
      </g>
    </g>
    <g opacity="0" class="guide zoomslider" stroke="#000000" stroke-opacity="0.000" id="img-87eecd28-34">
      <g fill="#EAEAEA" stroke-width="0.3" stroke-opacity="0" stroke="#6A6A6A" id="img-87eecd28-35">
        <rect x="129.42" y="8" width="4" height="4"/>
        <g class="button_logo" fill="#6A6A6A" id="img-87eecd28-36">
          <path d="M130.22,9.6 L 131.02 9.6 131.02 8.8 131.82 8.8 131.82 9.6 132.62 9.6 132.62 10.4 131.82 10.4 131.82 11.2 131.02 11.2 131.02 10.4 130.22 10.4 z"/>
        </g>
      </g>
      <g fill="#EAEAEA" id="img-87eecd28-37">
        <rect x="109.92" y="8" width="19" height="4"/>
      </g>
      <g class="zoomslider_thumb" fill="#6A6A6A" id="img-87eecd28-38">
        <rect x="118.42" y="8" width="2" height="4"/>
      </g>
      <g fill="#EAEAEA" stroke-width="0.3" stroke-opacity="0" stroke="#6A6A6A" id="img-87eecd28-39">
        <rect x="105.42" y="8" width="4" height="4"/>
        <g class="button_logo" fill="#6A6A6A" id="img-87eecd28-40">
          <path d="M106.22,9.6 L 108.62 9.6 108.62 10.4 106.22 10.4 z"/>
        </g>
      </g>
    </g>
  </g>
</g>
  <g class="guide ylabels" font-size="2.82" font-family="'PT Sans Caption','Helvetica Neue','Helvetica',sans-serif" fill="#6C606B" id="img-87eecd28-41">
    <text x="18.63" y="55.86" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">-250</text>
    <text x="18.63" y="50.43" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">-200</text>
    <text x="18.63" y="45" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">-150</text>
    <text x="18.63" y="39.57" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">-100</text>
    <text x="18.63" y="34.14" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">-50</text>
    <text x="18.63" y="28.72" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="visible">0</text>
    <text x="18.63" y="23.29" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="visible">50</text>
    <text x="18.63" y="17.86" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="visible">100</text>
    <text x="18.63" y="12.43" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="visible">150</text>
    <text x="18.63" y="7" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="visible">200</text>
    <text x="18.63" y="1.57" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">250</text>
    <text x="18.63" y="-3.86" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">300</text>
    <text x="18.63" y="-9.29" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">350</text>
    <text x="18.63" y="-14.72" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">400</text>
    <text x="18.63" y="-20.14" text-anchor="end" dy="0.35em" gadfly:scale="1.0" visibility="hidden">450</text>
    <text x="18.63" y="50.43" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-200</text>
    <text x="18.63" y="49.34" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-190</text>
    <text x="18.63" y="48.26" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-180</text>
    <text x="18.63" y="47.17" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-170</text>
    <text x="18.63" y="46.09" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-160</text>
    <text x="18.63" y="45" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-150</text>
    <text x="18.63" y="43.92" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-140</text>
    <text x="18.63" y="42.83" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-130</text>
    <text x="18.63" y="41.74" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-120</text>
    <text x="18.63" y="40.66" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-110</text>
    <text x="18.63" y="39.57" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-100</text>
    <text x="18.63" y="38.49" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-90</text>
    <text x="18.63" y="37.4" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-80</text>
    <text x="18.63" y="36.32" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-70</text>
    <text x="18.63" y="35.23" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-60</text>
    <text x="18.63" y="34.14" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-50</text>
    <text x="18.63" y="33.06" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-40</text>
    <text x="18.63" y="31.97" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-30</text>
    <text x="18.63" y="30.89" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-20</text>
    <text x="18.63" y="29.8" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">-10</text>
    <text x="18.63" y="28.72" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">0</text>
    <text x="18.63" y="27.63" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">10</text>
    <text x="18.63" y="26.54" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">20</text>
    <text x="18.63" y="25.46" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">30</text>
    <text x="18.63" y="24.37" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">40</text>
    <text x="18.63" y="23.29" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">50</text>
    <text x="18.63" y="22.2" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">60</text>
    <text x="18.63" y="21.11" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">70</text>
    <text x="18.63" y="20.03" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">80</text>
    <text x="18.63" y="18.94" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">90</text>
    <text x="18.63" y="17.86" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">100</text>
    <text x="18.63" y="16.77" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">110</text>
    <text x="18.63" y="15.69" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">120</text>
    <text x="18.63" y="14.6" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">130</text>
    <text x="18.63" y="13.51" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">140</text>
    <text x="18.63" y="12.43" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">150</text>
    <text x="18.63" y="11.34" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">160</text>
    <text x="18.63" y="10.26" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">170</text>
    <text x="18.63" y="9.17" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">180</text>
    <text x="18.63" y="8.09" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">190</text>
    <text x="18.63" y="7" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">200</text>
    <text x="18.63" y="5.91" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">210</text>
    <text x="18.63" y="4.83" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">220</text>
    <text x="18.63" y="3.74" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">230</text>
    <text x="18.63" y="2.66" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">240</text>
    <text x="18.63" y="1.57" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">250</text>
    <text x="18.63" y="0.49" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">260</text>
    <text x="18.63" y="-0.6" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">270</text>
    <text x="18.63" y="-1.69" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">280</text>
    <text x="18.63" y="-2.77" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">290</text>
    <text x="18.63" y="-3.86" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">300</text>
    <text x="18.63" y="-4.94" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">310</text>
    <text x="18.63" y="-6.03" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">320</text>
    <text x="18.63" y="-7.11" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">330</text>
    <text x="18.63" y="-8.2" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">340</text>
    <text x="18.63" y="-9.29" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">350</text>
    <text x="18.63" y="-10.37" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">360</text>
    <text x="18.63" y="-11.46" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">370</text>
    <text x="18.63" y="-12.54" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">380</text>
    <text x="18.63" y="-13.63" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">390</text>
    <text x="18.63" y="-14.72" text-anchor="end" dy="0.35em" gadfly:scale="10.0" visibility="hidden">400</text>
    <text x="18.63" y="50.43" text-anchor="end" dy="0.35em" gadfly:scale="0.5" visibility="hidden">-200</text>
    <text x="18.63" y="28.72" text-anchor="end" dy="0.35em" gadfly:scale="0.5" visibility="hidden">0</text>
    <text x="18.63" y="7" text-anchor="end" dy="0.35em" gadfly:scale="0.5" visibility="hidden">200</text>
    <text x="18.63" y="-14.72" text-anchor="end" dy="0.35em" gadfly:scale="0.5" visibility="hidden">400</text>
    <text x="18.63" y="50.43" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-200</text>
    <text x="18.63" y="48.26" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-180</text>
    <text x="18.63" y="46.09" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-160</text>
    <text x="18.63" y="43.92" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-140</text>
    <text x="18.63" y="41.74" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-120</text>
    <text x="18.63" y="39.57" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-100</text>
    <text x="18.63" y="37.4" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-80</text>
    <text x="18.63" y="35.23" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-60</text>
    <text x="18.63" y="33.06" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-40</text>
    <text x="18.63" y="30.89" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">-20</text>
    <text x="18.63" y="28.72" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">0</text>
    <text x="18.63" y="26.54" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">20</text>
    <text x="18.63" y="24.37" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">40</text>
    <text x="18.63" y="22.2" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">60</text>
    <text x="18.63" y="20.03" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">80</text>
    <text x="18.63" y="17.86" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">100</text>
    <text x="18.63" y="15.69" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">120</text>
    <text x="18.63" y="13.51" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">140</text>
    <text x="18.63" y="11.34" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">160</text>
    <text x="18.63" y="9.17" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">180</text>
    <text x="18.63" y="7" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">200</text>
    <text x="18.63" y="4.83" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">220</text>
    <text x="18.63" y="2.66" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">240</text>
    <text x="18.63" y="0.49" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">260</text>
    <text x="18.63" y="-1.69" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">280</text>
    <text x="18.63" y="-3.86" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">300</text>
    <text x="18.63" y="-6.03" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">320</text>
    <text x="18.63" y="-8.2" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">340</text>
    <text x="18.63" y="-10.37" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">360</text>
    <text x="18.63" y="-12.54" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">380</text>
    <text x="18.63" y="-14.72" text-anchor="end" dy="0.35em" gadfly:scale="5.0" visibility="hidden">400</text>
  </g>
  <g font-size="3.88" font-family="'PT Sans','Helvetica Neue','Helvetica',sans-serif" fill="#564A55" stroke="#000000" stroke-opacity="0.000" id="img-87eecd28-42">
    <text x="8.81" y="15.86" text-anchor="middle" dy="0.35em" transform="rotate(-90, 8.81, 17.86)">NumofSteps</text>
  </g>
</g>
<defs>
  <clipPath id="img-87eecd28-25">
  <path d="M19.63,5 L 136.42 5 136.42 30.72 19.63 30.72" />
</clipPath>
  <clipPath id="img-87eecd28-4">
  <path d="M19.63,55 L 136.42 55 136.42 80.72 19.63 80.72" />
</clipPath>
  <g id="img-87eecd28-12">
    <circle cx="0" cy="0" r="0.9"/>
  </g>
  <g id="img-87eecd28-33">
    <circle cx="0" cy="0" r="0.9"/>
  </g>
</defs>
<script> <![CDATA[
(function(N){var k=/[\.\/]/,L=/\s*,\s*/,C=function(a,d){return a-d},a,v,y={n:{}},M=function(){for(var a=0,d=this.length;a<d;a++)if("undefined"!=typeof this[a])return this[a]},A=function(){for(var a=this.length;--a;)if("undefined"!=typeof this[a])return this[a]},w=function(k,d){k=String(k);var f=v,n=Array.prototype.slice.call(arguments,2),u=w.listeners(k),p=0,b,q=[],e={},l=[],r=a;l.firstDefined=M;l.lastDefined=A;a=k;for(var s=v=0,x=u.length;s<x;s++)"zIndex"in u[s]&&(q.push(u[s].zIndex),0>u[s].zIndex&&
(e[u[s].zIndex]=u[s]));for(q.sort(C);0>q[p];)if(b=e[q[p++] ],l.push(b.apply(d,n)),v)return v=f,l;for(s=0;s<x;s++)if(b=u[s],"zIndex"in b)if(b.zIndex==q[p]){l.push(b.apply(d,n));if(v)break;do if(p++,(b=e[q[p] ])&&l.push(b.apply(d,n)),v)break;while(b)}else e[b.zIndex]=b;else if(l.push(b.apply(d,n)),v)break;v=f;a=r;return l};w._events=y;w.listeners=function(a){a=a.split(k);var d=y,f,n,u,p,b,q,e,l=[d],r=[];u=0;for(p=a.length;u<p;u++){e=[];b=0;for(q=l.length;b<q;b++)for(d=l[b].n,f=[d[a[u] ],d["*"] ],n=2;n--;)if(d=
f[n])e.push(d),r=r.concat(d.f||[]);l=e}return r};w.on=function(a,d){a=String(a);if("function"!=typeof d)return function(){};for(var f=a.split(L),n=0,u=f.length;n<u;n++)(function(a){a=a.split(k);for(var b=y,f,e=0,l=a.length;e<l;e++)b=b.n,b=b.hasOwnProperty(a[e])&&b[a[e] ]||(b[a[e] ]={n:{}});b.f=b.f||[];e=0;for(l=b.f.length;e<l;e++)if(b.f[e]==d){f=!0;break}!f&&b.f.push(d)})(f[n]);return function(a){+a==+a&&(d.zIndex=+a)}};w.f=function(a){var d=[].slice.call(arguments,1);return function(){w.apply(null,
[a,null].concat(d).concat([].slice.call(arguments,0)))}};w.stop=function(){v=1};w.nt=function(k){return k?(new RegExp("(?:\\.|\\/|^)"+k+"(?:\\.|\\/|$)")).test(a):a};w.nts=function(){return a.split(k)};w.off=w.unbind=function(a,d){if(a){var f=a.split(L);if(1<f.length)for(var n=0,u=f.length;n<u;n++)w.off(f[n],d);else{for(var f=a.split(k),p,b,q,e,l=[y],n=0,u=f.length;n<u;n++)for(e=0;e<l.length;e+=q.length-2){q=[e,1];p=l[e].n;if("*"!=f[n])p[f[n] ]&&q.push(p[f[n] ]);else for(b in p)p.hasOwnProperty(b)&&
q.push(p[b]);l.splice.apply(l,q)}n=0;for(u=l.length;n<u;n++)for(p=l[n];p.n;){if(d){if(p.f){e=0;for(f=p.f.length;e<f;e++)if(p.f[e]==d){p.f.splice(e,1);break}!p.f.length&&delete p.f}for(b in p.n)if(p.n.hasOwnProperty(b)&&p.n[b].f){q=p.n[b].f;e=0;for(f=q.length;e<f;e++)if(q[e]==d){q.splice(e,1);break}!q.length&&delete p.n[b].f}}else for(b in delete p.f,p.n)p.n.hasOwnProperty(b)&&p.n[b].f&&delete p.n[b].f;p=p.n}}}else w._events=y={n:{}}};w.once=function(a,d){var f=function(){w.unbind(a,f);return d.apply(this,
arguments)};return w.on(a,f)};w.version="0.4.2";w.toString=function(){return"You are running Eve 0.4.2"};"undefined"!=typeof module&&module.exports?module.exports=w:"function"===typeof define&&define.amd?define("eve",[],function(){return w}):N.eve=w})(this);
(function(N,k){"function"===typeof define&&define.amd?define("Snap.svg",["eve"],function(L){return k(N,L)}):k(N,N.eve)})(this,function(N,k){var L=function(a){var k={},y=N.requestAnimationFrame||N.webkitRequestAnimationFrame||N.mozRequestAnimationFrame||N.oRequestAnimationFrame||N.msRequestAnimationFrame||function(a){setTimeout(a,16)},M=Array.isArray||function(a){return a instanceof Array||"[object Array]"==Object.prototype.toString.call(a)},A=0,w="M"+(+new Date).toString(36),z=function(a){if(null==
a)return this.s;var b=this.s-a;this.b+=this.dur*b;this.B+=this.dur*b;this.s=a},d=function(a){if(null==a)return this.spd;this.spd=a},f=function(a){if(null==a)return this.dur;this.s=this.s*a/this.dur;this.dur=a},n=function(){delete k[this.id];this.update();a("mina.stop."+this.id,this)},u=function(){this.pdif||(delete k[this.id],this.update(),this.pdif=this.get()-this.b)},p=function(){this.pdif&&(this.b=this.get()-this.pdif,delete this.pdif,k[this.id]=this)},b=function(){var a;if(M(this.start)){a=[];
for(var b=0,e=this.start.length;b<e;b++)a[b]=+this.start[b]+(this.end[b]-this.start[b])*this.easing(this.s)}else a=+this.start+(this.end-this.start)*this.easing(this.s);this.set(a)},q=function(){var l=0,b;for(b in k)if(k.hasOwnProperty(b)){var e=k[b],f=e.get();l++;e.s=(f-e.b)/(e.dur/e.spd);1<=e.s&&(delete k[b],e.s=1,l--,function(b){setTimeout(function(){a("mina.finish."+b.id,b)})}(e));e.update()}l&&y(q)},e=function(a,r,s,x,G,h,J){a={id:w+(A++).toString(36),start:a,end:r,b:s,s:0,dur:x-s,spd:1,get:G,
set:h,easing:J||e.linear,status:z,speed:d,duration:f,stop:n,pause:u,resume:p,update:b};k[a.id]=a;r=0;for(var K in k)if(k.hasOwnProperty(K)&&(r++,2==r))break;1==r&&y(q);return a};e.time=Date.now||function(){return+new Date};e.getById=function(a){return k[a]||null};e.linear=function(a){return a};e.easeout=function(a){return Math.pow(a,1.7)};e.easein=function(a){return Math.pow(a,0.48)};e.easeinout=function(a){if(1==a)return 1;if(0==a)return 0;var b=0.48-a/1.04,e=Math.sqrt(0.1734+b*b);a=e-b;a=Math.pow(Math.abs(a),
1/3)*(0>a?-1:1);b=-e-b;b=Math.pow(Math.abs(b),1/3)*(0>b?-1:1);a=a+b+0.5;return 3*(1-a)*a*a+a*a*a};e.backin=function(a){return 1==a?1:a*a*(2.70158*a-1.70158)};e.backout=function(a){if(0==a)return 0;a-=1;return a*a*(2.70158*a+1.70158)+1};e.elastic=function(a){return a==!!a?a:Math.pow(2,-10*a)*Math.sin(2*(a-0.075)*Math.PI/0.3)+1};e.bounce=function(a){a<1/2.75?a*=7.5625*a:a<2/2.75?(a-=1.5/2.75,a=7.5625*a*a+0.75):a<2.5/2.75?(a-=2.25/2.75,a=7.5625*a*a+0.9375):(a-=2.625/2.75,a=7.5625*a*a+0.984375);return a};
return N.mina=e}("undefined"==typeof k?function(){}:k),C=function(){function a(c,t){if(c){if(c.tagName)return x(c);if(y(c,"array")&&a.set)return a.set.apply(a,c);if(c instanceof e)return c;if(null==t)return c=G.doc.querySelector(c),x(c)}return new s(null==c?"100%":c,null==t?"100%":t)}function v(c,a){if(a){"#text"==c&&(c=G.doc.createTextNode(a.text||""));"string"==typeof c&&(c=v(c));if("string"==typeof a)return"xlink:"==a.substring(0,6)?c.getAttributeNS(m,a.substring(6)):"xml:"==a.substring(0,4)?c.getAttributeNS(la,
a.substring(4)):c.getAttribute(a);for(var da in a)if(a[h](da)){var b=J(a[da]);b?"xlink:"==da.substring(0,6)?c.setAttributeNS(m,da.substring(6),b):"xml:"==da.substring(0,4)?c.setAttributeNS(la,da.substring(4),b):c.setAttribute(da,b):c.removeAttribute(da)}}else c=G.doc.createElementNS(la,c);return c}function y(c,a){a=J.prototype.toLowerCase.call(a);return"finite"==a?isFinite(c):"array"==a&&(c instanceof Array||Array.isArray&&Array.isArray(c))?!0:"null"==a&&null===c||a==typeof c&&null!==c||"object"==
a&&c===Object(c)||$.call(c).slice(8,-1).toLowerCase()==a}function M(c){if("function"==typeof c||Object(c)!==c)return c;var a=new c.constructor,b;for(b in c)c[h](b)&&(a[b]=M(c[b]));return a}function A(c,a,b){function m(){var e=Array.prototype.slice.call(arguments,0),f=e.join("\u2400"),d=m.cache=m.cache||{},l=m.count=m.count||[];if(d[h](f)){a:for(var e=l,l=f,B=0,H=e.length;B<H;B++)if(e[B]===l){e.push(e.splice(B,1)[0]);break a}return b?b(d[f]):d[f]}1E3<=l.length&&delete d[l.shift()];l.push(f);d[f]=c.apply(a,
e);return b?b(d[f]):d[f]}return m}function w(c,a,b,m,e,f){return null==e?(c-=b,a-=m,c||a?(180*I.atan2(-a,-c)/C+540)%360:0):w(c,a,e,f)-w(b,m,e,f)}function z(c){return c%360*C/180}function d(c){var a=[];c=c.replace(/(?:^|\s)(\w+)\(([^)]+)\)/g,function(c,b,m){m=m.split(/\s*,\s*|\s+/);"rotate"==b&&1==m.length&&m.push(0,0);"scale"==b&&(2<m.length?m=m.slice(0,2):2==m.length&&m.push(0,0),1==m.length&&m.push(m[0],0,0));"skewX"==b?a.push(["m",1,0,I.tan(z(m[0])),1,0,0]):"skewY"==b?a.push(["m",1,I.tan(z(m[0])),
0,1,0,0]):a.push([b.charAt(0)].concat(m));return c});return a}function f(c,t){var b=O(c),m=new a.Matrix;if(b)for(var e=0,f=b.length;e<f;e++){var h=b[e],d=h.length,B=J(h[0]).toLowerCase(),H=h[0]!=B,l=H?m.invert():0,E;"t"==B&&2==d?m.translate(h[1],0):"t"==B&&3==d?H?(d=l.x(0,0),B=l.y(0,0),H=l.x(h[1],h[2]),l=l.y(h[1],h[2]),m.translate(H-d,l-B)):m.translate(h[1],h[2]):"r"==B?2==d?(E=E||t,m.rotate(h[1],E.x+E.width/2,E.y+E.height/2)):4==d&&(H?(H=l.x(h[2],h[3]),l=l.y(h[2],h[3]),m.rotate(h[1],H,l)):m.rotate(h[1],
h[2],h[3])):"s"==B?2==d||3==d?(E=E||t,m.scale(h[1],h[d-1],E.x+E.width/2,E.y+E.height/2)):4==d?H?(H=l.x(h[2],h[3]),l=l.y(h[2],h[3]),m.scale(h[1],h[1],H,l)):m.scale(h[1],h[1],h[2],h[3]):5==d&&(H?(H=l.x(h[3],h[4]),l=l.y(h[3],h[4]),m.scale(h[1],h[2],H,l)):m.scale(h[1],h[2],h[3],h[4])):"m"==B&&7==d&&m.add(h[1],h[2],h[3],h[4],h[5],h[6])}return m}function n(c,t){if(null==t){var m=!0;t="linearGradient"==c.type||"radialGradient"==c.type?c.node.getAttribute("gradientTransform"):"pattern"==c.type?c.node.getAttribute("patternTransform"):
c.node.getAttribute("transform");if(!t)return new a.Matrix;t=d(t)}else t=a._.rgTransform.test(t)?J(t).replace(/\.{3}|\u2026/g,c._.transform||aa):d(t),y(t,"array")&&(t=a.path?a.path.toString.call(t):J(t)),c._.transform=t;var b=f(t,c.getBBox(1));if(m)return b;c.matrix=b}function u(c){c=c.node.ownerSVGElement&&x(c.node.ownerSVGElement)||c.node.parentNode&&x(c.node.parentNode)||a.select("svg")||a(0,0);var t=c.select("defs"),t=null==t?!1:t.node;t||(t=r("defs",c.node).node);return t}function p(c){return c.node.ownerSVGElement&&
x(c.node.ownerSVGElement)||a.select("svg")}function b(c,a,m){function b(c){if(null==c)return aa;if(c==+c)return c;v(B,{width:c});try{return B.getBBox().width}catch(a){return 0}}function h(c){if(null==c)return aa;if(c==+c)return c;v(B,{height:c});try{return B.getBBox().height}catch(a){return 0}}function e(b,B){null==a?d[b]=B(c.attr(b)||0):b==a&&(d=B(null==m?c.attr(b)||0:m))}var f=p(c).node,d={},B=f.querySelector(".svg---mgr");B||(B=v("rect"),v(B,{x:-9E9,y:-9E9,width:10,height:10,"class":"svg---mgr",
fill:"none"}),f.appendChild(B));switch(c.type){case "rect":e("rx",b),e("ry",h);case "image":e("width",b),e("height",h);case "text":e("x",b);e("y",h);break;case "circle":e("cx",b);e("cy",h);e("r",b);break;case "ellipse":e("cx",b);e("cy",h);e("rx",b);e("ry",h);break;case "line":e("x1",b);e("x2",b);e("y1",h);e("y2",h);break;case "marker":e("refX",b);e("markerWidth",b);e("refY",h);e("markerHeight",h);break;case "radialGradient":e("fx",b);e("fy",h);break;case "tspan":e("dx",b);e("dy",h);break;default:e(a,
b)}f.removeChild(B);return d}function q(c){y(c,"array")||(c=Array.prototype.slice.call(arguments,0));for(var a=0,b=0,m=this.node;this[a];)delete this[a++];for(a=0;a<c.length;a++)"set"==c[a].type?c[a].forEach(function(c){m.appendChild(c.node)}):m.appendChild(c[a].node);for(var h=m.childNodes,a=0;a<h.length;a++)this[b++]=x(h[a]);return this}function e(c){if(c.snap in E)return E[c.snap];var a=this.id=V(),b;try{b=c.ownerSVGElement}catch(m){}this.node=c;b&&(this.paper=new s(b));this.type=c.tagName;this.anims=
{};this._={transform:[]};c.snap=a;E[a]=this;"g"==this.type&&(this.add=q);if(this.type in{g:1,mask:1,pattern:1})for(var e in s.prototype)s.prototype[h](e)&&(this[e]=s.prototype[e])}function l(c){this.node=c}function r(c,a){var b=v(c);a.appendChild(b);return x(b)}function s(c,a){var b,m,f,d=s.prototype;if(c&&"svg"==c.tagName){if(c.snap in E)return E[c.snap];var l=c.ownerDocument;b=new e(c);m=c.getElementsByTagName("desc")[0];f=c.getElementsByTagName("defs")[0];m||(m=v("desc"),m.appendChild(l.createTextNode("Created with Snap")),
b.node.appendChild(m));f||(f=v("defs"),b.node.appendChild(f));b.defs=f;for(var ca in d)d[h](ca)&&(b[ca]=d[ca]);b.paper=b.root=b}else b=r("svg",G.doc.body),v(b.node,{height:a,version:1.1,width:c,xmlns:la});return b}function x(c){return!c||c instanceof e||c instanceof l?c:c.tagName&&"svg"==c.tagName.toLowerCase()?new s(c):c.tagName&&"object"==c.tagName.toLowerCase()&&"image/svg+xml"==c.type?new s(c.contentDocument.getElementsByTagName("svg")[0]):new e(c)}a.version="0.3.0";a.toString=function(){return"Snap v"+
this.version};a._={};var G={win:N,doc:N.document};a._.glob=G;var h="hasOwnProperty",J=String,K=parseFloat,U=parseInt,I=Math,P=I.max,Q=I.min,Y=I.abs,C=I.PI,aa="",$=Object.prototype.toString,F=/^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?%?)\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?%?)\s*\))\s*$/i;a._.separator=
RegExp("[,\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]+");var S=RegExp("[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*"),X={hs:1,rg:1},W=RegExp("([a-z])[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)",
"ig"),ma=RegExp("([rstm])[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)","ig"),Z=RegExp("(-?\\d*\\.?\\d*(?:e[\\-+]?\\d+)?)[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*",
"ig"),na=0,ba="S"+(+new Date).toString(36),V=function(){return ba+(na++).toString(36)},m="http://www.w3.org/1999/xlink",la="http://www.w3.org/2000/svg",E={},ca=a.url=function(c){return"url('#"+c+"')"};a._.$=v;a._.id=V;a.format=function(){var c=/\{([^\}]+)\}/g,a=/(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g,b=function(c,b,m){var h=m;b.replace(a,function(c,a,b,m,t){a=a||m;h&&(a in h&&(h=h[a]),"function"==typeof h&&t&&(h=h()))});return h=(null==h||h==m?c:h)+""};return function(a,m){return J(a).replace(c,
function(c,a){return b(c,a,m)})}}();a._.clone=M;a._.cacher=A;a.rad=z;a.deg=function(c){return 180*c/C%360};a.angle=w;a.is=y;a.snapTo=function(c,a,b){b=y(b,"finite")?b:10;if(y(c,"array"))for(var m=c.length;m--;){if(Y(c[m]-a)<=b)return c[m]}else{c=+c;m=a%c;if(m<b)return a-m;if(m>c-b)return a-m+c}return a};a.getRGB=A(function(c){if(!c||(c=J(c)).indexOf("-")+1)return{r:-1,g:-1,b:-1,hex:"none",error:1,toString:ka};if("none"==c)return{r:-1,g:-1,b:-1,hex:"none",toString:ka};!X[h](c.toLowerCase().substring(0,
2))&&"#"!=c.charAt()&&(c=T(c));if(!c)return{r:-1,g:-1,b:-1,hex:"none",error:1,toString:ka};var b,m,e,f,d;if(c=c.match(F)){c[2]&&(e=U(c[2].substring(5),16),m=U(c[2].substring(3,5),16),b=U(c[2].substring(1,3),16));c[3]&&(e=U((d=c[3].charAt(3))+d,16),m=U((d=c[3].charAt(2))+d,16),b=U((d=c[3].charAt(1))+d,16));c[4]&&(d=c[4].split(S),b=K(d[0]),"%"==d[0].slice(-1)&&(b*=2.55),m=K(d[1]),"%"==d[1].slice(-1)&&(m*=2.55),e=K(d[2]),"%"==d[2].slice(-1)&&(e*=2.55),"rgba"==c[1].toLowerCase().slice(0,4)&&(f=K(d[3])),
d[3]&&"%"==d[3].slice(-1)&&(f/=100));if(c[5])return d=c[5].split(S),b=K(d[0]),"%"==d[0].slice(-1)&&(b/=100),m=K(d[1]),"%"==d[1].slice(-1)&&(m/=100),e=K(d[2]),"%"==d[2].slice(-1)&&(e/=100),"deg"!=d[0].slice(-3)&&"\u00b0"!=d[0].slice(-1)||(b/=360),"hsba"==c[1].toLowerCase().slice(0,4)&&(f=K(d[3])),d[3]&&"%"==d[3].slice(-1)&&(f/=100),a.hsb2rgb(b,m,e,f);if(c[6])return d=c[6].split(S),b=K(d[0]),"%"==d[0].slice(-1)&&(b/=100),m=K(d[1]),"%"==d[1].slice(-1)&&(m/=100),e=K(d[2]),"%"==d[2].slice(-1)&&(e/=100),
"deg"!=d[0].slice(-3)&&"\u00b0"!=d[0].slice(-1)||(b/=360),"hsla"==c[1].toLowerCase().slice(0,4)&&(f=K(d[3])),d[3]&&"%"==d[3].slice(-1)&&(f/=100),a.hsl2rgb(b,m,e,f);b=Q(I.round(b),255);m=Q(I.round(m),255);e=Q(I.round(e),255);f=Q(P(f,0),1);c={r:b,g:m,b:e,toString:ka};c.hex="#"+(16777216|e|m<<8|b<<16).toString(16).slice(1);c.opacity=y(f,"finite")?f:1;return c}return{r:-1,g:-1,b:-1,hex:"none",error:1,toString:ka}},a);a.hsb=A(function(c,b,m){return a.hsb2rgb(c,b,m).hex});a.hsl=A(function(c,b,m){return a.hsl2rgb(c,
b,m).hex});a.rgb=A(function(c,a,b,m){if(y(m,"finite")){var e=I.round;return"rgba("+[e(c),e(a),e(b),+m.toFixed(2)]+")"}return"#"+(16777216|b|a<<8|c<<16).toString(16).slice(1)});var T=function(c){var a=G.doc.getElementsByTagName("head")[0]||G.doc.getElementsByTagName("svg")[0];T=A(function(c){if("red"==c.toLowerCase())return"rgb(255, 0, 0)";a.style.color="rgb(255, 0, 0)";a.style.color=c;c=G.doc.defaultView.getComputedStyle(a,aa).getPropertyValue("color");return"rgb(255, 0, 0)"==c?null:c});return T(c)},
qa=function(){return"hsb("+[this.h,this.s,this.b]+")"},ra=function(){return"hsl("+[this.h,this.s,this.l]+")"},ka=function(){return 1==this.opacity||null==this.opacity?this.hex:"rgba("+[this.r,this.g,this.b,this.opacity]+")"},D=function(c,b,m){null==b&&y(c,"object")&&"r"in c&&"g"in c&&"b"in c&&(m=c.b,b=c.g,c=c.r);null==b&&y(c,string)&&(m=a.getRGB(c),c=m.r,b=m.g,m=m.b);if(1<c||1<b||1<m)c/=255,b/=255,m/=255;return[c,b,m]},oa=function(c,b,m,e){c=I.round(255*c);b=I.round(255*b);m=I.round(255*m);c={r:c,
g:b,b:m,opacity:y(e,"finite")?e:1,hex:a.rgb(c,b,m),toString:ka};y(e,"finite")&&(c.opacity=e);return c};a.color=function(c){var b;y(c,"object")&&"h"in c&&"s"in c&&"b"in c?(b=a.hsb2rgb(c),c.r=b.r,c.g=b.g,c.b=b.b,c.opacity=1,c.hex=b.hex):y(c,"object")&&"h"in c&&"s"in c&&"l"in c?(b=a.hsl2rgb(c),c.r=b.r,c.g=b.g,c.b=b.b,c.opacity=1,c.hex=b.hex):(y(c,"string")&&(c=a.getRGB(c)),y(c,"object")&&"r"in c&&"g"in c&&"b"in c&&!("error"in c)?(b=a.rgb2hsl(c),c.h=b.h,c.s=b.s,c.l=b.l,b=a.rgb2hsb(c),c.v=b.b):(c={hex:"none"},
c.r=c.g=c.b=c.h=c.s=c.v=c.l=-1,c.error=1));c.toString=ka;return c};a.hsb2rgb=function(c,a,b,m){y(c,"object")&&"h"in c&&"s"in c&&"b"in c&&(b=c.b,a=c.s,c=c.h,m=c.o);var e,h,d;c=360*c%360/60;d=b*a;a=d*(1-Y(c%2-1));b=e=h=b-d;c=~~c;b+=[d,a,0,0,a,d][c];e+=[a,d,d,a,0,0][c];h+=[0,0,a,d,d,a][c];return oa(b,e,h,m)};a.hsl2rgb=function(c,a,b,m){y(c,"object")&&"h"in c&&"s"in c&&"l"in c&&(b=c.l,a=c.s,c=c.h);if(1<c||1<a||1<b)c/=360,a/=100,b/=100;var e,h,d;c=360*c%360/60;d=2*a*(0.5>b?b:1-b);a=d*(1-Y(c%2-1));b=e=
h=b-d/2;c=~~c;b+=[d,a,0,0,a,d][c];e+=[a,d,d,a,0,0][c];h+=[0,0,a,d,d,a][c];return oa(b,e,h,m)};a.rgb2hsb=function(c,a,b){b=D(c,a,b);c=b[0];a=b[1];b=b[2];var m,e;m=P(c,a,b);e=m-Q(c,a,b);c=((0==e?0:m==c?(a-b)/e:m==a?(b-c)/e+2:(c-a)/e+4)+360)%6*60/360;return{h:c,s:0==e?0:e/m,b:m,toString:qa}};a.rgb2hsl=function(c,a,b){b=D(c,a,b);c=b[0];a=b[1];b=b[2];var m,e,h;m=P(c,a,b);e=Q(c,a,b);h=m-e;c=((0==h?0:m==c?(a-b)/h:m==a?(b-c)/h+2:(c-a)/h+4)+360)%6*60/360;m=(m+e)/2;return{h:c,s:0==h?0:0.5>m?h/(2*m):h/(2-2*
m),l:m,toString:ra}};a.parsePathString=function(c){if(!c)return null;var b=a.path(c);if(b.arr)return a.path.clone(b.arr);var m={a:7,c:6,o:2,h:1,l:2,m:2,r:4,q:4,s:4,t:2,v:1,u:3,z:0},e=[];y(c,"array")&&y(c[0],"array")&&(e=a.path.clone(c));e.length||J(c).replace(W,function(c,a,b){var h=[];c=a.toLowerCase();b.replace(Z,function(c,a){a&&h.push(+a)});"m"==c&&2<h.length&&(e.push([a].concat(h.splice(0,2))),c="l",a="m"==a?"l":"L");"o"==c&&1==h.length&&e.push([a,h[0] ]);if("r"==c)e.push([a].concat(h));else for(;h.length>=
m[c]&&(e.push([a].concat(h.splice(0,m[c]))),m[c]););});e.toString=a.path.toString;b.arr=a.path.clone(e);return e};var O=a.parseTransformString=function(c){if(!c)return null;var b=[];y(c,"array")&&y(c[0],"array")&&(b=a.path.clone(c));b.length||J(c).replace(ma,function(c,a,m){var e=[];a.toLowerCase();m.replace(Z,function(c,a){a&&e.push(+a)});b.push([a].concat(e))});b.toString=a.path.toString;return b};a._.svgTransform2string=d;a._.rgTransform=RegExp("^[a-z][\t\n\x0B\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*-?\\.?\\d",
"i");a._.transform2matrix=f;a._unit2px=b;a._.getSomeDefs=u;a._.getSomeSVG=p;a.select=function(c){return x(G.doc.querySelector(c))};a.selectAll=function(c){c=G.doc.querySelectorAll(c);for(var b=(a.set||Array)(),m=0;m<c.length;m++)b.push(x(c[m]));return b};setInterval(function(){for(var c in E)if(E[h](c)){var a=E[c],b=a.node;("svg"!=a.type&&!b.ownerSVGElement||"svg"==a.type&&(!b.parentNode||"ownerSVGElement"in b.parentNode&&!b.ownerSVGElement))&&delete E[c]}},1E4);(function(c){function m(c){function a(c,
b){var m=v(c.node,b);(m=(m=m&&m.match(d))&&m[2])&&"#"==m.charAt()&&(m=m.substring(1))&&(f[m]=(f[m]||[]).concat(function(a){var m={};m[b]=ca(a);v(c.node,m)}))}function b(c){var a=v(c.node,"xlink:href");a&&"#"==a.charAt()&&(a=a.substring(1))&&(f[a]=(f[a]||[]).concat(function(a){c.attr("xlink:href","#"+a)}))}var e=c.selectAll("*"),h,d=/^\s*url\(("|'|)(.*)\1\)\s*$/;c=[];for(var f={},l=0,E=e.length;l<E;l++){h=e[l];a(h,"fill");a(h,"stroke");a(h,"filter");a(h,"mask");a(h,"clip-path");b(h);var t=v(h.node,
"id");t&&(v(h.node,{id:h.id}),c.push({old:t,id:h.id}))}l=0;for(E=c.length;l<E;l++)if(e=f[c[l].old])for(h=0,t=e.length;h<t;h++)e[h](c[l].id)}function e(c,a,b){return function(m){m=m.slice(c,a);1==m.length&&(m=m[0]);return b?b(m):m}}function d(c){return function(){var a=c?"<"+this.type:"",b=this.node.attributes,m=this.node.childNodes;if(c)for(var e=0,h=b.length;e<h;e++)a+=" "+b[e].name+'="'+b[e].value.replace(/"/g,'\\"')+'"';if(m.length){c&&(a+=">");e=0;for(h=m.length;e<h;e++)3==m[e].nodeType?a+=m[e].nodeValue:
1==m[e].nodeType&&(a+=x(m[e]).toString());c&&(a+="</"+this.type+">")}else c&&(a+="/>");return a}}c.attr=function(c,a){if(!c)return this;if(y(c,"string"))if(1<arguments.length){var b={};b[c]=a;c=b}else return k("snap.util.getattr."+c,this).firstDefined();for(var m in c)c[h](m)&&k("snap.util.attr."+m,this,c[m]);return this};c.getBBox=function(c){if(!a.Matrix||!a.path)return this.node.getBBox();var b=this,m=new a.Matrix;if(b.removed)return a._.box();for(;"use"==b.type;)if(c||(m=m.add(b.transform().localMatrix.translate(b.attr("x")||
0,b.attr("y")||0))),b.original)b=b.original;else var e=b.attr("xlink:href"),b=b.original=b.node.ownerDocument.getElementById(e.substring(e.indexOf("#")+1));var e=b._,h=a.path.get[b.type]||a.path.get.deflt;try{if(c)return e.bboxwt=h?a.path.getBBox(b.realPath=h(b)):a._.box(b.node.getBBox()),a._.box(e.bboxwt);b.realPath=h(b);b.matrix=b.transform().localMatrix;e.bbox=a.path.getBBox(a.path.map(b.realPath,m.add(b.matrix)));return a._.box(e.bbox)}catch(d){return a._.box()}};var f=function(){return this.string};
c.transform=function(c){var b=this._;if(null==c){var m=this;c=new a.Matrix(this.node.getCTM());for(var e=n(this),h=[e],d=new a.Matrix,l=e.toTransformString(),b=J(e)==J(this.matrix)?J(b.transform):l;"svg"!=m.type&&(m=m.parent());)h.push(n(m));for(m=h.length;m--;)d.add(h[m]);return{string:b,globalMatrix:c,totalMatrix:d,localMatrix:e,diffMatrix:c.clone().add(e.invert()),global:c.toTransformString(),total:d.toTransformString(),local:l,toString:f}}c instanceof a.Matrix?this.matrix=c:n(this,c);this.node&&
("linearGradient"==this.type||"radialGradient"==this.type?v(this.node,{gradientTransform:this.matrix}):"pattern"==this.type?v(this.node,{patternTransform:this.matrix}):v(this.node,{transform:this.matrix}));return this};c.parent=function(){return x(this.node.parentNode)};c.append=c.add=function(c){if(c){if("set"==c.type){var a=this;c.forEach(function(c){a.add(c)});return this}c=x(c);this.node.appendChild(c.node);c.paper=this.paper}return this};c.appendTo=function(c){c&&(c=x(c),c.append(this));return this};
c.prepend=function(c){if(c){if("set"==c.type){var a=this,b;c.forEach(function(c){b?b.after(c):a.prepend(c);b=c});return this}c=x(c);var m=c.parent();this.node.insertBefore(c.node,this.node.firstChild);this.add&&this.add();c.paper=this.paper;this.parent()&&this.parent().add();m&&m.add()}return this};c.prependTo=function(c){c=x(c);c.prepend(this);return this};c.before=function(c){if("set"==c.type){var a=this;c.forEach(function(c){var b=c.parent();a.node.parentNode.insertBefore(c.node,a.node);b&&b.add()});
this.parent().add();return this}c=x(c);var b=c.parent();this.node.parentNode.insertBefore(c.node,this.node);this.parent()&&this.parent().add();b&&b.add();c.paper=this.paper;return this};c.after=function(c){c=x(c);var a=c.parent();this.node.nextSibling?this.node.parentNode.insertBefore(c.node,this.node.nextSibling):this.node.parentNode.appendChild(c.node);this.parent()&&this.parent().add();a&&a.add();c.paper=this.paper;return this};c.insertBefore=function(c){c=x(c);var a=this.parent();c.node.parentNode.insertBefore(this.node,
c.node);this.paper=c.paper;a&&a.add();c.parent()&&c.parent().add();return this};c.insertAfter=function(c){c=x(c);var a=this.parent();c.node.parentNode.insertBefore(this.node,c.node.nextSibling);this.paper=c.paper;a&&a.add();c.parent()&&c.parent().add();return this};c.remove=function(){var c=this.parent();this.node.parentNode&&this.node.parentNode.removeChild(this.node);delete this.paper;this.removed=!0;c&&c.add();return this};c.select=function(c){return x(this.node.querySelector(c))};c.selectAll=
function(c){c=this.node.querySelectorAll(c);for(var b=(a.set||Array)(),m=0;m<c.length;m++)b.push(x(c[m]));return b};c.asPX=function(c,a){null==a&&(a=this.attr(c));return+b(this,c,a)};c.use=function(){var c,a=this.node.id;a||(a=this.id,v(this.node,{id:a}));c="linearGradient"==this.type||"radialGradient"==this.type||"pattern"==this.type?r(this.type,this.node.parentNode):r("use",this.node.parentNode);v(c.node,{"xlink:href":"#"+a});c.original=this;return c};var l=/\S+/g;c.addClass=function(c){var a=(c||
"").match(l)||[];c=this.node;var b=c.className.baseVal,m=b.match(l)||[],e,h,d;if(a.length){for(e=0;d=a[e++];)h=m.indexOf(d),~h||m.push(d);a=m.join(" ");b!=a&&(c.className.baseVal=a)}return this};c.removeClass=function(c){var a=(c||"").match(l)||[];c=this.node;var b=c.className.baseVal,m=b.match(l)||[],e,h;if(m.length){for(e=0;h=a[e++];)h=m.indexOf(h),~h&&m.splice(h,1);a=m.join(" ");b!=a&&(c.className.baseVal=a)}return this};c.hasClass=function(c){return!!~(this.node.className.baseVal.match(l)||[]).indexOf(c)};
c.toggleClass=function(c,a){if(null!=a)return a?this.addClass(c):this.removeClass(c);var b=(c||"").match(l)||[],m=this.node,e=m.className.baseVal,h=e.match(l)||[],d,f,E;for(d=0;E=b[d++];)f=h.indexOf(E),~f?h.splice(f,1):h.push(E);b=h.join(" ");e!=b&&(m.className.baseVal=b);return this};c.clone=function(){var c=x(this.node.cloneNode(!0));v(c.node,"id")&&v(c.node,{id:c.id});m(c);c.insertAfter(this);return c};c.toDefs=function(){u(this).appendChild(this.node);return this};c.pattern=c.toPattern=function(c,
a,b,m){var e=r("pattern",u(this));null==c&&(c=this.getBBox());y(c,"object")&&"x"in c&&(a=c.y,b=c.width,m=c.height,c=c.x);v(e.node,{x:c,y:a,width:b,height:m,patternUnits:"userSpaceOnUse",id:e.id,viewBox:[c,a,b,m].join(" ")});e.node.appendChild(this.node);return e};c.marker=function(c,a,b,m,e,h){var d=r("marker",u(this));null==c&&(c=this.getBBox());y(c,"object")&&"x"in c&&(a=c.y,b=c.width,m=c.height,e=c.refX||c.cx,h=c.refY||c.cy,c=c.x);v(d.node,{viewBox:[c,a,b,m].join(" "),markerWidth:b,markerHeight:m,
orient:"auto",refX:e||0,refY:h||0,id:d.id});d.node.appendChild(this.node);return d};var E=function(c,a,b,m){"function"!=typeof b||b.length||(m=b,b=L.linear);this.attr=c;this.dur=a;b&&(this.easing=b);m&&(this.callback=m)};a._.Animation=E;a.animation=function(c,a,b,m){return new E(c,a,b,m)};c.inAnim=function(){var c=[],a;for(a in this.anims)this.anims[h](a)&&function(a){c.push({anim:new E(a._attrs,a.dur,a.easing,a._callback),mina:a,curStatus:a.status(),status:function(c){return a.status(c)},stop:function(){a.stop()}})}(this.anims[a]);
return c};a.animate=function(c,a,b,m,e,h){"function"!=typeof e||e.length||(h=e,e=L.linear);var d=L.time();c=L(c,a,d,d+m,L.time,b,e);h&&k.once("mina.finish."+c.id,h);return c};c.stop=function(){for(var c=this.inAnim(),a=0,b=c.length;a<b;a++)c[a].stop();return this};c.animate=function(c,a,b,m){"function"!=typeof b||b.length||(m=b,b=L.linear);c instanceof E&&(m=c.callback,b=c.easing,a=b.dur,c=c.attr);var d=[],f=[],l={},t,ca,n,T=this,q;for(q in c)if(c[h](q)){T.equal?(n=T.equal(q,J(c[q])),t=n.from,ca=
n.to,n=n.f):(t=+T.attr(q),ca=+c[q]);var la=y(t,"array")?t.length:1;l[q]=e(d.length,d.length+la,n);d=d.concat(t);f=f.concat(ca)}t=L.time();var p=L(d,f,t,t+a,L.time,function(c){var a={},b;for(b in l)l[h](b)&&(a[b]=l[b](c));T.attr(a)},b);T.anims[p.id]=p;p._attrs=c;p._callback=m;k("snap.animcreated."+T.id,p);k.once("mina.finish."+p.id,function(){delete T.anims[p.id];m&&m.call(T)});k.once("mina.stop."+p.id,function(){delete T.anims[p.id]});return T};var T={};c.data=function(c,b){var m=T[this.id]=T[this.id]||
{};if(0==arguments.length)return k("snap.data.get."+this.id,this,m,null),m;if(1==arguments.length){if(a.is(c,"object")){for(var e in c)c[h](e)&&this.data(e,c[e]);return this}k("snap.data.get."+this.id,this,m[c],c);return m[c]}m[c]=b;k("snap.data.set."+this.id,this,b,c);return this};c.removeData=function(c){null==c?T[this.id]={}:T[this.id]&&delete T[this.id][c];return this};c.outerSVG=c.toString=d(1);c.innerSVG=d()})(e.prototype);a.parse=function(c){var a=G.doc.createDocumentFragment(),b=!0,m=G.doc.createElement("div");
c=J(c);c.match(/^\s*<\s*svg(?:\s|>)/)||(c="<svg>"+c+"</svg>",b=!1);m.innerHTML=c;if(c=m.getElementsByTagName("svg")[0])if(b)a=c;else for(;c.firstChild;)a.appendChild(c.firstChild);m.innerHTML=aa;return new l(a)};l.prototype.select=e.prototype.select;l.prototype.selectAll=e.prototype.selectAll;a.fragment=function(){for(var c=Array.prototype.slice.call(arguments,0),b=G.doc.createDocumentFragment(),m=0,e=c.length;m<e;m++){var h=c[m];h.node&&h.node.nodeType&&b.appendChild(h.node);h.nodeType&&b.appendChild(h);
"string"==typeof h&&b.appendChild(a.parse(h).node)}return new l(b)};a._.make=r;a._.wrap=x;s.prototype.el=function(c,a){var b=r(c,this.node);a&&b.attr(a);return b};k.on("snap.util.getattr",function(){var c=k.nt(),c=c.substring(c.lastIndexOf(".")+1),a=c.replace(/[A-Z]/g,function(c){return"-"+c.toLowerCase()});return pa[h](a)?this.node.ownerDocument.defaultView.getComputedStyle(this.node,null).getPropertyValue(a):v(this.node,c)});var pa={"alignment-baseline":0,"baseline-shift":0,clip:0,"clip-path":0,
"clip-rule":0,color:0,"color-interpolation":0,"color-interpolation-filters":0,"color-profile":0,"color-rendering":0,cursor:0,direction:0,display:0,"dominant-baseline":0,"enable-background":0,fill:0,"fill-opacity":0,"fill-rule":0,filter:0,"flood-color":0,"flood-opacity":0,font:0,"font-family":0,"font-size":0,"font-size-adjust":0,"font-stretch":0,"font-style":0,"font-variant":0,"font-weight":0,"glyph-orientation-horizontal":0,"glyph-orientation-vertical":0,"image-rendering":0,kerning:0,"letter-spacing":0,
"lighting-color":0,marker:0,"marker-end":0,"marker-mid":0,"marker-start":0,mask:0,opacity:0,overflow:0,"pointer-events":0,"shape-rendering":0,"stop-color":0,"stop-opacity":0,stroke:0,"stroke-dasharray":0,"stroke-dashoffset":0,"stroke-linecap":0,"stroke-linejoin":0,"stroke-miterlimit":0,"stroke-opacity":0,"stroke-width":0,"text-anchor":0,"text-decoration":0,"text-rendering":0,"unicode-bidi":0,visibility:0,"word-spacing":0,"writing-mode":0};k.on("snap.util.attr",function(c){var a=k.nt(),b={},a=a.substring(a.lastIndexOf(".")+
1);b[a]=c;var m=a.replace(/-(\w)/gi,function(c,a){return a.toUpperCase()}),a=a.replace(/[A-Z]/g,function(c){return"-"+c.toLowerCase()});pa[h](a)?this.node.style[m]=null==c?aa:c:v(this.node,b)});a.ajax=function(c,a,b,m){var e=new XMLHttpRequest,h=V();if(e){if(y(a,"function"))m=b,b=a,a=null;else if(y(a,"object")){var d=[],f;for(f in a)a.hasOwnProperty(f)&&d.push(encodeURIComponent(f)+"="+encodeURIComponent(a[f]));a=d.join("&")}e.open(a?"POST":"GET",c,!0);a&&(e.setRequestHeader("X-Requested-With","XMLHttpRequest"),
e.setRequestHeader("Content-type","application/x-www-form-urlencoded"));b&&(k.once("snap.ajax."+h+".0",b),k.once("snap.ajax."+h+".200",b),k.once("snap.ajax."+h+".304",b));e.onreadystatechange=function(){4==e.readyState&&k("snap.ajax."+h+"."+e.status,m,e)};if(4==e.readyState)return e;e.send(a);return e}};a.load=function(c,b,m){a.ajax(c,function(c){c=a.parse(c.responseText);m?b.call(m,c):b(c)})};a.getElementByPoint=function(c,a){var b,m,e=G.doc.elementFromPoint(c,a);if(G.win.opera&&"svg"==e.tagName){b=
e;m=b.getBoundingClientRect();b=b.ownerDocument;var h=b.body,d=b.documentElement;b=m.top+(g.win.pageYOffset||d.scrollTop||h.scrollTop)-(d.clientTop||h.clientTop||0);m=m.left+(g.win.pageXOffset||d.scrollLeft||h.scrollLeft)-(d.clientLeft||h.clientLeft||0);h=e.createSVGRect();h.x=c-m;h.y=a-b;h.width=h.height=1;b=e.getIntersectionList(h,null);b.length&&(e=b[b.length-1])}return e?x(e):null};a.plugin=function(c){c(a,e,s,G,l)};return G.win.Snap=a}();C.plugin(function(a,k,y,M,A){function w(a,d,f,b,q,e){null==
d&&"[object SVGMatrix]"==z.call(a)?(this.a=a.a,this.b=a.b,this.c=a.c,this.d=a.d,this.e=a.e,this.f=a.f):null!=a?(this.a=+a,this.b=+d,this.c=+f,this.d=+b,this.e=+q,this.f=+e):(this.a=1,this.c=this.b=0,this.d=1,this.f=this.e=0)}var z=Object.prototype.toString,d=String,f=Math;(function(n){function k(a){return a[0]*a[0]+a[1]*a[1]}function p(a){var d=f.sqrt(k(a));a[0]&&(a[0]/=d);a[1]&&(a[1]/=d)}n.add=function(a,d,e,f,n,p){var k=[[],[],[] ],u=[[this.a,this.c,this.e],[this.b,this.d,this.f],[0,0,1] ];d=[[a,
e,n],[d,f,p],[0,0,1] ];a&&a instanceof w&&(d=[[a.a,a.c,a.e],[a.b,a.d,a.f],[0,0,1] ]);for(a=0;3>a;a++)for(e=0;3>e;e++){for(f=n=0;3>f;f++)n+=u[a][f]*d[f][e];k[a][e]=n}this.a=k[0][0];this.b=k[1][0];this.c=k[0][1];this.d=k[1][1];this.e=k[0][2];this.f=k[1][2];return this};n.invert=function(){var a=this.a*this.d-this.b*this.c;return new w(this.d/a,-this.b/a,-this.c/a,this.a/a,(this.c*this.f-this.d*this.e)/a,(this.b*this.e-this.a*this.f)/a)};n.clone=function(){return new w(this.a,this.b,this.c,this.d,this.e,
this.f)};n.translate=function(a,d){return this.add(1,0,0,1,a,d)};n.scale=function(a,d,e,f){null==d&&(d=a);(e||f)&&this.add(1,0,0,1,e,f);this.add(a,0,0,d,0,0);(e||f)&&this.add(1,0,0,1,-e,-f);return this};n.rotate=function(b,d,e){b=a.rad(b);d=d||0;e=e||0;var l=+f.cos(b).toFixed(9);b=+f.sin(b).toFixed(9);this.add(l,b,-b,l,d,e);return this.add(1,0,0,1,-d,-e)};n.x=function(a,d){return a*this.a+d*this.c+this.e};n.y=function(a,d){return a*this.b+d*this.d+this.f};n.get=function(a){return+this[d.fromCharCode(97+
a)].toFixed(4)};n.toString=function(){return"matrix("+[this.get(0),this.get(1),this.get(2),this.get(3),this.get(4),this.get(5)].join()+")"};n.offset=function(){return[this.e.toFixed(4),this.f.toFixed(4)]};n.determinant=function(){return this.a*this.d-this.b*this.c};n.split=function(){var b={};b.dx=this.e;b.dy=this.f;var d=[[this.a,this.c],[this.b,this.d] ];b.scalex=f.sqrt(k(d[0]));p(d[0]);b.shear=d[0][0]*d[1][0]+d[0][1]*d[1][1];d[1]=[d[1][0]-d[0][0]*b.shear,d[1][1]-d[0][1]*b.shear];b.scaley=f.sqrt(k(d[1]));
p(d[1]);b.shear/=b.scaley;0>this.determinant()&&(b.scalex=-b.scalex);var e=-d[0][1],d=d[1][1];0>d?(b.rotate=a.deg(f.acos(d)),0>e&&(b.rotate=360-b.rotate)):b.rotate=a.deg(f.asin(e));b.isSimple=!+b.shear.toFixed(9)&&(b.scalex.toFixed(9)==b.scaley.toFixed(9)||!b.rotate);b.isSuperSimple=!+b.shear.toFixed(9)&&b.scalex.toFixed(9)==b.scaley.toFixed(9)&&!b.rotate;b.noRotation=!+b.shear.toFixed(9)&&!b.rotate;return b};n.toTransformString=function(a){a=a||this.split();if(+a.shear.toFixed(9))return"m"+[this.get(0),
this.get(1),this.get(2),this.get(3),this.get(4),this.get(5)];a.scalex=+a.scalex.toFixed(4);a.scaley=+a.scaley.toFixed(4);a.rotate=+a.rotate.toFixed(4);return(a.dx||a.dy?"t"+[+a.dx.toFixed(4),+a.dy.toFixed(4)]:"")+(1!=a.scalex||1!=a.scaley?"s"+[a.scalex,a.scaley,0,0]:"")+(a.rotate?"r"+[+a.rotate.toFixed(4),0,0]:"")}})(w.prototype);a.Matrix=w;a.matrix=function(a,d,f,b,k,e){return new w(a,d,f,b,k,e)}});C.plugin(function(a,v,y,M,A){function w(h){return function(d){k.stop();d instanceof A&&1==d.node.childNodes.length&&
("radialGradient"==d.node.firstChild.tagName||"linearGradient"==d.node.firstChild.tagName||"pattern"==d.node.firstChild.tagName)&&(d=d.node.firstChild,b(this).appendChild(d),d=u(d));if(d instanceof v)if("radialGradient"==d.type||"linearGradient"==d.type||"pattern"==d.type){d.node.id||e(d.node,{id:d.id});var f=l(d.node.id)}else f=d.attr(h);else f=a.color(d),f.error?(f=a(b(this).ownerSVGElement).gradient(d))?(f.node.id||e(f.node,{id:f.id}),f=l(f.node.id)):f=d:f=r(f);d={};d[h]=f;e(this.node,d);this.node.style[h]=
x}}function z(a){k.stop();a==+a&&(a+="px");this.node.style.fontSize=a}function d(a){var b=[];a=a.childNodes;for(var e=0,f=a.length;e<f;e++){var l=a[e];3==l.nodeType&&b.push(l.nodeValue);"tspan"==l.tagName&&(1==l.childNodes.length&&3==l.firstChild.nodeType?b.push(l.firstChild.nodeValue):b.push(d(l)))}return b}function f(){k.stop();return this.node.style.fontSize}var n=a._.make,u=a._.wrap,p=a.is,b=a._.getSomeDefs,q=/^url\(#?([^)]+)\)$/,e=a._.$,l=a.url,r=String,s=a._.separator,x="";k.on("snap.util.attr.mask",
function(a){if(a instanceof v||a instanceof A){k.stop();a instanceof A&&1==a.node.childNodes.length&&(a=a.node.firstChild,b(this).appendChild(a),a=u(a));if("mask"==a.type)var d=a;else d=n("mask",b(this)),d.node.appendChild(a.node);!d.node.id&&e(d.node,{id:d.id});e(this.node,{mask:l(d.id)})}});(function(a){k.on("snap.util.attr.clip",a);k.on("snap.util.attr.clip-path",a);k.on("snap.util.attr.clipPath",a)})(function(a){if(a instanceof v||a instanceof A){k.stop();if("clipPath"==a.type)var d=a;else d=
n("clipPath",b(this)),d.node.appendChild(a.node),!d.node.id&&e(d.node,{id:d.id});e(this.node,{"clip-path":l(d.id)})}});k.on("snap.util.attr.fill",w("fill"));k.on("snap.util.attr.stroke",w("stroke"));var G=/^([lr])(?:\(([^)]*)\))?(.*)$/i;k.on("snap.util.grad.parse",function(a){a=r(a);var b=a.match(G);if(!b)return null;a=b[1];var e=b[2],b=b[3],e=e.split(/\s*,\s*/).map(function(a){return+a==a?+a:a});1==e.length&&0==e[0]&&(e=[]);b=b.split("-");b=b.map(function(a){a=a.split(":");var b={color:a[0]};a[1]&&
(b.offset=parseFloat(a[1]));return b});return{type:a,params:e,stops:b}});k.on("snap.util.attr.d",function(b){k.stop();p(b,"array")&&p(b[0],"array")&&(b=a.path.toString.call(b));b=r(b);b.match(/[ruo]/i)&&(b=a.path.toAbsolute(b));e(this.node,{d:b})})(-1);k.on("snap.util.attr.#text",function(a){k.stop();a=r(a);for(a=M.doc.createTextNode(a);this.node.firstChild;)this.node.removeChild(this.node.firstChild);this.node.appendChild(a)})(-1);k.on("snap.util.attr.path",function(a){k.stop();this.attr({d:a})})(-1);
k.on("snap.util.attr.class",function(a){k.stop();this.node.className.baseVal=a})(-1);k.on("snap.util.attr.viewBox",function(a){a=p(a,"object")&&"x"in a?[a.x,a.y,a.width,a.height].join(" "):p(a,"array")?a.join(" "):a;e(this.node,{viewBox:a});k.stop()})(-1);k.on("snap.util.attr.transform",function(a){this.transform(a);k.stop()})(-1);k.on("snap.util.attr.r",function(a){"rect"==this.type&&(k.stop(),e(this.node,{rx:a,ry:a}))})(-1);k.on("snap.util.attr.textpath",function(a){k.stop();if("text"==this.type){var d,
f;if(!a&&this.textPath){for(a=this.textPath;a.node.firstChild;)this.node.appendChild(a.node.firstChild);a.remove();delete this.textPath}else if(p(a,"string")?(d=b(this),a=u(d.parentNode).path(a),d.appendChild(a.node),d=a.id,a.attr({id:d})):(a=u(a),a instanceof v&&(d=a.attr("id"),d||(d=a.id,a.attr({id:d})))),d)if(a=this.textPath,f=this.node,a)a.attr({"xlink:href":"#"+d});else{for(a=e("textPath",{"xlink:href":"#"+d});f.firstChild;)a.appendChild(f.firstChild);f.appendChild(a);this.textPath=u(a)}}})(-1);
k.on("snap.util.attr.text",function(a){if("text"==this.type){for(var b=this.node,d=function(a){var b=e("tspan");if(p(a,"array"))for(var f=0;f<a.length;f++)b.appendChild(d(a[f]));else b.appendChild(M.doc.createTextNode(a));b.normalize&&b.normalize();return b};b.firstChild;)b.removeChild(b.firstChild);for(a=d(a);a.firstChild;)b.appendChild(a.firstChild)}k.stop()})(-1);k.on("snap.util.attr.fontSize",z)(-1);k.on("snap.util.attr.font-size",z)(-1);k.on("snap.util.getattr.transform",function(){k.stop();
return this.transform()})(-1);k.on("snap.util.getattr.textpath",function(){k.stop();return this.textPath})(-1);(function(){function b(d){return function(){k.stop();var b=M.doc.defaultView.getComputedStyle(this.node,null).getPropertyValue("marker-"+d);return"none"==b?b:a(M.doc.getElementById(b.match(q)[1]))}}function d(a){return function(b){k.stop();var d="marker"+a.charAt(0).toUpperCase()+a.substring(1);if(""==b||!b)this.node.style[d]="none";else if("marker"==b.type){var f=b.node.id;f||e(b.node,{id:b.id});
this.node.style[d]=l(f)}}}k.on("snap.util.getattr.marker-end",b("end"))(-1);k.on("snap.util.getattr.markerEnd",b("end"))(-1);k.on("snap.util.getattr.marker-start",b("start"))(-1);k.on("snap.util.getattr.markerStart",b("start"))(-1);k.on("snap.util.getattr.marker-mid",b("mid"))(-1);k.on("snap.util.getattr.markerMid",b("mid"))(-1);k.on("snap.util.attr.marker-end",d("end"))(-1);k.on("snap.util.attr.markerEnd",d("end"))(-1);k.on("snap.util.attr.marker-start",d("start"))(-1);k.on("snap.util.attr.markerStart",
d("start"))(-1);k.on("snap.util.attr.marker-mid",d("mid"))(-1);k.on("snap.util.attr.markerMid",d("mid"))(-1)})();k.on("snap.util.getattr.r",function(){if("rect"==this.type&&e(this.node,"rx")==e(this.node,"ry"))return k.stop(),e(this.node,"rx")})(-1);k.on("snap.util.getattr.text",function(){if("text"==this.type||"tspan"==this.type){k.stop();var a=d(this.node);return 1==a.length?a[0]:a}})(-1);k.on("snap.util.getattr.#text",function(){return this.node.textContent})(-1);k.on("snap.util.getattr.viewBox",
function(){k.stop();var b=e(this.node,"viewBox");if(b)return b=b.split(s),a._.box(+b[0],+b[1],+b[2],+b[3])})(-1);k.on("snap.util.getattr.points",function(){var a=e(this.node,"points");k.stop();if(a)return a.split(s)})(-1);k.on("snap.util.getattr.path",function(){var a=e(this.node,"d");k.stop();return a})(-1);k.on("snap.util.getattr.class",function(){return this.node.className.baseVal})(-1);k.on("snap.util.getattr.fontSize",f)(-1);k.on("snap.util.getattr.font-size",f)(-1)});C.plugin(function(a,v,y,
M,A){function w(a){return a}function z(a){return function(b){return+b.toFixed(3)+a}}var d={"+":function(a,b){return a+b},"-":function(a,b){return a-b},"/":function(a,b){return a/b},"*":function(a,b){return a*b}},f=String,n=/[a-z]+$/i,u=/^\s*([+\-\/*])\s*=\s*([\d.eE+\-]+)\s*([^\d\s]+)?\s*$/;k.on("snap.util.attr",function(a){if(a=f(a).match(u)){var b=k.nt(),b=b.substring(b.lastIndexOf(".")+1),q=this.attr(b),e={};k.stop();var l=a[3]||"",r=q.match(n),s=d[a[1] ];r&&r==l?a=s(parseFloat(q),+a[2]):(q=this.asPX(b),
a=s(this.asPX(b),this.asPX(b,a[2]+l)));isNaN(q)||isNaN(a)||(e[b]=a,this.attr(e))}})(-10);k.on("snap.util.equal",function(a,b){var q=f(this.attr(a)||""),e=f(b).match(u);if(e){k.stop();var l=e[3]||"",r=q.match(n),s=d[e[1] ];if(r&&r==l)return{from:parseFloat(q),to:s(parseFloat(q),+e[2]),f:z(r)};q=this.asPX(a);return{from:q,to:s(q,this.asPX(a,e[2]+l)),f:w}}})(-10)});C.plugin(function(a,v,y,M,A){var w=y.prototype,z=a.is;w.rect=function(a,d,k,p,b,q){var e;null==q&&(q=b);z(a,"object")&&"[object Object]"==
a?e=a:null!=a&&(e={x:a,y:d,width:k,height:p},null!=b&&(e.rx=b,e.ry=q));return this.el("rect",e)};w.circle=function(a,d,k){var p;z(a,"object")&&"[object Object]"==a?p=a:null!=a&&(p={cx:a,cy:d,r:k});return this.el("circle",p)};var d=function(){function a(){this.parentNode.removeChild(this)}return function(d,k){var p=M.doc.createElement("img"),b=M.doc.body;p.style.cssText="position:absolute;left:-9999em;top:-9999em";p.onload=function(){k.call(p);p.onload=p.onerror=null;b.removeChild(p)};p.onerror=a;
b.appendChild(p);p.src=d}}();w.image=function(f,n,k,p,b){var q=this.el("image");if(z(f,"object")&&"src"in f)q.attr(f);else if(null!=f){var e={"xlink:href":f,preserveAspectRatio:"none"};null!=n&&null!=k&&(e.x=n,e.y=k);null!=p&&null!=b?(e.width=p,e.height=b):d(f,function(){a._.$(q.node,{width:this.offsetWidth,height:this.offsetHeight})});a._.$(q.node,e)}return q};w.ellipse=function(a,d,k,p){var b;z(a,"object")&&"[object Object]"==a?b=a:null!=a&&(b={cx:a,cy:d,rx:k,ry:p});return this.el("ellipse",b)};
w.path=function(a){var d;z(a,"object")&&!z(a,"array")?d=a:a&&(d={d:a});return this.el("path",d)};w.group=w.g=function(a){var d=this.el("g");1==arguments.length&&a&&!a.type?d.attr(a):arguments.length&&d.add(Array.prototype.slice.call(arguments,0));return d};w.svg=function(a,d,k,p,b,q,e,l){var r={};z(a,"object")&&null==d?r=a:(null!=a&&(r.x=a),null!=d&&(r.y=d),null!=k&&(r.width=k),null!=p&&(r.height=p),null!=b&&null!=q&&null!=e&&null!=l&&(r.viewBox=[b,q,e,l]));return this.el("svg",r)};w.mask=function(a){var d=
this.el("mask");1==arguments.length&&a&&!a.type?d.attr(a):arguments.length&&d.add(Array.prototype.slice.call(arguments,0));return d};w.ptrn=function(a,d,k,p,b,q,e,l){if(z(a,"object"))var r=a;else arguments.length?(r={},null!=a&&(r.x=a),null!=d&&(r.y=d),null!=k&&(r.width=k),null!=p&&(r.height=p),null!=b&&null!=q&&null!=e&&null!=l&&(r.viewBox=[b,q,e,l])):r={patternUnits:"userSpaceOnUse"};return this.el("pattern",r)};w.use=function(a){return null!=a?(make("use",this.node),a instanceof v&&(a.attr("id")||
a.attr({id:ID()}),a=a.attr("id")),this.el("use",{"xlink:href":a})):v.prototype.use.call(this)};w.text=function(a,d,k){var p={};z(a,"object")?p=a:null!=a&&(p={x:a,y:d,text:k||""});return this.el("text",p)};w.line=function(a,d,k,p){var b={};z(a,"object")?b=a:null!=a&&(b={x1:a,x2:k,y1:d,y2:p});return this.el("line",b)};w.polyline=function(a){1<arguments.length&&(a=Array.prototype.slice.call(arguments,0));var d={};z(a,"object")&&!z(a,"array")?d=a:null!=a&&(d={points:a});return this.el("polyline",d)};
w.polygon=function(a){1<arguments.length&&(a=Array.prototype.slice.call(arguments,0));var d={};z(a,"object")&&!z(a,"array")?d=a:null!=a&&(d={points:a});return this.el("polygon",d)};(function(){function d(){return this.selectAll("stop")}function n(b,d){var f=e("stop"),k={offset:+d+"%"};b=a.color(b);k["stop-color"]=b.hex;1>b.opacity&&(k["stop-opacity"]=b.opacity);e(f,k);this.node.appendChild(f);return this}function u(){if("linearGradient"==this.type){var b=e(this.node,"x1")||0,d=e(this.node,"x2")||
1,f=e(this.node,"y1")||0,k=e(this.node,"y2")||0;return a._.box(b,f,math.abs(d-b),math.abs(k-f))}b=this.node.r||0;return a._.box((this.node.cx||0.5)-b,(this.node.cy||0.5)-b,2*b,2*b)}function p(a,d){function f(a,b){for(var d=(b-u)/(a-w),e=w;e<a;e++)h[e].offset=+(+u+d*(e-w)).toFixed(2);w=a;u=b}var n=k("snap.util.grad.parse",null,d).firstDefined(),p;if(!n)return null;n.params.unshift(a);p="l"==n.type.toLowerCase()?b.apply(0,n.params):q.apply(0,n.params);n.type!=n.type.toLowerCase()&&e(p.node,{gradientUnits:"userSpaceOnUse"});
var h=n.stops,n=h.length,u=0,w=0;n--;for(var v=0;v<n;v++)"offset"in h[v]&&f(v,h[v].offset);h[n].offset=h[n].offset||100;f(n,h[n].offset);for(v=0;v<=n;v++){var y=h[v];p.addStop(y.color,y.offset)}return p}function b(b,k,p,q,w){b=a._.make("linearGradient",b);b.stops=d;b.addStop=n;b.getBBox=u;null!=k&&e(b.node,{x1:k,y1:p,x2:q,y2:w});return b}function q(b,k,p,q,w,h){b=a._.make("radialGradient",b);b.stops=d;b.addStop=n;b.getBBox=u;null!=k&&e(b.node,{cx:k,cy:p,r:q});null!=w&&null!=h&&e(b.node,{fx:w,fy:h});
return b}var e=a._.$;w.gradient=function(a){return p(this.defs,a)};w.gradientLinear=function(a,d,e,f){return b(this.defs,a,d,e,f)};w.gradientRadial=function(a,b,d,e,f){return q(this.defs,a,b,d,e,f)};w.toString=function(){var b=this.node.ownerDocument,d=b.createDocumentFragment(),b=b.createElement("div"),e=this.node.cloneNode(!0);d.appendChild(b);b.appendChild(e);a._.$(e,{xmlns:"http://www.w3.org/2000/svg"});b=b.innerHTML;d.removeChild(d.firstChild);return b};w.clear=function(){for(var a=this.node.firstChild,
b;a;)b=a.nextSibling,"defs"!=a.tagName?a.parentNode.removeChild(a):w.clear.call({node:a}),a=b}})()});C.plugin(function(a,k,y,M){function A(a){var b=A.ps=A.ps||{};b[a]?b[a].sleep=100:b[a]={sleep:100};setTimeout(function(){for(var d in b)b[L](d)&&d!=a&&(b[d].sleep--,!b[d].sleep&&delete b[d])});return b[a]}function w(a,b,d,e){null==a&&(a=b=d=e=0);null==b&&(b=a.y,d=a.width,e=a.height,a=a.x);return{x:a,y:b,width:d,w:d,height:e,h:e,x2:a+d,y2:b+e,cx:a+d/2,cy:b+e/2,r1:F.min(d,e)/2,r2:F.max(d,e)/2,r0:F.sqrt(d*
d+e*e)/2,path:s(a,b,d,e),vb:[a,b,d,e].join(" ")}}function z(){return this.join(",").replace(N,"$1")}function d(a){a=C(a);a.toString=z;return a}function f(a,b,d,h,f,k,l,n,p){if(null==p)return e(a,b,d,h,f,k,l,n);if(0>p||e(a,b,d,h,f,k,l,n)<p)p=void 0;else{var q=0.5,O=1-q,s;for(s=e(a,b,d,h,f,k,l,n,O);0.01<Z(s-p);)q/=2,O+=(s<p?1:-1)*q,s=e(a,b,d,h,f,k,l,n,O);p=O}return u(a,b,d,h,f,k,l,n,p)}function n(b,d){function e(a){return+(+a).toFixed(3)}return a._.cacher(function(a,h,l){a instanceof k&&(a=a.attr("d"));
a=I(a);for(var n,p,D,q,O="",s={},c=0,t=0,r=a.length;t<r;t++){D=a[t];if("M"==D[0])n=+D[1],p=+D[2];else{q=f(n,p,D[1],D[2],D[3],D[4],D[5],D[6]);if(c+q>h){if(d&&!s.start){n=f(n,p,D[1],D[2],D[3],D[4],D[5],D[6],h-c);O+=["C"+e(n.start.x),e(n.start.y),e(n.m.x),e(n.m.y),e(n.x),e(n.y)];if(l)return O;s.start=O;O=["M"+e(n.x),e(n.y)+"C"+e(n.n.x),e(n.n.y),e(n.end.x),e(n.end.y),e(D[5]),e(D[6])].join();c+=q;n=+D[5];p=+D[6];continue}if(!b&&!d)return n=f(n,p,D[1],D[2],D[3],D[4],D[5],D[6],h-c)}c+=q;n=+D[5];p=+D[6]}O+=
D.shift()+D}s.end=O;return n=b?c:d?s:u(n,p,D[0],D[1],D[2],D[3],D[4],D[5],1)},null,a._.clone)}function u(a,b,d,e,h,f,k,l,n){var p=1-n,q=ma(p,3),s=ma(p,2),c=n*n,t=c*n,r=q*a+3*s*n*d+3*p*n*n*h+t*k,q=q*b+3*s*n*e+3*p*n*n*f+t*l,s=a+2*n*(d-a)+c*(h-2*d+a),t=b+2*n*(e-b)+c*(f-2*e+b),x=d+2*n*(h-d)+c*(k-2*h+d),c=e+2*n*(f-e)+c*(l-2*f+e);a=p*a+n*d;b=p*b+n*e;h=p*h+n*k;f=p*f+n*l;l=90-180*F.atan2(s-x,t-c)/S;return{x:r,y:q,m:{x:s,y:t},n:{x:x,y:c},start:{x:a,y:b},end:{x:h,y:f},alpha:l}}function p(b,d,e,h,f,n,k,l){a.is(b,
"array")||(b=[b,d,e,h,f,n,k,l]);b=U.apply(null,b);return w(b.min.x,b.min.y,b.max.x-b.min.x,b.max.y-b.min.y)}function b(a,b,d){return b>=a.x&&b<=a.x+a.width&&d>=a.y&&d<=a.y+a.height}function q(a,d){a=w(a);d=w(d);return b(d,a.x,a.y)||b(d,a.x2,a.y)||b(d,a.x,a.y2)||b(d,a.x2,a.y2)||b(a,d.x,d.y)||b(a,d.x2,d.y)||b(a,d.x,d.y2)||b(a,d.x2,d.y2)||(a.x<d.x2&&a.x>d.x||d.x<a.x2&&d.x>a.x)&&(a.y<d.y2&&a.y>d.y||d.y<a.y2&&d.y>a.y)}function e(a,b,d,e,h,f,n,k,l){null==l&&(l=1);l=(1<l?1:0>l?0:l)/2;for(var p=[-0.1252,
0.1252,-0.3678,0.3678,-0.5873,0.5873,-0.7699,0.7699,-0.9041,0.9041,-0.9816,0.9816],q=[0.2491,0.2491,0.2335,0.2335,0.2032,0.2032,0.1601,0.1601,0.1069,0.1069,0.0472,0.0472],s=0,c=0;12>c;c++)var t=l*p[c]+l,r=t*(t*(-3*a+9*d-9*h+3*n)+6*a-12*d+6*h)-3*a+3*d,t=t*(t*(-3*b+9*e-9*f+3*k)+6*b-12*e+6*f)-3*b+3*e,s=s+q[c]*F.sqrt(r*r+t*t);return l*s}function l(a,b,d){a=I(a);b=I(b);for(var h,f,l,n,k,s,r,O,x,c,t=d?0:[],w=0,v=a.length;w<v;w++)if(x=a[w],"M"==x[0])h=k=x[1],f=s=x[2];else{"C"==x[0]?(x=[h,f].concat(x.slice(1)),
h=x[6],f=x[7]):(x=[h,f,h,f,k,s,k,s],h=k,f=s);for(var G=0,y=b.length;G<y;G++)if(c=b[G],"M"==c[0])l=r=c[1],n=O=c[2];else{"C"==c[0]?(c=[l,n].concat(c.slice(1)),l=c[6],n=c[7]):(c=[l,n,l,n,r,O,r,O],l=r,n=O);var z;var K=x,B=c;z=d;var H=p(K),J=p(B);if(q(H,J)){for(var H=e.apply(0,K),J=e.apply(0,B),H=~~(H/8),J=~~(J/8),U=[],A=[],F={},M=z?0:[],P=0;P<H+1;P++){var C=u.apply(0,K.concat(P/H));U.push({x:C.x,y:C.y,t:P/H})}for(P=0;P<J+1;P++)C=u.apply(0,B.concat(P/J)),A.push({x:C.x,y:C.y,t:P/J});for(P=0;P<H;P++)for(K=
0;K<J;K++){var Q=U[P],L=U[P+1],B=A[K],C=A[K+1],N=0.001>Z(L.x-Q.x)?"y":"x",S=0.001>Z(C.x-B.x)?"y":"x",R;R=Q.x;var Y=Q.y,V=L.x,ea=L.y,fa=B.x,ga=B.y,ha=C.x,ia=C.y;if(W(R,V)<X(fa,ha)||X(R,V)>W(fa,ha)||W(Y,ea)<X(ga,ia)||X(Y,ea)>W(ga,ia))R=void 0;else{var $=(R*ea-Y*V)*(fa-ha)-(R-V)*(fa*ia-ga*ha),aa=(R*ea-Y*V)*(ga-ia)-(Y-ea)*(fa*ia-ga*ha),ja=(R-V)*(ga-ia)-(Y-ea)*(fa-ha);if(ja){var $=$/ja,aa=aa/ja,ja=+$.toFixed(2),ba=+aa.toFixed(2);R=ja<+X(R,V).toFixed(2)||ja>+W(R,V).toFixed(2)||ja<+X(fa,ha).toFixed(2)||
ja>+W(fa,ha).toFixed(2)||ba<+X(Y,ea).toFixed(2)||ba>+W(Y,ea).toFixed(2)||ba<+X(ga,ia).toFixed(2)||ba>+W(ga,ia).toFixed(2)?void 0:{x:$,y:aa}}else R=void 0}R&&F[R.x.toFixed(4)]!=R.y.toFixed(4)&&(F[R.x.toFixed(4)]=R.y.toFixed(4),Q=Q.t+Z((R[N]-Q[N])/(L[N]-Q[N]))*(L.t-Q.t),B=B.t+Z((R[S]-B[S])/(C[S]-B[S]))*(C.t-B.t),0<=Q&&1>=Q&&0<=B&&1>=B&&(z?M++:M.push({x:R.x,y:R.y,t1:Q,t2:B})))}z=M}else z=z?0:[];if(d)t+=z;else{H=0;for(J=z.length;H<J;H++)z[H].segment1=w,z[H].segment2=G,z[H].bez1=x,z[H].bez2=c;t=t.concat(z)}}}return t}
function r(a){var b=A(a);if(b.bbox)return C(b.bbox);if(!a)return w();a=I(a);for(var d=0,e=0,h=[],f=[],l,n=0,k=a.length;n<k;n++)l=a[n],"M"==l[0]?(d=l[1],e=l[2],h.push(d),f.push(e)):(d=U(d,e,l[1],l[2],l[3],l[4],l[5],l[6]),h=h.concat(d.min.x,d.max.x),f=f.concat(d.min.y,d.max.y),d=l[5],e=l[6]);a=X.apply(0,h);l=X.apply(0,f);h=W.apply(0,h);f=W.apply(0,f);f=w(a,l,h-a,f-l);b.bbox=C(f);return f}function s(a,b,d,e,h){if(h)return[["M",+a+ +h,b],["l",d-2*h,0],["a",h,h,0,0,1,h,h],["l",0,e-2*h],["a",h,h,0,0,1,
-h,h],["l",2*h-d,0],["a",h,h,0,0,1,-h,-h],["l",0,2*h-e],["a",h,h,0,0,1,h,-h],["z"] ];a=[["M",a,b],["l",d,0],["l",0,e],["l",-d,0],["z"] ];a.toString=z;return a}function x(a,b,d,e,h){null==h&&null==e&&(e=d);a=+a;b=+b;d=+d;e=+e;if(null!=h){var f=Math.PI/180,l=a+d*Math.cos(-e*f);a+=d*Math.cos(-h*f);var n=b+d*Math.sin(-e*f);b+=d*Math.sin(-h*f);d=[["M",l,n],["A",d,d,0,+(180<h-e),0,a,b] ]}else d=[["M",a,b],["m",0,-e],["a",d,e,0,1,1,0,2*e],["a",d,e,0,1,1,0,-2*e],["z"] ];d.toString=z;return d}function G(b){var e=
A(b);if(e.abs)return d(e.abs);Q(b,"array")&&Q(b&&b[0],"array")||(b=a.parsePathString(b));if(!b||!b.length)return[["M",0,0] ];var h=[],f=0,l=0,n=0,k=0,p=0;"M"==b[0][0]&&(f=+b[0][1],l=+b[0][2],n=f,k=l,p++,h[0]=["M",f,l]);for(var q=3==b.length&&"M"==b[0][0]&&"R"==b[1][0].toUpperCase()&&"Z"==b[2][0].toUpperCase(),s,r,w=p,c=b.length;w<c;w++){h.push(s=[]);r=b[w];p=r[0];if(p!=p.toUpperCase())switch(s[0]=p.toUpperCase(),s[0]){case "A":s[1]=r[1];s[2]=r[2];s[3]=r[3];s[4]=r[4];s[5]=r[5];s[6]=+r[6]+f;s[7]=+r[7]+
l;break;case "V":s[1]=+r[1]+l;break;case "H":s[1]=+r[1]+f;break;case "R":for(var t=[f,l].concat(r.slice(1)),u=2,v=t.length;u<v;u++)t[u]=+t[u]+f,t[++u]=+t[u]+l;h.pop();h=h.concat(P(t,q));break;case "O":h.pop();t=x(f,l,r[1],r[2]);t.push(t[0]);h=h.concat(t);break;case "U":h.pop();h=h.concat(x(f,l,r[1],r[2],r[3]));s=["U"].concat(h[h.length-1].slice(-2));break;case "M":n=+r[1]+f,k=+r[2]+l;default:for(u=1,v=r.length;u<v;u++)s[u]=+r[u]+(u%2?f:l)}else if("R"==p)t=[f,l].concat(r.slice(1)),h.pop(),h=h.concat(P(t,
q)),s=["R"].concat(r.slice(-2));else if("O"==p)h.pop(),t=x(f,l,r[1],r[2]),t.push(t[0]),h=h.concat(t);else if("U"==p)h.pop(),h=h.concat(x(f,l,r[1],r[2],r[3])),s=["U"].concat(h[h.length-1].slice(-2));else for(t=0,u=r.length;t<u;t++)s[t]=r[t];p=p.toUpperCase();if("O"!=p)switch(s[0]){case "Z":f=+n;l=+k;break;case "H":f=s[1];break;case "V":l=s[1];break;case "M":n=s[s.length-2],k=s[s.length-1];default:f=s[s.length-2],l=s[s.length-1]}}h.toString=z;e.abs=d(h);return h}function h(a,b,d,e){return[a,b,d,e,d,
e]}function J(a,b,d,e,h,f){var l=1/3,n=2/3;return[l*a+n*d,l*b+n*e,l*h+n*d,l*f+n*e,h,f]}function K(b,d,e,h,f,l,n,k,p,s){var r=120*S/180,q=S/180*(+f||0),c=[],t,x=a._.cacher(function(a,b,c){var d=a*F.cos(c)-b*F.sin(c);a=a*F.sin(c)+b*F.cos(c);return{x:d,y:a}});if(s)v=s[0],t=s[1],l=s[2],u=s[3];else{t=x(b,d,-q);b=t.x;d=t.y;t=x(k,p,-q);k=t.x;p=t.y;F.cos(S/180*f);F.sin(S/180*f);t=(b-k)/2;v=(d-p)/2;u=t*t/(e*e)+v*v/(h*h);1<u&&(u=F.sqrt(u),e*=u,h*=u);var u=e*e,w=h*h,u=(l==n?-1:1)*F.sqrt(Z((u*w-u*v*v-w*t*t)/
(u*v*v+w*t*t)));l=u*e*v/h+(b+k)/2;var u=u*-h*t/e+(d+p)/2,v=F.asin(((d-u)/h).toFixed(9));t=F.asin(((p-u)/h).toFixed(9));v=b<l?S-v:v;t=k<l?S-t:t;0>v&&(v=2*S+v);0>t&&(t=2*S+t);n&&v>t&&(v-=2*S);!n&&t>v&&(t-=2*S)}if(Z(t-v)>r){var c=t,w=k,G=p;t=v+r*(n&&t>v?1:-1);k=l+e*F.cos(t);p=u+h*F.sin(t);c=K(k,p,e,h,f,0,n,w,G,[t,c,l,u])}l=t-v;f=F.cos(v);r=F.sin(v);n=F.cos(t);t=F.sin(t);l=F.tan(l/4);e=4/3*e*l;l*=4/3*h;h=[b,d];b=[b+e*r,d-l*f];d=[k+e*t,p-l*n];k=[k,p];b[0]=2*h[0]-b[0];b[1]=2*h[1]-b[1];if(s)return[b,d,k].concat(c);
c=[b,d,k].concat(c).join().split(",");s=[];k=0;for(p=c.length;k<p;k++)s[k]=k%2?x(c[k-1],c[k],q).y:x(c[k],c[k+1],q).x;return s}function U(a,b,d,e,h,f,l,k){for(var n=[],p=[[],[] ],s,r,c,t,q=0;2>q;++q)0==q?(r=6*a-12*d+6*h,s=-3*a+9*d-9*h+3*l,c=3*d-3*a):(r=6*b-12*e+6*f,s=-3*b+9*e-9*f+3*k,c=3*e-3*b),1E-12>Z(s)?1E-12>Z(r)||(s=-c/r,0<s&&1>s&&n.push(s)):(t=r*r-4*c*s,c=F.sqrt(t),0>t||(t=(-r+c)/(2*s),0<t&&1>t&&n.push(t),s=(-r-c)/(2*s),0<s&&1>s&&n.push(s)));for(r=q=n.length;q--;)s=n[q],c=1-s,p[0][q]=c*c*c*a+3*
c*c*s*d+3*c*s*s*h+s*s*s*l,p[1][q]=c*c*c*b+3*c*c*s*e+3*c*s*s*f+s*s*s*k;p[0][r]=a;p[1][r]=b;p[0][r+1]=l;p[1][r+1]=k;p[0].length=p[1].length=r+2;return{min:{x:X.apply(0,p[0]),y:X.apply(0,p[1])},max:{x:W.apply(0,p[0]),y:W.apply(0,p[1])}}}function I(a,b){var e=!b&&A(a);if(!b&&e.curve)return d(e.curve);var f=G(a),l=b&&G(b),n={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},k={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},p=function(a,b,c){if(!a)return["C",b.x,b.y,b.x,b.y,b.x,b.y];a[0]in{T:1,Q:1}||(b.qx=b.qy=null);
switch(a[0]){case "M":b.X=a[1];b.Y=a[2];break;case "A":a=["C"].concat(K.apply(0,[b.x,b.y].concat(a.slice(1))));break;case "S":"C"==c||"S"==c?(c=2*b.x-b.bx,b=2*b.y-b.by):(c=b.x,b=b.y);a=["C",c,b].concat(a.slice(1));break;case "T":"Q"==c||"T"==c?(b.qx=2*b.x-b.qx,b.qy=2*b.y-b.qy):(b.qx=b.x,b.qy=b.y);a=["C"].concat(J(b.x,b.y,b.qx,b.qy,a[1],a[2]));break;case "Q":b.qx=a[1];b.qy=a[2];a=["C"].concat(J(b.x,b.y,a[1],a[2],a[3],a[4]));break;case "L":a=["C"].concat(h(b.x,b.y,a[1],a[2]));break;case "H":a=["C"].concat(h(b.x,
b.y,a[1],b.y));break;case "V":a=["C"].concat(h(b.x,b.y,b.x,a[1]));break;case "Z":a=["C"].concat(h(b.x,b.y,b.X,b.Y))}return a},s=function(a,b){if(7<a[b].length){a[b].shift();for(var c=a[b];c.length;)q[b]="A",l&&(u[b]="A"),a.splice(b++,0,["C"].concat(c.splice(0,6)));a.splice(b,1);v=W(f.length,l&&l.length||0)}},r=function(a,b,c,d,e){a&&b&&"M"==a[e][0]&&"M"!=b[e][0]&&(b.splice(e,0,["M",d.x,d.y]),c.bx=0,c.by=0,c.x=a[e][1],c.y=a[e][2],v=W(f.length,l&&l.length||0))},q=[],u=[],c="",t="",x=0,v=W(f.length,
l&&l.length||0);for(;x<v;x++){f[x]&&(c=f[x][0]);"C"!=c&&(q[x]=c,x&&(t=q[x-1]));f[x]=p(f[x],n,t);"A"!=q[x]&&"C"==c&&(q[x]="C");s(f,x);l&&(l[x]&&(c=l[x][0]),"C"!=c&&(u[x]=c,x&&(t=u[x-1])),l[x]=p(l[x],k,t),"A"!=u[x]&&"C"==c&&(u[x]="C"),s(l,x));r(f,l,n,k,x);r(l,f,k,n,x);var w=f[x],z=l&&l[x],y=w.length,U=l&&z.length;n.x=w[y-2];n.y=w[y-1];n.bx=$(w[y-4])||n.x;n.by=$(w[y-3])||n.y;k.bx=l&&($(z[U-4])||k.x);k.by=l&&($(z[U-3])||k.y);k.x=l&&z[U-2];k.y=l&&z[U-1]}l||(e.curve=d(f));return l?[f,l]:f}function P(a,
b){for(var d=[],e=0,h=a.length;h-2*!b>e;e+=2){var f=[{x:+a[e-2],y:+a[e-1]},{x:+a[e],y:+a[e+1]},{x:+a[e+2],y:+a[e+3]},{x:+a[e+4],y:+a[e+5]}];b?e?h-4==e?f[3]={x:+a[0],y:+a[1]}:h-2==e&&(f[2]={x:+a[0],y:+a[1]},f[3]={x:+a[2],y:+a[3]}):f[0]={x:+a[h-2],y:+a[h-1]}:h-4==e?f[3]=f[2]:e||(f[0]={x:+a[e],y:+a[e+1]});d.push(["C",(-f[0].x+6*f[1].x+f[2].x)/6,(-f[0].y+6*f[1].y+f[2].y)/6,(f[1].x+6*f[2].x-f[3].x)/6,(f[1].y+6*f[2].y-f[3].y)/6,f[2].x,f[2].y])}return d}y=k.prototype;var Q=a.is,C=a._.clone,L="hasOwnProperty",
N=/,?([a-z]),?/gi,$=parseFloat,F=Math,S=F.PI,X=F.min,W=F.max,ma=F.pow,Z=F.abs;M=n(1);var na=n(),ba=n(0,1),V=a._unit2px;a.path=A;a.path.getTotalLength=M;a.path.getPointAtLength=na;a.path.getSubpath=function(a,b,d){if(1E-6>this.getTotalLength(a)-d)return ba(a,b).end;a=ba(a,d,1);return b?ba(a,b).end:a};y.getTotalLength=function(){if(this.node.getTotalLength)return this.node.getTotalLength()};y.getPointAtLength=function(a){return na(this.attr("d"),a)};y.getSubpath=function(b,d){return a.path.getSubpath(this.attr("d"),
b,d)};a._.box=w;a.path.findDotsAtSegment=u;a.path.bezierBBox=p;a.path.isPointInsideBBox=b;a.path.isBBoxIntersect=q;a.path.intersection=function(a,b){return l(a,b)};a.path.intersectionNumber=function(a,b){return l(a,b,1)};a.path.isPointInside=function(a,d,e){var h=r(a);return b(h,d,e)&&1==l(a,[["M",d,e],["H",h.x2+10] ],1)%2};a.path.getBBox=r;a.path.get={path:function(a){return a.attr("path")},circle:function(a){a=V(a);return x(a.cx,a.cy,a.r)},ellipse:function(a){a=V(a);return x(a.cx||0,a.cy||0,a.rx,
a.ry)},rect:function(a){a=V(a);return s(a.x||0,a.y||0,a.width,a.height,a.rx,a.ry)},image:function(a){a=V(a);return s(a.x||0,a.y||0,a.width,a.height)},line:function(a){return"M"+[a.attr("x1")||0,a.attr("y1")||0,a.attr("x2"),a.attr("y2")]},polyline:function(a){return"M"+a.attr("points")},polygon:function(a){return"M"+a.attr("points")+"z"},deflt:function(a){a=a.node.getBBox();return s(a.x,a.y,a.width,a.height)}};a.path.toRelative=function(b){var e=A(b),h=String.prototype.toLowerCase;if(e.rel)return d(e.rel);
a.is(b,"array")&&a.is(b&&b[0],"array")||(b=a.parsePathString(b));var f=[],l=0,n=0,k=0,p=0,s=0;"M"==b[0][0]&&(l=b[0][1],n=b[0][2],k=l,p=n,s++,f.push(["M",l,n]));for(var r=b.length;s<r;s++){var q=f[s]=[],x=b[s];if(x[0]!=h.call(x[0]))switch(q[0]=h.call(x[0]),q[0]){case "a":q[1]=x[1];q[2]=x[2];q[3]=x[3];q[4]=x[4];q[5]=x[5];q[6]=+(x[6]-l).toFixed(3);q[7]=+(x[7]-n).toFixed(3);break;case "v":q[1]=+(x[1]-n).toFixed(3);break;case "m":k=x[1],p=x[2];default:for(var c=1,t=x.length;c<t;c++)q[c]=+(x[c]-(c%2?l:
n)).toFixed(3)}else for(f[s]=[],"m"==x[0]&&(k=x[1]+l,p=x[2]+n),q=0,c=x.length;q<c;q++)f[s][q]=x[q];x=f[s].length;switch(f[s][0]){case "z":l=k;n=p;break;case "h":l+=+f[s][x-1];break;case "v":n+=+f[s][x-1];break;default:l+=+f[s][x-2],n+=+f[s][x-1]}}f.toString=z;e.rel=d(f);return f};a.path.toAbsolute=G;a.path.toCubic=I;a.path.map=function(a,b){if(!b)return a;var d,e,h,f,l,n,k;a=I(a);h=0;for(l=a.length;h<l;h++)for(k=a[h],f=1,n=k.length;f<n;f+=2)d=b.x(k[f],k[f+1]),e=b.y(k[f],k[f+1]),k[f]=d,k[f+1]=e;return a};
a.path.toString=z;a.path.clone=d});C.plugin(function(a,v,y,C){var A=Math.max,w=Math.min,z=function(a){this.items=[];this.bindings={};this.length=0;this.type="set";if(a)for(var f=0,n=a.length;f<n;f++)a[f]&&(this[this.items.length]=this.items[this.items.length]=a[f],this.length++)};v=z.prototype;v.push=function(){for(var a,f,n=0,k=arguments.length;n<k;n++)if(a=arguments[n])f=this.items.length,this[f]=this.items[f]=a,this.length++;return this};v.pop=function(){this.length&&delete this[this.length--];
return this.items.pop()};v.forEach=function(a,f){for(var n=0,k=this.items.length;n<k&&!1!==a.call(f,this.items[n],n);n++);return this};v.animate=function(d,f,n,u){"function"!=typeof n||n.length||(u=n,n=L.linear);d instanceof a._.Animation&&(u=d.callback,n=d.easing,f=n.dur,d=d.attr);var p=arguments;if(a.is(d,"array")&&a.is(p[p.length-1],"array"))var b=!0;var q,e=function(){q?this.b=q:q=this.b},l=0,r=u&&function(){l++==this.length&&u.call(this)};return this.forEach(function(a,l){k.once("snap.animcreated."+
a.id,e);b?p[l]&&a.animate.apply(a,p[l]):a.animate(d,f,n,r)})};v.remove=function(){for(;this.length;)this.pop().remove();return this};v.bind=function(a,f,k){var u={};if("function"==typeof f)this.bindings[a]=f;else{var p=k||a;this.bindings[a]=function(a){u[p]=a;f.attr(u)}}return this};v.attr=function(a){var f={},k;for(k in a)if(this.bindings[k])this.bindings[k](a[k]);else f[k]=a[k];a=0;for(k=this.items.length;a<k;a++)this.items[a].attr(f);return this};v.clear=function(){for(;this.length;)this.pop()};
v.splice=function(a,f,k){a=0>a?A(this.length+a,0):a;f=A(0,w(this.length-a,f));var u=[],p=[],b=[],q;for(q=2;q<arguments.length;q++)b.push(arguments[q]);for(q=0;q<f;q++)p.push(this[a+q]);for(;q<this.length-a;q++)u.push(this[a+q]);var e=b.length;for(q=0;q<e+u.length;q++)this.items[a+q]=this[a+q]=q<e?b[q]:u[q-e];for(q=this.items.length=this.length-=f-e;this[q];)delete this[q++];return new z(p)};v.exclude=function(a){for(var f=0,k=this.length;f<k;f++)if(this[f]==a)return this.splice(f,1),!0;return!1};
v.insertAfter=function(a){for(var f=this.items.length;f--;)this.items[f].insertAfter(a);return this};v.getBBox=function(){for(var a=[],f=[],k=[],u=[],p=this.items.length;p--;)if(!this.items[p].removed){var b=this.items[p].getBBox();a.push(b.x);f.push(b.y);k.push(b.x+b.width);u.push(b.y+b.height)}a=w.apply(0,a);f=w.apply(0,f);k=A.apply(0,k);u=A.apply(0,u);return{x:a,y:f,x2:k,y2:u,width:k-a,height:u-f,cx:a+(k-a)/2,cy:f+(u-f)/2}};v.clone=function(a){a=new z;for(var f=0,k=this.items.length;f<k;f++)a.push(this.items[f].clone());
return a};v.toString=function(){return"Snap\u2018s set"};v.type="set";a.set=function(){var a=new z;arguments.length&&a.push.apply(a,Array.prototype.slice.call(arguments,0));return a}});C.plugin(function(a,v,y,C){function A(a){var b=a[0];switch(b.toLowerCase()){case "t":return[b,0,0];case "m":return[b,1,0,0,1,0,0];case "r":return 4==a.length?[b,0,a[2],a[3] ]:[b,0];case "s":return 5==a.length?[b,1,1,a[3],a[4] ]:3==a.length?[b,1,1]:[b,1]}}function w(b,d,f){d=q(d).replace(/\.{3}|\u2026/g,b);b=a.parseTransformString(b)||
[];d=a.parseTransformString(d)||[];for(var k=Math.max(b.length,d.length),p=[],v=[],h=0,w,z,y,I;h<k;h++){y=b[h]||A(d[h]);I=d[h]||A(y);if(y[0]!=I[0]||"r"==y[0].toLowerCase()&&(y[2]!=I[2]||y[3]!=I[3])||"s"==y[0].toLowerCase()&&(y[3]!=I[3]||y[4]!=I[4])){b=a._.transform2matrix(b,f());d=a._.transform2matrix(d,f());p=[["m",b.a,b.b,b.c,b.d,b.e,b.f] ];v=[["m",d.a,d.b,d.c,d.d,d.e,d.f] ];break}p[h]=[];v[h]=[];w=0;for(z=Math.max(y.length,I.length);w<z;w++)w in y&&(p[h][w]=y[w]),w in I&&(v[h][w]=I[w])}return{from:u(p),
to:u(v),f:n(p)}}function z(a){return a}function d(a){return function(b){return+b.toFixed(3)+a}}function f(b){return a.rgb(b[0],b[1],b[2])}function n(a){var b=0,d,f,k,n,h,p,q=[];d=0;for(f=a.length;d<f;d++){h="[";p=['"'+a[d][0]+'"'];k=1;for(n=a[d].length;k<n;k++)p[k]="val["+b++ +"]";h+=p+"]";q[d]=h}return Function("val","return Snap.path.toString.call(["+q+"])")}function u(a){for(var b=[],d=0,f=a.length;d<f;d++)for(var k=1,n=a[d].length;k<n;k++)b.push(a[d][k]);return b}var p={},b=/[a-z]+$/i,q=String;
p.stroke=p.fill="colour";v.prototype.equal=function(a,b){return k("snap.util.equal",this,a,b).firstDefined()};k.on("snap.util.equal",function(e,k){var r,s;r=q(this.attr(e)||"");var x=this;if(r==+r&&k==+k)return{from:+r,to:+k,f:z};if("colour"==p[e])return r=a.color(r),s=a.color(k),{from:[r.r,r.g,r.b,r.opacity],to:[s.r,s.g,s.b,s.opacity],f:f};if("transform"==e||"gradientTransform"==e||"patternTransform"==e)return k instanceof a.Matrix&&(k=k.toTransformString()),a._.rgTransform.test(k)||(k=a._.svgTransform2string(k)),
w(r,k,function(){return x.getBBox(1)});if("d"==e||"path"==e)return r=a.path.toCubic(r,k),{from:u(r[0]),to:u(r[1]),f:n(r[0])};if("points"==e)return r=q(r).split(a._.separator),s=q(k).split(a._.separator),{from:r,to:s,f:function(a){return a}};aUnit=r.match(b);s=q(k).match(b);return aUnit&&aUnit==s?{from:parseFloat(r),to:parseFloat(k),f:d(aUnit)}:{from:this.asPX(e),to:this.asPX(e,k),f:z}})});C.plugin(function(a,v,y,C){var A=v.prototype,w="createTouch"in C.doc;v="click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend touchcancel".split(" ");
var z={mousedown:"touchstart",mousemove:"touchmove",mouseup:"touchend"},d=function(a,b){var d="y"==a?"scrollTop":"scrollLeft",e=b&&b.node?b.node.ownerDocument:C.doc;return e[d in e.documentElement?"documentElement":"body"][d]},f=function(){this.returnValue=!1},n=function(){return this.originalEvent.preventDefault()},u=function(){this.cancelBubble=!0},p=function(){return this.originalEvent.stopPropagation()},b=function(){if(C.doc.addEventListener)return function(a,b,e,f){var k=w&&z[b]?z[b]:b,l=function(k){var l=
d("y",f),q=d("x",f);if(w&&z.hasOwnProperty(b))for(var r=0,u=k.targetTouches&&k.targetTouches.length;r<u;r++)if(k.targetTouches[r].target==a||a.contains(k.targetTouches[r].target)){u=k;k=k.targetTouches[r];k.originalEvent=u;k.preventDefault=n;k.stopPropagation=p;break}return e.call(f,k,k.clientX+q,k.clientY+l)};b!==k&&a.addEventListener(b,l,!1);a.addEventListener(k,l,!1);return function(){b!==k&&a.removeEventListener(b,l,!1);a.removeEventListener(k,l,!1);return!0}};if(C.doc.attachEvent)return function(a,
b,e,h){var k=function(a){a=a||h.node.ownerDocument.window.event;var b=d("y",h),k=d("x",h),k=a.clientX+k,b=a.clientY+b;a.preventDefault=a.preventDefault||f;a.stopPropagation=a.stopPropagation||u;return e.call(h,a,k,b)};a.attachEvent("on"+b,k);return function(){a.detachEvent("on"+b,k);return!0}}}(),q=[],e=function(a){for(var b=a.clientX,e=a.clientY,f=d("y"),l=d("x"),n,p=q.length;p--;){n=q[p];if(w)for(var r=a.touches&&a.touches.length,u;r--;){if(u=a.touches[r],u.identifier==n.el._drag.id||n.el.node.contains(u.target)){b=
u.clientX;e=u.clientY;(a.originalEvent?a.originalEvent:a).preventDefault();break}}else a.preventDefault();b+=l;e+=f;k("snap.drag.move."+n.el.id,n.move_scope||n.el,b-n.el._drag.x,e-n.el._drag.y,b,e,a)}},l=function(b){a.unmousemove(e).unmouseup(l);for(var d=q.length,f;d--;)f=q[d],f.el._drag={},k("snap.drag.end."+f.el.id,f.end_scope||f.start_scope||f.move_scope||f.el,b);q=[]};for(y=v.length;y--;)(function(d){a[d]=A[d]=function(e,f){a.is(e,"function")&&(this.events=this.events||[],this.events.push({name:d,
f:e,unbind:b(this.node||document,d,e,f||this)}));return this};a["un"+d]=A["un"+d]=function(a){for(var b=this.events||[],e=b.length;e--;)if(b[e].name==d&&(b[e].f==a||!a)){b[e].unbind();b.splice(e,1);!b.length&&delete this.events;break}return this}})(v[y]);A.hover=function(a,b,d,e){return this.mouseover(a,d).mouseout(b,e||d)};A.unhover=function(a,b){return this.unmouseover(a).unmouseout(b)};var r=[];A.drag=function(b,d,f,h,n,p){function u(r,v,w){(r.originalEvent||r).preventDefault();this._drag.x=v;
this._drag.y=w;this._drag.id=r.identifier;!q.length&&a.mousemove(e).mouseup(l);q.push({el:this,move_scope:h,start_scope:n,end_scope:p});d&&k.on("snap.drag.start."+this.id,d);b&&k.on("snap.drag.move."+this.id,b);f&&k.on("snap.drag.end."+this.id,f);k("snap.drag.start."+this.id,n||h||this,v,w,r)}if(!arguments.length){var v;return this.drag(function(a,b){this.attr({transform:v+(v?"T":"t")+[a,b]})},function(){v=this.transform().local})}this._drag={};r.push({el:this,start:u});this.mousedown(u);return this};
A.undrag=function(){for(var b=r.length;b--;)r[b].el==this&&(this.unmousedown(r[b].start),r.splice(b,1),k.unbind("snap.drag.*."+this.id));!r.length&&a.unmousemove(e).unmouseup(l);return this}});C.plugin(function(a,v,y,C){y=y.prototype;var A=/^\s*url\((.+)\)/,w=String,z=a._.$;a.filter={};y.filter=function(d){var f=this;"svg"!=f.type&&(f=f.paper);d=a.parse(w(d));var k=a._.id(),u=z("filter");z(u,{id:k,filterUnits:"userSpaceOnUse"});u.appendChild(d.node);f.defs.appendChild(u);return new v(u)};k.on("snap.util.getattr.filter",
function(){k.stop();var d=z(this.node,"filter");if(d)return(d=w(d).match(A))&&a.select(d[1])});k.on("snap.util.attr.filter",function(d){if(d instanceof v&&"filter"==d.type){k.stop();var f=d.node.id;f||(z(d.node,{id:d.id}),f=d.id);z(this.node,{filter:a.url(f)})}d&&"none"!=d||(k.stop(),this.node.removeAttribute("filter"))});a.filter.blur=function(d,f){null==d&&(d=2);return a.format('<feGaussianBlur stdDeviation="{def}"/>',{def:null==f?d:[d,f]})};a.filter.blur.toString=function(){return this()};a.filter.shadow=
function(d,f,k,u,p){"string"==typeof k&&(p=u=k,k=4);"string"!=typeof u&&(p=u,u="#000");null==k&&(k=4);null==p&&(p=1);null==d&&(d=0,f=2);null==f&&(f=d);u=a.color(u||"#000");return a.format('<feGaussianBlur in="SourceAlpha" stdDeviation="{blur}"/><feOffset dx="{dx}" dy="{dy}" result="offsetblur"/><feFlood flood-color="{color}"/><feComposite in2="offsetblur" operator="in"/><feComponentTransfer><feFuncA type="linear" slope="{opacity}"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>',
{color:u,dx:d,dy:f,blur:k,opacity:p})};a.filter.shadow.toString=function(){return this()};a.filter.grayscale=function(d){null==d&&(d=1);return a.format('<feColorMatrix type="matrix" values="{a} {b} {c} 0 0 {d} {e} {f} 0 0 {g} {b} {h} 0 0 0 0 0 1 0"/>',{a:0.2126+0.7874*(1-d),b:0.7152-0.7152*(1-d),c:0.0722-0.0722*(1-d),d:0.2126-0.2126*(1-d),e:0.7152+0.2848*(1-d),f:0.0722-0.0722*(1-d),g:0.2126-0.2126*(1-d),h:0.0722+0.9278*(1-d)})};a.filter.grayscale.toString=function(){return this()};a.filter.sepia=
function(d){null==d&&(d=1);return a.format('<feColorMatrix type="matrix" values="{a} {b} {c} 0 0 {d} {e} {f} 0 0 {g} {h} {i} 0 0 0 0 0 1 0"/>',{a:0.393+0.607*(1-d),b:0.769-0.769*(1-d),c:0.189-0.189*(1-d),d:0.349-0.349*(1-d),e:0.686+0.314*(1-d),f:0.168-0.168*(1-d),g:0.272-0.272*(1-d),h:0.534-0.534*(1-d),i:0.131+0.869*(1-d)})};a.filter.sepia.toString=function(){return this()};a.filter.saturate=function(d){null==d&&(d=1);return a.format('<feColorMatrix type="saturate" values="{amount}"/>',{amount:1-
d})};a.filter.saturate.toString=function(){return this()};a.filter.hueRotate=function(d){return a.format('<feColorMatrix type="hueRotate" values="{angle}"/>',{angle:d||0})};a.filter.hueRotate.toString=function(){return this()};a.filter.invert=function(d){null==d&&(d=1);return a.format('<feComponentTransfer><feFuncR type="table" tableValues="{amount} {amount2}"/><feFuncG type="table" tableValues="{amount} {amount2}"/><feFuncB type="table" tableValues="{amount} {amount2}"/></feComponentTransfer>',{amount:d,
amount2:1-d})};a.filter.invert.toString=function(){return this()};a.filter.brightness=function(d){null==d&&(d=1);return a.format('<feComponentTransfer><feFuncR type="linear" slope="{amount}"/><feFuncG type="linear" slope="{amount}"/><feFuncB type="linear" slope="{amount}"/></feComponentTransfer>',{amount:d})};a.filter.brightness.toString=function(){return this()};a.filter.contrast=function(d){null==d&&(d=1);return a.format('<feComponentTransfer><feFuncR type="linear" slope="{amount}" intercept="{amount2}"/><feFuncG type="linear" slope="{amount}" intercept="{amount2}"/><feFuncB type="linear" slope="{amount}" intercept="{amount2}"/></feComponentTransfer>',
{amount:d,amount2:0.5-d/2})};a.filter.contrast.toString=function(){return this()}});return C});

]]> </script>
<script> <![CDATA[

(function (glob, factory) {
    // AMD support
    if (typeof define === "function" && define.amd) {
        // Define as an anonymous module
        define("Gadfly", ["Snap.svg"], function (Snap) {
            return factory(Snap);
        });
    } else {
        // Browser globals (glob is window)
        // Snap adds itself to window
        glob.Gadfly = factory(glob.Snap);
    }
}(this, function (Snap) {

var Gadfly = {};

// Get an x/y coordinate value in pixels
var xPX = function(fig, x) {
    var client_box = fig.node.getBoundingClientRect();
    return x * fig.node.viewBox.baseVal.width / client_box.width;
};

var yPX = function(fig, y) {
    var client_box = fig.node.getBoundingClientRect();
    return y * fig.node.viewBox.baseVal.height / client_box.height;
};


Snap.plugin(function (Snap, Element, Paper, global) {
    // Traverse upwards from a snap element to find and return the first
    // note with the "plotroot" class.
    Element.prototype.plotroot = function () {
        var element = this;
        while (!element.hasClass("plotroot") && element.parent() != null) {
            element = element.parent();
        }
        return element;
    };

    Element.prototype.svgroot = function () {
        var element = this;
        while (element.node.nodeName != "svg" && element.parent() != null) {
            element = element.parent();
        }
        return element;
    };

    Element.prototype.plotbounds = function () {
        var root = this.plotroot()
        var bbox = root.select(".guide.background").node.getBBox();
        return {
            x0: bbox.x,
            x1: bbox.x + bbox.width,
            y0: bbox.y,
            y1: bbox.y + bbox.height
        };
    };

    Element.prototype.plotcenter = function () {
        var root = this.plotroot()
        var bbox = root.select(".guide.background").node.getBBox();
        return {
            x: bbox.x + bbox.width / 2,
            y: bbox.y + bbox.height / 2
        };
    };

    // Emulate IE style mouseenter/mouseleave events, since Microsoft always
    // does everything right.
    // See: http://www.dynamic-tools.net/toolbox/isMouseLeaveOrEnter/
    var events = ["mouseenter", "mouseleave"];

    for (i in events) {
        (function (event_name) {
            var event_name = events[i];
            Element.prototype[event_name] = function (fn, scope) {
                if (Snap.is(fn, "function")) {
                    var fn2 = function (event) {
                        if (event.type != "mouseover" && event.type != "mouseout") {
                            return;
                        }

                        var reltg = event.relatedTarget ? event.relatedTarget :
                            event.type == "mouseout" ? event.toElement : event.fromElement;
                        while (reltg && reltg != this.node) reltg = reltg.parentNode;

                        if (reltg != this.node) {
                            return fn.apply(this, event);
                        }
                    };

                    if (event_name == "mouseenter") {
                        this.mouseover(fn2, scope);
                    } else {
                        this.mouseout(fn2, scope);
                    }
                }
                return this;
            };
        })(events[i]);
    }


    Element.prototype.mousewheel = function (fn, scope) {
        if (Snap.is(fn, "function")) {
            var el = this;
            var fn2 = function (event) {
                fn.apply(el, [event]);
            };
        }

        this.node.addEventListener(
            /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel",
            fn2);

        return this;
    };


    // Snap's attr function can be too slow for things like panning/zooming.
    // This is a function to directly update element attributes without going
    // through eve.
    Element.prototype.attribute = function(key, val) {
        if (val === undefined) {
            return this.node.getAttribute(key);
        } else {
            this.node.setAttribute(key, val);
            return this;
        }
    };

    Element.prototype.init_gadfly = function() {
        this.mouseenter(Gadfly.plot_mouseover)
            .mouseleave(Gadfly.plot_mouseout)
            .dblclick(Gadfly.plot_dblclick)
            .mousewheel(Gadfly.guide_background_scroll)
            .drag(Gadfly.guide_background_drag_onmove,
                  Gadfly.guide_background_drag_onstart,
                  Gadfly.guide_background_drag_onend);
        this.mouseenter(function (event) {
            init_pan_zoom(this.plotroot());
        });
        return this;
    };
});


// When the plot is moused over, emphasize the grid lines.
Gadfly.plot_mouseover = function(event) {
    var root = this.plotroot();

    var keyboard_zoom = function(event) {
        if (event.which == 187) { // plus
            increase_zoom_by_position(root, 0.1, true);
        } else if (event.which == 189) { // minus
            increase_zoom_by_position(root, -0.1, true);
        }
    };
    root.data("keyboard_zoom", keyboard_zoom);
    window.addEventListener("keyup", keyboard_zoom);

    var xgridlines = root.select(".xgridlines"),
        ygridlines = root.select(".ygridlines");

    xgridlines.data("unfocused_strokedash",
                    xgridlines.attribute("stroke-dasharray").replace(/(\d)(,|$)/g, "$1mm$2"));
    ygridlines.data("unfocused_strokedash",
                    ygridlines.attribute("stroke-dasharray").replace(/(\d)(,|$)/g, "$1mm$2"));

    // emphasize grid lines
    var destcolor = root.data("focused_xgrid_color");
    xgridlines.attribute("stroke-dasharray", "none")
              .selectAll("path")
              .animate({stroke: destcolor}, 250);

    destcolor = root.data("focused_ygrid_color");
    ygridlines.attribute("stroke-dasharray", "none")
              .selectAll("path")
              .animate({stroke: destcolor}, 250);

    // reveal zoom slider
    root.select(".zoomslider")
        .animate({opacity: 1.0}, 250);
};

// Reset pan and zoom on double click
Gadfly.plot_dblclick = function(event) {
  set_plot_pan_zoom(this.plotroot(), 0.0, 0.0, 1.0);
};

// Unemphasize grid lines on mouse out.
Gadfly.plot_mouseout = function(event) {
    var root = this.plotroot();

    window.removeEventListener("keyup", root.data("keyboard_zoom"));
    root.data("keyboard_zoom", undefined);

    var xgridlines = root.select(".xgridlines"),
        ygridlines = root.select(".ygridlines");

    var destcolor = root.data("unfocused_xgrid_color");

    xgridlines.attribute("stroke-dasharray", xgridlines.data("unfocused_strokedash"))
              .selectAll("path")
              .animate({stroke: destcolor}, 250);

    destcolor = root.data("unfocused_ygrid_color");
    ygridlines.attribute("stroke-dasharray", ygridlines.data("unfocused_strokedash"))
              .selectAll("path")
              .animate({stroke: destcolor}, 250);

    // hide zoom slider
    root.select(".zoomslider")
        .animate({opacity: 0.0}, 250);
};


var set_geometry_transform = function(root, tx, ty, scale) {
    var xscalable = root.hasClass("xscalable"),
        yscalable = root.hasClass("yscalable");

    var old_scale = root.data("scale");

    var xscale = xscalable ? scale : 1.0,
        yscale = yscalable ? scale : 1.0;

    tx = xscalable ? tx : 0.0;
    ty = yscalable ? ty : 0.0;

    var t = new Snap.Matrix().translate(tx, ty).scale(xscale, yscale);

    root.selectAll(".geometry, image")
        .forEach(function (element, i) {
            element.transform(t);
        });

    bounds = root.plotbounds();

    if (yscalable) {
        var xfixed_t = new Snap.Matrix().translate(0, ty).scale(1.0, yscale);
        root.selectAll(".xfixed")
            .forEach(function (element, i) {
                element.transform(xfixed_t);
            });

        root.select(".ylabels")
            .transform(xfixed_t)
            .selectAll("text")
            .forEach(function (element, i) {
                if (element.attribute("gadfly:inscale") == "true") {
                    var cx = element.asPX("x"),
                        cy = element.asPX("y");
                    var st = element.data("static_transform");
                    unscale_t = new Snap.Matrix();
                    unscale_t.scale(1, 1/scale, cx, cy).add(st);
                    element.transform(unscale_t);

                    var y = cy * scale + ty;
                    element.attr("visibility",
                        bounds.y0 <= y && y <= bounds.y1 ? "visible" : "hidden");
                }
            });
    }

    if (xscalable) {
        var yfixed_t = new Snap.Matrix().translate(tx, 0).scale(xscale, 1.0);
        var xtrans = new Snap.Matrix().translate(tx, 0);
        root.selectAll(".yfixed")
            .forEach(function (element, i) {
                element.transform(yfixed_t);
            });

        root.select(".xlabels")
            .transform(yfixed_t)
            .selectAll("text")
            .forEach(function (element, i) {
                if (element.attribute("gadfly:inscale") == "true") {
                    var cx = element.asPX("x"),
                        cy = element.asPX("y");
                    var st = element.data("static_transform");
                    unscale_t = new Snap.Matrix();
                    unscale_t.scale(1/scale, 1, cx, cy).add(st);

                    element.transform(unscale_t);

                    var x = cx * scale + tx;
                    element.attr("visibility",
                        bounds.x0 <= x && x <= bounds.x1 ? "visible" : "hidden");
                    }
            });
    }

    // we must unscale anything that is scale invariance: widths, raiduses, etc.
    var size_attribs = ["font-size"];
    var unscaled_selection = ".geometry, .geometry *";
    if (xscalable) {
        size_attribs.push("rx");
        unscaled_selection += ", .xgridlines";
    }
    if (yscalable) {
        size_attribs.push("ry");
        unscaled_selection += ", .ygridlines";
    }

    root.selectAll(unscaled_selection)
        .forEach(function (element, i) {
            // circle need special help
            if (element.node.nodeName == "circle") {
                var cx = element.attribute("cx"),
                    cy = element.attribute("cy");
                unscale_t = new Snap.Matrix().scale(1/xscale, 1/yscale,
                                                        cx, cy);
                element.transform(unscale_t);
                return;
            }

            for (i in size_attribs) {
                var key = size_attribs[i];
                var val = parseFloat(element.attribute(key));
                if (val !== undefined && val != 0 && !isNaN(val)) {
                    element.attribute(key, val * old_scale / scale);
                }
            }
        });
};


// Find the most appropriate tick scale and update label visibility.
var update_tickscale = function(root, scale, axis) {
    if (!root.hasClass(axis + "scalable")) return;

    var tickscales = root.data(axis + "tickscales");
    var best_tickscale = 1.0;
    var best_tickscale_dist = Infinity;
    for (tickscale in tickscales) {
        var dist = Math.abs(Math.log(tickscale) - Math.log(scale));
        if (dist < best_tickscale_dist) {
            best_tickscale_dist = dist;
            best_tickscale = tickscale;
        }
    }

    if (best_tickscale != root.data(axis + "tickscale")) {
        root.data(axis + "tickscale", best_tickscale);
        var mark_inscale_gridlines = function (element, i) {
            var inscale = element.attr("gadfly:scale") == best_tickscale;
            element.attribute("gadfly:inscale", inscale);
            element.attr("visibility", inscale ? "visible" : "hidden");
        };

        var mark_inscale_labels = function (element, i) {
            var inscale = element.attr("gadfly:scale") == best_tickscale;
            element.attribute("gadfly:inscale", inscale);
            element.attr("visibility", inscale ? "visible" : "hidden");
        };

        root.select("." + axis + "gridlines").selectAll("path").forEach(mark_inscale_gridlines);
        root.select("." + axis + "labels").selectAll("text").forEach(mark_inscale_labels);
    }
};


var set_plot_pan_zoom = function(root, tx, ty, scale) {
    var old_scale = root.data("scale");
    var bounds = root.plotbounds();

    var width = bounds.x1 - bounds.x0,
        height = bounds.y1 - bounds.y0;

    // compute the viewport derived from tx, ty, and scale
    var x_min = -width * scale - (scale * width - width),
        x_max = width * scale,
        y_min = -height * scale - (scale * height - height),
        y_max = height * scale;

    var x0 = bounds.x0 - scale * bounds.x0,
        y0 = bounds.y0 - scale * bounds.y0;

    var tx = Math.max(Math.min(tx - x0, x_max), x_min),
        ty = Math.max(Math.min(ty - y0, y_max), y_min);

    tx += x0;
    ty += y0;

    // when the scale change, we may need to alter which set of
    // ticks is being displayed
    if (scale != old_scale) {
        update_tickscale(root, scale, "x");
        update_tickscale(root, scale, "y");
    }

    set_geometry_transform(root, tx, ty, scale);

    root.data("scale", scale);
    root.data("tx", tx);
    root.data("ty", ty);
};


var scale_centered_translation = function(root, scale) {
    var bounds = root.plotbounds();

    var width = bounds.x1 - bounds.x0,
        height = bounds.y1 - bounds.y0;

    var tx0 = root.data("tx"),
        ty0 = root.data("ty");

    var scale0 = root.data("scale");

    // how off from center the current view is
    var xoff = tx0 - (bounds.x0 * (1 - scale0) + (width * (1 - scale0)) / 2),
        yoff = ty0 - (bounds.y0 * (1 - scale0) + (height * (1 - scale0)) / 2);

    // rescale offsets
    xoff = xoff * scale / scale0;
    yoff = yoff * scale / scale0;

    // adjust for the panel position being scaled
    var x_edge_adjust = bounds.x0 * (1 - scale),
        y_edge_adjust = bounds.y0 * (1 - scale);

    return {
        x: xoff + x_edge_adjust + (width - width * scale) / 2,
        y: yoff + y_edge_adjust + (height - height * scale) / 2
    };
};


// Initialize data for panning zooming if it isn't already.
var init_pan_zoom = function(root) {
    if (root.data("zoompan-ready")) {
        return;
    }

    // The non-scaling-stroke trick. Rather than try to correct for the
    // stroke-width when zooming, we force it to a fixed value.
    var px_per_mm = root.node.getCTM().a;

    // Drag events report deltas in pixels, which we'd like to convert to
    // millimeters.
    root.data("px_per_mm", px_per_mm);

    root.selectAll("path")
        .forEach(function (element, i) {
        sw = element.asPX("stroke-width") * px_per_mm;
        if (sw > 0) {
            element.attribute("stroke-width", sw);
            element.attribute("vector-effect", "non-scaling-stroke");
        }
    });

    // Store ticks labels original tranformation
    root.selectAll(".xlabels > text, .ylabels > text")
        .forEach(function (element, i) {
            var lm = element.transform().localMatrix;
            element.data("static_transform",
                new Snap.Matrix(lm.a, lm.b, lm.c, lm.d, lm.e, lm.f));
        });

    var xgridlines = root.select(".xgridlines");
    var ygridlines = root.select(".ygridlines");
    var xlabels = root.select(".xlabels");
    var ylabels = root.select(".ylabels");

    if (root.data("tx") === undefined) root.data("tx", 0);
    if (root.data("ty") === undefined) root.data("ty", 0);
    if (root.data("scale") === undefined) root.data("scale", 1.0);
    if (root.data("xtickscales") === undefined) {

        // index all the tick scales that are listed
        var xtickscales = {};
        var ytickscales = {};
        var add_x_tick_scales = function (element, i) {
            xtickscales[element.attribute("gadfly:scale")] = true;
        };
        var add_y_tick_scales = function (element, i) {
            ytickscales[element.attribute("gadfly:scale")] = true;
        };

        if (xgridlines) xgridlines.selectAll("path").forEach(add_x_tick_scales);
        if (ygridlines) ygridlines.selectAll("path").forEach(add_y_tick_scales);
        if (xlabels) xlabels.selectAll("text").forEach(add_x_tick_scales);
        if (ylabels) ylabels.selectAll("text").forEach(add_y_tick_scales);

        root.data("xtickscales", xtickscales);
        root.data("ytickscales", ytickscales);
        root.data("xtickscale", 1.0);
    }

    var min_scale = 1.0, max_scale = 1.0;
    for (scale in xtickscales) {
        min_scale = Math.min(min_scale, scale);
        max_scale = Math.max(max_scale, scale);
    }
    for (scale in ytickscales) {
        min_scale = Math.min(min_scale, scale);
        max_scale = Math.max(max_scale, scale);
    }
    root.data("min_scale", min_scale);
    root.data("max_scale", max_scale);

    // store the original positions of labels
    if (xlabels) {
        xlabels.selectAll("text")
               .forEach(function (element, i) {
                   element.data("x", element.asPX("x"));
               });
    }

    if (ylabels) {
        ylabels.selectAll("text")
               .forEach(function (element, i) {
                   element.data("y", element.asPX("y"));
               });
    }

    // mark grid lines and ticks as in or out of scale.
    var mark_inscale = function (element, i) {
        element.attribute("gadfly:inscale", element.attribute("gadfly:scale") == 1.0);
    };

    if (xgridlines) xgridlines.selectAll("path").forEach(mark_inscale);
    if (ygridlines) ygridlines.selectAll("path").forEach(mark_inscale);
    if (xlabels) xlabels.selectAll("text").forEach(mark_inscale);
    if (ylabels) ylabels.selectAll("text").forEach(mark_inscale);

    // figure out the upper ond lower bounds on panning using the maximum
    // and minum grid lines
    var bounds = root.plotbounds();
    var pan_bounds = {
        x0: 0.0,
        y0: 0.0,
        x1: 0.0,
        y1: 0.0
    };

    if (xgridlines) {
        xgridlines
            .selectAll("path")
            .forEach(function (element, i) {
                if (element.attribute("gadfly:inscale") == "true") {
                    var bbox = element.node.getBBox();
                    if (bounds.x1 - bbox.x < pan_bounds.x0) {
                        pan_bounds.x0 = bounds.x1 - bbox.x;
                    }
                    if (bounds.x0 - bbox.x > pan_bounds.x1) {
                        pan_bounds.x1 = bounds.x0 - bbox.x;
                    }
                    element.attr("visibility", "visible");
                }
            });
    }

    if (ygridlines) {
        ygridlines
            .selectAll("path")
            .forEach(function (element, i) {
                if (element.attribute("gadfly:inscale") == "true") {
                    var bbox = element.node.getBBox();
                    if (bounds.y1 - bbox.y < pan_bounds.y0) {
                        pan_bounds.y0 = bounds.y1 - bbox.y;
                    }
                    if (bounds.y0 - bbox.y > pan_bounds.y1) {
                        pan_bounds.y1 = bounds.y0 - bbox.y;
                    }
                    element.attr("visibility", "visible");
                }
            });
    }

    // nudge these values a little
    pan_bounds.x0 -= 5;
    pan_bounds.x1 += 5;
    pan_bounds.y0 -= 5;
    pan_bounds.y1 += 5;
    root.data("pan_bounds", pan_bounds);

    root.data("zoompan-ready", true)
};


// drag actions, i.e. zooming and panning
var pan_action = {
    start: function(root, x, y, event) {
        root.data("dx", 0);
        root.data("dy", 0);
        root.data("tx0", root.data("tx"));
        root.data("ty0", root.data("ty"));
    },
    update: function(root, dx, dy, x, y, event) {
        var px_per_mm = root.data("px_per_mm");
        dx /= px_per_mm;
        dy /= px_per_mm;

        var tx0 = root.data("tx"),
            ty0 = root.data("ty");

        var dx0 = root.data("dx"),
            dy0 = root.data("dy");

        root.data("dx", dx);
        root.data("dy", dy);

        dx = dx - dx0;
        dy = dy - dy0;

        var tx = tx0 + dx,
            ty = ty0 + dy;

        set_plot_pan_zoom(root, tx, ty, root.data("scale"));
    },
    end: function(root, event) {

    },
    cancel: function(root) {
        set_plot_pan_zoom(root, root.data("tx0"), root.data("ty0"), root.data("scale"));
    }
};

var zoom_box;
var zoom_action = {
    start: function(root, x, y, event) {
        var bounds = root.plotbounds();
        var width = bounds.x1 - bounds.x0,
            height = bounds.y1 - bounds.y0;
        var ratio = width / height;
        var xscalable = root.hasClass("xscalable"),
            yscalable = root.hasClass("yscalable");
        var px_per_mm = root.data("px_per_mm");
        x = xscalable ? x / px_per_mm : bounds.x0;
        y = yscalable ? y / px_per_mm : bounds.y0;
        var w = xscalable ? 0 : width;
        var h = yscalable ? 0 : height;
        zoom_box = root.rect(x, y, w, h).attr({
            "fill": "#000",
            "opacity": 0.25
        });
        zoom_box.data("ratio", ratio);
    },
    update: function(root, dx, dy, x, y, event) {
        var xscalable = root.hasClass("xscalable"),
            yscalable = root.hasClass("yscalable");
        var px_per_mm = root.data("px_per_mm");
        var bounds = root.plotbounds();
        if (yscalable) {
            y /= px_per_mm;
            y = Math.max(bounds.y0, y);
            y = Math.min(bounds.y1, y);
        } else {
            y = bounds.y1;
        }
        if (xscalable) {
            x /= px_per_mm;
            x = Math.max(bounds.x0, x);
            x = Math.min(bounds.x1, x);
        } else {
            x = bounds.x1;
        }

        dx = x - zoom_box.attr("x");
        dy = y - zoom_box.attr("y");
        if (xscalable && yscalable) {
            var ratio = zoom_box.data("ratio");
            var width = Math.min(Math.abs(dx), ratio * Math.abs(dy));
            var height = Math.min(Math.abs(dy), Math.abs(dx) / ratio);
            dx = width * dx / Math.abs(dx);
            dy = height * dy / Math.abs(dy);
        }
        var xoffset = 0,
            yoffset = 0;
        if (dx < 0) {
            xoffset = dx;
            dx = -1 * dx;
        }
        if (dy < 0) {
            yoffset = dy;
            dy = -1 * dy;
        }
        if (isNaN(dy)) {
            dy = 0.0;
        }
        if (isNaN(dx)) {
            dx = 0.0;
        }
        zoom_box.transform("T" + xoffset + "," + yoffset);
        zoom_box.attr("width", dx);
        zoom_box.attr("height", dy);
    },
    end: function(root, event) {
        var xscalable = root.hasClass("xscalable"),
            yscalable = root.hasClass("yscalable");
        var zoom_bounds = zoom_box.getBBox();
        if (zoom_bounds.width * zoom_bounds.height <= 0) {
            return;
        }
        var plot_bounds = root.plotbounds();
        var zoom_factor = 1.0;
        if (yscalable) {
            zoom_factor = (plot_bounds.y1 - plot_bounds.y0) / zoom_bounds.height;
        } else {
            zoom_factor = (plot_bounds.x1 - plot_bounds.x0) / zoom_bounds.width;
        }
        var tx = (root.data("tx") - zoom_bounds.x) * zoom_factor + plot_bounds.x0,
            ty = (root.data("ty") - zoom_bounds.y) * zoom_factor + plot_bounds.y0;
        set_plot_pan_zoom(root, tx, ty, root.data("scale") * zoom_factor);
        zoom_box.remove();
    },
    cancel: function(root) {
        zoom_box.remove();
    }
};


Gadfly.guide_background_drag_onstart = function(x, y, event) {
    var root = this.plotroot();
    var scalable = root.hasClass("xscalable") || root.hasClass("yscalable");
    var zoomable = !event.altKey && !event.ctrlKey && event.shiftKey && scalable;
    var panable = !event.altKey && !event.ctrlKey && !event.shiftKey && scalable;
    var drag_action = zoomable ? zoom_action :
                      panable  ? pan_action :
                                 undefined;
    root.data("drag_action", drag_action);
    if (drag_action) {
        var cancel_drag_action = function(event) {
            if (event.which == 27) { // esc key
                drag_action.cancel(root);
                root.data("drag_action", undefined);
            }
        };
        window.addEventListener("keyup", cancel_drag_action);
        root.data("cancel_drag_action", cancel_drag_action);
        drag_action.start(root, x, y, event);
    }
};


Gadfly.guide_background_drag_onmove = function(dx, dy, x, y, event) {
    var root = this.plotroot();
    var drag_action = root.data("drag_action");
    if (drag_action) {
        drag_action.update(root, dx, dy, x, y, event);
    }
};


Gadfly.guide_background_drag_onend = function(event) {
    var root = this.plotroot();
    window.removeEventListener("keyup", root.data("cancel_drag_action"));
    root.data("cancel_drag_action", undefined);
    var drag_action = root.data("drag_action");
    if (drag_action) {
        drag_action.end(root, event);
    }
    root.data("drag_action", undefined);
};


Gadfly.guide_background_scroll = function(event) {
    if (event.shiftKey) {
        increase_zoom_by_position(this.plotroot(), 0.001 * event.wheelDelta);
        event.preventDefault();
    }
};


Gadfly.zoomslider_button_mouseover = function(event) {
    this.select(".button_logo")
         .animate({fill: this.data("mouseover_color")}, 100);
};


Gadfly.zoomslider_button_mouseout = function(event) {
     this.select(".button_logo")
         .animate({fill: this.data("mouseout_color")}, 100);
};


Gadfly.zoomslider_zoomout_click = function(event) {
    increase_zoom_by_position(this.plotroot(), -0.1, true);
};


Gadfly.zoomslider_zoomin_click = function(event) {
    increase_zoom_by_position(this.plotroot(), 0.1, true);
};


Gadfly.zoomslider_track_click = function(event) {
    // TODO
};


// Map slider position x to scale y using the function y = a*exp(b*x)+c.
// The constants a, b, and c are solved using the constraint that the function
// should go through the points (0; min_scale), (0.5; 1), and (1; max_scale).
var scale_from_slider_position = function(position, min_scale, max_scale) {
    var a = (1 - 2 * min_scale + min_scale * min_scale) / (min_scale + max_scale - 2),
        b = 2 * Math.log((max_scale - 1) / (1 - min_scale)),
        c = (min_scale * max_scale - 1) / (min_scale + max_scale - 2);
    return a * Math.exp(b * position) + c;
}

// inverse of scale_from_slider_position
var slider_position_from_scale = function(scale, min_scale, max_scale) {
    var a = (1 - 2 * min_scale + min_scale * min_scale) / (min_scale + max_scale - 2),
        b = 2 * Math.log((max_scale - 1) / (1 - min_scale)),
        c = (min_scale * max_scale - 1) / (min_scale + max_scale - 2);
    return 1 / b * Math.log((scale - c) / a);
}

var increase_zoom_by_position = function(root, delta_position, animate) {
    var scale = root.data("scale"),
        min_scale = root.data("min_scale"),
        max_scale = root.data("max_scale");
    var position = slider_position_from_scale(scale, min_scale, max_scale);
    position += delta_position;
    scale = scale_from_slider_position(position, min_scale, max_scale);
    set_zoom(root, scale, animate);
}

var set_zoom = function(root, scale, animate) {
    var min_scale = root.data("min_scale"),
        max_scale = root.data("max_scale"),
        old_scale = root.data("scale");
    var new_scale = Math.max(min_scale, Math.min(scale, max_scale));
    if (animate) {
        Snap.animate(
            old_scale,
            new_scale,
            function (new_scale) {
                update_plot_scale(root, new_scale);
            },
            200);
    } else {
        update_plot_scale(root, new_scale);
    }
}


var update_plot_scale = function(root, new_scale) {
    var trans = scale_centered_translation(root, new_scale);
    set_plot_pan_zoom(root, trans.x, trans.y, new_scale);

    root.selectAll(".zoomslider_thumb")
        .forEach(function (element, i) {
            var min_pos = element.data("min_pos"),
                max_pos = element.data("max_pos"),
                min_scale = root.data("min_scale"),
                max_scale = root.data("max_scale");
            var xmid = (min_pos + max_pos) / 2;
            var xpos = slider_position_from_scale(new_scale, min_scale, max_scale);
            element.transform(new Snap.Matrix().translate(
                Math.max(min_pos, Math.min(
                         max_pos, min_pos + (max_pos - min_pos) * xpos)) - xmid, 0));
    });
};


Gadfly.zoomslider_thumb_dragmove = function(dx, dy, x, y, event) {
    var root = this.plotroot();
    var min_pos = this.data("min_pos"),
        max_pos = this.data("max_pos"),
        min_scale = root.data("min_scale"),
        max_scale = root.data("max_scale"),
        old_scale = root.data("old_scale");

    var px_per_mm = root.data("px_per_mm");
    dx /= px_per_mm;
    dy /= px_per_mm;

    var xmid = (min_pos + max_pos) / 2;
    var xpos = slider_position_from_scale(old_scale, min_scale, max_scale) +
                   dx / (max_pos - min_pos);

    // compute the new scale
    var new_scale = scale_from_slider_position(xpos, min_scale, max_scale);
    new_scale = Math.min(max_scale, Math.max(min_scale, new_scale));

    update_plot_scale(root, new_scale);
    event.stopPropagation();
};


Gadfly.zoomslider_thumb_dragstart = function(x, y, event) {
    this.animate({fill: this.data("mouseover_color")}, 100);
    var root = this.plotroot();

    // keep track of what the scale was when we started dragging
    root.data("old_scale", root.data("scale"));
    event.stopPropagation();
};


Gadfly.zoomslider_thumb_dragend = function(event) {
    this.animate({fill: this.data("mouseout_color")}, 100);
    event.stopPropagation();
};


var toggle_color_class = function(root, color_class, ison) {
    var guides = root.selectAll(".guide." + color_class + ",.guide ." + color_class);
    var geoms = root.selectAll(".geometry." + color_class + ",.geometry ." + color_class);
    if (ison) {
        guides.animate({opacity: 0.5}, 250);
        geoms.animate({opacity: 0.0}, 250);
    } else {
        guides.animate({opacity: 1.0}, 250);
        geoms.animate({opacity: 1.0}, 250);
    }
};


Gadfly.colorkey_swatch_click = function(event) {
    var root = this.plotroot();
    var color_class = this.data("color_class");

    if (event.shiftKey) {
        root.selectAll(".colorkey text")
            .forEach(function (element) {
                var other_color_class = element.data("color_class");
                if (other_color_class != color_class) {
                    toggle_color_class(root, other_color_class,
                                       element.attr("opacity") == 1.0);
                }
            });
    } else {
        toggle_color_class(root, color_class, this.attr("opacity") == 1.0);
    }
};


return Gadfly;

}));


//@ sourceURL=gadfly.js


(function (glob, factory) {
    // AMD support
    if (typeof define === "function" && define.amd) {
        // Define as an anonymous module
        define("Gadfly", ["Snap.svg"], function (Snap) {
            return factory(Snap);
        });
    } else {
        // Browser globals (glob is window)
        // Snap adds itself to window
        glob.Gadfly = factory(glob.Snap);
    }
}(this, function (Snap) {

var Gadfly = {};

// Get an x/y coordinate value in pixels
var xPX = function(fig, x) {
    var client_box = fig.node.getBoundingClientRect();
    return x * fig.node.viewBox.baseVal.width / client_box.width;
};

var yPX = function(fig, y) {
    var client_box = fig.node.getBoundingClientRect();
    return y * fig.node.viewBox.baseVal.height / client_box.height;
};


Snap.plugin(function (Snap, Element, Paper, global) {
    // Traverse upwards from a snap element to find and return the first
    // note with the "plotroot" class.
    Element.prototype.plotroot = function () {
        var element = this;
        while (!element.hasClass("plotroot") && element.parent() != null) {
            element = element.parent();
        }
        return element;
    };

    Element.prototype.svgroot = function () {
        var element = this;
        while (element.node.nodeName != "svg" && element.parent() != null) {
            element = element.parent();
        }
        return element;
    };

    Element.prototype.plotbounds = function () {
        var root = this.plotroot()
        var bbox = root.select(".guide.background").node.getBBox();
        return {
            x0: bbox.x,
            x1: bbox.x + bbox.width,
            y0: bbox.y,
            y1: bbox.y + bbox.height
        };
    };

    Element.prototype.plotcenter = function () {
        var root = this.plotroot()
        var bbox = root.select(".guide.background").node.getBBox();
        return {
            x: bbox.x + bbox.width / 2,
            y: bbox.y + bbox.height / 2
        };
    };

    // Emulate IE style mouseenter/mouseleave events, since Microsoft always
    // does everything right.
    // See: http://www.dynamic-tools.net/toolbox/isMouseLeaveOrEnter/
    var events = ["mouseenter", "mouseleave"];

    for (i in events) {
        (function (event_name) {
            var event_name = events[i];
            Element.prototype[event_name] = function (fn, scope) {
                if (Snap.is(fn, "function")) {
                    var fn2 = function (event) {
                        if (event.type != "mouseover" && event.type != "mouseout") {
                            return;
                        }

                        var reltg = event.relatedTarget ? event.relatedTarget :
                            event.type == "mouseout" ? event.toElement : event.fromElement;
                        while (reltg && reltg != this.node) reltg = reltg.parentNode;

                        if (reltg != this.node) {
                            return fn.apply(this, event);
                        }
                    };

                    if (event_name == "mouseenter") {
                        this.mouseover(fn2, scope);
                    } else {
                        this.mouseout(fn2, scope);
                    }
                }
                return this;
            };
        })(events[i]);
    }


    Element.prototype.mousewheel = function (fn, scope) {
        if (Snap.is(fn, "function")) {
            var el = this;
            var fn2 = function (event) {
                fn.apply(el, [event]);
            };
        }

        this.node.addEventListener(
            /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel",
            fn2);

        return this;
    };


    // Snap's attr function can be too slow for things like panning/zooming.
    // This is a function to directly update element attributes without going
    // through eve.
    Element.prototype.attribute = function(key, val) {
        if (val === undefined) {
            return this.node.getAttribute(key);
        } else {
            this.node.setAttribute(key, val);
            return this;
        }
    };

    Element.prototype.init_gadfly = function() {
        this.mouseenter(Gadfly.plot_mouseover)
            .mouseleave(Gadfly.plot_mouseout)
            .dblclick(Gadfly.plot_dblclick)
            .mousewheel(Gadfly.guide_background_scroll)
            .drag(Gadfly.guide_background_drag_onmove,
                  Gadfly.guide_background_drag_onstart,
                  Gadfly.guide_background_drag_onend);
        this.mouseenter(function (event) {
            init_pan_zoom(this.plotroot());
        });
        return this;
    };
});


// When the plot is moused over, emphasize the grid lines.
Gadfly.plot_mouseover = function(event) {
    var root = this.plotroot();

    var keyboard_zoom = function(event) {
        if (event.which == 187) { // plus
            increase_zoom_by_position(root, 0.1, true);
        } else if (event.which == 189) { // minus
            increase_zoom_by_position(root, -0.1, true);
        }
    };
    root.data("keyboard_zoom", keyboard_zoom);
    window.addEventListener("keyup", keyboard_zoom);

    var xgridlines = root.select(".xgridlines"),
        ygridlines = root.select(".ygridlines");

    xgridlines.data("unfocused_strokedash",
                    xgridlines.attribute("stroke-dasharray").replace(/(\d)(,|$)/g, "$1mm$2"));
    ygridlines.data("unfocused_strokedash",
                    ygridlines.attribute("stroke-dasharray").replace(/(\d)(,|$)/g, "$1mm$2"));

    // emphasize grid lines
    var destcolor = root.data("focused_xgrid_color");
    xgridlines.attribute("stroke-dasharray", "none")
              .selectAll("path")
              .animate({stroke: destcolor}, 250);

    destcolor = root.data("focused_ygrid_color");
    ygridlines.attribute("stroke-dasharray", "none")
              .selectAll("path")
              .animate({stroke: destcolor}, 250);

    // reveal zoom slider
    root.select(".zoomslider")
        .animate({opacity: 1.0}, 250);
};

// Reset pan and zoom on double click
Gadfly.plot_dblclick = function(event) {
  set_plot_pan_zoom(this.plotroot(), 0.0, 0.0, 1.0);
};

// Unemphasize grid lines on mouse out.
Gadfly.plot_mouseout = function(event) {
    var root = this.plotroot();

    window.removeEventListener("keyup", root.data("keyboard_zoom"));
    root.data("keyboard_zoom", undefined);

    var xgridlines = root.select(".xgridlines"),
        ygridlines = root.select(".ygridlines");

    var destcolor = root.data("unfocused_xgrid_color");

    xgridlines.attribute("stroke-dasharray", xgridlines.data("unfocused_strokedash"))
              .selectAll("path")
              .animate({stroke: destcolor}, 250);

    destcolor = root.data("unfocused_ygrid_color");
    ygridlines.attribute("stroke-dasharray", ygridlines.data("unfocused_strokedash"))
              .selectAll("path")
              .animate({stroke: destcolor}, 250);

    // hide zoom slider
    root.select(".zoomslider")
        .animate({opacity: 0.0}, 250);
};


var set_geometry_transform = function(root, tx, ty, scale) {
    var xscalable = root.hasClass("xscalable"),
        yscalable = root.hasClass("yscalable");

    var old_scale = root.data("scale");

    var xscale = xscalable ? scale : 1.0,
        yscale = yscalable ? scale : 1.0;

    tx = xscalable ? tx : 0.0;
    ty = yscalable ? ty : 0.0;

    var t = new Snap.Matrix().translate(tx, ty).scale(xscale, yscale);

    root.selectAll(".geometry, image")
        .forEach(function (element, i) {
            element.transform(t);
        });

    bounds = root.plotbounds();

    if (yscalable) {
        var xfixed_t = new Snap.Matrix().translate(0, ty).scale(1.0, yscale);
        root.selectAll(".xfixed")
            .forEach(function (element, i) {
                element.transform(xfixed_t);
            });

        root.select(".ylabels")
            .transform(xfixed_t)
            .selectAll("text")
            .forEach(function (element, i) {
                if (element.attribute("gadfly:inscale") == "true") {
                    var cx = element.asPX("x"),
                        cy = element.asPX("y");
                    var st = element.data("static_transform");
                    unscale_t = new Snap.Matrix();
                    unscale_t.scale(1, 1/scale, cx, cy).add(st);
                    element.transform(unscale_t);

                    var y = cy * scale + ty;
                    element.attr("visibility",
                        bounds.y0 <= y && y <= bounds.y1 ? "visible" : "hidden");
                }
            });
    }

    if (xscalable) {
        var yfixed_t = new Snap.Matrix().translate(tx, 0).scale(xscale, 1.0);
        var xtrans = new Snap.Matrix().translate(tx, 0);
        root.selectAll(".yfixed")
            .forEach(function (element, i) {
                element.transform(yfixed_t);
            });

        root.select(".xlabels")
            .transform(yfixed_t)
            .selectAll("text")
            .forEach(function (element, i) {
                if (element.attribute("gadfly:inscale") == "true") {
                    var cx = element.asPX("x"),
                        cy = element.asPX("y");
                    var st = element.data("static_transform");
                    unscale_t = new Snap.Matrix();
                    unscale_t.scale(1/scale, 1, cx, cy).add(st);

                    element.transform(unscale_t);

                    var x = cx * scale + tx;
                    element.attr("visibility",
                        bounds.x0 <= x && x <= bounds.x1 ? "visible" : "hidden");
                    }
            });
    }

    // we must unscale anything that is scale invariance: widths, raiduses, etc.
    var size_attribs = ["font-size"];
    var unscaled_selection = ".geometry, .geometry *";
    if (xscalable) {
        size_attribs.push("rx");
        unscaled_selection += ", .xgridlines";
    }
    if (yscalable) {
        size_attribs.push("ry");
        unscaled_selection += ", .ygridlines";
    }

    root.selectAll(unscaled_selection)
        .forEach(function (element, i) {
            // circle need special help
            if (element.node.nodeName == "circle") {
                var cx = element.attribute("cx"),
                    cy = element.attribute("cy");
                unscale_t = new Snap.Matrix().scale(1/xscale, 1/yscale,
                                                        cx, cy);
                element.transform(unscale_t);
                return;
            }

            for (i in size_attribs) {
                var key = size_attribs[i];
                var val = parseFloat(element.attribute(key));
                if (val !== undefined && val != 0 && !isNaN(val)) {
                    element.attribute(key, val * old_scale / scale);
                }
            }
        });
};


// Find the most appropriate tick scale and update label visibility.
var update_tickscale = function(root, scale, axis) {
    if (!root.hasClass(axis + "scalable")) return;

    var tickscales = root.data(axis + "tickscales");
    var best_tickscale = 1.0;
    var best_tickscale_dist = Infinity;
    for (tickscale in tickscales) {
        var dist = Math.abs(Math.log(tickscale) - Math.log(scale));
        if (dist < best_tickscale_dist) {
            best_tickscale_dist = dist;
            best_tickscale = tickscale;
        }
    }

    if (best_tickscale != root.data(axis + "tickscale")) {
        root.data(axis + "tickscale", best_tickscale);
        var mark_inscale_gridlines = function (element, i) {
            var inscale = element.attr("gadfly:scale") == best_tickscale;
            element.attribute("gadfly:inscale", inscale);
            element.attr("visibility", inscale ? "visible" : "hidden");
        };

        var mark_inscale_labels = function (element, i) {
            var inscale = element.attr("gadfly:scale") == best_tickscale;
            element.attribute("gadfly:inscale", inscale);
            element.attr("visibility", inscale ? "visible" : "hidden");
        };

        root.select("." + axis + "gridlines").selectAll("path").forEach(mark_inscale_gridlines);
        root.select("." + axis + "labels").selectAll("text").forEach(mark_inscale_labels);
    }
};


var set_plot_pan_zoom = function(root, tx, ty, scale) {
    var old_scale = root.data("scale");
    var bounds = root.plotbounds();

    var width = bounds.x1 - bounds.x0,
        height = bounds.y1 - bounds.y0;

    // compute the viewport derived from tx, ty, and scale
    var x_min = -width * scale - (scale * width - width),
        x_max = width * scale,
        y_min = -height * scale - (scale * height - height),
        y_max = height * scale;

    var x0 = bounds.x0 - scale * bounds.x0,
        y0 = bounds.y0 - scale * bounds.y0;

    var tx = Math.max(Math.min(tx - x0, x_max), x_min),
        ty = Math.max(Math.min(ty - y0, y_max), y_min);

    tx += x0;
    ty += y0;

    // when the scale change, we may need to alter which set of
    // ticks is being displayed
    if (scale != old_scale) {
        update_tickscale(root, scale, "x");
        update_tickscale(root, scale, "y");
    }

    set_geometry_transform(root, tx, ty, scale);

    root.data("scale", scale);
    root.data("tx", tx);
    root.data("ty", ty);
};


var scale_centered_translation = function(root, scale) {
    var bounds = root.plotbounds();

    var width = bounds.x1 - bounds.x0,
        height = bounds.y1 - bounds.y0;

    var tx0 = root.data("tx"),
        ty0 = root.data("ty");

    var scale0 = root.data("scale");

    // how off from center the current view is
    var xoff = tx0 - (bounds.x0 * (1 - scale0) + (width * (1 - scale0)) / 2),
        yoff = ty0 - (bounds.y0 * (1 - scale0) + (height * (1 - scale0)) / 2);

    // rescale offsets
    xoff = xoff * scale / scale0;
    yoff = yoff * scale / scale0;

    // adjust for the panel position being scaled
    var x_edge_adjust = bounds.x0 * (1 - scale),
        y_edge_adjust = bounds.y0 * (1 - scale);

    return {
        x: xoff + x_edge_adjust + (width - width * scale) / 2,
        y: yoff + y_edge_adjust + (height - height * scale) / 2
    };
};


// Initialize data for panning zooming if it isn't already.
var init_pan_zoom = function(root) {
    if (root.data("zoompan-ready")) {
        return;
    }

    // The non-scaling-stroke trick. Rather than try to correct for the
    // stroke-width when zooming, we force it to a fixed value.
    var px_per_mm = root.node.getCTM().a;

    // Drag events report deltas in pixels, which we'd like to convert to
    // millimeters.
    root.data("px_per_mm", px_per_mm);

    root.selectAll("path")
        .forEach(function (element, i) {
        sw = element.asPX("stroke-width") * px_per_mm;
        if (sw > 0) {
            element.attribute("stroke-width", sw);
            element.attribute("vector-effect", "non-scaling-stroke");
        }
    });

    // Store ticks labels original tranformation
    root.selectAll(".xlabels > text, .ylabels > text")
        .forEach(function (element, i) {
            var lm = element.transform().localMatrix;
            element.data("static_transform",
                new Snap.Matrix(lm.a, lm.b, lm.c, lm.d, lm.e, lm.f));
        });

    var xgridlines = root.select(".xgridlines");
    var ygridlines = root.select(".ygridlines");
    var xlabels = root.select(".xlabels");
    var ylabels = root.select(".ylabels");

    if (root.data("tx") === undefined) root.data("tx", 0);
    if (root.data("ty") === undefined) root.data("ty", 0);
    if (root.data("scale") === undefined) root.data("scale", 1.0);
    if (root.data("xtickscales") === undefined) {

        // index all the tick scales that are listed
        var xtickscales = {};
        var ytickscales = {};
        var add_x_tick_scales = function (element, i) {
            xtickscales[element.attribute("gadfly:scale")] = true;
        };
        var add_y_tick_scales = function (element, i) {
            ytickscales[element.attribute("gadfly:scale")] = true;
        };

        if (xgridlines) xgridlines.selectAll("path").forEach(add_x_tick_scales);
        if (ygridlines) ygridlines.selectAll("path").forEach(add_y_tick_scales);
        if (xlabels) xlabels.selectAll("text").forEach(add_x_tick_scales);
        if (ylabels) ylabels.selectAll("text").forEach(add_y_tick_scales);

        root.data("xtickscales", xtickscales);
        root.data("ytickscales", ytickscales);
        root.data("xtickscale", 1.0);
    }

    var min_scale = 1.0, max_scale = 1.0;
    for (scale in xtickscales) {
        min_scale = Math.min(min_scale, scale);
        max_scale = Math.max(max_scale, scale);
    }
    for (scale in ytickscales) {
        min_scale = Math.min(min_scale, scale);
        max_scale = Math.max(max_scale, scale);
    }
    root.data("min_scale", min_scale);
    root.data("max_scale", max_scale);

    // store the original positions of labels
    if (xlabels) {
        xlabels.selectAll("text")
               .forEach(function (element, i) {
                   element.data("x", element.asPX("x"));
               });
    }

    if (ylabels) {
        ylabels.selectAll("text")
               .forEach(function (element, i) {
                   element.data("y", element.asPX("y"));
               });
    }

    // mark grid lines and ticks as in or out of scale.
    var mark_inscale = function (element, i) {
        element.attribute("gadfly:inscale", element.attribute("gadfly:scale") == 1.0);
    };

    if (xgridlines) xgridlines.selectAll("path").forEach(mark_inscale);
    if (ygridlines) ygridlines.selectAll("path").forEach(mark_inscale);
    if (xlabels) xlabels.selectAll("text").forEach(mark_inscale);
    if (ylabels) ylabels.selectAll("text").forEach(mark_inscale);

    // figure out the upper ond lower bounds on panning using the maximum
    // and minum grid lines
    var bounds = root.plotbounds();
    var pan_bounds = {
        x0: 0.0,
        y0: 0.0,
        x1: 0.0,
        y1: 0.0
    };

    if (xgridlines) {
        xgridlines
            .selectAll("path")
            .forEach(function (element, i) {
                if (element.attribute("gadfly:inscale") == "true") {
                    var bbox = element.node.getBBox();
                    if (bounds.x1 - bbox.x < pan_bounds.x0) {
                        pan_bounds.x0 = bounds.x1 - bbox.x;
                    }
                    if (bounds.x0 - bbox.x > pan_bounds.x1) {
                        pan_bounds.x1 = bounds.x0 - bbox.x;
                    }
                    element.attr("visibility", "visible");
                }
            });
    }

    if (ygridlines) {
        ygridlines
            .selectAll("path")
            .forEach(function (element, i) {
                if (element.attribute("gadfly:inscale") == "true") {
                    var bbox = element.node.getBBox();
                    if (bounds.y1 - bbox.y < pan_bounds.y0) {
                        pan_bounds.y0 = bounds.y1 - bbox.y;
                    }
                    if (bounds.y0 - bbox.y > pan_bounds.y1) {
                        pan_bounds.y1 = bounds.y0 - bbox.y;
                    }
                    element.attr("visibility", "visible");
                }
            });
    }

    // nudge these values a little
    pan_bounds.x0 -= 5;
    pan_bounds.x1 += 5;
    pan_bounds.y0 -= 5;
    pan_bounds.y1 += 5;
    root.data("pan_bounds", pan_bounds);

    root.data("zoompan-ready", true)
};


// drag actions, i.e. zooming and panning
var pan_action = {
    start: function(root, x, y, event) {
        root.data("dx", 0);
        root.data("dy", 0);
        root.data("tx0", root.data("tx"));
        root.data("ty0", root.data("ty"));
    },
    update: function(root, dx, dy, x, y, event) {
        var px_per_mm = root.data("px_per_mm");
        dx /= px_per_mm;
        dy /= px_per_mm;

        var tx0 = root.data("tx"),
            ty0 = root.data("ty");

        var dx0 = root.data("dx"),
            dy0 = root.data("dy");

        root.data("dx", dx);
        root.data("dy", dy);

        dx = dx - dx0;
        dy = dy - dy0;

        var tx = tx0 + dx,
            ty = ty0 + dy;

        set_plot_pan_zoom(root, tx, ty, root.data("scale"));
    },
    end: function(root, event) {

    },
    cancel: function(root) {
        set_plot_pan_zoom(root, root.data("tx0"), root.data("ty0"), root.data("scale"));
    }
};

var zoom_box;
var zoom_action = {
    start: function(root, x, y, event) {
        var bounds = root.plotbounds();
        var width = bounds.x1 - bounds.x0,
            height = bounds.y1 - bounds.y0;
        var ratio = width / height;
        var xscalable = root.hasClass("xscalable"),
            yscalable = root.hasClass("yscalable");
        var px_per_mm = root.data("px_per_mm");
        x = xscalable ? x / px_per_mm : bounds.x0;
        y = yscalable ? y / px_per_mm : bounds.y0;
        var w = xscalable ? 0 : width;
        var h = yscalable ? 0 : height;
        zoom_box = root.rect(x, y, w, h).attr({
            "fill": "#000",
            "opacity": 0.25
        });
        zoom_box.data("ratio", ratio);
    },
    update: function(root, dx, dy, x, y, event) {
        var xscalable = root.hasClass("xscalable"),
            yscalable = root.hasClass("yscalable");
        var px_per_mm = root.data("px_per_mm");
        var bounds = root.plotbounds();
        if (yscalable) {
            y /= px_per_mm;
            y = Math.max(bounds.y0, y);
            y = Math.min(bounds.y1, y);
        } else {
            y = bounds.y1;
        }
        if (xscalable) {
            x /= px_per_mm;
            x = Math.max(bounds.x0, x);
            x = Math.min(bounds.x1, x);
        } else {
            x = bounds.x1;
        }

        dx = x - zoom_box.attr("x");
        dy = y - zoom_box.attr("y");
        if (xscalable && yscalable) {
            var ratio = zoom_box.data("ratio");
            var width = Math.min(Math.abs(dx), ratio * Math.abs(dy));
            var height = Math.min(Math.abs(dy), Math.abs(dx) / ratio);
            dx = width * dx / Math.abs(dx);
            dy = height * dy / Math.abs(dy);
        }
        var xoffset = 0,
            yoffset = 0;
        if (dx < 0) {
            xoffset = dx;
            dx = -1 * dx;
        }
        if (dy < 0) {
            yoffset = dy;
            dy = -1 * dy;
        }
        if (isNaN(dy)) {
            dy = 0.0;
        }
        if (isNaN(dx)) {
            dx = 0.0;
        }
        zoom_box.transform("T" + xoffset + "," + yoffset);
        zoom_box.attr("width", dx);
        zoom_box.attr("height", dy);
    },
    end: function(root, event) {
        var xscalable = root.hasClass("xscalable"),
            yscalable = root.hasClass("yscalable");
        var zoom_bounds = zoom_box.getBBox();
        if (zoom_bounds.width * zoom_bounds.height <= 0) {
            return;
        }
        var plot_bounds = root.plotbounds();
        var zoom_factor = 1.0;
        if (yscalable) {
            zoom_factor = (plot_bounds.y1 - plot_bounds.y0) / zoom_bounds.height;
        } else {
            zoom_factor = (plot_bounds.x1 - plot_bounds.x0) / zoom_bounds.width;
        }
        var tx = (root.data("tx") - zoom_bounds.x) * zoom_factor + plot_bounds.x0,
            ty = (root.data("ty") - zoom_bounds.y) * zoom_factor + plot_bounds.y0;
        set_plot_pan_zoom(root, tx, ty, root.data("scale") * zoom_factor);
        zoom_box.remove();
    },
    cancel: function(root) {
        zoom_box.remove();
    }
};


Gadfly.guide_background_drag_onstart = function(x, y, event) {
    var root = this.plotroot();
    var scalable = root.hasClass("xscalable") || root.hasClass("yscalable");
    var zoomable = !event.altKey && !event.ctrlKey && event.shiftKey && scalable;
    var panable = !event.altKey && !event.ctrlKey && !event.shiftKey && scalable;
    var drag_action = zoomable ? zoom_action :
                      panable  ? pan_action :
                                 undefined;
    root.data("drag_action", drag_action);
    if (drag_action) {
        var cancel_drag_action = function(event) {
            if (event.which == 27) { // esc key
                drag_action.cancel(root);
                root.data("drag_action", undefined);
            }
        };
        window.addEventListener("keyup", cancel_drag_action);
        root.data("cancel_drag_action", cancel_drag_action);
        drag_action.start(root, x, y, event);
    }
};


Gadfly.guide_background_drag_onmove = function(dx, dy, x, y, event) {
    var root = this.plotroot();
    var drag_action = root.data("drag_action");
    if (drag_action) {
        drag_action.update(root, dx, dy, x, y, event);
    }
};


Gadfly.guide_background_drag_onend = function(event) {
    var root = this.plotroot();
    window.removeEventListener("keyup", root.data("cancel_drag_action"));
    root.data("cancel_drag_action", undefined);
    var drag_action = root.data("drag_action");
    if (drag_action) {
        drag_action.end(root, event);
    }
    root.data("drag_action", undefined);
};


Gadfly.guide_background_scroll = function(event) {
    if (event.shiftKey) {
        increase_zoom_by_position(this.plotroot(), 0.001 * event.wheelDelta);
        event.preventDefault();
    }
};


Gadfly.zoomslider_button_mouseover = function(event) {
    this.select(".button_logo")
         .animate({fill: this.data("mouseover_color")}, 100);
};


Gadfly.zoomslider_button_mouseout = function(event) {
     this.select(".button_logo")
         .animate({fill: this.data("mouseout_color")}, 100);
};


Gadfly.zoomslider_zoomout_click = function(event) {
    increase_zoom_by_position(this.plotroot(), -0.1, true);
};


Gadfly.zoomslider_zoomin_click = function(event) {
    increase_zoom_by_position(this.plotroot(), 0.1, true);
};


Gadfly.zoomslider_track_click = function(event) {
    // TODO
};


// Map slider position x to scale y using the function y = a*exp(b*x)+c.
// The constants a, b, and c are solved using the constraint that the function
// should go through the points (0; min_scale), (0.5; 1), and (1; max_scale).
var scale_from_slider_position = function(position, min_scale, max_scale) {
    var a = (1 - 2 * min_scale + min_scale * min_scale) / (min_scale + max_scale - 2),
        b = 2 * Math.log((max_scale - 1) / (1 - min_scale)),
        c = (min_scale * max_scale - 1) / (min_scale + max_scale - 2);
    return a * Math.exp(b * position) + c;
}

// inverse of scale_from_slider_position
var slider_position_from_scale = function(scale, min_scale, max_scale) {
    var a = (1 - 2 * min_scale + min_scale * min_scale) / (min_scale + max_scale - 2),
        b = 2 * Math.log((max_scale - 1) / (1 - min_scale)),
        c = (min_scale * max_scale - 1) / (min_scale + max_scale - 2);
    return 1 / b * Math.log((scale - c) / a);
}

var increase_zoom_by_position = function(root, delta_position, animate) {
    var scale = root.data("scale"),
        min_scale = root.data("min_scale"),
        max_scale = root.data("max_scale");
    var position = slider_position_from_scale(scale, min_scale, max_scale);
    position += delta_position;
    scale = scale_from_slider_position(position, min_scale, max_scale);
    set_zoom(root, scale, animate);
}

var set_zoom = function(root, scale, animate) {
    var min_scale = root.data("min_scale"),
        max_scale = root.data("max_scale"),
        old_scale = root.data("scale");
    var new_scale = Math.max(min_scale, Math.min(scale, max_scale));
    if (animate) {
        Snap.animate(
            old_scale,
            new_scale,
            function (new_scale) {
                update_plot_scale(root, new_scale);
            },
            200);
    } else {
        update_plot_scale(root, new_scale);
    }
}


var update_plot_scale = function(root, new_scale) {
    var trans = scale_centered_translation(root, new_scale);
    set_plot_pan_zoom(root, trans.x, trans.y, new_scale);

    root.selectAll(".zoomslider_thumb")
        .forEach(function (element, i) {
            var min_pos = element.data("min_pos"),
                max_pos = element.data("max_pos"),
                min_scale = root.data("min_scale"),
                max_scale = root.data("max_scale");
            var xmid = (min_pos + max_pos) / 2;
            var xpos = slider_position_from_scale(new_scale, min_scale, max_scale);
            element.transform(new Snap.Matrix().translate(
                Math.max(min_pos, Math.min(
                         max_pos, min_pos + (max_pos - min_pos) * xpos)) - xmid, 0));
    });
};


Gadfly.zoomslider_thumb_dragmove = function(dx, dy, x, y, event) {
    var root = this.plotroot();
    var min_pos = this.data("min_pos"),
        max_pos = this.data("max_pos"),
        min_scale = root.data("min_scale"),
        max_scale = root.data("max_scale"),
        old_scale = root.data("old_scale");

    var px_per_mm = root.data("px_per_mm");
    dx /= px_per_mm;
    dy /= px_per_mm;

    var xmid = (min_pos + max_pos) / 2;
    var xpos = slider_position_from_scale(old_scale, min_scale, max_scale) +
                   dx / (max_pos - min_pos);

    // compute the new scale
    var new_scale = scale_from_slider_position(xpos, min_scale, max_scale);
    new_scale = Math.min(max_scale, Math.max(min_scale, new_scale));

    update_plot_scale(root, new_scale);
    event.stopPropagation();
};


Gadfly.zoomslider_thumb_dragstart = function(x, y, event) {
    this.animate({fill: this.data("mouseover_color")}, 100);
    var root = this.plotroot();

    // keep track of what the scale was when we started dragging
    root.data("old_scale", root.data("scale"));
    event.stopPropagation();
};


Gadfly.zoomslider_thumb_dragend = function(event) {
    this.animate({fill: this.data("mouseout_color")}, 100);
    event.stopPropagation();
};


var toggle_color_class = function(root, color_class, ison) {
    var guides = root.selectAll(".guide." + color_class + ",.guide ." + color_class);
    var geoms = root.selectAll(".geometry." + color_class + ",.geometry ." + color_class);
    if (ison) {
        guides.animate({opacity: 0.5}, 250);
        geoms.animate({opacity: 0.0}, 250);
    } else {
        guides.animate({opacity: 1.0}, 250);
        geoms.animate({opacity: 1.0}, 250);
    }
};


Gadfly.colorkey_swatch_click = function(event) {
    var root = this.plotroot();
    var color_class = this.data("color_class");

    if (event.shiftKey) {
        root.selectAll(".colorkey text")
            .forEach(function (element) {
                var other_color_class = element.data("color_class");
                if (other_color_class != color_class) {
                    toggle_color_class(root, other_color_class,
                                       element.attr("opacity") == 1.0);
                }
            });
    } else {
        toggle_color_class(root, color_class, this.attr("opacity") == 1.0);
    }
};


return Gadfly;

}));


//@ sourceURL=gadfly.js

(function (glob, factory) {
    // AMD support
      if (typeof require === "function" && typeof define === "function" && define.amd) {
        require(["Snap.svg", "Gadfly", "Gadfly"], function (Snap, Gadfly, Gadfly) {
            factory(Snap, Gadfly, Gadfly);
        });
      } else {
          factory(glob.Snap, glob.Gadfly, glob.Gadfly);
      }
})(window, function (Snap, Gadfly, Gadfly) {
    var fig = Snap("#img-87eecd28");
fig.select("#img-87eecd28-5")
   .init_gadfly();
fig.select("#img-87eecd28-7")
   .plotroot().data("unfocused_ygrid_color", "#D0D0E0")
;
fig.select("#img-87eecd28-7")
   .plotroot().data("focused_ygrid_color", "#A0A0A0")
;
fig.select("#img-87eecd28-8")
   .plotroot().data("unfocused_xgrid_color", "#D0D0E0")
;
fig.select("#img-87eecd28-8")
   .plotroot().data("focused_xgrid_color", "#A0A0A0")
;
fig.select("#img-87eecd28-14")
   .data("mouseover_color", "#CD5C5C")
;
fig.select("#img-87eecd28-14")
   .data("mouseout_color", "#6A6A6A")
;
fig.select("#img-87eecd28-14")
   .click(Gadfly.zoomslider_zoomin_click)
.mouseenter(Gadfly.zoomslider_button_mouseover)
.mouseleave(Gadfly.zoomslider_button_mouseout)
;
fig.select("#img-87eecd28-16")
   .data("max_pos", 120.42)
;
fig.select("#img-87eecd28-16")
   .data("min_pos", 103.42)
;
fig.select("#img-87eecd28-16")
   .click(Gadfly.zoomslider_track_click);
fig.select("#img-87eecd28-17")
   .data("max_pos", 120.42)
;
fig.select("#img-87eecd28-17")
   .data("min_pos", 103.42)
;
fig.select("#img-87eecd28-17")
   .data("mouseover_color", "#CD5C5C")
;
fig.select("#img-87eecd28-17")
   .data("mouseout_color", "#6A6A6A")
;
fig.select("#img-87eecd28-17")
   .drag(Gadfly.zoomslider_thumb_dragmove,
     Gadfly.zoomslider_thumb_dragstart,
     Gadfly.zoomslider_thumb_dragend)
;
fig.select("#img-87eecd28-18")
   .data("mouseover_color", "#CD5C5C")
;
fig.select("#img-87eecd28-18")
   .data("mouseout_color", "#6A6A6A")
;
fig.select("#img-87eecd28-18")
   .click(Gadfly.zoomslider_zoomout_click)
.mouseenter(Gadfly.zoomslider_button_mouseover)
.mouseleave(Gadfly.zoomslider_button_mouseout)
;
fig.select("#img-87eecd28-26")
   .init_gadfly();
fig.select("#img-87eecd28-28")
   .plotroot().data("unfocused_ygrid_color", "#D0D0E0")
;
fig.select("#img-87eecd28-28")
   .plotroot().data("focused_ygrid_color", "#A0A0A0")
;
fig.select("#img-87eecd28-29")
   .plotroot().data("unfocused_xgrid_color", "#D0D0E0")
;
fig.select("#img-87eecd28-29")
   .plotroot().data("focused_xgrid_color", "#A0A0A0")
;
fig.select("#img-87eecd28-35")
   .data("mouseover_color", "#CD5C5C")
;
fig.select("#img-87eecd28-35")
   .data("mouseout_color", "#6A6A6A")
;
fig.select("#img-87eecd28-35")
   .click(Gadfly.zoomslider_zoomin_click)
.mouseenter(Gadfly.zoomslider_button_mouseover)
.mouseleave(Gadfly.zoomslider_button_mouseout)
;
fig.select("#img-87eecd28-37")
   .data("max_pos", 120.42)
;
fig.select("#img-87eecd28-37")
   .data("min_pos", 103.42)
;
fig.select("#img-87eecd28-37")
   .click(Gadfly.zoomslider_track_click);
fig.select("#img-87eecd28-38")
   .data("max_pos", 120.42)
;
fig.select("#img-87eecd28-38")
   .data("min_pos", 103.42)
;
fig.select("#img-87eecd28-38")
   .data("mouseover_color", "#CD5C5C")
;
fig.select("#img-87eecd28-38")
   .data("mouseout_color", "#6A6A6A")
;
fig.select("#img-87eecd28-38")
   .drag(Gadfly.zoomslider_thumb_dragmove,
     Gadfly.zoomslider_thumb_dragstart,
     Gadfly.zoomslider_thumb_dragend)
;
fig.select("#img-87eecd28-39")
   .data("mouseover_color", "#CD5C5C")
;
fig.select("#img-87eecd28-39")
   .data("mouseout_color", "#6A6A6A")
;
fig.select("#img-87eecd28-39")
   .click(Gadfly.zoomslider_zoomout_click)
.mouseenter(Gadfly.zoomslider_button_mouseover)
.mouseleave(Gadfly.zoomslider_button_mouseout)
;
    });
]]> </script>
</svg>

</div>


Even numbers up to 1000 require fewer steps to reach one through the Collatz procedure than odd numbers. We can save this plot.


```julia
# Save the plot in the working directory
draw(PNG("collatz-plot.png", 8inch, 10inch), vstack(a,b))
```

## Conclusion
Julia is a comfortable language to work with and many say it is the future of scientific computing. It may very well be true. One of the main reasons is Julia's JIT compiler which makes Julia almost as fast and sometimes faster than C.  At this point, I find Julia not as good as R simply because R is more mature and has a bigger commmunity. R aslo has better documentation and more questions on Stackoverflow. There  are $109419$ questions with an R tag in contrast to $1251$ questions with julia-lang tag as of 10/12/2015 and $1631$ as of 3/7/2016. 

Julia is up and coming and given enough time it could create competition for R. Unlikely that Julia is going to be a competitor in the industry against Python, SAS and R, but in academia it is a different story. 

## Resources used
- [Julia manual](http://docs.julialang.org/en/release-0.4/)
- [IJulia](https://github.com/JuliaLang/IJulia.jl)
- [DataFrames docs](http://dataframesjl.readthedocs.org/en/latest/)
- [Gadfly docs](https://github.com/dcjones/Gadfly.jl)

