/**
 * Created by konrad.sobon on 2018-09-07.
 */
angular.module('MissionControlApp').directive('d3StackedHorizontalBarChart', ['d3', '$timeout', function(d3, $timeout) {
    return {
        restrict: 'E',
        scope: {
            data: '=',
            marginLeft: '=',
            domainPadding: '='
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
            scope.$watch("data", function(newVals, oldVals) {
                if(newVals !== oldVals){
                    return scope.render(newVals);
                }
            }, false);

            // define render function for grouped bar charts
            scope.render = function(data){
                if(!data || data.length === 0) return;

                // remove all previous items before render
                svg.selectAll("*").remove();

                // setup variables
                var margin = {top: 25, right: 40, bottom: 25, left: scope.marginLeft};
                var width = d3.select(ele[0])._groups[0][0].offsetWidth - margin.left - margin.right;
                var height = data.length * 30;

                svg.attr('height', height + margin.top + margin.bottom);

                var y = d3.scaleBand()
                    .rangeRound([0, height])
                    .padding(0.05);

                var x = d3.scaleLinear()
                    .rangeRound([0, width]);

                var color = d3.scaleOrdinal(d3.schemeCategory20c);

                var keys = d3.keys(data[0]).filter(function(key) { return key !== 'name' && key !== 'total'; });

                data.sort(function(a, b) { return b.total - a.total; });
                y.domain(data.map(function(d) { return d.name; }));
                x.domain([0, d3.max(data, function(d) { return d.total; }) + scope.domainPadding]);
                color.domain(keys);

                var ticksNum = 10;
                var xAxisTicks = [];
                var xDomain = [0, d3.max(data, function(d) { return d.total; }) + scope.domainPadding];
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

                g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var colorStorage = {};
                g.append("g")
                    .selectAll("g")
                    .data(d3.stack().keys(keys)(data))
                    .enter().append("g")
                    .attr("fill", function(d) { return color(d.key); })
                    .selectAll("rect")
                    .data(function(d) { return d; })
                    .enter().append("rect")
                    .attr("x", function(d) { return x(d[0]); })
                    .attr("y", function(d) { return y(d.data.name); })
                    .attr("height", y.bandwidth())
                    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
                    .on("mouseover", function(d){
                        tooltip.style("opacity", "1");
                        var matrix = this.getScreenCTM().translate(+ this.getAttribute("x"), + this.getAttribute("y"));
                        tooltip
                            .style("left", (window.pageXOffset + matrix.e + x(d[1]) - x(d[0])) + "px")
                            .style("top", (window.pageYOffset + matrix.f + (y.bandwidth() - 26)) + "px")
                            .style("display", "inline-block")
                            .html(d[1] - d[0]);
                        colorStorage = this.style.fill;
                        d3.select(this).style("fill", "#d9534f");
                    })
                    .on("mouseout", function(){
                        tooltip.style("opacity", "0");
                        d3.select(this).style('fill', colorStorage);
                    });

                g.append("g")
                    .selectAll("valueLabels")
                    .data(data).enter()
                    .append("text")
                    .attr("x", function(d){ return x(d.total); })
                    .attr("y", function(d){ return (y(d.name) + (y.bandwidth() / 2)); })
                    .attr("dx", 5)
                    .attr("dy", ".35em")
                    .text(function(d){return d.total;});

                g.append("g")
                    .attr("class", "x axisHorizontal")
                    .attr("transform", "translate(0," + (height ? height : 0) + ")")
                    .call(xAxis);

                g.append("g")
                    .attr("class", "y axis")
                    .call(d3.axisLeft(y))
                    .selectAll("text").remove();

                g.append("g")
                    .selectAll("labels")
                    .data(data).enter()
                    .append("text")
                    .attr("x", 0)
                    .attr("y", function (d) {return (y(d.name) + (y.bandwidth() / 2)); })
                    .attr("text-anchor", "end")
                    .attr("dy", ".35em")
                    .attr("dx", -10)
                    .text(function(d){return d.name;})
                    .on("mouseover", function(d){
                        tooltip.style("opacity", "1");
                        var matrix = this.getScreenCTM().translate(+ this.getAttribute("x"), + this.getAttribute("y"));
                        tooltip
                            .style("left", (window.pageXOffset + matrix.e + x(d.total)) + "px")
                            .style("top", (window.pageYOffset + matrix.f - 12) + "px")
                            .style("display", "inline-block")
                            .html(d.name);
                    })
                    .on("mouseout", function(){ tooltip.style("opacity", "0"); })
                    .each(trim);

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
                        if(textWidth >= margin.left){
                            text = text.slice(0, -textLength * 0.35);
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