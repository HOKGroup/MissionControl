angular.module('MissionControlApp').directive('d3DonutChart', ['d3', '$timeout', function(d3, $timeout) {
    return {
        restrict: 'EA',
        scope: {
            data: '=',
            latest: '=',
            onClick: '&d3OnClick'
        },
        link: function(scope, $ele) {
            var refreshScope = function() {
                scope.$apply();
            };

            var svg = d3.select($ele[0])
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
                var margin = {top: 5, right: 5, bottom: 5, left: 5},
                    width = d3.select($ele[0])._groups[0][0].offsetWidth - margin.left - margin.right,
                    height = d3.select($ele[0])._groups[0][0].offsetWidth - margin.top - margin.bottom,
                    r = width / 2,
                    donut = d3.pie().sort(null),
                    inner = r * 0.6,
                    arc = d3.arc().innerRadius(inner).outerRadius(r),
                    arcOver = d3.arc().innerRadius(inner + 5).outerRadius(r + 5);

                // set the height based on the calculations above
                svg.attr('height', height + margin.top + margin.bottom);

                var color = d3.scaleOrdinal(d3.schemeCategory20c);
                var total = data.length;

                var vis = svg.append('g')
                    .attr('class', 'focus')
                    .data([data])
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom);

                var textTop = vis.append('text')
                    .attr('class', 'donutTotal')
                    .attr('dy', '.35em')
                    .attr('x', (width + margin.left + margin.right) / 2)
                    .attr('y', ((height + margin.top + margin.bottom) / 2) - (r/7)/2)
                    .text('VERSIONS');

                var textBottom = vis.append('text')
                    .attr('class', 'donutLabel')
                    .attr('dy', '.35em')
                    .attr('x', (width + margin.left + margin.right) / 2)
                    .attr('y', ((height + margin.top + margin.bottom) / 2) + (r/6)/2)
                    .text(total);

                var arcs = vis.selectAll('arc')
                    .data(donut.value(function(d) { return d.count; }))
                    .enter().append('g')
                    .attr('class', 'arc')
                    .attr('transform', 'translate(' + (width + margin.left + margin.right) / 2 + ',' + (height + margin.top + margin.bottom) / 2 + ')');

                arcs.append('path')
                    .attr('fill', function(d) { return getColor(d); })
                    .transition()
                    .delay(function (d, i) { return i * 500; })
                    .duration(500)
                    .attrTween('d', function (d) {
                        var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
                        return function (t) {
                            d.endAngle = i(t);
                            return arc(d);
                        };
                    })
                    .style('stroke', 'white')
                    .style('stroke-width', 2);

                arcs.selectAll('path')
                    .on('mouseover', function(d){
                        // d3.select(this).transition().duration(200).attr("d", arcOver);
                        // d3.select(this).style("fill", 'steelblue');
                        textTop.text(d.data.name);
                        textBottom.text(d.data.count);
                        d3.select(this).style('cursor', 'pointer');
                    })
                    .on('mouseout', function(){
                        // d3.select(this).transition().duration(100).attr("d", arc);
                        // d3.select(this).style("fill", function(d) { return getColor(d); });
                        textTop.text('VERSIONS');
                        textBottom.text(total);
                        d3.select(this).style('cursor', 'default');
                    })
                    .on('click', function(d){
                        scope.onClick({item: d.data});
                        d3.select('.selectedBlueFill').classed('selectedBlueFill', false);
                        d3.select(this).classed('selectedBlueFill', true);
                        $timeout(refreshScope, 0, false); // flush the digest cycle
                    });

                /**
                 * Retrieves the color of the arch. If version is latest color is green
                 * if version is earlier color is orange, if it failed color is red.
                 * @param d
                 * @returns {*}
                 */
                function getColor(d) {
                    if(scope.latest === d.data.name) return '#5cb85c';
                    else if(d.data.name === 'Fatal') return '#d9534f';
                    else return '#f0ad4e';
                }
            };
        }
    };
}]);
