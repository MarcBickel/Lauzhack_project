function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

whenDocumentLoaded(() => {
	document.querySelector("button#getyear").addEventListener("click",getyear);
});

function getyear(){
	req = {'offset':0, 'number': 20};
	$.ajax({
		type: "GET",
		url: "http://127.0.0.1:5000",
		data: req,
		dataType: 'json',
	})
	.then(json => {
		console.log(json);
		var rows = d3.select("#container")
		  .append("table")
		  .selectAll("tr")
		  .data(json)
		  .enter()
		  .append("tr");
		  
		
	});
	
}