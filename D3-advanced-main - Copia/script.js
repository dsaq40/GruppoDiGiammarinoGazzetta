const svgEl_bar = document.getElementById('bar')
const width_bar = svgEl_bar.getAttribute('width')
const height_bar = svgEl_bar.getAttribute('height')
var margin = {top: 10, right: 30, bottom: 30, left: 60}
const svgEl_mean = document.getElementById('mean')
const width_mean = svgEl_mean.getAttribute('width')
const height_mean = svgEl_mean.getAttribute('height')
const padding = 32
const svg_bar = d3.select('#bar')

var allGroup = ["United States of America", "India", "Brazil", "Russia"  , "France"]
// A color scale: one color for each group
var myColor = d3.scaleOrdinal()
.domain(allGroup)
.range(d3.schemeSet2);


let pointsColor1 = '#87CEFA' // the colour of one of the Countries
let pointsColor2 = '#90EE90' // the colour of one of the Countries
let textColor = '#194d30'

//create the mean svg
var svg_mean = d3.select("#mean")
  .append("svg")
    .attr("width", width_mean + margin.left + margin.right)
    .attr("height", height_mean + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")


	  

// in dataset.js you see that the data is in comma separated values format. 
// this is a way to decode it by also expliciting the types, so that the d3 dataset is correctly made
const data = d3.csvParse(dataset, d => {
	return {
		date : new Date(+d.year, +d.month-1, +d.day),
		cases : +d.cases, // + indicates a number (by default all vals are strings)
		deaths : +d.deaths,
		country : d.country.replaceAll("_", " "),
		pop2019 : +d.pop2019,
		continent : d.continent,
		cum14 : +d.cum14daysCasesPer100000,

	}
})
// sorting the dataset by date
data.sort((a, b) => d3.ascending(a.date, b.date))

//get cases
countryCases = d3
.rollups(
  data,
  v => (d3.sum(v, d => d.cases)),
  d => d.country
  
)
.map(([k, v]) => ({ country: k, cases: v }))
//get deaths
countryDeaths = d3
.rollups(
  data,
  v => (d3.sum(v, d => d.deaths)),
  d => d.country
  
)
.map(([k, v]) => ({ country: k, deaths: v }))

// function to pass the values in a list to get around a problem
list_creator = () =>{
	let countryCases_list = []
	for(let i = 0 ; i < countryCases.length; i++){
		temp = [countryCases[i].country , countryCases[i].cases , countryDeaths[i].deaths]
		countryCases_list.push(temp)
	}
	return countryCases_list
}

/*af = [countryCases[0].country , countryCases[0].cases]
al = [countryCases[1].country , countryCases[1].cases]
lista = [af,al]
if (lista[0][0] == "Afghanistan") {
	console.log(lista[0][1])
}*/
console.log(countryCases.slice(2,5))
console.log(countryCases)
lista = list_creator()
console.log(lista)
rapporti_creator = () =>{
	lista_rapporti = []
	for(let i = 0 ; i < lista.length; i++){
		temp = [lista[i][0] , (lista[i][2] * 100)/lista[i][1]]
		lista_rapporti.push(temp)
	}
	return lista_rapporti}
console.log(rapporti_creator())

media_deaths = () =>{
	morti = []
	for(let i = 0; i < lista.length; i++){
		temp = [lista[i][0] , (lista[i][2] /280)]
		morti.push(temp)
	}
	return morti
}
media_deaths = media_deaths()
console.log(media_deaths)
selected_country = "France"
country_grouped = d3.group(data ,d=> d.country)
console.log(country_grouped.get(selected_country))
data_prova= country_grouped.get(selected_country)
console.log(media_deaths.filter(function(element){ return element[0] == selected_country; })[0][1])
media_selected = media_deaths.filter(function(element){ return element[0] == selected_country; })[0][1]


d3.select("#selectButton")
      .selectAll('myOptions')
     	.data(allGroup)
      .enter()
    	.append('option')
      .text(function (d) { return d.replaceAll("_" , " "); }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button
      var x = d3.scaleTime()
      .domain(d3.extent(data_prova, function(d) { return d.date; }))
      .range([0, width_mean-(padding * 2)])
   
   svg_mean.append("g")
      .attr("transform", "translate(0," + (height_mean- margin.bottom)+ ")")
      .call(d3.axisBottom(x));
 
 // Add Y axis   
  var y = d3.scaleLinear()
      .domain([0 , d3.max(data_prova, d => d.deaths)])
      .range([height_mean - padding, padding]);
  var yAxis = d3.axisLeft().scale(y);
      svg_mean.append("g")
        .attr("class","myYaxis")
   
//svg_mean.append("g")
  //    .call(d3.axisLeft(y));
 
  var line = svg_mean
     .append('g')
     .append("path")
     .datum(data_prova)
     .attr("fill", "None")
     .attr("stroke", "steelblue")
     .attr("stroke-width", 1)
     .attr("d", d3.line()
       .x(function(d) { return x(d.date) })
       .y(function(d) { return y(d.deaths) })
     )
     
 var mean = svg_mean
     .append('g')
     .append("path")
     .datum(data_prova)
   .attr("fill", "None")
     .attr("stroke", "red")
     .attr("stroke-width", 1.5)
   .attr("d", d3.line()
     .x(function(d) { return x(d.date) })
     .y(function(d) { return y(media_selected) })
        )
 
      function update(selectedGroup) {

      // Create new data with the selection?
      
      if(!dataFilter) {
        var dataFilter;
        dataFilter = country_grouped.get(d3.select("#selectButton").property("value"));
        console.log(dataFilter)
    }else{
      dataFilter = country_grouped.get(selectedOption)
      console.log(dataFilter)
    }
      // Give these new data to update line
      y.domain([0 , d3.max(dataFilter, d => d.deaths)]);
          svg_mean.selectAll(".myYaxis")
            .transition()
            .duration(3000)
            .call(yAxis);
      line
          .datum(dataFilter)
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(+d.date) })
            .y(function(d) { return y(+d.deaths) })
          )
          .attr("stroke", function(d){ return myColor(selectedGroup) })

          
          if(!media_selected) {
            var media_selected;
            media_selected = media_deaths.filter(function(element){ return element[0] == d3.select("#selectButton").property("value"); })[0][1];
            
        }else{
          media_selected = media_deaths.filter(function(element){ return element[0] == selectedOption; })[0][1]
        }
      mean
      .datum(dataFilter)
      .attr("fill", "None")
      .attr("stroke", "red")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
      .x(function(d) { return x(d.date) })
      .y(function(d) { return y(media_selected) })
      )
      
    }
    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
      // recover the option that has been chosen
      var selectedOption = d3.select(this).property("value")
      // run the updateChart function with this selected option
      update(selectedOption)
  })
  update(d3.select("#selectButton").property("value"))


