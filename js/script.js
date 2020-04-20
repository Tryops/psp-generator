
/* -----------[ WARNING: MESSY CODE AHEAD! ]----------- */

// Allow tabs in Editor: 
document.querySelector("textarea#input").addEventListener("keydown", e => {
	if(e.keyCode == 9 || e.which == 9){
		e.preventDefault();
		let s = e.target.selectionStart;
		e.target.value = e.target.value.substring(0, e.target.selectionStart) + "\t" + e.target.value.substring(e.target.selectionEnd);
		e.target.selectionEnd = s+1; 
	}
});

document.querySelector("button#download").addEventListener("click", e => saveSvg(document.querySelector("svg"), "diagram.svg"));
let viewToggle = document.querySelector("button#toggle");
viewToggle.addEventListener("click", e => { viewToggle.classList.toggle("vertical"); update(); });
let drawRects = true;
let autoNumbered = true;

let textarea = document.querySelector("textarea#input");

document.querySelector("button#eval").addEventListener("click", e => {
	generateTree();
});

document.querySelector("input[type='checkbox']#numbered").addEventListener("change", e => {
	autoNumbered = e.target.checked;
	generateTree();
});
document.querySelector("input[type='checkbox']#rect").addEventListener("change", e => {
	drawRects = e.target.checked;
	generateTree();
});
document.querySelector("input[type='range']#node-width").addEventListener("change", e => {
	rectW = e.target.value;
	//document.querySelector("label[for='"+e.target.id+"'] > div").innerHTML = e.target.value + "px";
	update();
});
document.querySelector("input[type='range']#node-dist-v").addEventListener("change", e => {
	depthFactor = e.target.value;
	update();
});
document.querySelector("input[type='range']#node-dist-h").addEventListener("change", e => {
	tree = d3.layout.tree().nodeSize([e.target.value, 40]);
	update();
});

function generateTree() {
	root = tabStringToJSON(textarea.value);
	prepareRoot();
	clear();
	update();
}

function tabStringToJSON(text) {
	let json = node('root');
	text.trim().split('\n').filter(s => !s.trim().startsWith("//") && !s.trim().length == 0).reduce(append_rec, json);
	json = removeEmptyLists(json.children[0]);
	if(autoNumbered) {
		numberNodes(1, "", json);
	}
	return json;
}

function removeEmptyLists(json) {
	if(json.children.length == 0) {
		json.children = undefined;
	} else {
		json.children.forEach(function(child) {
			removeEmptyLists(child);
		});
	}
	return json;
}

function numberNodes(parentNum, newNum, json) {
	let thisNum = parentNum + newNum + ".";
	json.name = thisNum + " " + json.name;
	if(json.children) {
		json.children.forEach(function(element, index) {
			numberNodes(thisNum, index+1, element);
		});
	}
	return json;
}

function node(name, lvl) {
    var children = [],
        parent = null;
    return {
        "name": name,
        "children": children,
        lvl:()=>lvl==undefined?-1:lvl,
        parent:()=>parent, //as a function to prevent circular reference when parse to JSON
        setParent:p=>{parent=p},
        appendChildren: function(c){
            children.push(c); 
            c.setParent(this);
            return this
        },
    }
}

function append_rec(prev,curr) {
    if(typeof(curr)=='string'){ //in the recursive call it's a object
        curr = curr.split('\t');//or tab (\t)
        curr = node(curr.pop(),curr.length);
    }
    if(curr.lvl()>prev.lvl()){//curr is prev's child
        prev.appendChildren(curr);
    }else if(curr.lvl()<prev.lvl()){
        append_rec(prev.parent(),curr) //recursive call to find the right parent level
    }else{//curr is prev's sibling
        prev.parent().appendChildren(curr);
    }

    return curr;
}

