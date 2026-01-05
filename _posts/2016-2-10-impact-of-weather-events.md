---
layout: post
title: 'Impact of weather events in the US'
author: "<a href = 'http://www.kobakhit.com/about/'>Koba Khitalishvili</a>"
categories: intermediate
tags: "r coursera reproducible datatable rickshaw rpubs rmarkdown"
rmd: "/ipynb/2016-2-10-impact-of-weather-events.Rmd"
rpubs: "http://rpubs.com/Koba/159392"
---

# Synopsis
Using the U.S. National Oceanic and Atmospheric Administration's (NOAA) storm database I explore which weather events are most harmful to population health and economy in the US. 

Regarding the population health, the most frequent events are usually the most harmful ones such as tornadoes, floods, thunderstorm winds, hurricanes and lightnings. An exception is the excessive heat event which is the 20th most frequent, but the deadliest with 88 deaths per year on average during the 2000-2011 period. Regarding the economy, the most frequent events are not necessarily the most harmful. The first four most harmful economically events are hydro-meteorological events such as floods, hail, storms, hurricanes. During 2000-2011 damage done to property was 14 times greater than the damage done to crops.Below is a detailed analysis. 

# Data processing
I start with downloading the data, unzipping it, and reading it in.


```r
if(!file.exists("data.csv")) {
  
  if(!file.exists("data.bz2")){
    #Download
    url<-"https://d396qusza40orc.cloudfront.net/repdata%2Fdata%2FStormData.csv.bz2"
    download.file(url,"data.bz2",method="curl")
    }
  
  # Unzip
  zz <- readLines(gzfile("data.bz2"))
  zz <- iconv(zz, "latin1", "ASCII", sub="")
  writeLines(zz, "data.csv")
  rm(zz)
  }

## Read data in
data<-read.csv("data.csv", sep=",", quote = "\"", header=TRUE)
```

The data set has 902297 observations and 37 variables (columns). Below are the first six rows of the first 5 columns of the data set I am working with as well as the names of all columns.


```r
head(data[,1:5])
```

```out
##   STATE__           BGN_DATE BGN_TIME TIME_ZONE COUNTY
## 1       1  4/18/1950 0:00:00     0130       CST     97
## 2       1  4/18/1950 0:00:00     0145       CST      3
## 3       1  2/20/1951 0:00:00     1600       CST     57
## 4       1   6/8/1951 0:00:00     0900       CST     89
## 5       1 11/15/1951 0:00:00     1500       CST     43
## 6       1 11/15/1951 0:00:00     2000       CST     77
```

```r
names(data)
```

```out
##  [1] "STATE__"    "BGN_DATE"   "BGN_TIME"   "TIME_ZONE"  "COUNTY"    
##  [6] "COUNTYNAME" "STATE"      "EVTYPE"     "BGN_RANGE"  "BGN_AZI"   
## [11] "BGN_LOCATI" "END_DATE"   "END_TIME"   "COUNTY_END" "COUNTYENDN"
## [16] "END_RANGE"  "END_AZI"    "END_LOCATI" "LENGTH"     "WIDTH"     
## [21] "F"          "MAG"        "FATALITIES" "INJURIES"   "PROPDMG"   
## [26] "PROPDMGEXP" "CROPDMG"    "CROPDMGEXP" "WFO"        "STATEOFFIC"
## [31] "ZONENAMES"  "LATITUDE"   "LONGITUDE"  "LATITUDE_E" "LONGITUDE_"
## [36] "REMARKS"    "REFNUM"
```

For my analysis I needed to extract the year information from the `BGN_DATE` column.


```r
# Add a new year column to the dataset
data<-data.frame(Year=format(as.Date(data$BGN_DATE,format="%m/%d/%Y"),"%Y"),data)

head(data[,1:5])
```

```out
##   Year STATE__           BGN_DATE BGN_TIME TIME_ZONE
## 1 1950       1  4/18/1950 0:00:00     0130       CST
## 2 1950       1  4/18/1950 0:00:00     0145       CST
## 3 1951       1  2/20/1951 0:00:00     1600       CST
## 4 1951       1   6/8/1951 0:00:00     0900       CST
## 5 1951       1 11/15/1951 0:00:00     1500       CST
## 6 1951       1 11/15/1951 0:00:00     2000       CST
```

After looking at the most frequent events I noticed duplicates THUNDERSTORM WIND, THUNDERSTORM WINDS, TSTM WIND, MARINE TSTM WIND. These are the same thing, so I replaced them with TSTM WIND.


```r
# Replace duplicate THUDNDERSTORM WIND, etc. with TTSM WIND
data$EVTYPE = sapply(data$EVTYPE,function(x) gsub("THUNDERSTORM WINDS|MARINE TSTM WIND|THUNDERSTORM WIND","TSTM WIND",x))
```

The data set has scaling factors for two variables which are needed for analysis. Namely, property damage `PROPDMG` and crop damage `CROPDMG`. They have corresponding scaling columns `PROPDMGEXP` and `CROPDMGEXP`. The scaling columns contain information about how to scale the values in the columns `PROPDMG` and `CROPDMG`. For example, a value in the `PROPDMG` column that has a scaling factor "k" in the `PROPDMGEXP` column should be multiplied by $10^3$. I use the following scheme for the scaling factors. 


```out
##    Scaling exponent Occurences Scaling factor
## 1                       465934           10^0
## 2                 -          1           10^0
## 3                 ?          8           10^0
## 4                 +          5           10^0
## 5                 0        216           10^0
## 6                 1         25           10^1
## 7                 2         13           10^2
## 8                 3          4           10^3
## 9                 4          4           10^4
## 10                5         28           10^5
## 11                6          4           10^6
## 12                7          5           10^7
## 13                8          1           10^8
## 14                B         40           10^9
## 15                h          1           10^2
## 16                H          6           10^2
## 17                K     424665           10^3
## 18                m          7           10^6
## 19                M      11330           10^6
```

Some values in the `PROPDMG` and `CROPDMG` did not have scaling factors specified or had symbols like `+,-,?`. I decided not to scale the values that had those symbols. The rest is intuitive, namely, "b" and "B" stand for billion and etc. In the code below I create two new columns, `PROPDMGSCALE` and `CROPDMGSCALE`, with property damage and crop damage scaled. 



```r
scale.func <- function(x) {
  # Function that replaces a factor with a numeric
   if(x %in% 0:8) {x<-as.numeric(x)}
   else if(x %in% c("b","B")) {x<-10^9}    # billion
   else if(x %in% c("m","M")) {x<-10^6}    # million/mega
   else if(x %in% c("k","K")) {x<-10^3}   # kilo   
   else if(x %in% c("h","H")) {x<-10^2}   # hundred
   else x<-10^0
   }

# Apply scale.func with sapply
data$PROPDMGSCALE <- sapply(data$PROPDMGEXP,scale.func) * data$PROPDMG
data$CROPDMGSCALE <- sapply(data$CROPDMGEXP,scale.func) * data$CROPDMG
```

I also created a plotting function for horizontal barplots, so I dont have to repeat code:


```r
plot.k<- function(df,title){
  # A function that plots a barplot with presets. Arguments are a matrix-like dataset and a plot title
  barplot(main=title,sort(df,decreasing=FALSE),las=1,horiz=TRUE,cex.names=0.75,col=c("lightblue"))
}
```

# Results

According to the project instructions, with time the recording of the weather events improved. In the multiline graph I show the number of occurences of 10 most frequent weather events by year during 1950-2011. The number of occurences of the events increased drastically due to improvements in the process of recording those events.


