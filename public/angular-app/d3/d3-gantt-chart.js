angular.module('MissionControlApp').directive('d3Gantt', ['d3', function(d3) {
    return {
        restrict: 'E',
        scope: {
            data: '='
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
            scope.$watch('data', function(data) {
                return scope.render(data);
            }, true);

            // define render function
            scope.render = function(data){
                if(!data) return;

                // remove all previous items before render
                svg.selectAll("*").remove();

                // setup variables
                var margin = {top: 10, right: 10, bottom: 100, left: 100},
                    margin2 = {top: 430, right: 10, bottom: 30, left: 100},
                    width = d3.select(ele[0])._groups[0][0].offsetWidth - margin.left - margin.right,
                    userCount = new Set(data.map(function (d) { return d.user; })),
                    height,
                    height2 = 40;

                if(userCount.size === 1){
                    height = 350 - margin.top - margin.bottom;
                    margin2.top = 280;
                } else {
                    height = (userCount.size * 70) - margin.top - margin.bottom;
                    margin2.top = height + margin.top + margin.bottom - 70;
                }

                // set the height based on the calculations above
                svg.attr('height', height + margin.top + margin.bottom);

                var parseDate = d3.timeParse('%Y-%m-%dT%H:%M:%S.%LZ');
                var dateFormat = d3.timeFormat("%d %b,%H:%M");

                data.forEach(function(d) {
                    d.start = parseDate(d.from);
                    if(d.to === null){
                        var d1 = new Date();
                        var n = d1.toJSON();
                        d.end = parseDate(n);
                    } else {
                        d.end = parseDate(d.to);
                    }
                });

                var x = d3.scaleTime().range([0, width]),
                    x2 = d3.scaleTime().range([0, width]),
                    y = d3.scaleOrdinal().rangeRoundBands([0, height], 0.2),
                    y2 = d3.scaleOrdinal().rangeRoundBands([0, height2], 0.1);

                y.domain(data.map(function(d) { return d.user; }));
                x.domain([d3.min(data,function(d){return d.start;}), d3.max(data,function(d){return d.end;})]);
                x2.domain(x.domain());
                y2.domain(y.domain());

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .ticks(6)
                    .tickFormat(dateFormat);

                var xAxis2 = d3.svg.axis()
                    .scale(x2)
                    .orient("bottom")
                    .ticks(6)
                    .tickFormat(dateFormat);

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left");

                var brush = d3.svg.brush()
                    .x(x2)
                    .on("brush", doBrush);

                svg.append("defs")
                    .append("clipPath")
                    .attr("id", "clip")
                    .append("rect")
                    .attr("fill", "red")
                    .attr("width", width)
                    .attr("height", height);

                var focus = svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var context = svg.append("g")
                    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

                var focusRectangleGroups = focus.selectAll("g")
                    .data(data).enter()
                    .append("g");

                focusRectangleGroups.append("rect")
                    .attr("class", "bar")
                    .attr("clip-path", "url(#clip)")
                    .attr("fill", "steelblue")
                    .attr("y", function(d) { return y(d.user); })
                    .attr("height", y.rangeBand())
                    .attr("x", function(d) { return x(d.start); })
                    .attr("width", function(d) { return x(d.end) - x(d.start); });

                focusRectangleGroups.selectAll(null)
                    .data(function(d) {
                        return d.synched
                    })
                    .enter().append("line")
                    .attr("class", "synchLine")
                    .attr("clip-path", "url(#clip)")
                    .style("stroke", "red")
                    .attr("x1", function(d) {
                        return x(parseDate(d));
                    })
                    .attr("y1", function(d) {
                        var parentDatum = d3.select(this.parentNode).datum();
                        return y(parentDatum.user) - 5;
                    })
                    .attr("x2", function(d) {
                        return x(parseDate(d));
                    })
                    .attr("y2", function(d) {
                        var parentDatum = d3.select(this.parentNode).datum();
                        return y(parentDatum.user) + y.rangeBand() + 5;
                    });

                focus.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis)
                    .append("text")
                    .attr("x", width-margin.right)
                    .attr("dx", ".71em")
                    .attr("dy", "-0.2em")
                    .text("Date");

                focus.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);

                var contextRectangleGroups = context.selectAll("g")
                    .data(data).enter()
                    .append("g");

                contextRectangleGroups.append("rect")
                    .attr("class", "bar")
                    .attr("fill", "steelblue")
                    .attr("y", function(d) { return y2(d.user); })
                    .attr("height", y2.rangeBand())
                    .attr("x", function(d) { return x2(d.start); })
                    .attr("width", function(d) { return x2(d.end) - x2(d.start); })
                    .attr("clip-path", "url(#clip)");

                context.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height2 + ")")
                    .call(xAxis2);

                context.append("g")
                    .attr("class", "x brush")
                    .call(brush)
                    .selectAll("rect")
                    .attr("y", -6)
                    .attr("height", height2 + 7);

                function doBrush() {
                    x.domain(brush.empty() ? x2.domain() : brush.extent());
                    focus.selectAll("rect").attr("x", function(d) { return x(d.start); });
                    focus.selectAll("rect").attr("width", function(d) { return x(d.end) - x(d.start); });
                    focus.select(".x.axis").call(xAxis);
                }

                // svg.selectAll(".bar")
                //     .data(data).enter()
                //     .append("rect")
                //     .attr("fill", function(d){return color(d.user); })
                //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                //     .attr("class", "bar")
                //     .attr("y", function(d) { return y(d.user); })
                //     .attr("height", y.rangeBand())
                //     .attr("x", function(d) { return x(d.start); })
                //     .attr("width", function(d) { return x(d.end) - x(d.start); });
                //
                // var lineGroup = svg.selectAll(null)
                //     .data(data).enter()
                //     .append("g");
                //
                // lineGroup.selectAll(null)
                //     .data(function(d) {
                //         return d.synched
                //     })
                //     .enter()
                //     .append("line")
                //     .style("stroke", "red")
                //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                //     .attr("x1", function(d) {
                //         return x(parseDate(d));
                //     })
                //     .attr("y1", function(d) {
                //         var parentDatum = d3.select(this.parentNode).datum();
                //         return y(parentDatum.user) - 5;
                //     })
                //     .attr("x2", function(d) {
                //         return x(parseDate(d));
                //     })
                //     .attr("y2", function(d) {
                //         var parentDatum = d3.select(this.parentNode).datum();
                //         return y(parentDatum.user) + y.rangeBand() + 5;
                //     });
                //
                // svg.append("g")
                //     .attr("class", "x axis")
                //     .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
                //     .call(xAxis);
                //
                // svg.append("g")
                //     .attr("class", "y axis")
                //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                //     .call(yAxis);
                //
                // var tooltip = d3.select("body")
                //     .append('div')
                //     .attr('class', 'tooltip');
                //
                // tooltip.append('div').attr('class', 'user');
                // tooltip.append('div').attr('class', 'duration');
                // tooltip.append('div').attr('class', 'synchs');
                //
                // svg.selectAll(".bar,.pending")
                //     .on('mouseover', function(d) {
                //         var start = new Date(d.start);
                //         var end = new Date(d.end);
                //
                //     	tooltip.select('.user').html("<b>" + d.user + "</b>");
                //     	tooltip.select('.duration').html("<b>Duration: " + msToTime(end.getTime() - start.getTime()) + "</b>");
                //     	tooltip.select('.synchs').html("<b>Synchs: " + d.synched.length + "</b>");
                //
                //     	tooltip.style('display', 'block');
                //     	tooltip.style('opacity',2);
                //
                //     })
                //     .on('mousemove', function() {
                //     	tooltip
                //             .style('top', (event.pageY - 10) + "px")
                //     	    .style('left', (event.pageX + 10) + "px");
                //     })
                //     .on('mouseout', function() {
                //     	tooltip.style('display', 'none');
                //     	tooltip.style('opacity',0);
                //     });
                //
                // function msToTime(duration) {
                //     var milliseconds = parseInt((duration%1000)/100)
                //         , seconds = parseInt((duration/1000)%60)
                //         , minutes = parseInt((duration/(1000*60))%60)
                //         , hours = parseInt((duration/(1000*60*60))%24);
                //
                //     hours = (hours < 10) ? "0" + hours : hours;
                //     minutes = (minutes < 10) ? "0" + minutes : minutes;
                //     seconds = (seconds < 10) ? "0" + seconds : seconds;
                //
                //     return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
                // }
            }
        }
    };
}]);

