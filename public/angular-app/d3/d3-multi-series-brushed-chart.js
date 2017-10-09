angular.module('MissionControlApp').directive('d3MultiSeriesLineBrushed', ['d3', function(d3) {
    return {
        restrict: 'E',
        scope: {
            data: '=',
            keys: '=',
            referenceLine: '='
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

                ////////////////////////////////////////////////////
                // Setup basic chart variables.                   //
                ////////////////////////////////////////////////////

                var margin = {top: 10, right: 30, bottom: 100, left: 40},
                    margin2 = {top: 330, right: 30, bottom: 20, left: 40},
                    width = d3.select(ele[0])._groups[0][0].offsetWidth - margin.left - margin.right,
                    height = 400 - margin.top - margin.bottom,
                    height2 = 400 - margin2.top - margin2.bottom;

                // set the height based on the calculations above
                svg.attr('height', height + margin.top + margin.bottom);

                var parseDate = d3.timeParse('%Y-%m-%dT%H:%M:%S.%LZ');
                var dateFormat = d3.timeFormat("%d %b,%H:%M");
                var color = d3.scaleOrdinal(d3.schemeCategory10);

                var x = d3.scaleTime().range([0, width]),
                    x2 = d3.scaleTime().range([0, width]),
                    y = d3.scaleLinear().range([height, 0]),
                    y2 = d3.scaleLinear().range([height2, 0]);

                var xAxis = d3.axisBottom(x).ticks(5).tickFormat(dateFormat),
                    xAxis2 = d3.axisBottom(x2).ticks(5).tickFormat(dateFormat),
                    yAxis = d3.axisLeft(y);

                var brush = d3.brushX()
                    .extent([[0, 0], [width, height2]])
                    .on("brush end", brushed);

                var zoom = d3.zoom()
                    .scaleExtent([1, Infinity])
                    .translateExtent([[0, 0], [width, height]])
                    .extent([[0, 0], [width, height]])
                    .on("zoom", zoomed);

                var line = d3.line() // main lines
                    .defined(function(d) { return !isNaN(d.value); })
                    .curve(d3.curveLinear)
                    .x(function(d) { return x(d.date); })
                    .y(function(d) { return y(d.value); });

                var line2 = d3.line() // secondary brush area lines
                    .defined(function(d) { return !isNaN(d.value); })
                    .curve(d3.curveLinear)
                    .x(function(d) {return x2(d.date); })
                    .y(function(d) {return y2(d.value); });

                color.domain(scope.keys);

                data.forEach(function (d) {
                    d.date = parseDate(d.createdOn)
                });

                var lineData = color.domain().map(function(name){
                    return { name: name, values: data.map(function (d) {
                            return {date: parseDate(d.createdOn), value: +d[name]};
                        })
                    }
                });

                x.domain(d3.extent(data, function(d) { return d.date; }));
                var maxValue = d3.max(lineData, function(c) {
                    return d3.max(c.values, function(v) {
                        return v.value;
                    });
                });

                y.domain([0, maxValue + 20]);
                x2.domain(x.domain());
                y2.domain(y.domain());

                svg.append("defs").append("clipPath")
                    .attr("id", "clip")
                    .append("rect")
                    .attr("width", width)
                    .attr("height", height);

                var focus = svg.append("g")
                    .attr("class", "focus")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var context = svg.append("g")
                    .attr("class", "context")
                    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

                ////////////////////////////////////////////////////
                // Draw main chart.                               //
                ////////////////////////////////////////////////////

                var focuslineGroups = focus.selectAll("g")
                    .data(lineData)
                    .enter()
                    .append("g");

                focuslineGroups.append("path")
                    .attr("class","line")
                    .attr("d", function(d) { return line(d.values); })
                    .style("stroke", function(d) {return color(d.name);})
                    .attr("clip-path", "url(#clip)")
                    .style("opacity", 0)
                    .transition()
                    .duration(1500)
                    .style("opacity", 1);

                focus.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                focus.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);

                ////////////////////////////////////////////////////
                // Secondary chart below main one that contains   //
                // brushing functionality.                        //
                ////////////////////////////////////////////////////

                var contextlineGroups = context.selectAll("g")
                    .data(lineData)
                    .enter().append("g");

                contextlineGroups.append("path")
                    .attr("class", "line")
                    .attr("d", function(d) { return line2(d.values); })
                    .style("stroke", function(d) {return color(d.name);})
                    .attr("clip-path", "url(#clip)");

                context.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height2 + ")")
                    .call(xAxis2);

                context.append("g")
                    .attr("class", "x brush")
                    .call(brush)
                    .selectAll("rect")
                    .attr("y", -6)
                    .attr("height", height2 + 7);

                ////////////////////////////////////////////////////
                // Optional Horizontal Dashed Line that indicates //
                // a "goal" or an average for the given chart.    //
                ////////////////////////////////////////////////////

                if(scope.referenceLine !== null){
                    svg.append("line")
                        .attr("class", "goal-line") // defined in CSS
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                        .attr("x1", 0)
                        .attr("y1", function () { return y(scope.referenceLine.value)})
                        .attr("x2", width)
                        .attr("y2", function () { return y(scope.referenceLine.value)})
                        .style("opacity", 0)
                        .transition()
                        .duration(1500)
                        .style("opacity", 1);

                    svg.append("text")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                        .attr("x", width)
                        .attr("y", function(){ return y(scope.referenceLine.value) - 5; })
                        .style("text-anchor", "end")
                        .text(scope.referenceLine.name + "(" + scope.referenceLine.value + ")");
                }

                ////////////////////////////////////////////////////
                // The hover over effects. It includes a vertical //
                // line, circle and text indicating interpolated  //
                // value.                                         //
                ////////////////////////////////////////////////////

                var mouseG = svg.append("g")
                    .attr("class", "mouse-over-effects");

                mouseG.append("path") // this is the vertical line to follow mouse
                    .attr("class", "mouse-line") // defined in CSS
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .style("opacity", "0");

                // (Konrad) We need to get an array of lines
                // so that later we can iterate over them when handling tooltips
                var lines = [];
                svg.selectAll(".line").each(function(){ lines.push(this); });

                var mousePerLine = mouseG.selectAll('.mouse-per-line')
                    .data(lineData)
                    .enter().append("g")
                    .attr("class", "mouse-per-line");

                mousePerLine.append("circle")
                    .attr("r", 4)
                    .style("stroke", function(d) { return color(d.name); })
                    .style("fill", function(d) { return color(d.name); })
                    .style("stroke-width", "1px")
                    .style("opacity", "0");

                mousePerLine.append("text")
                    .attr("transform", "translate(5,-5)");

                mouseG.append("rect")
                    .attr("class", "zoom") // defined in CSS
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .call(zoom)
                    .on('mouseout', function() { // on mouse out hide line, circles and text
                        svg.select(".mouse-line").style("opacity", "0");
                        svg.selectAll(".mouse-per-line circle").style("opacity", "0");
                        svg.selectAll(".mouse-per-line text").style("opacity", "0");
                    })
                    .on('mouseover', function() { // on mouse in show line, circles and text
                        svg.select(".mouse-line").style("opacity", "1");
                        svg.selectAll(".mouse-per-line circle").style("opacity", "1");
                        svg.selectAll(".mouse-per-line text").style("opacity", "1");
                    })
                    .on('mousemove', mousemove);

                function mousemove(){
                    var mouse = d3.mouse(this);
                    svg.select(".mouse-line")
                        .attr("d", function() {
                            var d = "M" + mouse[0] + "," + height;
                            d += " " + mouse[0] + "," + 0;
                            return d;
                        });

                    svg.selectAll(".mouse-per-line")
                        .attr("transform", function(d, i) {
                            var xDate = x.invert(mouse[0]),
                                bisect = d3.bisector(function(d) { return d.date; }).right;
                            bisect(d.values, xDate);

                            var beginning = 0,
                                end = lines[i].getTotalLength();

                            var pos;
                            var target;
                            while (true) {
                                target = Math.floor((beginning + end) / 2);
                                pos = lines[i].getPointAtLength(target);
                                if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                                    break;
                                }
                                if (pos.x > mouse[0]) end = target;
                                else if (pos.x < mouse[0]) beginning = target;
                                else break; //position found
                            }

                            d3.select(this).select('text')
                                .text(y.invert(pos.y).toFixed(0));

                            return "translate(" + (mouse[0] + margin.left) + "," + (pos.y + margin.top) +")";
                        });
                }

                function brushed() {
                    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
                    var s = d3.event.selection || x2.range();
                    x.domain(s.map(x2.invert, x2));
                    focus.selectAll(".line").attr("d", function(d) { return line(d.values); });
                    focus.select(".x.axis").call(xAxis);
                    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
                        .scale(width / (s[1] - s[0]))
                        .translate(-s[0], 0));
                }

                function zoomed() {
                    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
                    var t = d3.event.transform;
                    x.domain(t.rescaleX(x2).domain());
                    focus.selectAll(".line").attr("d", function(d) { return line(d.values); });
                    focus.select(".x.axis").call(xAxis);
                    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
                }
            };
        }
    };
}]);

