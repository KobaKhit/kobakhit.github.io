function val_color(value) {
    // Based on the sign changes color to either green (nonnegative) or red (negative)

    if (Number(value) < 0) {
        return "<font color='red'>" + String(value) + "</font>"
    }
    else {return "<font color='green'>" + String(value) + "</font>"}
}

function remove_empty_bins(source_group) {
    return {
        all:function () {
            return source_group.all().filter(function(d) {
              return d.key != 'null';
            });
        }
    };
}

// Get csv
d3.csv('may-vs-pac.csv', function(data) {
  

  data.forEach(function (d) {
        d.may_outcome = (d.boxer === 'Mayweather') ? d.outcome : 'null';
        d.pac_outcome = (d.boxer === 'Pacquiao') ? d.outcome : 'null';
        d.pac_landed = (d.boxer === 'Pacquiao') ? d.landed : 0;
        d.may_landed = (d.boxer === 'Mayweather') ? d.landed : 0;
        d.round = parseInt(d.round)
    });

  console.log(data)

  // Graph data
  ///////////////////////////////////////
  var ndx = crossfilter(data); 
  var all = ndx.groupAll();

  // GroupAll by boxer
  var pie_may = ndx.groupAll().reduceSum(function (d) {return d['mayweather'];})
  var pie_pac = ndx.groupAll().reduceSum(function (d) {return d['pacquiao'];})

  // Dimensions
  var roundDim = ndx.dimension(function(d) {return d['round']})
  var boxerDim = ndx.dimension(function(d) {return d['boxer']})
  var outcomeDim = ndx.dimension(function(d) {return d['outcome']})
  var outcomeMayDim = ndx.dimension(function(d) {return d['may_outcome']})
  var outcomePacDim = ndx.dimension(function(d) {return d['pac_outcome']})
  var punchDim = ndx.dimension(function(d) {return d['punch_type']})
  var landedMayDim = ndx.dimension(function(d) {return d['may_landed']})
  var landedPacDim = ndx.dimension(function(d) {return d['pac_landed']})

  // Groups
  var roundMayGroup = roundDim.group().reduceSum(function(d){return d.mayweather});
  var roundPacGroup = roundDim.group().reduceSum(function(d){return d.pacquiao});
  var roundGroup = roundDim.group().reduceCount(function(d){return d.punch_type})

  var boxerGroup = boxerDim.group().reduceCount(function(d) {return d.boxer});
  var outcomeGroup = outcomeDim.group().reduceCount(function(d) {return d.outcome});


  var outcomeMayGroup = remove_empty_bins(outcomeMayDim.group().reduceCount());
  var outcomePacGroup = remove_empty_bins(outcomePacDim.group().reduceCount());

  var punchGroup = punchDim.group().reduceCount(function(d) {return d.punch});

  var landedMayGroup = roundDim.group().reduceSum(function(d) {return d.may_landed})
  var landedPacGroup = roundDim.group().reduceSum(function(d) {return d.pac_landed});

  // Charts
  roundBar = dc.barChart('#round-punch-bar')
  boxerRow = dc.rowChart('#total-punch-row')
  outcomeMayPie = dc.pieChart('#outcome-may-pie')
  outcomePacPie = dc.pieChart('#outcome-pac-pie')
  punchRow = dc.rowChart('#punch-type-row')
  composite = dc.compositeChart('#landed-series')


  roundBar
    .width(990)
    .height(200)
    // .margins({top: 0, right: 50, bottom: 20, left: 40})
    .dimension(roundDim)
    .ordinalColors(['#1f77b4','#d62728'])
    .group(roundMayGroup,'Mayweather')
    .valueAccessor(function (d) {
            return d.value
        })
    .yAxisLabel('# of Punches')
    .xAxisLabel('Round')
    .centerBar(false)
    .gap(1)
    .x(d3.scale.ordinal().domain([1,2,3,4,5,6,7,8,9,10,11,12]))
    .xUnits(dc.units.ordinal) 
    .stack(roundPacGroup,'Pacquiao')
    .legend(dc.legend().x(880).y(10).itemHeight(13).gap(5))

  boxerRow
    .width(250)
    .height(173)
    // .margins({top: 0, right: 50, bottom: 20, left: 40})
    .ordinalColors(['#1f77b4','#d62728'])
    .dimension(boxerDim)
    .group(boxerGroup)
    .label(function (d) {return d.key + " (" + d.value + ")";})
    .valueAccessor(function (d) {
            return d.value
        })

  punchRow
    .width(250)
    .height(173)
    .dimension(punchDim)
    .group(punchGroup)
    .label(function (d) {return d.key + " (" + d.value + ")";})
    .valueAccessor(function (d) {
            return d.value
        })

  outcomeMayPie
    .width(235)
    .height(150)
    .innerRadius(15)
    .ordinalColors(['green','#ff7f0e'])
    .dimension(outcomeMayDim)
    .group(outcomeMayGroup)
    .legend(dc.legend().x(0).y(2).itemHeight(13).gap(5))
    .valueAccessor(function (d) {
      // console.log(d)
      return d.value
        })
    .label(function (d){
      var label;
      if (all.value()) { 
              percent = (d.value === 0) ? 0 : Math.floor(d.value / pie_may.value() * 100)
              label = ' (' + percent + '%)';
            }
            return label;
    });

  outcomePacPie
    .width(235)
    .height(150)
    .innerRadius(15)
    .ordinalColors(['green','#ff7f0e'])
    .dimension(outcomePacDim)
    .group(outcomePacGroup)
    .legend(dc.legend().x(0).y(2).itemHeight(13).gap(5))
    .valueAccessor(function (d) {
      // console.log(d)
      return d.value
        })
    .label(function (d){
      var label;
      if (all.value()) { 
              percent = (d.value === 0) ? 0 : Math.floor(d.value / pie_pac.value() * 100)
              label = ' (' + percent + '%)';
            }
            return label;
    });

  composite
    .width(990)
    .height(200)
    .dimension(roundDim)
    .x(d3.scale.linear().domain([0,12]))
    .y(d3.scale.linear().domain([0,25]))
    .yAxisLabel("Punches")
    .xAxisLabel("Round")
    .legend(dc.legend().x(80).y(10).itemHeight(13).gap(5))
    .renderHorizontalGridLines(true)
    .title(function (d) {
            return 'Round: ' + d.key + '\n' + d.value;
        })
    .compose([
        dc.lineChart(composite)
            // .x(d3.scale.linear().domain([0,12]))
            // .interpolate('step')
            .renderDataPoints(true)
            .colors('#d62728')
            // .yAxisLabel("This is the Y Axis!")
            .dimension(roundDim)
            .group(landedPacGroup, 'Pacquiao'),
        dc.lineChart(composite)
            // .x(d3.scale.linear().domain([0,12]))
            // .interpolate('step')
            .colors('#1f77b4')
            .renderDataPoints(true)
            .group(landedMayGroup,'Mayweather')
            // .dashStyle([5,5])
        ])
    .brushOn(false)
    .render();

    dc.renderAll();

    // Tooltips
    // Bar
    var barTip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {return "<span style = 'background-color: grey;'><font color='9900FF'>" + d.layer + ": </font></span>" + d.y});

    d3.selectAll(".bar").call(barTip);
    d3.selectAll(".bar").on('mouseover', barTip.show)
        .on('mouseout', barTip.hide);

    // Row
    var rowTip = d3.tip()
        .attr('class', 'd3-tip')
        // .offset([-10, 0])
        .html(function (d) {return "<span><font color='#9900FF'>" + 'Punches: ' + "</font></span>" + d.value});

    d3.selectAll(".row").select('rect').call(rowTip);
    d3.selectAll(".row").select('rect').on('mouseover', rowTip.show)
        .on('mouseout', rowTip.hide);

    // Pie chart
    var pieTip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function (d) {console.log(d); return "<span style='color: #9900FF'>" +  d.data.key + "</span> : "  + d.value + ' punches'; });

    d3.selectAll(".pie-slice").call(pieTip);
    d3.selectAll(".pie-slice").on('mouseover', pieTip.show)
        .on('mouseout', pieTip.hide);

    // Line charts
    var lineTip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function (d) {return "<span style='color: #9900FF'>" +  'Round ' + d.data.key + "</span> : "  + d.y + ' punches'; });

    d3.selectAll(".dot").call(lineTip);
    d3.selectAll(".dot").on('mouseover', lineTip.show)
        .on('mouseout', lineTip.hide);

});