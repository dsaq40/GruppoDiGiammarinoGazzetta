const svgDOM = document.querySelector('#chart')
const svgWidth = svgDOM.getAttribute('width')
const svgHeight = svgDOM.getAttribute('height')
const svg = d3.select('#chart')
const vizPadding = 120
const barPadding = 2
const color1 = '#9E5A00'
const color2 = '#0097EB'
const textColor = '#194d30'

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
	var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

	return {
		x: centerX + (radius * Math.cos(angleInRadians)),
		y: centerY + (radius * Math.sin(angleInRadians))
	};
}

const describeArc = (x, y, radius, startAngle, endAngle) => {

	var start = polarToCartesian(x, y, radius, endAngle)
	var end = polarToCartesian(x, y, radius, startAngle)

	var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

	var d = [
	    "M", start.x, start.y, 
	    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
	].join(" ")

	return d + `L ${x} ${y} Z`       
}

const data = d3.csvParse(dataset, d => {
	return {
		companyType : d.companyType,
		nCompanies : +d.nCompanies,
		percControlled : +d.percControlled,
		evasion : +d.evasion
	}
})


const xScale = d3.scaleLinear()
	.domain([0, data.length]) // the number of records in the dataset (the bars)
	.range([vizPadding, svgWidth-vizPadding]) // the output range (the size of the svg except the padding)

const yScale = d3.scaleLinear()
	.domain([0, d3.max(data, d => d.evasion)]) // the dataset values' range (from 0 to its max)
	.range([svgHeight - vizPadding, vizPadding]) 

let barWidth = xScale(1) - xScale(0) - (barPadding * 2) 

const yAxis = d3.axisLeft(yScale)
	.tickSize(- (svgWidth - (vizPadding * 2)))
	.tickValues([8900000000 , 3600000000, 2400000000])
	

const yAxis2 = d3.axisLeft(yScale)
	.ticks(10)
	.tickSize(- (svgWidth - (vizPadding * 2)))
	

const yTicks = svg
	.append('g')
	.attr('transform', `translate(${vizPadding}, 0)`)
	.call(yAxis)
const yTicks2 = svg
	.append('g')
	.attr('transform', `translate(${vizPadding}, 0)`)
	.call(yAxis2)

	svg.append("svg:defs")
    .append("svg:marker")
        .attr("id", "triangle")
        .attr("refX", 6)
        .attr("refY", 6)
        .attr("markerWidth", 30)
        .attr("markerHeight", 30)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 12 6 0 12 3 6")
        .style("fill", "black");
	
	svg
	.append('line')
	.attr('x1', vizPadding)
	.attr('y1', yScale.range()[0])
	.attr('x2', vizPadding)
	.attr('y2', yScale.range()[1])
	.attr('stroke', 'black')
	.attr('stroke-width', 2)
	.attr('marker-end','url(#triangle)')
	
// colouring the ticks .style('color' , 'red')
svg
	.selectAll('.tick line')
	.each(function (d) {
		// d is the tick's value (in this case, a number)
		d3.select(this)
		  .style("stroke", yAxis.tickValues().includes(d) ? "#0097EF" : "#D3D3D3")
		  .style("stroke-dasharray", yAxis.tickValues().includes(d) ? "5 5" : "0")


	})
	
	
// colouring the ticks' text
svg
	.selectAll('.tick text')
	
	.style('color', textColor)
	.each(function (d) {
		// d is the tick's value (in this case, a number)
		d3.select(this)
		  .attr("fill", yAxis.tickValues().includes(d) ? "#0097EF" : "black")
	})
// hiding the vertical ticks' line
svg
	.selectAll('path.domain')
	.style('stroke-width', 0)

//the 2 colors for the pies
/*var color = d3.scaleOrdinal()
  .domain(data.percControlled)
  .range(["#98abc5", "#8a89a6"])	*/

//creating the circles
const circles = svg
.selectAll('circle') // if there is any rect, update it with the new data
.data(data)
.enter() // create new elements as needed
.append('circle')
  .attr('cx',  (data, i) => xScale(i) + barWidth / 2)
  .attr('cy',  d => yScale(d.evasion))
  .attr('r', barWidth/6)
  .style('fill', color1);

const pieRadius = (barWidth/6)

const paths = svg
.selectAll('path')
//paths skips the first element so i manually reset the indexes and it works
.data(data, (d, i) => { return d + i; })
.enter()
.append('path')
	//.attr(describeArc(184.66666666666669 , 80 , pieRadius , 0 , (0.03 * 360)))
	.attr('d', (d,i) => describeArc((xScale(i) + barWidth/2) , (yScale(d.evasion)) , pieRadius , 0 , ((d.percControlled)) * 360) )
	.attr('fill', color2)


const values = svg // adding the dataviz to the correct element in the DOM
.selectAll('text.values') // if there is any rect, update it with the new data
.data(data)
.enter() // create new elements as needed
.append('text') // create the actual rects
.attr('x', (d, i) => xScale(i) + barWidth / 2)
	.attr('y', d => yScale(d.evasion) - 50 ) // positioning the text at the top of the bar
	.text(d => Math.round(d.percControlled*100) + "%")
	.attr('text-anchor', 'middle') // centring the text
	.attr('class', 'values')
	.attr('fill', "#0097EF")
	.style("font-size", "24px")
	.attr("font-weight","900")

	
const labels = svg // adding the dataviz to the correct element in the DOM
	.selectAll('text.labels') // if there is any rect, update it with the new data
	.data(data)
	.enter() // create new elements as needed
	.append('text') // create the actual rects
		.attr('x', (d, i) => xScale(i) + barWidth / 2)
		.attr('y', d => svgHeight - vizPadding + 16) // positioning the text at the middle of the bar
		.text(d => d.companyType)
		.attr('text-anchor', 'middle') // centring the text
		.attr('class', 'labels')
		.attr('fill', textColor)
/*
const lines = svg
	.selectAll('.tick text')
	.data(data)
	.enter()
	.append('path')
		.attr('x', 10 )
		.attr('y', d => svgHeight - vizPadding)
		.text(d => d.evasion)*/

// when you need to make the slice of the pie chart : 
// describeArc(pieRadius/2, pieRadius/2, pieRadius, 0, (360*percentage))
/*
console.log(describeArc(((data, i) => xScale(i) + barWidth / 2),(d => yScale(d.evasion)) , (barWidth/4) , 0 , ((d => yScale(d.percControlled)) * 360) ) )
/*END*/
//getboundingbox