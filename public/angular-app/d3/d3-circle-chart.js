/**
 * Created by konrad.sobon on 2017-06-05.
 */
angular.module('MissionControlApp').directive('d3Circle', ['d3', function(d3) {
    return {
        restrict: 'E',
        scope: {
            data: '='
        },
        link: function(scope, ele) {
            var svg = d3.select(ele[0])
                .append("svg")
                .attr("width", "120");

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
                var height = 120;

                // set the height based on the calculations above
                svg.attr('height', height);

                // var color = d3.scale.linear()
                var color = d3.scaleLinear()
                    .domain([0, 1, 2, 3, 4, 5, 6, 7])
                    .range(["#d9534f", "#d9534f", "#d9534f", "#f0ad4e", "#f0ad4e", "#5cb85c", "#5cb85c", "#777777"]);

                /**
                 * @return {number}
                 */
                function Remap(score, newMax){
                    return Math.round((score * 6)/newMax);
                }

                // matching colors for bootstrap
                // success = 5cb85c
                // warning = f0ad4e
                // danger = d9534f
                svg.append("circle")
                    .attr("cx", 60)
                    .attr("cy", 60)
                    .attr("r", 60)
                    .attr("fill", color( Remap(data.passingChecks, data.newMax)));

                svg.append("text")
                    .attr("fill", "#000")
                    .attr("y", 50)
                    .attr("x", 60)
                    .style("font-size", 25)
                    .attr("alignment-baseline", "central")
                    .attr("text-anchor", "middle")
                    .text(data.count);

                svg.append("text")
                    .attr("fill", "#000")
                    .attr("y", 75)
                    .attr("x", 60)
                    .style("font-size", 12)
                    .attr("alignment-baseline", "central")
                    .attr("text-anchor", "middle")
                    .text(data.label);
            };
        }
    };
}]);
