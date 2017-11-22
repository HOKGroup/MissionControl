/**
 * Created by konrad.sobon on 2017-11-21.
 */
angular.module('MissionControlApp').directive('d3NormalizedHorizontalBarChart', ['d3', function(d3) {
    return {
        restrict: 'E',
        scope: {
            data: '=',
            marginLeft: '=' // left margin
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

                // TODO: This is potentially an issue. Colors are in order. Red, Green, Orange
                var z = d3.scaleOrdinal()
                    .range(["#d9534f", "#5cb85c", "#f0ad4e"]);

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

                // (Konrad) Given that "serie" groups the data by keys, it will be served to us in order
                // We can use that to count every data.length and then jump to next items in keys.
                var counter = 0;
                var index = 0;
                serie.selectAll("valueLabels")
                    .data(function(d) { return d; })
                    .enter().append("text")
                    .attr("text-anchor", "middle")
                    .attr("alignment-baseline", "middle")
                    .style("fill", "black")
                    .attr("y", function(d) { return y(d.data.name) + (y.bandwidth() / 2); })
                    .attr("x", function(d) {
                        if(d[1] === 0){
                            return 0;
                        } else {
                            var width = x(d[0]) - x(d[1]);
                            return x(d[1]) + (width / 2);
                        }
                    })
                    .text(function(d){
                        var key;
                        if(counter < data.length){
                            key = keys[index];
                        } else {
                            index++;
                            counter = 0;
                            key = keys[index];
                        }
                        counter++;
                        return d.data[key] === 0 ? '' : d.data[key];
                    });

                g.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x).ticks(10, "%"));

                g.append("g")
                    .selectAll("labels")
                    .data(data).enter()
                    .append("text")
                    .attr("x", 0)
                    .attr("y", function(d) { return y(d.name) + (y.bandwidth() / 2); })
                    .attr("text-anchor", "end")
                    .attr("dy", ".35em")
                    .attr("dx", -5)
                    .text(function(d){return d.name;});
            };
        }
    };
}]);