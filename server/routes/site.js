var async = require('async'),
	_ = require('underscore')._,
	fs = require('fs'),
	jsonpath = require('JSONPath'),
	dynamicSort = function (property) {
		var sortOrder = 1;
		if(property[0] === "-") {
			sortOrder = -1;
			property = property.substr(1, property.length - 1);
		}
		if(property == 'price'){
			return function (a,b) {
				var result = (a[property] - b[property]);
				return result * sortOrder;
			}				
		}else{
			return function (a,b) {
				var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
				return result * sortOrder;
			}				
		}
	},
	dynamicSortMultiple = function () {
		/*
		 * save the arguments object as it will be overwritten
		 * note that arguments object is an array-like object
		 * consisting of the names of the properties to sort by
		 */
		var props = arguments;
		return function (obj1, obj2) {
			var i = 0, result = 0, numberOfProperties = props.length;
			/* try getting a different result from 0 (equal)
			 * as long as we have extra properties to compare
			 */
			while(result === 0 && i < numberOfProperties) {
				result = dynamicSort(props[i])(obj1, obj2);
				i++;
			}
			return result;
		}
	};

module.exports = function(app, models){
	/*
	 * Routes
	 */
	app.all('*', prepareRequest);  
		
	// special routes
	app.get('/templates.js', renderJadeTemplates);
		
	// pages
	app.get('/', renderHomepage);
	app.get('/product/:id', renderProductpage);
	app.get('/:id?', renderFilterpage);
		
	// ajax calls
	app.get('/data/products/:filter?', sendFilteredProducts);
	app.get('/data/vote/:product/:vote', insertProductVote);
	app.post('/data/comment/new', insertComment);
	

	/*
	 * Request handlers
	 */
	function prepareRequest(req, res, next){
		req.hostname =  ( req.headers.host.match(/:/g) ) ? req.headers.host.slice( 0, req.headers.host.indexOf(":") ) : req.headers.host;
		req.hostname = req.hostname.replace('http://', '').replace('www.', '').replace('.nl', '').replace('-', '');
		if(req.hostname === 'localhost') req.hostname = app.cfg.general.defaultsite;
		next();
	};
	
	function renderHomepage(req, res){			
		async.parallel(
			{	
				products: function(cb){
					models.products
						.where('site').equals(req.hostname)
						.where('active').equals(true)
						.count()
						.exec(function(err, result){
							cb(null, result);
						});
						//cb(null, []);
				},
				// get distinct vendors		
				brands: function(cb){
					var cacheKey = req.hostname + '_brands';
					if(cacheKey in app.cache){
						cb(null, app.cache[cacheKey]);
					}else{							
						getDistinctFilterItems('vendor', false, req, function(err, result){
							result = result.sort(dynamicSortMultiple('-count'));
							app.cache[cacheKey] = result;
							cb(null, result);
						});		
					}
				},
				// get distinct colors
				colors: function(cb){
					if(app.$.inArray('color', app.cfg.sites[req.hostname].filters) > -1){
						var cacheKey = req.hostname + '_colors';
						if(cacheKey in app.cache){
							cb(null, app.cache[cacheKey]);
						}else{
							getDistinctFilterItems('color', false, req, function(err, result){
								result = result.sort(dynamicSortMultiple('_id.title'));
								app.cache[cacheKey] = result;
								cb(null, result);
							});		
						}			
					}else{
						cb(null, []);
					}
				},
				// get distinct categories
				categories: function(cb){
					var cacheKey = req.hostname + '_categories';
					if(cacheKey in app.cache){
						cb(null, app.cache[cacheKey]);
					}else{				
						getDistinctFilterItems('gender', false, req, function(err, result){
							result = result.sort(dynamicSortMultiple('_id.title'));
							app.cache[cacheKey] = result;
							cb(null, result);
						});							
					}
				},
				// get the slider products
				sliderproducts: function(cb){
					models.products
						.where('site').equals(req.hostname)
						.find( { 'data.description': new RegExp( app.cfg.sites[req.hostname].settings.sliderfilter ) } )
						.limit(10)
						.exec(function(err, result){
							cb(null, result);
						});
				}	
			}, 
			// render the view when all async functions above are done
			function(err, results){
				res.render('index', { 
					template: 'index',
					title: app.cfg.sites[req.hostname].sitetitle,
					subtitle: app.cfg.sites[req.hostname].sitesubtitle,
					filter: '',
					introtext: app.cfg.sites[req.hostname].introtext,
					brands: results.brands,
					colors: results.colors,
					categories: results.categories,
					sliderproducts: results.sliderproducts,
					feeds: [],
					products: results.products
				});			
			}
		);
	};

	function renderProductpage(req, res){		
		var product = req.params.id;
		//console.log(product);
		async.parallel(
			{	
				product: function(cb){
					models.products
						.where('site').equals(req.hostname)
						.where('normalizedtitle').equals(product)
						.limit(1)
						.exec(function(err, result){

							cb(null, result[0]);
						});
				},
				// get distinct vendors		
				brands: function(cb){
					var cacheKey = req.hostname + '_brands';
					if(cacheKey in app.cache){
						cb(null, app.cache[cacheKey]);
					}else{							
						getDistinctFilterItems('vendor', false, req, function(err, result){
							result = result.sort(dynamicSortMultiple('-count'));
							app.cache[cacheKey] = result;
							cb(null, result);
						});		
					}
				},
				// get distinct colors
				colors: function(cb){
					if(app.$.inArray('color', app.cfg.sites[req.hostname].filters) > -1){
						var cacheKey = req.hostname + '_colors';
						if(cacheKey in app.cache){
							cb(null, app.cache[cacheKey]);
						}else{
							getDistinctFilterItems('color', false, req, function(err, result){
								result = result.sort(dynamicSortMultiple('_id.title'));
								//console.log(result);
								app.cache[cacheKey] = result;
								cb(null, result);
							});		
						}			
					}else{
						cb(null, []);
					}
				},
				// get distinct categories
				categories: function(cb){
					var cacheKey = req.hostname + '_categories';
					if(cacheKey in app.cache){
						cb(null, app.cache[cacheKey]);
					}else{				
						getDistinctFilterItems('gender', false, req, function(err, result){
							result = result.sort(dynamicSortMultiple('_id.title'));
							app.cache[cacheKey] = result;
							cb(null, result);
						});							
					}
				},
				// get the slider products
				sliderproducts: function(cb){
					models.products
						.where('site').equals(req.hostname)
						.where('normalizedtitle').equals(product)
						.limit(1)
						.exec(function(err, result){
							cb(null, result);
						});
				}	
			}, 
			// render the view when all async functions above are done
			function(err, results){
				//console.log(results.product);
				if(results.product){
					res.render('product', { 
						template: 'product',
						title: app.cfg.sites[req.hostname].sitetitle,
						subtitle: (results.product ? results.product.data.title : 'product niet gevonden'),
						filter: '',
						brands: results.brands,
						colors: results.colors,
						categories: results.categories,
						sliderproducts: results.sliderproducts ? results.sliderproducts : [],
						feeds: [],
						product: results.product
					});							
				}else{
					res.render('error' ,{
						template: 'error',
						filter: '',
						title: app.cfg.sites[req.hostname].sitetitle,
						body: 'Het door u gezochte product is niet gevonden. Kijkt u gerust verder rond voor vele mooie andere aanbiedingen.'
					});
				}
			}
		);
	};
	
	function renderFilterpage(req, res){	
		var filter = req.params.id;		
		//console.log(filter);
		async.parallel(
			{	
				// get the filtered products
				// TODO: find a way to make the or statement below dynamic so it can be loaded from the config. (set site filtercomponents in config)
				products: function(cb){
					/*models.products
					.where('site').equals(req.hostname)
					.find(
						{ $or: 
							[ 
								{ 'data.vendor.normalized': filter } ,
								{ 'data.color.normalized': filter } ,
								{ 'data.category.normalized': filter }
							] 
						}
					)
					.exec(function(err, result){
						cb(null, result);
					});*/
					cb(null, []);
				},
				subtitle: function(cb){
					var output = models.products
					.where('site').equals(req.hostname)
					.find(
						{ $or: 
							[ 
								{ 'data.vendor.normalized': filter } ,
								{ 'data.color.normalized': filter } ,
								{ 'data.gender.normalized': filter }
							] 
						}
					)
					.limit(1)
					.exec(function(err, result){
						if(result[0] && result[0].data.color.normalized === filter){
							cb(null, result[0].data.color);
						}else if (result[0] && result[0].data.vendor.normalized === filter){
							cb(null, result[0].data.vendor);
						}else if (result[0] && result[0].data.gender.normalized === filter){
							cb(null, result[0].data.gender);
						}else{
							console.log(result);
							cb(null, 'unknown title');
						}
					});	
				},
				// get distinct vendors		
				brands: function(cb){
					getDistinctFilterItems('vendor', true, req, function(err, result){
						result = result.sort(dynamicSortMultiple('_id.title'));
						cb(null, result);
					});
				},
				// get distinct colors
				colors: function(cb){
					console.log(req.hostname);
					if(app.$.inArray('color', app.cfg.sites[req.hostname].filters) > -1){
						getDistinctFilterItems('color', true, req, function(err, result){
							//console.log(result);
							result = result.sort(dynamicSortMultiple('_id.title'));
							cb(null, result);
						});	
					}else{
						cb(null, []);
					}
				},
				// get distinct categories
				categories: function(cb){
					getDistinctFilterItems('gender', true, req, function(err, result){
						result = result.sort(dynamicSortMultiple('_id.title'));
						cb(null, result);
					});
				},
				// get the slider products
				sliderproducts: function(cb){
					models.products
						.where('site').equals(req.hostname)
						.find({'data.description': /zomer/})
						.limit(10)
						.exec(function(err, result){
							cb(null, result);
						});
				}
			}, 
			// render the view when all async functions above are done
			function(err, results){
				console.log(results.subtitle);
				res.render('filtered', { 
					template: 'filtered',
					title: app.cfg.sites[req.hostname].sitetitle,
					subtitle: results.subtitle.title || results.subtitle,
					filter: results.subtitle.normalized,
					introtext: app.cfg.sites[req.hostname].introtext,
					brands: results.brands,
					colors: results.colors,
					categories: results.categories,
					sliderproducts: results.sliderproducts,
					feeds: [],
					products: results.products,
					totalproducts: 0
				});			
			}
		);
	};

	function sendFilteredProducts(req, res){
		if(req.params.filter){
			// initial call on pageload
			var filter = req.params.filter,
				page = req.params.page;
				
			//console.log(filter);
			models.products
				.where('site').equals(req.hostname)
				.where('active').equals(true)
				.find(
					{ $or: 
						[ 
							{ 'data.vendor.normalized': filter } ,
							{ 'data.color.normalized': filter } ,
							{ 'data.gender.normalized': filter }
						] 
					}
				)
				.sort('data.price')
				.limit(16)
				.exec(function(err, result){
					if (err) res.send(err)
					else res.send({products: result, totalproducts: 0, currentpage: page});
				});			
		}else{
			// filtered ajax call
			var colors = req.query.colors ? req.query.colors.split(',') : [],
				categories = req.query.categories ? req.query.categories.split(',') : [],
				brands = req.query.brands ? req.query.brands.split(',') : [],
				page = req.query.page,
				cacheKey = req.hostname + '_filtered_' + colors.join('-') + categories.join('-') + brands.join('-') + page;

				 
			if(cacheKey in app.cache){
				res.send(app.cache[cacheKey]);
			}else{
				async.parallel(
				{
					totalproducts: function(cb){
						var query= models.products.find({'site': req.hostname, active: true});
						if(colors.length > 0) {
							query = query.where('data.color.normalized').in(colors);
						}
						if(categories.length > 0) {
							query = query.where('data.gender.normalized').in(categories);
						}
						if(brands.length > 0) {
							query = query.where('data.vendor.normalized').in(brands);
						}		
						query = query.count();
						query.exec(function(err, result){
							
							cb(null, result);
						});								
					},
					products: function(cb){
						var query= models.products.find({'site': req.hostname, active: true});
						if(colors.length > 0) {
							query = query.where('data.color.normalized').in(colors);
						}
						if(categories.length > 0) {
							query = query.where('data.gender.normalized').in(categories);
						}
						if(brands.length > 0) {
							query = query.where('data.vendor.normalized').in(brands);
						}		
						query = query.sort('data.price');				
						query = query.limit(16);
						query = query.skip((page -1) * 16);
						query.exec(function(err, result){
							
							cb(null, result);
						});							
					},
					colors: function(cb){
						if(app.$.inArray('color', app.cfg.sites[req.hostname].filters) > -1){
							getDistinctFilterItems('color', true, req, function(err, result){
								//console.log(result);
								result = result.sort(dynamicSortMultiple('-count'));
								cb(null, result);
							});	
						}else{
							cb(null, []);
						}						
					}, 
					categories: function(cb){
						getDistinctFilterItems('gender', true, req, function(err, result){
							//console.log(result);
							result = result.sort(dynamicSortMultiple('-count'));
							cb(null, result);
						});							
					},
					brands: function(cb){
						getDistinctFilterItems('vendor', true, req, function(err, result){
							//console.log(result);
							result = result.sort(dynamicSortMultiple('-count'));
							cb(null, result);
						});							
					}
				},
				function(err, results){
					app.cache[cacheKey] = results;
					console.log(results.totalproducts);
					res.send({
						totalproducts: results.totalproducts,
						products: results.products,
						currentpage: page,
						colors: results.colors,
						categories: results.categories,
						brands: results.brands
					});
				});
				
			}
		}
	}

	function insertProductVote(req, res){
		var productId = req.params.product,
			vote = req.params.vote;

		models.products
		.findOne()
		.where('site').equals(req.hostname)
		.where('normalizedtitle').equals(productId)
		.limit(1)
		.exec(function(err, product){
			product.votes.push({vote: vote});
			product.save();
			var average = product.voteaverage;
			res.send({average: average});
		});
		
	}
	
	function insertComment(req, res){
		var productId = req.body.productid,
			comment = req.body.comment;	
				
		models.products
		.findOne()
		.where('site').equals(req.hostname)
		.where('normalizedtitle').equals(productId)
		.limit(1)
		.exec(function(err, product){
			product.comments.push({text: comment});
			product.save();
			res.send(product);
		});			
	}

	function renderJadeTemplates(req, res){
		console.log("Compiling your Jade Views");
		var jadeClientTemplates = '';
		var jadeCreationTime = new Date();
		var fs = require('fs');
		var compile = require('clientjade/lib/compile');
		
		fs.readdir("./server/views/client", function(err, files){
			//console.log("Matched " + files.length + " jade files")
			var fullFiles = _.map(files, function(file){return "./server/views/client/" + file});
			//console.log(fullFiles);
			var opts = {
			  files: fullFiles,
			  compress: true
			}
			compile(opts, function(err, result) {
				if(err) console.log(err);
				//console.log(result);
				jadeClientTemplates = result;

				res.header("Last-Modified", jadeCreationTime);
				res.header("If-Modified-Since", jadeCreationTime);
				res.header("Date", jadeCreationTime);
				res.header("Cache-Control", "public,max-age=31536000");
				res.header('Content-Type', 'text/javascript');
				res.send(jadeClientTemplates);				
			});
		});		
		

	}; 
	
	function getDistinctFilterItems(field, filtered, req, cb){
		var filter = '';
		if(filtered){
			filter = req.params.id;
			if(filter){
				models.products
				.aggregate(
					{ $match: {
						$or: 
						[ 
							{ 'data.vendor.normalized': filter } ,
							{ 'data.color.normalized': filter } ,
							{ 'data.gender.normalized': filter }
						] ,
						'site': req.hostname, 
						active: true 
					} }, 
					{ $group: { _id: { title: '$data.'+field+'.title', normalized: '$data.'+field+'.normalized'}, count: {$sum: 1}}}, 
					function(err, result){
						//result = result.sort(dynamicSortMultiple('_id.title'));
						//console.log(result);
						//app.cache[cacheKey] = result;
						cb(null, result);
				});		
			}else{
				var colors = req.query.colors ? req.query.colors.split(',') : [/.*/], 
					categories = req.query.categories ? req.query.categories.split(',') : [/.*/],
					brands = req.query.brands ? req.query.brands.split(',') : [/.*/];
				
				models.products
				.aggregate(
					{ $match: {
						'data.vendor.normalized': {$in: brands},
						'data.color.normalized': {$in: colors},
						'data.gender.normalized': {$in: categories},
						'site': req.hostname, 
						active: true 
					} }, 
					{ $group: { _id: { title: '$data.'+field+'.title', normalized: '$data.'+field+'.normalized'}, count: {$sum: 1}}}, 
					function(err, result){
						//result = result.sort(dynamicSortMultiple('_id.title'));
						//console.log(result);
						//app.cache[cacheKey] = result;
						cb(null, result);
				});												
			}
		}else{
			models.products
			.aggregate(
				{ $match: { 'site': req.hostname, active: true } }, 
				{ $group: { _id: { title: '$data.'+field+'.title', normalized: '$data.'+field+'.normalized'}, count: {$sum: 1}}}, 
				function(err, result){
					//result = result.sort(dynamicSortMultiple('_id.title'));
					//console.log(result);
					//app.cache[cacheKey] = result;
					cb(null, result);
			});				
		}
		
	}
}
