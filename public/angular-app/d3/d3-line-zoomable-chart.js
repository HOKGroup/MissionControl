angular.module('MissionControlApp').directive('d3ZoomableLine', ['d3', function(d3) {
    return {
        restrict: 'E',
        scope: {
            data: '=',
            domainY: '=', //Y
            callbackMethod: '&formatValue'
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
            scope.$watch('data', function(data) {
                return scope.render(data);
            }, true);

            // define render function
            scope.render = function(data){
                if(!data) return;

                // remove all previous items before render
                svg.selectAll("*").remove();

                // setup variables
                var margin = {top: 20, right: 25, bottom: 110, left: 55},
                    margin2 = {top: 330, right: 25, bottom: 30, left: 55},
                    width = d3.select(ele[0])._groups[0][0].offsetWidth - margin.left - margin.right,
                    height = 400 - margin.top - margin.bottom,
                    height2 = 400 - margin2.top - margin2.bottom;

                // set the height based on the calculations above
                svg.attr('height', height + margin.top + margin.bottom);

                var parseDate = d3.timeParse('%Y-%m-%dT%H:%M:%S.%LZ');
                var dateFormat = d3.timeFormat("%d %b,%H:%M");

                data.forEach(function(d) {
                    d.date = parseDate(d.createdOn);
                    d.value = +d.value;
                });

                var x = d3.scaleTime().range([0, width]),
                    x2 = d3.scaleTime().range([0, width]),
                    y = d3.scaleLinear().range([height, 1]),
                    y2 = d3.scaleLinear().range([height2, 1]);

                x.domain(d3.extent(data, function(d) { return d.date; }));
                if(scope.domainY){
                    y.domain([0, scope.domainY]);
                } else {
                    y.domain([0, d3.max(data, function(d) { return d.value; })]);
                }
                x2.domain(x.domain());
                y2.domain(y.domain());

                var ticksNum = 10;
                var yAxisTicks = [];
                var yDomain = [0, d3.max(data, function(d) { return d.value; })];
                for (var i = 0; i < ticksNum; i++ ){
                    yAxisTicks.push((yDomain[1] - yDomain[0]) / (ticksNum - 1)* i + yDomain[0]);
                }

                var xAxis = d3.axisBottom(x).ticks(5).tickFormat(dateFormat),
                    xAxis2 = d3.axisBottom(x2).ticks(5).tickFormat(dateFormat),
                    yAxis = d3.axisLeft(y).tickValues(yAxisTicks).tickFormat(function(d){
                        return scope.callbackMethod({item: d});
                    });

                var brush = d3.brushX()
                    .extent([[0, 0], [width, height2]])
                    .on("brush end", brushed);

                var zoom = d3.zoom()
                    .scaleExtent([1, Infinity])
                    .translateExtent([[0, 0], [width, height]])
                    .extent([[0, 0], [width, height]])
                    .on("zoom", zoomed);

                var line = d3.line()
                    .curve(d3.curveLinear)
                    .x(function(d) { return x(d.date); })
                    .y(function(d) { return y(d.value); });

                var line2 = d3.line()
                    .curve(d3.curveLinear)
                    .x(function(d) { return x2(d.date); })
                    .y(function(d) { return y2(d.value); });

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

                focus.append("path")
                    .datum(data)
                    .attr("class", "line")
                    .attr("clip-path", "url(#clip)")
                    .attr("d", line);

                focus.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                focus.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);

                context.append("path")
                    .datum(data)
                    .attr("class", "line")
                    .attr("d", line2);

                context.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height2 + ")")
                    .call(xAxis2);

                context.append("g")
                    .attr("class", "brush")
                    .call(brush)
                    .call(brush.move, x.range());

                var tooltip = svg.append("g")
                    .attr("class", "focus")
                    .style("display", "none");

                tooltip.append("line")
                    .attr("class", "mouse-line")
                    .attr("y1", 0)
                    .attr("y2", height);

                tooltip.append("circle")
                    .attr("r", 5)
                    .attr("fill", "steelblue")
                    .attr("stroke-width", "1px");

                tooltip.append("text")
                    .attr("transform", "translate(0, -7)")
                    .attr("text-anchor", "middle");

                svg.append("rect")
                    .attr("class", "zoom")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .call(zoom)
                    .on("mouseover", function() { tooltip.style("display", null); })
                    .on("mouseout", function() { tooltip.style("display", "none"); })
                    .on("mousemove", mousemove);

                var bisectDate = d3.bisector(function(d) { return d.date; }).left;

                function mousemove() {
                    var x0 = x.invert(d3.mouse(this)[0]),
                        i = bisectDate(data, x0, 1),
                        d0 = data[i - 1],
                        d1 = data[i];
                    if(!d1) return;
                    var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                    tooltip.attr("transform", "translate(" + (x(d.date) + margin.left) + "," + (y(d.value) + margin.top) + ")");
                    tooltip.select("text").text(scope.callbackMethod({item: d.value}));
                    tooltip.select(".mouse-line").attr("y2", height - y(d.value));
                }

                function brushed() {
                    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
                    var s = d3.event.selection || x2.range();
                    x.domain(s.map(x2.invert, x2));
                    focus.select(".line").attr("d", line);
                    focus.select(".x.axis").call(xAxis);
                    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
                        .scale(width / (s[1] - s[0]))
                        .translate(-s[0], 0));
                }

                function zoomed() {
                    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
                    var t = d3.event.transform;
                    x.domain(t.rescaleX(x2).domain());
                    focus.select(".line").attr("d", line);
                    focus.select(".x.axis").call(xAxis);
                    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
                }
            }
        }
    };
}]);
