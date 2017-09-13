// angular.module('MissionControlApp').directive('d3Line', ['d3', function(d3) {
//     return {
//         restrict: 'E',
//         scope: {
//             data: '=',
//             formatOptions: '='
//         },
//         link: function(scope, ele) {
//             // var countUp = function() {
//             //     $timeout(countUp, 500);
//             // };
//             // $timeout(countUp, 500, false);
//
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
//             scope.$watch('data', function(data) {
//                 return scope.render(data);
//             }, true);
//
//             // define render function
//             scope.render = function(data){
//                 if(!data) return;
//
//                 // remove all previous items before render
//                 svg.selectAll("*").remove();
//
//                 // setup variables
//                 var margin = {top: 10, right: 30, bottom: 20, left: 40},
//                     width = d3.select(ele[0])[0][0].offsetWidth - margin.left - margin.right,
//                     height = 400 - margin.top - margin.bottom;
//
//                 // set the height based on the calculations above
//                 svg.attr('height', height + margin.top + margin.bottom);
//
//                 var parseDate = d3.time.format('%Y-%m-%dT%H:%M:%S.%LZ').parse;
//                 var dateFormat = d3.time.format("%d %b");
//
//                 var x = d3.time.scale().range([0, width]);
//                 var y = d3.scale.linear().range([height, 0]);
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
//                     .ticks(9)
//                     .tickFormat(function (d) {
//                         return d3.format(scope.formatOptions.specifier)(d * scope.formatOptions.multiplier) + scope.formatOptions.suffix;
//                     });
//
//                 var line = d3.svg.line()
//                     .x(function(d) { return x(d.date) + margin.left; })
//                     .y(function(d) { return y(d.value); });
//
//                 data.forEach(function(d) {
//                     d.date = parseDate(d.createdOn);
//                     d.value = +d.value;
//                 });
//
//                 x.domain(d3.extent(data, function(d) { return d.date; }));
//                 y.domain([0, d3.max(data, function (d) { return d.value; })]);
//
//                 // Add the valueline path.
//                 svg.append("path")
//                     .datum(data)
//                     .attr("d", line)
//                     .attr("class", "line")
//                     .attr("transform", "translate(0," + margin.top + ")")
//                     .attr("stroke", "steelblue")
//                     .style("opacity", 0)
//                     .transition()
//                     .duration(1500)
//                     .style("opacity", 1);
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
//                 var focus = svg.append("g")
//                     .attr("class", "focus")
//                     .style("display", "none");
//
//                 focus.append("line")
//                     .attr("class", "mouse-line")
//                     .attr("y1", 0)
//                     .attr("y2", height);
//
//                 focus.append("circle")
//                     .attr("r", 5)
//                     .attr("fill", "steelblue")
//                     .attr("stroke-width", "1px");
//
//                 focus.append("text")
//                     .attr("transform", "translate(5, 10)");
//
//                 svg.append("rect")
//                     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
//                     .attr("fill", "none")
//                     .attr("width", width)
//                     .attr("height", height)
//                     .attr('pointer-events', 'all')
//                     .on("mouseover", function() { focus.style("display", null); })
//                     .on("mouseout", function() { focus.style("display", "none"); })
//                     .on("mousemove", mousemove);
//
//                 var bisectDate = d3.bisector(function(d) { return d.date; }).left;
//                 function mousemove() {
//                     var x0 = x.invert(d3.mouse(this)[0]),
//                         i = bisectDate(data, x0, 1),
//                         d0 = data[i - 1],
//                         d1 = data[i],
//                         d = x0 - d0.date > d1.date - x0 ? d1 : d0;
//                     focus.attr("transform", "translate(" + (x(d.date) + margin.left) + "," + (y(d.value) + margin.top) + ")");
//                     focus.select("text").text(d3.format("0.2" + scope.formatOptions.specifier)(d.value * scope.formatOptions.multiplier) + scope.formatOptions.suffix);
//                     focus.select(".mouse-line").attr("y2", height - y(d.value));
//                 }
//             }
//         }
//     };
// }]);