function saveSvg(svgEl, name) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var svgData = svgEl.outerHTML;
    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function trans(d) {
	let copy = {};
	copy.x = d.y;
	copy.y = d.x;
	copy.x0 = d.y0;
	copy.y0 = d.x0;
	return viewToggle.classList.contains("vertical") ? copy : d;
}

let treeContainer = document.querySelector("div#tree");

var margin = {
    top: 20,
    right: 120,
    bottom: 20,
    left: 120
},
width = 960 - margin.right - margin.left,
height = 800 - margin.top - margin.bottom;

var root = tabStringToJSON(textarea.value);

var i = 0,
    duration = 750,
    rectW = 170,
    rectH = 30,
    depthFactor = 150;

var tree = d3.layout.tree().nodeSize([200, 40]);
var diagonal = d3.svg.diagonal()
    .projection(d => [trans(d).x + rectW / 2, trans(d).y + rectH / 2]);


var svg = d3.select("div#tree").append("svg").attr("width", "100%").attr("height", "100%")
    .call(zm = d3.behavior.zoom().scaleExtent([0.5,3]).on("zoom", redraw)).append("g")
    .attr("transform", "translate(" + 350 + "," + 20 + ")");

//necessary so that zoom knows where to zoom and unzoom from
zm.translate([350, 20]);

generateTree(); // First init tree from textarea

function prepareRoot() {
	root.x0 = 0;
	root.y0 = height / 2;
	root.children.forEach(collapse);
	update(root);
}

function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}



function update(source) {
    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
        d.y = d.depth * depthFactor;
    });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function (d) {
        return d.id || (d.id = ++i);
    });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
        return "translate(" + trans(source).x0 + "," + trans(source).y0 + ")";
    })
        .on("click", click);

    function getTextWidth(text) {
	    // re-use canvas object for better performance
	    let font = "12px sans-serif";
	    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
	    var context = canvas.getContext("2d");
	    context.font = font;
	    var metrics = context.measureText(text);
	    return metrics.width;
	}

	if(drawRects) {
	    nodeEnter.append("rect")
	        .attr("width", rectW)
	        .attr("height", rectH)
	        .attr("stroke", "black")
	        .attr("stroke-width", 1)
	        .style("fill", function (d) {
	        return d.name.startsWith("<>") ? "#81c784" : d._children && d._children !== [] ? "lightblue" : "#fff";
	    });
    }

    nodeEnter.append("text")
        .attr("x", rectW / 2)
        .attr("y", rectH / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(d => d.name.replace("<>", "\u25C6"));

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function (d) {
        return "translate(" + trans(d).x + "," + trans(d).y + ")";
    });

    nodeUpdate.select("rect")
        .attr("width", rectW)
        .attr("height", rectH)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .style("fill", function (d) {
        return (/^(\d+\.)*\s*<>/g).test(d.name) ? "#81c784" : d._children && d._children !== [] ? "lightblue" : "#fff";
    });			// d.name.startsWith("<>")


    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) {
        return "translate(" + trans(source).x + "," + trans(source).y + ")";
    })
        .remove();

    nodeExit.select("rect")
        .attr("width", rectW)
        .attr("height", rectH)
    //.attr("width", bbox.getBBox().width)""
    //.attr("height", bbox.getBBox().height)
    	.attr("stroke", "black")
        .attr("stroke-width", 1);

    nodeExit.select("text");

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function (d) {
        return d.target.id;
    });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("x", rectW / 2)
        .attr("y", rectH / 2)
        .attr("d", function (d) {
        var o = {
            x: source.x0,
            y: source.y0
        };
        return diagonal({
            source: o,
            target: o
        });
    });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function (d) {
        var o = {
            x: source.x,
            y: source.y
        };
        return diagonal({
            source: o,
            target: o
        });
    })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// Toggle children on click.
function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update(d);
}

//Redraw for zoom
function redraw() {
  //console.log("here", d3.event.translate, d3.event.scale);
  svg.attr("transform",
      "translate(" + d3.event.translate + ")"
      + " scale(" + d3.event.scale + ")");
}


