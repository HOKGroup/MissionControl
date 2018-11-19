/**
 * Created by konrad.sobon on 2018-08-23.
 */
angular.module('MissionControlApp').directive('d3BarsStacked', ['d3', function(d3) {
    return {
        restrict: 'EA',
        scope: {
            data: '='
        },
        link: function($scope, $ele) {
            var svg = d3.select($ele[0])
                .append('svg')
                .attr('width', '100%');

            // on window resize, re-render d3 canvas
            window.onresize = function() {
                return $scope.$apply();
            };
            $scope.$watch(function(){
                    return angular.element(window)[0].innerWidth;
                }, function(){
                    return $scope.render($scope.data);
                }
            );

            // watch for data changes and re-render
            $scope.$watch('data', function(newVals, oldVals) {
                if(newVals !== oldVals){
                    return $scope.render(newVals);
                }
            },true);

            // define render function
            $scope.render = function(data){
                if(!data) return;

                // remove all previous items before render
                svg.selectAll('*').remove();

                // setup variables
                var margin = {top: 30, right: 40, bottom: 5, left: 60},
                    width = d3.select($ele[0])._groups[0][0].offsetWidth,
                    height = 500;

                // set the height based on the calculations above
                svg.attr('height', height + margin.top + margin.bottom);

                var series = d3.stack()
                    .keys(['added', 'removed'])
                    .offset(d3.stackOffsetDiverging)
                    (data);

                var x = d3.scaleBand()
                    .domain(data.map(function(d) { return d.date; }))
                    .rangeRound([margin.left, width - margin.right])
                    .padding(0.1);

                var y = d3.scaleLinear()
                    .domain([d3.min(series, stackMin), d3.max(series, stackMax)])
                    .rangeRound([height - margin.bottom, margin.top]);

                var z = d3.scaleOrdinal(d3.schemeCategory10);

                var ticksNum = 10;
                var yAxisTicks = [];
                var yDomain = [d3.min(series, stackMin), d3.max(series, stackMax)];
                for (var i = 0; i < ticksNum; i++ ){
                    yAxisTicks.push((yDomain[1] - yDomain[0]) / (ticksNum - 1)* i + yDomain[0]);
                }

                svg.append('g')
                    .selectAll('g')
                    .data(series)
                    .enter().append('g')
                    .attr('fill', function(d) { return d.key === 'added' ? '#d9534f' : '#5cb85c'; })
                    .selectAll('rect')
                    .data(function(d) { return d; })
                    .enter().append('rect')
                    .attr('width', x.bandwidth)
                    .attr('x', function(d) { return x(d.data.date); })
                    .attr('y', function(d) { return y(d[1]); })
                    .attr('height', function(d) { return y(d[0]) - y(d[1]); });

                svg.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', 'translate(0,' + y(0) + ')')
                    .call(d3.axisBottom(x));

                svg.append('g')
                    .attr('class', 'y axis')
                    .attr('transform', 'translate(' + margin.left + ',0)')
                    .call(d3.axisLeft(y).tickValues(yAxisTicks));

                function stackMin(series) {
                    return d3.min(series, function(d) { return d[0]; });
                }

                function stackMax(series) {
                    return d3.max(series, function(d) { return d[1]; });
                }
            };
        }
    };
}]);