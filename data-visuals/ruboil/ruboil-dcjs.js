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
        arr[i-1][key +'_change'] = (arr[i-1][key] - arr[i][key])/arr[i][key]
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

// Retrieve Brent oil, WTI oil, USD/RUB daily data from quandl.com using jquery
$.when(
    // WTI
    $.getJSON("https://www.quandl.com/api/v1/datasets/CHRIS/CME_CL1.json?auth_token=jBPoW6ZkJm9VPeu8A9xW&trim_start=2013-01-01"),
    // Brent
    $.getJSON("https://www.quandl.com/api/v1/datasets/CHRIS/ICE_B1.json?auth_token=jBPoW6ZkJm9VPeu8A9xW&trim_start=2013-01-01"),
    // USD/RUB 
    $.getJSON("https://www.quandl.com/api/v1/datasets/CURRFX/USDRUB.json?auth_token=jBPoW6ZkJm9VPeu8A9xW&trim_start=2013-01-01"),
    // USD/CAD
    $.getJSON("https://www.quandl.com/api/v1/datasets/CURRFX/USDCAD.json?auth_token=jBPoW6ZkJm9VPeu8A9xW&trim_start=2013-01-01")
).done(function(result1, result2, result3,result4) {
    console.log(result1)
    // console.log(result2)
    // console.log(result3)
    var dat=[] // main dataset

    // Push WTI prices to dat
    $.each(result1[0]['data'], function(index,val){
      dat.push({'date':val[0],
                'wti_price':val[1]
                })
    })
    
    // Join dat with Brent oil price dataset using join function
    dat = join(result2[0]['data'], dat, "0", "date", function(main, lookup) {
      return {
            date: main.date,
            wti_price: main.wti_price,
            brent_price: (lookup !== undefined) ? lookup['1'] : 0,
 
        };
    });

    // Join dat with USD/RUB dataset using join function
    dat = join(result3[0]['data'], dat, "0", "date", function(main, lookup) {
      return {
            date: main.date,
            wti_price: main.wti_price,
            brent_price: main.brent_price,
            rate_rub: (lookup !== undefined) ? lookup['1'] : 0
        };
    });

    // Join dat with USD/RUB dataset using join function
    dat = join(result4[0]['data'], dat, "0", "date", function(main, lookup) {
      return {
            date: main.date,
            wti_price: main.wti_price,
            brent_price: main.brent_price,
            rate_rub: main.rate_rub,
            rate_cad: (lookup !== undefined) ? lookup['1'] : 0
        };
    });
        
    per_change(dat,'wti_price')
    per_change(dat,'brent_price')
    per_change(dat,'rate_rub')
    per_change(dat,'rate_cad')
    console.log(dat);

    dat.forEach(function (d) {
        d.date = new Date(d.date); // parse the date 
        d.month = d3.time.month(d.date); // pre-calculate month for better performance
        d.week = d3.time.week(d.date); // calculate the week
    });
  
  // console.log(dat)

  // Graph the dataset using dc.js
  ////////////////////////////////
  var dateFormat = d3.time.format('%b %d %Y');
  var numberFormat = d3.format('.2f');
  var numberFormat4 = d3.format('.4f');

  var ndx = crossfilter(dat); 
  var all = ndx.groupAll();

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

  // Charts
  composite_oil = dc.compositeChart('#Composite_chart_oil')
  barchart_oil = dc.barChart('#Bar_chart_oil')  
  linechart_rate = dc.lineChart('#Line_chart_rate')
  barchart_rate = dc.barChart('#Bar_chart_rate')
  table = dc.dataTable("#data-table")

  composite_oil
    .width(990)
    .height(200)
    // .margins({top: 30, right: 50, bottom: 25, left: 40})
    .x(d3.time.scale().domain([new Date(2012, 11, 1), new Date().setDate(new Date().getDate()+30)]))
    .round(d3.time.month.round)
    .xUnits(d3.time.months)
    .yAxisLabel("Price per barrel, $")
    .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
    .renderHorizontalGridLines(true)
    .rangeChart(barchart_oil)
    .title(function (d) {
            var value = d.value.avg ? d.value.avg : d.value;
            if (isNaN(value)) {
                value = 0;
            }
            return dateFormat(d.key) + '\n' + numberFormat(value) + '$';
        })
    .compose([
        dc.lineChart(composite_oil)
            .dimension(dateDim)
            .colors('#FF9933')
            .group(avgWTIByDayGroup, "WTI Oil Price")
            .valueAccessor(function (d) {
            return d.value.avg;
        })
            /*.dashStyle([2,2])*/,
        dc.lineChart(composite_oil)
            .dimension(dateDim)
            .colors('#0099FF')
            .group(avgBrentByDayGroup, "Brent Oil Price")
            .valueAccessor(function (d) {
            return d.value.avg;
        })
            // .dashStyle([5,5])
        ])
    .brushOn(false)
    .render();

    barchart_oil
    .width(990)
    .height(40)
    .margins({top: 0, right: 50, bottom: 20, left: 40})
    .dimension(monthDim)
    .group(avgWTIByWeekGroup)
    .valueAccessor(function (d) {
            return d.value.avg;
        })
    .centerBar(true)
    .gap(1)
    .x(d3.time.scale().domain([new Date(2012, 11, 1), new Date().setDate(new Date().getDate()+30)]))
    .round(d3.time.week.round)
    .alwaysUseRounding(true)
    .xUnits(d3.time.weeks)

  linechart_rate
    .width(990).height(200)
    // .margins({top: 30, right: 50, bottom: 25, left: 40})
    .renderArea(true)
    .mouseZoomable(false)
    .dimension(monthDim)
    .transitionDuration(1000)
    .group(avgRateRubByDayGroup)
    .yAxisLabel("RUB per $")
    .rangeChart(barchart_rate)
    .valueAccessor(function (d) {
            return d.value.avg;
        })
    .x(d3.time.scale().domain([new Date(2012, 11, 1), new Date().setDate(new Date().getDate()+30)]))
    .round(d3.time.month.round)
    .xUnits(d3.time.months)
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
    .dimension(monthDim)
    .group(avgRateRubByWeekGroup)
    .valueAccessor(function (d) {
            return d.value.avg;
        })
    .centerBar(true)
    .gap(1)
    .x(d3.time.scale().domain([new Date(2012, 11, 1), new Date().setDate(new Date().getDate()+30)]))
    .round(d3.time.week.round)
    .alwaysUseRounding(true)
    .xUnits(d3.time.weeks)

  dc.dataCount('.data-count')
        .dimension(ndx)
        .group(all)

        .html({
            some:'<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>Reset All</a>',
            all:'All records selected. Please select range on a bar graph to apply filters.'
        });

  table
  .width(990)
  .dimension(dateDim)
  .group(function(d) { return " "})
  .size(10)             // number of rows to return
  .columns([
    function(d) { return dateFormat(d.date)},
    function(d) { return d.wti_price; },
    function(d) { return val_color(numberFormat(d.wti_price_change*100));},
    function(d) { return d.brent_price; },
    function(d) { return val_color(numberFormat(d.brent_price_change*100));},
    function(d) { return numberFormat(d.rate_rub); },
    function(d) { return val_color(numberFormat(d.rate_rub_change*100));}

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
             .yAxisLabel("Rub per $")

             // Update Bar Chart
             barchart_rate
            .group(avgRateRubByWeekGroup)
            .y(d3.scale.linear().domain([0, 75]))

             // Update data table
             table
              .columns([
                function(d) { return dateFormat(d.date)},
                function(d) { return d.wti_price; },
                function(d) { return val_color(numberFormat(d.wti_price_change*100));},
                function(d) { return d.brent_price; },
                function(d) { return val_color(numberFormat(d.brent_price_change*100));},
                function(d) { return numberFormat(d.rate_rub); },
                function(d) { return val_color(numberFormat(d.rate_rub_change*100));}

               ])

            dc.filterAll();
            dc.redrawAll();    

            // Update data table headers
           $(".rate-name" ).replaceWith( "<font class='rate-name'>RUB</font>" );
           $(".source" ).replaceWith( "<p class='muted source'>Source: Quandl: <a href ='https://www.quandl.com/data/CURRFX/USDRUB-Currency-Exchange-Rates-USD-vs-RUB' target='_blank'>USD/RUB</a></p>" );
           
            return false;
        } else if (this.value == "CAD"){
            //Update chart to show Canadian Dollars
            avgRateRubByDayGroup.dispose()
            avgRateRubByWeekGroup.dispose()

            // Update the line chart
             linechart_rate
             .group(avgRateCadByDayGroup)
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
                .y(d3.scale.linear().domain([0.5, 1.5]))
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
           $( ".rate-name" ).replaceWith( "<font class='rate-name'>CAD</font>" );
           // Update the rate graph source
           $(".source" ).replaceWith( "<p class='muted source'>Source: Quandl: <a href ='https://www.quandl.com/data/CURRFX/USDCAD-Currency-Exchange-Rates-USD-vs-CAD' target='_blank'>USD/CAD</a></p>" );

            return false;

            }
    }); 
});