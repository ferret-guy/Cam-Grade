<!DOCTYPE html>
<html lang="{{ config('app.locale') }}">
	<head>
		<title>Camgrade</title>
		<link rel="stylesheet" type="text/css" href="/css/style.css" />
		<link rel="icon" type="image/x-icon" href="/img/favicon.ico" />
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>
		<script>window.jQuery || document.write('<script src="/js/jquery.min.js"><\/script>')</script>
		<script type="text/javascript" src="/js/grading.js"></script>
	</head>
	<body>
		<div id="cam-container">
			<div id="cam-content">
				<span id="cam-instructions">
					<label>
						<input id="filechoose" type="file" accept="image/*" />
						<table id="cam-actualinstructions"><tr><td>
							Drag and drop a file,<br/>
							or click to select one.
						</td></tr></table>
						<img id="cam-frame" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="/>
						<canvas id="cam-canvas"></canvas>
					</label>
				</span>
			</div>
		</div>
		<div id="doc-container">
			<div id="doc-decorative-bar"></div>
			<div id="doc-header">
				<img class="noselect brand" src="/img/banner-large.png" />
				@if (Route::has('login'))
					<div id="account-control">
						@if (Auth::check())
							{{ Auth::user()->name }}
							<a href="{{ route('logout') }}"
								onclick="event.preventDefault();
										document.getElementById('logout-form').submit();">
								Logout
							</a>
	
							<form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
								{{ csrf_field() }}
							</form>
						@else
							<a href="{{ url('/login') }}">Login</a>
							<a href="{{ url('/register') }}">Register</a>
						@endif
					</div>
				@endif
			</div>
			<div id="doc-content">
				<div class="document">
					<span class="count">1</span>
					<span class="student"></span>
					<div class="output"></div>
					<div class="progress-container">
						<div class="progress-bar"></div>
					</div>
				</div>
				<div class="document">
					2
				</div>
				<div class="document">
					3
				</div>
			</div>
			<div id="doc-related-actions">
				<span class="action" style="background-image: url('/img/warn.png');"></span>
				<span class="action" style="background-image: url('/img/logo.png');"></span>
				<span class="action" style="background-image: url('/img/people.png');"></span>
				<span class="action" style="background-image: url('/img/night.png');"></span>
				<span class="action" style="background-image: url('/img/nlos.png');"></span>
			</div>
			<div id="doc-footer">
				&copy;2017 James Rowley and Mark Omo. All Rights Reserved.
			</div>
		</div>
	</body>
</html>