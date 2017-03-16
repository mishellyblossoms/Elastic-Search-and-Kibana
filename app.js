	var request = require('request');
	var parseString = require('xml2js').parseString;
	var express = require('express')
	var app = express()
	var AWS = require('aws-sdk');
    const elasticsearch = require('elasticsearch');
    var client = new elasticsearch.Client({
    host: 'https://search-domain-6mw3xkx2xwiiol5x4rof7su4b4.us-west-2.es.amazonaws.com/',
    log: 'info'
});

          
	function fetchData() {  // getting data from the universal studio website and upload to elsticsearch

		request('http://www.universalstudioshollywood.com/waittimes/?type=all&site=USH', function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		   
			parseString(body, function (err, result) 
			{
			    var info = [];
			    var items = result.rss.channel[0].item;
			    for(var i = 0; i < items.length; i++)
			      {
			    	info.push({'name':items[i].title[0], 'timestamp' : Date.now(),'waittime':items[i].description[0]) });
		          }
			}
			 upload(info);
			});
		  }
		})
	}

var upload = function (item) { // upload to elasticsearch
    for (var i = 0; i < item.length; i++) {
        client.create({
            index: 'universalstudioshollywood',
            type: 'WaitTime',
            body: item[i]
        }, function (error, response) {
            if (error) {
                console.error(error);
            }
        });
    }
   
};

  
   var minutes = 1440, the_interval = minutes * 60 * 1000; // set pull data to every 24 hours
   setInterval(function() {
   	 console.log("Doing daily min check");
   	 fetchData();
   },the_interval);


	

	app.listen(3000, function () {
	  console.log('App listening on port 3000!')
	})
	