var cv = require('opencv');

var lowThresh = 50;
var highThresh = 200;
var nIters = 2;
var minArea = 2000;
var maxArea = 2500;

var BLUE  = [0, 255, 0]; // B, G, R
var RED   = [0, 0, 255]; // B, G, R
var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R

exports.detectContour = function(callback){
	cv.readImage("./images/Yellow.jpg", function(err, im){
		if (err) throw err;

		  width = im.width()
		  height = im.height()
		  if (width < 1 || height < 1) callback('Image has no size');

		  var out = new cv.Matrix(height, width);
		  var big = new cv.Matrix(height, width);
  		  var all = new cv.Matrix(height, width);
  
		  im.convertGrayscale();
		  im_canny = im.copy();
		  im_canny.canny(lowThresh, highThresh);
		  im_canny.dilate(nIters);

		  contours = im_canny.findContours();

		/*  for (i = 0; i < contours.size(); i++) {

			if (contours.area(i) < minArea) continue;

			var arcLength = contours.arcLength(i, true);
			contours.approxPolyDP(i, 0.01 * arcLength, true);

			switch(contours.cornerCount(i)) {
			  case 3:
				out.drawContour(contours, i, GREEN);
				break;
			  case 4:
				out.drawContour(contours, i, RED);
				break;
			  default:
				out.drawContour(contours, i, WHITE);
			}
		  }

  		out.save('./tmp/detect-shapes.png'); */
  		 for(i = 0; i < contours.size(); i++) {
			if(contours.area(i) > maxArea) {
			  var moments = contours.moments(i);
			  var cgx = Math.round(moments.m10 / moments.m00);
			  var cgy = Math.round(moments.m01 / moments.m00);
			  big.drawContour(contours, i, GREEN);
			  big.line([cgx - 5, cgy], [cgx + 5, cgy], RED);
			  big.line([cgx, cgy - 5], [cgx, cgy + 5], RED);
			}
		  }

		  all.drawAllContours(contours, WHITE);

		  big.save('./tmp/big.png');
		  all.save('./tmp/all.png');

  		callback('Image saved to ./tmp/detect-shapes.png');
	});

}