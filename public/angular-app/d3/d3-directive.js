// /**
//  * Created by konrad.sobon on 2017-05-22.
//  */
// angular.module('MissionControlApp').directive('d3Bars', ['d3', function(d3) {
//     return {
//         restrict: 'EA',
//         scope: {
//             data: "=",
//             label: "=",
//             onClick: "&"
//         },
//         link: function(scope, iElement) {
//             var svg = d3.select(iElement[0])
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
//             scope.$watch('data', function(newVals) {
//                 return scope.render(newVals);
//             }, true);
//
//             // define render function
//             scope.render = function(data){
//                 if(data === undefined){
//                     return;
//                 }
//                 // remove all previous items before render
//                 svg.selectAll("*").remove();
//
//                 // setup variables
//                 var width, height, max;
//                 var margin = {top: 5, right: 30, bottom: 10, left: 150};
//
//                 width = d3.select(iElement[0])[0][0].offsetWidth - margin.left - margin.right;
//                 height = (scope.data.length * 35) + margin.top + margin.bottom;
//                 max = 100;
//
//                 // set the height based on the calculations above
//                 svg.attr('height', height);
//
//                 var x = d3.scale.linear()
//                     .domain([0, 100])
//                     .range([0, width]);
//
//                 var y = d3.scale.ordinal()
//                     .domain(data.map(function (d) { return d.user; }))
//                     .rangeBands([0, height], 0.1, 0.35);
//
//                 // var color = d3.scale.category20c();
//                 var color = d3.scale.linear()
//                     .domain([0, 25, 50, 75, 100])
//                     .range(["#51b75d", "#90eb9d","#ffff8c","#f5c93f","#c45c44"])
//                     .interpolate(d3.interpolateHcl);
//
//                 var xAxis = d3.svg.axis()
//                     .scale(x)
//                     .orient("bottom")
//                     .innerTickSize(-(height-5));
//
//                 //create the rectangles for the bar chart
//                 svg.selectAll("rect")
//                     .data(data)
//                     .enter()
//                     .append("rect")
//                     .attr("fill", function(d){return color(d.value); })
//                     .on("click", function(d){return scope.onClick({item: d});})
//                     .attr("height", y.rangeBand()) // height of each bar
//                     .attr("width", 0) // initial width of 0 for transition
//                     .attr("x", margin.left) // half of the 20 side margin specified above
//                     .attr("y", function (d) { return y(d.user); }) // height + margin between bars
//                     .transition()
//                     .duration(1000)
//                     .attr("width", function(d){ return d.value/(max/width); });
//
//                 svg.selectAll("text")
//                     .data(data)
//                     .enter()
//                     .append("text")
//                     .attr("fill", "#000")
//                     .attr("y", function(d){return y(d.user) + (y.rangeBand() / 2);})
//                     .attr("x", 150)
//                     .attr("text-anchor", "end")
//                     .attr("dy", ".35em")
//                     .attr("dx", -5)
//                     .text(function(d){return d[scope.label];});
//
//                 svg.append("g")
//                     .selectAll("valueLabels")
//                     .data(data)
//                     .enter()
//                     .append("text")
//                     .attr("fill", "#000")
//                     .attr("y", function(d){return y(d.user) + (y.rangeBand() / 2);})
//                     .attr("x", function(d){return x(d.value) + margin.left;})
//                     .attr("dx", 5)
//                     .attr("dy", ".35em")
//                     .text(function(d){return parseFloat(d.value).toFixed(0) + "%";})
//                     .attr("fill-opacity", 0)
//                     .transition()
//                     .duration(1500)
//                     .attr("fill-opacity", 1);
//
//                 svg.append("g")
//                     .attr("class", "x axisHorizontal")
//                     .attr("transform", "translate(" +  margin.left + "," + (height-margin.bottom) + ")")
//                     .call(xAxis);
//             };
//         }
//     };
// }]);
