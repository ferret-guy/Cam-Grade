from pyimagesearch.transform import four_point_transform
from sympy.abc import x, y, z, a, b, c, f, t, k, n
from process_latex import process_sympy
from pyimagesearch import imutils
import numpy as np
from sympy import *
import base64
import requests
import json
import numpy as np
import sys
import cv2
import os

def find_page(img, draw=True):
	ratio = img.shape[0] / 500.0
	orig = img.copy()
	img = imutils.resize(img, height=500)

	gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
	#gray = cv2.GaussianBlur(gray, (19, 19), 0)
	edged = cv2.Canny(gray, 75, 200)

	if draw:
		cv2.imshow("Img", edged)
		cv2.waitKey(0)

	_, cnts, _ = cv2.findContours(edged.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

	cnts = sorted(cnts, key=cv2.contourArea, reverse=True)

	possiable_pages = []
	approx_conts = []
	for c in cnts:
		epsilon = 0.1 * cv2.arcLength(c, True)
		approx = cv2.approxPolyDP(c, epsilon, True)
		approx_conts.append(approx)
		if len(approx) == 4:
			possiable_pages.append(approx)
			break
	if draw:
		cv2.drawContours(img, cnts, -1, (0, 255, 0), 2)
		cv2.imshow("Img", img)
		cv2.waitKey(0)
	cv2.destroyAllWindows()

	return four_point_transform(orig, possiable_pages[0].reshape(4, 2) * ratio)

def crop(img, points):
	cropped = four_point_transform(img, points.reshape(4, 2))
	crop_int = 0.05
	return cropped[int(cropped.shape[0] * crop_int):int(cropped.shape[0] * (1 - crop_int)),
			  int(cropped.shape[1] * crop_int):int(cropped.shape[1] * (1 - crop_int))]

def find_box(img, draw=True):
	ratio = 1.5
	orig = img.copy()
	gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
	gray = cv2.GaussianBlur(gray, (3, 3), 0)
	gray = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C,
								cv2.THRESH_BINARY_INV, 61, 10)
	#gray = cv2.morphologyEx(gray, cv2.MORPH_OPEN, np.ones((3, 3)), iterations=1)
	#gray = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, np.ones((9, 9)), iterations=1)
	#gray = cv2.morphologyEx(gray, cv2.MORPH_OPEN, np.ones((3, 3)), iterations=2)
	#_, gray = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)
	gray = cv2.dilate(gray, np.ones((5, 5), np.uint8), iterations=2)
	edged = cv2.Canny(gray, 75, 200)

	if draw:
		pass
		cv2.imshow("orig", imutils.resize(gray, height=500))
		cv2.imshow("equ", imutils.resize(edged, height=500))
		cv2.waitKey(0)

	_, cnts, _ = cv2.findContours(edged.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

	cnts = sorted(cnts, key=cv2.contourArea, reverse=True)[:15]

	possiable_pages = []
	approx_conts = []
	for c in cnts:
		epsilon = 0.1 * cv2.arcLength(c, True)
		approx = cv2.approxPolyDP(c, epsilon, True)
		approx_conts.append(approx)
		if len(approx) == 4:
			possiable_pages.append(approx)

	possiable_pages = sorted(possiable_pages, key=lambda c: cv2.boundingRect(c)[1], reverse=False)
	out_page = []
	for i in range(len(possiable_pages)-1):
		if cv2.boundingRect(possiable_pages[i+1])[1] - cv2.boundingRect(possiable_pages[i])[1] > 15:
			out_page.append(possiable_pages[i])
	out_page.append(possiable_pages[-1])
	possiable_pages = out_page
	print "pages: {}, approx: {}".format(len(possiable_pages), len(approx_conts))
	if draw:
		cv2.drawContours(img, approx_conts, -1, (0, 255, 0), 2)
		cv2.drawContours(img, possiable_pages, -1, (0, 255, 0), 2)
		cv2.imshow("equ_conts", imutils.resize(img, height=500))
		cv2.waitKey(0)
		#cv2.imshow("cropped", ret[0])
		#cv2.imshow("cropped", imutils.resize(cropped, height=500))
		#plt.hist(orig.ravel(), 256, [0, 256])
		#plt.show()
		cv2.waitKey(0)
	ret = [crop(orig, x) for x in possiable_pages]
	ret2 = [x.tolist() for x in possiable_pages]
	return zip(ret, ret2)

image_data = []


"""
try:
	with open(os.environ['REQ']) as f:
		req = base64.b64decode(f.read().split(",")[1])
		nparr = np.fromstring(req, np.uint8)
		cv_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
except KeyError, e:
	print "Error! {}".format(e)
	returnData = {
		# HTTP Status Code:
		"status": 422,
			# Response Body:
		"body": "{\"Error\": \"could not find or decode img in body\"",
			# Send any number of HTTP headers
		"headers": {
			"Content-Type": "application/json",
		}
	}
	output = open(os.environ['res'], 'w')
	output.write(json.dumps(returnData))
	exit()
dst = cv_img
"""

warped = find_box(cv2.imread("test/pic-sheet.jpg"), draw=True)
dat = {}
from io import BytesIO
for i, (img, pts) in enumerate(warped):
	image_uri = "data:image/png;base64," + base64.b64encode(cv2.imencode(".png", img)[1])
	print "sending request {}".format(i)
	r = requests.post("https://api.mathpix.com/v3/latex",
		data=json.dumps({'url': image_uri}),
		headers={"app_id": "<>", "app_key": "<>",
			"Content-type": "application/json"})
	#print json.dumps(json.loads(r.text), indent=4, sort_keys=True)
	out = process_sympy(json.loads(r.text)['latex_anno'].replace(" ", ""))
	cv2.imshow("equ {}".format(i), img)
	print "{}:".format(i)
	pprint(out)
	print ""
	dat[str(i)] = json.loads(r.text)
	dat[str(i)]['numpy'] = str(srepr(out))
	dat[str(i)]['points'] = pts
cv2.waitKey(0)
returnData = {
		# HTTP Status Code:
		"status": 200,
			# Response Body:
		"body": dat,
			# Send any number of HTTP headers
		"headers": {
			"Content-Type": "application/json",
		}
	}
output = open(os.environ['res'], 'w')
output.write(json.dumps(returnData))
