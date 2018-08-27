angular.module('MissionControlApp').directive('d3HorizontalBarChart', ['d3', '$compile', function(d3, $compile) {
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
                var margin = {top: 15, right: 35, bottom: 25, left: $scope.marginLeft},
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
                    .domain([0, 1, 2])
                    .range(["#5cb85c", "#f0ad4e", "#d9534f"]); //green/orange/red

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

                var tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "toolTip");

                svg.append("g")
                    .selectAll("bar")
                    .data(data).enter()
                    .append("rect")
                    .attr("x", margin.left)
                    .attr("width", 0)
                    .attr("y", function (d) { return y(d.name) + margin.top; })
                    .attr("fill", function (d) {
                        return qualityChecks(d).color;
                    })
                    .on("mouseover", function(d){
                        var result = qualityChecks(d);
                        if(!result.message) return;

                        tooltip.style("opacity", "1");
                        var matrix = this.getScreenCTM().translate(+ this.getAttribute("x"), + this.getAttribute("y"));
                        tooltip
                            .style("left", (window.pageXOffset + matrix.e + x(d.count) + 45) + "px")
                            .style("top", (window.pageYOffset + matrix.f - (y.bandwidth() / 2) - 3) + "px")
                            .style("display", "inline-block")
                            .html(result.message);
                    })
                    .on("mouseout", function(){ tooltip.style("opacity", "0");})
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
                    .on("mouseover", function(d){
                        tooltip.style("opacity", "1");
                        var matrix = this.getScreenCTM().translate(+ this.getAttribute("x"), + this.getAttribute("y"));
                        tooltip
                            .style("left", (window.pageXOffset + matrix.e + x(d.count) + 45) + "px")
                            .style("top", (window.pageYOffset + matrix.f - (y.bandwidth() / 2) - 3) + "px")
                            .style("display", "inline-block")
                            .html(d.name);
                    })
                    .on("mouseout", function(){ tooltip.style("opacity", "0");})
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
                 * Performs quality checks on workset items.
                 * @param d
                 * @returns {*}
                 */
                function qualityChecks(d) {
                    var bulkOfContent = (d.count * 100) / $scope.countTotal;
                    if(bulkOfContent >= 50){
                        return {
                            color: color(2),
                            message: 'Bulk of content (>50%) is on this workset! <br> Please consider adding a new workset.'
                        };
                    } else if (d.name.toLowerCase().indexOf('link') !== -1) {
                        return {
                            color: color(1),
                            message: '"Link" workset has more than one item. <br> Please consider removing them.'
                        };
                    } else if (d.name.toLowerCase().indexOf('cad') !== -1 && d.count > 20){
                        return {
                            color: color(1),
                            message: '"CAD" workset has more than 20 items. <br> Please consider removing them.'
                        };
                    } else {
                        return {
                            color: color(0),
                            message: ''
                        };
                    }
                }

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
                        if(textWidth >= (margin.left - 15)){
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
