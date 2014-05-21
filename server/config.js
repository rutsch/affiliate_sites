var config = module.exports = {
	general : {
		defaultsite: 'sneakerportal',
		port: 80,
		cookiesecret: 'dsfsddf*98798SD&*(FSFSHSKJhkjhrgfkjxcvloHKJHKDFLlkJlkhLJHKJHDFDSSseeree',
		dev: {
			mongodbconnectionstring: 'mongodb://localhost/affiliate_sites'
		}
	},
	sites: {
		sneakerportal: {
			sitetitle: 'Sneaker Portal',
			sitesubtitle: 'Online sneaker overzicht',
			introtext: 'Hier vind u....',
			settings: {
				homepagefilter: 'zomer',
				sliderfilter: 'aanbieding'
			},
			filters: [ 'vendor', 'category', 'color'],
			productfeeds: [
				{
					name: 'zalando',
					url: 'http://df.zanox.com/download?dfid=218106&asid=1784897&m=xml_tree&miid=337624&itid=2650&token=5A7776247B8AA1926BA990D468B84088D0EAF6346B091DB53B92E0042B4B59C7610339'
				},
				{
					name: 'vimodos',
					url: 'http://df.zanox.com/download?dfid=565106&asid=1784897&m=xml_tree&miid=493749&itid=2650&token=5A7776247B8AA1926BA990D468B84088D0EAF6346B091DB53B92E0042B4B59C7610339'
				},
				{
					name: 'omoda',
					url: 'http://df.zanox.com/download?dfid=565106&asid=1784897&m=xml_tree&miid=493749&itid=2650&token=5A7776247B8AA1926BA990D468B84088D0EAF6346B091DB53B92E0042B4B59C7610339'
				},
				{
					name: 'tommy',
					url: 'http://df.zanox.com/download/stream-669106-29459.xml?dfid=669106&duid=29459&dhid=E84E&m=xml_tree&miid=4778878&zmid=23722834C479793031T'
				},
				{
					name: 'brandos',
					url: 'http://df.zanox.com/download/stream-343106-29459.xml?dfid=343106&duid=29459&dhid=E84E&m=xml_tree&q=sneakers&zmid=23722861C1783088504T'
				},
				{
					name: 'mexx',
					url: 'http://df.zanox.com/download/stream-572106-29459.xml?dfid=572106&duid=29459&dhid=E84E&m=xml_tree&miid=4357026&zmid=23735133C1486244330T'
				},
				{
					name: 'mcgregor',
					url: 'http://df.zanox.com/download?dfid=467106&asid=1784897&m=xml_tree&miid=255113&itid=2650&token=5A7776247B8AA1926BA990D468B84088D0EAF6346B091DB53B92E0042B4B59C7610339'
				}
				
			]
		},
		tassenportal: {
			sitetitle: 'Tassen Portal',
			sitesubtitle: 'Online tassen zoeken',
			introtext: 'Hier vind u....',
			settings: {
				homepagefilter: 'leer',
				sliderfilter: '%'
			},
			filters: [ 'vendor', 'category', 'color'],		
			productfeeds: [
				{
					name: 'zalando',
					url: 'http://df.zanox.com/download?dfid=218106&asid=1784897&m=xml&enq=ISO_8859_1&miid=337679&itid=3127&token=5A7776247B8AA1926BA990D468B84088D0EAF6346B091DB53B92E0042B4B59C7610339'
				},
				{
					name: 'zalando',
					url: 'http://df.zanox.com/download?dfid=218106&asid=1784897&m=xml&enq=ISO_8859_1&miid=337690&itid=3127&token=5A7776247B8AA1926BA990D468B84088D0EAF6346B091DB53B92E0042B4B59C7610339'
				},
				{
					name: 'zalando',
					url: 'http://df.zanox.com/download?dfid=218106&asid=1784897&m=xml&enq=ISO_8859_1&miid=337605&itid=3127&token=5A7776247B8AA1926BA990D468B84088D0EAF6346B091DB53B92E0042B4B59C7610339'
				},
				{
					name: 'mexx',
					url: 'http://df.zanox.com/download?dfid=572106&asid=1784897&m=xml&enq=ISO_8859_1&miid=162861&itid=3127&token=5A7776247B8AA1926BA990D468B84088D0EAF6346B091DB53B92E0042B4B59C7610339'
				},
				{
					name: 'tommy',
					url: 'http://df.zanox.com/download?dfid=669106&asid=1784897&m=xml&enq=ISO_8859_1&miid=265557&itid=3127&token=5A7776247B8AA1926BA990D468B84088D0EAF6346B091DB53B92E0042B4B59C7610339'
				}
			]
		}	,
		zonnebrillenportal: {
			sitetitle: 'Zonnebrillen Portal',
			sitesubtitle: 'Online zonnebrillen zoeken',
			introtext: 'Hier vind u....',
			settings: {
				homepagefilter: 'Oakley',
				sliderfilter: '%'
			},
			filters: [ 'vendor', 'category'],			
			productfeeds: [
				{
					name: 'sunglasses-shop',
					url: 'http://df.zanox.com/download/stream-482106-1814700.xml?dfid=482106&asid=1814700&m=xml_tree&token=5A7776247B8AA1926BA990D468B84088D0EAF6346B091DB53B92E0042B4B59C7610339'
				}
			]
		},
		phoneportal: {
			sitetitle: 'Phone Portal',
			sitesubtitle: 'Online smartphones zoeken',
			introtext: 'Hier vind u....',
			settings: {
				homepagefilter: '%',
				sliderfilter: '%'
			},
			filters: [ 'vendor', 'category'],			
			productfeeds: [
				{
					name: 'coolblue',
					url: 'http://df.zanox.com/download/stream-872106-29459.xml?dfid=872106&duid=29459&dhid=E84E&m=xml_tree&zmid=23050146C506617831T'
				},
				{
					name: 'pixmania',
					url: 'http://df.zanox.com/download/stream-594106-29459.xml?dfid=594106&duid=29459&dhid=E84E&m=xml_tree&miid=16207853925&zmid=23686233C1482228264T'
				}				
			]
		},
		tabletportal: {
			sitetitle: 'Tablet Portal',
			sitesubtitle: 'Online tablets zoeken',
			introtext: 'Hier vind u....',
			settings: {
				homepagefilter: '%',
				sliderfilter: '%'
			},
			filters: [ 'vendor', 'category'],			
			productfeeds: [
				{
					name: 'coolblue',
					url: 'http://df.zanox.com/download?dfid=293106&asid=1716089&m=xml&q=tablet&itid=3127&token=5A7776247B8AA1926BA990D468B84088D0EAF6346B091DB53B92E0042B4B59C7610339'
				},
				{
					name: 'bcc',
					url: 'http://df.zanox.com/download?dfid=753106&asid=1716089&m=xml&q=tablet&itid=3127&token=5A7776247B8AA1926BA990D468B84088D0EAF6346B091DB53B92E0042B4B59C7610339'
				}				
			]
		},
		fashionportal: {
			sitetitle: 'Fashion Portal',
			sitesubtitle: 'Online fashion zoeken',
			introtext: 'Hier vind u....',
			settings: {
				homepagefilter: '%',
				sliderfilter: '%'
			},
			filters: [ 'vendor', 'category'],			
			productfeeds: [
		
			]
		},
		computerportal: {
			sitetitle: 'Computer Portal',
			sitesubtitle: 'Online computers zoeken',
			introtext: 'Hier vind u....',
			settings: {
				homepagefilter: '%',
				sliderfilter: '%'
			},
			filters: [ 'vendor', 'category'],			
			productfeeds: [
			
			]
		}				
	}
}
