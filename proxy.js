function sleep(milliseconds, bithost) {
	// synchronous XMLHttpRequests from Chrome extensions are not blocking event handlers. That's why we use this
	// pretty little sleep function to try to get the IP of a .bit domain before the request times out.
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if (((new Date().getTime() - start) > milliseconds) || (sessionStorage.getItem(bithost) != null)){
			break;
		}
	}
}

// run script when a request is about to occur
chrome.webRequest.onBeforeRequest.addListener(function (details) {
	// get the parts of the url (hostname, port) by creating an 'a' element
	var parser = document.createElement('a');
	parser.href = details.url;
	
	// Make sure the domain ends with .bit.
	var tld = parser.hostname.slice(-3);
	if (tld != 'bit') {
		return;
	};
	
	var bithost = parser.hostname;
	var port = (parser.protocol == "https:" ? "443" : "80");
	var access = (parser.protocol == "https:" ? "HTTPS" : "PROXY");

	// Check the local cache to save having to fetch the value from the server again.
	if (sessionStorage.getItem(bithost) == undefined) {
		// This .bit domain is not in cache, get the IP from dotbit.me
		var xhr = new XMLHttpRequest();
		var url = "https://dotbit.me/a/"+bithost;
		// synchronous XMLHttpRequest is actually asynchronous
		// check out https://developer.chrome.com/extensions/webRequest
		xhr.open("GET", url, false);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				// Get the ip address returned from the DNS proxy server.
				var bitip = xhr.responseText;
				// store the IP for .bit hostname in the local cache which is reset on each browser restart
				sessionStorage.setItem(bithost, bitip);
			}
		}
		xhr.send();
		// block the request until the new proxy settings are set. Block for up to two seconds.
		sleep(2000, bithost);
	};
	
	// Get the IP from the session storage.
	var bitip = sessionStorage.getItem(bithost);
	var config = {
		mode: "pac_script",
		pacScript: {
			data: "function FindProxyForURL(url, host) {\n" +
			"  if (dnsDomainIs(host, '"+bithost+"'))\n" +
			"    return '"+access+" "+bitip+":"+port+"';\n" +
			"  return 'DIRECT';\n" +
			"}"
		};
	};
	
	chrome.proxy.settings.set({value: config, scope: 'regular'},function() {});
	console.log('IP '+bitip+' for '+bithost+' found, config is changed: '+JSON.stringify(config));
	
}, { urls: ["<all_urls>"] }, ["blocking"]);