```r
# Get table of counts of events by year
dat = as.data.frame(table(data[,c("Year","EVTYPE")]))

# 10 most frequent events
a = sort(apply(table(data[,c("Year","EVTYPE")]),2,sum),decreasing=TRUE)[1:10]
dat = dat[dat$EVTYPE %in% names(a),]

# Modify year column to be in the unambiguos date format %Y-%m-%d
dat$Year = paste0(dat$Year,"-01-01")
dat$Year = as.numeric(as.POSIXct(dat$Year))

# Create Rickshaw graph
# require(devtools)
# install_github('ramnathv/rCharts')
require(rCharts)

r2 <- Rickshaw$new()
r2$layer(
  Freq ~ Year,
  data = dat,
  type = "line",
  groups = "EVTYPE",
  height = 340,
  width = 700
)
# turn on built in features
r2$set(
  hoverDetail = TRUE,
  xAxis = TRUE,
  yAxis = TRUE,
  shelving = FALSE,
  legend = TRUE,
  slider = TRUE,
  highlight = TRUE
)
r2$show('iframesrc', cdn = TRUE)
```
<iframe srcdoc="&lt;!doctype HTML&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;link rel='stylesheet' href='//cdn.cloudfare.com/ajax/libs/rickshaw/1.2.1/rickshaw.min.css'&gt;
    &lt;link rel='stylesheet' href='//ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css'&gt;
    
    &lt;script src='//d3js.org/d3.v3.min.js' type='text/javascript'&gt;&lt;/script&gt;
    &lt;script src='//cdn.cloudfare.com/ajax/libs/rickshaw/1.2.1/rickshaw.min.js' type='text/javascript'&gt;&lt;/script&gt;
    &lt;script src='//ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js' type='text/javascript'&gt;&lt;/script&gt;
    &lt;script src='//ajax.googleapis.com/ajax/libs/jqueryui/1.8.15/jquery-ui.min.js' type='text/javascript'&gt;&lt;/script&gt;
    
    &lt;style&gt;
    .chart_container {
        position: relative;
        display: inline-block;
        font-family: Arial, Helvetica, sans-serif;

    }
    .rChart {
        display: block;
        margin-left: 20px;
    }
   .yAxis {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 40px;
   }
   .legend {
        position: absolute;
        top: 0;
        left:20%;
        vertical-align: top;
    }
    @media only screen and (max-width : 680px) {
    	.legend li {
    	font-size:8px

  		}
		    
		}
    
    .slider {
      margin-left: 20px;
      margin-right: 20px;
      margin-top: 12px;
    }
    &lt;/style&gt;
    
  &lt;/head&gt;
  &lt;body&gt;
    &lt;div class='chart_container'&gt;
      &lt;div id='yAxischart8f4248f770b4' class='yAxis'&gt;&lt;/div&gt;
      &lt;div id='chart8f4248f770b4' class='rChart rickshaw'&gt;&lt;/div&gt;
      &lt;div id='xAxischart8f4248f770b4' class='xAxis'&gt;&lt;/div&gt;
      &lt;div id='legendchart8f4248f770b4' class='legend'&gt;&lt;/div&gt;
      &lt;div id='sliderchart8f4248f770b4' class='slider'&gt;&lt;/div&gt;
    &lt;/div&gt;
    
    &lt;script type='text/javascript'&gt; 
  var palette = new Rickshaw.Color.Palette({ scheme: &quot;colorwheel&quot; });
  var chartParams = {
 &quot;dom&quot;: &quot;chart8f4248f770b4&quot;,
 &quot;renderer&quot;:            'area',

&quot;scheme&quot;: &quot;colorwheel&quot;,
&quot;groups&quot;: &quot;EVTYPE&quot;,
&quot;series&quot;: [
 {
 &quot;data&quot;: [
 {
 &quot;x&quot;:     -631155600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -599619600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -568083600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -536461200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -504925200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -473389200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -441853200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -410230800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -378694800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -347158800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -315622800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -284000400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -252464400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -220928400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -189392400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -157770000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -126234000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -94698000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -63162000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -31539600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:          -3600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       31532400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       63068400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       94690800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      126226800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      157762800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      189298800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      220921200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      252457200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      283993200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      315529200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      347151600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      378687600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      410223600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      441759600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      473382000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      504918000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      536454000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      567990000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      599612400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      631148400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      662684400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      694220400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      725842800,
&quot;y&quot;: 881 
},
{
 &quot;x&quot;:      757378800,
&quot;y&quot;: 723 
},
{
 &quot;x&quot;:      788914800,
&quot;y&quot;: 1674 
},
{
 &quot;x&quot;:      820450800,
&quot;y&quot;: 3245 
},
{
 &quot;x&quot;:      852073200,
&quot;y&quot;: 2593 
},
{
 &quot;x&quot;:      883609200,
&quot;y&quot;: 2611 
},
{
 &quot;x&quot;:      915145200,
&quot;y&quot;: 1965 
},
{
 &quot;x&quot;:      946681200,
&quot;y&quot;: 2173 
},
{
 &quot;x&quot;:      978303600,
&quot;y&quot;: 2380 
},
{
 &quot;x&quot;:     1009839600,
&quot;y&quot;: 3003 
},
{
 &quot;x&quot;:     1041375600,
&quot;y&quot;: 3936 
},
{
 &quot;x&quot;:     1072911600,
&quot;y&quot;: 4375 
},
{
 &quot;x&quot;:     1104534000,
&quot;y&quot;: 2981 
},
{
 &quot;x&quot;:     1136070000,
&quot;y&quot;: 2641 
},
{
 &quot;x&quot;:     1167606000,
&quot;y&quot;: 3688 
},
{
 &quot;x&quot;:     1199142000,
&quot;y&quot;: 3721 
},
{
 &quot;x&quot;:     1230764400,
&quot;y&quot;: 4091 
},
{
 &quot;x&quot;:     1262300400,
&quot;y&quot;: 4044 
},
{
 &quot;x&quot;:     1293836400,
&quot;y&quot;: 3552 
} 
],
&quot;name&quot;: &quot;FLASH FLOOD&quot;,
&quot;info&quot;: {
 &quot;-631155600&quot;: {
 &quot;Year&quot;:     -631155600,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-599619600&quot;: {
 &quot;Year&quot;:     -599619600,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-568083600&quot;: {
 &quot;Year&quot;:     -568083600,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-536461200&quot;: {
 &quot;Year&quot;:     -536461200,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-504925200&quot;: {
 &quot;Year&quot;:     -504925200,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-473389200&quot;: {
 &quot;Year&quot;:     -473389200,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-441853200&quot;: {
 &quot;Year&quot;:     -441853200,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-410230800&quot;: {
 &quot;Year&quot;:     -410230800,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-378694800&quot;: {
 &quot;Year&quot;:     -378694800,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-347158800&quot;: {
 &quot;Year&quot;:     -347158800,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-315622800&quot;: {
 &quot;Year&quot;:     -315622800,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-284000400&quot;: {
 &quot;Year&quot;:     -284000400,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-252464400&quot;: {
 &quot;Year&quot;:     -252464400,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-220928400&quot;: {
 &quot;Year&quot;:     -220928400,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-189392400&quot;: {
 &quot;Year&quot;:     -189392400,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-157770000&quot;: {
 &quot;Year&quot;:     -157770000,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-126234000&quot;: {
 &quot;Year&quot;:     -126234000,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-94698000&quot;: {
 &quot;Year&quot;:      -94698000,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-63162000&quot;: {
 &quot;Year&quot;:      -63162000,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-31539600&quot;: {
 &quot;Year&quot;:      -31539600,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;-3600&quot;: {
 &quot;Year&quot;:          -3600,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;31532400&quot;: {
 &quot;Year&quot;:       31532400,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;63068400&quot;: {
 &quot;Year&quot;:       63068400,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;94690800&quot;: {
 &quot;Year&quot;:       94690800,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;126226800&quot;: {
 &quot;Year&quot;:      126226800,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;157762800&quot;: {
 &quot;Year&quot;:      157762800,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;189298800&quot;: {
 &quot;Year&quot;:      189298800,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;220921200&quot;: {
 &quot;Year&quot;:      220921200,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;252457200&quot;: {
 &quot;Year&quot;:      252457200,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;283993200&quot;: {
 &quot;Year&quot;:      283993200,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;315529200&quot;: {
 &quot;Year&quot;:      315529200,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;347151600&quot;: {
 &quot;Year&quot;:      347151600,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;378687600&quot;: {
 &quot;Year&quot;:      378687600,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;410223600&quot;: {
 &quot;Year&quot;:      410223600,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;441759600&quot;: {
 &quot;Year&quot;:      441759600,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;473382000&quot;: {
 &quot;Year&quot;:      473382000,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;504918000&quot;: {
 &quot;Year&quot;:      504918000,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;536454000&quot;: {
 &quot;Year&quot;:      536454000,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;567990000&quot;: {
 &quot;Year&quot;:      567990000,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;599612400&quot;: {
 &quot;Year&quot;:      599612400,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;631148400&quot;: {
 &quot;Year&quot;:      631148400,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;662684400&quot;: {
 &quot;Year&quot;:      662684400,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;694220400&quot;: {
 &quot;Year&quot;:      694220400,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;725842800&quot;: {
 &quot;Year&quot;:      725842800,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;757378800&quot;: {
 &quot;Year&quot;:      757378800,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;788914800&quot;: {
 &quot;Year&quot;:      788914800,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;820450800&quot;: {
 &quot;Year&quot;:      820450800,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;852073200&quot;: {
 &quot;Year&quot;:      852073200,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;883609200&quot;: {
 &quot;Year&quot;:      883609200,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;915145200&quot;: {
 &quot;Year&quot;:      915145200,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;946681200&quot;: {
 &quot;Year&quot;:      946681200,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;978303600&quot;: {
 &quot;Year&quot;:      978303600,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;1009839600&quot;: {
 &quot;Year&quot;:     1009839600,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;1041375600&quot;: {
 &quot;Year&quot;:     1041375600,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;1072911600&quot;: {
 &quot;Year&quot;:     1072911600,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;1104534000&quot;: {
 &quot;Year&quot;:     1104534000,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;1136070000&quot;: {
 &quot;Year&quot;:     1136070000,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;1167606000&quot;: {
 &quot;Year&quot;:     1167606000,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;1199142000&quot;: {
 &quot;Year&quot;:     1199142000,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;1230764400&quot;: {
 &quot;Year&quot;:     1230764400,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;1262300400&quot;: {
 &quot;Year&quot;:     1262300400,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
},
&quot;1293836400&quot;: {
 &quot;Year&quot;:     1293836400,
&quot;EVTYPE&quot;: &quot;FLASH FLOOD&quot; 
} 
},
&quot;color&quot;:  palette.color()  
},
{
 &quot;data&quot;: [
 {
 &quot;x&quot;:     -631155600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -599619600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -568083600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -536461200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -504925200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -473389200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -441853200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -410230800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -378694800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -347158800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -315622800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -284000400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -252464400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -220928400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -189392400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -157770000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -126234000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -94698000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -63162000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -31539600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:          -3600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       31532400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       63068400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       94690800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      126226800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      157762800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      189298800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      220921200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      252457200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      283993200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      315529200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      347151600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      378687600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      410223600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      441759600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      473382000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      504918000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      536454000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      567990000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      599612400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      631148400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      662684400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      694220400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      725842800,
&quot;y&quot;: 420 
},
{
 &quot;x&quot;:      757378800,
&quot;y&quot;: 265 
},
{
 &quot;x&quot;:      788914800,
&quot;y&quot;: 394 
},
{
 &quot;x&quot;:      820450800,
&quot;y&quot;: 914 
},
{
 &quot;x&quot;:      852073200,
&quot;y&quot;: 949 
},
{
 &quot;x&quot;:      883609200,
&quot;y&quot;: 1503 
},
{
 &quot;x&quot;:      915145200,
&quot;y&quot;: 920 
},
{
 &quot;x&quot;:      946681200,
&quot;y&quot;: 927 
},
{
 &quot;x&quot;:      978303600,
&quot;y&quot;: 963 
},
{
 &quot;x&quot;:     1009839600,
&quot;y&quot;: 774 
},
{
 &quot;x&quot;:     1041375600,
&quot;y&quot;: 965 
},
{
 &quot;x&quot;:     1072911600,
&quot;y&quot;: 1329 
},
{
 &quot;x&quot;:     1104534000,
&quot;y&quot;: 1344 
},
{
 &quot;x&quot;:     1136070000,
&quot;y&quot;: 1209 
},
{
 &quot;x&quot;:     1167606000,
&quot;y&quot;: 1804 
},
{
 &quot;x&quot;:     1199142000,
&quot;y&quot;: 2402 
},
{
 &quot;x&quot;:     1230764400,
&quot;y&quot;: 1978 
},
{
 &quot;x&quot;:     1262300400,
&quot;y&quot;: 2649 
},
{
 &quot;x&quot;:     1293836400,
&quot;y&quot;: 3617 
} 
],
&quot;name&quot;: &quot;FLOOD&quot;,
&quot;info&quot;: {
 &quot;-631155600&quot;: {
 &quot;Year&quot;:     -631155600,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-599619600&quot;: {
 &quot;Year&quot;:     -599619600,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-568083600&quot;: {
 &quot;Year&quot;:     -568083600,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-536461200&quot;: {
 &quot;Year&quot;:     -536461200,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-504925200&quot;: {
 &quot;Year&quot;:     -504925200,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-473389200&quot;: {
 &quot;Year&quot;:     -473389200,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-441853200&quot;: {
 &quot;Year&quot;:     -441853200,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-410230800&quot;: {
 &quot;Year&quot;:     -410230800,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-378694800&quot;: {
 &quot;Year&quot;:     -378694800,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-347158800&quot;: {
 &quot;Year&quot;:     -347158800,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-315622800&quot;: {
 &quot;Year&quot;:     -315622800,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-284000400&quot;: {
 &quot;Year&quot;:     -284000400,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-252464400&quot;: {
 &quot;Year&quot;:     -252464400,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-220928400&quot;: {
 &quot;Year&quot;:     -220928400,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-189392400&quot;: {
 &quot;Year&quot;:     -189392400,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-157770000&quot;: {
 &quot;Year&quot;:     -157770000,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-126234000&quot;: {
 &quot;Year&quot;:     -126234000,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-94698000&quot;: {
 &quot;Year&quot;:      -94698000,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-63162000&quot;: {
 &quot;Year&quot;:      -63162000,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-31539600&quot;: {
 &quot;Year&quot;:      -31539600,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;-3600&quot;: {
 &quot;Year&quot;:          -3600,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;31532400&quot;: {
 &quot;Year&quot;:       31532400,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;63068400&quot;: {
 &quot;Year&quot;:       63068400,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;94690800&quot;: {
 &quot;Year&quot;:       94690800,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;126226800&quot;: {
 &quot;Year&quot;:      126226800,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;157762800&quot;: {
 &quot;Year&quot;:      157762800,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;189298800&quot;: {
 &quot;Year&quot;:      189298800,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;220921200&quot;: {
 &quot;Year&quot;:      220921200,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;252457200&quot;: {
 &quot;Year&quot;:      252457200,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;283993200&quot;: {
 &quot;Year&quot;:      283993200,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;315529200&quot;: {
 &quot;Year&quot;:      315529200,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;347151600&quot;: {
 &quot;Year&quot;:      347151600,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;378687600&quot;: {
 &quot;Year&quot;:      378687600,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;410223600&quot;: {
 &quot;Year&quot;:      410223600,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;441759600&quot;: {
 &quot;Year&quot;:      441759600,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;473382000&quot;: {
 &quot;Year&quot;:      473382000,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;504918000&quot;: {
 &quot;Year&quot;:      504918000,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;536454000&quot;: {
 &quot;Year&quot;:      536454000,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;567990000&quot;: {
 &quot;Year&quot;:      567990000,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;599612400&quot;: {
 &quot;Year&quot;:      599612400,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;631148400&quot;: {
 &quot;Year&quot;:      631148400,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;662684400&quot;: {
 &quot;Year&quot;:      662684400,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;694220400&quot;: {
 &quot;Year&quot;:      694220400,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;725842800&quot;: {
 &quot;Year&quot;:      725842800,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;757378800&quot;: {
 &quot;Year&quot;:      757378800,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;788914800&quot;: {
 &quot;Year&quot;:      788914800,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;820450800&quot;: {
 &quot;Year&quot;:      820450800,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;852073200&quot;: {
 &quot;Year&quot;:      852073200,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;883609200&quot;: {
 &quot;Year&quot;:      883609200,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;915145200&quot;: {
 &quot;Year&quot;:      915145200,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;946681200&quot;: {
 &quot;Year&quot;:      946681200,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;978303600&quot;: {
 &quot;Year&quot;:      978303600,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;1009839600&quot;: {
 &quot;Year&quot;:     1009839600,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;1041375600&quot;: {
 &quot;Year&quot;:     1041375600,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;1072911600&quot;: {
 &quot;Year&quot;:     1072911600,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;1104534000&quot;: {
 &quot;Year&quot;:     1104534000,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;1136070000&quot;: {
 &quot;Year&quot;:     1136070000,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;1167606000&quot;: {
 &quot;Year&quot;:     1167606000,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;1199142000&quot;: {
 &quot;Year&quot;:     1199142000,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;1230764400&quot;: {
 &quot;Year&quot;:     1230764400,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;1262300400&quot;: {
 &quot;Year&quot;:     1262300400,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
},
&quot;1293836400&quot;: {
 &quot;Year&quot;:     1293836400,
&quot;EVTYPE&quot;: &quot;FLOOD&quot; 
} 
},
&quot;color&quot;:  palette.color()  
},
{
 &quot;data&quot;: [
 {
 &quot;x&quot;:     -631155600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -599619600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -568083600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -536461200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -504925200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -473389200,
&quot;y&quot;: 360 
},
{
 &quot;x&quot;:     -441853200,
&quot;y&quot;: 401 
},
{
 &quot;x&quot;:     -410230800,
&quot;y&quot;: 479 
},
{
 &quot;x&quot;:     -378694800,
&quot;y&quot;: 706 
},
{
 &quot;x&quot;:     -347158800,
&quot;y&quot;: 531 
},
{
 &quot;x&quot;:     -315622800,
&quot;y&quot;: 581 
},
{
 &quot;x&quot;:     -284000400,
&quot;y&quot;: 722 
},
{
 &quot;x&quot;:     -252464400,
&quot;y&quot;: 886 
},
{
 &quot;x&quot;:     -220928400,
&quot;y&quot;: 652 
},
{
 &quot;x&quot;:     -189392400,
&quot;y&quot;: 679 
},
{
 &quot;x&quot;:     -157770000,
&quot;y&quot;: 805 
},
{
 &quot;x&quot;:     -126234000,
&quot;y&quot;: 732 
},
{
 &quot;x&quot;:      -94698000,
&quot;y&quot;: 764 
},
{
 &quot;x&quot;:      -63162000,
&quot;y&quot;: 1068 
},
{
 &quot;x&quot;:      -31539600,
&quot;y&quot;: 766 
},
{
 &quot;x&quot;:          -3600,
&quot;y&quot;: 721 
},
{
 &quot;x&quot;:       31532400,
&quot;y&quot;: 964 
},
{
 &quot;x&quot;:       63068400,
&quot;y&quot;: 681 
},
{
 &quot;x&quot;:       94690800,
&quot;y&quot;: 1098 
},
{
 &quot;x&quot;:      126226800,
&quot;y&quot;: 1660 
},
{
 &quot;x&quot;:      157762800,
&quot;y&quot;: 1374 
},
{
 &quot;x&quot;:      189298800,
&quot;y&quot;: 1091 
},
{
 &quot;x&quot;:      220921200,
&quot;y&quot;: 1083 
},
{
 &quot;x&quot;:      252457200,
&quot;y&quot;: 1024 
},
{
 &quot;x&quot;:      283993200,
&quot;y&quot;: 1315 
},
{
 &quot;x&quot;:      315529200,
&quot;y&quot;: 1993 
},
{
 &quot;x&quot;:      347151600,
&quot;y&quot;: 1494 
},
{
 &quot;x&quot;:      378687600,
&quot;y&quot;: 2381 
},
{
 &quot;x&quot;:      410223600,
&quot;y&quot;: 2334 
},
{
 &quot;x&quot;:      441759600,
&quot;y&quot;: 2749 
},
{
 &quot;x&quot;:      473382000,
&quot;y&quot;: 3379 
},
{
 &quot;x&quot;:      504918000,
&quot;y&quot;: 3512 
},
{
 &quot;x&quot;:      536454000,
&quot;y&quot;: 2416 
},
{
 &quot;x&quot;:      567990000,
&quot;y&quot;: 2537 
},
{
 &quot;x&quot;:      599612400,
&quot;y&quot;: 3778 
},
{
 &quot;x&quot;:      631148400,
&quot;y&quot;: 3618 
},
{
 &quot;x&quot;:      662684400,
&quot;y&quot;: 4811 
},
{
 &quot;x&quot;:      694220400,
&quot;y&quot;: 5687 
},
{
 &quot;x&quot;:      725842800,
&quot;y&quot;: 4213 
},
{
 &quot;x&quot;:      757378800,
&quot;y&quot;: 6684 
},
{
 &quot;x&quot;:      788914800,
&quot;y&quot;: 8217 
},
{
 &quot;x&quot;:      820450800,
&quot;y&quot;: 10734 
},
{
 &quot;x&quot;:      852073200,
&quot;y&quot;: 8596 
},
{
 &quot;x&quot;:      883609200,
&quot;y&quot;: 12541 
},
{
 &quot;x&quot;:      915145200,
&quot;y&quot;: 10125 
},
{
 &quot;x&quot;:      946681200,
&quot;y&quot;: 11261 
},
{
 &quot;x&quot;:      978303600,
&quot;y&quot;: 12201 
},
{
 &quot;x&quot;:     1009839600,
&quot;y&quot;: 12529 
},
{
 &quot;x&quot;:     1041375600,
&quot;y&quot;: 13907 
},
{
 &quot;x&quot;:     1072911600,
&quot;y&quot;: 13142 
},
{
 &quot;x&quot;:     1104534000,
&quot;y&quot;: 13788 
},
{
 &quot;x&quot;:     1136070000,
&quot;y&quot;: 16638 
},
{
 &quot;x&quot;:     1167606000,
&quot;y&quot;: 12711 
},
{
 &quot;x&quot;:     1199142000,
&quot;y&quot;: 17546 
},
{
 &quot;x&quot;:     1230764400,
&quot;y&quot;: 13313 
},
{
 &quot;x&quot;:     1262300400,
&quot;y&quot;: 10922 
},
{
 &quot;x&quot;:     1293836400,
&quot;y&quot;: 17761 
} 
],
&quot;name&quot;: &quot;HAIL&quot;,
&quot;info&quot;: {
 &quot;-631155600&quot;: {
 &quot;Year&quot;:     -631155600,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-599619600&quot;: {
 &quot;Year&quot;:     -599619600,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-568083600&quot;: {
 &quot;Year&quot;:     -568083600,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-536461200&quot;: {
 &quot;Year&quot;:     -536461200,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-504925200&quot;: {
 &quot;Year&quot;:     -504925200,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-473389200&quot;: {
 &quot;Year&quot;:     -473389200,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-441853200&quot;: {
 &quot;Year&quot;:     -441853200,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-410230800&quot;: {
 &quot;Year&quot;:     -410230800,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-378694800&quot;: {
 &quot;Year&quot;:     -378694800,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-347158800&quot;: {
 &quot;Year&quot;:     -347158800,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-315622800&quot;: {
 &quot;Year&quot;:     -315622800,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-284000400&quot;: {
 &quot;Year&quot;:     -284000400,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-252464400&quot;: {
 &quot;Year&quot;:     -252464400,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-220928400&quot;: {
 &quot;Year&quot;:     -220928400,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-189392400&quot;: {
 &quot;Year&quot;:     -189392400,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-157770000&quot;: {
 &quot;Year&quot;:     -157770000,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-126234000&quot;: {
 &quot;Year&quot;:     -126234000,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-94698000&quot;: {
 &quot;Year&quot;:      -94698000,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-63162000&quot;: {
 &quot;Year&quot;:      -63162000,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-31539600&quot;: {
 &quot;Year&quot;:      -31539600,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;-3600&quot;: {
 &quot;Year&quot;:          -3600,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;31532400&quot;: {
 &quot;Year&quot;:       31532400,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;63068400&quot;: {
 &quot;Year&quot;:       63068400,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;94690800&quot;: {
 &quot;Year&quot;:       94690800,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;126226800&quot;: {
 &quot;Year&quot;:      126226800,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;157762800&quot;: {
 &quot;Year&quot;:      157762800,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;189298800&quot;: {
 &quot;Year&quot;:      189298800,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;220921200&quot;: {
 &quot;Year&quot;:      220921200,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;252457200&quot;: {
 &quot;Year&quot;:      252457200,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;283993200&quot;: {
 &quot;Year&quot;:      283993200,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;315529200&quot;: {
 &quot;Year&quot;:      315529200,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;347151600&quot;: {
 &quot;Year&quot;:      347151600,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;378687600&quot;: {
 &quot;Year&quot;:      378687600,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;410223600&quot;: {
 &quot;Year&quot;:      410223600,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;441759600&quot;: {
 &quot;Year&quot;:      441759600,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;473382000&quot;: {
 &quot;Year&quot;:      473382000,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;504918000&quot;: {
 &quot;Year&quot;:      504918000,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;536454000&quot;: {
 &quot;Year&quot;:      536454000,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;567990000&quot;: {
 &quot;Year&quot;:      567990000,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;599612400&quot;: {
 &quot;Year&quot;:      599612400,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;631148400&quot;: {
 &quot;Year&quot;:      631148400,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;662684400&quot;: {
 &quot;Year&quot;:      662684400,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;694220400&quot;: {
 &quot;Year&quot;:      694220400,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;725842800&quot;: {
 &quot;Year&quot;:      725842800,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;757378800&quot;: {
 &quot;Year&quot;:      757378800,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;788914800&quot;: {
 &quot;Year&quot;:      788914800,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;820450800&quot;: {
 &quot;Year&quot;:      820450800,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;852073200&quot;: {
 &quot;Year&quot;:      852073200,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;883609200&quot;: {
 &quot;Year&quot;:      883609200,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;915145200&quot;: {
 &quot;Year&quot;:      915145200,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;946681200&quot;: {
 &quot;Year&quot;:      946681200,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;978303600&quot;: {
 &quot;Year&quot;:      978303600,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;1009839600&quot;: {
 &quot;Year&quot;:     1009839600,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;1041375600&quot;: {
 &quot;Year&quot;:     1041375600,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;1072911600&quot;: {
 &quot;Year&quot;:     1072911600,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;1104534000&quot;: {
 &quot;Year&quot;:     1104534000,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;1136070000&quot;: {
 &quot;Year&quot;:     1136070000,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;1167606000&quot;: {
 &quot;Year&quot;:     1167606000,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;1199142000&quot;: {
 &quot;Year&quot;:     1199142000,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;1230764400&quot;: {
 &quot;Year&quot;:     1230764400,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;1262300400&quot;: {
 &quot;Year&quot;:     1262300400,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
},
&quot;1293836400&quot;: {
 &quot;Year&quot;:     1293836400,
&quot;EVTYPE&quot;: &quot;HAIL&quot; 
} 
},
&quot;color&quot;:  palette.color()  
},
{
 &quot;data&quot;: [
 {
 &quot;x&quot;:     -631155600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -599619600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -568083600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -536461200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -504925200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -473389200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -441853200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -410230800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -378694800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -347158800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -315622800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -284000400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -252464400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -220928400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -189392400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -157770000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -126234000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -94698000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -63162000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -31539600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:          -3600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       31532400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       63068400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       94690800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      126226800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      157762800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      189298800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      220921200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      252457200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      283993200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      315529200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      347151600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      378687600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      410223600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      441759600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      473382000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      504918000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      536454000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      567990000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      599612400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      631148400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      662684400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      694220400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      725842800,
&quot;y&quot;: 21 
},
{
 &quot;x&quot;:      757378800,
&quot;y&quot;: 81 
},
{
 &quot;x&quot;:      788914800,
&quot;y&quot;: 112 
},
{
 &quot;x&quot;:      820450800,
&quot;y&quot;: 344 
},
{
 &quot;x&quot;:      852073200,
&quot;y&quot;: 341 
},
{
 &quot;x&quot;:      883609200,
&quot;y&quot;: 678 
},
{
 &quot;x&quot;:      915145200,
&quot;y&quot;: 482 
},
{
 &quot;x&quot;:      946681200,
&quot;y&quot;: 564 
},
{
 &quot;x&quot;:      978303600,
&quot;y&quot;: 450 
},
{
 &quot;x&quot;:     1009839600,
&quot;y&quot;: 336 
},
{
 &quot;x&quot;:     1041375600,
&quot;y&quot;: 934 
},
{
 &quot;x&quot;:     1072911600,
&quot;y&quot;: 715 
},
{
 &quot;x&quot;:     1104534000,
&quot;y&quot;: 854 
},
{
 &quot;x&quot;:     1136070000,
&quot;y&quot;: 810 
},
{
 &quot;x&quot;:     1167606000,
&quot;y&quot;: 874 
},
{
 &quot;x&quot;:     1199142000,
&quot;y&quot;: 854 
},
{
 &quot;x&quot;:     1230764400,
&quot;y&quot;: 1087 
},
{
 &quot;x&quot;:     1262300400,
&quot;y&quot;: 1121 
},
{
 &quot;x&quot;:     1293836400,
&quot;y&quot;: 1065 
} 
],
&quot;name&quot;: &quot;HEAVY RAIN&quot;,
&quot;info&quot;: {
 &quot;-631155600&quot;: {
 &quot;Year&quot;:     -631155600,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-599619600&quot;: {
 &quot;Year&quot;:     -599619600,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-568083600&quot;: {
 &quot;Year&quot;:     -568083600,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-536461200&quot;: {
 &quot;Year&quot;:     -536461200,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-504925200&quot;: {
 &quot;Year&quot;:     -504925200,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-473389200&quot;: {
 &quot;Year&quot;:     -473389200,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-441853200&quot;: {
 &quot;Year&quot;:     -441853200,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-410230800&quot;: {
 &quot;Year&quot;:     -410230800,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-378694800&quot;: {
 &quot;Year&quot;:     -378694800,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-347158800&quot;: {
 &quot;Year&quot;:     -347158800,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-315622800&quot;: {
 &quot;Year&quot;:     -315622800,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-284000400&quot;: {
 &quot;Year&quot;:     -284000400,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-252464400&quot;: {
 &quot;Year&quot;:     -252464400,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-220928400&quot;: {
 &quot;Year&quot;:     -220928400,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-189392400&quot;: {
 &quot;Year&quot;:     -189392400,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-157770000&quot;: {
 &quot;Year&quot;:     -157770000,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-126234000&quot;: {
 &quot;Year&quot;:     -126234000,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-94698000&quot;: {
 &quot;Year&quot;:      -94698000,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-63162000&quot;: {
 &quot;Year&quot;:      -63162000,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-31539600&quot;: {
 &quot;Year&quot;:      -31539600,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;-3600&quot;: {
 &quot;Year&quot;:          -3600,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;31532400&quot;: {
 &quot;Year&quot;:       31532400,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;63068400&quot;: {
 &quot;Year&quot;:       63068400,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;94690800&quot;: {
 &quot;Year&quot;:       94690800,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;126226800&quot;: {
 &quot;Year&quot;:      126226800,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;157762800&quot;: {
 &quot;Year&quot;:      157762800,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;189298800&quot;: {
 &quot;Year&quot;:      189298800,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;220921200&quot;: {
 &quot;Year&quot;:      220921200,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;252457200&quot;: {
 &quot;Year&quot;:      252457200,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;283993200&quot;: {
 &quot;Year&quot;:      283993200,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;315529200&quot;: {
 &quot;Year&quot;:      315529200,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;347151600&quot;: {
 &quot;Year&quot;:      347151600,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;378687600&quot;: {
 &quot;Year&quot;:      378687600,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;410223600&quot;: {
 &quot;Year&quot;:      410223600,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;441759600&quot;: {
 &quot;Year&quot;:      441759600,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;473382000&quot;: {
 &quot;Year&quot;:      473382000,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;504918000&quot;: {
 &quot;Year&quot;:      504918000,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;536454000&quot;: {
 &quot;Year&quot;:      536454000,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;567990000&quot;: {
 &quot;Year&quot;:      567990000,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;599612400&quot;: {
 &quot;Year&quot;:      599612400,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;631148400&quot;: {
 &quot;Year&quot;:      631148400,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;662684400&quot;: {
 &quot;Year&quot;:      662684400,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;694220400&quot;: {
 &quot;Year&quot;:      694220400,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;725842800&quot;: {
 &quot;Year&quot;:      725842800,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;757378800&quot;: {
 &quot;Year&quot;:      757378800,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;788914800&quot;: {
 &quot;Year&quot;:      788914800,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;820450800&quot;: {
 &quot;Year&quot;:      820450800,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;852073200&quot;: {
 &quot;Year&quot;:      852073200,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;883609200&quot;: {
 &quot;Year&quot;:      883609200,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;915145200&quot;: {
 &quot;Year&quot;:      915145200,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;946681200&quot;: {
 &quot;Year&quot;:      946681200,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;978303600&quot;: {
 &quot;Year&quot;:      978303600,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;1009839600&quot;: {
 &quot;Year&quot;:     1009839600,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;1041375600&quot;: {
 &quot;Year&quot;:     1041375600,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;1072911600&quot;: {
 &quot;Year&quot;:     1072911600,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;1104534000&quot;: {
 &quot;Year&quot;:     1104534000,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;1136070000&quot;: {
 &quot;Year&quot;:     1136070000,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;1167606000&quot;: {
 &quot;Year&quot;:     1167606000,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;1199142000&quot;: {
 &quot;Year&quot;:     1199142000,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;1230764400&quot;: {
 &quot;Year&quot;:     1230764400,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;1262300400&quot;: {
 &quot;Year&quot;:     1262300400,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
},
&quot;1293836400&quot;: {
 &quot;Year&quot;:     1293836400,
&quot;EVTYPE&quot;: &quot;HEAVY RAIN&quot; 
} 
},
&quot;color&quot;:  palette.color()  
},
{
 &quot;data&quot;: [
 {
 &quot;x&quot;:     -631155600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -599619600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -568083600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -536461200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -504925200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -473389200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -441853200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -410230800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -378694800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -347158800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -315622800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -284000400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -252464400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -220928400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -189392400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -157770000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -126234000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -94698000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -63162000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -31539600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:          -3600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       31532400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       63068400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       94690800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      126226800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      157762800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      189298800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      220921200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      252457200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      283993200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      315529200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      347151600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      378687600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      410223600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      441759600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      473382000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      504918000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      536454000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      567990000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      599612400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      631148400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      662684400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      694220400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      725842800,
&quot;y&quot;: 577 
},
{
 &quot;x&quot;:      757378800,
&quot;y&quot;: 421 
},
{
 &quot;x&quot;:      788914800,
&quot;y&quot;: 710 
},
{
 &quot;x&quot;:      820450800,
&quot;y&quot;: 975 
},
{
 &quot;x&quot;:      852073200,
&quot;y&quot;: 702 
},
{
 &quot;x&quot;:      883609200,
&quot;y&quot;: 661 
},
{
 &quot;x&quot;:      915145200,
&quot;y&quot;: 761 
},
{
 &quot;x&quot;:      946681200,
&quot;y&quot;: 800 
},
{
 &quot;x&quot;:      978303600,
&quot;y&quot;: 815 
},
{
 &quot;x&quot;:     1009839600,
&quot;y&quot;: 777 
},
{
 &quot;x&quot;:     1041375600,
&quot;y&quot;: 854 
},
{
 &quot;x&quot;:     1072911600,
&quot;y&quot;: 644 
},
{
 &quot;x&quot;:     1104534000,
&quot;y&quot;: 705 
},
{
 &quot;x&quot;:     1136070000,
&quot;y&quot;: 678 
},
{
 &quot;x&quot;:     1167606000,
&quot;y&quot;: 944 
},
{
 &quot;x&quot;:     1199142000,
&quot;y&quot;: 1346 
},
{
 &quot;x&quot;:     1230764400,
&quot;y&quot;: 1032 
},
{
 &quot;x&quot;:     1262300400,
&quot;y&quot;: 1372 
},
{
 &quot;x&quot;:     1293836400,
&quot;y&quot;: 934 
} 
],
&quot;name&quot;: &quot;HEAVY SNOW&quot;,
&quot;info&quot;: {
 &quot;-631155600&quot;: {
 &quot;Year&quot;:     -631155600,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-599619600&quot;: {
 &quot;Year&quot;:     -599619600,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-568083600&quot;: {
 &quot;Year&quot;:     -568083600,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-536461200&quot;: {
 &quot;Year&quot;:     -536461200,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-504925200&quot;: {
 &quot;Year&quot;:     -504925200,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-473389200&quot;: {
 &quot;Year&quot;:     -473389200,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-441853200&quot;: {
 &quot;Year&quot;:     -441853200,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-410230800&quot;: {
 &quot;Year&quot;:     -410230800,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-378694800&quot;: {
 &quot;Year&quot;:     -378694800,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-347158800&quot;: {
 &quot;Year&quot;:     -347158800,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-315622800&quot;: {
 &quot;Year&quot;:     -315622800,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-284000400&quot;: {
 &quot;Year&quot;:     -284000400,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-252464400&quot;: {
 &quot;Year&quot;:     -252464400,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-220928400&quot;: {
 &quot;Year&quot;:     -220928400,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-189392400&quot;: {
 &quot;Year&quot;:     -189392400,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-157770000&quot;: {
 &quot;Year&quot;:     -157770000,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-126234000&quot;: {
 &quot;Year&quot;:     -126234000,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-94698000&quot;: {
 &quot;Year&quot;:      -94698000,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-63162000&quot;: {
 &quot;Year&quot;:      -63162000,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-31539600&quot;: {
 &quot;Year&quot;:      -31539600,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;-3600&quot;: {
 &quot;Year&quot;:          -3600,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;31532400&quot;: {
 &quot;Year&quot;:       31532400,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;63068400&quot;: {
 &quot;Year&quot;:       63068400,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;94690800&quot;: {
 &quot;Year&quot;:       94690800,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;126226800&quot;: {
 &quot;Year&quot;:      126226800,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;157762800&quot;: {
 &quot;Year&quot;:      157762800,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;189298800&quot;: {
 &quot;Year&quot;:      189298800,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;220921200&quot;: {
 &quot;Year&quot;:      220921200,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;252457200&quot;: {
 &quot;Year&quot;:      252457200,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;283993200&quot;: {
 &quot;Year&quot;:      283993200,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;315529200&quot;: {
 &quot;Year&quot;:      315529200,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;347151600&quot;: {
 &quot;Year&quot;:      347151600,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;378687600&quot;: {
 &quot;Year&quot;:      378687600,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;410223600&quot;: {
 &quot;Year&quot;:      410223600,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;441759600&quot;: {
 &quot;Year&quot;:      441759600,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;473382000&quot;: {
 &quot;Year&quot;:      473382000,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;504918000&quot;: {
 &quot;Year&quot;:      504918000,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;536454000&quot;: {
 &quot;Year&quot;:      536454000,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;567990000&quot;: {
 &quot;Year&quot;:      567990000,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;599612400&quot;: {
 &quot;Year&quot;:      599612400,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;631148400&quot;: {
 &quot;Year&quot;:      631148400,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;662684400&quot;: {
 &quot;Year&quot;:      662684400,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;694220400&quot;: {
 &quot;Year&quot;:      694220400,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;725842800&quot;: {
 &quot;Year&quot;:      725842800,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;757378800&quot;: {
 &quot;Year&quot;:      757378800,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;788914800&quot;: {
 &quot;Year&quot;:      788914800,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;820450800&quot;: {
 &quot;Year&quot;:      820450800,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;852073200&quot;: {
 &quot;Year&quot;:      852073200,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;883609200&quot;: {
 &quot;Year&quot;:      883609200,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;915145200&quot;: {
 &quot;Year&quot;:      915145200,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;946681200&quot;: {
 &quot;Year&quot;:      946681200,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;978303600&quot;: {
 &quot;Year&quot;:      978303600,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;1009839600&quot;: {
 &quot;Year&quot;:     1009839600,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;1041375600&quot;: {
 &quot;Year&quot;:     1041375600,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;1072911600&quot;: {
 &quot;Year&quot;:     1072911600,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;1104534000&quot;: {
 &quot;Year&quot;:     1104534000,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;1136070000&quot;: {
 &quot;Year&quot;:     1136070000,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;1167606000&quot;: {
 &quot;Year&quot;:     1167606000,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;1199142000&quot;: {
 &quot;Year&quot;:     1199142000,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;1230764400&quot;: {
 &quot;Year&quot;:     1230764400,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;1262300400&quot;: {
 &quot;Year&quot;:     1262300400,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
},
&quot;1293836400&quot;: {
 &quot;Year&quot;:     1293836400,
&quot;EVTYPE&quot;: &quot;HEAVY SNOW&quot; 
} 
},
&quot;color&quot;:  palette.color()  
},
{
 &quot;data&quot;: [
 {
 &quot;x&quot;:     -631155600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -599619600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -568083600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -536461200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -504925200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -473389200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -441853200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -410230800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -378694800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -347158800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -315622800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -284000400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -252464400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -220928400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -189392400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -157770000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -126234000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -94698000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -63162000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -31539600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:          -3600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       31532400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       63068400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       94690800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      126226800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      157762800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      189298800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      220921200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      252457200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      283993200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      315529200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      347151600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      378687600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      410223600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      441759600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      473382000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      504918000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      536454000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      567990000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      599612400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      631148400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      662684400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      694220400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      725842800,
&quot;y&quot;: 75 
},
{
 &quot;x&quot;:      757378800,
&quot;y&quot;: 181 
},
{
 &quot;x&quot;:      788914800,
&quot;y&quot;: 49 
},
{
 &quot;x&quot;:      820450800,
&quot;y&quot;: 1112 
},
{
 &quot;x&quot;:      852073200,
&quot;y&quot;: 703 
},
{
 &quot;x&quot;:      883609200,
&quot;y&quot;: 733 
},
{
 &quot;x&quot;:      915145200,
&quot;y&quot;: 948 
},
{
 &quot;x&quot;:      946681200,
&quot;y&quot;: 842 
},
{
 &quot;x&quot;:      978303600,
&quot;y&quot;: 820 
},
{
 &quot;x&quot;:     1009839600,
&quot;y&quot;: 870 
},
{
 &quot;x&quot;:     1041375600,
&quot;y&quot;: 669 
},
{
 &quot;x&quot;:     1072911600,
&quot;y&quot;: 669 
},
{
 &quot;x&quot;:     1104534000,
&quot;y&quot;: 710 
},
{
 &quot;x&quot;:     1136070000,
&quot;y&quot;: 1441 
},
{
 &quot;x&quot;:     1167606000,
&quot;y&quot;: 1627 
},
{
 &quot;x&quot;:     1199142000,
&quot;y&quot;: 2456 
},
{
 &quot;x&quot;:     1230764400,
&quot;y&quot;: 2122 
},
{
 &quot;x&quot;:     1262300400,
&quot;y&quot;: 2050 
},
{
 &quot;x&quot;:     1293836400,
&quot;y&quot;: 2135 
} 
],
&quot;name&quot;: &quot;HIGH WIND&quot;,
&quot;info&quot;: {
 &quot;-631155600&quot;: {
 &quot;Year&quot;:     -631155600,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-599619600&quot;: {
 &quot;Year&quot;:     -599619600,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-568083600&quot;: {
 &quot;Year&quot;:     -568083600,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-536461200&quot;: {
 &quot;Year&quot;:     -536461200,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-504925200&quot;: {
 &quot;Year&quot;:     -504925200,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-473389200&quot;: {
 &quot;Year&quot;:     -473389200,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-441853200&quot;: {
 &quot;Year&quot;:     -441853200,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-410230800&quot;: {
 &quot;Year&quot;:     -410230800,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-378694800&quot;: {
 &quot;Year&quot;:     -378694800,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-347158800&quot;: {
 &quot;Year&quot;:     -347158800,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-315622800&quot;: {
 &quot;Year&quot;:     -315622800,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-284000400&quot;: {
 &quot;Year&quot;:     -284000400,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-252464400&quot;: {
 &quot;Year&quot;:     -252464400,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-220928400&quot;: {
 &quot;Year&quot;:     -220928400,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-189392400&quot;: {
 &quot;Year&quot;:     -189392400,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-157770000&quot;: {
 &quot;Year&quot;:     -157770000,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-126234000&quot;: {
 &quot;Year&quot;:     -126234000,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-94698000&quot;: {
 &quot;Year&quot;:      -94698000,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-63162000&quot;: {
 &quot;Year&quot;:      -63162000,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-31539600&quot;: {
 &quot;Year&quot;:      -31539600,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;-3600&quot;: {
 &quot;Year&quot;:          -3600,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;31532400&quot;: {
 &quot;Year&quot;:       31532400,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;63068400&quot;: {
 &quot;Year&quot;:       63068400,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;94690800&quot;: {
 &quot;Year&quot;:       94690800,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;126226800&quot;: {
 &quot;Year&quot;:      126226800,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;157762800&quot;: {
 &quot;Year&quot;:      157762800,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;189298800&quot;: {
 &quot;Year&quot;:      189298800,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;220921200&quot;: {
 &quot;Year&quot;:      220921200,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;252457200&quot;: {
 &quot;Year&quot;:      252457200,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;283993200&quot;: {
 &quot;Year&quot;:      283993200,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;315529200&quot;: {
 &quot;Year&quot;:      315529200,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;347151600&quot;: {
 &quot;Year&quot;:      347151600,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;378687600&quot;: {
 &quot;Year&quot;:      378687600,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;410223600&quot;: {
 &quot;Year&quot;:      410223600,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;441759600&quot;: {
 &quot;Year&quot;:      441759600,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;473382000&quot;: {
 &quot;Year&quot;:      473382000,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;504918000&quot;: {
 &quot;Year&quot;:      504918000,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;536454000&quot;: {
 &quot;Year&quot;:      536454000,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;567990000&quot;: {
 &quot;Year&quot;:      567990000,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;599612400&quot;: {
 &quot;Year&quot;:      599612400,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;631148400&quot;: {
 &quot;Year&quot;:      631148400,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;662684400&quot;: {
 &quot;Year&quot;:      662684400,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;694220400&quot;: {
 &quot;Year&quot;:      694220400,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;725842800&quot;: {
 &quot;Year&quot;:      725842800,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;757378800&quot;: {
 &quot;Year&quot;:      757378800,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;788914800&quot;: {
 &quot;Year&quot;:      788914800,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;820450800&quot;: {
 &quot;Year&quot;:      820450800,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;852073200&quot;: {
 &quot;Year&quot;:      852073200,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;883609200&quot;: {
 &quot;Year&quot;:      883609200,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;915145200&quot;: {
 &quot;Year&quot;:      915145200,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;946681200&quot;: {
 &quot;Year&quot;:      946681200,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;978303600&quot;: {
 &quot;Year&quot;:      978303600,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;1009839600&quot;: {
 &quot;Year&quot;:     1009839600,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;1041375600&quot;: {
 &quot;Year&quot;:     1041375600,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;1072911600&quot;: {
 &quot;Year&quot;:     1072911600,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;1104534000&quot;: {
 &quot;Year&quot;:     1104534000,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;1136070000&quot;: {
 &quot;Year&quot;:     1136070000,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;1167606000&quot;: {
 &quot;Year&quot;:     1167606000,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;1199142000&quot;: {
 &quot;Year&quot;:     1199142000,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;1230764400&quot;: {
 &quot;Year&quot;:     1230764400,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;1262300400&quot;: {
 &quot;Year&quot;:     1262300400,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
},
&quot;1293836400&quot;: {
 &quot;Year&quot;:     1293836400,
&quot;EVTYPE&quot;: &quot;HIGH WIND&quot; 
} 
},
&quot;color&quot;:  palette.color()  
},
{
 &quot;data&quot;: [
 {
 &quot;x&quot;:     -631155600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -599619600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -568083600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -536461200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -504925200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -473389200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -441853200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -410230800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -378694800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -347158800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -315622800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -284000400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -252464400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -220928400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -189392400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -157770000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -126234000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -94698000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -63162000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -31539600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:          -3600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       31532400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       63068400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       94690800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      126226800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      157762800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      189298800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      220921200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      252457200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      283993200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      315529200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      347151600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      378687600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      410223600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      441759600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      473382000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      504918000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      536454000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      567990000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      599612400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      631148400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      662684400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      694220400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      725842800,
&quot;y&quot;: 467 
},
{
 &quot;x&quot;:      757378800,
&quot;y&quot;: 1007 
},
{
 &quot;x&quot;:      788914800,
&quot;y&quot;: 1077 
},
{
 &quot;x&quot;:      820450800,
&quot;y&quot;: 914 
},
{
 &quot;x&quot;:      852073200,
&quot;y&quot;: 841 
},
{
 &quot;x&quot;:      883609200,
&quot;y&quot;: 900 
},
{
 &quot;x&quot;:      915145200,
&quot;y&quot;: 862 
},
{
 &quot;x&quot;:      946681200,
&quot;y&quot;: 907 
},
{
 &quot;x&quot;:      978303600,
&quot;y&quot;: 880 
},
{
 &quot;x&quot;:     1009839600,
&quot;y&quot;: 875 
},
{
 &quot;x&quot;:     1041375600,
&quot;y&quot;: 741 
},
{
 &quot;x&quot;:     1072911600,
&quot;y&quot;: 705 
},
{
 &quot;x&quot;:     1104534000,
&quot;y&quot;: 864 
},
{
 &quot;x&quot;:     1136070000,
&quot;y&quot;: 840 
},
{
 &quot;x&quot;:     1167606000,
&quot;y&quot;: 719 
},
{
 &quot;x&quot;:     1199142000,
&quot;y&quot;: 766 
},
{
 &quot;x&quot;:     1230764400,
&quot;y&quot;: 721 
},
{
 &quot;x&quot;:     1262300400,
&quot;y&quot;: 867 
},
{
 &quot;x&quot;:     1293836400,
&quot;y&quot;: 801 
} 
],
&quot;name&quot;: &quot;LIGHTNING&quot;,
&quot;info&quot;: {
 &quot;-631155600&quot;: {
 &quot;Year&quot;:     -631155600,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-599619600&quot;: {
 &quot;Year&quot;:     -599619600,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-568083600&quot;: {
 &quot;Year&quot;:     -568083600,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-536461200&quot;: {
 &quot;Year&quot;:     -536461200,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-504925200&quot;: {
 &quot;Year&quot;:     -504925200,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-473389200&quot;: {
 &quot;Year&quot;:     -473389200,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-441853200&quot;: {
 &quot;Year&quot;:     -441853200,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-410230800&quot;: {
 &quot;Year&quot;:     -410230800,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-378694800&quot;: {
 &quot;Year&quot;:     -378694800,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-347158800&quot;: {
 &quot;Year&quot;:     -347158800,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-315622800&quot;: {
 &quot;Year&quot;:     -315622800,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-284000400&quot;: {
 &quot;Year&quot;:     -284000400,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-252464400&quot;: {
 &quot;Year&quot;:     -252464400,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-220928400&quot;: {
 &quot;Year&quot;:     -220928400,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-189392400&quot;: {
 &quot;Year&quot;:     -189392400,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-157770000&quot;: {
 &quot;Year&quot;:     -157770000,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-126234000&quot;: {
 &quot;Year&quot;:     -126234000,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-94698000&quot;: {
 &quot;Year&quot;:      -94698000,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-63162000&quot;: {
 &quot;Year&quot;:      -63162000,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-31539600&quot;: {
 &quot;Year&quot;:      -31539600,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;-3600&quot;: {
 &quot;Year&quot;:          -3600,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;31532400&quot;: {
 &quot;Year&quot;:       31532400,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;63068400&quot;: {
 &quot;Year&quot;:       63068400,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;94690800&quot;: {
 &quot;Year&quot;:       94690800,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;126226800&quot;: {
 &quot;Year&quot;:      126226800,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;157762800&quot;: {
 &quot;Year&quot;:      157762800,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;189298800&quot;: {
 &quot;Year&quot;:      189298800,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;220921200&quot;: {
 &quot;Year&quot;:      220921200,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;252457200&quot;: {
 &quot;Year&quot;:      252457200,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;283993200&quot;: {
 &quot;Year&quot;:      283993200,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;315529200&quot;: {
 &quot;Year&quot;:      315529200,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;347151600&quot;: {
 &quot;Year&quot;:      347151600,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;378687600&quot;: {
 &quot;Year&quot;:      378687600,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;410223600&quot;: {
 &quot;Year&quot;:      410223600,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;441759600&quot;: {
 &quot;Year&quot;:      441759600,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;473382000&quot;: {
 &quot;Year&quot;:      473382000,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;504918000&quot;: {
 &quot;Year&quot;:      504918000,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;536454000&quot;: {
 &quot;Year&quot;:      536454000,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;567990000&quot;: {
 &quot;Year&quot;:      567990000,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;599612400&quot;: {
 &quot;Year&quot;:      599612400,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;631148400&quot;: {
 &quot;Year&quot;:      631148400,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;662684400&quot;: {
 &quot;Year&quot;:      662684400,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;694220400&quot;: {
 &quot;Year&quot;:      694220400,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;725842800&quot;: {
 &quot;Year&quot;:      725842800,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;757378800&quot;: {
 &quot;Year&quot;:      757378800,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;788914800&quot;: {
 &quot;Year&quot;:      788914800,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;820450800&quot;: {
 &quot;Year&quot;:      820450800,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;852073200&quot;: {
 &quot;Year&quot;:      852073200,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;883609200&quot;: {
 &quot;Year&quot;:      883609200,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;915145200&quot;: {
 &quot;Year&quot;:      915145200,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;946681200&quot;: {
 &quot;Year&quot;:      946681200,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;978303600&quot;: {
 &quot;Year&quot;:      978303600,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;1009839600&quot;: {
 &quot;Year&quot;:     1009839600,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;1041375600&quot;: {
 &quot;Year&quot;:     1041375600,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;1072911600&quot;: {
 &quot;Year&quot;:     1072911600,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;1104534000&quot;: {
 &quot;Year&quot;:     1104534000,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;1136070000&quot;: {
 &quot;Year&quot;:     1136070000,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;1167606000&quot;: {
 &quot;Year&quot;:     1167606000,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;1199142000&quot;: {
 &quot;Year&quot;:     1199142000,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;1230764400&quot;: {
 &quot;Year&quot;:     1230764400,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;1262300400&quot;: {
 &quot;Year&quot;:     1262300400,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
},
&quot;1293836400&quot;: {
 &quot;Year&quot;:     1293836400,
&quot;EVTYPE&quot;: &quot;LIGHTNING&quot; 
} 
},
&quot;color&quot;:  palette.color()  
},
{
 &quot;data&quot;: [
 {
 &quot;x&quot;:     -631155600,
&quot;y&quot;: 223 
},
{
 &quot;x&quot;:     -599619600,
&quot;y&quot;: 269 
},
{
 &quot;x&quot;:     -568083600,
&quot;y&quot;: 272 
},
{
 &quot;x&quot;:     -536461200,
&quot;y&quot;: 492 
},
{
 &quot;x&quot;:     -504925200,
&quot;y&quot;: 609 
},
{
 &quot;x&quot;:     -473389200,
&quot;y&quot;: 632 
},
{
 &quot;x&quot;:     -441853200,
&quot;y&quot;: 567 
},
{
 &quot;x&quot;:     -410230800,
&quot;y&quot;: 930 
},
{
 &quot;x&quot;:     -378694800,
&quot;y&quot;: 608 
},
{
 &quot;x&quot;:     -347158800,
&quot;y&quot;: 630 
},
{
 &quot;x&quot;:     -315622800,
&quot;y&quot;: 645 
},
{
 &quot;x&quot;:     -284000400,
&quot;y&quot;: 772 
},
{
 &quot;x&quot;:     -252464400,
&quot;y&quot;: 673 
},
{
 &quot;x&quot;:     -220928400,
&quot;y&quot;: 493 
},
{
 &quot;x&quot;:     -189392400,
&quot;y&quot;: 760 
},
{
 &quot;x&quot;:     -157770000,
&quot;y&quot;: 995 
},
{
 &quot;x&quot;:     -126234000,
&quot;y&quot;: 606 
},
{
 &quot;x&quot;:      -94698000,
&quot;y&quot;: 966 
},
{
 &quot;x&quot;:      -63162000,
&quot;y&quot;: 715 
},
{
 &quot;x&quot;:      -31539600,
&quot;y&quot;: 650 
},
{
 &quot;x&quot;:          -3600,
&quot;y&quot;: 700 
},
{
 &quot;x&quot;:       31532400,
&quot;y&quot;: 963 
},
{
 &quot;x&quot;:       63068400,
&quot;y&quot;: 775 
},
{
 &quot;x&quot;:       94690800,
&quot;y&quot;: 1199 
},
{
 &quot;x&quot;:      126226800,
&quot;y&quot;: 1123 
},
{
 &quot;x&quot;:      157762800,
&quot;y&quot;: 962 
},
{
 &quot;x&quot;:      189298800,
&quot;y&quot;: 935 
},
{
 &quot;x&quot;:      220921200,
&quot;y&quot;: 922 
},
{
 &quot;x&quot;:      252457200,
&quot;y&quot;: 875 
},
{
 &quot;x&quot;:      283993200,
&quot;y&quot;: 918 
},
{
 &quot;x&quot;:      315529200,
&quot;y&quot;: 972 
},
{
 &quot;x&quot;:      347151600,
&quot;y&quot;: 830 
},
{
 &quot;x&quot;:      378687600,
&quot;y&quot;: 1181 
},
{
 &quot;x&quot;:      410223600,
&quot;y&quot;: 995 
},
{
 &quot;x&quot;:      441759600,
&quot;y&quot;: 1020 
},
{
 &quot;x&quot;:      473382000,
&quot;y&quot;: 773 
},
{
 &quot;x&quot;:      504918000,
&quot;y&quot;: 849 
},
{
 &quot;x&quot;:      536454000,
&quot;y&quot;: 695 
},
{
 &quot;x&quot;:      567990000,
&quot;y&quot;: 773 
},
{
 &quot;x&quot;:      599612400,
&quot;y&quot;: 921 
},
{
 &quot;x&quot;:      631148400,
&quot;y&quot;: 1264 
},
{
 &quot;x&quot;:      662684400,
&quot;y&quot;: 1208 
},
{
 &quot;x&quot;:      694220400,
&quot;y&quot;: 1404 
},
{
 &quot;x&quot;:      725842800,
&quot;y&quot;: 614 
},
{
 &quot;x&quot;:      757378800,
&quot;y&quot;: 939 
},
{
 &quot;x&quot;:      788914800,
&quot;y&quot;: 1181 
},
{
 &quot;x&quot;:      820450800,
&quot;y&quot;: 1239 
},
{
 &quot;x&quot;:      852073200,
&quot;y&quot;: 1180 
},
{
 &quot;x&quot;:      883609200,
&quot;y&quot;: 1529 
},
{
 &quot;x&quot;:      915145200,
&quot;y&quot;: 1519 
},
{
 &quot;x&quot;:      946681200,
&quot;y&quot;: 1169 
},
{
 &quot;x&quot;:      978303600,
&quot;y&quot;: 1351 
},
{
 &quot;x&quot;:     1009839600,
&quot;y&quot;: 1040 
},
{
 &quot;x&quot;:     1041375600,
&quot;y&quot;: 1534 
},
{
 &quot;x&quot;:     1072911600,
&quot;y&quot;: 1947 
},
{
 &quot;x&quot;:     1104534000,
&quot;y&quot;: 1343 
},
{
 &quot;x&quot;:     1136070000,
&quot;y&quot;: 1264 
},
{
 &quot;x&quot;:     1167606000,
&quot;y&quot;: 1238 
},
{
 &quot;x&quot;:     1199142000,
&quot;y&quot;: 1891 
},
{
 &quot;x&quot;:     1230764400,
&quot;y&quot;: 1272 
},
{
 &quot;x&quot;:     1262300400,
&quot;y&quot;: 1446 
},
{
 &quot;x&quot;:     1293836400,
&quot;y&quot;: 2192 
} 
],
&quot;name&quot;: &quot;TORNADO&quot;,
&quot;info&quot;: {
 &quot;-631155600&quot;: {
 &quot;Year&quot;:     -631155600,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-599619600&quot;: {
 &quot;Year&quot;:     -599619600,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-568083600&quot;: {
 &quot;Year&quot;:     -568083600,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-536461200&quot;: {
 &quot;Year&quot;:     -536461200,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-504925200&quot;: {
 &quot;Year&quot;:     -504925200,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-473389200&quot;: {
 &quot;Year&quot;:     -473389200,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-441853200&quot;: {
 &quot;Year&quot;:     -441853200,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-410230800&quot;: {
 &quot;Year&quot;:     -410230800,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-378694800&quot;: {
 &quot;Year&quot;:     -378694800,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-347158800&quot;: {
 &quot;Year&quot;:     -347158800,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-315622800&quot;: {
 &quot;Year&quot;:     -315622800,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-284000400&quot;: {
 &quot;Year&quot;:     -284000400,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-252464400&quot;: {
 &quot;Year&quot;:     -252464400,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-220928400&quot;: {
 &quot;Year&quot;:     -220928400,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-189392400&quot;: {
 &quot;Year&quot;:     -189392400,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-157770000&quot;: {
 &quot;Year&quot;:     -157770000,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-126234000&quot;: {
 &quot;Year&quot;:     -126234000,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-94698000&quot;: {
 &quot;Year&quot;:      -94698000,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-63162000&quot;: {
 &quot;Year&quot;:      -63162000,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-31539600&quot;: {
 &quot;Year&quot;:      -31539600,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;-3600&quot;: {
 &quot;Year&quot;:          -3600,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;31532400&quot;: {
 &quot;Year&quot;:       31532400,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;63068400&quot;: {
 &quot;Year&quot;:       63068400,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;94690800&quot;: {
 &quot;Year&quot;:       94690800,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;126226800&quot;: {
 &quot;Year&quot;:      126226800,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;157762800&quot;: {
 &quot;Year&quot;:      157762800,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;189298800&quot;: {
 &quot;Year&quot;:      189298800,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;220921200&quot;: {
 &quot;Year&quot;:      220921200,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;252457200&quot;: {
 &quot;Year&quot;:      252457200,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;283993200&quot;: {
 &quot;Year&quot;:      283993200,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;315529200&quot;: {
 &quot;Year&quot;:      315529200,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;347151600&quot;: {
 &quot;Year&quot;:      347151600,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;378687600&quot;: {
 &quot;Year&quot;:      378687600,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;410223600&quot;: {
 &quot;Year&quot;:      410223600,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;441759600&quot;: {
 &quot;Year&quot;:      441759600,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;473382000&quot;: {
 &quot;Year&quot;:      473382000,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;504918000&quot;: {
 &quot;Year&quot;:      504918000,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;536454000&quot;: {
 &quot;Year&quot;:      536454000,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;567990000&quot;: {
 &quot;Year&quot;:      567990000,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;599612400&quot;: {
 &quot;Year&quot;:      599612400,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;631148400&quot;: {
 &quot;Year&quot;:      631148400,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;662684400&quot;: {
 &quot;Year&quot;:      662684400,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;694220400&quot;: {
 &quot;Year&quot;:      694220400,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;725842800&quot;: {
 &quot;Year&quot;:      725842800,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;757378800&quot;: {
 &quot;Year&quot;:      757378800,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;788914800&quot;: {
 &quot;Year&quot;:      788914800,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;820450800&quot;: {
 &quot;Year&quot;:      820450800,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;852073200&quot;: {
 &quot;Year&quot;:      852073200,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;883609200&quot;: {
 &quot;Year&quot;:      883609200,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;915145200&quot;: {
 &quot;Year&quot;:      915145200,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;946681200&quot;: {
 &quot;Year&quot;:      946681200,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;978303600&quot;: {
 &quot;Year&quot;:      978303600,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;1009839600&quot;: {
 &quot;Year&quot;:     1009839600,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;1041375600&quot;: {
 &quot;Year&quot;:     1041375600,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;1072911600&quot;: {
 &quot;Year&quot;:     1072911600,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;1104534000&quot;: {
 &quot;Year&quot;:     1104534000,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;1136070000&quot;: {
 &quot;Year&quot;:     1136070000,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;1167606000&quot;: {
 &quot;Year&quot;:     1167606000,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;1199142000&quot;: {
 &quot;Year&quot;:     1199142000,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;1230764400&quot;: {
 &quot;Year&quot;:     1230764400,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;1262300400&quot;: {
 &quot;Year&quot;:     1262300400,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
},
&quot;1293836400&quot;: {
 &quot;Year&quot;:     1293836400,
&quot;EVTYPE&quot;: &quot;TORNADO&quot; 
} 
},
&quot;color&quot;:  palette.color()  
},
{
 &quot;data&quot;: [
 {
 &quot;x&quot;:     -631155600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -599619600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -568083600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -536461200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -504925200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -473389200,
&quot;y&quot;: 421 
},
{
 &quot;x&quot;:     -441853200,
&quot;y&quot;: 735 
},
{
 &quot;x&quot;:     -410230800,
&quot;y&quot;: 775 
},
{
 &quot;x&quot;:     -378694800,
&quot;y&quot;: 899 
},
{
 &quot;x&quot;:     -347158800,
&quot;y&quot;: 652 
},
{
 &quot;x&quot;:     -315622800,
&quot;y&quot;: 719 
},
{
 &quot;x&quot;:     -284000400,
&quot;y&quot;: 752 
},
{
 &quot;x&quot;:     -252464400,
&quot;y&quot;: 830 
},
{
 &quot;x&quot;:     -220928400,
&quot;y&quot;: 823 
},
{
 &quot;x&quot;:     -189392400,
&quot;y&quot;: 909 
},
{
 &quot;x&quot;:     -157770000,
&quot;y&quot;: 1055 
},
{
 &quot;x&quot;:     -126234000,
&quot;y&quot;: 1050 
},
{
 &quot;x&quot;:      -94698000,
&quot;y&quot;: 958 
},
{
 &quot;x&quot;:      -63162000,
&quot;y&quot;: 1529 
},
{
 &quot;x&quot;:      -31539600,
&quot;y&quot;: 1510 
},
{
 &quot;x&quot;:          -3600,
&quot;y&quot;: 1794 
},
{
 &quot;x&quot;:       31532400,
&quot;y&quot;: 1544 
},
{
 &quot;x&quot;:       63068400,
&quot;y&quot;: 712 
},
{
 &quot;x&quot;:       94690800,
&quot;y&quot;: 2166 
},
{
 &quot;x&quot;:      126226800,
&quot;y&quot;: 2603 
},
{
 &quot;x&quot;:      157762800,
&quot;y&quot;: 2639 
},
{
 &quot;x&quot;:      189298800,
&quot;y&quot;: 1742 
},
{
 &quot;x&quot;:      220921200,
&quot;y&quot;: 1723 
},
{
 &quot;x&quot;:      252457200,
&quot;y&quot;: 1758 
},
{
 &quot;x&quot;:      283993200,
&quot;y&quot;: 2046 
},
{
 &quot;x&quot;:      315529200,
&quot;y&quot;: 3181 
},
{
 &quot;x&quot;:      347151600,
&quot;y&quot;: 2193 
},
{
 &quot;x&quot;:      378687600,
&quot;y&quot;: 3570 
},
{
 &quot;x&quot;:      410223600,
&quot;y&quot;: 4993 
},
{
 &quot;x&quot;:      441759600,
&quot;y&quot;: 3566 
},
{
 &quot;x&quot;:      473382000,
&quot;y&quot;: 3827 
},
{
 &quot;x&quot;:      504918000,
&quot;y&quot;: 4365 
},
{
 &quot;x&quot;:      536454000,
&quot;y&quot;: 4256 
},
{
 &quot;x&quot;:      567990000,
&quot;y&quot;: 3947 
},
{
 &quot;x&quot;:      599612400,
&quot;y&quot;: 5711 
},
{
 &quot;x&quot;:      631148400,
&quot;y&quot;: 6064 
},
{
 &quot;x&quot;:      662684400,
&quot;y&quot;: 6503 
},
{
 &quot;x&quot;:      694220400,
&quot;y&quot;: 6443 
},
{
 &quot;x&quot;:      725842800,
&quot;y&quot;: 3818 
},
{
 &quot;x&quot;:      757378800,
&quot;y&quot;: 7856 
},
{
 &quot;x&quot;:      788914800,
&quot;y&quot;: 10645 
},
{
 &quot;x&quot;:      820450800,
&quot;y&quot;: 9965 
},
{
 &quot;x&quot;:      852073200,
&quot;y&quot;: 9824 
},
{
 &quot;x&quot;:      883609200,
&quot;y&quot;: 13551 
},
{
 &quot;x&quot;:      915145200,
&quot;y&quot;: 10315 
},
{
 &quot;x&quot;:      946681200,
&quot;y&quot;: 12152 
},
{
 &quot;x&quot;:      978303600,
&quot;y&quot;: 11829 
},
{
 &quot;x&quot;:     1009839600,
&quot;y&quot;: 12963 
},
{
 &quot;x&quot;:     1041375600,
&quot;y&quot;: 13438 
},
{
 &quot;x&quot;:     1072911600,
&quot;y&quot;: 13225 
},
{
 &quot;x&quot;:     1104534000,
&quot;y&quot;: 13437 
},
{
 &quot;x&quot;:     1136070000,
&quot;y&quot;: 14877 
},
{
 &quot;x&quot;:     1167606000,
&quot;y&quot;: 12998 
},
{
 &quot;x&quot;:     1199142000,
&quot;y&quot;: 16782 
},
{
 &quot;x&quot;:     1230764400,
&quot;y&quot;: 13379 
},
{
 &quot;x&quot;:     1262300400,
&quot;y&quot;: 15826 
},
{
 &quot;x&quot;:     1293836400,
&quot;y&quot;: 21678 
} 
],
&quot;name&quot;: &quot;TSTM WIND&quot;,
&quot;info&quot;: {
 &quot;-631155600&quot;: {
 &quot;Year&quot;:     -631155600,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-599619600&quot;: {
 &quot;Year&quot;:     -599619600,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-568083600&quot;: {
 &quot;Year&quot;:     -568083600,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-536461200&quot;: {
 &quot;Year&quot;:     -536461200,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-504925200&quot;: {
 &quot;Year&quot;:     -504925200,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-473389200&quot;: {
 &quot;Year&quot;:     -473389200,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-441853200&quot;: {
 &quot;Year&quot;:     -441853200,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-410230800&quot;: {
 &quot;Year&quot;:     -410230800,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-378694800&quot;: {
 &quot;Year&quot;:     -378694800,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-347158800&quot;: {
 &quot;Year&quot;:     -347158800,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-315622800&quot;: {
 &quot;Year&quot;:     -315622800,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-284000400&quot;: {
 &quot;Year&quot;:     -284000400,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-252464400&quot;: {
 &quot;Year&quot;:     -252464400,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-220928400&quot;: {
 &quot;Year&quot;:     -220928400,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-189392400&quot;: {
 &quot;Year&quot;:     -189392400,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-157770000&quot;: {
 &quot;Year&quot;:     -157770000,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-126234000&quot;: {
 &quot;Year&quot;:     -126234000,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-94698000&quot;: {
 &quot;Year&quot;:      -94698000,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-63162000&quot;: {
 &quot;Year&quot;:      -63162000,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-31539600&quot;: {
 &quot;Year&quot;:      -31539600,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;-3600&quot;: {
 &quot;Year&quot;:          -3600,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;31532400&quot;: {
 &quot;Year&quot;:       31532400,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;63068400&quot;: {
 &quot;Year&quot;:       63068400,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;94690800&quot;: {
 &quot;Year&quot;:       94690800,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;126226800&quot;: {
 &quot;Year&quot;:      126226800,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;157762800&quot;: {
 &quot;Year&quot;:      157762800,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;189298800&quot;: {
 &quot;Year&quot;:      189298800,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;220921200&quot;: {
 &quot;Year&quot;:      220921200,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;252457200&quot;: {
 &quot;Year&quot;:      252457200,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;283993200&quot;: {
 &quot;Year&quot;:      283993200,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;315529200&quot;: {
 &quot;Year&quot;:      315529200,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;347151600&quot;: {
 &quot;Year&quot;:      347151600,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;378687600&quot;: {
 &quot;Year&quot;:      378687600,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;410223600&quot;: {
 &quot;Year&quot;:      410223600,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;441759600&quot;: {
 &quot;Year&quot;:      441759600,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;473382000&quot;: {
 &quot;Year&quot;:      473382000,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;504918000&quot;: {
 &quot;Year&quot;:      504918000,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;536454000&quot;: {
 &quot;Year&quot;:      536454000,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;567990000&quot;: {
 &quot;Year&quot;:      567990000,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;599612400&quot;: {
 &quot;Year&quot;:      599612400,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;631148400&quot;: {
 &quot;Year&quot;:      631148400,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;662684400&quot;: {
 &quot;Year&quot;:      662684400,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;694220400&quot;: {
 &quot;Year&quot;:      694220400,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;725842800&quot;: {
 &quot;Year&quot;:      725842800,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;757378800&quot;: {
 &quot;Year&quot;:      757378800,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;788914800&quot;: {
 &quot;Year&quot;:      788914800,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;820450800&quot;: {
 &quot;Year&quot;:      820450800,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;852073200&quot;: {
 &quot;Year&quot;:      852073200,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;883609200&quot;: {
 &quot;Year&quot;:      883609200,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;915145200&quot;: {
 &quot;Year&quot;:      915145200,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;946681200&quot;: {
 &quot;Year&quot;:      946681200,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;978303600&quot;: {
 &quot;Year&quot;:      978303600,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;1009839600&quot;: {
 &quot;Year&quot;:     1009839600,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;1041375600&quot;: {
 &quot;Year&quot;:     1041375600,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;1072911600&quot;: {
 &quot;Year&quot;:     1072911600,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;1104534000&quot;: {
 &quot;Year&quot;:     1104534000,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;1136070000&quot;: {
 &quot;Year&quot;:     1136070000,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;1167606000&quot;: {
 &quot;Year&quot;:     1167606000,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;1199142000&quot;: {
 &quot;Year&quot;:     1199142000,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;1230764400&quot;: {
 &quot;Year&quot;:     1230764400,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;1262300400&quot;: {
 &quot;Year&quot;:     1262300400,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
},
&quot;1293836400&quot;: {
 &quot;Year&quot;:     1293836400,
&quot;EVTYPE&quot;: &quot;TSTM WIND&quot; 
} 
},
&quot;color&quot;:  palette.color()  
},
{
 &quot;data&quot;: [
 {
 &quot;x&quot;:     -631155600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -599619600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -568083600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -536461200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -504925200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -473389200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -441853200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -410230800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -378694800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -347158800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -315622800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -284000400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -252464400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -220928400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -189392400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -157770000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:     -126234000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -94698000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -63162000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      -31539600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:          -3600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       31532400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       63068400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:       94690800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      126226800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      157762800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      189298800,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      220921200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      252457200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      283993200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      315529200,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      347151600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      378687600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      410223600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      441759600,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      473382000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      504918000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      536454000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      567990000,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      599612400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      631148400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      662684400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      694220400,
&quot;y&quot;: 0 
},
{
 &quot;x&quot;:      725842800,
&quot;y&quot;: 30 
},
{
 &quot;x&quot;:      757378800,
&quot;y&quot;: 31 
},
{
 &quot;x&quot;:      788914800,
&quot;y&quot;: 55 
},
{
 &quot;x&quot;:      820450800,
&quot;y&quot;: 435 
},
{
 &quot;x&quot;:      852073200,
&quot;y&quot;: 452 
},
{
 &quot;x&quot;:      883609200,
&quot;y&quot;: 261 
},
{
 &quot;x&quot;:      915145200,
&quot;y&quot;: 395 
},
{
 &quot;x&quot;:      946681200,
&quot;y&quot;: 514 
},
{
 &quot;x&quot;:      978303600,
&quot;y&quot;: 438 
},
{
 &quot;x&quot;:     1009839600,
&quot;y&quot;: 462 
},
{
 &quot;x&quot;:     1041375600,
&quot;y&quot;: 547 
},
{
 &quot;x&quot;:     1072911600,
&quot;y&quot;: 429 
},
{
 &quot;x&quot;:     1104534000,
&quot;y&quot;: 531 
},
{
 &quot;x&quot;:     1136070000,
&quot;y&quot;: 463 
},
{
 &quot;x&quot;:     1167606000,
&quot;y&quot;: 1036 
},
{
 &quot;x&quot;:     1199142000,
&quot;y&quot;: 1424 
},
{
 &quot;x&quot;:     1230764400,
&quot;y&quot;: 1268 
},
{
 &quot;x&quot;:     1262300400,
&quot;y&quot;: 1488 
},
{
 &quot;x&quot;:     1293836400,
&quot;y&quot;: 1174 
} 
],
&quot;name&quot;: &quot;WINTER STORM&quot;,
&quot;info&quot;: {
 &quot;-631155600&quot;: {
 &quot;Year&quot;:     -631155600,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-599619600&quot;: {
 &quot;Year&quot;:     -599619600,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-568083600&quot;: {
 &quot;Year&quot;:     -568083600,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-536461200&quot;: {
 &quot;Year&quot;:     -536461200,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-504925200&quot;: {
 &quot;Year&quot;:     -504925200,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-473389200&quot;: {
 &quot;Year&quot;:     -473389200,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-441853200&quot;: {
 &quot;Year&quot;:     -441853200,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-410230800&quot;: {
 &quot;Year&quot;:     -410230800,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-378694800&quot;: {
 &quot;Year&quot;:     -378694800,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-347158800&quot;: {
 &quot;Year&quot;:     -347158800,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-315622800&quot;: {
 &quot;Year&quot;:     -315622800,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-284000400&quot;: {
 &quot;Year&quot;:     -284000400,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-252464400&quot;: {
 &quot;Year&quot;:     -252464400,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-220928400&quot;: {
 &quot;Year&quot;:     -220928400,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-189392400&quot;: {
 &quot;Year&quot;:     -189392400,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-157770000&quot;: {
 &quot;Year&quot;:     -157770000,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-126234000&quot;: {
 &quot;Year&quot;:     -126234000,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-94698000&quot;: {
 &quot;Year&quot;:      -94698000,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-63162000&quot;: {
 &quot;Year&quot;:      -63162000,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-31539600&quot;: {
 &quot;Year&quot;:      -31539600,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;-3600&quot;: {
 &quot;Year&quot;:          -3600,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;31532400&quot;: {
 &quot;Year&quot;:       31532400,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;63068400&quot;: {
 &quot;Year&quot;:       63068400,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;94690800&quot;: {
 &quot;Year&quot;:       94690800,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;126226800&quot;: {
 &quot;Year&quot;:      126226800,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;157762800&quot;: {
 &quot;Year&quot;:      157762800,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;189298800&quot;: {
 &quot;Year&quot;:      189298800,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;220921200&quot;: {
 &quot;Year&quot;:      220921200,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;252457200&quot;: {
 &quot;Year&quot;:      252457200,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;283993200&quot;: {
 &quot;Year&quot;:      283993200,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;315529200&quot;: {
 &quot;Year&quot;:      315529200,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;347151600&quot;: {
 &quot;Year&quot;:      347151600,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;378687600&quot;: {
 &quot;Year&quot;:      378687600,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;410223600&quot;: {
 &quot;Year&quot;:      410223600,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;441759600&quot;: {
 &quot;Year&quot;:      441759600,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;473382000&quot;: {
 &quot;Year&quot;:      473382000,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;504918000&quot;: {
 &quot;Year&quot;:      504918000,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;536454000&quot;: {
 &quot;Year&quot;:      536454000,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;567990000&quot;: {
 &quot;Year&quot;:      567990000,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;599612400&quot;: {
 &quot;Year&quot;:      599612400,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;631148400&quot;: {
 &quot;Year&quot;:      631148400,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;662684400&quot;: {
 &quot;Year&quot;:      662684400,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;694220400&quot;: {
 &quot;Year&quot;:      694220400,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;725842800&quot;: {
 &quot;Year&quot;:      725842800,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;757378800&quot;: {
 &quot;Year&quot;:      757378800,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;788914800&quot;: {
 &quot;Year&quot;:      788914800,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;820450800&quot;: {
 &quot;Year&quot;:      820450800,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;852073200&quot;: {
 &quot;Year&quot;:      852073200,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;883609200&quot;: {
 &quot;Year&quot;:      883609200,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;915145200&quot;: {
 &quot;Year&quot;:      915145200,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;946681200&quot;: {
 &quot;Year&quot;:      946681200,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;978303600&quot;: {
 &quot;Year&quot;:      978303600,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;1009839600&quot;: {
 &quot;Year&quot;:     1009839600,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;1041375600&quot;: {
 &quot;Year&quot;:     1041375600,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;1072911600&quot;: {
 &quot;Year&quot;:     1072911600,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;1104534000&quot;: {
 &quot;Year&quot;:     1104534000,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;1136070000&quot;: {
 &quot;Year&quot;:     1136070000,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;1167606000&quot;: {
 &quot;Year&quot;:     1167606000,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;1199142000&quot;: {
 &quot;Year&quot;:     1199142000,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;1230764400&quot;: {
 &quot;Year&quot;:     1230764400,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;1262300400&quot;: {
 &quot;Year&quot;:     1262300400,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
},
&quot;1293836400&quot;: {
 &quot;Year&quot;:     1293836400,
&quot;EVTYPE&quot;: &quot;WINTER STORM&quot; 
} 
},
&quot;color&quot;:  palette.color()  
} 
],
&quot;renderer&quot;: &quot;line&quot;,
&quot;id&quot;: &quot;chart8f4248f770b4&quot; 
}
  chartParams.element = document.querySelector('#chart8f4248f770b4')
  
  var graphchart8f4248f770b4 = new Rickshaw.Graph(chartParams);

  var resize = function() {
		graphchart8f4248f770b4.configure({
			width: window.innerWidth * 0.9,
			height: window.innerHeight * 0.75
		});
		graphchart8f4248f770b4.render();
	}
	window.addEventListener('resize', resize); 
	resize();
  
  graphchart8f4248f770b4.render();
  
  var xAxischart8f4248f770b4 = new Rickshaw.Graph.Axis.Time({
 &quot;graph&quot;:  graphchart8f4248f770b4  
})
var yAxischart8f4248f770b4 = new Rickshaw.Graph.Axis.Y({
 &quot;graph&quot;:  graphchart8f4248f770b4 ,
&quot;orientation&quot;: &quot;left&quot;,
&quot;element&quot;:  document.getElementById('yAxischart8f4248f770b4') ,
&quot;tickFormat&quot;:  Rickshaw.Fixtures.Number.formatKMBT  
})
graphchart8f4248f770b4.render()
var legendchart8f4248f770b4 = new Rickshaw.Graph.Legend({
 &quot;graph&quot;:  graphchart8f4248f770b4 ,
&quot;element&quot;:  document.getElementById('legendchart8f4248f770b4')  
})

var hoverDetailchart8f4248f770b4 = new Rickshaw.Graph.HoverDetail({
 &quot;graph&quot;:  graphchart8f4248f770b4  
})
var highlightchart8f4248f770b4 = new Rickshaw.Graph.Behavior.Series.Highlight({
 &quot;graph&quot;:  graphchart8f4248f770b4 ,
&quot;legend&quot;:  legendchart8f4248f770b4  
})
var sliderchart8f4248f770b4 = new Rickshaw.Graph.RangeSlider({
 &quot;graph&quot;:  graphchart8f4248f770b4 ,
&quot;element&quot;:  document.getElementById('sliderchart8f4248f770b4')  
})
  
&lt;/script&gt; 
    
  &lt;/body&gt;
&lt;/html&gt; " scrolling="no" frameBorder="0" seamless class="rChart  rickshaw  " id="iframe-chart8f4248f770b4">
</iframe>
<style>iframe.rChart{ max-width:740px; width: 100%; height: 400px;}</style>

Below is the list of average occurences per year during 1950-2011 of 20 most frequent events.


```r
# List of average occurences per year
avg_occ = sort(apply(table(data$Year,data$EVTYPE),2,sum),decreasing=TRUE)[1:20]/61
data.frame(`Avg Occurences` = avg_occ)
```

```
##                      Avg.Occurences
## TSTM WIND                5401.98361
## HAIL                     4732.14754
## TORNADO                   994.29508
## FLASH FLOOD               889.78689
## FLOOD                     415.18033
## HIGH WIND                 331.34426
## LIGHTNING                 258.26230
## HEAVY SNOW                257.50820
## HEAVY RAIN                192.18033
## WINTER STORM              187.42623
## WINTER WEATHER            115.18033
## FUNNEL CLOUD              112.11475
## MARINE TSTM WIND           95.27869
## WATERSPOUT                 62.22951
## STRONG WIND                58.45902
## URBAN/SML STREAM FLD       55.60656
## WILDFIRE                   45.26230
## BLIZZARD                   44.57377
## DROUGHT                    40.78689
## ICE STORM                  32.88525
```

In the table below I show the annual averages of property damage, crop damage, total damage, number of injuries, deaths and occurences during **1950-2011**. I highlight the time period because later in my analysis I focus on the 2000-2011 period. The table is initially sorted by the average number of occurences per year. You may play around with the table.


```r
# http://rstudio.github.io/DT/
# require(devtools)
# install_github('ramnathv/htmlwidgets')
# install_github("rstudio/DT")

require(htmlwidgets)
require(DT)

# Create data frame for datatable
datatab <- data.frame(
  `Property Damage` = tapply(data$PROPDMGSCALE,list(data$EVTYPE),sum)/61,
  `Crop Damage` = tapply(data$CROPDMGSCALE,list(data$EVTYPE),sum)/61,
  `Total Damage` = 
    tapply(data$PROPDMGSCALE,list(data$EVTYPE),sum)/61 + tapply(data$CROPDMGSCALE,list(data$EVTYPE),sum)/61,
  Deaths = tapply(data$FATALITIES,list(data$EVTYPE),sum)/61,
  Injuries = tapply(data$INJURIES,list(data$EVTYPE),sum)/61,
  Occurences = matrix(table(data[,"EVTYPE"])/61)
  )

# Create datatable initially sorted by avg number of occurences
datatable(format(datatab,big.mark = ',',scientific = F, digits = 1),
          colnames = c('Property Damage,$' = 2, 'Crop Damage,$' = 3, 'Total Damage,$' = 4),
          caption = 'Table: Average annual values, 1950-2011',
          options = list(order = list(list(6, 'desc'))),
          extensions = 'Responsive'
          )
```

<p><div id="htmlwidget-7821" style="width:100%;height:auto;" class="datatables"></div>
<script type="application/json" data-for="htmlwidget-7821">{"x":{"data":[["   HIGH SURF ADVISORY"," COASTAL FLOOD"," FLASH FLOOD"," LIGHTNING"," TSTM WIND"," TSTM WIND (G45)"," WATERSPOUT"," WIND","?","ABNORMAL WARMTH","ABNORMALLY DRY","ABNORMALLY WET","ACCUMULATED SNOWFALL","AGRICULTURAL FREEZE","APACHE COUNTY","ASTRONOMICAL HIGH TIDE","ASTRONOMICAL LOW TIDE","AVALANCE","AVALANCHE","BEACH EROSIN","Beach Erosion","BEACH EROSION","BEACH EROSION/COASTAL FLOOD","BEACH FLOOD","BELOW NORMAL PRECIPITATION","BITTER WIND CHILL","BITTER WIND CHILL TEMPERATURES","Black Ice","BLACK ICE","BLIZZARD","BLIZZARD AND EXTREME WIND CHIL","BLIZZARD AND HEAVY SNOW","Blizzard Summary","BLIZZARD WEATHER","BLIZZARD/FREEZING RAIN","BLIZZARD/HEAVY SNOW","BLIZZARD/HIGH WIND","BLIZZARD/WINTER STORM","BLOW-OUT TIDE","BLOW-OUT TIDES","BLOWING DUST","blowing snow","Blowing Snow","BLOWING SNOW","BLOWING SNOW &amp; EXTREME WIND CH","BLOWING SNOW- EXTREME WIND CHI","BLOWING SNOW/EXTREME WIND CHIL","BREAKUP FLOODING","BRUSH FIRE","BRUSH FIRES","COASTAL  FLOODING/EROSION","COASTAL EROSION","Coastal Flood","COASTAL FLOOD","coastal flooding","Coastal Flooding","COASTAL FLOODING","COASTAL FLOODING/EROSION","Coastal Storm","COASTAL STORM","COASTAL SURGE","COASTAL/TIDAL FLOOD","COASTALFLOOD","COASTALSTORM","Cold","COLD","COLD AIR FUNNEL","COLD AIR FUNNELS","COLD AIR TORNADO","Cold and Frost","COLD AND FROST","COLD AND SNOW","COLD AND WET CONDITIONS","Cold Temperature","COLD TEMPERATURES","COLD WAVE","COLD WEATHER","COLD WIND CHILL TEMPERATURES","COLD/WIND CHILL","COLD/WINDS","COOL AND WET","COOL SPELL","CSTL FLOODING/EROSION","DAM BREAK","DAM FAILURE","Damaging Freeze","DAMAGING FREEZE","DEEP HAIL","DENSE FOG","DENSE SMOKE","DOWNBURST","DOWNBURST WINDS","DRIEST MONTH","Drifting Snow","DROUGHT","DROUGHT/EXCESSIVE HEAT","DROWNING","DRY","DRY CONDITIONS","DRY HOT WEATHER","DRY MICROBURST","DRY MICROBURST 50","DRY MICROBURST 53","DRY MICROBURST 58","DRY MICROBURST 61","DRY MICROBURST 84","DRY MICROBURST WINDS","DRY MIRCOBURST WINDS","DRY PATTERN","DRY SPELL","DRY WEATHER","DRYNESS","DUST DEVEL","Dust Devil","DUST DEVIL","DUST DEVIL WATERSPOUT","DUST STORM","DUST STORM/HIGH WINDS","DUSTSTORM","EARLY FREEZE","Early Frost","EARLY FROST","EARLY RAIN","EARLY SNOW","Early snowfall","EARLY SNOWFALL","Erosion/Cstl Flood","EXCESSIVE","Excessive Cold","EXCESSIVE HEAT","EXCESSIVE HEAT/DROUGHT","EXCESSIVE PRECIPITATION","EXCESSIVE RAIN","EXCESSIVE RAINFALL","EXCESSIVE SNOW","EXCESSIVE WETNESS","EXCESSIVELY DRY","Extended Cold","Extreme Cold","EXTREME COLD","EXTREME COLD/WIND CHILL","EXTREME HEAT","EXTREME WIND CHILL","EXTREME WIND CHILL/BLOWING SNO","EXTREME WIND CHILLS","EXTREME WINDCHILL","EXTREME WINDCHILL TEMPERATURES","EXTREME/RECORD COLD","EXTREMELY WET","FALLING SNOW/ICE","FIRST FROST","FIRST SNOW","FLASH FLOOD","FLASH FLOOD - HEAVY RAIN","FLASH FLOOD FROM ICE JAMS","FLASH FLOOD LANDSLIDES","FLASH FLOOD WINDS","FLASH FLOOD/","FLASH FLOOD/ FLOOD","FLASH FLOOD/ STREET","FLASH FLOOD/FLOOD","FLASH FLOOD/HEAVY RAIN","FLASH FLOOD/LANDSLIDE","FLASH FLOODING","FLASH FLOODING/FLOOD","FLASH FLOODING/THUNDERSTORM WI","FLASH FLOODS","FLASH FLOOODING","Flood","FLOOD","FLOOD &amp; HEAVY RAIN","FLOOD FLASH","FLOOD FLOOD/FLASH","FLOOD WATCH/","FLOOD/FLASH","Flood/Flash Flood","FLOOD/FLASH FLOOD","FLOOD/FLASH FLOODING","FLOOD/FLASH/FLOOD","FLOOD/FLASHFLOOD","FLOOD/RAIN/WIND","FLOOD/RAIN/WINDS","FLOOD/RIVER FLOOD","Flood/Strong Wind","FLOODING","FLOODING/HEAVY RAIN","FLOODS","FOG","FOG AND COLD TEMPERATURES","FOREST FIRES","Freeze","FREEZE","Freezing drizzle","Freezing Drizzle","FREEZING DRIZZLE","FREEZING DRIZZLE AND FREEZING","Freezing Fog","FREEZING FOG","Freezing rain","Freezing Rain","FREEZING RAIN","FREEZING RAIN AND SLEET","FREEZING RAIN AND SNOW","FREEZING RAIN SLEET AND","FREEZING RAIN SLEET AND LIGHT","FREEZING RAIN/SLEET","FREEZING RAIN/SNOW","Freezing Spray","Frost","FROST","Frost/Freeze","FROST/FREEZE","FROST\\FREEZE","FUNNEL","Funnel Cloud","FUNNEL CLOUD","FUNNEL CLOUD.","FUNNEL CLOUD/HAIL","FUNNEL CLOUDS","FUNNELS","Glaze","GLAZE","GLAZE ICE","GLAZE/ICE STORM","gradient wind","Gradient wind","GRADIENT WIND","GRADIENT WINDS","GRASS FIRES","GROUND BLIZZARD","GUSTNADO","GUSTNADO AND","GUSTY LAKE WIND","GUSTY TSTM WIND","Gusty Wind","GUSTY WIND","GUSTY WIND/HAIL","GUSTY WIND/HVY RAIN","Gusty wind/rain","Gusty winds","Gusty Winds","GUSTY WINDS","HAIL","HAIL 0.75","HAIL 0.88","HAIL 075","HAIL 088","HAIL 1.00","HAIL 1.75","HAIL 1.75)","HAIL 100","HAIL 125","HAIL 150","HAIL 175","HAIL 200","HAIL 225","HAIL 275","HAIL 450","HAIL 75","HAIL 80","HAIL 88","HAIL ALOFT","HAIL DAMAGE","HAIL FLOODING","HAIL STORM","Hail(0.75)","HAIL/ICY ROADS","HAIL/WIND","HAIL/WINDS","HAILSTORM","HAILSTORMS","HARD FREEZE","HAZARDOUS SURF","HEAT","HEAT DROUGHT","Heat Wave","HEAT WAVE","HEAT WAVE DROUGHT","HEAT WAVES","HEAT/DROUGHT","Heatburst","HEAVY LAKE SNOW","HEAVY MIX","HEAVY PRECIPATATION","Heavy Precipitation","HEAVY PRECIPITATION","Heavy rain","Heavy Rain","HEAVY RAIN","HEAVY RAIN AND FLOOD","Heavy Rain and Wind","HEAVY RAIN EFFECTS","HEAVY RAIN; URBAN FLOOD WINDS;","HEAVY RAIN/FLOODING","Heavy Rain/High Surf","HEAVY RAIN/LIGHTNING","HEAVY RAIN/MUDSLIDES/FLOOD","HEAVY RAIN/SEVERE WEATHER","HEAVY RAIN/SMALL STREAM URBAN","HEAVY RAIN/SNOW","HEAVY RAIN/URBAN FLOOD","HEAVY RAIN/WIND","HEAVY RAINFALL","HEAVY RAINS","HEAVY RAINS/FLOODING","HEAVY SEAS","HEAVY SHOWER","HEAVY SHOWERS","HEAVY SNOW","HEAVY SNOW   FREEZING RAIN","HEAVY SNOW &amp; ICE","HEAVY SNOW AND","HEAVY SNOW AND HIGH WINDS","HEAVY SNOW AND ICE","HEAVY SNOW AND ICE STORM","HEAVY SNOW AND STRONG WINDS","HEAVY SNOW ANDBLOWING SNOW","Heavy snow shower","HEAVY SNOW SQUALLS","HEAVY SNOW-SQUALLS","HEAVY SNOW/BLIZZARD","HEAVY SNOW/BLIZZARD/AVALANCHE","HEAVY SNOW/BLOWING SNOW","HEAVY SNOW/FREEZING RAIN","HEAVY SNOW/HIGH","HEAVY SNOW/HIGH WIND","HEAVY SNOW/HIGH WINDS","HEAVY SNOW/HIGH WINDS &amp; FLOOD","HEAVY SNOW/HIGH WINDS/FREEZING","HEAVY SNOW/ICE","HEAVY SNOW/ICE STORM","HEAVY SNOW/SLEET","HEAVY SNOW/SQUALLS","HEAVY SNOW/WIND","HEAVY SNOW/WINTER STORM","HEAVY SNOWPACK","Heavy Surf","HEAVY SURF","Heavy surf and wind","HEAVY SURF COASTAL FLOODING","HEAVY SURF/HIGH SURF","HEAVY SWELLS","HEAVY WET SNOW","HIGH","HIGH  SWELLS","HIGH  WINDS","HIGH SEAS","High Surf","HIGH SURF","HIGH SURF ADVISORIES","HIGH SURF ADVISORY","HIGH SWELLS","HIGH TEMPERATURE RECORD","HIGH TIDES","HIGH WATER","HIGH WAVES","High Wind","HIGH WIND","HIGH WIND (G40)","HIGH WIND 48","HIGH WIND 63","HIGH WIND 70","HIGH WIND AND HEAVY SNOW","HIGH WIND AND HIGH TIDES","HIGH WIND AND SEAS","HIGH WIND DAMAGE","HIGH WIND/ BLIZZARD","HIGH WIND/BLIZZARD","HIGH WIND/BLIZZARD/FREEZING RA","HIGH WIND/HEAVY SNOW","HIGH WIND/LOW WIND CHILL","HIGH WIND/SEAS","HIGH WIND/WIND CHILL","HIGH WIND/WIND CHILL/BLIZZARD","HIGH WINDS","HIGH WINDS 55","HIGH WINDS 57","HIGH WINDS 58","HIGH WINDS 63","HIGH WINDS 66","HIGH WINDS 67","HIGH WINDS 73","HIGH WINDS 76","HIGH WINDS 80","HIGH WINDS 82","HIGH WINDS AND WIND CHILL","HIGH WINDS DUST STORM","HIGH WINDS HEAVY RAINS","HIGH WINDS/","HIGH WINDS/COASTAL FLOOD","HIGH WINDS/COLD","HIGH WINDS/FLOODING","HIGH WINDS/HEAVY RAIN","HIGH WINDS/SNOW","HIGHWAY FLOODING","Hot and Dry","HOT PATTERN","HOT SPELL","HOT WEATHER","HOT/DRY PATTERN","HURRICANE","Hurricane Edouard","HURRICANE EMILY","HURRICANE ERIN","HURRICANE FELIX","HURRICANE GORDON","HURRICANE OPAL","HURRICANE OPAL/HIGH WINDS","HURRICANE-GENERATED SWELLS","HURRICANE/TYPHOON","HVY RAIN","HYPERTHERMIA/EXPOSURE","HYPOTHERMIA","Hypothermia/Exposure","HYPOTHERMIA/EXPOSURE","ICE","ICE AND SNOW","ICE FLOES","Ice Fog","ICE JAM","Ice jam flood (minor","ICE JAM FLOODING","ICE ON ROAD","ICE PELLETS","ICE ROADS","ICE STORM","ICE STORM AND SNOW","ICE STORM/FLASH FLOOD","Ice/Snow","ICE/SNOW","ICE/STRONG WINDS","Icestorm/Blizzard","Icy Roads","ICY ROADS","LACK OF SNOW","Lake Effect Snow","LAKE EFFECT SNOW","LAKE FLOOD","LAKE-EFFECT SNOW","LAKESHORE FLOOD","LANDSLIDE","LANDSLIDE/URBAN FLOOD","LANDSLIDES","Landslump","LANDSLUMP","LANDSPOUT","LARGE WALL CLOUD","LATE FREEZE","LATE SEASON HAIL","LATE SEASON SNOW","Late Season Snowfall","LATE SNOW","Late-season Snowfall","LIGHT FREEZING RAIN","Light snow","Light Snow","LIGHT SNOW","LIGHT SNOW AND SLEET","Light Snow/Flurries","LIGHT SNOW/FREEZING PRECIP","Light Snowfall","LIGHTING","LIGHTNING","LIGHTNING  WAUSEON","LIGHTNING AND HEAVY RAIN","LIGHTNING AND THUNDERSTORM WIN","LIGHTNING AND WINDS","LIGHTNING DAMAGE","LIGHTNING FIRE","LIGHTNING INJURY","LIGHTNING TSTM WIND","LIGHTNING TSTM WINDS","LIGHTNING.","LIGHTNING/HEAVY RAIN","LIGNTNING","LOCAL FLASH FLOOD","LOCAL FLOOD","LOCALLY HEAVY RAIN","LOW TEMPERATURE","LOW TEMPERATURE RECORD","LOW WIND CHILL","MAJOR FLOOD","Marine Accident","MARINE HAIL","MARINE HIGH WIND","MARINE MISHAP","MARINE STRONG WIND","MARINE TSTM WIND","Metro Storm, May 26","Microburst","MICROBURST","MICROBURST WINDS","Mild and Dry Pattern","MILD PATTERN","MILD/DRY PATTERN","MINOR FLOOD","Minor Flooding","MINOR FLOODING","MIXED PRECIP","Mixed Precipitation","MIXED PRECIPITATION","MODERATE SNOW","MODERATE SNOWFALL","MONTHLY PRECIPITATION","Monthly Rainfall","MONTHLY RAINFALL","Monthly Snowfall","MONTHLY SNOWFALL","MONTHLY TEMPERATURE","Mountain Snows","MUD SLIDE","MUD SLIDES","MUD SLIDES URBAN FLOODING","MUD/ROCK SLIDE","Mudslide","MUDSLIDE","MUDSLIDE/LANDSLIDE","Mudslides","MUDSLIDES","NEAR RECORD SNOW","No Severe Weather","NON SEVERE HAIL","NON TSTM WIND","NON-SEVERE WIND DAMAGE","NON-TSTM WIND","NONE","NORMAL PRECIPITATION","NORTHERN LIGHTS","Other","OTHER","PATCHY DENSE FOG","PATCHY ICE","Prolong Cold","PROLONG COLD","PROLONG COLD/SNOW","PROLONG WARMTH","PROLONGED RAIN","RAIN","RAIN (HEAVY)","RAIN AND WIND","Rain Damage","RAIN/SNOW","RAIN/WIND","RAINSTORM","RAPIDLY RISING WATER","RECORD  COLD","Record Cold","RECORD COLD","RECORD COLD AND HIGH WIND","RECORD COLD/FROST","RECORD COOL","Record dry month","RECORD DRYNESS","Record Heat","RECORD HEAT","RECORD HEAT WAVE","Record High","RECORD HIGH","RECORD HIGH TEMPERATURE","RECORD HIGH TEMPERATURES","RECORD LOW","RECORD LOW RAINFALL","Record May Snow","RECORD PRECIPITATION","RECORD RAINFALL","RECORD SNOW","RECORD SNOW/COLD","RECORD SNOWFALL","Record temperature","RECORD TEMPERATURE","Record Temperatures","RECORD TEMPERATURES","RECORD WARM","RECORD WARM TEMPS.","Record Warmth","RECORD WARMTH","Record Winter Snow","RECORD/EXCESSIVE HEAT","RECORD/EXCESSIVE RAINFALL","RED FLAG CRITERIA","RED FLAG FIRE WX","REMNANTS OF FLOYD","RIP CURRENT","RIP CURRENTS","RIP CURRENTS HEAVY SURF","RIP CURRENTS/HEAVY SURF","RIVER AND STREAM FLOOD","RIVER FLOOD","River Flooding","RIVER FLOODING","ROCK SLIDE","ROGUE WAVE","ROTATING WALL CLOUD","ROUGH SEAS","ROUGH SURF","RURAL FLOOD","Saharan Dust","SAHARAN DUST","Seasonal Snowfall","SEICHE","SEVERE COLD","SEVERE THUNDERSTORM","SEVERE THUNDERSTORMS","SEVERE TSTM WIND","SEVERE TURBULENCE","SLEET","SLEET &amp; FREEZING RAIN","SLEET STORM","SLEET/FREEZING RAIN","SLEET/ICE STORM","SLEET/RAIN/SNOW","SLEET/SNOW","small hail","Small Hail","SMALL HAIL","SMALL STREAM","SMALL STREAM AND","SMALL STREAM AND URBAN FLOOD","SMALL STREAM AND URBAN FLOODIN","SMALL STREAM FLOOD","SMALL STREAM FLOODING","SMALL STREAM URBAN FLOOD","SMALL STREAM/URBAN FLOOD","Sml Stream Fld","SMOKE","Snow","SNOW","Snow Accumulation","SNOW ACCUMULATION","SNOW ADVISORY","SNOW AND COLD","SNOW AND HEAVY SNOW","Snow and Ice","SNOW AND ICE","SNOW AND ICE STORM","Snow and sleet","SNOW AND SLEET","SNOW AND WIND","SNOW DROUGHT","SNOW FREEZING RAIN","SNOW SHOWERS","SNOW SLEET","SNOW SQUALL","Snow squalls","Snow Squalls","SNOW SQUALLS","SNOW- HIGH WIND- WIND CHILL","SNOW/ BITTER COLD","SNOW/ ICE","SNOW/BLOWING SNOW","SNOW/COLD","SNOW/FREEZING RAIN","SNOW/HEAVY SNOW","SNOW/HIGH WINDS","SNOW/ICE","SNOW/ICE STORM","SNOW/RAIN","SNOW/RAIN/SLEET","SNOW/SLEET","SNOW/SLEET/FREEZING RAIN","SNOW/SLEET/RAIN","SNOW\\COLD","SNOWFALL RECORD","SNOWMELT FLOODING","SNOWSTORM","SOUTHEAST","STORM FORCE WINDS","STORM SURGE","STORM SURGE/TIDE","STREAM FLOODING","STREET FLOOD","STREET FLOODING","Strong Wind","STRONG WIND","STRONG WIND GUST","Strong winds","Strong Winds","STRONG WINDS","Summary August 10","Summary August 11","Summary August 17","Summary August 2-3","Summary August 21","Summary August 28","Summary August 4","Summary August 7","Summary August 9","Summary Jan 17","Summary July 23-24","Summary June 18-19","Summary June 5-6","Summary June 6","Summary of April 12","Summary of April 13","Summary of April 21","Summary of April 27","Summary of April 3rd","Summary of August 1","Summary of July 11","Summary of July 2","Summary of July 22","Summary of July 26","Summary of July 29","Summary of July 3","Summary of June 10","Summary of June 11","Summary of June 12","Summary of June 13","Summary of June 15","Summary of June 16","Summary of June 18","Summary of June 23","Summary of June 24","Summary of June 3","Summary of June 30","Summary of June 4","Summary of June 6","Summary of March 14","Summary of March 23","Summary of March 24","SUMMARY OF MARCH 24-25","SUMMARY OF MARCH 27","SUMMARY OF MARCH 29","Summary of May 10","Summary of May 13","Summary of May 14","Summary of May 22","Summary of May 22 am","Summary of May 22 pm","Summary of May 26 am","Summary of May 26 pm","Summary of May 31 am","Summary of May 31 pm","Summary of May 9-10","Summary Sept. 25-26","Summary September 20","Summary September 23","Summary September 3","Summary September 4","Summary: Nov. 16","Summary: Nov. 6-7","Summary: Oct. 20-21","Summary: October 31","Summary: Sept. 18","Temperature record","THUDERSTORM WINDS","THUNDEERSTORM WINDS","THUNDERESTORM WINDS","THUNDERSNOW","Thundersnow shower","THUNDERSTORM","THUNDERSTORM  WINDS","THUNDERSTORM DAMAGE","THUNDERSTORM DAMAGE TO","THUNDERSTORM HAIL","THUNDERSTORM W INDS","Thunderstorm Wind","THUNDERSTORM WINS","THUNDERSTORMS","THUNDERSTORMS WIND","THUNDERSTORMS WINDS","THUNDERSTORMW","THUNDERSTORMW 50","THUNDERSTORMW WINDS","THUNDERSTORMWINDS","THUNDERSTROM WIND","THUNDERSTROM WINDS","THUNDERTORM WINDS","THUNDERTSORM WIND","THUNDESTORM WINDS","THUNERSTORM WINDS","TIDAL FLOOD","Tidal Flooding","TIDAL FLOODING","TORNADO","TORNADO DEBRIS","TORNADO F0","TORNADO F1","TORNADO F2","TORNADO F3","TORNADO/WATERSPOUT","TORNADOES","TORNADOES, TSTM WIND, HAIL","TORNADOS","TORNDAO","TORRENTIAL RAIN","Torrential Rainfall","TROPICAL DEPRESSION","TROPICAL STORM","TROPICAL STORM ALBERTO","TROPICAL STORM DEAN","TROPICAL STORM GORDON","TROPICAL STORM JERRY","TSTM","TSTM HEAVY RAIN","Tstm Wind","TSTM WIND","TSTM WIND      LE CEN","TSTM WIND  (G45)","TSTM WIND (41)","TSTM WIND (G35)","TSTM WIND (G40)","TSTM WIND (G45)","TSTM WIND 13","TSTM WIND 2","TSTM WIND 40","TSTM WIND 45","TSTM WIND 50","TSTM WIND 51","TSTM WIND 52","TSTM WIND 53","TSTM WIND 55","TSTM WIND 56","TSTM WIND 59","TSTM WIND 59 MPH","TSTM WIND 59 MPH.","TSTM WIND 60","TSTM WIND 60 MPH","TSTM WIND 61","TSTM WIND 62","TSTM WIND 63 MPH","TSTM WIND 65 MPH","TSTM WIND 65)","TSTM WIND 65MPH","TSTM WIND 69","TSTM WIND 98 MPH","TSTM WIND AND","TSTM WIND AND LIGHTNING","TSTM WIND DAMAGE","TSTM WIND FUNNEL CLOU","TSTM WIND G","TSTM WIND G45","TSTM WIND G50","TSTM WIND G51","TSTM WIND G52","TSTM WIND G55","TSTM WIND G58","TSTM WIND G60","TSTM WIND G61","TSTM WIND HAIL","TSTM WIND HEAVY RAIN","TSTM WIND LIGHTNING","TSTM WIND SMALL STREA","TSTM WIND TREES","TSTM WIND URBAN FLOOD","TSTM WIND.","TSTM WIND/ FLOOD","TSTM WIND/ HAIL","TSTM WIND/ TREE","TSTM WIND/ TREES","TSTM WIND/AWNING","TSTM WIND/FLASH FLOOD","TSTM WIND/FLOODING","TSTM WIND/FUNNEL CLOU","TSTM WIND/HAIL","TSTM WIND/HEAVY RAIN","TSTM WIND/LIGHTNING","TSTM WIND53","TSTM WINDHAIL","TSTM WINDS","TSTM WND","TSTMW","TSUNAMI","TUNDERSTORM WIND","TYPHOON","Unseasonable Cold","UNSEASONABLY COLD","UNSEASONABLY COOL","UNSEASONABLY COOL &amp; WET","UNSEASONABLY DRY","UNSEASONABLY HOT","UNSEASONABLY WARM","UNSEASONABLY WARM &amp; WET","UNSEASONABLY WARM AND DRY","UNSEASONABLY WARM YEAR","UNSEASONABLY WARM/WET","UNSEASONABLY WET","UNSEASONAL LOW TEMP","UNSEASONAL RAIN","UNUSUAL WARMTH","UNUSUAL/RECORD WARMTH","UNUSUALLY COLD","UNUSUALLY LATE SNOW","UNUSUALLY WARM","URBAN AND SMALL","URBAN AND SMALL STREAM","URBAN AND SMALL STREAM FLOOD","URBAN AND SMALL STREAM FLOODIN","Urban flood","Urban Flood","URBAN FLOOD","URBAN FLOOD LANDSLIDE","Urban Flooding","URBAN FLOODING","URBAN FLOODS","URBAN SMALL","URBAN SMALL STREAM FLOOD","URBAN/SMALL","URBAN/SMALL FLOODING","URBAN/SMALL STREAM","URBAN/SMALL STREAM  FLOOD","URBAN/SMALL STREAM FLOOD","URBAN/SMALL STREAM FLOODING","URBAN/SMALL STRM FLDG","URBAN/SML STREAM FLD","URBAN/SML STREAM FLDG","URBAN/STREET FLOODING","VERY DRY","VERY WARM","VOG","Volcanic Ash","VOLCANIC ASH","Volcanic Ash Plume","VOLCANIC ASHFALL","VOLCANIC ERUPTION","WAKE LOW WIND","WALL CLOUD","WALL CLOUD/FUNNEL CLOUD","WARM DRY CONDITIONS","WARM WEATHER","WATER SPOUT","WATERSPOUT","WATERSPOUT FUNNEL CLOUD","WATERSPOUT TORNADO","WATERSPOUT-","WATERSPOUT-TORNADO","WATERSPOUT/","WATERSPOUT/ TORNADO","WATERSPOUT/TORNADO","WATERSPOUTS","WAYTERSPOUT","wet micoburst","WET MICROBURST","Wet Month","WET SNOW","WET WEATHER","Wet Year","Whirlwind","WHIRLWIND","WILD FIRES","WILD/FOREST FIRE","WILD/FOREST FIRES","WILDFIRE","WILDFIRES","Wind","WIND","WIND ADVISORY","WIND AND WAVE","WIND CHILL","WIND CHILL/HIGH WIND","Wind Damage","WIND DAMAGE","WIND GUSTS","WIND STORM","WIND/HAIL","WINDS","WINTER MIX","WINTER STORM","WINTER STORM HIGH WINDS","WINTER STORM/HIGH WIND","WINTER STORM/HIGH WINDS","WINTER STORMS","Winter Weather","WINTER WEATHER","WINTER WEATHER MIX","WINTER WEATHER/MIX","WINTERY MIX","Wintry mix","Wintry Mix","WINTRY MIX","WND"],["        3,278.689","            0.000","          819.672","            0.000","      132,786.885","          131.148","            0.000","            0.000","           81.967","            0.000","            0.000","            0.000","            0.000","            0.000","           81.967","      154,508.197","        5,245.902","            0.000","       61,013.115","            0.000","        1,639.344","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","   10,806,786.066","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","        8,196.721","            0.000","            0.000","          327.869","          245.902","            0.000","            0.000","            0.000","            0.000","            0.000","            0.328","          901.639","            0.000","      245,901.639","       12,557.377","      359,098.361","    3,896,156.721","            0.000","      103,688.525","    2,076,073.770","      328,360.656","          819.672","            0.000","        8,196.721","            0.000","            0.000","            0.000","          885.246","        8,196.721","            0.000","            0.000","            0.820","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","       32,622.951","            0.000","            0.000","            0.000","            0.000","       16,426.230","            0.000","            0.000","      131,147.541","            0.000","      158,590.164","        1,639.344","           32.787","            0.000","            0.000","            0.000","   17,149,278.689","            0.000","            0.000","            0.000","            0.000","            0.000","      110,370.492","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","          300.000","       11,480.820","            8.197","       90,967.213","          819.672","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","      265,573.770","            0.000","            0.000","      127,109.836","            0.000","            0.000","            0.000","            0.000","       31,721.311","            0.000","            0.000","        1,639.344","            0.000","    1,110,449.180","      141,770.492","        1,885.246","          819.672","            0.000","            0.000","       12,377.049","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","  264,603,508.923","          196.721","        4,098.361","          819.672","            0.007","        8,196.721","            0.000","           32.787","    4,466,393.541","            0.000","           16.393","    5,045,304.984","       28,688.525","        8,196.721","      143,090.164","            0.000","            0.000","2,371,437,865.689","      163,934.426","           81.967","            0.000","            0.000","       16,393.443","            0.000","    2,853,099.259","            0.000","          163.934","           81.967","            0.000","            0.000","        8,196.721","            0.000","    1,774,673.113","            0.033","       98,360.656","      215,663.934","            0.000","       81,967.213","            0.000","        3,360.656","          245.902","          901.639","        1,229.508","            0.000","            0.000","       35,770.492","            0.000","          573.770","      132,975.410","            0.000","            0.000","            0.000","            0.000","          819.672","        1,229.508","            0.000","            0.000","          245.902","       16,393.443","      155,409.836","        8,196.721","            0.000","            0.000","        3,190.164","            0.000","            0.000","            0.000","            0.000","        1,475.410","       14,918.033","        4,991.803","            0.000","          278.689","          229.508","           98.361","            0.000","          163.934","        1,639.344","        1,672.951","            0.000","            0.000","            0.000","            0.000","        5,901.639","          327.869","           32.787","           32.787","            0.000","       15,377.049","        5,622.951","  257,906,045.172","           16.393","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","           81.967","            0.000","            0.000","        1,967.213","            0.000","            0.000","        3,688.525","        3,278.689","           16.393","            0.000","            0.000","            0.000","        2,459.016","            0.000","            0.000","            0.000","            0.000","            8.197","        8,196.721","    3,950,819.672","            0.000","            0.000","            0.000","       29,459.016","            0.000","            0.000","      171,476.230","        3,278.689","            0.000","            0.000","            0.000","        8,196.721","       21,393.443","            0.000","            0.000","        8,196.721","            0.000","            0.000","   11,381,116.230","        9,836.066","            0.000","            0.000","            0.000","            0.000","      221,311.475","       81,967.213","            0.000","   40,983,606.557","           81.967","        8,196.721","            0.000","            0.000","            0.000","      201,394.262","       79,672.131","            0.000","            8.197","            0.000","   15,288,346.836","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","       27,868.852","            0.000","          163.934","       11,229.672","        1,442.623","          819.672","       81,967.213","            0.000","       81,967.213","            0.000","            0.000","            0.000","       24,590.164","            0.000","       10,737.705","            0.000","            0.000","        1,639.344","          819.672","        8,196.721","       81,967.213","          819.672","       22,786.885","            0.000","          819.672","      161,803.279","          245.902","            0.000","            0.000","            0.000","           49.180","          254.098","        6,229.508","    1,468,442.623","            0.000","            0.000","           81.967","            0.000","           12.295","        8,278.689","            0.000","            0.000","   86,394,201.557","          295.082","          163.934","            0.000","            0.000","            0.000","            0.000","          819.672","       18,032.787","            0.000","          819.672","            0.000","          819.672","            0.000","        8,196.721","            0.000","            0.000","    9,972,525.705","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","      122,950.820","          819.672","       81,967.213","    1,811,475.410","            0.000","           81.967","        2,459.016","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","  194,562,606.721","            0.000","      819,672.131","    4,231,147.541","        8,196.721","        8,196.721","   52,013,868.852","    1,639,344.262","        1,229.508","1,136,161,311.475","            0.000","            0.000","            0.000","            0.000","            0.000","      207,459.016","       81,967.213","        1,639.344","            0.000","           81.967","           16.393","       90,426.230","            0.000","            0.000","          196.721","   64,670,951.803","            0.000","            0.000","            0.000","            0.000","       57,377.049","            0.000","            0.000","        5,593.443","            0.000","          819.672","          278.689","          491.803","      657,622.951","      123,606.557","    5,321,245.902","            0.000","        1,721.311","        9,344.262","            0.000","          114.754","            0.000","            0.000","            0.000","        2,950.820","            0.000","            0.000","            0.000","        7,393.443","           81.967","        9,672.131","       31,442.623","            0.000","            0.000","            0.000","        1,393.443","           81.967","   15,223,937.500","          491.803","          459.016","            0.000","            0.000","            0.000","       81,967.213","            0.000","          163.934","            0.000","            0.000","           81.967","           81.967","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","    1,721,311.475","          819.672","           65.574","       21,262.459","            0.000","        6,857.869","        7,154.098","            0.000","          327.869","          983.607","        7,377.049","            0.000","            0.000","            0.000","            0.000","            0.000","           81.967","            0.000","        3,852.459","        9,098.361","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","        9,837.705","          819.672","           81.967","            0.000","            0.000","       20,901.639","            0.000","            0.000","          819.672","            0.000","            0.000","            0.000","            0.000","           81.967","          655.738","            0.000","            0.000","            0.000","          819.672","           90.164","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","       86,886.066","            0.000","            0.000","            0.000","            0.000","            0.000","          819.672","            0.000","            0.000","            0.000","      918,032.787","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            8.197","       16,393.443","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","           16.393","        2,655.738","            0.000","            0.000","       19,672.131","   83,917,139.344","    1,740,245.902","      166,213.115","        2,459.016","            0.000","            0.000","            0.000","          163.934","           19.672","            0.000","            0.000","            0.000","       16,065.574","            0.000","   19,760,000.000","       32,786.885","        2,868.852","          819.672","            0.000","            0.000","            0.000","            0.000","        8,196.721","            0.000","            0.000","            0.000","            0.000","        1,147.541","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","        1,065.574","      242,009.016","            0.000","           81.967","            0.000","            0.000","        1,639.344","            0.000","            0.820","        8,196.721","            0.000","            0.000","            0.000","            0.000","       21,393.443","            0.000","            0.000","       11,147.541","            0.000","          901.639","       11,147.541","            0.000","          819.672","           81.967","          819.672","       16,393.443","       19,672.131","        8,196.721","        1,639.344","          491.803","        1,639.344","            0.000","            0.000","       22,131.148","        1,639.344","            0.000","            0.000","            0.000","       82,786.885","            0.000","            0.000","        3,278.689","  710,221,901.639","   76,085,049.180","            0.000","            0.000","            0.000","          295.082","    2,872,810.656","            0.000","            0.000","        1,639.344","       37,947.377","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","          819.672","           81.967","           16.393","          819.672","            0.000","       15,090.984","          409.836","            0.000","           32.787","           81.967","            0.000","            0.000","           16.393","           81.967","          254.098","        8,410.656","        2,049.180","            0.000","            0.000","            8.197","           81.967","            0.000","        9,934.426","            0.000","            0.000","           16.393","            0.000","          163.934","           49.180","  933,396,102.172","            0.000","        1,249.180","       38,852.459","       26,229.508","       11,885.246","            0.000","            0.000","   26,229,508.197","            0.000","            8.197","            0.000","            0.000","       28,475.410","  126,293,287.705","       81,967.213","        6,557.377","        8,196.721","       75,409.836","            0.000","            0.000","          491.803","  159,171,428.959","            0.000","           81.967","          131.148","          491.803","          737.705","        3,631.148","          819.672","            0.000","           16.393","          163.934","            0.000","            0.000","            0.000","            0.000","          491.803","            0.000","            0.000","            0.000","            0.000","            0.000","        1,147.541","            0.000","            0.000","          409.836","           65.574","          327.869","           65.574","            0.000","          409.836","           81.967","        1,311.475","           81.967","            0.000","            0.000","           16.393","            3.279","            0.000","            0.000","           81.967","        1,639.344","            0.000","            0.000","       11,164.328","            0.000","        3,122.951","            0.000","           65.574","            0.000","           81.967","          327.869","            0.000","           16.393","          327.869","           32.787","            0.000","           81.967","           81.967","      732,803.279","            0.000","           81.967","          819.672","          655.738","       31,063.115","            0.000","          819.672","    2,361,672.131","        1,229.508","    9,839,836.066","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","           81.967","            0.000","            0.000","            0.000","            0.000","            0.000","      299,803.279","            0.000","            0.000","       91,895.082","           24.590","            0.820","            0.000","            0.000","            0.000","           81.967","            0.000","          836.885","            0.000","            0.000","      955,895.902","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","        8,196.721","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","      153,339.344","            0.000","          655.738","        3,450.820","          245.902","            0.000","           16.393","      837,868.852","            0.000","            0.000","            0.000","          573.770","            0.000","            0.000","            0.000","            0.000","           81.967","          114.754","   10,231,147.541","   49,210,319.672","          327.869","   78,116,622.951","    1,647,540.984","          163.934","      142,368.852","            0.000","       16,393.443","            0.000","            0.000","          163.934","        1,262.295","            0.000","        4,918.033","            8.197","       10,590.164","            0.000","  109,647,495.984","      983,606.557","            0.000","            0.000","        8,196.721","            0.000","      342,065.574","          983.607","      104,459.016","            0.000","            0.000","           40.984","          163.934","            0.000"],["          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","    472,459.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","  1,837,049.2","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","        918.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.8","          0.0","          0.0","          0.0","  1,081,967.2","          0.0","          0.0","          0.0","          0.0","          0.0","      9,836.1","          0.0","     81,967.2","          0.0","          0.0","          0.0","          0.0","    559,508.2","  4,296,721.3","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","229,058,459.0","         94.8","          0.0","          0.0","          0.0","          0.0","        245.9","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","     50,819.7","      8,196.7","          0.0","          0.0","    688,524.6","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","  8,072,163.9","          0.0","          0.0","          0.0","          0.0","          0.0","  2,327,868.9","          0.0","          0.0","    327,868.9"," 21,196,278.7","        819.7","     81,967.2","          0.0","          0.0","          0.0","    278,688.5","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0"," 23,300,280.3","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","      9,098.4","          0.0","          0.0","    247,804.1","      2,868.9","          0.0","          0.0","          0.0","          0.0"," 92,819,154.9","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","  1,557,934.4","          0.0","          0.0","          0.0","          0.0","  1,849,180.3","          0.0","          0.0","    145,172.1","          0.0","        819.7","          0.0","          0.0","      8,196.7","    172,131.1","  7,315,163.9","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","  1,081,967.2","      1,639.3"," 17,935,836.1","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","         13.1","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","         25.4","          0.0","          0.0","          0.0","          0.0","        163.9","          0.0","          0.0","          0.0","          0.0","          0.0","      3,278.7"," 49,605,811.7","          0.0","          0.0","        163.9","          0.0","          0.0","          0.0","          0.0","        163.9","        163.9","        819.7","          0.0","        163.9","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          1.6","        820.5","          0.0","          0.0","    214,754.1","          0.0","  6,581,336.1","          0.0","          0.0","     90,983.6","        819.7","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0"," 12,022,947.5","          0.0","          0.0","          0.0","          0.0","          0.0","     24,590.2","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","    991,803.3","      5,786.9","          0.0","          0.0","          0.0","  2,207,427.9","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","        327.9","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0"," 10,468,382.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","    667,550.8","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","        163.9","          0.0","          0.0","    114,754.1","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0"," 44,949,344.3","          0.0","          0.0","  2,229,672.1","      8,196.7","          0.0","    311,475.4","    163,934.4","          0.0"," 42,752,013.1","         49.2","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","     81,967.2","          0.0","          0.0","          0.0"," 82,329,729.5","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","    328,147.5","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","    198,231.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","        819.7","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","     16,957.4","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","     12,295.1","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0"," 82,450,147.5","    459,344.3","         82.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","      3,278.7","    278,688.5","    475,409.8","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","    340,868.9","          0.0","          0.0","          0.0","          0.0","         82.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","        163.9","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","         82.0","     13,934.4","          0.0","          0.0","          0.0","          0.0","  1,064,811.5","          0.0","          0.0","          0.0","     81,967.2","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","         82.0","          0.0","          0.0","          0.0","          0.0","     16,393.4","          0.0","          0.0","          0.0","        819.7","          0.0","          0.0","          0.0","         82.0","         82.0","         16.4","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","  6,802,517.9","          0.0","        118.0","          0.0","          0.0","          0.0","          0.0","         16.4","     40,983.6","          0.0","          0.0","          0.0","          0.0","          0.0"," 11,120,426.2","          0.0","        819.7","      8,196.7","    262,295.1","          0.0","          0.0","          0.0"," 19,008,284.4","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","        327.9","          0.0","        803.3","          0.0","         82.0","          0.0","          0.0","          0.0","         49.2","        491.8","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","  1,061,086.1","          0.0","          0.0","          0.0","          0.0","        976.2","          0.0","          0.0","        327.9","          0.0","     13,524.6","     83,606.6","    410,532.8","          0.0","          0.0","          0.0","          0.0","        163.9","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","    163,934.4","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","     15,139.3","          0.0","          0.0","      6,008.2","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","    139,149.2","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","  1,750,767.7","        196.7","  4,843,816.4","      8,196.7","          0.0","      4,918.0","          0.0","          0.0","          0.0","          0.0","          0.0","        901.6","          0.0","          0.0","          0.0","      8,278.7","          0.0","    441,704.9","     81,967.2","          0.0","          0.0","      8,196.7","          0.0","    245,901.6","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0","          0.0"],["        3,278.689","            0.000","          819.672","            0.000","      132,786.885","          131.148","            0.000","            0.000","           81.967","            0.000","            0.000","            0.000","            0.000","      472,459.016","           81.967","      154,508.197","        5,245.902","            0.000","       61,013.115","            0.000","        1,639.344","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","   12,643,835.246","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","        8,196.721","            0.000","            0.000","          327.869","          245.902","            0.000","            0.000","            0.000","            0.000","            0.000","            0.328","          901.639","            0.000","      245,901.639","       12,557.377","      359,098.361","    3,896,156.721","            0.000","      103,688.525","    2,076,991.803","      328,360.656","          819.672","            0.000","        8,196.721","            0.000","            0.000","            0.000","          885.246","        8,196.721","            0.000","            0.000","            1.639","            0.000","            0.000","            0.000","    1,081,967.213","            0.000","            0.000","            0.000","            0.000","            0.000","       42,459.016","            0.000","       81,967.213","            0.000","            0.000","       16,426.230","            0.000","      559,508.197","    4,427,868.852","            0.000","      158,590.164","        1,639.344","           32.787","            0.000","            0.000","            0.000","  246,207,737.705","           94.754","            0.000","            0.000","            0.000","            0.000","      110,616.393","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","          300.000","       11,480.820","            8.197","      141,786.885","        9,016.393","            0.000","            0.000","      688,524.590","            0.000","            0.000","            0.000","            0.000","            0.000","      265,573.770","            0.000","            0.000","    8,199,273.770","            0.000","            0.000","            0.000","            0.000","       31,721.311","    2,327,868.852","            0.000","        1,639.344","      327,868.852","   22,306,727.869","      142,590.164","       83,852.459","          819.672","            0.000","            0.000","      291,065.574","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","  287,903,789.251","          196.721","        4,098.361","          819.672","            0.007","        8,196.721","            0.000","           32.787","    4,475,491.902","            0.000","           16.393","    5,293,109.082","       31,557.377","        8,196.721","      143,090.164","            0.000","            0.000","2,464,257,020.607","      163,934.426","           81.967","            0.000","            0.000","       16,393.443","            0.000","    4,411,033.685","            0.000","          163.934","           81.967","            0.000","    1,849,180.328","        8,196.721","            0.000","    1,919,845.244","            0.033","       99,180.328","      215,663.934","            0.000","       90,163.934","      172,131.148","    7,318,524.590","          245.902","          901.639","        1,229.508","            0.000","            0.000","       35,770.492","            0.000","          573.770","      132,975.410","            0.000","            0.000","            0.000","            0.000","          819.672","        1,229.508","            0.000","            0.000","    1,082,213.115","       18,032.787","   18,091,245.902","        8,196.721","            0.000","            0.000","        3,190.164","            0.000","            0.000","            0.000","            0.000","        1,475.410","       14,918.033","        5,004.918","            0.000","          278.689","          229.508","           98.361","            0.000","          163.934","        1,639.344","        1,698.361","            0.000","            0.000","            0.000","            0.000","        6,065.574","          327.869","           32.787","           32.787","            0.000","       15,377.049","        8,901.639","  307,511,856.861","           16.393","            0.000","          163.934","            0.000","            0.000","            0.000","            0.000","          245.902","          163.934","          819.672","        1,967.213","          163.934","            0.000","        3,688.525","        3,278.689","           16.393","            0.000","            0.000","            0.000","        2,459.016","            0.000","            0.000","            0.000","            0.000","            9.836","        9,017.213","    3,950,819.672","            0.000","      214,754.098","            0.000","    6,610,795.082","            0.000","            0.000","      262,459.836","        4,098.361","            0.000","            0.000","            0.000","        8,196.721","       21,393.443","            0.000","            0.000","        8,196.721","            0.000","            0.000","   23,404,063.770","        9,836.066","            0.000","            0.000","            0.000","            0.000","      245,901.639","       81,967.213","            0.000","   40,983,606.557","           81.967","        8,196.721","            0.000","            0.000","            0.000","    1,193,197.541","       85,459.016","            0.000","            8.197","            0.000","   17,495,774.705","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","       27,868.852","            0.000","          163.934","       11,229.672","        1,442.623","          819.672","       81,967.213","            0.000","       81,967.213","            0.000","            0.000","            0.000","       24,918.033","            0.000","       10,737.705","            0.000","            0.000","        1,639.344","          819.672","        8,196.721","       81,967.213","          819.672","       22,786.885","            0.000","          819.672","      161,803.279","          245.902","            0.000","            0.000","            0.000","           49.180","          254.098","        6,229.508","    1,468,442.623","            0.000","            0.000","           81.967","            0.000","           12.295","        8,278.689","            0.000","            0.000","   96,862,583.525","          295.082","          163.934","            0.000","            0.000","            0.000","            0.000","          819.672","       18,032.787","            0.000","          819.672","            0.000","          819.672","            0.000","        8,196.721","            0.000","            0.000","   10,640,076.525","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","      123,114.754","          819.672","       81,967.213","    1,926,229.508","            0.000","           81.967","        2,459.016","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","  239,511,950.984","            0.000","      819,672.131","    6,460,819.672","       16,393.443","        8,196.721","   52,325,344.262","    1,803,278.689","        1,229.508","1,178,913,324.590","           49.180","            0.000","            0.000","            0.000","            0.000","      207,459.016","       81,967.213","        1,639.344","            0.000","           81.967","           16.393","      172,393.443","            0.000","            0.000","          196.721","  147,000,681.311","            0.000","            0.000","            0.000","            0.000","       57,377.049","            0.000","            0.000","        5,593.443","            0.000","          819.672","          278.689","          491.803","      657,622.951","      123,606.557","    5,649,393.443","            0.000","        1,721.311","        9,344.262","            0.000","          114.754","            0.000","            0.000","            0.000","        2,950.820","            0.000","            0.000","            0.000","        7,393.443","           81.967","        9,672.131","       31,442.623","            0.000","            0.000","            0.000","        1,393.443","           81.967","   15,422,168.484","          491.803","          459.016","            0.000","            0.000","            0.000","       81,967.213","            0.000","          163.934","            0.000","            0.000","           81.967","           81.967","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","    1,721,311.475","          819.672","           65.574","       21,262.459","            0.000","        6,857.869","        7,973.770","            0.000","          327.869","          983.607","        7,377.049","            0.000","            0.000","            0.000","            0.000","            0.000","           81.967","            0.000","        3,852.459","        9,098.361","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","        9,837.705","          819.672","           81.967","            0.000","            0.000","       20,901.639","            0.000","            0.000","          819.672","            0.000","            0.000","            0.000","            0.000","           81.967","          655.738","            0.000","            0.000","            0.000","          819.672","       17,047.541","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","       99,181.148","            0.000","            0.000","            0.000","            0.000","            0.000","          819.672","            0.000","            0.000","            0.000","      918,032.787","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            8.197","       16,393.443","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","           16.393","        2,655.738","            0.000","            0.000","       19,672.131","  166,367,286.885","    2,199,590.164","      166,295.082","        2,459.016","            0.000","            0.000","            0.000","          163.934","           19.672","            0.000","            0.000","            0.000","       16,065.574","            0.000","   19,763,278.689","      311,475.410","      478,278.689","          819.672","            0.000","            0.000","            0.000","            0.000","        8,196.721","            0.000","            0.000","            0.000","            0.000","      342,016.393","            0.000","            0.000","            0.000","            0.000","           81.967","            0.000","            0.000","            0.000","            0.000","            0.000","        1,065.574","      242,172.951","            0.000","           81.967","            0.000","            0.000","        1,639.344","            0.000","            0.820","        8,196.721","            0.000","            0.000","            0.000","            0.000","       21,393.443","            0.000","            0.000","       11,147.541","            0.000","          901.639","       11,147.541","            0.000","          819.672","           81.967","          819.672","       16,393.443","       19,672.131","        8,196.721","        1,639.344","          491.803","        1,639.344","            0.000","            0.000","       22,131.148","        1,639.344","            0.000","            0.000","            0.000","       82,786.885","            0.000","            0.000","        3,278.689","  710,221,983.607","   76,098,983.607","            0.000","            0.000","            0.000","          295.082","    3,937,622.131","            0.000","            0.000","        1,639.344","      119,914.590","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","          901.639","           81.967","           16.393","          819.672","            0.000","       31,484.426","          409.836","            0.000","           32.787","          901.639","            0.000","            0.000","           16.393","          163.934","          336.066","        8,427.049","        2,049.180","            0.000","            0.000","            8.197","           81.967","            0.000","        9,934.426","            0.000","            0.000","           16.393","            0.000","          163.934","           49.180","  940,198,620.041","            0.000","        1,367.213","       38,852.459","       26,229.508","       11,885.246","            0.000","           16.393","   26,270,491.803","            0.000","            8.197","            0.000","            0.000","       28,475.410","  137,413,713.934","       81,967.213","        7,377.049","       16,393.443","      337,704.918","            0.000","            0.000","          491.803","  178,179,713.352","            0.000","           81.967","          131.148","          491.803","          737.705","        3,631.148","          819.672","            0.000","           16.393","          163.934","            0.000","            0.000","            0.000","            0.000","          491.803","            0.000","            0.000","            0.000","            0.000","            0.000","        1,147.541","            0.000","            0.000","          409.836","           65.574","          327.869","           65.574","            0.000","          409.836","           81.967","        1,311.475","           81.967","            0.000","            0.000","           16.393","            3.279","            0.000","            0.000","           81.967","        1,639.344","          327.869","            0.000","       11,967.607","            0.000","        3,204.918","            0.000","           65.574","            0.000","          131.148","          819.672","            0.000","           16.393","          327.869","           32.787","            0.000","           81.967","           81.967","    1,793,889.344","            0.000","           81.967","          819.672","          655.738","       32,039.344","            0.000","          819.672","    2,362,000.000","        1,229.508","    9,853,360.656","       83,606.557","      410,532.787","            0.000","            0.000","            0.000","            0.000","          163.934","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","      163,934.426","            0.000","            0.000","            0.000","            0.000","            0.000","           81.967","            0.000","            0.000","            0.000","            0.000","            0.000","      314,942.623","            0.000","            0.000","       97,903.279","           24.590","            0.820","            0.000","            0.000","            0.000","           81.967","            0.000","          836.885","            0.000","            0.000","    1,095,045.082","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","        8,196.721","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","            0.000","      153,339.344","            0.000","          655.738","        3,450.820","          245.902","            0.000","           16.393","      837,868.852","            0.000","            0.000","            0.000","          573.770","            0.000","            0.000","            0.000","            0.000","           81.967","          114.754","   10,231,147.541","   50,961,087.377","          524.590","   82,960,439.344","    1,655,737.705","          163.934","      147,286.885","            0.000","       16,393.443","            0.000","            0.000","          163.934","        2,163.934","            0.000","        4,918.033","            8.197","       18,868.852","            0.000","  110,089,200.902","    1,065,573.770","            0.000","            0.000","       16,393.443","            0.000","      587,967.213","          983.607","      104,459.016","            0.000","            0.000","           40.984","          163.934","            0.000"],[" 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.02"," 3.67"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.02"," 1.66"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.02"," 0.00"," 0.02"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.05"," 0.00"," 0.03"," 0.02"," 0.00"," 0.00"," 0.05"," 0.00"," 0.00"," 0.00"," 0.02"," 0.05"," 0.57"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.23"," 0.00"," 0.03"," 0.00"," 0.05"," 0.08"," 0.00"," 1.56"," 0.02"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.30"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.03"," 0.02"," 0.00"," 0.00"," 0.00"," 0.05"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.03"," 0.00"," 0.36"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00","31.20"," 0.00"," 0.00"," 0.00"," 0.03"," 0.00"," 0.00"," 0.00"," 0.02"," 0.03"," 2.62"," 2.05"," 1.57"," 0.00"," 0.00"," 0.00"," 0.28"," 0.00"," 0.00"," 0.00"," 0.02"," 0.00"," 0.00","16.03"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.23"," 0.00"," 0.00"," 0.31"," 0.08"," 0.00"," 0.03"," 0.00"," 0.00"," 7.70"," 0.02"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.28"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.02"," 0.00"," 0.10"," 0.00"," 0.00"," 1.02"," 0.02"," 0.00"," 0.00"," 0.02"," 0.00"," 0.00"," 0.03"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.11"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.02"," 0.02"," 0.00"," 0.02"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.11"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.02"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.07"," 0.25"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00","15.36"," 0.00"," 0.00"," 2.82"," 0.07"," 0.08"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 1.61"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.05"," 0.00"," 0.00"," 2.08"," 0.00"," 0.00"," 0.00"," 0.03"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.02"," 0.11"," 0.05"," 0.00"," 0.69"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.08"," 0.05"," 1.66"," 0.00"," 0.00"," 0.02"," 0.00"," 0.00"," 0.05"," 0.02"," 0.00"," 4.07"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.05"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.07"," 0.00"," 0.00"," 0.57"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.05"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 1.00"," 0.00"," 0.00"," 0.10"," 0.02"," 0.00"," 0.02"," 0.03"," 0.00"," 1.05"," 0.00"," 0.02"," 0.02"," 0.07"," 0.05"," 0.10"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.02"," 0.00"," 0.00"," 1.46"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.08"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.62"," 0.00"," 0.02"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.02"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00","13.38"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.02"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.11"," 0.00"," 0.00"," 0.00"," 0.02"," 0.00"," 0.02"," 0.11"," 0.23"," 0.16"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.02"," 0.03"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.07"," 0.00"," 0.00"," 0.02"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.07"," 0.02"," 0.00"," 0.02"," 0.00"," 0.00"," 0.02"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.03"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.28"," 0.00"," 0.00"," 0.00"," 0.00"," 6.03"," 3.34"," 0.00"," 0.08"," 0.00"," 0.03"," 0.00"," 0.03"," 0.00"," 0.00"," 0.00"," 0.13"," 0.07"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.03"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.08"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.07"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.03"," 0.00"," 0.02"," 0.00"," 0.00"," 0.02"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.21"," 0.18"," 0.00"," 0.00"," 0.00"," 0.00"," 1.69"," 0.00"," 0.00"," 0.02"," 0.11"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.02"," 0.00"," 0.02"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.02"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00","92.34"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.41"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.95"," 0.00"," 0.00"," 0.13"," 0.00"," 0.00"," 0.00"," 0.00","11.64"," 0.00"," 0.00"," 0.00"," 0.02"," 0.02"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.02"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.08"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.54"," 0.00"," 0.00"," 0.00"," 0.03"," 0.00"," 0.00"," 0.00"," 0.00"," 0.18"," 0.00"," 0.48"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.02"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.46"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.05"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.05"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.02"," 0.00"," 0.05"," 0.20"," 0.00"," 1.23"," 0.00"," 0.00"," 0.38"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.00"," 0.02"," 0.00"," 0.02"," 0.00"," 3.38"," 0.02"," 0.00"," 0.00"," 0.16"," 0.00"," 0.54"," 0.00"," 0.46"," 0.00"," 0.00"," 0.00"," 0.02"," 0.00"],["    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    2.79","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.39","   13.20","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.02","    0.00","    0.21","    0.00","    0.00","    0.00","    0.00","    0.03","    0.00","    0.00","    0.00","    0.00","    0.03","    0.00","    0.00","    0.00","    0.08","    0.02","    0.02","    0.00","    0.00","    0.00","    0.00","    0.00","    0.79","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.20","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    5.61","    0.00","    0.00","    0.00","    0.00","    0.00","    0.07","    0.00","    0.00","    0.00","    0.00","    0.00","    0.46","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.02","    0.00","    0.00","    0.00","    0.00","    0.00","    0.02","    0.69","    0.00","    7.21","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","  106.97","    0.00","    0.00","    0.00","    0.34","    0.03","    0.00","    0.00","    0.00","    0.00","    3.79","    0.39","    2.54","    0.00","    0.00","    0.00","    0.08","    0.00","    0.00","    0.00","    0.02","    0.00","    0.00","   29.13","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.13","    0.00","    0.00","    0.00","    0.00","    0.00","  111.30","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.25","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.03","    0.00","    0.00","   12.03","    0.02","    0.00","    0.00","    0.00","    0.00","    0.00","    0.25","    0.00","    0.00","    0.00","    0.00","    0.00","    0.38","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.05","    0.00","    0.00","    0.00","    0.00","    0.00","    0.05","    0.00","    0.00","    0.00","    0.00","    0.00","    3.54","    0.00","    0.25","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.02","    0.00","    0.00","    0.00","    0.03","    0.02","    0.13","   22.31","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.02","   34.43","    0.00","    1.15","    5.07","    0.25","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    4.11","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.07","    0.00","    0.00","    0.00","    0.00","   16.74","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.03","    0.00","    0.00","    0.00","    0.02","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.16","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.66","    0.00","    0.00","    0.79","    0.00","    0.00","    0.02","    0.00","    0.00","    0.13","    0.07","    2.49","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","   18.64","    0.00","    0.02","    0.00","    0.00","    0.00","    0.00","    0.33","    0.00","    0.00","    0.00","    0.00","    0.02","    0.00","    0.00","    0.00","    0.00","    4.95","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.07","    0.00","    0.00","    0.10","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.75","    0.03","    0.02","    0.02","    0.00","    0.00","    0.02","    0.00","    0.03","   20.90","    0.00","    0.00","    0.00","    0.00","    0.00","    2.25","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.02","   32.38","    0.00","    0.03","    0.00","    0.00","    0.00","    0.00","    0.00","    0.51","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.85","    0.00","    0.02","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.03","    0.00","    0.00","    0.00","    0.00","    0.00","   85.74","    0.00","    0.00","    0.02","    0.00","    0.00","    0.00","    0.02","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.03","    0.00","    0.02","    0.08","    0.36","    0.43","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.43","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.03","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.02","    0.11","    0.00","    0.00","    0.00","    0.00","    0.00","    0.07","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.03","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.82","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    3.80","    4.87","    0.00","    0.00","    0.00","    0.03","    0.02","    0.00","    0.00","    0.03","    0.00","    0.08","    0.02","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.16","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.03","    0.48","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.02","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.57","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.59","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.62","    0.08","    0.00","    0.00","    0.00","    0.00","    4.59","    0.00","    0.00","    0.00","    0.34","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.02","    0.00","    0.20","    0.16","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.02","    0.44","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.02","1,497.48","    0.00","    0.00","    0.00","    0.26","    0.03","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.07","    0.00","    5.57","    0.00","    0.00","    0.70","    0.00","    0.00","    0.00","    0.00","  153.46","    0.00","    0.00","    0.00","    0.00","    0.02","    0.05","    0.02","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    1.57","    0.00","    0.00","    0.00","    0.00","    0.07","    0.00","    0.00","    2.11","    0.00","    0.08","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.28","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    1.30","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.03","    0.00","    0.48","    0.00","    0.02","    0.00","    0.00","    0.00","    0.00","    0.69","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    2.46","    8.93","    0.00","   14.93","    0.00","    0.00","    1.41","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.00","    0.02","    0.00","   21.66","    0.25","    0.00","    0.00","    0.28","    0.00","    6.52","    1.11","    1.18","    0.00","    0.00","    0.00","    1.26","    0.00"],["    0.02","    0.02","    0.02","    0.02","    0.07","    0.02","    0.02","    0.02","    0.02","    0.07","    0.03","    0.02","    0.07","    0.10","    0.02","    1.69","    2.85","    0.02","    6.33","    0.02","    0.02","    0.05","    0.02","    0.03","    0.03","    0.02","    0.05","    0.05","    0.23","   44.57","    0.03","    0.02","    0.02","    0.02","    0.02","    0.03","    0.02","    0.02","    0.02","    0.02","    0.07","    0.03","    0.05","    0.20","    0.03","    0.02","    0.02","    0.02","    0.05","    0.02","    0.02","    0.02","    0.10","   10.66","    0.03","    0.62","    2.34","    0.08","    0.03","    0.13","    0.03","    0.03","    0.02","    0.02","    0.16","    1.18","    0.07","    0.03","    0.02","    0.10","    0.02","    0.02","    0.02","    0.03","    0.07","    0.05","    0.07","    0.10","    8.84","    0.02","    0.02","    0.02","    0.03","    0.07","    0.02","    0.03","    0.10","    0.02","   21.20","    0.16","    0.03","    0.03","    0.02","    0.02","   40.79","    0.21","    0.02","    0.15","    0.10","    0.02","    3.05","    0.02","    0.02","    0.03","    0.02","    0.02","    0.08","    0.02","    0.02","    0.07","    0.07","    0.02","    0.02","    0.13","    2.31","    0.02","    7.00","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.05","    0.03","    0.08","    0.03","    0.02","    0.03","   27.51","    0.02","    0.02","    0.08","    0.07","    0.41","    0.02","    0.02","    0.02","    0.03","   10.74","   16.43","    0.36","    0.10","    0.02","    0.02","    3.34","    0.31","    0.07","    0.02","    0.03","    0.02","    0.15","  889.79","    0.03","    0.08","    0.02","    0.02","    0.02","    0.03","    0.02","    0.36","    0.02","    0.02","   11.18","    0.13","    0.02","    0.52","    0.02","    0.02","  415.18","    0.03","    0.05","    0.02","    0.02","    0.03","    0.02","   10.23","    0.03","    0.02","    0.02","    0.02","    0.10","    0.02","    0.02","    1.97","    0.02","    0.05","    8.82","    0.02","    0.02","    0.03","    1.21","    0.02","    0.05","    0.33","    0.02","    0.02","    0.74","    0.05","    0.11","    4.10","    0.10","    0.02","    0.02","    0.02","    0.15","    0.07","    0.02","    0.07","    0.87","    0.02","   22.00","    0.02","    0.75","    0.08","  112.11","    0.02","    0.02","    1.43","    0.02","    0.18","    0.52","    0.03","    0.02","    0.03","    0.07","    0.05","    0.13","    0.02","    0.03","    0.10","    0.02","    0.02","    0.13","    0.02","    0.38","    0.02","    0.02","    0.02","    0.03","    0.16","    0.87","4,732.15","    0.30","    0.02","    0.02","    0.02","    0.10","    0.07","    0.02","    0.21","    0.02","    0.03","    0.21","    0.02","    0.02","    0.05","    0.02","    0.48","    0.03","    0.02","    0.02","    0.03","    0.02","    0.02","    0.02","    0.02","    0.05","    0.03","    0.05","    0.02","    0.11","    0.02","   12.57","    0.02","    0.02","    1.21","    0.02","    0.03","    0.02","    0.02","    0.41","    0.13","    0.02","    0.03","    0.02","    0.05","    0.26","  192.18","    0.02","    0.07","    0.02","    0.02","    0.03","    0.02","    0.02","    0.02","    0.03","    0.02","    0.02","    0.02","    0.07","    0.05","    0.43","    0.15","    0.03","    0.03","    0.02","  257.51","    0.02","    0.02","    0.02","    0.03","    0.03","    0.03","    0.02","    0.02","    0.02","    0.52","    0.25","    0.05","    0.02","    0.02","    0.03","    0.02","    0.02","    0.02","    0.02","    0.02","    0.08","    0.03","    0.02","    0.03","    0.02","    0.02","    0.02","    0.05","    1.38","    0.02","    0.02","    3.74","    0.02","    0.02","    0.02","    0.02","    0.02","    0.13","    0.15","   11.89","    0.02","    0.07","    0.08","    0.05","    0.03","    0.10","    0.05","    0.03","  331.34","    0.03","    0.02","    0.02","    0.02","    0.02","    0.03","    0.02","    0.03","    0.02","    0.10","    0.02","    0.05","    0.02","    0.02","    0.02","    0.02","   25.13","    0.02","    0.02","    0.02","    0.03","    0.03","    0.02","    0.02","    0.02","    0.03","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.08","    0.02","    0.02","    0.05","    0.02","    0.03","    0.02","    0.03","    0.02","    0.02","    2.85","    0.03","    0.02","    0.11","    0.03","    0.02","    0.15","    0.02","    0.05","    1.44","    0.03","    0.02","    0.02","    0.05","    0.05","    1.00","    0.02","    0.03","    0.03","    0.07","    0.02","    0.08","    0.02","    0.02","    0.02","   32.89","    0.02","    0.02","    0.03","    0.05","    0.02","    0.02","    0.07","    0.46","    0.02","    0.03","    0.34","    0.02","   10.43","    0.38","    9.84","    0.02","    0.13","    0.02","    0.02","    0.03","    0.02","    0.02","    0.02","    0.02","    0.03","    0.03","    0.02","    0.38","    0.02","    0.34","    2.52","    0.03","    0.05","    0.02","    0.02","    0.05","  258.26","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.11","    0.02","    0.02","    0.05","    0.02","    7.25","    2.21","    0.03","    0.79","   95.28","    0.02","    0.07","    0.08","    0.08","    0.02","    0.02","    0.02","    0.02","    0.02","    0.05","    0.16","    0.05","    0.56","    0.02","    1.66","    0.59","    0.03","    0.18","    0.02","    0.02","    0.07","    0.02","    0.11","    0.02","    0.02","    0.02","    0.13","    0.15","    0.02","    0.08","    0.07","    0.02","    0.02","    0.11","    0.03","    0.02","    0.02","    0.03","    0.05","    0.02","    0.07","    0.79","    0.05","    0.02","    0.08","    0.28","    0.02","    0.07","    0.07","    0.26","    0.02","    0.02","    0.02","    0.08","    0.02","    0.02","    0.02","    0.02","    0.05","    1.05","    0.02","    0.03","    0.08","    0.02","    0.03","    0.02","    1.33","    0.02","    0.03","    0.08","    0.05","    0.02","    0.07","    0.03","    0.02","    0.02","    0.23","    0.13","    0.02","    0.10","    0.18","    0.08","    0.03","    0.05","    0.02","    0.02","    0.13","    2.39","    0.05","    0.05","    0.02","    0.03","    0.03","    0.03","    7.70","    4.98","    0.02","    0.03","    0.03","    2.84","    0.08","    0.39","    0.03","    0.02","    0.08","    0.05","    0.07","    0.03","    0.03","    0.03","    0.02","    0.34","    0.02","    0.21","    0.38","    0.08","    0.02","    0.97","    0.02","    0.20","    0.03","    0.02","    0.02","    0.03","    0.08","    0.02","    0.77","    0.02","    0.02","    0.03","    0.02","    0.11","    0.07","    0.02","    0.08","    0.03","    0.18","    0.49","    9.62","    0.02","    0.02","    0.02","    0.03","    0.03","    0.02","    0.54","    0.02","    0.02","    0.07","    0.02","    0.11","    0.18","    0.10","    0.02","    0.31","    0.02","    0.07","    0.28","    0.02","    0.02","    0.02","    0.11","    0.03","    0.10","    0.02","    0.03","    0.11","    0.28","    0.02","    0.02","    0.16","    0.10","    0.02","    0.02","    0.02","    0.08","    0.02","    0.02","    0.02","    4.28","    2.43","    0.02","    0.05","    0.05","    0.05","   58.46","    0.03","    0.02","    0.11","    3.21","    0.03","    0.03","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.03","    0.02","    0.03","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.03","    0.02","    0.02","    0.02","    0.02","    0.02","    0.03","    0.02","    0.02","    0.02","    0.02","    0.03","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.03","    0.02","    0.02","    0.03","    0.02","    0.02","    0.02","    0.02","    0.70","    0.03","    0.03","    0.02","    0.02","    0.02","    0.74","    0.11","    0.03","    0.02","    0.02","    0.02","    0.02","    0.02","    0.07","    0.10","    0.23","    0.02","    0.02","    0.05","    0.02","    0.02","    0.03","    0.05","    0.02","    0.03","    0.02","    0.02","    0.08","    0.33","  994.30","    0.02","    0.31","    0.07","    0.05","    0.03","    0.02","    0.03","    0.02","    0.02","    0.02","    0.02","    0.02","    0.98","   11.31","    0.02","    0.03","    0.02","    0.05","    0.02","    0.05","    0.03","5,401.98","    0.02","    0.02","    0.02","    0.02","    0.18","    0.64","    0.02","    0.02","    0.02","    0.02","    0.07","    0.03","    0.11","    0.02","    0.05","    0.02","    0.02","    0.02","    0.02","    0.02","    0.07","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.02","    0.03","    0.02","    0.02","    0.03","    0.03","    0.02","    0.07","    0.02","    0.03","    0.02","    0.02","    0.05","    0.02","    1.00","    0.02","    0.11","    0.02","    0.02","    0.02","    0.07","    0.03","    0.02","    0.02","    0.07","    0.02","    0.02","    0.02","    0.02","   17.26","    0.02","    0.02","    0.02","    0.02","    0.93","    0.02","    0.02","    0.33","    0.02","    0.18","    0.02","    0.38","    0.20","    0.03","    0.92","    0.16","    2.07","    0.02","    0.21","    0.03","    0.03","    0.31","    0.03","    0.03","    0.16","    0.03","    0.13","    0.02","    0.07","    0.03","    0.05","    0.05","    0.10","    0.02","    0.02","    4.08","    0.02","    0.02","    1.61","    0.05","    0.02","    0.03","    0.03","    0.02","    0.13","    0.03","    0.49","    0.07","    0.02","   55.61","    0.02","    0.05","    0.03","    0.02","    0.02","    0.02","    0.36","    0.02","    0.05","    0.03","    0.03","    0.08","    0.02","    0.02","    0.02","    0.02","   62.23","    0.02","    0.02","    0.16","    0.03","    0.02","    0.03","    0.13","    0.61","    0.02","    0.02","    0.10","    0.07","    0.02","    0.02","    0.07","    0.03","    0.02","    0.07","   23.89","    0.02","   45.26","    0.13","    0.10","    5.57","    0.20","    0.02","    0.30","    0.02","    0.07","    0.44","    0.05","    0.02","    0.02","    0.59","    0.05","  187.43","    0.02","    0.02","    0.02","    0.05","    0.31","  115.18","    0.10","   18.10","    0.03","    0.05","    0.02","    1.48","    0.02"]],"container":"<table class=\"display\">\n  <thead>\n    <tr>\n      <th> </th>\n      <th>Property Damage,$</th>\n      <th>Crop Damage,$</th>\n      <th>Total Damage,$</th>\n      <th>Deaths</th>\n      <th>Injuries</th>\n      <th>Occurences</th>\n    </tr>\n  </thead>\n</table>","options":{"order":[[6,"desc"]],"autoWidth":false,"orderClasses":false,"columnDefs":[{"orderable":false,"targets":0}],"responsive":true},"callback":null,"caption":"<caption>Table: Average annual values, 1950-2011</caption>","filter":"none","extensions":["Responsive"]},"evals":[]}</script></p>
<style>.dataTable{font-size:13px;}</style>

Let's see whether the most frequent events have a significant effect on the health of population and the infrastructure. 

**Across the United States, which types of events (as indicated in the EVTYPE variable) are most harmful with respect to population health?**

I summarize the number of total injuries and deaths by the event type over the period 1950 to 2011.


```r
# Table of total deaths and injuries by event type during 1950-2011
Tdeaths<-sort(tapply(data$FATALITIES,list(data$EVTYPE),sum),decreasing=TRUE)
Tinj<-sort(tapply(data$INJURIES,list(data$EVTYPE),sum),decreasing=TRUE)

# Total deaths by event type
head(Tdeaths)
```

```out
##        TORNADO EXCESSIVE HEAT    FLASH FLOOD           HEAT      LIGHTNING 
##           5633           1903            978            937            816 
##      TSTM WIND 
##            710
```

```r
# Total injuries by event type
head(Tinj)
```

```out
##        TORNADO      TSTM WIND          FLOOD EXCESSIVE HEAT      LIGHTNING 
##          91346           9361           6789           6525           5230 
##           HEAT 
##           2100
```

Next, I calculate the average number of deaths and injuries for years 2000-2011. I chose the period 2000-2011 because in the earlier years there are generally fewer events recorded due to poor recording process as was stated in the project instructions. Recent years have more accurate records.


```r
# Boolean to subset data
years<-data$Year %in% 2000:2010

# Average deaths and injuries per year
TdeathsAve<-sort(tapply(data[years,]$FATALITIES,list(data[years,]$EVTYPE),sum),decreasing=TRUE)/11
TinjAve<-sort(tapply(data[years,]$INJURIES,list(data[years,]$EVTYPE),sum),decreasing=TRUE)/11

# Average deaths per year by event type
head(TdeathsAve)
```

```out
## EXCESSIVE HEAT        TORNADO    FLASH FLOOD      LIGHTNING    RIP CURRENT 
##       88.81818       55.09091       48.36364       40.00000       28.27273 
##          FLOOD 
##       18.90909
```

```r
# Average injuries per year by event type
head(TinjAve)
```

```out
##           TORNADO    EXCESSIVE HEAT         LIGHTNING         TSTM WIND 
##         822.72727         324.54545         254.45455         253.45455 
## HURRICANE/TYPHOON          WILDFIRE 
##         115.90909          72.27273
```

Let's plot the averages.


```r
par(mfcol=c(1,2))
par(mar=c(3,7,2,3))

rowChart = plot.k(TdeathsAve[1:10],'Avg # of deaths per year')
text(x= sort(TdeathsAve[1:10])+20, y= rowChart, labels=as.character(round(sort(TdeathsAve[1:10]),2)),xpd=TRUE)

rowChart = plot.k(TinjAve[1:10],'Avg # of injuries per year')
text(x= sort(TinjAve[1:10])+200, y= rowChart, labels=as.character(round(sort(TinjAve[1:10]),2)),xpd=TRUE)
```

<p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqAAAAEgCAYAAABrZMGAAAAD8GlDQ1BJQ0MgUHJvZmlsZQAAOI2NVd1v21QUP4lvXKQWP6Cxjg4Vi69VU1u5GxqtxgZJk6XpQhq5zdgqpMl1bhpT1za2021Vn/YCbwz4A4CyBx6QeEIaDMT2su0BtElTQRXVJKQ9dNpAaJP2gqpwrq9Tu13GuJGvfznndz7v0TVAx1ea45hJGWDe8l01n5GPn5iWO1YhCc9BJ/RAp6Z7TrpcLgIuxoVH1sNfIcHeNwfa6/9zdVappwMknkJsVz19HvFpgJSpO64PIN5G+fAp30Hc8TziHS4miFhheJbjLMMzHB8POFPqKGKWi6TXtSriJcT9MzH5bAzzHIK1I08t6hq6zHpRdu2aYdJYuk9Q/881bzZa8Xrx6fLmJo/iu4/VXnfH1BB/rmu5ScQvI77m+BkmfxXxvcZcJY14L0DymZp7pML5yTcW61PvIN6JuGr4halQvmjNlCa4bXJ5zj6qhpxrujeKPYMXEd+q00KR5yNAlWZzrF+Ie+uNsdC/MO4tTOZafhbroyXuR3Df08bLiHsQf+ja6gTPWVimZl7l/oUrjl8OcxDWLbNU5D6JRL2gxkDu16fGuC054OMhclsyXTOOFEL+kmMGs4i5kfNuQ62EnBuam8tzP+Q+tSqhz9SuqpZlvR1EfBiOJTSgYMMM7jpYsAEyqJCHDL4dcFFTAwNMlFDUUpQYiadhDmXteeWAw3HEmA2s15k1RmnP4RHuhBybdBOF7MfnICmSQ2SYjIBM3iRvkcMki9IRcnDTthyLz2Ld2fTzPjTQK+Mdg8y5nkZfFO+se9LQr3/09xZr+5GcaSufeAfAww60mAPx+q8u/bAr8rFCLrx7s+vqEkw8qb+p26n11Aruq6m1iJH6PbWGv1VIY25mkNE8PkaQhxfLIF7DZXx80HD/A3l2jLclYs061xNpWCfoB6WHJTjbH0mV35Q/lRXlC+W8cndbl9t2SfhU+Fb4UfhO+F74GWThknBZ+Em4InwjXIyd1ePnY/Psg3pb1TJNu15TMKWMtFt6ScpKL0ivSMXIn9QtDUlj0h7U7N48t3i8eC0GnMC91dX2sTivgloDTgUVeEGHLTizbf5Da9JLhkhh29QOs1luMcScmBXTIIt7xRFxSBxnuJWfuAd1I7jntkyd/pgKaIwVr3MgmDo2q8x6IdB5QH162mcX7ajtnHGN2bov71OU1+U0fqqoXLD0wX5ZM005UHmySz3qLtDqILDvIL+iH6jB9y2x83ok898GOPQX3lk3Itl0A+BrD6D7tUjWh3fis58BXDigN9yF8M5PJH4B8Gr79/F/XRm8m241mw/wvur4BGDj42bzn+Vmc+NL9L8GcMn8F1kAcXgSteGGAABAAElEQVR4AeydB7wV1fHHTxITS6yJvQUhKkZU1ICKiGjAAlhAUbHESoyJDbErBqMiNsReiD0abBQVbKCACipiQVAs2LCCWGI0tuT9z3f+zubcfbv37n3cd98tM5/PvdvOnj372905c2bmzPyowZMzMgQMAUPAEDAEDAFDwBAwBMqEwI/LdB27jCFgCBgChoAhYAgYAoaAISAImABqL4IhYAgYAoaAIWAIGAKGQFkRMAG0rHDbxQwBQ8AQMAQMAUPAEDAETAC1d8AQMAQMAUPAEDAEDAFDoKwImABaVrjtYoaAIWAIGAKGgCFgCBgCJoDaO2AIGAKGgCFgCBgChoAhUFYETAAtK9x2MUPAEDAEDAFDwBAwBAwBE0DtHTAEDAFDwBAwBAwBQ8AQKCsCJoCWFW67mCFgCBgChoAhYAgYAoaACaD2DhgChoAhYAgYAoaAIWAIlBUBE0DLCrddzBAwBAwBQ8AQMAQMAUPABFB7BwwBQ8AQMAQMAUPAEDAEyoqACaBlhTv/xZ566im3/fbby693797uv//9b/4Tynz066+/dksttZT72c9+5j7++GO5+gYbbCDb9957b0lb88wzz7iePXu6VVZZxbVp08btv//+Rdd//vnnR3g2NDQUfX5TTnjzzTfd559/Hp06dOjQqA3RTlsxBAyBkiBQ6TzzL3/5i/DHY445Ru73tttuk+2OHTuW5P7DSrLyzI8++ijiSTfccENYReZ1+Jz2VXfccUfm84opGPLvSusLi7kPK5uOwGLph+xIuRG48sor3aOPPhpd9sEHH3Q777xztN3SKy+88IL797//7dZee2234ooriqD1yiuvOIS7zTbbrGTN++KLL9wOO+zgPv30U6lz/vz5bp111im6/pdffjnCkzb+6Ec/KrqOrCd8+eWX7txzz3UXXXSRe/HFF91yyy0np4ZtyFqXlTMEDIFsCFQ6z3z66afdd99959q3by83hJDI9iabbJLtBjOWKoZnokjQfmbrrbfOeIXcYv/617+iOnr06JF7sERbIe8slwKhRE23ajIiYAJoRqCauxhaszvvvDPnMtdee21FCaAwT+i3v/2tLJ999lkRPldbbTW3xhpryL5S/L366quR8HnwwQe7IUOGyHVKUXdz1XHhhRe6c845p7mqt3oNAUMghkA18swZM2bIXXTo0CF2N4u2WQzPxIq16667ygWxYDWFll122agOLFTNQZtuuqn75JNPpOrmVB40R9utzmwImACaDadmL4VpBu0ihDD33nvvufvuu8+9//77bvXVVy/J9RcsWOB++tOfuuWXXz5zfbQDMxekZvaf/OQnbtSoUe7++++X/SuvvLK75557IoYkO/P8/ec//3HvvPOOaFKpK05cUwkN8KqrrqqbeZfff/+9e/fdd6XeH/+4sHcJo+q3337b0X6YchrRXsxW//znP90KK6wgbgFpZbPs/+yzz9y3334r100rz72AA9fm/vO1L60O3Y8Geckll3TLLLOM7mq0zIpFeCJYr7nmmuGukqyDM8LFWmutlbc+tD4ffPCBvNNgxD3mI+rkvciHQ77z7VhlIVCpPHPChAnCK/jOcVXinUOb99prr7nnnntOQGQ/2+uuu24mUOHd1PPLX/4ysXwxPHOllVZyY8eOTawnvpNvEesOSoaQfvWrX2WuIzyv0HrIU44++mjHL42y8qxy81Lam5WH6b2F9637SrHM2o5ieSltK0mb/UM0qgAENt98c5wUG7yw2XD77bfLOttnnXVWTuu81rHh5z//ufxOPfXUnGNeqGnwnbYc23HHHaNjkydPblhvvfWkTs/EGrbYYouGN954o8EzMynrNXdR2fiK18pGbaE9ab+ll146fmqjbS+wNuy0004NXgCQehZffPGGbt26NXgzflTW+xU1sF+vwzr3+8ADD0Rl4iueQTb079+/YYkllpDzqJ97+v3vfx/V4wW56DRvgmo49thjo3aAiTeJNUydOjUqoyt//etfG7zAHtVDu1q1atUwceJELdLQp0+fBi/YR2W8INTgBSI5HraB+wR7P5qXsr7zaXj88cejelj58MMPGw444ICGxRZbLKqP8uDkhfacskkbffv2Fby8C4PU3a5dO6mHe+zSpUvDW2+9lXNaVizARt87PzCK3ifet4ULF+bUycbee+8t5Xkv/CAq5/iZZ54Z1fX8889H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RblRLAWLGwTGh+QBfGviRtKAxm3EK/G8pCMlTWmPHj0qcVfuivbr189q30iZWQwaNWqUId3cTTfdVIzmbYq86dOnp81nne9OzZo1ywwbNizfzah+IVCWCBSbfzpQicNcu3Zt8/HHH7tTRduOHz/epgMl/WexqVu3buacc84xxxxzTFG7glBOStg4knxA4zjqemYhIASEgBAQAkJACBQRAQmgRQRfTQsBISAEhIAQEAJCII4ISACN46jrmYWAEBACQkAICAEhUEQEJIAWEXw1LQSEgBAQAkJACAiBOCIgATSOo65nFgJCQAgIASEgBIRAERGQAFpE8NW0EBACQkAICAEhIATiiIAE0DiOup5ZCAgBISAEhIAQEAJFREACaBHBV9NCQAgIASEgBISAEIgjApsO8SiOD65nzo5ArVq1TMuWLU29evWyF85DCdpv3ry5adiwYR5qz14l7Tdp0sQ0a9Yse+E8lKD9Bg0amBYtWuSh9uxV0j4ZS9q0aZO9sEoIASGQggDvTzH5p+sM/dhkk01Mx44d3amibenLjjvuWDSe5n9w+tK6deuiB4GnH2ScO/DAA/3di8W+UnHGYpj1kEJACAgBISAEhIAQKB0EZIIvnbFQT4SAEBACQkAICAEhEAsEJIDGYpj1kEJACAgBISAEhIAQKB0EJICWzlioJ0JACAgBISAEhIAQiAUCEkBjMcx6SCEgBISAEBACQkAIlA4CEkBLZyzUEyEgBISAEBACQkAIxAIBCaCxGGY9pBAQAkJACAgBISAESgcBCaClMxbqiRAQAkJACAgBISAEYoGABNBYDLMeUggIASEgBISAEBACpYOABNDSGQv1RAgIASEgBISAEBACsUBAAmgshlkPKQSEgBAQAkJACAiB0kFAAmjpjEXJ9SSRSBS0Tz/++GPW9grdp2CH8tl+lLqjlAn2OepxTcA/6rOonBAoNgL5fFf9z5ar97ZQ/fX3PZ/72Z4n23X6FqVMPp+h3OuWAFruI1yF55s/f77p3bu32XbbbU2zZs3MsGHDqlBLtFu+/vprM2DAALPzzjubX/3qV2aXXXYxI0eONN9//32ygq+++spcccUVpnnz5ma77bYzxx9/vFm9enXyeq526Mtuu+1mLrroogpV/vWvfzWdOnUyderUMe3btzfPPfdchTJVPfHMM8+Ydu3amc0339zsv//+5rbb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" alt /></p>

```r
par(mfcol=c(1,1))
par(mar=c(5.1,4.1,4.1,2.1))
```

On average tornados and excessive heat cause the most number of deaths and injuries per year for the period 2000-2011. The most frequent events, tornado, flash flood and thundestorm winds have a significant effect on the population health. However, hail, the second most frequent event, has an insignificant effect on population health. Excessive heat which is 20th most frequent event with $27.06452$ occurences per year is the most deadly. Thus, in general, the events that are most frequent are significantly harmful to the population health. Therefore, countermeasures should be provided on a constant basis. This means that the amortisation and review of the countermeasure infrastructure needs to be frequent as well.

**Across the United States, which types of events have the greatest economic consequences?**

I calculate the total damage over the period 1950-2011 and average damage for years 2000 to 2011. The total damage is the sum of property damage and the crop damage.


```r
# Total damage table by event type
TtotalDmg<-sort(tapply(data$PROPDMGSCALE,list(data$EVTYPE),sum)
                + tapply(data$CROPDMGSCALE,list(data$EVTYPE),sum)
                ,decreasing=TRUE)

totalDmg = data.frame(row.names = 1:length(TtotalDmg), event = rownames(TtotalDmg),cost = TtotalDmg,`pretty_cost` = format(TtotalDmg,big.mark = ',',scientific = F,digits = 4))

# Show events whose total damage is more than 1bil$ during 1950-2011
totalDmg[totalDmg$cost > 1000000000,c(1,3)]
```

```out
##                         event        pretty_cost
## 1                       FLOOD 150,319,678,257.00
## 2           HURRICANE/TYPHOON  71,913,712,800.00
## 3                     TORNADO  57,352,115,822.50
## 4                 STORM SURGE  43,323,541,000.00
## 5                        HAIL  18,758,223,268.50
## 6                 FLASH FLOOD  17,562,131,144.30
## 7                     DROUGHT  15,018,672,000.00
## 8                   HURRICANE  14,610,229,010.00
## 9                   TSTM WIND  10,868,962,514.50
## 10                RIVER FLOOD  10,148,404,500.00
## 11                  ICE STORM   8,967,041,560.00
## 12             TROPICAL STORM   8,382,236,550.00
## 13               WINTER STORM   6,715,441,255.00
## 14                  HIGH WIND   5,908,617,595.00
## 15                   WILDFIRE   5,060,586,800.00
## 16           STORM SURGE/TIDE   4,642,038,000.00
## 17             HURRICANE OPAL   3,191,846,000.00
## 18           WILD/FOREST FIRE   3,108,626,330.00
## 19  HEAVY RAIN/SEVERE WEATHER   2,500,000,000.00
## 20 TORNADOES, TSTM WIND, HAIL   1,602,500,000.00
## 21                 HEAVY RAIN   1,427,647,890.00
## 22               EXTREME COLD   1,360,710,400.00
## 23        SEVERE THUNDERSTORM   1,205,560,000.00
## 24               FROST/FREEZE   1,103,566,000.00
## 25                 HEAVY SNOW   1,067,242,257.00
```

Let's look at the average total economic damage per year during 2000-2011.


```r
# Average damage per year table for the period 2000-2011 by event type
TtotalDmgAve<-sort(tapply(data[years,]$PROPDMGSCALE,list(data[years,]$EVTYPE),sum)
                + tapply(data[years,]$CROPDMGSCALE,list(data[years,]$EVTYPE),sum),
                decreasing=TRUE)/11

# Turn into a dataframe with pretty cost column
totalDmgAve = data.frame(row.names = 1:length(TtotalDmgAve), event = rownames(TtotalDmgAve),cost = TtotalDmgAve,`pretty_cost` = format(TtotalDmgAve,big.mark = ',',scientific = F,digits = 4))

# Show events whose average total damage is more than 1mil$ per year during 2000-2011
totalDmgAve[totalDmgAve$cost > 1000000,c(1,3)]
```

```out
##                event       pretty_cost
## 1              FLOOD 11,912,769,002.73
## 2  HURRICANE/TYPHOON  6,537,610,254.55
## 3        STORM SURGE  3,924,630,454.55
## 4               HAIL  1,203,609,870.00
## 5        FLASH FLOOD  1,028,091,082.73
## 6            DROUGHT    904,622,090.91
## 7            TORNADO    894,962,851.82
## 8     TROPICAL STORM    676,727,122.73
## 9          TSTM WIND    516,427,969.09
## 10         HIGH WIND    487,030,401.82
## 11  STORM SURGE/TIDE    418,303,909.09
## 12          WILDFIRE    399,638,581.82
## 13         HURRICANE    315,616,910.00
## 14         ICE STORM    265,541,210.91
## 15  WILD/FOREST FIRE    214,942,875.45
## 16      WINTER STORM    124,723,290.91
## 17      FROST/FREEZE     98,601,454.55
## 18        HEAVY RAIN     76,104,003.64
## 19         LIGHTNING     50,392,913.64
## 20    EXCESSIVE HEAT     45,060,181.82
## 21         LANDSLIDE     29,403,818.18
## 22        HEAVY SNOW     28,213,493.64
## 23       STRONG WIND     18,882,801.82
## 24     COASTAL FLOOD     17,231,505.45
## 25      EXTREME COLD     14,428,000.00
## 26          BLIZZARD     11,092,090.91
## 27           TSUNAMI      8,229,818.18
## 28         HIGH SURF      7,571,136.36
## 29            FREEZE      4,850,000.00
## 30    TSTM WIND/HAIL      4,450,095.45
## 31  LAKE-EFFECT SNOW      3,569,272.73
## 32    WINTER WEATHER      3,086,545.45
## 33  COASTAL FLOODING      1,553,909.09
## 34 EXTREME WINDCHILL      1,545,454.55
```

Below I plot the average total economic damage per year during 2000-2011 of events whose average economic damage is greater than 1 million.


```r
par(mar=c(2,8,2,6.4))
# Plot average economic damage > than 1mil$ per year during 2000-2011
rowChart = plot.k(totalDmgAve[totalDmgAve$cost > 1000000,]$cost,'Avg Damage per Year in $, 2000-2011')
text(x = sort(totalDmgAve[totalDmgAve$cost > 1000000,2])+1780000000, 
     y = rowChart, 
     labels= format(sort(totalDmgAve[totalDmgAve$cost > 1000000,2]),big.mark = ',',scientific = F,digits = 4),
     xpd=TRUE)
```

<p><img src="data:image/png;base64,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sM997nMn/vZv/7b0udpqq02cd955hYw++clPLg8tGqWHPvShE9///vcHfVhAcNdff/3BXIyFBLzsZS+b+MMf/jCpLYLrIRjawLvd7W7l4fzud797MJd6h7PPPnviEY94xEAr5piYBP/7v/+7bjZ0+YUvfGHp8xnPeMbEt7/97YmHP/zhZY7OxROf+MRClro79hlPm7gWPv/5zw/OsWtgKrOx68SxxEP/61//+gRtXPxufXq705noM5/Yqc85n83cuQfE8YYJ/rrrrhusO+200yb23XffAXFz7pntf/e738XUhn63PouDY3f9BQEd2rjnSgTS//Fhhx026VpHsIJ4mRt573vfOxi/JoW0ps5J62s9GHUmbf/hH/6h7F8T2JoAtz61g36HLczkGOw/k/G8rIbrTuvXOTj+LgF961vfWra5Z3zwgx8ctEsCOuyM5br5QCAJ6Hygmn2ODQK1CXC33XYrmpvwB1t11VUnuubGNpCg3IiR1Xrb5z73ucEN+qMf/Wg5vjagYvDA8zD7u7/7u9Lm3ve+92A9k99UMh0BveaaawbjIlshCEGQGg/ROCbrEMyrrrqqND355JMH7e5zn/sUM/C97nWvwTrkkFbYA4v/WvT5j//4jwMNJxzWW2+9wTbYhDlZe/61tTz72c8etNWOOVq70D5bDvna1742wMr6eg5PetKTotnI70033bT0DXM46CMItuV73vOekzTTfcdDZu3vU+P16Ec/euRcYgPNUuDzsIc9rLy46MdLSVfD3Hc++u57zmcz92E+oDTwgUGYtxHIODbbpvNlRWLDlcS5vd3tblfM5YHVXH7XZPfII48sXXuRjGP48Y9/PBhu5513HqwPDWbftrS/0ee222476NO5jfWvfe1rB+tnsjDsGGY6Hq2wF0vy6le/ejCnLgGliaYV9gLZBnEN2iUBnckZy7bLg8CKDwNu/2NTEoH5QuBDH/rQoOutt966RCa3ptGyrn0gNWecccZgu4VWE1R+//SnP21EA4ccf/zxZbElbE1LBMvyG9/4xqYlZ2X5/e9/f4nEbbVPTfugHaxv/zmji1l9t0RwsF/7MB8stxqgpiWdTav5a9oHaBm79eMr20W0ttqeQdtYaElm05pPS8TujjvuWFa3bgNN+4BrWrJR1rd+qGW9SOUYryU0jWjdltg1LWFqWvN9Y79//ud/Lm1bLV8M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tvOJekUuJwLzjYCbyx3ueKfmVvPwjzrfc8/+E4FEIBFIBOYHgf/63S3NOw46uHnTHrsPHeAjH/lIs8suuzS///3vh25HADfddNPmHve4R3PccccNbRMr//SnPzX77bdf89GPfrS55ZZbmqc97WnNG97whmb99dePJpO+R41tLvr5+Mc/3vzHf/xH80//9E/NK1/5ymb33XdvbnOb4Tq+xz/+8c0vf/nLSf3Hj1e/+tXNa17zmvLzK1/5SrPnnns2l156afOoRz2q2XLLLRvbg6DP9BhijIsuuqh517ve1XzhC19o7n73uzfbbrtts88++8Tm8t2nzRlnnNF86EMfar74xS82q666arPddts1r3vd6yb1M9WP4ehMtUduSwSWE4Fb3/rWzRFnXdzc5m//djl7yt0TgUQgEUgElgoC3zrlU81ll1829HA+97nPNTvuuGPj+TFMWNZe+9rXNqeffnrzspe9bFiTSesQ2eOPP76Qxec///mFsCKv5513XvPABz5wUtupxt5pp52a0047rdltt92apzzlKWUZIaUtPfDAAyf1Ez8222yz5ne/+138LN9nn31287WvfW0w9te//vVm4403Lsf8vve9r5A8Y/zzP/9z89znPrfsM5NjiMH+67/+q3nBC17QPPaxj22McckllzQ777xz0dzutddepVmfNjfccEOZxzbbbNN89atfbb797W8X0k2n+frXvz6Gm/I7NaBTwjPeG71B/f3f//3gbWjYbF3k/mGnMlkM228+13krPPqcq5KAzifI2XcikAgkAosMAQT0T9dd1nzso8cPZv6f//mfDZJ34oknNmussUZz4403NghSLd/73veal770pc1Pf/rTYnp/5jOfOaUGVLt//Md/LBq7D3zgA4OuHv3oRzdcABBBMt3Yv/3tb4sGkeb0ne9856AfBO9b3/pW8/Of/3ywbqoFGtiHPexhRcMZ/TzjGc9o/rZV0nz+858fPONpVn/96183n/70p8ux9jmG7rj7779/c9hhh5W53f72ty+b3/KWtzRHHnlk85Of/KS53e1u1/Rps/322xcCe8011wzcDhD56667rrn44ou7ww79PffOCkOHyZU1AvxTqNDvfOc7l4vdBe/DBEC8mXziE5+odxkse8vbd999y0Xvn+X+979/86//+q9F9T9o1C5QrT/kIQ8p5gAX9pOe9KTm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iICOn2ulMxUCQkAICAEhIASEwIRAQAR0QlxGDUIICAEhIASEgBAQAuMHARHQ8XOtdKZCQAgIASEgBISAEJgQCIiATojLqEEIASEgBISAEBACQmD8ICACOn6ulc5UCAgBISAEhIAQEAITAgER0AlxGTUIISAEhIAQEAJCQAiMHwREQMfPtdKZCgEhIASEgBAQAkJgQiAw74QYhQYxrhCYd955w+KLLx7mmWeecXXe3TzZf/3rX+GZZ54JL3/5y7vZ7LhrCwyQhRZaaNydezdP+KmnngoLLrhgmG+++brZ7Lhr64knnghLLrnkuDvvbp4w/xsWWGCB8Pjjj3ezWbUlBPoOARHQvrskg3FC9957b4CIDqrcfffdYebMmeHaa68dVAh83Kecckr473//Gw466KCBxmHrrbcO06dPD+uuu+5A4/DKV74yzJ07d6AxuOuuu8Lpp58+0Bho8IOBwOAygMG4vn05SjSfr3jFKwaagC622GKu7QKHQZaFF17YCeig4zD//POHRRdd1J+LQb4fGPug3wvcBy960YsG/TbQ+AcAAdmADsBF1hCFgBAQAkJACAgBIdBPCIiA9tPV0LkIASEgBISAEBACQmAAEBABHYCLrCEKASEgBISAEBACQqCfEBAB7aeroXMRAkJACAgBISAEhMAAICACOgAXWUMUAkJACAgBISAEhEA/ISAC2k9XQ+ciBISAEBACQkAICIEBQEAEdAAusoYoBISAEBACQkAICIF+QkBxQPvpagzIuWy22WbhBS8Y7G8fYv0NetBxbvcVV1wxPP/88wNy5zcf5jrrrBOIDTvo8p73vGfQIfD7gPtBIgQmOgLzRJOJPkiNTwgIASEgBISAEBACQqB/EBhsNVT/XAediRAQAkJACAgBISAEBgYBEdCBudQaqBAQAkJACAgBISAE+gMBEdD+uA46CyEgBISAEBACQkAIDAwCIqADc6k1UCEgBISAEBACQkAI9AcCIqD9cR10FkJACAgBISAEhIAQGBgEREAH5lJroEJACAgBISAEhIAQ6A8ERED74zroLISAEBACQkAICAEhMDAIiIAOzKXWQIWAEBACQkAICAEh0B8IiID2x3XQWQgBISAEhIAQEAJCYGAQEAEdmEutgQoBISAEhIAQEAJCoD8QEAHtj+ugsxACQkAICAEhIASEwMAgIAI6MJd65AONMY68kZot1OmrTp2a3XVU7fnnn++o/kgqtxtju/0j6bufjm03znb7ezWW0ey3Tl916vQCi356JhjfWOHw3//+N/zrX//qBcRD2qzT11jhMORkVSAEKhAQAa0ARUWNCFxyySVho402Ci9+8YvDWmutFe64447GCl3cqtNXnTpdPCVv6kc/+lHYdNNNw0te8hLH4U1velO45ZZbut2Nt/fMM8+EQw45JKywwgrh5S9/eXjf+94X/vznPzf09Ytf/CK85z3v8fN5zWteEz7ykY+Ep556qqFOrzf222+/sOSSS/asmzo4XHfddWHKlClh/vnnD+uss04488wze3Y+ecO33nprWHPNNcOkSZPCeuut5/326mV///33hx133DG87GUvC8stt1w4/vjj81NxwnPYYYeFpZdeOiyyyCJ+v9x1110NdXqxAek87rjjwitf+crwohe9KKy00krhsssu60VX3ma75x7iNxY4pAGDx+abbx723HPPVNSzZau+6jw3PTsxNSwEOkHA/mlKhEBTBL7xjW/E+eabL9qLPdqLMO69995xgQUWiN///vebHjPcHXX6qlNnuP03O87IX7SXe1x99dXjpZdeGr/+9a/HzTbbLNpLN86dO7fZYcMuN2IXl19++WgENzLeVVddNa622mrRXjre5t/+9re4zDLLxGWXXTaeffbZ8dprr41GiOM73/nO+J///GfY/XZy4O233x7nmWeeuMQSS3RyWEd12+Fw8803o5KPb3/72/2azJw5My622GLxnHPO6aifTisz9he+8IVx3333jffee2+cMWOGPyNf+cpXOm2qbf2///3v0Uhn/MAHPhC/973vxYsuuijah2D8xCc+URxrhCcaAY/777+/3y+77rprNLIaH3300aJOL1bAm3vghBNOiHfffXf88Ic/7Nfja1/7Wte7q/PcjxUODPaf//yn/2/kfvzQhz7U9fHnDbbrq91zk7eldSEwlggwVSERAk0RWHnllaNpXxr2v/GNb4y77bZbQ1ndDV7SCy20UGX1On3VqVPZ+AgKL7jgAn+xQjaSPP300z4OSMhwhJfUzjvvPOTQBx98ML7gBS+IOZkx7WvDi/2MM87wbQhqkp/+9KdeBiHttfz1r3+NkydPjm94wxtGTEBHgsP666/vhPPf//53MeSTTjrJPwx++9vfFmXdXoHomza8+CCgfcjPNtts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" alt /></p>

Lastly, let's look at the average economic damage per year by damage type during 2000-2011. The average annual damage done to property by weather events is 14 times greater than the average annual damage done to crops.


```r
# Average damage per year during 2000-2011 by damage type
format(data.frame(
  prop_dmg=sum(data[years,]$PROPDMGSCALE/11),
  crop_dmg=sum(data[years,]$CROPDMGSCALE/11),
  row.names = '$ annualy'),
big.mark = ',',digits = 4, scientific = F)
```

```out
##                 prop_dmg      crop_dmg
## $ annualy 28,173,521,423 2,084,491,549
```


The fact that floods have had the biggest damage in economic terms makes sense. It is a devastating force of nature. Water can crush, water can flow. In the 2000s a bunch of storms and hurricanes took place in the US whose appearences are correlated the floods. However, hurricanes, storms, droughts are not even in the top 16 most frequent events. They are just most devastating to the infrastracture and crops. During 2000-2011 the damage done to property was 14 times greater than the damage done to crops. Therefore, the countermeasures need to focus on ensuring the security of the property.

<link rel="stylesheet" href="/css/rposts/dataTables.extra.css">
<link rel="stylesheet" href="/css/rposts/jquery.dataTables.min.css">
<link rel="stylesheet" href="/css/rposts/dataTables.responsive.min.css">

<script src = "/js/rposts/jquery.dataTables.min.js"></script>
<script src = "/js/rposts/htmlwidgets.js"></script>
<script src = "/js/rposts/datatables.js"></script>
<script src = "/js/rposts/dataTables.responsive.min.js"></script>

<script>
HTMLWidgets.widget({
  name: "datatables",
  type: "output",
  renderValue: function(el, data) {
    var $el = $(el);
    $el.empty();

    if (data === null) {
      return;
    }

    var cells = data.data;

    if (cells instanceof Array) cells = HTMLWidgets.transposeArray2D(cells);

    $el.append(data.container);
    var $table = $el.find('table');
    if (data.caption) $table.prepend(data.caption);

    // column filters
    var filterRow;
    switch (data.filter) {
      case 'top':
        $table.children('thead').append(data.filterHTML);
        filterRow = $table.find('thead tr:last td');
        break;
      case 'bottom':
        if ($table.children('tfoot').length === 0) {
          $table.append($('<tfoot>'));
        }
        $table.children('tfoot').prepend(data.filterHTML);
        filterRow = $table.find('tfoot tr:first td');
        break;
    }

    var options = { searchDelay: 1000 };
    if (cells !== null) options = {
      data: cells
    };
    $.extend(options, data.options || {});

    var searchCols = options.searchCols;
    if (searchCols) {
      searchCols = searchCols.map(function(x) {
        return x === null ? '' : x.search;
      });
      // FIXME: this means I don't respect the escapeRegex setting
      delete options.searchCols;
    }

    var table = $table.DataTable(options);

    // server-side processing?
    var server = data.options.serverSide === true;

    var inArray = function(val, array) {
      return $.inArray(val, array) > -1;
    };

    if (data.filter !== 'none') {

      filterRow.each(function(i, td) {

        var $td = $(td), type = $td.data('type'), filter;
        var $input = $td.children('div').first().children('input');
        $input.on('input blur', function() {
          $input.next('span').toggle(Boolean($input.val()));
        });
        var searchCol;  // search string for this column
        if (searchCols && searchCols[i]) {
          searchCol = searchCols[i];
          $input.val(searchCol);
        }
        // Bootstrap sets pointer-events to none and we won't be able to click
        // the clear button
        $input.next('span').css('pointer-events', 'auto').hide().click(function() {
          $(this).hide().prev('input').val('').trigger('input').focus();
        });
        var $x = $td.children('div').last();

        if (inArray(type, ['factor', 'logical'])) {
          $input.on({
            click: function() {
              $input.parent().hide(); $x.show(); filter[0].selectize.focus();
            },
            input: function() {
              if ($input.val() === '') filter[0].selectize.setValue([]);
            }
          });
          filter = $x.children('select').selectize({
            plugins: ['remove_button'],
            hideSelected: true,
            onChange: function(value) {
              $input.val(value === null ? '' : JSON.stringify(value));
              if (value) $input.trigger('input');
              $input.attr('title', $input.val());
              if (server) {
                table.column(i).search(value ? JSON.stringify(value) : '').draw();
                return;
              }
              // turn off filter if nothing selected
              $td.data('filter', value !== null && value.length > 0);
              table.draw();  // redraw table, and filters will be applied
            }
          });
          // an ugly hack to deal with shiny: for some reason, the onBlur event
          // of selectize does not work in shiny
          $x.find('div > div.selectize-input > input').on('blur', function() {
            $x.hide(); $input.parent().show();
          });
          filter.next('div').css('margin-bottom', 'auto');
        } else if (type === 'character') {
          var fun = function() {
            var regex = false, ci = true;
            if (options.search) {
              regex = options.search.regex,
              ci = options.search.caseInsensitive !== false;
            }
            table.column(i).search($input.val(), regex, !regex, ci).draw();
          };
          if (server) {
            fun = $.fn.dataTable.util.throttle(fun, options.searchDelay);
          }
          $input.on('input', fun);
        } else if (inArray(type, ['number', 'integer', 'date', 'time'])) {
          var $x0 = $x;
          $x = $x0.children('div').first();
          $x0.css({
            'background-color': '#fff',
            'border': '1px #ddd solid',
            'border-radius': '4px',
            'padding': '20px 20px 10px 20px'
          });
          var $spans = $x0.children('span').css({
            'margin-top': '10px',
            'white-space': 'nowrap'
          });
          var $span1 = $spans.first(), $span2 = $spans.last();
          var r1 = +$x.data('min'), r2 = +$x.data('max');
          $input.on({
            focus: function() {
              $x0.show();
              // first, make sure the slider div leaves at least 20px between
              // the two (slider value) span's
              $x0.width(Math.max(160, $span1.outerWidth() + $span2.outerWidth() + 20));
              // then, if the input is really wide, make the slider the same
              // width as the input
              if ($x0.outerWidth() < $input.outerWidth()) {
                $x0.outerWidth($input.outerWidth());
              }
              // make sure the slider div does not reach beyond the right margin
              if ($(window).width() < $x0.offset().left + $x0.width()) {
                $x0.offset({
                  'left': $input.offset().left + $input.outerWidth() - $x0.outerWidth()
                });
              }
            },
            blur: function() {
              $x0.hide();
            },
            input: function() {
              if ($input.val() === '') filter.val([r1, r2]);
            },
            change: function() {
              var v = $input.val().replace(/\s/g, '');
              if (v === '') return;
              v = v.split('...');
              if (v.length !== 2) {
                $input.parent().addClass('has-error');
                return;
              }
              if (v[0] === '') v[0] = r1;
              if (v[1] === '') v[1] = r2;
              $input.parent().removeClass('has-error');
              // treat date as UTC time at midnight
              var strTime = function(x) {
                var s = type === 'date' ? 'T00:00:00Z' : '';
                var t = new Date(x + s).getTime();
                // add 10 minutes to date since it does not hurt the date, and
                // it helps avoid the tricky floating point arithmetic problems,
                // e.g. sometimes the date may be a few milliseconds earlier
                // than the midnight due to precision problems in noUiSlider
                return type === 'date' ? t + 3600000 : t;
              };
              if (inArray(type, ['date', 'time'])) {
                v[0] = strTime(v[0]);
                v[1] = strTime(v[1]);
              }
              filter.val(v);
            }
          });
          var formatDate = function(d) {
            if (type === 'number') return d;
            if (type === 'integer') return parseInt(d);
            var x = new Date(+d);
            if (type === 'date') {
              var pad0 = function(x) {
                return ('0' + x).substr(-2, 2);
              };
              return x.getUTCFullYear() + '-' + pad0(1 + x.getUTCMonth())
                      + '-' + pad0(x.getUTCDate());
            } else {
              return x.toISOString();
            }
          };
          var opts = type === 'date' ? { step: 60 * 60 * 1000 } :
                     type === 'integer' ? { step: 1 } : {};
          filter = $x.noUiSlider($.extend({
            start: [r1, r2],
            range: {min: r1, max: r2},
            connect: true
          }, opts));
          $span1.text(formatDate(r1)); $span2.text(formatDate(r2));
          var updateSlider = function(e) {
            var val = filter.val();
            // turn off filter if in full range
            $td.data('filter', val[0] != r1 || val[1] != r2);
            var v1 = formatDate(val[0]), v2 = formatDate(val[1]), ival;
            if ($td.data('filter')) {
              ival = v1 + ' ... ' + v2;
              $input.attr('title', ival).val(ival).trigger('input');
            } else {
              $input.attr('title', '').val('');
            }
            $span1.text(v1); $span2.text(v2);
            if (e.type === 'slide') return;  // no searching when sliding only
            if (server) {
              table.column(i).search($td.data('filter') ? ival : '').draw();
              return;
            }
            table.draw();
          };
          filter.on({
            set: updateSlider,
            slide: updateSlider
          });
        }

        // server-side processing will be handled by R (or whatever server
        // language you use); the following code is only needed for client-side
        // processing
        if (server) {
          // if a search string has been pre-set, search now
          if (searchCol) table.column(i).search(searchCol).draw();
          return;
        }

        var customFilter = function(settings, data, dataIndex) {
          // there is no way to attach a search function to a specific table,
          // and we need to make sure a global search function is not applied to
          // all tables (i.e. a range filter in a previous table should not be
          // applied to the current table); we use the settings object to
          // determine if we want to perform searching on the current table,
          // since settings.sTableId will be different to different tables
          if (table.settings()[0] !== settings) return true;
          // no filter on this column or no need to filter this column
          if (typeof filter === 'undefined' || !$td.data('filter')) return true;

          var r = filter.val(), v, r0, r1;
          if (type === 'number' || type === 'integer') {
            v = parseFloat(data[i]);
            // how to handle NaN? currently exclude these rows
            if (isNaN(v)) return(false);
            r0 = parseFloat(r[0]); r1 = parseFloat(r[1]);
            if (v >= r0 && v <= r1) return true;
          } else if (type === 'date' || type === 'time') {
            v = new Date(data[i]);
            r0 = new Date(+r[0]); r1 = new Date(+r[1]);
            if (v >= r0 && v <= r1) return true;
          } else if (type === 'factor') {
            if (r.length === 0 || inArray(data[i], r)) return true;
          } else if (type === 'logical') {
            if (r.length === 0) return true;
            if (inArray(data[i] === '' ? 'na' : data[i], r)) return true;
          }
          return false;
        };

        $.fn.dataTable.ext.search.push(customFilter);

        // search for the preset search strings if it is non-empty
        if (searchCol) {
          if (inArray(type, ['factor', 'logical'])) {
            filter[0].selectize.setValue(JSON.parse(searchCol));
          } else if (type === 'character') {
            $input.trigger('input');
          } else if (inArray(type, ['number', 'integer', 'date', 'time'])) {
            $input.trigger('change');
          }
        }

      });

    }

    // highlight search keywords
    var highlight = function() {
      var body = $(table.table().body());
      // removing the old highlighting first
      body.unhighlight();

      // don't highlight the "not found" row, so we get the rows using the api
      if (table.rows({ filter: 'applied' }).data().length === 0) return;
      // highlight gloal search keywords
      body.highlight($.trim(table.search()).split(/\s+/));
      // then highlight keywords from individual column filters
      if (filterRow) filterRow.each(function(i, td) {
        var $td = $(td), type = $td.data('type');
        if (type !== 'character') return;
        var $input = $td.children('div').first().children('input');
        var column = table.column(i).nodes().to$(),
            val = $.trim($input.val());
        if (type !== 'character' || val === '') return;
        column.highlight(val.split(/\s+/));
      });
    };

    if (options.searchHighlight) {
      table
      .on('draw.dt.dth column-visibility.dt.dth column-reorder.dt.dth', highlight)
      .on('destroy', function() {
        // remove event handler
        table.off( 'draw.dt.dth column-visibility.dt.dth column-reorder.dt.dth' );
      });

      // initial highlight for state saved conditions and initial states
      highlight();
    }

    // initialize extensions
    for (var ext in data.extOptions) {
      new $.fn.dataTable[ext](table, data.extOptions[ext] || {});
    }

    // run the callback function on the table instance
    if (typeof data.callback === 'function') data.callback(table);

    // interaction with shiny
    if (!HTMLWidgets.shinyMode) return;

    var changeInput = function(id, data) {
      Shiny.onInputChange(el.id + '_' + id, data);
    };

    var addOne = function(x) {
      return x.map(function(i) { return 1 + i; });
    };

    var unique = function(x) {
      var ux = [];
      $.each(x, function(i, el){
        if ($.inArray(el, ux) === -1) ux.push(el);
      });
      return ux;
    }

    // selected rows
    var selected = [], selectedRows = function() {
      var rows = table.rows('.selected', {search: 'applied'});
      // return the first column in server mode, and row indices in client mode
      if (!server) return addOne(rows.indexes().toArray());
      var ids = rows.data().toArray().map(function(d) {
        return d[0];  // assume the first column is row names
      });
      selected = unique(selected.concat(ids));
      return selected;
    };
    var selection = inArray(data.selection, ['single', 'multiple']);
    var selClass = data.style === 'bootstrap' ? 'active' : 'selected';
    if (selection) table.on('click.dt', 'tr', function() {
      var $this = $(this), thisRow = table.row(this);
      if (data.selection === 'multiple') {
        $this.toggleClass(selClass);
      } else {
        if ($this.hasClass(selClass)) {
          $this.removeClass(selClass);
        } else {
          table.$('tr.' + selClass).removeClass(selClass);
          $this.addClass(selClass);
        }
      }
      if (server && !$this.hasClass(selClass)) {
        var id = thisRow.data()[0];
        // remove id from selected since its class .selected has been removed
        selected.splice($.inArray(id, selected), 1);
      }
      changeInput('rows_selected', selectedRows());
      changeInput('row_last_clicked', server ? thisRow.data()[0] : thisRow.index() + 1);
    });
    changeInput('rows_selected', selectedRows());
    // restore selected rows after the table is redrawn (e.g. sort/search/page);
    // client-side tables will preserve the selections automatically; for
    // server-side tables, we have to check if the row name is in `selected`
    if (server) table.on('draw.dt', function() {
      table.rows({page: 'current'}).every(function() {
        if (inArray(this.data()[0], selected)) {
          $(this.node()).addClass(selClass);
        }
      });
    });

    // expose some table info to Shiny
    var updateTableInfo = function(e, settings) {
      // TODO: is anyone interested in the page info?
      // changeInput('page_info', table.page.info());
      var updateRowInfo = function(id, modifier) {
        var rows = table.rows($.extend({
          search: 'applied',
          page: 'all'
        }, modifier));
        var idx;
        if (server) {
          idx = rows.data().toArray().map(function(x) { return x[0]; });
        } else {
          idx = addOne(rows.indexes().toArray());
        }
        changeInput('rows' + '_' + id, idx);
      };
      updateRowInfo('current', {page: 'current'});
      updateRowInfo('all', {});
    };
    table.on('draw.dt', updateTableInfo);
    updateTableInfo();

    // state info
    table.on('draw.dt', function() {
      changeInput('state', table.state());
    });
    changeInput('state', table.state());

    // search info
    var updateSearchInfo = function() {
      changeInput('search', table.search());
      if (filterRow) changeInput('search_columns', filterRow.toArray().map(function(td) {
        return $(td).find('input').first().val();
      }));
    }
    table.on('draw.dt', updateSearchInfo);
    updateSearchInfo();
  }
});

</script>


