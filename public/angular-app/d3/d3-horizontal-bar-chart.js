angular.module('MissionControlApp').directive('d3HorizontalBarChart', ['d3', function(d3) {
    return {
        restrict: 'EA',
        scope: {
            data: "=",
            countTotal: '=',
            marginLeft: '=',
            domainPadding: '='
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
                var margin = {top: 15, right: 30, bottom: 25, left: $scope.marginLeft},
                    width = d3.select($ele[0])._groups[0][0].offsetWidth - margin.left - margin.right,
                    height;

                if(data.length <= 2){
                    height = 100;
                } else {
                    height = data.length * 20;
                }

                // set the height based on the calculations above
                svg.attr('height', height + margin.top + margin.bottom);

                var x = d3.scaleLinear()
                    .domain([0, d3.max(data, function(d){return d.count;}) + $scope.domainPadding])
                    .range([0, width]);

                var y = d3.scaleBand()
                    .domain(data.map(function (d) { return d.name; }))
                    .rangeRound([0, height])
                    .paddingInner(0.15);

                var color = d3.scaleLinear()
                    .domain([0, 1])
                    .range(["#5cb85c","#d9534f"]);

                var ticksNum = 10;
                var xAxisTicks = [];
                var xDomain = [0, d3.max(data, function(d){return d.count;}) + $scope.domainPadding];
                for (var i = 0; i < ticksNum; i++ ){
                    xAxisTicks.push((xDomain[1] - xDomain[0]) / (ticksNum - 1)* i + xDomain[0]);
                }

                var xAxis = d3.axisBottom(x)
                    .tickValues(xAxisTicks)
                    .tickSizeInner(-(height-5))
                    .tickPadding(8);

                svg.append("g")
                    .selectAll("bar")
                    .data(data).enter()
                    .append("rect")
                    .attr("x", margin.left)
                    .attr("width", 0)
                    .attr("y", function (d) { return y(d.name) + margin.top; })
                    .attr("fill", function (d) {
                        var bulkOfContent = (d.count * 100) / $scope.countTotal;
                        if(bulkOfContent >= 50){
                            return color(1);
                        } else {
                            return color(0);
                        }
                    })
                    .attr("height", y.bandwidth())
                    .transition()
                    .duration(1000)
                    .attr("width", function(d){return x(d.count);});

                svg.append("g")
                    .attr("class", "x axisHorizontal")
                    .attr("transform", "translate(" +  margin.left + "," + (height + margin.top)  + ")")
                    .call(xAxis);

                svg.append("g")
                    .selectAll("labels")
                    .data(data).enter()
                    .append("text")
                    .attr("x", margin.left)
                    .attr("y", function (d) {return (y(d.name) + (y.bandwidth() / 2)) + margin.top;})
                    .attr("text-anchor", "end")
                    .attr("dy", ".35em")
                    .attr("dx", -5)
                    .text(function(d){return d.name;})
                    .each(trim);

                svg.append("g")
                    .selectAll("valueLabels")
                    .data(data).enter()
                    .append("text")
                    .attr("x", function(d){return x(d.count) + margin.left;})
                    .attr("y", function(d){return (y(d.name) + (y.bandwidth() / 2)) + margin.top;})
                    .attr("dx", 5)
                    .attr("dy", ".35em")
                    .text(function(d){return d.count;})
                    .attr("fill-opacity", 0)
                    .transition()
                    .duration(1500)
                    .attr("fill-opacity", 1);

                /**
                 * Adjusts long strings to fit within margin.left.
                 */
                function trim() {
                    var self = d3.select(this);
                    var textWidth = getPixelWidth(self.text());
                    var initialText = self.text(),
                        textLength = initialText.length,
                        text = initialText,
                        maxIterations = 100;

                    // (Konrad) Only trim strings that are longer than 25 characters.
                    // Leave some space between left margin and trimmed string. 5px.
                    while (maxIterations > 0 && text.length > 25) {
                        if(textWidth >= (margin.left - 10)){
                            text = text.slice(0, -textLength * 0.15);
                            self.text(text + '...');
                            textWidth = self.node().getComputedTextLength();
                            textLength = text.length;
                            maxIterations--;
                        } else {
                            break;
                        }
                    }
                }

                /**
                 * Returns width of text string in pixels.
                 * @param text
                 * @returns {Number}
                 */
                function getPixelWidth(text){
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext("2d");
                    return ctx.measureText(text).width;
                }
            };
        }
    };
}]);
