// Data is exected in following format:
// data = [
//      { onOpened: 12,
//        onSynched: 12,
//        user: konrad.sobon,
//        values: [
//          { name: onOpened,
//            value: 12,
//            user: konrad.sobon},
//          { name: onSynched,
//            value: 12,
//            user: konrad.sobon}]
//      }]

angular.module('MissionControlApp').directive('d3GroupedHorizontalBarChart', ['d3', function(d3) {
    return {
        restrict: 'E',
        scope: {
            data: '=',
            onClick: '&d3OnClick',
            referenceLine: '='
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
            scope.$watch('data', function(newVals) {
                if(!newVals) return;
                return scope.render(newVals);
            }, true);

            scope.renderLineChart = function (data) {
                if(!data) return;

                // remove all previous items before render
                svg.selectAll('*').remove();

                // setup variables
                var margin = {top: 5, right: 10, bottom: 20, left: 30},
                    width = d3.select(ele[0])._groups[0][0].offsetWidth - margin.left - margin.right,
                    height = 300 - margin.top - margin.bottom;

                // set the height based on the calculations above
                svg.attr('height', height + margin.top + margin.bottom)
                    .on('dblclick', function () { scope.render(scope.data);});

                var parseDate = d3.timeParse('%Y-%m-%dT%H:%M:%S.%LZ');
                var dateFormat = d3.timeFormat('%d %b');

                var x = d3.scaleTime().range([0, width]);
                var y = d3.scaleLinear().range([height, 0]);

                var xAxis = d3.axisBottom(x)
                    .ticks(6)
                    .tickFormat(dateFormat);

                var yAxis = d3.axisLeft(y)
                    .ticks(9);

                var line = d3.line()
                    .x(function(d) { return x(d.date) + margin.left; })
                    .y(function(d) { return y(d.value); });

                data.forEach(function(d) {
                    d.date = parseDate(d.createdOn);
                    d.value = +d.value;
                });

                x.domain(d3.extent(data, function(d) { return d.date; }));
                y.domain([0, 100]);

                // Add the line.
                svg.append('path')
                    .datum(data)
                    .attr('d', line)
                    .attr('transform', 'translate(0,' + margin.top + ')')
                    .attr('stroke', 'steelblue')
                    .attr('fill', 'none')
                    .attr('stroke-width', 1)
                    .attr('pointer-events', 'none')
                    .style('opacity', 0)
                    .transition()
                    .duration(1500)
                    .style('opacity', 1);

                // Add invisible "thick" line for better click handling
                svg.append('path')
                    .datum(data)
                    .attr('d', line)
                    .attr('transform', 'translate(0,' + margin.top + ')')
                    .attr('stroke', 'steelblue')
                    .attr('fill', 'none')
                    .attr('visibility', 'hidden')
                    .attr('stroke-width', 6)
                    .attr('pointer-events', 'all')
                    .on('mouseover', function() { d3.select(this).style('cursor', 'pointer');})
                    .on('mouseout', function() { d3.select(this).style('cursor', 'default');})
                    .on('click', function(){scope.render(scope.data);});

                // Add the X Axis
                svg.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
                    .call(xAxis)
                    .style('opacity', 0)
                    .transition()
                    .duration(500)
                    .style('opacity', 1);

                // Add the Y Axis
                svg.append('g')
                    .attr('class', 'y axis')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                    .call(yAxis).style('opacity', 0)
                    .transition()
                    .duration(500)
                    .style('opacity', 1);

                if(scope.referenceLine !== null){
                    svg.append('line')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                        .attr('x1', 0)
                        .attr('y1', function () { return y(scope.referenceLine.value);})
                        .attr('x2', width)
                        .attr('y2', function () { return y(scope.referenceLine.value);})
                        .style('stroke', '#777')
                        .style('stroke-dasharray', '3,3')
                        .style('stroke-width', '0.2')
                        .style('opacity', 0)
                        .transition()
                        .duration(1500)
                        .style('opacity', 1);

                    svg.append('text')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                        .attr('x', width)
                        .attr('y', function(){ return y(scope.referenceLine.value) - 5; })
                        .style('text-anchor', 'end')
                        .text(scope.referenceLine.name + '(' + scope.referenceLine.value + ')');
                }
            };

            // define render function for grouped bar charts
            scope.render = function(data){
                if(!data) return;

                // remove all previous items before render
                svg.selectAll('*').remove();

                // setup variables
                var width, height;
                var margin = {top: 5, right: 35, bottom: 70, left: 150};

                width = d3.select(ele[0])._groups[0][0].offsetWidth - margin.left - margin.right;
                if(scope.data.length === 1){
                    height = 130 - margin.top - margin.bottom;
                } else {
                    height = (scope.data.length * 70) - margin.top - margin.bottom;
                }

                // set the height based on the calculations above
                svg.attr('height', height + margin.top + margin.bottom);

                var y0 = d3.scaleBand()
                    .rangeRound([0, height])
                    .paddingInner(0.005);

                var y1 = d3.scaleBand()
                    .padding(0.005);

                var x = d3.scaleLinear()
                    .rangeRound([0, width]);

                var color = d3.scaleLinear()
                    .domain([0, 25, 50, 75, 100])
                    .range(['#51b75d', '#90eb9d','#ffff8c','#f5c93f','#c45c44'])
                    .interpolate(d3.interpolateHcl);

                var xAxis = d3.axisBottom(x)
                    .tickSizeInner(-(height-5))
                    .tickPadding(8);

                var keys = d3.keys(data[0]).filter(function(key) { return key !== 'user'; });

                y0.domain(data.map(function(d) { return d.user; }));
                y1.domain(keys).rangeRound([0, y0.bandwidth()]);
                x.domain([0, 100]);

                // Define bars
                var bar = svg.selectAll('.bar')
                    .data(data)
                    .enter().append('g')
                    .attr('class', 'rect')
                    .attr('transform', function(d) { return 'translate(' + margin.left + ',' + (y0(d.user) + (y0.bandwidth()/2) + margin.top - y1.bandwidth()) + ')'; });

                var barEnter = bar.selectAll('rect')
                    .data(function(d) { return d.values; })
                    .enter();

                barEnter.append('rect')
                    .attr('height', y1.bandwidth())
                    .attr('y', function(d) { return y1(d.name); })
                    .attr('x', 0)
                    .attr('value', function(d){return d.name;})
                    .attr('width', 0)
                    .style('fill', function(d) { return color(d.value); })
                    .on('mouseover', function() { d3.select(this).style('cursor', 'pointer');})
                    .on('mouseout', function() { d3.select(this).style('cursor', 'default');})
                    .on('click', function(d){ scope.renderLineChart(scope.onClick({item: d}));})
                    .transition()
                    .duration(1000)
                    .attr('width', function(d) { return x(d.value); });

                barEnter.append('text')
                    .attr('fill', '#000')
                    .attr('y', function(d){return y1(d.name) + (y1.bandwidth() / 2);})
                    .attr('x', function(d){return x(d.value);})
                    .attr('dx', 5)
                    .attr('dy', '.35em')
                    .text(function(d){return parseFloat(d.value).toFixed(0) + '%';})
                    .attr('fill-opacity', 0)
                    .transition()
                    .duration(1500)
                    .attr('fill-opacity', 1);

                // Set up x axis
                svg.append('g')
                    .attr('class', 'axisHorizontal')
                    .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
                    .call(xAxis);

                // Set up y axis
                svg.append('g')
                    .attr('class', 'y axis')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                    .call(d3.axisLeft(y0));

                // Draw the legend
                // Create the gradient for the legend
                svg.append('defs')
                    .append('linearGradient')
                    .attr('id', 'legend-traffic')
                    .attr('x1', '0%').attr('y1', '0%')
                    .attr('x2', '100%').attr('y2', '0%')
                    .selectAll('stop')
                    .data(color.range())
                    .enter().append('stop')
                    .attr('offset', function(d,i) { return i/(color.range().length-1); })
                    .attr('stop-color', function(d) { return d; });

                // Legend variables
                var legendWidth = width * 0.6;
                var legendHeight = 10;

                // Legend container
                var legendSvg = svg.append('g')
                    .attr('class', 'legendWrapper')
                    .attr('transform', 'translate(' + ((width + margin.left + margin.right)/2) + ',' + (height + margin.top + margin.bottom) + ')');

                // Draw the rectangle
                legendSvg.append('rect')
                    .attr('class', 'legendRect')
                    .attr('x', -legendWidth/2)
                    .attr('y', -30)
                    .attr('width', legendWidth)
                    .attr('height', legendHeight)
                    .attr('fill', 'url(#legend-traffic)');

                // Append title
                legendSvg.append('text')
                    .attr('class', 'legendTitle')
                    .attr('x', 0)
                    .attr('y', -35)
                    .attr('text-anchor', 'middle')
                    .text('Worksets Opened %');

                // Set scale for x-axis
                var xScale = d3.scaleLinear()
                    .range([0, legendWidth])
                    .domain([0,100]);

                // Define x-axis
                var legendAxis = d3.axisBottom(xScale).ticks(5);

                // Set up x-axis
                legendSvg.append('g')
                    .attr('class', 'axisLegend')
                    .attr('transform', 'translate(' + (-legendWidth/2) + ',' + (legendHeight-30) + ')')
                    .call(legendAxis);
            };
        }
    };
}]);
