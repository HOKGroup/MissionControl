angular.module('MissionControlApp').directive('d3WorksetItemCount', ['d3', function(d3) {
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
                var margin = {top: 5, right: 30, bottom: 10, left: $scope.marginLeft},
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

                var xAxis = d3.axisBottom(x)
                    .tickSizeInner(-(height-5))
                    .tickPadding(8);

                svg.append("g")
                    .selectAll("bar")
                    .data(data).enter()
                    .append("rect")
                    .attr("x", margin.left)
                    .attr("width", 0)
                    .attr("y", function (d) { return y(d.name); })
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
                    .attr("transform", "translate(" +  margin.left + "," + (height) + ")")
                    .call(xAxis);

                svg.append("g")
                    .selectAll("labels")
                    .data(data).enter()
                    .append("text")
                    .attr("x", 150)
                    .attr("y", function(d){
                        var width = getPixelWidth(d.name);
                        var lineCount = Math.ceil(width / margin.left);
                        var center = (y(d.name) + (y.bandwidth() / 2)) - (lineCount * 4);
                        var offset = (y(d.name) + (y.bandwidth() / 2));
                        return lineCount > 1 ? center : offset;
                    })
                    .attr("text-anchor", "end")
                    .attr("dy", ".35em")
                    .attr("dx", -5)
                    .text(function(d){return d.name;})
                    .call(wrap, margin.left);

                svg.append("g")
                    .selectAll("valueLabels")
                    .data(data).enter()
                    .append("text")
                    .attr("x", function(d){return x(d.count) + margin.left;})
                    .attr("y", function(d){return y(d.name) + (y.bandwidth() / 2);})
                    .attr("dx", 5)
                    .attr("dy", ".35em")
                    .text(function(d){return d.count;})
                    .attr("fill-opacity", 0)
                    .transition()
                    .duration(1500)
                    .attr("fill-opacity", 1);

                function getPixelWidth(text){
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext("2d");
                    return width = ctx.measureText(text).width;}

                function wrap(text, width) {
                    text.each(function() {
                        var text = d3.select(this),
                            words = text.text().split(/\s+/).reverse(),
                            word,
                            line = [],
                            lineNumber = 0,
                            lineHeight = 1.1, // ems
                            y = text.attr("y"),
                            dy = parseFloat(text.attr("dy")),
                            tspan = text.text(null).append("tspan").attr("x", margin.left).attr("y", y).attr("dx", -5).attr("dy", dy + "em");
                        while (word = words.pop()) {
                            line.push(word);
                            tspan.text(line.join(" "));
                            if (tspan.node().getComputedTextLength() > width) {
                                line.pop();
                                tspan.text(line.join(" "));
                                line = [word];
                                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dx", -5).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                            }
                        }
                    });
                }
            };
        }
    };
}]);
