angular.module('MissionControlApp').directive('d3HorizontalBarChartTimeout', ['d3','$timeout', function(d3, $timeout) {
    return {
        restrict: 'EA',
        scope: {
            data: "=",
            countTotal: '=',
            marginLeft: '=', // left margin
            axisTop: '=', // bool, shows extra axis on top
            domainPadding: '=', // pads extra values to domain
            onClick: '&d3OnClick', // click function
            clickable: '=', // used for styling
            fillColor: '=' // bar fill color
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
            scope.$watch('data', function(newVals, oldVals) {
                if(newVals !== oldVals){
                    return scope.render(newVals);
                }
            },true);

            // define render function
            scope.render = function(data){
                if(!data) return;

                // remove all previous items before render
                svg.selectAll("*").remove();

                // setup variables
                var margin = {top: 15, right: 30, bottom: 25, left: scope.marginLeft},
                    width = d3.select(ele[0])._groups[0][0].offsetWidth - margin.left - margin.right,
                    height = data.length * 20,
                    barHeight = 17;

                if(scope.axisTop && data.length > 15){
                    margin.top = 20;
                }

                // set the height based on the calculations above
                svg.attr('height', height + margin.top + margin.bottom);

                var x = d3.scaleLinear()
                    .domain([0, d3.max(data, function(d){return d.count;}) + scope.domainPadding])
                    .range([0, width]);

                var y = d3.scalePoint()
                    .domain(data.map(function (d) { return d.name; }))
                    .range([0, height-barHeight]);

                svg.append("g")
                    .selectAll("bar")
                    .data(data).enter()
                    .append("rect")
                    .attr("transform", "translate(" +  margin.left + "," + margin.top + ")")
                    .attr("x", 0)
                    .attr("width", 0)
                    .attr("y", function (d) { return y(d.name); })
                    .attr("fill", scope.fillColor)
                    .attr("height", barHeight)
                    .on("click", function(d){
                        if(scope.clickable){
                            scope.onClick({item: d});
                            d3.select(".selectedRedFill").classed("selectedRedFill", false);
                            d3.select(this).classed("selectedRedFill", true);
                            $timeout(refreshScope, 0, false); // flush the digest cycle
                        }
                    })
                    .on("mouseover", function() {
                        if(scope.clickable){
                            d3.select(this).style("cursor", "pointer");
                        }
                    })
                    .on("mouseout", function() {
                        if(scope.clickable){
                            d3.select(this).style("cursor", "default");
                        }
                    })
                    .transition()
                    .duration(1000)
                    .attr("width", function(d){return x(d.count);});

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(" +  margin.left + "," + (height + margin.top) + ")")
                    .call(d3.axisBottom(x));

                if(scope.axisTop && data.length > 15){
                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                        .call(d3.axisTop(x))
                }

                svg.append("g")
                    .selectAll("labels")
                    .data(data).enter()
                    .append("text")
                    .attr("x", 0)
                    .attr("y", function(d){
                        var width = getPixelWidth(d.name);
                        var lineCount = Math.ceil(width / margin.left);
                        var center = (y(d.name) + (barHeight / 2)) - (lineCount * 4);
                        var offset = (y(d.name) + (barHeight / 2));
                        return lineCount > 1 ? center + margin.top : offset + margin.top;
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
                    .attr("y", function(d){return y(d.name) + (barHeight / 2) + margin.top;})
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
