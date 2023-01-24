import * as d3 from "d3";
import React, { Component, useEffect, useRef } from "react";

import "../css/d3-styles.css";

function getPixelWidth(text: string) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  return ctx!.measureText(text).width;
}

interface Data {
  name: string;
  count: number;
}

interface HorizontalBarChartTimeoutProps {
  data: Data[];
  countTotal: any;
  marginLeft: any;
  axisTop: any;
  domainPadding: number;
  onClick: any;
  clickable: boolean;
  fillColor: any;
}

const HorizontalBarChartTimeout: React.FC<HorizontalBarChartTimeoutProps> = ({
  data,
  countTotal,
  marginLeft,
  axisTop,
  domainPadding,
  onClick,
  clickable,
  fillColor,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data) return;
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const margin = {
      top: 25,
      right: 30,
      bottom: 25,
      left: marginLeft,
    };

    const width =
      svgRef.current.parentElement!.parentElement!.offsetWidth -
      margin.left -
      margin.right;

    const height = data.length * 20;

    const barHeight = 17;

    if (axisTop && data.length > 15) {
      margin.top = 20;
    }

    d3.select(svgRef.current).attr(
      "height",
      height + margin.top + margin.bottom
    );

    const x = d3
      .scaleLinear()
      .domain([0, (d3.max(data, (d) => d.count) as number) + domainPadding])
      .range([0, width]);

    const y = d3
      .scalePoint()
      .domain(data.map((d) => d.name))
      .range([0, height - barHeight]);

    d3.select(svgRef.current)
      .append("g")
      .selectAll("bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .attr("x", 0)
      .attr("width", 0)
      .attr("y", (d) => y(d.name) as number)
      .attr("fill", fillColor)
      .attr("height", barHeight)
      .on("click", function (d) {
        if (clickable) {
          onClick({ item: d });
          d3.select(".selectedRedFill").classed("selectedRedFill", false);
          d3.select(this).classed("selectedRedFill", true);
        }
      })
      .on("mouseover", function () {
        if (clickable) {
          d3.select(this).style("cursor", "pointer");
        }
      })
      .on("mouseout", function () {
        if (clickable) {
          d3.select(this).style("cursor", "default");
        }
      })
      .transition()
      .duration(1000)
      .attr("width", (d) => x(d.count));

    d3.select(svgRef.current)
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(${margin.left},${height + margin.top})`)
      .call(d3.axisBottom(x));

    if (axisTop && data.length > 15) {
      d3.select(svgRef.current)
        .append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(d3.axisTop(x));
    }

    d3.select(svgRef.current)
      .append("g")
      .selectAll("labels")
      .data(data)
      .enter()
      .append("text")
      .attr("x", 0)
      .attr("y", (d) => {
        const width = getPixelWidth(d.name);
        const lineCount = Math.ceil(width / margin.left);
        const center = (y(d.name) as number) + barHeight / 2 - lineCount * 4;
        const offset = (y(d.name) as number) + barHeight / 2;
        return lineCount > 1 ? center + margin.top : offset + margin.top;
      })
      .attr("text-anchor", "end")
      .attr("dy", ".35em")
      .attr("dx", -5)
      .text((d) => d.name)
      .call(wrap, margin.left);

    d3.select(svgRef.current)
      .append("g")
      .selectAll("valueLabels")
      .data(data)
      .enter()
      .append("text")
      .attr("x", (d) => x(d.count) + margin.left)
      .attr("y", (d) => (y(d.name) as number) + barHeight / 2 + margin.top)
      .attr("dx", 5)
      .attr("dy", ".35em")
      .text((d) => d.count)
      .attr("fill-opacity", 0)
      .transition()
      .duration(1500)
      .attr("fill-opacity", 1);

    // @ts-ignore
    function wrap(text, width) {
      text.each(function () {
        // @ts-ignore
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        // @ts-ignore
        let word;
        // @ts-ignore
        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.1; // ems
        const y = text.attr("y");
        const dy = parseFloat(text.attr("dy"));
        let tspan = text
          .text(null)
          .append("tspan")
          // @ts-ignore
          .attr("x", margin.left)
          .attr("y", y)
          .attr("dx", -5)
          .attr("dy", dy + "em");
        while ((word = words.pop())) {
          line.push(word);
          // @ts-ignore
          tspan.text(line.join(" "));
          if (tspan!.node()!.getComputedTextLength() > width) {
            // @ts-ignore
            line.pop();
            // @ts-ignore
            tspan.text(line.join(" "));
            line = [word];
            tspan = text
              .append("tspan")
              .attr("x", 0)
              .attr("y", y)
              .attr("dx", -5)
              .attr("dy", ++lineNumber * lineHeight + dy + "em")
              .text(word);
          }
        }
      });
    }
  }, [data, axisTop, clickable, domainPadding, fillColor, marginLeft, onClick]);

  return <svg ref={svgRef} width="100%" />;
};

export default HorizontalBarChartTimeout;
