// ! Defining width and height of SVG container
const width = 1200;
const height = 580;

// ! Possibility of getting the mouse events so you can use it for tooltip

// ! Create SVG Element
const barChart = d3
  .select("body")
  .append("svg")
  .attr("height", height)
  .attr("width", width)
  .attr("id", "barChart")
  .style("background-color", "white")
  .style("margin-top", "50px")
  .style("box-shadow", "2px 1px 20px 6px #000000");

// ! Rendering the chart using the function
const renderBarChart = (data) => {
  // ! Making sure we access the Date and GDP easily
  data = data.data;
  const yValue = (d) => d[1];
  // ! ---------------------------------------------

  // ! Margin convention
  margin = { top: 70, right: 50, bottom: 80, left: 80 };
  const innerWidth = width - margin.right - margin.left;
  const innerHeight = height - margin.top - margin.bottom;

  // ! Setting the domain and scale of x and y axis

  // ! Adding quartile to the data so the graph looks nice at the end
  var lastDate = new Date(data[data.length - 1][0]);
  var maxDate = new Date(lastDate.setMonth(lastDate.getMonth() + 3));
  const xScale = d3
    .scaleTime()
    .range([0, innerWidth])
    .domain([d3.min(data, (d) => d[0]), maxDate]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, yValue)])
    .range([innerHeight, 0])
    .nice();
  // ! Introducing subgroup "g"
  const gBarChart = barChart
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  // ! Introducing x axis
  const xAxisG = gBarChart
    .append("g")
    .call(d3.axisBottom(xScale))
    .attr("class", "forGrey")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${innerHeight})`);

  // ! Introducing y axis
  const yAxisTickFormat = (number) =>
    d3.format(",.2s")(number).replace(".0", "").replace("k", "K");
  const yAxisG = gBarChart
    .append("g")
    .attr("class", "forGrey")
    .attr("id", "y-axis")
    .call(d3.axisLeft(yScale).tickFormat(yAxisTickFormat));

  // ! Modification of x axis path attribute so last tick doesn't show
  var modifiedXPath = document
    .querySelector("body > svg > g > g:nth-child(1) > path")
    .getAttribute("d")
    .replace(/.(?=.?$)/g, "");
  const removeLastLineXAxis = gBarChart
    .select("body > svg > g > g:nth-child(1) > path")
    .attr("d", modifiedXPath);

  // ! Introducing axis labels and title of chart
  xAxisG
    .append("text")
    .attr("class", "xAxisLabel")
    .text("Years")
    .attr("x", innerWidth / 2)
    .attr("y", 45);
  yAxisG
    .append("text")
    .attr("class", "yAxisLabel")
    .text("Gross Domestic Product [$]")
    .attr("x", -innerHeight / 2)
    .attr("y", -40)
    .style("transform", "rotate(-90deg)");
  gBarChart
    .append("text")
    .text("United Stated Gross Domestic Product")
    .attr("id", "title")
    .attr("x", innerWidth / 2)
    .attr("y", -24);

  // ! Defining tooltip
  var tooltipForData = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

  // ! Defining function to take care of date output for tooltip
  function tooltipDateOutput(str) {
    var splittedArr = str.split("-");
    if (parseInt(splittedArr[1]) === 1) {
      return parseInt(splittedArr[0]) - 1 + " Q4";
    } else if (parseInt(splittedArr[1]) === 4) {
      return parseInt(splittedArr[0]) + " Q1";
    } else if (parseInt(splittedArr[1]) === 7) {
      return parseInt(splittedArr[0]) + " Q2";
    } else return parseInt(splittedArr[0]) + " Q3";
    return str;
  }
  // ! Creating the chart
  var parseTime = d3.timeFormat("%Y-%m-%d");
  gBarChart
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d[0]))
    .attr("y", function (d) {
      return yScale(d[1]);
    })
    .attr("width", innerWidth / data.length)
    .attr("height", function (d) {
      return innerHeight - yScale(d[1]);
    })
    .attr("fill", "#9A3E25")
    .attr("stroke", "none")
    .attr("class", "bar")
    .attr("data-date", (d) => parseTime(d[0]))
    .attr("data-gdp", (d) => d[1])
    .on("mouseover", function (event, d) {
      tooltipForData.transition().duration(100).style("opacity", 0.85);
      tooltipForData
        .html(
          tooltipDateOutput(parseTime(d[0])) +
            "<br>" +
            "$" +
            d[1].toLocaleString() +
            " Billion"
        )
        .style("left", event.pageX + 25 + "px")
        .style("top", event.pageY - 28 + "px")
        .attr("data-date", parseTime(d[0]));
    })
    .on("mouseout", function (d) {
      tooltipForData.transition().duration(100).style("opacity", 0);
    });

  // ! Adding border on top and right of graph
  var borderPathTop = gBarChart
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0.5)
    .attr("x2", innerWidth)
    .attr("y2", 0.5)
    .attr("class", "forGrey")
    .attr("id", "borderRect")
    .style("stroke", "#8e8883")
    .style("stroke-width", "1px");
  var borderPathRight = gBarChart
    .append("line")
    .attr("x1", innerWidth)
    .attr("y1", 0.5)
    .attr("x2", innerWidth)
    .attr("y2", innerHeight)
    .attr("class", "forGrey")
    .attr("id", "borderRect")
    .style("stroke", "#8e8883")
    .style("stroke-width", "1px");
  // ! Adding source
  const divSource = d3
    .select("svg")
    .append("g")
    .attr("transform", `translate(${width - margin.right}, ${height - 20})`);
  divSource
    .append("text")
    .attr("class", "textSource")
    .text("Data source: ")
    .append("a")
    .attr("class", "linkSource")
    .attr("href", "http://www.bea.gov/national/pdf/nipaguid.pdf")
    .attr("target", "_blank")
    .text("http://www.bea.gov/national/pdf/nipaguid.pdf");

  // ! Adding author
  const author = d3
    .select("body")
    .append("h1")
    .attr("class", "nameAuthor")
    .text("Created by ")
    .append("a")
    .attr("href", "https://www.linkedin.com/in/davor-jovanovi%C4%87/")
    .attr("target", "_blank")
    .text("DavorJ");
};

// ! Getting the data
d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
).then((data) => {
  data.data.forEach((d) => {
    d[0] = new Date(d[0]);
    d[1] = +d[1];
  });
  renderBarChart(data);
});
