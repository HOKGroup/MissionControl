/**
 * Created by konrad.sobon on 2017-11-21.
 */
angular.module('MissionControlApp').directive('d3NormalizedHorizontalBarChart', ['d3', function(d3) {
    return {
        restrict: 'E',
        scope: {
            data: '=',
            marginLeft: '=', // left margin
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

                var margin = {top: 20, right: 30, bottom: 20, left: scope.marginLeft},
                    width = d3.select(ele[0])._groups[0][0].offsetWidth - margin.left - margin.right,
                    height = data.length * 20;

                // set the height based on the calculations above
                svg.attr('height', height + margin.top + margin.bottom);

                var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                // TODO: This can be a point range
                var y = d3.scaleBand()
                    .rangeRound([0, height])
                    .padding(0.15);
                    // .align(0.15);

                var x = d3.scaleLinear()
                    .rangeRound([width, 0]);

                var z = d3.scaleOrdinal()
                    .range(["#d9534f", "#f0ad4e", "#5cb85c"]);

                var stack = d3.stack()
                    .offset(d3.stackOffsetExpand);

                y.domain(data.map(function(d) { return d.name; }));

                var keys = d3.keys(data[0]).filter(function(key){ return key !== 'name'; });
                z.domain(keys);

                var serie = g.selectAll(".serie")
                    .data(stack.keys(keys)(data))
                    .enter().append("g")
                    .attr("class", "serie")
                    .attr("fill", function(d) { return z(d.key); });

                serie.selectAll("rect")
                    .data(function(d) { return d; })
                    .enter().append("rect")
                    .attr("y", function(d) { return y(d.data.name); })
                    .attr("x", function(d) {
                        if(d[1] === 0) return 0;
                        else return x(d[1]);
                    })
                    .attr("width", function(d) { return x(d[0]) - x(d[1]); })
                    .attr("height", y.bandwidth());

                serie.selectAll("valueLabels")
                    .data(function (d) { return d; })
                    .enter().append("text")
                    .attr("x", function(d) {
                        if(d[1] === 0) return 0;
                        else return (x(d[0]) - x(d[1])) / 2;
                    })
                    .attr("y", function (d) { return y(d.data.name); })
                    .style("fill", "black")
                    .text("1"); //TODO: How to fix this?

                g.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x).ticks(10, "%"));

                g.append("g")
                    .attr("class", "y axis")
                    .call(d3.axisLeft(y));
            };
        }
    };
}]);