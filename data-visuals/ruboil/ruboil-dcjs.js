function join(lookupTable, mainTable, lookupKey, mainKey, select) {
  // Join function as described here
  // http://learnjsdata.com/combine_data.html
    var l = lookupTable.length,
        m = mainTable.length,
        lookupIndex = [],
        output = [];
    for (var i = 0; i < l; i++) { // loop through l items
        var row = lookupTable[i];
        lookupIndex[row[lookupKey]] = row; // create an index for lookup table
    }
    for (var j = 0; j < m; j++) { // loop through m items
        var y = mainTable[j];
        var x = lookupIndex[y[mainKey]]; // get corresponding row from lookupTable
        output.push(select(y, x)); // select only the columns you need
    }
    return output;
};

function val_color(value) {
    // Based on the sign changes color to either green (nonnegative) or red (negative)
    if (Number(value) < 0) {
        return "<font color='red'>" + String(value) + "</font>"
    }
    else {return "<font color='green'>" + String(value) + "</font>"}
}

function per_change(arr,key){
    for(var i = 1; i < arr.length; i++ ) {
        arr[i][key +'_change'] = (arr[i][key] - arr[i-1][key])/arr[i-1][key]
    }

}

// Custom reduce function for crossfilter
function reduceAddAvg(attr) {
    return function(p,v) {
        ++p.count
        p.total += v[attr];
        p.avg = (p.count === 0) ? 0 : p.total/p.count; // gaurd against dividing by zero
        return p;
    };
}
function reduceRemoveAvg(attr) {
    return function(p,v) {
        --p.count
        p.total -= v[attr];
        p.avg = (p.count === 0) ? 0 : p.total/p.count;
        return p;
    };
}
function reduceInitAvg() {
  return {count:0, total:0, avg:0};
}


function pearson (x, y) {
    // Get correlation for two arrays of numbers
    const promedio = l => l.reduce((s, a) => s + a, 0) / l.length
    const calc = (v, prom) => Math.sqrt(v.reduce((s, a) => (s + a * a), 0) - n * prom * prom)
    let n = x.length
    let nn = 0
    for (let i = 0; i < n; i++, nn++) {
      if ((!x[i] && x[i] !== 0) || (!y[i] && y[i] !== 0)) {
        nn--
        continue
      }
      x[nn] = x[i]
      y[nn] = y[i]
    }
    if (n !== nn) {
      x = x.splice(0, nn)
      y = y.splice(0, nn)
      n = nn
    }
    const prom_x = promedio(x), prom_y = promedio(y)
    return (x
        .map((e, i) => ({ x: e, y: y[i] }))
        .reduce((v, a) => v + a.x * a.y, 0) - n * prom_x * prom_y
    ) / (calc(x, prom_x) * calc(y, prom_y))
  }
    
    
function rollingCorrelation(arr1, arr2, windowPeriod = 10) {
    // Calculate a rolling correlation for two arrays
    // correlation array to return
    var corrs = [];
    for (var i = 0; i < arr1.length - windowPeriod; i++) {
      // windows of data to perform correlation on
      var win1 = [];
      var win2 = [];
      for (var j = 0; j < windowPeriod; j++) {
        win1.push(arr1[i + j]);
        win2.push(arr2[i + j]);
      }
      // calculate correlation between two arrays
      corrs.push(pearson(win1, win2));
    }
    return corrs;
  }



function get_json(url){
    // make async ajax request with CORS header since $.getJSON does support headers
    var resp;
    $.ajax({
            url: url,
            async:false,
            type: 'GET',
            dataType: 'json',
            success: function(d) { 
              resp = d
            },
            error: function(e) { return e }
          //   beforeSend: setHeader
          });
  
  //   function setHeader(xhr) {
  //         xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
  //       }
  
    return resp
  }

function get_json_m(url){
  // make async ajax request with CORS header since $.getJSON does support headers
  var resp;
  $.ajax({
          url: url,
          async:false,
          crossDomain: true,
          type: 'GET',
          redirect: 'follow',
          headers: {
             "apikey": "208OOGLVF2wrGKnEn9RG2oj8JRaMv7C2"},
          success: function(d) { 
            resp = d
          },
          error: function(e) { return e }
        //   beforeSend: setHeader
        });

//   function setHeader(xhr) {
//         xhr.setRequestHeader("apikey", "208OOGLVF2wrGKnEn9RG2oj8JRaMv7C2");
//       }

  return resp
}

