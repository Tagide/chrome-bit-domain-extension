chrome.webRequest.onBeforeRequest.addListener(function (details) {
  var parser = document.createElement('a');
  parser.href = details.url;
  var tld = parser.hostname.slice(-3);
    if (tld != 'bit') {
       	return;
    } else {
      // alert('Getting request for '+details.url);
      var xhr = new XMLHttpRequest();
      var url = "http://app.dotbit.me/"+parser.hostname;
      xhr.open("GET", url, false);
      xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
	var bitip = xhr.responseText;
	console.log('IP: '+bitip+' and server url '+url);
	var config = {
          mode: "pac_script",
          pacScript: {
          data: "function FindProxyForURL(url, host) {\n" +
                "  if (dnsDomainIs(host, '"+parser.hostname+"'))\n" +
                "    return 'PROXY "+bitip+":80';\n" +
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
    urls: ['http://*/*']
}, ['blocking']);
