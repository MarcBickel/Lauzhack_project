function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

whenDocumentLoaded(() => {
	$.ajax({
		type: "GET",
		url: "http://127.0.0.1:5000",
		dataType: 'json',
	})
	.then(json => {
		start(json);
	});
	
	
});

function getyear(){
	
	req = {'offset':0, 'number': 20};
	$.ajax({
		type: "GET",
		url: "http://127.0.0.1:5000",
		dataType: 'json',
	})
	.then(json => {
		start(json);
	});
	
}

function start(json){
	/**
	var blue_red = d3.scale.linear()
	.domain([0, 1])
	.range(["#FF0000", "#0000FF"])
	.interpolate(d3.interpolateLab);*/
	var probGauge = gauge('#gauge', {
		size: 300,
		clipWidth: 300,
		clipHeight: 300,
		ringWidth: 60,
		transitionMs: 600,
	});
	
	probGauge.render();

	var color = function(d) { return (d.true_value == 'suspicious') ? ('#FF0000') : ('#0000FF'); };
	
	var parcoords = d3.parcoords()("#example")
  .color(color)
  .alpha(0.4);
	//d3.csv('data/train_js.csv', function(data) {
	
  parcoords
    .data(json)
	.hideAxis(["customer","true_value", "probability"])
    .render()
	.reorderable()
    .shadows()  
    .brushMode("1D-axes");  // enable brushing

  // create data table, row hover highlighting

  var grid = d3.divgrid();
  //grid.columns(['customer','category','suspicious','turnover','transaction_count','io_ratio','age','nationality','is_pep','inactive_days_average','inactive_days_max','n_of_accounts','distinct_counterparties','channel_risk','atm_withdrawal','atm_deposit']);
  d3.select("#grid")
    .datum(json)
    .call(grid)
    .selectAll(".row")
    .on({
      "mouseover": function(d) { 
		parcoords.highlight([d]);
		probGauge.activate();
		probGauge.update(d.probability);
	  },
      "mouseout": () => {
		  parcoords.unhighlight();
		  probGauge.deactivate();
	  }
    });
	
  // update data table on brush event
  
  parcoords.on("brush", function(d) {
    d3.select("#grid")
      .datum(d)
      .call(grid)
      .selectAll(".row")
      .on({
        "mouseover": function(d) { parcoords.highlight([d]) },
        "mouseout": parcoords.unhighlight
      });
  });
  d3.select('#btnReset').on('click', function() {
		  parcoords.brushReset(); 
		  d3.select("#grid")
		.datum(json)
		.call(grid)
		.selectAll(".row")
		.on({
		  "mouseover": function(d) { parcoords.highlight([d]) },
		  "mouseout": parcoords.unhighlight
		}); 
		
		 d3.select("#grid")
		.datum(json)
		.call(grid)
		.selectAll(".row")
		.on({
		  "mouseover": function(d) { parcoords.highlight([d]) },
		  "mouseout": parcoords.unhighlight
		});
	})
	
	$("#customer").keydown(function(e) {
		if (e.keyCode == 13) {
			var txt = document.getElementById("customer").value;
			document.getElementById("customer").value = '';
			d3.select("#grid")
			.datum(json.filter(function(d){
				return d.customer == Number(txt)}))
			.call(grid)
			.selectAll(".row")
			.on({
			"mouseover": function(d) { parcoords.highlight([d]) },
			"mouseout": parcoords.unhighlight
		  });
		}
	});
	
	$("#send").click(function(e) {
			var txt = document.getElementById("customer").value;
			document.getElementById("customer").value = '';
			d3.select("#grid")
			.datum(json.filter(function(d){
				return d.customer == Number(txt)}))
			.call(grid)
			.selectAll(".row")
			.on({
			"mouseover": function(d) { parcoords.highlight([d]) },
			"mouseout": parcoords.unhighlight
		  });
	});
	
}

