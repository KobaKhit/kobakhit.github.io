---
layout: post
title: 'Linear optimization and baseball teams'
author: '<a href="https://www.linkedin.com/in/mcintyrejordan">Jordan McIntyre</a>, <a href="https://www.linkedin.com/in/manish-sharma-50318a34">Manish Sharma</a> and <a href="http://www.kobakhit.com/about/">Koba Khitalishvili</a>'
categories: intermediate
tags: "r opr linear-optimization integer datatable  rmarkdown"
rmd: "/ipynb/2016-2-18-linear-opt-baseball.zip"
rpubs: "http://rpubs.com/Koba/linear-opt-baseball"
reddit: "https://redd.it/49mfxu"
---

We try to use Integer Linear Programming to build a perfect 25 men roster baseball team. We present our best team below which is the solution of the ILP model we built using the 2015 MLB season player data. If you understand baseball please evaluate our resulting baseball team and drop a comment, so that we know whether ILP can be used to get a decent baseball team. After the table I describe how we arrived at our solution.


<p class = "muted">
Edit: The choice of statistics for our utility index is almost random. The main goal was to model the  general constraints and objective function. This code allows to easily add desired statistics and extend the general case to include more sophisticated preferences, for example using the weight vector.
</p>

<style>
.dataTable {
font-size: 14px;
}

table.dataTable tbody td {
padding:2px 8px !important;
}

@media (max-width: 670px ) {
  table.dataTable tbody td {
  padding:6px 8px !important;
}
}
</style>

<div id="htmlwidget-9554" style="width:100%;height:auto;" class="datatables"></div>
<script type="application/json" data-for="htmlwidget-9554">{"x":{"data":[["25","24","23","22","21","20","19","18","17","16","15","14","13","12","11","10","9","8","7","6","5","4","3","2","1"],["   507,500","   509,000","   509,500","   519,500","   535,000","   543,000","   547,100"," 2,500,000"," 2,500,000"," 2,725,000"," 3,083,333"," 3,200,000"," 3,630,000"," 4,300,000"," 6,000,000"," 6,083,333"," 7,000,000"," 7,000,000"," 8,050,000","10,500,000","14,000,000","17,142,857","17,277,777","19,750,000","31,000,000"],["Dellin Betances","Matt Duffy","Carson Smith","A.J. Pollock","Trevor Rosenthal","Xander Bogaerts","Cody Allen","Dee Gordon","Bryce Harper","Lorenzo Cain","Paul Goldschmidt","Zach Britton","Jake Arrieta","Josh Donaldson","Chris Sale","Mike Trout","Russell Martin","Wade Davis","Aroldis Chapman","Yoenis Cespedes","Joey Votto","Max Scherzer","Buster Posey","David Price","Clayton Kershaw"],["Closer","2B","Closer","OF","Closer","SS","Closer","2B","OF","OF","1B","Closer","SP","3B","SP","OF","C","Closer","Closer","OF","1B","SP","C","SP","SP"],["Yankees","Giants","Mariners","Diamondbacks","Cardinals","Red Sox","Indians","Marlins","Nationals","Royals","Diamondbacks","Orioles","","Blue Jays","","Angels","Blue Jays","Royals","Reds","- - -","Reds","","Giants","",""],["0.2327","0.3911","0.2327","0.5505","0.2327","0.3396","0.2327","0.3772","1.0000","0.4921","0.7772","0.2327","0.2327","0.7109","0.2327","0.8307","0.2693","0.2327","0.2327","0.5416","0.8000","0.2327","0.4901","0.2327","0.2327"],["0.3713","0.5972","0.3713","0.5422","0.3713","0.5285","0.3713","0.5403","0.2043","0.6798","0.2358","0.3713","0.3713","0.5815","0.3713","0.4126","0.6110","0.3713","0.3713","0.5796","0.1886","0.3713","0.5324","0.3713","0.3713"]],"container":"<table class=\"display\">\n  <thead>\n    <tr>\n      <th> </th>\n      <th>Salary</th>\n      <th>Name</th>\n      <th>POS</th>\n      <th>Team</th>\n      <th>Off.norm</th>\n      <th>Def.norm</th>\n    </tr>\n  </thead>\n</table>","options":{"order":[[1,"desc"]],"pageLength":25,"dom":"fti","autoWidth":false,"orderClasses":false,"columnDefs":[{"orderable":false,"targets":0}],"responsive":true},"callback":null,"caption":"<caption>Best 25 man team</caption>","filter":"none","extensions":["Responsive"]},"evals":[]}</script>

<br>

# Prerequisites

To follow the process of us setting up the ILP model you should have familitarity with
  
  - Linear algebra
  - Linear optimization
  - Integer programming

# Data preprocessing
Let's read in the 2015 regular season player level data. 

```r
dat = read.csv("Baseball Data.csv")
head(dat[,1:4])
```

