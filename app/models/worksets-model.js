// /**
//  * Created by konrad.sobon on 2018-04-23.
//  */
// var mongoose = require( 'mongoose' );
//
// var worksetsSchema = new mongoose.Schema(
//     {
//         centralPath: String,
//         itemCount: [{
//             worksets: [{
//                 name: String,
//                 count: Number
//             }]
//         }],
//         onSynched: [{
//             user: String,
//             opened: Number,
//             closed: Number,
//             createdOn: Date
//         }],
//         onOpened: [{
//             user: String,
//             opened: Number,
//             closed: Number,
//             createdOn: Date
//         }]
//     }
// );
//
// worksetsSchema.index({"centralPath": "text"});
// var Worksets = mongoose.model( 'Worksets', worksetsSchema );