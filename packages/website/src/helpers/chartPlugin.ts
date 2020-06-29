// Get the chart variable
const Chart = require('react-chartjs-2').Chart;

export const fillBetweenLinesPlugin = {
    afterDatasetsDraw: function (chart: any) {
        var ctx = chart.chart.ctx;
        var xaxis = chart.scales['x-axis-0'];
        var yaxis = chart.scales['y-axis-0'];
        var datasets = chart.data.datasets;
        ctx.save();

        for (var d = 0; d < datasets.length; d++) {
            var dataset = datasets[d];
            if (dataset.fillBetweenSet == undefined) {
                continue;
            }

            // get meta for both data sets
            var meta1 = chart.getDatasetMeta(d);
            var meta2 = chart.getDatasetMeta(dataset.fillBetweenSet);

            // do not draw fill if one of the datasets is hidden
            if (meta1.hidden || meta2.hidden) continue;

            // create fill areas in pairs
            for (var p = 0; p < meta1.data.length - 1; p++) {
                // if null skip
                if (dataset.data[p] == null || dataset.data[p + 1] == null) continue;

                ctx.beginPath();

                // trace line 1
                var curr = meta1.data[p];
                var next = meta1.data[p + 1];
                ctx.moveTo(curr._view.x, curr._view.y);
                ctx.lineTo(curr._view.x, curr._view.y);

                if (curr._view.steppedLine === true) {
                    ctx.lineTo(next._view.x, curr._view.y);
                    ctx.lineTo(next._view.x, next._view.y);
                }
                else if (next._view.tension === 0) {
                    ctx.lineTo(next._view.x, next._view.y);
                }
                else {
                    ctx.bezierCurveTo(
                        curr._view.controlPointNextX,
                        curr._view.controlPointNextY,
                        next._view.controlPointPreviousX,
                        next._view.controlPointPreviousY,
                        next._view.x,
                        next._view.y
                    );
                }

                // connect dataset1 to dataset2
                var curr = meta2.data[p + 1];
                var next = meta2.data[p];
                ctx.lineTo(curr._view.x, curr._view.y);

                // trace BACKWORDS set2 to complete the box
                if (curr._view.steppedLine === true) {
                    ctx.lineTo(curr._view.x, next._view.y);
                    ctx.lineTo(next._view.x, next._view.y);
                }
                else if (next._view.tension === 0) {
                    ctx.lineTo(next._view.x, next._view.y);
                }
                else {
                    // reverse bezier
                    ctx.bezierCurveTo(
                        curr._view.controlPointPreviousX,
                        curr._view.controlPointPreviousY,
                        next._view.controlPointNextX,
                        next._view.controlPointNextY,
                        next._view.x,
                        next._view.y
                    );
                }

                // close the loop and fill with shading
                ctx.closePath();
                ctx.fillStyle = dataset.fillBetweenColor || "rgba(0,0,0,0.1)";
                ctx.fill();
            } // end for p loop
        }
    } // end afterDatasetsDraw
}; // end fillBetweenLinesPlugin


Chart.pluginService.register(fillBetweenLinesPlugin);
