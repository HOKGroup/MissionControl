angular.module('MissionControlApp').directive('d3ParallelCoordinates', ['d3', function(d3) {
    return {
        restrict: 'E',
        scope: {
            data: '=',
            onBrush: '&d3OnBrush', // click function
            callbackMethod: '&formatValue' // format function
        },
        link: function(scope, ele) {
            var svg = d3.select(ele[0])
                .append("svg")
                .attr("width", "100%");

            // on window resize, re-render d3 canvas
            window.onresize = function() {
                return scope.$apply();
            };
            scope.$watch(function(){
                    return angular.element(window)[0].innerWidth;
                }, function(){
                    return scope.render(scope.data);
                }
            );

            // watch for data changes and re-render
            scope.$watch("data", function(newVals) {
                if(!newVals) return;
                return scope.render(newVals);
            }, true);

            scope.render = function (data) {
                if(!data) return;

                svg.selectAll("*").remove();

                var margin = {top: 20, right: 17, bottom: 10, left: 30},
                    width = d3.select(ele[0])._groups[0][0].offsetWidth - margin.left - margin.right,
                    height = 400 - margin.top - margin.bottom;

                // set the height based on the calculations above
                svg.attr('height', height + margin.top + margin.bottom);

                var x = d3.scalePoint().range([margin.left, width + margin.right]),
                    y = {},
                    dragging = {},
                    selected;

                var line = d3.line(),
                    background,
                    foreground,
                    extents;

                x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
                    if(d === "name") {
                        return false;
                    }
                    return y[d] = d3.scaleLinear()
                        .domain(d3.extent(data, function(p) {
                            return +p[d]; }))
                        .range([height, 0]);
                }));

                extents = dimensions.map(function(p) { return [0,0]; });

                // Add grey background lines for context.
                background = svg.append("g")
                    .attr("class", "background")
                    .attr("transform", "translate(" + (margin.left-margin.right) + "," + margin.top + ")")
                    .selectAll("path")
                    .data(data)
                    .enter().append("path")
                    .attr("d", path);

                // Add blue foreground lines for focus.
                foreground = svg.append("g")
                    .attr("class", "foreground")
                    .attr("transform", "translate(" + (margin.left-margin.right) + "," + margin.top + ")")
                    .selectAll("path")
                    .data(data)
                    .enter().append("path")
                    .attr("d", path);

                //TODO: Dragging is cool, but this needs fixing where axis are out of position after drag.
                // Add a group element for each dimension.
                var g = svg.selectAll(".dimension")
                    .data(dimensions)
                    .enter().append("g")
                    .attr("class", "dimension")
                    .attr("transform", function(d) {  return "translate(" + (x(d)+margin.left-margin.right) + ")"; });
                    // .call(d3.drag()
                    //     .subject(function(d) { return {x: x(d)}; })
                    //     .on("start", function(d) {
                    //         dragging[d] = x(d);
                    //         background.attr("visibility", "hidden");
                    //     })
                    //     .on("drag", function(d) {
                    //         dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                    //         foreground.attr("d", path);
                    //         dimensions.sort(function(a, b) { return position(a) - position(b); });
                    //         x.domain(dimensions);
                    //         g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
                    //     })
                    //     .on("end", function(d) {
                    //         delete dragging[d];
                    //         transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                    //         transition(foreground).attr("d", path);
                    //         background
                    //             .attr("d", path)
                    //             .transition()
                    //             .delay(500)
                    //             .duration(0)
                    //             .attr("visibility", null);
                    //     }));

                // Add an axis and title.
                g.append("g")
                    .attr("class", "y axis")
                    .each(function(d) {
                        var ticksNum = 10;
                        var yAxisTicks = [];
                        var yDomain = y[d].domain();
                        if(d === "Size"){
                            for (var i = 0; i < ticksNum; i++ ){
                                yAxisTicks.push((yDomain[1] - yDomain[0]) / (ticksNum - 1)* i + yDomain[0]);
                            }
                            d3.select(this).call(d3.axisLeft(y[d]).tickValues(yAxisTicks).tickFormat(function (size) {
                                return scope.callbackMethod({item: size});
                            }));
                        }else{
                            for (var i = 0; i < ticksNum; i++ ){
                                yAxisTicks.push((yDomain[1] - yDomain[0]) / (ticksNum - 1)* i + yDomain[0]);
                            }
                            d3.select(this).call(d3.axisLeft(y[d]).tickValues(yAxisTicks));
                        }
                    })
                    .attr("transform", "translate(0," + margin.top + ")")
                    .append("text")
                    .style("text-anchor", "middle")
                    .attr("y", -9)
                    .text(function(d) { return d; });

                // Add and store a brush for each axis.
                g.append("g")
                    .attr("class", "brush")
                    .attr("transform", "translate(0," + margin.top + ")")
                    .each(function(d) {
                        d3.select(this)
                            .call(y[d].brush = d3.brushY().extent([[-8, 0], [8,height]])
                                .on("start", brushstart)
                                .on("brush", gobrush)
                                .on("brush", brush_parallel_chart)
                                .on("end", endBrush)
                            );
                    })
                    .selectAll("rect")
                    .attr("x", -8)
                    .attr("width", 16);

                function position(d) {
                    var v = dragging[d];
                    return v === null || v === undefined ? x(d) : v;
                }

                function transition(g) {
                    return g.transition().duration(500);
                }

                // Returns the path for a given data point.
                function path(d) {
                    return line(dimensions.map(function(p) {
                        return [position(p), y[p](d[p])];
                    }));
                }

                function brushstart(selectionName) {
                    foreground.style("display", "none");

                    var dimensionsIndex = dimensions.indexOf(selectionName);

                    extents[dimensionsIndex] = [0, 0];

                    foreground.style("display", function(d) {
                        return dimensions.every(function(p, i) {
                            if(extents[i][0]===0 && extents[i][0]===0) {
                                return true;
                            }
                            return extents[i][1] <= d[p] && d[p] <= extents[i][0];
                        }) ? null : "none";
                    });
                }

                function gobrush() {
                    d3.event.sourceEvent.stopPropagation();
                }

                function within(d, extent){
                    return extent[1] <= d && d <= extent[0];
                }

                function endBrush() {
                    selected = data.filter(function(item){
                        return dimensions.every(function (dim, index) {
                            if (extents[index][0] === 0 && extents[index][1] === 0) {
                                return true;
                            }
                            return within(item[dim], extents[index]);
                        });
                    });

                    scope.onBrush({item: selected});
                }

                // Handles a brush event, toggling the display of foreground lines.
                function brush_parallel_chart() {
                    for(var i = 0; i < dimensions.length; ++i){
                        if(d3.event.target === y[dimensions[i]].brush) {
                            extents[i] = d3.event.selection.map(y[dimensions[i]].invert,y[dimensions[i]]);
                        }
                    }

                    foreground.style("display", function(d) {
                        return dimensions.every(function(p, i) {
                            if(extents[i][0]===0 && extents[i][1]===0) {
                                return true;
                            }
                            return within(d[p], extents[i])
                        }) ? null : "none";
                    });
                }
            };
        }
    };
}]);