```
##     Salary              Name      POS Bats
## 1   510000      Joc Pederson       OF    L
## 2   512500      Stephen Vogt       1B    L
## 3  3550000      Wilson Ramos        C    R
## 4 31000000   Clayton Kershaw       SP     
## 5 15000000    Jhonny Peralta       SS    R
## 6  2000000 Carlos Villanueva Reliever
```
The dataset has 199 rows (players). There were `NA's` for some players and their game statistics which we replaced with 0. The reason we replaced the missing data with zeros is that when we construct the player utility index missing data won't count towards or against players.

```r
dat[is.na(dat)] = 0
```

Each baseball player has game statistics associated with them. Below is the list of player level data.


```r
names(dat)
```

```
##  [1] "Salary"   "Name"     "POS"      "Bats"     "Throws"   "Team"    
##  [7] "G"        "PA"       "HR"       "R"        "RBI"      "SB"      
## [13] "BB."      "K."       "ISO"      "BABIP"    "AVG"      "OBP"     
## [19] "SLG"      "wOBA"     "wRC."     "BsR"      "Off"      "Def"     
## [25] "WAR"      "playerid"
```
You can see the statistics description in the collapsible list below or [appendix](#Appendix).

{% capture basestat %}
  - PA - Plate appearance: number of completed batting appearances
  - HR - Home runs: hits on which the batter successfully touched all four bases, without the contribution of a fielding error
  - R - Runs scored: number of times a player crosses home plate
  - RBI - Run batted in: number of runners who score due to a batters' action, except when batter grounded into double play or reached on an error
  - SB - Stolen base: number of bases advanced by the runner while the ball is in the possession of the defense
  - ISO - Isolated power: a hitter's ability to hit for extra bases, calculated by subtracting batting average from slugging percentage
  - BABIP - Batting average on balls in play: frequency at which a batter reaches a base after putting the ball in the field of play. Also a pitching category
  - AVG - Batting average (also abbreviated BA): hits divided by at bats 
  - OBP - On-base percentage: times reached base divided by at bats plus walks plus hit by pitch plus sacrifice flies 
  - SLG - Slugging average: total bases achieved on hits divided by at-bats
  - wOBA - Some argue that the OPS, on-base plus slugging, formula is flawed and that more weight should be shifted towards OBP (on-base percentage). The statistic wOBA (weighted on-base average) attempts to correct for this.
  - wRC. - Weighted Runs Created (wRC): an improved version of Bill James' Runs Created statistic, which attempted to quantify a player's total offensive value and measure it by runs.
  - BsR - Base Runs: Another run estimator, like Runs Created; a favorite of writer Tom Tango
  - WAR - Wins above replacement: a non-standard formula to calculate the number of wins a player contributes to his team over a "replacement-level player"
  - Off - total runs above or below average based on offensive contributions (both batting and baserunning)
  - Def - total runs above or below average based on defensive contributions (fielding and position). 
{% endcapture %}

<ul class="collapsible" data-collapsible="accordion">
<li>
<div class="collapsible-header hoverable">
<b>Baseball statistics abbreviations</b>
</div>

<div class="collapsible-body" style="padding:10px 0">
{{ basestat | markdownify }}
</div>
</li>
</ul>

Since the game statistics are in different units we standardize the data by subtracting the mean and dividing by the standard deviation, $x\_{changed} = \frac{x-\mu}{s}$. Additionaly, we add two new variables
`Off.norm` and `Def.norm` which are normalized `Off` and `Def` ratings using the formula
$x\_{changed}=\frac{x-min(x)}{max(x)-min(x)}$. We use the normalized offensive and defensive ratings to quickly evaluate the optimal team according to the ILP.


```r
# select numeric columns and relevant variables
dat.scaled = scale(dat[,sapply(dat, class) == "numeric"][,c(-1:-2,-19)])

# normalize Off and Def
dat$Off.norm = (dat$Off-min(dat$Off))/(max(dat$Off)-min(dat$Off))
dat$Def.norm = (dat$Def-min(dat$Def))/(max(dat$Def)-min(dat$Def))

head(dat.scaled[,1:4])
```

```
##              PA         HR          R        RBI
## [1,]  0.9239111  1.2879067  0.7024833  0.4469482
## [2,]  0.6851676  0.6505590  0.4831027  0.8744364
## [3,]  0.6625837  0.4115537  0.0687172  0.7989973
## [4,] -0.9634531 -0.7834733 -0.9306832 -0.9109555
## [5,]  1.1013556  0.5708906  0.6293565  0.8744364
## [6,] -0.9634531 -0.7834733 -0.9306832 -0.9109555
```

Now that we have scaled player stats we will weigh them and add them up to obtain the player utility index $U\_i$ for player $i$ to use it in the objective function.

$U\_i(x) = w\_{1}\text{PA}\_i+w\_{2}\text{HR}\_i+w\_{3}\text{R}\_i+w\_{4}\text{RBI}\_i+w\_{5}\text{SB}\_i+w\_{6}\text{ISO}\_i+w\_{7}\text{BABIP}\_i+w\_{8}\text{AVG}\_i+w\_{9}\text{OBP}\_i+w\_{10}\text{SLG}\_i+w\_{11}\text{wOBA}\_i+w\_{12}\text{wRC.}\_i+w\_{13}\text{BsR}\_i+w\_{14}\text{Off}\_i+w\_{15}\text{Def}\_i+w\_{16}\text{WAR}\_i$

$\text{ for player } i \text{ where } i \in \\{1,199\\}$

By introducing weights we can construct the weight vector which best suits our preferences.
For example, if we wanted the player utility index to value the offensive statistics like 
`RBI` more than the defensive statistics like `Def` we would just assign a bigger weight to RBI. We decided
to value each statistic equally, i.e. weights are equal.

# Constraint modelling
In baseball there are 25 active men roster and 40 men roster that includes the 25 men active roster. To start a new team we 
focus on building the perfect 25 men roster. Typically, a 25 men roster will 
consist of five starting pitchers (SP), seven relief pitchers (Reliever), two catchers (C), six 
infielders (IN), and five outfielders (OF). Current position variable `POS` has more than 5 aforementioned groups. We group them in the `POS2` variable by the five types SP, Reliever, C, IN, OF.


```r
position = function(x){ # given position x change x to group
  if(x %in% c("1B","2B","3B","SS")) x = "IN"
  else if(x %in% c("Closer")) x = "Reliever"
  else x=as.character(x)
}

dat$POS2 = sapply(dat$POS, position)
```

Additionally, we will make sure that our 25 men active roster has at least one player of each of the following positions: first base (1B), second base (2B), third base (3B) and Short stop (SS).

There is no salary cap in the Major League Baseball association, but rather a 
threshold of 189\$ million for the 40 men roster for period 2014-2016 beyond which a luxury tax applies. 
For the first time violators the tax is 22.5% of the amount they were 
over the threshold. We decided that we would allocate 178$ million for the 25 men roster.

To model the above basic constraints and an objective function we came up
with the player utility index $U(x\_1,x\_2,...,x\_n)$ which is a function of the chosen set
of $n$ player game statistics, 16 in our case. In our model we maximize the sum of the player utility indices. We have 16 game statistics of interest which are

PA, HR, R, RBI, SB, ISO, BABIP, AVG, OBP, SLG, wOBA, wRC., BsR, Off, Def, WAR, Off.norm, Def.norm

Below is the resulting model.

$$
\begin{align}
\text{max } & \sum^{199}\_{i=1}U\_i\*x\_i \\\\
\text{s. t. } & \sum^{199}\_{i=1}x\_i = 25 \\\\
& \sum x\_{\text{SP}} \ge 5 \\\\
& \sum x\_{\text{Reliever}} \ge 7 \\\\
& \sum x\_{\text{C}} \ge 2 \\\\
& \sum x\_{\text{IN}} \ge 6 \\\\
& \sum x\_{\text{OF}} \ge 5 \\\\
& \sum x\_{\text{POS}} \ge 1 \text{ for } POS \in \\{\text{1B,2B,3B,SS}\\}\\\\
& \sum x\_{\text{LeftHandPitchers}} \ge 2 \\\\
& \sum x\_{\text{LeftHandBatters}} \ge 2 \\\\
& \frac{1}{25} \sum Stat\_{ij}x\_{i} \ge mean(Stat\_{j}) \text{ for } j = 1,2,...,16 \\\\
& \sum^{199}\_{i=1}salary\_i\*x\_i \le 178
\end{align}
$$

where 

  - $U\_i$- utility index for player $i$, $i \in \\{1,199\\}$
  - $x\_i$ - a binary variable which is one if player $i$ is selected
  - $x\_{\text{SP}}, x\_{\text{Reliever}}$, etc. - binary variables that are one if player $i$ has the specified attribute such as Starting pitcher (SP), left hand pitcher, etc.
  - $x\_{\text{POS}}$ - binary variable which is one if player $i$ plays the position $POS$, $POS \in \\{\text{1B,2B,3B,SS}\\}$
  - $Stat\_{ij}$ - game statistic $j$ for player $i$, $j \in \\{1,16\\}$
  - $mean(Stat\_{j})$ - the average of the statistic $j$ across all players
  - $salary\_i$ - salary for player $i$ in dollars
  
Constraint (2) ensures that we get 25 players. Constraints (3) through (10) ensure that number of players
with certain attributes meets the required minimum. Collection of constraints (11)
makes sure that our team's average game stastistics outperform the average game statistics across all
players. Constraint (12) ensures that we stay within our budget including the luxury tax.

Below is the solution of this programm.

```r
library("lpSolve")

i = 199 # number of players (variables)

# constraints
cons = rbind(
  rep(1,i), # 25 man constraint (2)
  sapply(dat$POS2, function(x) if (x == "SP") x=1 else x=0), # (3)
  sapply(dat$POS2, function(x) if (x == "Reliever") x=1 else x=0), # (4)
  sapply(dat$POS2, function(x) if (x == "C") x=1 else x=0), # (5)
  sapply(dat$POS2, function(x) if (x == "IN") x=1 else x=0), # (6)
  sapply(dat$POS2, function(x) if (x == "OF") x=1 else x=0), # (7)
  sapply(dat$POS, function(x) if (x == "1B") x=1 else x=0), # (8)
  sapply(dat$POS, function(x) if (x == "2B") x=1 else x=0), # (8)
  sapply(dat$POS, function(x) if (x == "3B") x=1 else x=0), # (8)
  sapply(dat$POS, function(x) if (x == "SS") x=1 else x=0), # (8)
  sapply(dat$Throws, function(x) if (x == "L") x=1 else x=0), # (9)
  sapply(dat$Bats, function(x) if (x == "L") x=1 else x=0), # (10)
  t(dat[,colnames(dat.scaled)])/25, # (11) outperform the average
  dat$Salary/1000000 # (12) budget constraint
)

# model
f.obj = apply(dat.scaled,1,sum)
f.dir = c("=",rep(">=",27),"<=")
f.rhs = c(25,5,7,2,6,5,2,2,rep(1,4),
          apply(dat[,colnames(dat.scaled)],2,mean),
          178)

model = lp("max", f.obj, cons, f.dir, f.rhs, all.bin=T,compute.sens=1)
model
```

```
## Success: the objective function is 135.6201
```

```r
sol = model$solution
sol
```

```
##   [1] 0 0 0 1 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 1 0 0 1 0 0 0 0 0 0
##  [36] 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0
##  [71] 1 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
## [106] 0 0 1 1 0 0 0 1 0 1 0 0 0 1 0 1 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 1 0
## [141] 0 1 1 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0
## [176] 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0
```

Let's look at our ideal baseball team given the constraints outlined above.

```r
# selected players
dat[which(sol>0),c(1:3,6,28:29)]
```

```
##       Salary             Name    POS         Team  Def.norm     POS2
## 4   31000000  Clayton Kershaw     SP              0.3713163       SP
## 8    6083333       Mike Trout     OF       Angels 0.4125737       OF
## 24  19750000      David Price     SP              0.3713163       SP
## 26    507500  Dellin Betances Closer      Yankees 0.3713163 Reliever
## 29    509000       Matt Duffy     2B       Giants 0.5972495       IN
## 53  17142857     Max Scherzer     SP              0.3713163       SP
## 54  17277777     Buster Posey      C       Giants 0.5324165        C
## 62    509500     Carson Smith Closer     Mariners 0.3713163 Reliever
## 71    519500     A.J. Pollock     OF Diamondbacks 0.5422397       OF
## 83    535000 Trevor Rosenthal Closer    Cardinals 0.3713163 Reliever
## 87    547100       Cody Allen Closer      Indians 0.3713163 Reliever
## 108  2500000       Dee Gordon     2B      Marlins 0.5402750       IN
## 109  2500000     Bryce Harper     OF    Nationals 0.2043222       OF
## 113  2725000     Lorenzo Cain     OF       Royals 0.6797642       OF
## 115  3083333 Paul Goldschmidt     1B Diamondbacks 0.2357564       IN
## 119  3200000     Zach Britton Closer      Orioles 0.3713163 Reliever
## 121  3630000     Jake Arrieta     SP              0.3713163       SP
## 129  4300000   Josh Donaldson     3B    Blue Jays 0.5815324       IN
## 139  6000000       Chris Sale     SP              0.3713163       SP
## 142  7000000   Russell Martin      C    Blue Jays 0.6110020        C
## 143  7000000       Wade Davis Closer       Royals 0.3713163 Reliever
## 150  8050000  Aroldis Chapman Closer         Reds 0.3713163 Reliever
## 163 10500000  Yoenis Cespedes     OF        - - - 0.5795678       OF
## 176 14000000       Joey Votto     1B         Reds 0.1886051       IN
## 194   543000  Xander Bogaerts     SS      Red Sox 0.5284872       IN
```

Seems like a decent team with the mean normalized offensive and defensive ratings of
0.414495 and 0.4275835 respectively. 
For comparison mean normalized offensive and defensive ratings for all players are 
0.3019702 and 0.3821564 respectively. Our team outperforms the average and its mean offensive and defensive ratings are better than $82.9145729$%  and $78.3919598$%  of other players correspondingly.

<img src="data:image/png;base64,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ARIgARIgARIgARLIDAEKoJnhylhJgARIgARIgARIgARiECgWw5/eCQg88cQTMnz4cClXrlyCkDxNAiTghUCJEiXkrbfekrJly3q5nNf4mADbTx9XDrMWCgJBaD+LWMqFgnaWC9G0aVO57777KIBmmTuTyx8CLVu2lM8//1waNGiQP4XOk5Ky/cyTimYxc0YgCO0nNaAeb49ixYrJvvvuK8cdd5zHGHgZCZBAPAKHH354vNM8F2ACbD8DXHnMeiAIBKH95BjQQNxKzCQJkAAJkAAJkAAJhIcABdDw1CVLQgIkQAIkQAIkQAKBIEABNBDVxEySAAmQAAmQAAmQQHgIcAxoVF2OGzdObr755ijfgoc//vijTJ06VZo3b17wJH1IgARIIA8JsP3Mw0pnkUnAIwEKoFHg2rdvL82aNYvyLXhYt25dKV++fMET9CEBEiCBPCXA9jNPK57FJgEPBCiARkErXbq04JfI7bXXXoKZnHQkQAIkQAL/EGD7yTuBBEggWQIcA5osKYYjARIgARIgARIgARJICwEKoGnByEhIgARIgARIgARIgASSJUABNFlSDEcCJEACJEACJEACJJAWAhRA04IxPyJ55ZVXpEiRIrJ58+b8KDBLSQIkQAIkQAIkkBECFEAzgjWckcLECiZfDRkyJJwFZKlIgARIgARIgASyQoACaFYwhyORxYsXy3PPPSfz588PR4FYChIgARIgARIggZwQoACaE+zBS3T79u3y008/acP73377bfAKwByTAAmQAAmQAAn4hgAFUN9Uhb8zsmLFCqlWrZrUqlVLVq1aJbt37/Z3hpk7EiABEiABEiAB3xKgAOrbqvFXxiCA1qxZU/bee2+pUKGCrF692l8ZZG5IgARIgARIgAQCQ4ACaGCqKrcZhdYT2k84CKI4piMBEiABEiABEiABLwQogHqhlofXQONZqVIlXfIqVaro8aB5iIFFJgESIAESIAESSAMBCqBpgJgPUfzyyy9SuXJlXVQIomvWrMmHYrOMJEACJEACJEACGSBAATQDUMMYJQROowGlABrGGmaZSIAESIAESCB7BCiAZo91oFNau3atVK1aVZcBXfA4piMBEiABEiABEiABLwQogHqhlofXQOA8+OCDdcnLly9PATQP7wEWmQRIgARIgATSRYACaLpIhjiePXv2yKZNm+TAAw/UpYQgun79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AS7TaWUyfmOSKZNpMO7MEEgogNaoUUN++OEHO/UjjjhCPvnkE328//776+3q1avt89wJB4FUBFDcB9SAhqPeWQoSIIH8IBD07ndTSxdccIEeGoheWbpgEUgogGJwMsZ7duvWTQsZOIa9MIwFffDBB+Xggw/WqyEFq9jMbSICMMEFzWYyjhrQZCgxDAmQAAn4g8A333wj69evl9atW/sjQ4XIBdaux3BAmmQqBMQcXZpQAK1YsaKeZYalurDme69evfSY0AYNGmhj9ah4dMfThYsAPjrKli2bVKEogCaFiYFIgARIwBcEoP3s0aOH7LVXQhHAF/lNlImrr75aMKQAihO64BBI6u7DqgM//vijYElOmD7AMpxjx46VpUuXyl133eWb0m7dulUwa5+u8ARS7YJHeDoSIIHgEmD7Gdy6SyXnO3bs0MIaBNCwOMgl7du318qysJQpH8qRlAAKEFBzY7UbCJ+//fabnHPOOVKzZk1fMZo4caI0atTIV3kKamZSEUChAd24cWNQi8p8kwAJKAJsP/PjNpgwYYI0a9ZMqlWrFqoCQws6bNiwUJUp7IVJyhA9jM1fd911gm5449A9e+utt+ofDNlmyz388MOycuVK1+S+//57wVf8Nddco88fc8wxupvBNTA94xLASkiwepCM4ySkZCgxDAnkngDbz9zXQa5zgO53847MdV7Smf4JJ5wgJUqUkOnTp0urVq3SGTXjyhCBhJIjxlRAtY2Kff755+Wwww6TZcuWaWH0/vvv1wbIMRkpW27OnDny6quvCoSeKlWqRCSLcYt///23fPTRR9q/ePHiEed5kDyBVDSgMEQPrTgdCZCAvwmw/fR3/WQ6d7DnvXDhQr24TKbTykX8vXv31obpKYDmgn7qaSYUQLEM56pVqwTaRdPlftJJJ0n37t3l7bff1l3x9957r2RL2BszZowcffTRMmjQIG1A98Ybb7QHUo8ePVr69u0r3377beokeEUEAWpAI3DwgARCQYDtZyiq0XMhoESC4XmsahhG969//Utuu+02+fnnnwsoqMJY3qCXKeEYUBiih2rbCJ/OAuMrAxpHzI7PlsOsvdtvv10+/PBDrZFt2bKlFpCzlX6+pJOKGSZ2wefLXcFyBp0A28+g16D3/O/evVtGjBghl112mfdIfH5l6dKlBULo008/7fOcMnsgkFAAbdGihdYoQnUf7bA0Z/Xq1eXQQw+NPpXx48aNG+sJUfXq1dMa0ZEjR2Y8zXxKAIblscRmMg7hMLMSDRwdCZCA/wmw/fR/HaU7h++8847UqlVLsJhMmB0mI3GFxmDUsGsX/FdffaU1jKYIML9Uv359gbaxbdu2UrJkSS38YTDzzTffbIJlfVuqVCk9661Dhw56shHyRZceAql0wSNFMxO+fPny6ckAYyEBEsgoAbafGcXru8jR/d6zZ0/f5SvdGTryyCMFP1h1uPDCC9MdPeNLIwFXAfTTTz/VRuad6RQtWlRmzpypf8Yf4z6feOIJGThwoPHKyRYCKMZ9YqY+VnegKzwBTOiCUJmsO/DAA7UpJgqgyRJjOBLwBwG2n/6oh0zmAkPpZs2ape1/ZjIdv8QNLShWRqIA6pcacc+HqwB67bXXCn5BchB8XnnllSBl2bd53b59u8C0VioD1TkT3rfVTw5lHQAAM5pJREFUyYyRQEICbD8TIgp0gBdffFGwoAzGSOaDO/vss6VPnz6yaNEiqVu3bj4UOZBldBVAY5UEqwzBBFOlSpX0qkh+XsYLk2ggRKXaLf/DDz/I7NmzYyGw/TH5Cob5w+hS7X4HA6MBDSMPlokE8o0A289w1TiGy8F8Yb44vPuxTPjQoUP1L1/KHbRyJiWArlixQs+c++CDD+zyYfwQKnjIkCG+XAv+kEMOkdNOO00vGWpnOokdLDn65ptvJgyJCTfbtm1LGC6IAWADFDPbU3EHH3wwbYGmAoxhScDHBNh++rhyUswaLMZA89m0adMUrwx28CuuuEIwSfmBBx6QMmXKBLswIc19QgH0r7/+Eqizoe3DykcYL4SvC4wHhSF6LNE5ePBg3+GB+h1G81N1p5xyiuCXyMEGaljHO2L8J1a6SsWhC57jb1MhxrAk4F8CbD/9Wzep5gzazzCbXorFo3LlynpFJNgH79WrV6xg9M8hgYQCKAzRY4IPfkcddZSd1ebNm2vNJzSgfhRABwwYYOeVO6kRSHUCEmI/6KCDZMOGDaklxNAkQAK+JMD205fVknKm0JZDWYLJwvnoMBkJk5MpgPqz9hPaAcU68E2aNIkQPk1RunXrJr/++qtg3GSunGVZWvPGpSDTVwMUQNPHkjGRgJ8JsP30c+0UPm8vvfSSXkobPVT56E499VS9WA4sAND5j0BCARTrrc+bN08wASna4csK5pkqVqwYfSqjx1hmC8MBYAQfQwDQFY5JMOXKlZMGDRoIlucM6wShjIL9X+QUQLNBmWmQQG4IsP3MDfdcpJqv3e9O1mZ9eKcf9/1BIGEXfJs2bbRwBwO2Dz74oDbwunPnTm1TrH///tKpU6eUZ5oXpuhYl/7EE0/U3f8wK4ElQvF1V6RIET0JBtrY8ePHy4QJE2T69Ol65YfCpJeP13oRQPERwC74fLxbWOYgEWD7GaTaKlxe58yZI5hQigVk8tl17dpV7rrrLlm3bp1UqFAhn1H4ruwJBVAss4glN7G+aqNGjbSgh24buNatW+uViLJZqoceekhrPjE2FYbw3dygQYOkXbt2MmrUqAIG9d3C0y+SgBcBFLPg165dGxkRj0iABHxFgO2nr6ojo5nBykcQvqCcyWcHGQYG6bE855133pnPKHxX9oRd8BBGVq5cKVieE2aYhg0bJiNGjNC2MqdNmyYQPLLpMBygS5cuMYVP5AUG1DE+dcqUKdnMWmjSQp1jSEMqDhpQjAemIwES8C8Btp/+rZt05mzx4sUybtw4PQEnnfEGNS5MRnr66acF5hPp/EMgoQD6zjvvSOfOnWXr1q3SokULueqqq7Rw16xZs5yU4vjjj5dPPvkkYdozZswQjF+lS50AJnRhPG0qDl+ZMNm1Y8eOVC5jWBIggSwSYPuZRdg5TApzJG6//faUllPOYXYznjTmhsC27VtvvZXxtJhA8gQSdsHDvA4cVsepWrVq8jFnKCSEYTSiGM9xySWX6DGe0NZhVSYITtDWjhkzRiZPnizopqdLncCmTZtSNkSPVDAZDd3w1dXkMDoSIAH/EWD76b86SXeOYKN7/vz5ei5EuuMOcnzQgqIHF3bN6fxBIKEA2rBhQ60BPfnkk/WEo1q1ahXo/r7hhhuyVhrkBw8XVmHC+JY9e/YUSBtjU6dOnZqUQfkCF9NDCiOAohueAihvIhLwJwG2n/6sl3TlCvMzYAUGtrlhIYbu/wQwablv376ydOlST4vU/D8m7qWLQEIBdO7cufLGG2/o9F555RXXdLMpgCIDtWvX1jPc0eWLpTOh9cTa7Fj5AFraVMcvuhYqjz0LI4D+8ssveUyORScB/xNg++n/OvKaw7FjxwqEUEy6oYskAIEc1nyGDx8ujzzySORJHuWEQEIBtG3btnr8Z05ylyBR3FBoTPGjSx+BwgignAmfvnpgTCSQSQJsPzNJN/txQyFz2223yYsvvpj3M99j0ceKSOgFGDhwYFbNR8bKT777J5yE5AQE+5/QiLoZpXeG436wCWC8r5eVMypVqiRr1qwJduGZexIgARIIIAGMb6xXrx6HnsWpO0xEgh3xl19+OU4onsoWgaQE0PXr1+vlvMqUKSPHHHOMnk0GszuPPvpotvLJdLJEACaYSpcurSd1pZokhj9QA5oqNYYnARIggcIRgNIAWj0sFkMXn4CZjBQ/FM9mg0BCARRq/aZNm8qKFSv04GbY/sTs8j59+ki/fv30CgPZyCjTyA4BWBLwov1E7mD2Ciut0JEACZAACWSPABZfwezuunXrZi/RgKaE1R0xzOyLL74IaAnCk+2EY0BnzZqlTR4tX75cT/IxRW/VqpWULVtWf3VhSU6YQaILPoHCCKDQgK5evTr4EFgCEiABEggIAQyJwyo/CxcuDEiOc5tNrAwFLejQoUMlV/bMc0vAP6knlBqXLFmil9zEDPNod9FFF+n1vyl0RJMJ7nFhBVDOgg9u3TPnJEACwSNwxx13yDXXXCMYg0+XHIEePXpo6z5439HljkBCART2Pz///HPdBR+dzRdeeEHbfMTAXrpwEMAD6XV51f3331+vhvTnn3+GAwZLQQIkQAI+JvDNN9/Ie++9J7fccouPc+m/rGGYWadOneT555/3X+byKEcJu+BRUZg1htl1EEZhlgmTkWbPni2jR4+Wc845J2Lgc/fu3T0LMHnE3bdFxYQzr2NAUaiaNWvqjxWYuqAjARIgARLIHAEYnccQOLyT6VIjgG549OLedNNNNFuVGrq0hU4ogGLVIayrDptx0ITiZ1yJEiX0kpdY9tK4Dh06UAA1MAK43bBhg5jlV71kHwIoJiJRAPVCj9eQAAmQQHIEoPnE+M/LLrssuQsYKoIAxn9C2TJlyhRp165dxDkeZIdAQgEUM8Zg4oEuPwhAAC3MTMoaNWrIsmXL8gMWS0kCJEACOSCAJaihuYPZpWLFEr7Gc5DDYCTZu3dvPRmJAmhu6ivhGNDcZIup5opAYTWghx9+uGDiGh0JkAAJkEBmCIwaNUrKlSsnZ511VmYSyJNY0QX/2Wef0XxgjuqbAmiOwPs12Y0bNxZqCEWdOnVk6dKlfi0e80UCJEACgSawfft2ufPOO2XIkCGBLocfMl+yZEnp1q2bXh/eD/nJtzxQAM23Gk9Q3nXr1hVqDGj9+vX1cq0JkuFpEiABEiABDwQee+wxad68uRx77LEeruYl0QSwPjxmw2PRHbrsEqAAml3evk8NAmiFChU85xMmnDA57eeff/YcBy8kARIgARIoSABDpB5++GEZPHhwwZP08USgdu3aeonxsWPHerqeF3knQAHUO7vQXYmB7YXtggeUY445hsuche7uYIFIgARyTWDAgAFyySWXSK1atXKdlVClz/Xhc1OdFEBzw92XqeLrGmYpCrusKrqGvvzyS1+WkZkiARIggSASwHLYY8aMkbvvvjuI2fd1njt27KiXkZ43b56v8xm2zFEADVuNFqI86H53W3I11ShbtmwpU6dOTfUyhicBEiABEohB4LbbbtOmlwpjpzlG1HnvXbRoUbnqqqu0Saa8h5FFADQgFgX79ddf1zMMo7wLHG7dulV/MRU4EWAPrONemPGfpugYIL9ixQpZs2YN1yc2ULglgTwgkM/tZyarFysPfvrpp3r1wUymk89xw6A/zAhijC1MXNFlngAF0CjGp556qowbNy7Kt+Bh06ZNpXz58gVPBNgnXQIjDCNjiVYs1eq2RrFlWVz6LMD3CbNOArEI5HP7GYtJOvxvuOEGGTRokJ7gmY74GEdBAnift2/fXl588UW57rrrCgagT9oJUACNQoovn2S+fjBOEsuThsmlSwAFE5i2aNKkiR4wj259PNRPPPGEYBwTxtuMHDlS9t577zDhY1lIIO8J5HP7manKf+ONN2Tz5s1y6aWXZioJxvs/ApiM1LNnTwqgWbojOAY0S6CDkAzGgFapUiUtWW3cuLEWMqtWraonNQ0fPlwPnscg73fffVdgAHjLli1pSYuRkAAJkEAYCezatUtuvfVWeeihhwo9OTSMfNJdphNPPFErlmbMmJHuqBmfCwEKoC5Q8tXrxx9/TMskJMOvS5cugjihWf3iiy+kU6dOUrNmTdm0aZO0bt1arr32WhOUWxIgARIggSgCzz77rBxyyCHSpk2bqDM8zBQBsz58puJnvP8nQAH0/yzyfm/16tUCjWU6XbVq1aRixYoFopw0aZK8//778sEHHxQ4Rw8SIAESyHcC6CHq16+fnhST7yyyWf5//etf+r3ExVQyT50CaOYZByYFzIKHwJgNh/GzmG3473//OxvJMQ0SIAESCBSBBx98UGs+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" title="" alt="" style="display: block; margin: auto;" />

While this is a straightforward way to model the selection of the players there are several
nuances we need to address. One of them is that the standardized game statistics are not
additively independent. As a result, our utility index poorly measures the player's value and is biased. It is possible to construct an unbiased utility index which has been done a lot in baseball (look up sabermetrics). `Off` and `Def`and a lot of other statistics are examples of utility indices. A reddit user suggested a solid way to construct the utility index.

<div class="reddit-embed" data-embed-media="www.redditmedia.com" data-embed-parent="false" data-embed-live="true" data-embed-created="2016-03-09T15:10:49.095Z"><a href="https://www.reddit.com/r/baseball/comments/49mfxu/analysis_help_evaluate_a_team_produced_by_an/d0tcx4u">Comment</a> from discussion <a href="https://www.reddit.com/r/baseball/comments/49mfxu/analysis_help_evaluate_a_team_produced_by_an/">[Analysis] Help evaluate a team produced by an algorithm</a>.</div><script async src="https://www.redditstatic.com/comment-embed.js"></script>

Another issue we need to addrees is when we substituted the missing values with zero. Players with
missing game statistics values have their utility index diminished because one of the stats used to calculate it is zero. However, imputing with zero is better than imputing with the mean in our case.
By imputing with the mean we would introduce new information into the data which may be misleading, ex. g.
a player's game stat is worse/better than the average. As a result, the player utility index would be overestimated/underestimated.

Finally, I believe that using statistical and mathematical methods is only acceptable as a supplement to the decision making process not only in baseball, but in every field.

<h1 id = "Appendix">Appendix</h1>

**Baseball statistics abbreviations**

  - PA - Plate appearance: number of completed batting appearances
  - HR - Home runs: hits on which the batter successfully touched all four bases, without the contribution of a fielding error
  - R - Runs scored: number of times a player crosses home plate
  - RBI - Run batted in: number of runners who score due to a batters' action, except when batter grounded into double play or reached on an error
  - SB - Stolen base: number of bases advanced by the runner while the ball is in the possession of the defense
  - ISO - Isolated power: a hitter's ability to hit for extra bases, calculated by subtracting batting average from slugging percentage
  - BABIP - Batting average on balls in play: frequency at which a batter reaches a base after putting the ball in the field of play. Also a pitching category
  - AVG - Batting average (also abbreviated BA): hits divided by at bats 
  - OBP - On-base percentage: times reached base divided by at bats plus walks plus hit by pitch plus sacrifice flies 
  - SLG - Slugging average: total bases achieved on hits divided by at-bats
  - wOBA - Some argue that the OPS, on-base plus slugging, formula is flawed and that more weight should be shifted towards OBP (on-base percentage). The statistic wOBA (weighted on-base average) attempts to correct for this.
  - wRC. - Weighted Runs Created (wRC): an improved version of Bill James' Runs Created statistic, which attempted to quantify a player's total offensive value and measure it by runs.
  - BsR - Base Runs: Another run estimator, like Runs Created; a favorite of writer Tom Tango
  - WAR - Wins above replacement: a non-standard formula to calculate the number of wins a player contributes to his team over a "replacement-level player"
  - Off - total runs above or below average based on offensive contributions (both batting and baserunning) 
  - Def - total runs above or below average based on defensive contributions (fielding and position). 
  
*Source: [Wikipedia::Baseball statistics](https://en.wikipedia.org/wiki/Baseball\_statistics#Commonly\_used\_statistics)* 

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
            plugins: ['remove\_button'],
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
      Shiny.onInputChange(el.id + '\_' + id, data);
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
      changeInput('rows\_selected', selectedRows());
      changeInput('row\_last\_clicked', server ? thisRow.data()[0] : thisRow.index() + 1);
    });
    changeInput('rows\_selected', selectedRows());
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
      // changeInput('page\_info', table.page.info());
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
        changeInput('rows' + '\_' + id, idx);
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
      if (filterRow) changeInput('search\_columns', filterRow.toArray().map(function(td) {
        return $(td).find('input').first().val();
      }));
    }
    table.on('draw.dt', updateSearchInfo);
    updateSearchInfo();
  }
});
</script>
