module.exports = function(mongoose){
	var schema = mongoose.Schema({
		hash: {
			type: String,
			unique: true,
			required: true,
			index: true
		},		
		data: {
			url: String,
			title: String,
			description: String,
			description2: String,
			offerid: String,
			image: {
				regular: String,
				large: String
			},
			price: Number,
			category: {
				title: {
					type: String,
					required: true
				},
				normalized: String
			},
			subcategory: String,
			ean: String,
			gender: {
				title: String,
				normalized: {
					type: String,
					index: true
				}
			},
			vendor: {
				title: {
					type: String,
					required: true
				},
				normalized: {
					type: String,
					index: true
				}
			},
			color: {
				title: String,
				normalized: {
					type: String,
					index: true
				}
			}
		},
		affiliate: String,
		site: String,
		normalizedtitle: {
			type: String,
			index: true,
			unique: true,
			required: true
		},
		created: { 
			type: Date, 
			default: Date.now 
		},
		votes: [{
			created: { 
				type: Date, 
				default: Date.now 
			},
			vote: Number
		}],
		comments: [{
			created: { 
				type: Date, 
				default: Date.now 
			},
			user: String,
			text: String
		}],
		active: {
			type: Boolean,
			default: true
		}	
	},{strict: true});


	/*
	 * 	Virtuals
	 */

	schema.virtual('voteaverage').get(function(){
		var average,
			total = this.votes.length || 0,
			sum = 0;
			
		for(var i=0;i<total;i++){
			sum += this.votes[i].vote;
		}
		if(sum == 0 || total == 0){
			return 0;
		}else{
			return Math.round(sum / total);
		}
		
	});	
	
	return mongoose.model('products', schema);
};

