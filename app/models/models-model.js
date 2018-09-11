// /**
//  * Created by konrad.sobon on 2018-04-24.
//  */
// var mongoose = require( 'mongoose' );
//
// var eventTimeSchema = new mongoose.Schema({
//     value: Number,
//     user: String,
//     createdOn: Date
// });
//
// var modelSchema = new mongoose.Schema(
//     {
//         centralPath: String,
//         modelSizes: [eventTimeSchema],
//         synchTimes: [eventTimeSchema],
//         openTimes: [eventTimeSchema]
//     }
// );
//
// modelSchema.index({"centralPath": "text"});
// var Models = mongoose.model( 'Models', modelSchema );