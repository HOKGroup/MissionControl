/**
 * Created by konrad.sobon on 2018-11-02.
 */
angular.module('MissionControlApp').directive('d3AreaBivariate', ['d3', function(d3) {
    return {
        restrict: 'E',
        scope: {
            data: '=',
            top: '=',
            topLabel: '=',
            bottom: '=',
            bottomLabel: '=',
            fillColor: '=',
            onMove: '&d3OnMove',
            onOut: '&d3OnOut'
        },
        link: function(scope, ele) {
            var svg = d3.select(ele[0])
                .append('svg')
                .attr('width', '100%');

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
            scope.$watch('data', function(newVals, oldVals) {
                if(newVals !== oldVals){
                    return scope.render(newVals);
                }
            },true);

            // define render function
            scope.render = function(data){
                if(!data) return;

                // remove all previous items before render
                svg.selectAll('*').remove();

                // setup variables
                var margin = {top: 30, right: 40, bottom: 110, left: 65},
                    margin2 = {top: 430, right: 40, bottom: 30, left: 65},
                    width = d3.select(ele[0])._groups[0][0].offsetWidth - margin.left - margin.right,
                    height = 500 - margin.top - margin.bottom,
                    height2 = 500 - margin2.top - margin2.bottom;

                // set the height based on the calculations above
                svg.attr('height', height + margin.top + margin.bottom);

                var dateFormat = d3.timeFormat('%d %b');
                var parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%S.%LZ');

                var x = d3.scaleTime().range([0, width]),
                    x2 = d3.scaleTime().range([0, width]),
                    y = d3.scaleLinear().range([height, 0]),
                    y2 = d3.scaleLinear().range([height2, 0]);

                var area = d3.area()
                    .x(function(d) { return x(d.date); })
                    .y0(function(d) { return y(d[scope.bottom]); })
                    .y1(function(d) { return y(d[scope.top]); });

                // brushed area
                var area2 = d3.area()
                    .x(function(d) { return x2(d.date); })
                    .y0(function (d) { return y2(d[scope.bottom]); })
                    .y1(function(d) { return y2(d[scope.top]); });

                data.forEach(function(d) {
                    d.date = parseTime(d.createdOn);
                });

                var maxValue = d3.max(data, function(d) { return d[scope.top]; });
                maxValue = getRounded(maxValue);

                x.domain(d3.extent(data, function(d) { return d.date; }));
                y.domain([0, maxValue]);
                x2.domain(x.domain());
                y2.domain(y.domain());

                var ticksNum = 10;
                var yAxisTicks = [];
                var yDomain = [0, maxValue];
                for (var i = 0; i < ticksNum; i++ ){
                    yAxisTicks.push((yDomain[1] - yDomain[0]) / (ticksNum - 1)* i + yDomain[0]);
                }

                var xAxis = d3.axisBottom(x)
                        .ticks(5)
                        .tickFormat(dateFormat);

                var xAxis2 = d3.axisBottom(x2)
                        .ticks(5)
                        .tickFormat(dateFormat);

                var brush = d3.brushX()
                    .extent([[0, 0], [width, height2]])
                    .on('brush end', brushed);

                var zoom = d3.zoom()
                    .scaleExtent([1, Infinity])
                    .translateExtent([[0, 0], [width, height]])
                    .extent([[0, 0], [width, height]])
                    .on('zoom', zoomed);

                var id = guid();

                svg.append('defs').append('clipPath')
                    .attr('id', id)
                    .append('rect')
                    .attr('width', width)
                    .attr('height', height);

                var focus = svg.append('g')
                    .attr('class', 'focus')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                var context = svg.append('g')
                    .attr('class', 'context')
                    .attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')');

                focus.append('path')
                    .data([data])
                    .attr('class', 'area')
                    .attr('fill', scope.fillColor)
                    .attr('clip-path', 'url(#' + id + ')')
                    .attr('d', area);

                focus.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', 'translate(0,' + height + ')')
                    .call(xAxis);

                focus.append('g')
                    .attr('class', 'y axis')
                    .call(d3.axisLeft(y).tickValues(yAxisTicks));

                // Add brushing area below chart.
                context.append('path')
                    .data([data])
                    .attr('class', 'area')
                    .attr('fill', scope.fillColor)
                    .attr('d', area2);

                context.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', 'translate(0,' + height2 + ')')
                    .call(xAxis2);

                context.append('g')
                    .attr('class', 'brush')
                    .call(brush)
                    .call(brush.move, x.range());

                // add tooltips
                var tooltip = svg.append('g')
                    .attr('class', 'focus')
                    .style('display', 'none');

                tooltip.append('line')
                    .attr('class', 'mouse-line')
                    .attr('y1', 0)
                    .attr('y2', height);

                tooltip.append('path')
                    .attr('d', d3.symbol().type(d3.symbolTriangle).size([80]))
                    .style('fill', '#d9534f')
                    .attr('transform', 'translate(0, -8) rotate(180)');

                tooltip.append('text')
                    .attr('class', 'y1')
                    .attr('transform', 'translate(0, -17)')
                    .attr('text-anchor', 'middle');

                var tooltip2 = svg.append('g')
                    .attr('class', 'focus')
                    .style('display', 'none');

                tooltip2.append('path')
                    .attr('d', d3.symbol().type(d3.symbolTriangle).size([80]))
                    .style('fill', '#5cb85c')
                    .attr('transform', 'translate(0, 8)');

                tooltip2.append('text')
                    .attr('class', 'y1')
                    .attr('transform', 'translate(0, 25)')
                    .attr('text-anchor', 'middle');

                svg.append('rect')
                    .attr('class', 'zoom')
                    .attr('width', width)
                    .attr('height', height)
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                    .call(zoom)
                    .on('mouseover', function() {
                        tooltip.style('display', null);
                        tooltip2.style('display', null);
                    })
                    .on('mouseout', function() {
                        tooltip.style('display', 'none');
                        tooltip2.style('display', 'none');
                        scope.onOut();
                    })
                    .on('mousemove', mousemove);

                var bisectDate = d3.bisector(function(d) { return d.date; }).left;

                /**
                 * (Konrad) This method depends on data being supplied in asc order from
                 * earliest to latest. That sorting is originally returned from DB, but in
                 * case that it changed, we might need to re-sort the data here.
                 */
                function mousemove() {
                    var x0 = x.invert(d3.mouse(this)[0]),
                        i = bisectDate(data, x0, 1),
                        d0 = data[i - 1],
                        d1 = data[i];
                    if(!d1) return;
                    var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                    tooltip.attr('transform', 'translate(' + (x(d.date) + margin.left) + ',' + (y(d[scope.top]) + margin.top) + ')');
                    tooltip.select('text.y1').text(scope.topLabel + d[scope.top]);
                    tooltip.select('.mouse-line').attr('y2', height - y(d[scope.top]));
                    tooltip2.attr('transform', 'translate(' + (x(d.date) + margin.left) + ',' + (y(d[scope.bottom]) + margin.top) + ')');
                    tooltip2.select('text.y1').text(scope.bottomLabel + d[scope.bottom]);

                    scope.onMove({ item: { value: d[scope.top] - d[scope.bottom] }});
                }

                /**
                 * Returns value rounded to nearest 10. Either negative or positive.
                 * @param value
                 * @returns {number}
                 */
                function getRounded(value) {
                    return  value < 0
                        ? (Math.ceil((Math.abs(value)+1) / 10) * 10) * -1 // round down to nearest 10
                        : Math.ceil((value+1) / 10) * 10; // round up to nearest 10
                }

                /**
                 * Handles brushing event resetting line, dots and x-axis.
                 */
                function brushed() {
                    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return; // ignore brush-by-zoom
                    var s = d3.event.selection || x2.range();
                    x.domain(s.map(x2.invert, x2));
                    focus.select('.area').attr('d', area);
                    focus.select('.x.axis').call(d3.axisBottom(x));
                    svg.select('.zoom').call(zoom.transform, d3.zoomIdentity
                        .scale(width / (s[1] - s[0]))
                        .translate(-s[0], 0));
                }

                /**
                 * Handles brushing event resetting line, dots and x-axis.
                 */
                function zoomed() {
                    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return; // ignore zoom-by-brush
                    var t = d3.event.transform;
                    x.domain(t.rescaleX(x2).domain());
                    focus.select('.area').attr('d', area);
                    focus.select('.x.axis').call(d3.axisBottom(x));
                    context.select('.brush').call(brush.move, x.range().map(t.invertX, t));
                }

                /**
                 * Generates a unique Id for each chart brush rectangle.
                 * @returns {string}
                 */
                function guid() {
                    function s4() {
                        return Math.floor((1 + Math.random()) * 0x10000)
                            .toString(16)
                            .substring(1);
                    }
                    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
                }
            };
        }
    };
}]);