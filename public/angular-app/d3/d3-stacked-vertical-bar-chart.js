/**
 * Created by konrad.sobon on 2018-09-06.
 */
angular.module('MissionControlApp').directive('d3StackedVerticalBarChart', ['d3', '$timeout', function(d3, $timeout) {
    return {
        restrict: 'E',
        scope: {
            data: '=',
            onClick: '&d3OnClick'
        },
        link: function(scope, ele) {
            var refreshScope = function() {
                scope.$apply();
            };

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

            // define render function for grouped bar charts
            scope.render = function(data){
                if(!data) return;

                // remove all previous items before render
                svg.selectAll("*").remove();

                // setup variables
                var margin = {top: 25, right: 40, bottom: 170, left: 60};
                var width = d3.select(ele[0])._groups[0][0].offsetWidth - margin.left - margin.right;
                var height = 400;

                svg.attr('height', height + margin.top + margin.bottom);

                var x = d3.scaleBand()
                    .rangeRound([0, width])
                    .padding(0.05);

                var y = d3.scaleLinear()
                    .rangeRound([height, 0]);

                var z = d3.scaleOrdinal(d3.schemeCategory20c);

                var keys = d3.keys(data[0]).filter(function(key) { return key !== 'name' && key !== 'total'; });

                data.sort(function(a, b) { return b.total - a.total; });
                x.domain(data.map(function(d) { return d.name; }));
                y.domain([0, d3.max(data, function(d) { return d.total; })]);
                z.domain(keys);

                var ticksNum = 10;
                var yAxisTicks = [];
                var yDomain = [0, d3.max(data, function(d) { return d.total; })];
                for (var i = 0; i < ticksNum; i++ ){
                    yAxisTicks.push((yDomain[1] - yDomain[0]) / (ticksNum - 1)* i + yDomain[0]);
                }

                g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                g.append("g")
                    .selectAll("g")
                    .data(d3.stack().keys(keys)(data))
                    .enter().append("g")
                    .attr("fill", function(d) { return z(d.key); })
                    .selectAll("rect")
                    .data(function(d) { return d; })
                    .enter().append("rect")
                        .attr("x", function(d) { return x(d.data.name); })
                        .attr("y", function(d) { return y(d[1]); })
                        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
                        .attr("width", x.bandwidth());

                g.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x))
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-0.8em")
                    .attr("dy", "0.15em")
                    .attr("transform", function(d){
                        return "rotate(-65)"
                    });

                g.append("g")
                    .attr("class", "y axis")
                    .call(d3.axisLeft(y).tickValues(yAxisTicks));
            };
        }
    };
}]);