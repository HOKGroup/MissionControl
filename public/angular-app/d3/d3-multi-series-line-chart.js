// /**
//  * Created by konrad.sobon on 2017-06-07.
//  */
// angular.module('MissionControlApp').directive('d3MultiSeriesLine', ['d3', function(d3) {
//     return {
//         restrict: 'E',
//         scope: {
//             data: '=',
//             keys: '=',
//             referenceLine: '='
//         },
//         link: function(scope, ele) {
//             var svg = d3.select(ele[0])
//                 .append("svg")
//                 .attr("width", "100%");
//
//             // on window resize, re-render d3 canvas
//             window.onresize = function() {
//                 return scope.$apply();
//             };
//             scope.$watch(function(){
//                     return angular.element(window)[0].innerWidth;
//                 }, function(){
//                     return scope.render(scope.data);
//                 }
//             );
//
//             // watch for data changes and re-render
//             scope.$watch("data", function(newVals) {
//                 if(!newVals) return;
//                 return scope.render(newVals);
//             }, true);
//
//             scope.render = function (data) {
//                 if(!data) return;
//
//                 svg.selectAll("*").remove();
//
//                 // setup variables
//                 var width, height;
//                 var margin = {top: 5, right: 25, bottom: 20, left: 30};
//
//                 width = d3.select(ele[0])[0][0].offsetWidth - margin.left - margin.right;
//                 height = 300 - margin.top - margin.bottom;
//
//                 // set the height based on the calculations above
//                 svg.attr('height', height + margin.top + margin.bottom);
//
//                 var parseDate = d3.time.format('%Y-%m-%dT%H:%M:%S.%LZ').parse;
//                 var dateFormat = d3.time.format("%d %b");
//
//                 var x = d3.time.scale()
//                     .range([0, width]);
//
//                 var y = d3.scale.linear()
//                     .range([height, 0]);
//
//                 var color = d3.scale.category10();
//
//                 var xAxis = d3.svg.axis()
//                     .scale(x)
//                     .orient("bottom")
//                     .ticks(6)
//                     .tickFormat(dateFormat);
//
//                 var yAxis = d3.svg.axis()
//                     .scale(y)
//                     .orient("left")
//                     .ticks(9);
//
//                 var line = d3.svg.line()
//                     .interpolate("basis")
//                     .x(function (d) { return x(d.date); })
//                     .y(function (d) { return y(d.value); });
//
//                 color.domain(scope.keys);
//
//                 data.forEach(function (d) {
//                     d.date = parseDate(d.createdOn)
//                 });
//
//                 x.domain(d3.extent(data, function(d) { return d.date; }));
//
//                 var lineData = color.domain().map(function(name){
//                     return {
//                         name: name,
//                         values: data.map(function (d) {
//                             return {date: parseDate(d.createdOn), value: +d[name]};
//                         })
//                     }
//                 });
//
//                 var maxValue = d3.max(lineData, function(c) {
//                     return d3.max(c.values, function(v) {
//                         return v.value;
//                     });
//                 });
//
//                 y.domain([0, maxValue + 20]);
//
//                 // Add the X Axis
//                 svg.append("g")
//                     .attr("class", "x axis") // defined in CSS
//                     .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
//                     .call(xAxis);
//
//                 // Add the Y Axis
//                 svg.append("g")
//                     .attr("class", "y axis") // defined in CSS
//                     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
//                     .call(yAxis);
//
//                 var svgLine = svg.selectAll(".chart")
//                     .data(lineData)
//                     .enter().append("g")
//                     .attr("class", "chart");
//
//                 svgLine.append("path")
//                     .attr("class", "line")
//                     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
//                     .attr("d", function(d) { return line(d.values); })
//                     .style("stroke", function(d) { return color(d.name); })
//                     .style("opacity", 0)
//                     .transition()
//                     .duration(1500)
//                     .style("opacity", 1);
//
//                 svgLine.append("text")
//                     .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
//                     .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.value) + ")"; })
//                     .attr("x", margin.left)
//                     .attr("y", -5)
//                     .attr("text-anchor", "end")
//                     .attr("dy", ".35em")
//                     .text(function(d) { return d.name; });
//
//                 if(scope.referenceLine !== null){
//                     svg.append("line")
//                         .attr("class", "goal-line") // defined in CSS
//                         .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
//                         .attr("x1", 0)
//                         .attr("y1", function () { return y(scope.referenceLine.value)})
//                         .attr("x2", width)
//                         .attr("y2", function () { return y(scope.referenceLine.value)})
//                         .style("opacity", 0)
//                         .transition()
//                         .duration(1500)
//                         .style("opacity", 1);
//
//                     svg.append("text")
//                         .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
//                         .attr("x", width)
//                         .attr("y", function(){ return y(scope.referenceLine.value) - 5; })
//                         .style("text-anchor", "end")
//                         .text(scope.referenceLine.name + "(" + scope.referenceLine.value + ")");
//                 }
//
//                 var mouseG = svg.append("g")
//                     .attr("class", "mouse-over-effects");
//
//                 mouseG.append("path") // this is the black vertical line to follow mouse
//                     .attr("class", "mouse-line") // defined in CSS
//                     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
//                     .style("opacity", "0");
//
//                 var lines = [];
//                 svg.selectAll(".line").each(function(){
//                     lines.push(this);
//                 });
//
//                 var mousePerLine = mouseG.selectAll('.mouse-per-line')
//                     .data(lineData)
//                     .enter()
//                     .append("g")
//                     .attr("class", "mouse-per-line");
//
//                 mousePerLine.append("circle")
//                     .attr("r", 4)
//                     .style("stroke", function(d) { return color(d.name); })
//                     .style("fill", function(d) { return color(d.name); })
//                     .style("stroke-width", "1px")
//                     .style("opacity", "0");
//
//                 mousePerLine.append("text")
//                     .attr("transform", "translate(5,10)");
//
//                 mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
//                     .attr('width', width) // can't catch mouse events on a g element
//                     .attr('height', height)
//                     .attr('fill', 'none')
//                     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
//                     .attr('pointer-events', 'all')
//                     .on('mouseout', function() { // on mouse out hide line, circles and text
//                         svg.select(".mouse-line")
//                             .style("opacity", "0");
//                         svg.selectAll(".mouse-per-line circle")
//                             .style("opacity", "0");
//                         svg.selectAll(".mouse-per-line text")
//                             .style("opacity", "0");
//                     })
//                     .on('mouseover', function() { // on mouse in show line, circles and text
//                         svg.select(".mouse-line")
//                             .style("opacity", "1");
//                         svg.selectAll(".mouse-per-line circle")
//                             .style("opacity", "1");
//                         svg.selectAll(".mouse-per-line text")
//                             .style("opacity", "1");
//                     })
//                     .on('mousemove', function() { // mouse moving over canvas
//                         var mouse = d3.mouse(this);
//                         svg.select(".mouse-line")
//                             .attr("d", function() {
//                                 var d = "M" + mouse[0] + "," + height;
//                                 d += " " + mouse[0] + "," + 0;
//                                 return d;
//                             });
//
//                         svg.selectAll(".mouse-per-line")
//                             .attr("transform", function(d, i) {
//                                 var xDate = x.invert(mouse[0]),
//                                     bisect = d3.bisector(function(d) { return d.date; }).right;
//                                 bisect(d.values, xDate);
//
//                                 var beginning = 0,
//                                     end = lines[i].getTotalLength();
//
//                                 var pos;
//                                 var target;
//                                 while (true) {
//                                     target = Math.floor((beginning + end) / 2);
//                                     pos = lines[i].getPointAtLength(target);
//                                     if ((target === end || target === beginning) && pos.x !== mouse[0]) {
//                                         break;
//                                     }
//                                     if (pos.x > mouse[0]) end = target;
//                                     else if (pos.x < mouse[0]) beginning = target;
//                                     else break; //position found
//                                 }
//
//                                 d3.select(this).select('text')
//                                     .text(y.invert(pos.y).toFixed(0));
//
//                                 return "translate(" + (mouse[0] + margin.left) + "," + (pos.y + margin.top) +")";
//                             });
//                     });
//             };
//         }
//     };
// }]);
