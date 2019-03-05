//Practically all this code comes from https://github.com/alangrafu/radar-chart-d3
//I only made some additions and aesthetic adjustments to make the chart look better
//(of course, that is only my point of view)
//Such as a better placement of the titles at each line end,
//adding numbers that reflect what each circular level stands for
//Not placing the last level and slight differences in color
//
//For a bit of extra information check the blog about it:
//http://nbremer.blogspot.nl/2013/09/making-d3-radar-chart-look-bit-better.html

var RadarChart = {
  draw: function (id, chartData, options) {
    var cfg = {
      radius: 5,
      w: 900,
      h: 800,
      factor: 1,
      factorLegend: 1,
      levels: 3,
      maxValue: 0,
      radians: 2 * Math.PI,
      opacityArea: 0.2,
      ToRight: 5,
      TranslateX: 150,
      TranslateY: 90,
      ExtraWidthX: 100,
      ExtraWidthY: 200,
      color: d3.scale.category10()
    };

    if ('undefined' !== typeof options) {
      for (var i in options) {
        if ('undefined' !== typeof options[i]) {
          cfg[i] = options[i];
        }
      }
    }
    var allAxis = (chartData[0].map(function (i, j) {
      return i.axis
    }));
    var total = allAxis.length;
    var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
    var Format = d3.format('');
    d3.select(id).select("svg").remove();

    var g = d3.select(id)
      .append("svg")
      .attr("width", cfg.w + cfg.ExtraWidthX)
      .attr("height", cfg.h + cfg.ExtraWidthY)
      .append("g")
      .attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");

    var tooltip;

    //Circular segments
    for (var j = 0; j < cfg.levels; j++) {
      var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
      g.selectAll(".levels")
        .data(allAxis)
        .enter()
        .append("svg:line")
        .attr("x1", function (d, i) {
          return levelFactor * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
        })
        .attr("y1", function (d, i) {
          return levelFactor * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
        })
        .attr("x2", function (d, i) {
          return levelFactor * (1 - cfg.factor * Math.sin((i + 1) * cfg.radians / total));
        })
        .attr("y2", function (d, i) {
          return levelFactor * (1 - cfg.factor * Math.cos((i + 1) * cfg.radians / total));
        })
        .attr("class", "line")
        .style("stroke", "grey")
        .style("stroke-opacity", "0.75")
        .style("stroke-width", "0.3px")
        .attr("transform", "translate(" + (cfg.w / 2 - levelFactor) + ", " + (cfg.h / 2 - levelFactor) + ")");
    }

    //Text indicating at what % each level is
    for (var j = 0; j < cfg.levels; j++) {
      var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
      g.selectAll(".levels")
        .data([1]) //dummy data
        .enter()
        .append("svg:text")
        .attr("x", function (d) {
          return levelFactor * (1 - cfg.factor * Math.sin(0));
        })
        .attr("y", function (d) {
          return levelFactor * (1 - cfg.factor * Math.cos(0));
        })
        .attr("class", "legend")
        .style("font-family", "sans-serif")
        .style("font-size", "10px")
        .attr("transform", "translate(" + (cfg.w / 2 - levelFactor + cfg.ToRight) + ", " + (cfg.h / 2 - levelFactor) + ")")
        .attr("fill", "#737373")
        .text(Format((j + 1) * cfg.maxValue / cfg.levels));
    }

    var chart0Length = chartData[0].length;

    series = 0;

    var axis = g.selectAll(".axis")
      .data(allAxis)
      .enter()
      .append("g")
      .attr("class", "axis");

    axis.append("line")
      .attr("x1", cfg.w / 2)
      .attr("y1", cfg.h / 2)
      .attr("x2", function (d, i) {
        return cfg.w / 2 * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
      })
      .attr("y2", function (d, i) {
        return cfg.h / 2 * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
      })
      .attr("class", "line")
      .style("stroke", "grey")
      .style("stroke-width", "1px");

    axis.append("text")
      .attr("class", "legend")
      .text(function (d) {
        return d
      })
      .style("font-family", "sans-serif")
      .style("font-size", "14px")
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .attr("transform", function (d, i) {
        return "translate(0, -10)"
      })
      .attr("x", function (d, i) {
        return cfg.w / 2 * (1 - cfg.factorLegend * Math.sin((chart0Length - i) * cfg.radians / total)) - 80 * Math.sin((chart0Length - i) * cfg.radians / total);
      })
      .attr("y", function (d, i) {
        return cfg.h / 2 * (1 - Math.cos(i * cfg.radians / total)) - 20 * Math.cos(i * cfg.radians / total);
      });

    chartData.forEach(function (y, x) {
      dataValues = [];
      g.selectAll(".nodes")
        .data(y, function (j, i) {
          dataValues.push([
            cfg.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.sin((chart0Length - i) * cfg.radians / total)),
            cfg.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.cos((chart0Length - i) * cfg.radians / total))
          ]);
        });
      dataValues.push(dataValues[0]);
      g.selectAll(".area")
        .data([dataValues])
        .enter()
        .append("polygon")
        .attr("class", "radar-chart-serie" + series)
        .style("stroke-width", "3px")
        .style("stroke", cfg.color(series))
        .attr("points", function (d) {
          var str = "";
          for (var pti = 0; pti < d.length; pti++) {
            str = str + d[pti][0] + "," + d[pti][1] + " ";
          }
          return str;
        })
        .style("fill", function (j, i) {
          return cfg.color(series)
        })
        .style("fill-opacity", cfg.opacityArea)
        .on('mouseover', function (d) {
          z = "polygon." + d3.select(this).attr("class");
          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", 0.1);
          g.selectAll(z)
            .transition(200)
            .style("fill-opacity", .4);
        })
        .on('mouseout', function () {
          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", cfg.opacityArea);
        });
      series++;
    });
    series = 0;


    chartData.forEach(function (y, x) {
      g.selectAll(".nodes")
        .data(y).enter()
        .append("svg:circle")
        .attr("class", "radar-chart-serie" + series)
        .attr('r', cfg.radius)
        .attr("alt", function (j) {
          return Math.max(j.value, 0)
        })
        .attr("cx", function (j, i) {
          dataValues.push([
            cfg.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.sin((chart0Length - i) * cfg.radians / total)),
            cfg.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.cos((chart0Length - i) * cfg.radians / total))
          ]);
          return cfg.w / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.sin((chart0Length - i) * cfg.radians / total));
        })
        .attr("cy", function (j, i) {
          return cfg.h / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.cos((chart0Length - i) * cfg.radians / total));
        })
        .attr("data-id", function (j) {
          return j.axis
        })
        .style("fill", cfg.color(series)).style("fill-opacity", .9)
        .on('mouseover', function (d) {
          newX = parseFloat(d3.select(this).attr('cx')) - 10;
          newY = parseFloat(d3.select(this).attr('cy')) - 5;

          tooltip
            .attr('x', newX)
            .attr('y', newY)
            .text(Format(d.value))
            .transition(200)
            .style('opacity', 1);

          z = "polygon." + d3.select(this).attr("class");
          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", 0.1);
          g.selectAll(z)
            .transition(200)
            .style("fill-opacity", .7);
        })
        .on('mouseout', function () {
          tooltip
            .transition(200)
            .style('opacity', 0);
          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", cfg.opacityArea);
        })
        .append("svg:title")
        .text(function (j) {
          return Math.max(j.value, 0)
        });

      series++;
    });
    //Tooltip
    tooltip = g.append('text')
      .style('opacity', 0)
      .style('font-family', 'sans-serif')
      .style('font-size', '1.2em');
  }
};

