db.getCollection("views").aggregate(

	// Pipeline
	[
		// Stage 1
		{
			$match: {
			    
			}
		},

		// Stage 2
		{
			$unwind: {
			    path : "$viewStats",
			    includeArrayIndex : "arrayIndex", // optional
			    preserveNullAndEmptyArrays : false // optional
			}
		},

		// Stage 3
		{
			$sort: {
			"viewStats.createdOn": -1
			}
		},

		// Stage 4
		{
			$group: {
				_id: '$_id',
				"centralPath" : {$first: '$centralPath'},
				totalViews: {$first: '$viewStats.totalViews'},
				viewsOnSheet: {$first: '$viewStats.viewsOnSheet'},
				createdOn: {$first: '$viewStats.createdOn'},
				pastViews: {$push: {total: '$viewStats.totalViews', onSheet: '$viewStats.viewsOnSheet', date: '$viewStats.createdOn'}}
			}
		},

		// Stage 5
		{
			$project: {
			  _id: 1,
			  centralPath: 1,
			  createdOn: 1,
			  viewsOnSheet: 1, 
			  totalViews: 1,
			  	pastViews: {$slice: ['$pastViews', 2]} //the #2 will vary based on specific parameter based on the previous work done in the Revit Model
			}
		},

	]

	// Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);
