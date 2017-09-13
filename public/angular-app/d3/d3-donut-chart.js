angular.module('MissionControlApp').directive('d3DonutChart', ['d3', function(d3) {
    return {
        restrict: 'EA',
        scope: {
            data: "="
        },
        link: function($scope, $ele) {
            var svg = d3.select($ele[0])
                .append("svg")
                .attr("width", "100%");

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
                svg.selectAll("*").remove();

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

                var total = d3.sum(data, function (d) {
                    return d.count;
                });

                var vis = svg.append("g")
                    .attr("class", "focus")
                    .data([data])
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);

                var textTop = vis.append("text")
                    .attr("class", "donutTotal")
                    .attr("dy", ".35em")
                    .attr("x", (width + margin.left + margin.right) / 2)
                    .attr("y", ((height + margin.top + margin.bottom) / 2) - (r/7)/2)
                    .text("TOTAL");

                var textBottom = vis.append("text")
                    .attr("class", "donutLabel")
                    .attr("dy", ".35em")
                    .attr("x", (width + margin.left + margin.right) / 2)
                    .attr("y", ((height + margin.top + margin.bottom) / 2) + (r/6)/2)
                    .text(total);

                var arcs = vis.selectAll("arc")
                    .data(donut.value(function(d) { return d.count;}))
                    .enter().append("g")
                    .attr("class", "arc")
                    .attr("transform", "translate(" + (width + margin.left + margin.right) / 2 + "," + (height + margin.top + margin.bottom) / 2 + ")");

                arcs.append("path")
                    .attr("fill", function(d) { return color(d.data.name); })
                    .transition()
                    .delay(function (d, i) {
                        return i * 700;
                    })
                    .duration(700)
                    .attrTween("d", function (d) {
                        var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
                        return function (t) {
                            d.endAngle = i(t);
                            return arc(d)
                        }
                    })
                    .style("stroke", "white")
                    .style("stroke-width", 2);

                arcs.selectAll("path")
                    .on("mouseover", function(d){

                        d3.select(this).transition()
                            .duration(200)
                            .attr("d", arcOver);
                        textTop.text(d.data.name);
                        textBottom.text(d.data.count);

                        d3.select(this).style("fill", "#d9534f");
                    })
                    .on("mouseout", function(){
                        d3.select(this).transition()
                            .duration(100)
                            .attr("d", arc);

                        textTop.text("TOTAL");
                        textBottom.text(total);

                        d3.select(this).style("fill", function(d) { return color(d.data.name); });
                    });
            };
        }
    };
}]);