/*
const xScale = d3.scaleTime()
      .range([0, width_mean]);

const yScale = d3.scaleLinear()
      .range([height_mean, 0]);

const line = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.deaths));
*/

// inizio primo grafico
const countryCases1 = d3.rollups(
  data,
  v => d3.sum(v, d => d.cases),
  d => d.country
)
  .map(([k, v]) => ({ country: k, cases: v }))
  .sort((a, b) => d3.descending(a.cases, b.cases))
  .slice(0, 5)

const countryDeaths1 = d3.rollups(
  data,
  v => d3.sum(v, d => d.deaths),
  d => d.country
)
  .map(([k, v]) => ({ country: k, deaths: v }))
const countryCasesAndDeaths = d3.rollup(
  data,
  v => ({
    cases: d3.sum(v, d => d.cases),
    deaths: d3.sum(v, d => d.deaths),
  }),
  d => d.country
);

const countryCasesList1 = countryCases1.map(countryCase => {
  const cases = countryCase.cases;
  const country = countryCase.country;
  const population = countryCase.pop2019;
  const casesPerMillion = Math.round((cases / population) * 1000000);
  const deaths = countryCasesAndDeaths.get(country).deaths;
  const deathsPercentage = (deaths*100)/cases;
  return { country, cases, casesPerMillion, deathsPercentage };
});


// Set up the scales for the x and y axes
const xScale = d3.scaleBand()
  .range([margin.left, width_bar-100 - margin.right])
  .domain(countryCasesList1.map(d => d.country))
  .padding(0.1);

