;(function ($, window, undefined) {
  'use strict';

  var $doc = $(document),
      Modernizr = window.Modernizr;

  $(document).ready(function() {
    $.fn.foundationAlerts           ? $doc.foundationAlerts() : null;
    $.fn.foundationButtons          ? $doc.foundationButtons() : null;
    $.fn.foundationAccordion        ? $doc.foundationAccordion() : null;
    $.fn.foundationNavigation       ? $doc.foundationNavigation() : null;
    $.fn.foundationTopBar           ? $doc.foundationTopBar() : null;
    $.fn.foundationCustomForms      ? $doc.foundationCustomForms() : null;
    $.fn.foundationMediaQueryViewer ? $doc.foundationMediaQueryViewer() : null;
    $.fn.foundationTabs             ? $doc.foundationTabs({callback : $.foundation.customForms.appendCustomMarkup}) : null;
    $.fn.foundationTooltips         ? $doc.foundationTooltips() : null;
    $.fn.foundationMagellan         ? $doc.foundationMagellan() : null;
    $.fn.foundationClearing         ? $doc.foundationClearing() : null;

    $.fn.placeholder                ? $('input, textarea').placeholder() : null;
  });

  // UNCOMMENT THE LINE YOU WANT BELOW IF YOU WANT IE8 SUPPORT AND ARE USING .block-grids
  // $('.block-grid.two-up>li:nth-child(2n+1)').css({clear: 'both'});
  // $('.block-grid.three-up>li:nth-child(3n+1)').css({clear: 'both'});
  // $('.block-grid.four-up>li:nth-child(4n+1)').css({clear: 'both'});
  // $('.block-grid.five-up>li:nth-child(5n+1)').css({clear: 'both'});

  // Hide address bar on mobile devices (except if #hash present, so we don't mess up deep linking).
  if (Modernizr.touch && !window.location.hash) {
    $(window).load(function () {
      setTimeout(function () {
        window.scrollTo(0, 1);
      }, 0);
    });
  }

})(jQuery, this);

 $(window).load(function() {
	$('#slider').orbit({advanceSpeed: 10000});
	var pageTemplate = $('body').attr('data-template'),
		activeFilters = $('body').attr('data-filter');

	$.each($('a.left_menu_item'), function(index, el){
		if(activeFilters.indexOf($(el).attr('data-filter')) > -1){
			$(el).toggleClass('selected');
		}
	});
	var $elClicked = $('a[data-filter='+ $('body').attr('data-filter') +']');
		
	loadProducts('filter', 1);
	
	$('a.filter').click(function(){
		$(this).toggleClass('selected');
		loadProducts('filter', 1);
		return false;
	});	
		
	$('div.pagination_element').click(function(){
		var page = $(this).html();
		loadProducts('filter', page);
		return false;
	});
			
	$('dd.vote').click(function(e){
		var vote = $(this).attr('data-vote'),
			productId = $(this).attr('data-product');
		
		$.ajax({
			url: '/data/vote/' + productId + '/' + vote
		}).done(function(vote) {
			console.log(vote.average);
			$('p.vote-average').html(vote.average);
		});
	});
	

 });
	
function saveComment(el){
	var comment = $('input#commenttext').val(),
		productId = $(el).attr('data-product');
	if(comment == '') {
		alert('U heeft geen commentaar ingevuld.');
	}else{
		$.ajax({
			url: '/data/comment/new',
			type: 'POST',
			data: {
				comment: comment,
				productid: productId
			}
		}).done(function(vote) {
			$('p.comment-length').html(vote.comments.length);
			$('input#commenttext').val('');
		});		
	}
}

function loadProducts(mode, page){
	var url = '/data/products/',
		arrFilterItems = [];
	
	switch (mode)
	{
		case 'initial':
			console.log($('body').attr('data-filter'));
			url += $('body').attr('data-filter');
			
			break;
		case 'filter':
			var qs = '',
				params = {};
				
			// get all selected filter items per filter group
			$.each($('dl.filter-component'), function(index, el){
				// get type
				var type = $(el).attr('id'),
					selected = $(el).find('a.selected');
				if(selected.length > 0){
					// get selected items
					var filterItems = [];
					$.each(selected, function(index, elSelected){
						console.log(elSelected);
						// create comma separated string of normalized titles and add to filterstring (colors=rood,groen,blauw&brands=puma)
						filterItems.push($(elSelected).attr('data-filter'));
						arrFilterItems.push($(elSelected).attr('data-filter'));
					});
					params[type] = filterItems.join(',');
				}
			});
			params.page = page;
			url += '?' + $.param(params);
			break;
		default:
			break;
	}
		
	$.ajax({
		url: url
	}).done(function(result) {
		console.log(result);
		$('body').attr('data-filter', arrFilterItems);
		jade.render(document.getElementById('products'), 'products', {products: result.products, totalproducts: result.totalproducts, currentpage: page});
		
		jade.render(document.getElementById('brands'), 'filterlist', {input: result.brands});
		jade.render(document.getElementById('categories'), 'filterlist', {input: result.categories});
		jade.render(document.getElementById('colors'), 'filterlist', {input: result.colors});
		
		var activeFilters = $('body').attr('data-filter');
		console.log(activeFilters);

		$.each($('a.left_menu_item'), function(index, el){
			if(activeFilters.indexOf($(el).attr('data-filter')) > -1){
				$(el).toggleClass('selected');
			}
		});
		
		var $container = $('ul.products')
		$container.isotope({
			// options
			itemSelector : 'li.panel'
		});		
		
		$('a.filter').click(function(){
			$(this).toggleClass('selected');
			loadProducts('filter', 1);
			return false;
		});			
		
		$('div.pagination_element').click(function(){
			var page = $(this).html();
			loadProducts('filter', page);
			return false;
		});
		
		
	});	
}