function drawChart(data) {
  var w = 560, h = 560;
  var colorscale = d3.scale.category10();

 // Legend titles
  var LegendOptions = ['Current', 'Future'];

  // Options for the Radar chart, other than default
  var mycfg = {
    w: w,
    h: h,
    maxValue: 5,
    levels: 5,
    ExtraWidthX: 300
  };

  // Call function to draw the Radar chart
  // Will expect that data is in %'s
  RadarChart.draw("#chart", data, mycfg);

  ////////////////////////////////////////////
  /////////// Initiate legend ////////////////
  ////////////////////////////////////////////
  var svg = d3.select('#body')
    .selectAll('svg')
    .append('svg')
    .attr("width", w + 400)
    .attr("height", h + 300);

  // Initiate Legend
  var legend = svg.append("g")
    .attr("class", "legend")
    .attr("height", 100)
    .attr("width", 200)
    .attr('transform', 'translate(90,20)')
  ;
 // Create colour squares
  legend.selectAll('rect')
    .data(LegendOptions)
    .enter()
    .append("rect")
    .attr("x", 4)
    .attr("y", function (d, i) {
      return h + i * 20 + 80;
    })
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", function (d, i) {
      return colorscale(i);
    })
  ;
  // Create text next to squares
  legend.selectAll('text')
    .data(LegendOptions)
    .enter()
    .append("text")
    .attr("x", 20)
    .attr("y", function (d, i) {
      return h + i * 20 + 80 + 9;
    })
    .attr("font-size", "11px")
    .attr("fill", "#737373")
    .text(function (d) {
      return d;
    });
}

