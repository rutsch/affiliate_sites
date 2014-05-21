var async = require('async'),
	et = require('elementtree');

module.exports = function(app, models){
	app.all('/admin', function(req, res, next){
		next();
	});

	/*
	 * Index of admin 
	 */
	app.get('/admin', function(req, res){
	  res.render('admin/index', { title: 'Admin index page' });
	});

	/*
	 * Update all products for the current site
	 */
	app.get('/admin/load_products', function(req, res){
		async.series(
			[
				// 1. set all products to inactive where site = req.hostname
				function(cb){
					models.products.update({ site: req.hostname } , { active: false }, {multi: true}, function(){
						cb();
					});					
				},
				function(cb){
					async.each(app.cfg.sites[req.hostname].productfeeds, loadFeed, function(err){
						cb();
					});
				}
			], function(err){
				//reset the cache when done
				app.cache = {};
				//redirect to homepage 
				res.redirect('/');
			}
		);

		//feed.type === 'new' ? './column[@name="'+obj+'"]' : "./"+obj;
		function loadFeed(feed, cb){
			app.$.ajax({
				dataType: 'html',
				url: feed.url,
				success: function(data){
					var XML = et.XML;
					var tree = et.parse(data);
					var products = tree.findall('.//record');
					app.$.each(products, function(index, p){
						var product = new models.products();
						product.hash = p.findtext('./recordHash');
						product.data = {
							url: p.findtext('./url') || p.findtext('./column[@name="url"]'),
							title: p.findtext('./title') || p.findtext('./column[@name="title"]'),
							description: p.findtext('./description') || p.findtext('./column[@name="description"]'),
							description2: p.findtext('./description2') || p.findtext('./column[@name="description2"]'),
							offerid: p.findtext('./offerid') || p.findtext('./column[@name="offerid"]'),
							image: {
								regular: p.findtext('./image') || p.findtext('./column[@name="image"]'),
								large: p.findtext('./largeimage') || p.findtext('./column[@name="largeimage"]')
							},
							price: p.findtext('./price') || p.findtext('./column[@name="price"]'),
							category: {
								title: (p.findtext('./category') || p.findtext('./column[@name="category"]') || 'onbekend').toLowerCase(),
								normalized: normalizeTitle(p.findtext('./category') || p.findtext('./column[@name="category"]'))
							},
							subcategory: p.findtext('./subcategory') || p.findtext('./column[@name="subcategory"]'),
							ean: p.findtext('./ean') || p.findtext('./column[@name="ean"]'),
							vendor: {
								title: (p.findtext('./vendor') || p.findtext('./column[@name="vendor"]')).toLowerCase(),
								normalized: normalizeTitle(p.findtext('./vendor') || p.findtext('./column[@name="vendor"]'))
							},
							gender: {
								title: (p.findtext('./gender') || p.findtext('./column[@name="gender"]') || '').toLowerCase(),
								normalized: normalizeTitle(p.findtext('./gender') || p.findtext('./column[@name="gender"]') || '')
							},
							color: {
								title: (p.findtext('./color') || p.findtext('./column[@name="color"]') || '').toLowerCase(),
								normalized: normalizeTitle(p.findtext('./color') || p.findtext('./column[@name="color"]') || '' )
							}
						}
						
						product.affiliate = feed.name;
						product.site = req.hostname; 
						product.normalizedtitle = normalizeTitle(product.data.title);
						
						product.active = true;
						//console.log(product._id); 
						var obj = product;
						var id = obj._id;
						delete obj._id;
						//console.log(obj);
						models.products.findOne({normalizedtitle: product.normalizedtitle}, function(err, p){
							if(err) console.log(err) 
							else {
								if(p){
									p.active = true;
									p.data = product.data;
									p.save();
									console.log('updated product');
								}else{
									product.save(function(err){
										if(err) console.log(err)
										else console.log('saved product');
									})											
								}
							}
						});

					});
					cb();
				}
			});
		}
		
		// 3. loop through all results
		
		// 4. if already in db: update and set active
		
		// 5. else insert in db
	});
	

}

function normalizeTitle(title){
	return title.trim()
				.replace(/[^a-zA-Z 0-9]+/g,' ')
				.trim()
				.replace(/\s{2,}/g, ' ')
				.replace(/\s/g, '_')
				.toLowerCase();
}