// Retrieve Brent oil, WTI oil, USD/RUB daily data from quandl.com using jquery
var request_date_format = d3.timeFormat("%Y-%m-%d")
var today = new Date();
var yesterday = request_date_format(today.setDate(today.getDate()-1));
var exrates = get_json('./exchange_rates.json')
var oilprices = get_json('./oil_prices.json')

 // Join dat with Brent oil price dataset using join function
 var dat_base = join(exrates, oilprices, "date", "date", function(main, lookup) {
    return {
          date: main.date,
          rate_rub: (lookup !== undefined) ? lookup.rate_rub : 0,
          rate_cad: (lookup !== undefined) ? lookup.rate_cad : 0,
          wti_price: main.wti_price,
          brent_price:main.brent_price
      };
  });

$.when(
    // WTI
    // get_json("https://www.quandl.com/api/v1/datasets/CHRIS/CME_CL1.json?auth_token=jBPoW6ZkJm9VPeu8A9xW&trim_start=2013-01-01&trim_end=" + yesterday),
    // Brent
    // get_json("https://www.quandl.com/api/v1/datasets/CHRIS/ICE_B1.json?auth_token=jBPoW6ZkJm9VPeu8A9xW&trim_start=2013-01-01&trim_end" + yesterday),
    // USD/RUB 
    // get_json_m("https://api.apilayer.com/exchangerates_data/timeseries?start_date=2022-01-01&end_date=" + yesterday + "&symbols=USD,RUB,CAD&base=USD")
).done(function(result1, result2, result3) {
    // var dat=[] // main dataset unvalidated

    // // Push WTI prices to dat
    // $.each(result1['data'], function(index,val){
    //   dat.push({'date':val[0],
    //             'wti_price':val[1]
    //             })
    // })
    // // Join dat with Brent oil price dataset using join function
    // dat = join(result2['data'], dat, "0", "date", function(main, lookup) {
    //   return {
    //         date: main.date,
    //         wti_price: main.wti_price,
    //         brent_price: (lookup !== undefined) ? lookup['1'] : 0
 
    //     };
    // });
    
    // // Add RUB and CAD value for 1 USD
    // $.each(dat, function(index,val){
    //     item = result3['rates'][this.date]
    //     rub_val = (item !== undefined) ? item['RUB'] : 0
    //     cad_val = (item !== undefined) ? item['CAD'] : 0
    //     // console.log(rub_val)
    //     this.rate_rub = rub_val
    //     this.rate_cad = cad_val
    //   })

    dat=dat_base
    per_change(dat,'wti_price')
    per_change(dat,'brent_price')
    per_change(dat,'rate_rub')
    per_change(dat,'rate_cad')
    
    final_df = [];
    dat.forEach(function (d) {
        if (d.rate_rub !== 0 && 
            d.rate_cad !== 0 &&
            (d.wti_price >1 || d.wti_price < 0) &&
            (d.brent_price >1 || d.brent_price <0) ) {
                d.date = new Date(d.date); // parse the date 
                d.month = d.date.getMonth(); // pre-calculate month for better performance
                d.week = d3.timeWeek(d.date); // calculate the week
                final_df.push(d)
          }
    });
  
  console.log(final_df)

  // Add rolling correlation
  corr_rub = rollingCorrelation(final_df.map(d => (d.wti_price+d.brent_price)/2),
                            final_df.map(d => d.rate_rub),60)
  corr_cad = rollingCorrelation(final_df.map(d => (d.wti_price+d.brent_price)/2),
                            final_df.map(d => d.rate_cad),60)
  index = 0
  final_df.forEach(function(d){
    d['rolling_corr_rub'] = corr_rub[index] ? Math.abs(corr_rub[index]) : 0
    d['rolling_corr_cad'] = corr_cad[index] ? Math.abs(corr_cad[index]) : 0
    index += 1
  })

  console.log(final_df)

  // Graph the dataset using dc.js
  ////////////////////////////////
  var dateFormat = d3.timeFormat('%b %d %Y');
  var locale = d3.formatLocale({minus: "-"})
  var numberFormat = locale.format('.2f');
  var numberFormat4 = locale.format('.4f');

  var ndx = crossfilter(final_df); 
  var all = ndx.groupAll();

  // vars 
  var startDate = new Date(2013, 1, 1)
  var endDate = new Date().setDate(new Date().getDate())

  // Dimensions
  var dateDim = ndx.dimension(function(d) {return d['date']})
  var weekDim = ndx.dimension(function(d) {return d['week']})
  var monthDim = ndx.dimension(function(d) {return d['month']})

  // Groups
  var avgRateRubByWeekGroup = weekDim.group().reduce(reduceAddAvg('rate_rub'),reduceRemoveAvg('rate_rub'),reduceInitAvg);
  var avgRateRubByDayGroup = dateDim.group().reduce(reduceAddAvg('rate_rub'),reduceRemoveAvg('rate_rub'),reduceInitAvg);
  var avgRateCadByWeekGroup = weekDim.group().reduce(reduceAddAvg('rate_cad'),reduceRemoveAvg('rate_cad'),reduceInitAvg);
  var avgRateCadByDayGroup = dateDim.group().reduce(reduceAddAvg('rate_cad'),reduceRemoveAvg('rate_cda'),reduceInitAvg);
  var avgWTIByWeekGroup = weekDim.group().reduce(reduceAddAvg('wti_price'),reduceRemoveAvg('wti_price'),reduceInitAvg);
  var avgWTIByDayGroup = dateDim.group().reduce(reduceAddAvg('wti_price'),reduceRemoveAvg('wti_price'),reduceInitAvg);
  var avgBrentByDayGroup = dateDim.group().reduce(reduceAddAvg('brent_price'),reduceRemoveAvg('brent_price'),reduceInitAvg);
  var avgBrentByWeekGroup = weekDim.group().reduce(reduceAddAvg('brent_price'),reduceRemoveAvg('brent_price'),reduceInitAvg); 

  var weeklyCorrRub = dateDim.group().reduce(reduceAddAvg('rolling_corr_rub'),reduceRemoveAvg('rolling_corr_rub'),reduceInitAvg);
  var weeklyCorrCad = dateDim.group().reduce(reduceAddAvg('rolling_corr_cad'),reduceRemoveAvg('rolling_corr_cad'),reduceInitAvg);
  var meanCorrRubGroup = all.reduce(reduceAddAvg('rolling_corr_rub'),reduceRemoveAvg('rolling_corr_rub'),reduceInitAvg);
  var meanCorrCadGroup = all.reduce(reduceAddAvg('rolling_corr_cad'),reduceRemoveAvg('rolling_corr_cad'),reduceInitAvg);


  // Charts
  composite_oil = dc.compositeChart('#Composite_chart_oil')
  barchart_oil = dc.barChart('#Bar_chart_oil')  
  linechart_rate = dc.lineChart('#Line_chart_rate')
  barchart_rate = dc.barChart('#Bar_chart_rate')
  composite = dc.compositeChart('#Composite')
  barchart_com = dc.barChart('#Bar_chart_com')
  linechart_rate2 = dc.lineChart(composite)
  linechart_brent = dc.lineChart(composite)
  linechart_wti = dc.lineChart(composite)
  table = dc.dataTable("#data-table")

  boxCorr = new dc.NumberDisplay("#number-display"),
  correlation = dc.lineChart('#correlation_chart')

  composite_oil
    .width(990)
    .height(200)
    // .margins({top: 30, right: 50, bottom: 25, left: 40})
    .x(d3.scaleTime().domain([startDate, endDate]))
    .round(d3.timeMonth.round)
    .xUnits(d3.timeMonths)
    .yAxisLabel("Price per barrel, $")
    .elasticY(true)
    .legend(dc.legend().x(60).y(150).autoItemWidth(true).horizontal(true))
    .renderHorizontalGridLines(true)
    .rangeChart(barchart_oil)
    .title(function (d) {
            var value = d.value.avg ? d.value.avg : d.value;
            if (isNaN(value)) {
                value = 0;
            }
            return dateFormat(d.key) + '\n' + numberFormat(value) + '$';
        })
    .dimension(dateDim)
    .compose([
        dc.lineChart(composite_oil)
            .colors('#000000')
            .group(avgWTIByDayGroup, "WTI Oil Price")
            .valueAccessor(function (d) {
            return d.value.avg;
        })
            /*.dashStyle([2,2])*/,
        dc.lineChart(composite_oil)
            .colors('#808080')
            .group(avgBrentByDayGroup, "Brent Oil Price")
            .valueAccessor(function (d) {
            return d.value.avg;
        })
            // .dashStyle([5,5])
        ])
    .brushOn(false);

    barchart_oil
    .width(990)
    .height(40)
    .margins({top: 0, right: 50, bottom: 20, left: 40})
    .colors('#808080')
    .dimension(dateDim)
    .group(avgWTIByWeekGroup)
    .valueAccessor(function (d) {
            return d.value.avg;
        })
    .centerBar(true)
    .gap(1)
    .x(d3.scaleTime().domain([startDate, endDate]))
    .round(d3.timeWeek.round)
    .alwaysUseRounding(true)
    .xUnits(d3.timeWeeks)

correlation
    .width(990)
    .height(100)
    .margins({top: 10, right: 50, bottom: 20, left: 50})
    .colors('#dd5049')
    .dimension(dateDim)
    .group(weeklyCorrRub)
    .valueAccessor(function (d) {
        if (!isNaN(d.value.avg)) { return d.value.avg.toPrecision(3)*100 }
        else {return 0}
        })
    .x(d3.scaleTime().domain([startDate, endDate]))
    .round(d3.timeMonth.round)
    .xUnits(d3.timeMonths)
    .elasticY(true)
    .brushOn(false)
    .renderArea(true)
    .yAxisPadding('20%')
    .yAxisLabel("Correlation")
    .title(function (d) {
        if (!isNaN(d.value.avg)) {
            return dateFormat(d.key) + '\n' + d.value.avg.toPrecision(3)*100 + '%';
        }
    })
    .yAxis().tickValues([0, 100]).tickFormat(function(v) {return v + '%';})
    

  linechart_rate
    .width(990).height(200)
    .colors('#619542')
    // .margins({top: 30, right: 50, bottom: 25, left: 40})
    .renderArea(true)
    .mouseZoomable(false)
    .dimension(dateDim)
    .transitionDuration(1000)
    .group(avgRateRubByDayGroup)
    .yAxisLabel("RUB per $")
    .rangeChart(barchart_rate)
    .valueAccessor(function (d) {
            return d.value.avg;
        })
    .x(d3.scaleTime().domain([startDate, endDate]))
    .round(d3.timeMonth.round)
    .xUnits(d3.timeMonths)
    .elasticY(true)
    .brushOn(false)
    .title(function (d) {
            var value = d.value.avg ? d.value.avg : d.value;
            if (isNaN(value)) {
                value = 0;
            }
            return dateFormat(d.key) + '\n' + numberFormat(value) + 'RUB';
        })
    .renderHorizontalGridLines(true)

  barchart_rate
    .width(990)
    .height(40)
    .margins({top: 0, right: 50, bottom: 20, left: 40})
    .colors('#619542')
    .dimension(dateDim)
    .group(avgRateRubByWeekGroup)
    .valueAccessor(function (d) {
            return d.value.avg;
        })
    .centerBar(true)
    .gap(1)
    .x(d3.scaleTime().domain([startDate, endDate]))
    .round(d3.timeWeek.round)
    .alwaysUseRounding(true)
    .xUnits(d3.timeWeeks)

  linechart_rate2
    .width(990).height(200)
    .colors('#619542')
    // .margins({top: 30, right: 50, bottom: 25, left: 40})
    .mouseZoomable(false)
    .dimension(dateDim)
    .transitionDuration(1000)
    .group(avgRateRubByDayGroup, "RUB per $")
    .valueAccessor(function (d) {
            return d.value.avg;
        })
    .x(d3.scaleTime().domain([startDate, endDate]))
    .round(d3.timeMonth.round)
    .xUnits(d3.timeMonths)
    .elasticY(true)
    .brushOn(false)
    .title(function (d) {
            var value = d.value.avg ? d.value.avg : d.value;
            if (isNaN(value)) {
                value = 0;
            }
            return dateFormat(d.key) + '\n' + numberFormat(value) + 'RUB';
        })
    .renderHorizontalGridLines(true)


  barchart_com
    .width(990)
    .height(40)
    .margins({top: 0, right: 50, bottom: 20, left: 40})
    .colors('#808080')
    .dimension(weekDim)
    .group(avgWTIByWeekGroup)
    .valueAccessor(function (d) {
            return d.value.avg;
        })
    .centerBar(true)
    .gap(1)
    .x(d3.scaleTime().domain([startDate, endDate]))
    .round(d3.timeWeek.round)
    .alwaysUseRounding(true)
    .xUnits(d3.timeWeeks)
    .yAxis().ticks(0);

  linechart_wti
    .width(990)
    .height(200)
    .colors('#000000')
    .dimension(dateDim)
    .group(avgWTIByDayGroup, "WTI Oil Price")
    .valueAccessor(function (d) {
      return d.value.avg});

  linechart_brent
    .width(990)
    .height(200)
    .colors('#808080')
    .dimension(dateDim)
    .group(avgBrentByDayGroup, "Brent Oil Price")
    .valueAccessor(function (d) {
      return d.value.avg});

  composite
    .width(990)
    .height(200)
    .margins({top: 20, right: 50, bottom: 25, left: 50})
    .x(d3.scaleTime().domain([startDate, endDate]))
    .round(d3.timeMonth.round)
    .xUnits(d3.timeMonths)
    .yAxisLabel("Price per barrel, $")
    .elasticY(true)
    .legend(dc.legend().x(70).y(150).autoItemWidth(true).horizontal(true))
    .renderHorizontalGridLines(true)
    .rangeChart(barchart_com)
    .title(function (d) {
            var value = d.value.avg ? d.value.avg : d.value;
            if (isNaN(value)) {
                value = 0;
            }
            return dateFormat(d.key) + '\n' + numberFormat(value) + '$';
        })
    .dimension(dateDim)
    .compose([linechart_brent, linechart_wti,
              linechart_rate2.useRightYAxis(true)
              ])
    .rightYAxisLabel("Rub per $")
    .brushOn(false);

  boxCorr
    .formatNumber(d3.format(".0%"))
    .valueAccessor(function(d){
        return d.avg

    })
    .group(meanCorrRubGroup);


  table
//   .width(1200)
  .dimension(dateDim)
  .group(function(d) { return " "})
  .size(15)             // number of rows to return
  .columns([
    function(d) { return dateFormat(d.date)},
    function(d) { return '$' + d.wti_price; },
    function(d) { return val_color(numberFormat(d.wti_price_change*100)) + '%';},
    function(d) { return '$' + d.brent_price; },
    function(d) { return val_color(numberFormat(d.brent_price_change*100)) + '%';},
    function(d) { return '$' + numberFormat(d.rate_rub); },
    function(d) { return val_color(numberFormat(d.rate_rub_change*100)) + '%';}

   ])
  .sortBy(function(d){ return d.date;})
  .order(d3.descending);
    

  dc.renderAll();

    // Events for the rate line chart dropdown menu
    $('.line-drop').on("change", function() {
        if (this.value == "RUB") {
            //Update chart to show Rubles
            avgRateCadByDayGroup.dispose()
            avgRateCadByWeekGroup.dispose()
            meanCorrCadGroup.dispose()
           

            // Update the line chart
            linechart_rate
             .group(avgRateRubByDayGroup)
             .title(function (d) {
                    var value = d.value.avg ? d.value.avg : d.value;
                    if (isNaN(value)) {
                        value = 0;
                    }
                    return dateFormat(d.key) + '\n' + numberFormat(value) + 'RUB';
                })
             .yAxisLabel("RUB per $")

            linechart_rate2
             .group(avgRateRubByWeekGroup, "RUB per $")
             .title(function (d) {
                    var value = d.value.avg ? d.value.avg : d.value;
                    if (isNaN(value)) {
                        value = 0;
                    }
                    return dateFormat(d.key) + '\n' + numberFormat(value) + 'RUB';
                })
             .yAxisLabel("RUB per $")

            // Update Bar Chart
            barchart_rate
            .group(avgRateRubByWeekGroup)
            .y(d3.scaleLinear().domain([0, 75]))

            //  Update composite chart
            composite
              .compose([linechart_brent, linechart_wti,
                        linechart_rate2.useRightYAxis(true)
              ])
              .rightYAxisLabel("RUB per $")

            // Update correlation chart
            correlation
            .group(weeklyCorrRub)

            // Update correlation number display
            boxCorr
            .group(meanCorrRubGroup);
          
            // Update data table
            table
              .columns([
                function(d) { return dateFormat(d.date)},
                function(d) { return '$' + d.wti_price; },
                function(d) { return val_color(numberFormat(d.wti_price_change*100)) + '%';},
                function(d) { return '$' + d.brent_price; },
                function(d) { return val_color(numberFormat(d.brent_price_change*100)) + '%';},
                function(d) { return '$' + numberFormat(d.rate_rub); },
                function(d) { return val_color(numberFormat(d.rate_rub_change*100)) + '%';}
            
               ])

            dc.filterAll();
            dc.redrawAll();    

            // Update data table headers
           $(".rate-name" ).replaceWith( "<font class='rate-name'>RUB</font>" );
           $(".source" ).replaceWith( "<p class='muted source'>Source: Exchange Rates API: <a href ='https://exchangeratesapi.io/' target='_blank'>USD/RUB</a></p>" );
           
            return false;
        } else if (this.value == "CAD"){
            //Update chart to show Canadian Dollars
            avgRateRubByDayGroup.dispose()
            avgRateRubByWeekGroup.dispose()
            meanCorrRubGroup.dispose()
        

            // Update the line chart
            linechart_rate
             .dimension(dateDim)
             .group(avgRateCadByDayGroup)
             .title(function (d) {
                    var value = d.value.avg ? d.value.avg : d.value;
                    if (isNaN(value)) {
                        value = 0;
                    }
                    return dateFormat(d.key) + '\n' + numberFormat(value) + 'CAD';
                })
             .yAxisLabel("CAD per $")

            linechart_rate2
             .group(avgRateCadByWeekGroup, 'CAD per $')
             .title(function (d) {
                    var value = d.value.avg ? d.value.avg : d.value;
                    if (isNaN(value)) {
                        value = 0;
                    }
                    return dateFormat(d.key) + '\n' + numberFormat(value) + 'CAD';
                })
             .yAxisLabel("CAD per $")

             // Update Bar Chart
             barchart_rate
                .group(avgRateCadByWeekGroup)
                .y(d3.scaleLinear().domain([0.5, 1.5]))

            //  Update composite chart
            composite
            .compose([linechart_brent, linechart_wti,
                      linechart_rate2.useRightYAxis(true)
            ])
            .rightYAxisLabel("CAD per $")

            // Update correlation chart
            correlation
            .group(weeklyCorrCad)

            // Update correlation number display
            boxCorr
            .group(meanCorrCadGroup);

             // Update data table
             table
              .columns([
                function(d) { return dateFormat(d.date)},
                function(d) { return d.wti_price; },
                function(d) { return val_color(numberFormat(d.wti_price_change*100));},
                function(d) { return d.brent_price; },
                function(d) { return val_color(numberFormat(d.brent_price_change*100));},
                function(d) { return numberFormat4(d.rate_cad); },
                function(d) { return val_color(numberFormat(d.rate_cad_change*100));}

               ])

            dc.filterAll();
            dc.redrawAll(); 

           // Update data table headers
           $(".rate-name" ).replaceWith( "<font class='rate-name'>CAD</font>" );
           // Update the rate graph source
           $(".source" ).replaceWith( "<p class='muted source'>Source: Exchange Rates API: <a href ='https://exchangeratesapi.io/' target='_blank'>USD/CAD</a></p>" );

            return false;

            }
    }); 
});