var gauge = function(container, configuration) {
	var that = {};
	var config = {
		size						: 200,
		clipWidth					: 200,
		clipHeight					: 110,
		ringInset					: 20,
		ringWidth					: 20,

		pointerWidth				: 10,
		pointerTailLength			: 5,
		pointerHeadLengthPercent	: 0.9,

		minValue					: 0,
		maxValue					: 1,

		minAngle					: -90,
		maxAngle					: 90,

		transitionMs				: 750,

		majorTicks					: 50,
		//labelFormat					: d3.format(',g'),
		labelInset					: 10,

		activeArcColorFn					: d3.interpolate(d3.rgb('#84b3ff'), d3.rgb('#ff7070')),
    unactiveArcColorFn        : d3.interpolate(d3.rgb('#666'), d3.rgb('#888')),

    active : false
	};
	var range = undefined;
	var r = undefined;
	var pointerHeadLength = undefined;
	var value = 0;

	var svg = undefined;
	var arc = undefined;
	var scale = undefined;
	var ticks = undefined;
	var tickData = undefined;
	var pointer = undefined;

	var donut = d3.layout.pie();

	function deg2rad(deg) {
		return deg * Math.PI / 180;
	}

	function newAngle(d) {
		var ratio = scale(d);
		var newAngle = config.minAngle + (ratio * range);
		return newAngle;
	}

	function configure(configuration) {
		var prop = undefined;
		for ( prop in configuration ) {
			config[prop] = configuration[prop];
		}

		range = config.maxAngle - config.minAngle;
		r = config.size / 2;
		pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

		// a linear scale that maps domain values to a percent from 0..1
		scale = d3.scale.linear()
			.range([0,1])
			.domain([config.minValue, config.maxValue]);

		ticks = scale.ticks(config.majorTicks);
		tickData = d3.range(config.majorTicks).map(function() {return 1/config.majorTicks;});

		arc = d3.svg.arc()
			.innerRadius(r - config.ringWidth - config.ringInset)
			.outerRadius(r - config.ringInset)
			.startAngle(function(d, i) {
				var ratio = d * i;
				return deg2rad(config.minAngle + (ratio * range));
			})
			.endAngle(function(d, i) {
				var ratio = d * (i+1);
				return deg2rad(config.minAngle + (ratio * range));
			});
	}
	that.configure = configure;

	function centerTranslation() {
		return 'translate('+r +','+ r +')';
	}

	function isRendered() {
		return (svg !== undefined);
	}
	that.isRendered = isRendered;

	function render(newValue) {
    d3.select(container).select("svg").remove();
		svg = d3.select(container)
			.append('svg:svg')
				.attr('class', 'gauge')
				.attr('width', config.clipWidth)
				.attr('height', config.clipHeight + 200);

		var centerTx = centerTranslation();

		var arcs = svg.append('g')
				.attr('class', 'arc')
				.attr('transform', centerTx);

		arcs.selectAll('path')
				.data(tickData)
			.enter().append('path')
				.attr('fill', function(d, i) {
          if (config.active) {
					     return config.activeArcColorFn(d * i);
          } else {
               return config.unactiveArcColorFn(d * i);
          }
				})
				.attr('d', arc);
    if (config.active) {
  		var lg = svg.append('g')
  				.attr('class', 'label')
  				.attr('transform', centerTx);
  		lg.selectAll('text')
  				.data(ticks)
  			.enter().append('text')
  				.attr('transform', function(d) {
  					var ratio = scale(d);
  					var newAngle = config.minAngle + (ratio * range);
  					return 'rotate(' +newAngle +') translate(0,' +(config.labelInset - r) +')';
  				})
  				.text(config.labelFormat);

  		var lineData = [ [config.pointerWidth / 2, 0],
  						[0, -pointerHeadLength],
  						[-(config.pointerWidth / 2), 0],
  						[0, config.pointerTailLength],
  						[config.pointerWidth / 2, 0] ];
  		var pointerLine = d3.svg.line().interpolate('monotone');
  		var pg = svg.append('g').data([lineData])
  				.attr('class', 'pointer')
  				.attr('transform', centerTx);

  		pointer = pg.append('path')
  			.attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
  			.attr('transform', 'rotate(' +config.minAngle +')');
        		update(newValue === undefined ? 0 : newValue);
      }



    ometer = svg.append("text")
                .text("SUSPICIOUS-O-METER™")
                .attr("x", config.clipWidth / 2)
                .attr("y", config.clipHeight / 2 + 10)
                .attr("font-family", "Engravers MT")
                .attr("font-style", "italic")
                .attr("font-size", "18")
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "hanging")
	}
	that.render = render;

	function update(newValue, newConfiguration) {
    //activate()
		if ( newConfiguration  !== undefined) {
			configure(newConfiguration);
		}
		var ratio = scale(newValue);
		var newAngle = config.minAngle + (ratio * range);
		pointer.transition()
			.duration(config.transitionMs)
  		//.ease('elastic')
			.attr('transform', 'rotate(' +newAngle +')');
	}
	that.update = update;

  function activate() {
    config.active = true;
    render();
  }
  that.activate = activate;

  function deactivate() {
    config.active = false;
    render();
  }
  that.deactivate = deactivate;

	configure(configuration);

	return that;
};
