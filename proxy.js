chrome.webRequest.onBeforeRequest.addListener(function (details) {
  var parser = document.createElement('a');
  parser.href = details.url;
  var tld = parser.hostname.slice(-3);
    if (tld != 'bit') {
       	return;
    } else {
      // alert('Getting request for '+details.url);
      var xhr = new XMLHttpRequest();
      var url = "https://dotbit.me/a/"+parser.hostname;
      
      if (parser.protocol == "https:") {
	var port = "443";
	var access = "HTTPS";
      } else {
      	var port = "80";
      	var access = "PROXY";
      }
      xhr.open("GET", url, false);
      xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
	var bitip = xhr.responseText;
	console.log('Access via '+access+' IP: '+bitip+', port '+port+' and server url '+url);
	var config = {
          mode: "pac_script",
          pacScript: {
          data: "function FindProxyForURL(url, host) {\n" +
                "  if (dnsDomainIs(host, '"+parser.hostname+"'))\n" +
                "    return '"+access+" "+bitip+":"+port+"';\n" +
                "  return 'DIRECT';\n" +
                "}"
          }
        };
	console.log('Config is: '+JSON.stringify(config));
	chrome.proxy.settings.set({value: config, scope: 'regular'},function() {});
        }
      }
      xhr.send();
   }
}, {
    urls: ['*://*/*']
}, ['blocking']);
