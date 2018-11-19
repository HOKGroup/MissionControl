/**
 * Created by konrad.sobon on 2018-05-18.
 */
angular.module('MissionControlApp').directive('d3Sankey', ['d3', 'sankey', function(d3, sankey) {
    return {
        restrict: 'E',
        scope: {
            data: '='
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
            scope.$watch('data', function(data) {
                return scope.render(data);
            }); // (Konrad) Notice how I had to disable the recursive equality comparison

            // define render function
            scope.render = function(data){
                if(!data) return;

                // remove all previous items before render
                svg.selectAll('*').remove();

                // setup variables
                var margin = {top: 10, right: 20, bottom: 10, left: 20},
                    width = d3.select(ele[0])._groups[0][0].offsetWidth,
                    height = (data.nodes.length * 20);

                // set the height based on the calculations above
                svg.attr('height', height);

                var formatNumber = d3.format(',.0f'),
                    format = function(d) { return formatNumber(d) + ' instances'; },
                    color = d3.scaleOrdinal(d3.schemeCategory20);

                var chart = sankey.sankey()
                    .nodeWidth(15)
                    .nodePadding(10)
                    .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

                var link = svg.append('g')
                    .attr('class', 'links')
                    .attr('fill', 'none')
                    .attr('stroke', '#000')
                    .attr('stroke-opacity', 0.2)
                    .selectAll('path');

                var node = svg.append('g')
                    .attr('class', 'nodes')
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', 10)
                    .selectAll('g');

                chart(data);

                link = link
                    .data(data.links)
                    .enter().append('path')
                    .attr('d', sankey.sankeyLinkHorizontal())
                    .attr('stroke-width', function(d) { return Math.max(1, d.width); });

                link.append('title')
                    .text(function(d) { return d.source.name + ' → ' + d.target.name + '\n' + format(d.value); });

                node = node
                    .data(data.nodes)
                    .enter().append('g');

                node.append('rect')
                    .attr('x', function(d) { return d.x0; })
                    .attr('y', function(d) { return d.y0; })
                    .attr('height', function(d) { return d.y1 - d.y0; })
                    .attr('width', function(d) { return d.x1 - d.x0; })
                    .attr('fill', function(d) { return color(d.name.replace(/ .*/, '')); });
                    // .attr("stroke", "#000")
                    // .attr("stroke-width", 1)
                    // .attr("stroke-opacity", 0.5);

                node.append('text')
                    .attr('x', function(d) { return d.x0 - 6; })
                    .attr('y', function(d) { return (d.y1 + d.y0) / 2; })
                    .attr('dy', '0.35em')
                    .attr('text-anchor', 'end')
                    .text(function(d) { return d.name; })
                    .filter(function(d) { return d.x0 < width / 2; })
                    .attr('x', function(d) { return d.x1 + 6; })
                    .attr('text-anchor', 'start');

                node.append('title')
                    .text(function(d) { return d.name + '\n' + format(d.value); });
            };
        }
    };
}]);