const yScale = d3.scaleLinear()
  .domain([0, 100])
  .range([height_bar - margin.bottom, margin.top+100]);
  

// Create the x axis
svg_bar.append('g')
  .attr('transform', `translate(0, ${height_bar - margin.bottom})`)
  //.attr('transform', `translate(0, ${height_bar - margin.bottom})`)
  .call(d3.axisBottom(xScale));

// Create the y axis
svg_bar.append('g')
  .attr('transform', `translate(${margin.left}, 0)`)
  .call(d3.axisLeft(yScale).ticks(2));
  


  
 
  const colorScale = d3.scaleLinear()
    .domain([0, 100])
    .range([pointsColor1, pointsColor2]);



svg_bar.selectAll('.death-bars-upper')
  .data(countryCasesList1)
  .enter()
  .append('rect')
  .attr('class', 'death-bars-upper')
  .attr('x', d => xScale(d.country)+27)
  .attr('y', d => yScale(100))
  .attr('width', xScale.bandwidth()/4)
  .attr('height', d => (d.deathsPercentage / 100) * (yScale(0) - yScale(100)))
  .attr('fill', 'darkgreen')
  .attr('opacity', 0.7);

svg_bar.selectAll('.death-bars-lower')
  .data(countryCasesList1)
  .enter()
  .append('rect')
  .attr('class', 'death-bars-lower')
  .attr('x', d => xScale(d.country)+27)
  .attr('y', d => yScale(100-d.deathsPercentage))
  .attr('width', xScale.bandwidth()/4)
  .attr('height', d => -(yScale(100) - yScale(d.deathsPercentage)))
  .attr('fill', 'lightgreen')
  .attr('opacity', 0.7);




/*	svg_bar.selectAll('text.values') // if there is any rect, update it with the new data
	.data(countryCasesList1)
	.enter() // create new elements as needed
	.append('text') // create the actual rects
	.attr('x', (d) => xScale(d.country) + xScale.bandwidth() / 4)
  .attr('y', (d) => yScale (100))
		.text(d => d.cases)
		.attr('text-anchor', 'middle') // centring the text
		.attr('class', 'cases')
		.attr('fill', textColor)

*/
    svg_bar.selectAll('text.values') // if there is any rect, update it with the new data
    .data(countryCasesList1)
    .enter() // create new elements as needed
    .append('text') // create the actual rects
    .attr('x', (d) => xScale(d.country)+27 + xScale.bandwidth() / 4)
    .attr('y', (d) => yScale(100) - 10) // sposta il testo leggermente sopra la barra
    .text(function(d) {
      let val = d.cases;
      let unit = '';
      if (val >= 1e9) {
        val = (val / 1e9).toFixed(1);
        unit = 'B';
      } else if (val >= 1e6) {
        val = (val / 1e6).toFixed(1);
        unit = 'Mln';
      } else if (val >= 1e3) {
        val = (val / 1e3).toFixed(0);
        unit = 'Mgl';
      } else {
        val = val.toFixed(0);
      }
      return val + unit;
    })
    .attr('text-anchor', 'middle') // centring the text
    .attr('class', 'cases')
    .attr('fill', textColor);

    // Define the colors for the legend
const colors = {
  cases: 'lightgreen',
  deaths: 'darkgreen'
};



const legend = svg_bar.append('g')
  .attr('class', 'legend')
  .attr('transform', `translate(${width_bar - 150},${margin.top})`);

const legendRect = legend.append('rect')
  .attr('width', 130)
  .attr('height', 70)
  .attr('fill', 'none')
  .attr('stroke', 'black')
  .attr('stroke-width', 1);

legend.append('rect')
  .attr('width', 20)
  .attr('height', 20)
  .attr('fill', 'darkgreen')
  .attr('x', 5)
  .attr('y', 5);

legend.append('text')
  .attr('x', 30)
  .attr('y', 20)
  .text('Deaths');

legend.append('rect')
  .attr('width', 20)
  .attr('height', 20)
  .attr('fill', 'lightgreen')
  .attr('x', 5)
  .attr('y', 40);

legend.append('text')
  .attr('x', 30)
  .attr('y', 55)
  .text('Cases');



