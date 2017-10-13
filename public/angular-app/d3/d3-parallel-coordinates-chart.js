angular.module('MissionControlApp').directive('d3ParallelCoordinates', ['d3', function(d3) {
    return {
        restrict: 'E',
        scope: {
            data: '=',
            onBrush: '&d3OnBrush' // click function
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

                // var cars = [{name: "someName", param1: 12, param2: 13, param3: 40},
                //     {name: "someName2", param1: 40, param2: 23, param3: 30},
                //     {name: "someName3", param1: 20, param2: 53, param3: 50},
                //     {name: "someName4", param1: 10, param2: 10, param3: 10},
                //     {name: "someName5", param1: 12, param2: 23, param3: 12}];

                var margin = {top: 20, right: 10, bottom: 10, left: 20},
                    width = d3.select(ele[0])._groups[0][0].offsetWidth - margin.left - margin.right,
                    height = 400 - margin.top - margin.bottom;

                // set the height based on the calculations above
                svg.attr('height', height + margin.top + margin.bottom);

                var x = d3.scaleBand().rangeRound([0, width]).padding(1),
                    y = {},
                    dragging = {},
                    selected;

                var line = d3.line(),
                    background,
                    foreground,
                    extents;

                // TODO: This part needs re-writing to account for the fact that we are
                // TODO: ...not dealing with CSV file.
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
                    .attr("transform", "translate(0," + margin.top + ")")
                    .selectAll("path")
                    .data(data)
                    .enter().append("path")
                    .attr("d", path);

                // Add blue foreground lines for focus.
                foreground = svg.append("g")
                    .attr("class", "foreground")
                    .attr("transform", "translate(0," + margin.top + ")")
                    .selectAll("path")
                    .data(data)
                    .enter().append("path")
                    .attr("d", path);

                // Add a group element for each dimension.
                var g = svg.selectAll(".dimension")
                    .data(dimensions)
                    .enter().append("g")
                    .attr("class", "dimension")
                    .attr("transform", function(d) {  return "translate(" + x(d) + ")"; })
                    .call(d3.drag()
                        .subject(function(d) { return {x: x(d)}; })
                        .on("start", function(d) {
                            dragging[d] = x(d);
                            background.attr("visibility", "hidden");
                        })
                        .on("drag", function(d) {
                            dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                            foreground.attr("d", path);
                            dimensions.sort(function(a, b) { return position(a) - position(b); });
                            x.domain(dimensions);
                            g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
                        })
                        .on("end", function(d) {
                            delete dragging[d];
                            transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                            transition(foreground).attr("d", path);
                            background
                                .attr("d", path)
                                .transition()
                                .delay(500)
                                .duration(0)
                                .attr("visibility", null);
                        }));

                // Add an axis and title.
                g.append("g")
                    .attr("class", "y axis")
                    .each(function(d) {  d3.select(this).call(d3.axisLeft(y[d]));})
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
                                .on("brush start", brushstart)
                                .on("brush", brush_parallel_chart));
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

                function brushstart() {
                    d3.event.sourceEvent.stopPropagation();
                }

                function within(d, extent){
                    return extent[1] <= d && d <= extent[0];
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

                    selected = data.filter(function(item){
                        if(dimensions.every(function(dim, index){
                                if(extents[index][0]===0 && extents[index][1]===0) {
                                    return true;
                                }
                                return within(item[dim], extents[index]);
                            })){
                            return true;
                        }
                    });

                    scope.onBrush({item: selected});
                }
            };
        }
    };
}]);


